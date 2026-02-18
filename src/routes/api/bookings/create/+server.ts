import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SlotGenerationService } from '$src/features/Availability/lib/slotGenerationService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { LaunchCodeService } from '$src/features/LaunchCodes/lib/launchCodeService';
import {
	sendBookingNotificationToInstructor,
	sendBookingConfirmationToClient
} from '$lib/server/webhooks/n8n/email-n8n';
import { SchoolInstructorRepository } from '$src/features/Schools/lib/schoolInstructorRepository';
import { funnelEventService } from '$lib/server/services/funnelEventService';

const launchCodeService = new LaunchCodeService();
const tentativeService = new TentativeBookingService();
const schoolInstructorRepository = new SchoolInstructorRepository();

export const POST: RequestHandler = async (event) => {
	try {
		const { request, locals } = event;
		const data = await request.json();

		const instructorId = Number(data.instructorId);

		if (isNaN(instructorId)) {
			throw error(400, 'Invalid instructor ID');
		}

		// Validate required fields
		if (
			!data.clientName ||
			!data.clientEmail ||
			!data.startDate ||
			!data.skillLevel ||
			!data.numberOfStudents ||
			!data.hoursPerDay
		) {
			throw error(400, 'Missing required fields');
		}

		if (!data.timeSlots || !Array.isArray(data.timeSlots) || data.timeSlots.length === 0) {
			throw error(400, 'Please select at least one time slot');
		}

		// Parse dates
		const startDate = new Date(data.startDate);
		const endDate = data.endDate ? new Date(data.endDate) : null;

		// ✅ CRITICAL: Validate availability BEFORE creating payment session
		const slotService = new SlotGenerationService();
		const availability = await slotService.generateSlotsForDateRange(
			instructorId,
			startDate,
			endDate || startDate,
			60
		);

		// Check if all requested slots are available
		const currentDate = new Date(startDate);
		const finalDate = endDate || startDate;

		while (currentDate <= finalDate) {
			const dateStr = currentDate.toISOString().split('T')[0];
			const dayAvailability = availability.find((a) => a.date === dateStr);

			if (!dayAvailability || !dayAvailability.isWorkingDay) {
				throw error(409, 'Selected dates include non-working days');
			}

			for (const timeSlot of data.timeSlots) {
				const slot = dayAvailability.slots.find(
					(s: { startTime: string; status: string }) =>
						s.startTime === timeSlot && s.status === 'available'
				);

				if (!slot) {
					throw error(409, `Time slot ${timeSlot} is no longer available on ${dateStr}`);
				}
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}

		// ✅ VALIDATE LAUNCH CODE (if provided) - for tracking purposes only
		const launchCode = data.launchCode?.trim();
		let isUsingLaunchCode = false;

		if (launchCode) {
			const validation = await launchCodeService.validateCode(launchCode);

			if (validation.valid) {
				// Code is valid - track usage for analytics
				isUsingLaunchCode = true;
			}
			// If invalid, just ignore it - no longer blocking
		}

		// ✅ CHECK FOR DUPLICATE BOOKING REQUEST
		const bookingService = new BookingRequestService();

		// Get authenticated user ID if available (preferred for security and performance)
		const clientUserId = locals.user?.id || null;

		const validation = await bookingService.validateBookingRequest(
			instructorId,
			clientUserId,
			data.clientEmail
		);

		if (!validation.allowed) {
			throw error(409, validation.reason || 'Cannot create booking request');
		}

		// ✅ CHECK IF INSTRUCTOR BELONGS TO A SCHOOL
		const instructorSchool = await schoolInstructorRepository.getInstructorSchool(instructorId);

		// ✅ CREATE BOOKING FIRST (get booking ID)
		const bookingRequest = await bookingService.createBookingRequest({
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
			timeSlots: data.timeSlots,
			skillLevel: data.skillLevel,
			message: data.message || null,
			promoCode: data.promoCode || null,
			estimatedPrice: data.estimatedPrice || null,
			currency: data.currency || null,
			sports: data.sports || [],
			schoolId: instructorSchool?.id || null // Add schoolId if instructor belongs to a school
		});

		// ✅ FREE DIRECTORY MODEL: All bookings are free
		// Record launch code usage if provided (for analytics)
		if (isUsingLaunchCode && launchCode) {
			await launchCodeService.recordUsage(launchCode);

			const { db } = await import('$lib/server/db');
			const { bookingRequests } = await import('$lib/server/db/schema');
			const { eq } = await import('drizzle-orm');
			await db
				.update(bookingRequests)
				.set({ usedLaunchCode: launchCode.toUpperCase() })
				.where(eq(bookingRequests.id, bookingRequest.id));
		}

		// Update booking status to pending and unlock contact info immediately
		await bookingService.updateBookingStatus(bookingRequest.id, 'pending');

		// Unlock contact info immediately (no payment required)
		const { db } = await import('$lib/server/db');
		const { bookingRequests } = await import('$lib/server/db/schema');
		const { eq } = await import('drizzle-orm');
		await db
			.update(bookingRequests)
			.set({ contactInfoUnlocked: true })
			.where(eq(bookingRequests.id, bookingRequest.id));

		// Create tentative blocks
		try {
			await tentativeService.createTentativeBlock(bookingRequest.id, data.timeSlots);
		} catch (tentativeError) {
			// If slots were taken in race condition, mark booking as expired
			console.error('Failed to create tentative blocks:', tentativeError);
			await bookingService.updateBookingStatus(bookingRequest.id, 'expired');
			throw error(
				409,
				'The selected time slots were just booked by another client. Please select different times.'
			);
		}

		// Send notification emails
		const instructorService = (await import('$src/features/Instructors/lib/instructorService'))
			.InstructorService;
		const instructor = await new instructorService().getInstructorById(instructorId);

		// If instructor belongs to a school, send notification to school admin instead
		if (instructorSchool) {
			const { db } = await import('$lib/server/db');
			const { users } = await import('$lib/server/db/schema');
			const { eq } = await import('drizzle-orm');

			// Get school owner/admin email
			const schoolAdmin = await db
				.select({ email: users.email, name: users.name })
				.from(users)
				.where(eq(users.id, instructorSchool.ownerUserId))
				.limit(1);

			if (schoolAdmin[0]) {
				sendBookingNotificationToInstructor({
					instructorEmail: schoolAdmin[0].email,
					instructorName: schoolAdmin[0].name,
					bookingRequestId: bookingRequest.id,
					clientName: data.clientName,
					numberOfStudents: Number(data.numberOfStudents),
					startDate: startDate.toISOString(),
					endDate: endDate?.toISOString() || undefined,
					hoursPerDay: Number(data.hoursPerDay),
					estimatedPrice: data.estimatedPrice || 0,
					currency: data.currency || 'EUR',
					dashboardUrl: '/dashboard/school/bookings'
				}).catch((err) => console.error('Email error:', err));
			}
		} else {
			// Independent instructor - send notification to instructor
			sendBookingNotificationToInstructor({
				instructorEmail: instructor?.email || '',
				instructorName: instructor?.name || '',
				bookingRequestId: bookingRequest.id,
				clientName: data.clientName,
				numberOfStudents: Number(data.numberOfStudents),
				startDate: startDate.toISOString(),
				endDate: endDate?.toISOString() || undefined,
				hoursPerDay: Number(data.hoursPerDay),
				estimatedPrice: data.estimatedPrice || 0,
				currency: data.currency || 'EUR',
				dashboardUrl: '/dashboard/bookings'
			}).catch((err) => console.error('Email error:', err));
		}

		sendBookingConfirmationToClient({
			clientEmail: data.clientEmail,
			clientName: data.clientName,
			instructorName: instructor?.name || '',
			numberOfStudents: Number(data.numberOfStudents),
			startDate: startDate.toISOString(),
			endDate: endDate?.toISOString() || undefined,
			hoursPerDay: Number(data.hoursPerDay),
			estimatedPrice: data.estimatedPrice || 0,
			currency: data.currency || 'EUR'
		}).catch((err) => console.error('Email error:', err));

		await funnelEventService.track(event, {
			eventType: 'demand.lesson_request_submitted',
			funnel: 'demand',
			stage: 'request_submitted',
			userId: clientUserId,
			entityType: 'booking_request',
			entityId: bookingRequest.id,
			countryCode: data.clientCountryCode,
			metadata: {
				instructorId,
				schoolId: instructorSchool?.id ?? null,
				numberOfStudents: Number(data.numberOfStudents),
				hasLaunchCode: Boolean(launchCode),
				hasPromoCode: Boolean(data.promoCode),
				sportsCount: Array.isArray(data.sports) ? data.sports.length : 0
			}
		});

		// Return success - no payment required
		return json({
			success: true,
			bookingId: bookingRequest.id,
			message: 'Booking request created successfully!',
			redirectUrl: `/booking/booking-success?bookingId=${bookingRequest.id}`
		});
	} catch (err) {
		console.error('Error creating booking checkout:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to create booking checkout');
	}
};
