// src/routes/instructors/[slug]/+page.server.ts
import { error, fail, json, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { PricingService } from '$src/features/Pricing/lib/pricingService';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { UserService } from '$src/features/Users/lib/UserService';
import { SportsService } from '$src/features/Sports/lib/sportsService';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';
import { trackProfileVisit } from '$src/features/Dashboard/lib/utils';
import { getClientIP } from '$src/lib/utils/auth';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$src/lib/server/webhooks/n8n/email-n8n';
import { parseInstructorSlug, generateInstructorSlug, validateInstructorSlug } from '$lib/utils/slug';

const instructorService = new InstructorService();
const pricingService = new PricingService();
const bookingRequestService = new BookingRequestService();
const userService = new UserService();
const sportsService = new SportsService();
const reviewService = new ReviewService();

export const load: PageServerLoad = async (event) => {
    // Parse slug to extract instructor ID
    const instructorId = parseInstructorSlug(event.params.slug);

    if (!instructorId) {
        throw error(404, 'Instructor not found');
    }

    // Get instructor with relations AND base lesson
    const instructorData = await instructorService.getInstructorWithLessons(instructorId);

    if (!instructorData || !instructorData.instructor) {
        throw error(404, 'Instructor not found');
    }

    // Verify the user has an instructor role
    if (!instructorData.instructor.role?.includes('instructor')) {
        throw error(404, 'Instructor not found');
    }

    // Check if profile is published (only admins or the instructor themselves can view unpublished)
    const isOwnProfile = event.locals.user?.id === instructorId;
    const isAdmin = event.locals.user?.role === 'admin';
    if (!instructorData.instructor.isPublished && !isOwnProfile && !isAdmin) {
        throw error(404, 'Instructor not found');
    }

    // Validate slug and redirect to canonical URL if incorrect
    const instructor = instructorData.instructor;
    const isValidSlug = validateInstructorSlug(
        event.params.slug,
        instructor.id,
        instructor.name,
        instructor.lastName
    );

    if (!isValidSlug) {
        // Generate correct slug and redirect
        const correctSlug = generateInstructorSlug(
            instructor.id,
            instructor.name,
            instructor.lastName
        );
        const locale = event.url.pathname.split('/')[1]; // Extract locale from URL
        throw redirect(301, `/${locale}/instructors/${correctSlug}`);
    }

    try {
        // Get sports, resorts, and reviews in parallel
        const [sportIds, resorts, reviews, reviewStats] = await Promise.all([
            instructorService.getInstructorSports(instructorId),
            instructorService.getInstructorResorts(instructorId),
            reviewService.getInstructorReviews(instructorId, 10, 0),
            reviewService.getInstructorStats(instructorId)
        ]);

        // Get sport names from IDs
        const sports = await sportsService.getSportsByIds(sportIds);

        // ✅ Load pricing data if base lesson exists
        let groupTiers = [];
        let durationPackages = [];
        let promoCodes = [];

        if (instructorData.baseLesson) {
            const pricingData = await pricingService.getLessonPricingData(instructorData.baseLesson.id);
            groupTiers = pricingData.groupTiers;
            durationPackages = pricingData.durationPackages;
            promoCodes = pricingData.promoCodes;
        }

        // Track profile visit (async, don't wait)
        const visitorIP = getClientIP(event);
        if (visitorIP) {
            trackProfileVisit(instructorId, visitorIP).catch(err => 
                console.error('Failed to track visit:', err)
            );
        }

        // Fetch complete user data if authenticated
        let completeUser = null;
        if (event.locals.user) {
            completeUser = await userService.getUserById(event.locals.user.id);
        }

        return {
            instructor: instructorData.instructor,
            baseLesson: instructorData.baseLesson,
            groupTiers,
            durationPackages,
            promoCodes,
            sports,
            resorts,
            reviews,
            reviewStats,
            user: completeUser
        };
    } catch (err) {
        console.error('Error loading instructor profile:', err);
        throw error(500, 'Failed to load instructor profile');
    }
};

export const actions: Actions = {
    default: async ({ request, params, url, locals }) => {
        // Parse slug to extract instructor ID
        const instructorId = parseInstructorSlug(params.slug);

        if (!instructorId) {
            return fail(400, { message: 'Invalid instructor ID' });
        }

        try {
            // Check content type and parse accordingly
            const contentType = request.headers.get('content-type');
            let data;

            if (contentType?.includes('application/json')) {
                // Handle JSON submission
                data = await request.json();
            } else {
                // Handle form-encoded submission (fallback)
                const formData = await request.formData();
                data = Object.fromEntries(formData);
                // Parse sports array if it exists
                if (typeof data.sports === 'string') {
                    data.sports = JSON.parse(data.sports);
                }
            }

            // Validate required fields
            if (!data.clientName || !data.clientEmail || !data.startDate || !data.skillLevel || !data.numberOfStudents || !data.hoursPerDay) {
                return fail(400, { message: 'Missing required fields' });
            }

            // ✅ NEW: Validate booking limits
            // Get authenticated user ID if available (preferred for security and performance)
            const clientUserId = locals.user?.id || null;

            const validation = await bookingRequestService.validateBookingRequest(
                instructorId,
                clientUserId,
                data.clientEmail
            );

            if (!validation.allowed) {
                return fail(400, { 
                    message: validation.reason,
                    requiresPayment: validation.requiresPayment
                });
            }

            // Parse dates
            const startDate = new Date(data.startDate);
            const endDate = data.endDate ? new Date(data.endDate) : null;

            // Create booking request
            const bookingRequest = await bookingRequestService.createBookingRequest({
                instructorId,
                clientUserId, // Store user ID for authenticated users (production-ready approach)
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone || null,
                clientCountryCode: String(data.clientCountryCode),
                numberOfStudents: Number(data.numberOfStudents),
                startDate,
                endDate,
                hoursPerDay: Number(data.hoursPerDay),
                skillLevel: data.skillLevel,
                message: data.message || null,
                promoCode: data.promoCode || null,
                estimatedPrice: data.estimatedPrice || null,
                currency: data.currency || null,
                sports: data.sports || []
            });

            // Get instructor details for email
            const instructorData = await instructorService.getInstructorWithLessons(instructorId);
            const instructor = instructorData?.instructor;

            if (instructor?.email) {
                const baseUrl = url.origin;

                // Send notification to instructor
                sendBookingNotificationToInstructor({
                    instructorEmail: instructor.email,
                    instructorName: instructor.name,
                    bookingRequestId: bookingRequest.id,
                    clientName: data.clientName,
                    numberOfStudents: data.numberOfStudents,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    hoursPerDay: data.hoursPerDay,
                    estimatedPrice: data.estimatedPrice,
                    currency: data.currency,
                    dashboardUrl: `${baseUrl}/dashboard`
                }).catch(err => console.error('Failed to send instructor notification:', err));
            }

            // Send confirmation to client
            sendBookingConfirmationToClient({
                clientEmail: data.clientEmail,
                clientName: data.clientName,
                instructorName: instructor?.name || 'Your instructor',
                numberOfStudents: data.numberOfStudents,
                startDate: data.startDate,
                endDate: data.endDate,
                hoursPerDay: data.hoursPerDay,
                estimatedPrice: data.estimatedPrice,
                currency: data.currency
            }).catch(err => console.error('Failed to send client confirmation:', err));

            return json({ success: true });
        } catch (err) {
            console.error('Error creating booking request:', err);
            return fail(500, { message: 'Failed to submit booking request' });
        }
    }
};