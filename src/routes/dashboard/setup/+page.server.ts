import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireDashboardRole } from '$src/lib/utils/dashboardAuth';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { UserService } from '$src/features/Users/lib/UserService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';
import { StorageService } from '$src/lib/server/R2Storage';
import { RefillingTokenBucket } from '$src/lib/server/rate-limit';
import { getClientIP } from '$src/lib/utils/auth';
import { setupBasicsSchema, setupTeachingSchema, setupRateSchema } from './setupSchemas';

const instructorService = new InstructorService();
const userService = new UserService();
const lessonService = new LessonService();
const storageService = new StorageService();
const ipBucket = new RefillingTokenBucket<string>(10, 60);

export const load: PageServerLoad = async (event) => {
	const user = requireDashboardRole(
		event,
		['instructor-independent', 'instructor-school'],
		'Login to access setup'
	);

	const isSchool = user.role === 'instructor-school';
	const urlStep = parseInt(event.url.searchParams.get('step') ?? '0');

	// Fetch current DB state for progress detection and pre-population
	const [fullUser, instructorData, lessons] = await Promise.all([
		userService.getUserById(user.id),
		instructorService.getInstructorWithRelations(user.id),
		lessonService.listLessonsByInstructor(user.id)
	]);

	const baseLesson = lessons.find((l) => l.isBaseLesson) ?? null;
	const hasPhone = !!(fullUser?.professionalPhone);
	const hasSports = instructorData.sports.length > 0;
	const hasBaseLesson = !!baseLesson;

	// Auto-advance to the right step when no step is in the URL
	if (urlStep === 0) {
		if (!hasPhone) throw redirect(302, '?step=1');
		if (!hasSports) throw redirect(302, '?step=2');
		if (!isSchool && !hasBaseLesson) throw redirect(302, '?step=3');
		throw redirect(302, '/dashboard');
	}

	// Clamp step to valid range
	const totalSteps = isSchool ? 2 : 3;
	const currentStep = Math.min(Math.max(urlStep, 1), totalSteps);

	// Pre-populate all 3 forms from current DB state
	const [basicsForm, teachingForm, rateForm] = await Promise.all([
		superValidate(
			{
				professionalCountryCode: fullUser?.professionalCountryCode
					? parseInt(fullUser.professionalCountryCode)
					: 1,
				professionalPhone: fullUser?.professionalPhone ?? '',
				bio: fullUser?.bio ?? ''
			},
			zod(setupBasicsSchema)
		),
		superValidate(
			{
				resort: instructorData.resorts[0]?.id ?? undefined,
				sports: instructorData.sports
			},
			zod(setupTeachingSchema)
		),
		superValidate(
			{
				basePrice: baseLesson?.basePrice ?? 0,
				currency: baseLesson?.currency ?? 'EUR'
			},
			zod(setupRateSchema)
		)
	]);

	return {
		basicsForm,
		teachingForm,
		rateForm,
		isSchool,
		currentStep,
		totalSteps
	};
};

export const actions: Actions = {
	saveBasics: async (event) => {
		const user = requireDashboardRole(
			event,
			['instructor-independent', 'instructor-school'],
			'Session expired.'
		);

		const clientIP = getClientIP(event);
		if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const form = await superValidate(event.request, zod(setupBasicsSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const [currentUser, instructorData] = await Promise.all([
				userService.getUserById(user.id),
				instructorService.getInstructorWithRelations(user.id)
			]);

			let profileImageUrl: string | null | undefined = undefined;
			if (form.data.profileImage && form.data.profileImage.size > 0) {
				const buf = Buffer.from(await form.data.profileImage.arrayBuffer());
				profileImageUrl = await storageService.uploadProfileImage(buf, user.id);
			}

			await instructorService.updateInstructorProfile(user.id, {
				bio: form.data.bio,
				professionalCountryCode: form.data.professionalCountryCode,
				professionalPhone: form.data.professionalPhone,
				resort: instructorData.resorts[0]?.id,
				sports: instructorData.sports,
				spokenLanguages: currentUser?.spokenLanguages ?? [],
				profileImageUrl:
					profileImageUrl !== undefined ? profileImageUrl : currentUser?.profileImageUrl,
				qualificationUrl: currentUser?.qualificationUrl
			});
		} catch (error) {
			console.error('[Setup] saveBasics error:', error);
			return fail(500, { form });
		}

		throw redirect(303, '?step=2');
	},

	saveTeaching: async (event) => {
		const user = requireDashboardRole(
			event,
			['instructor-independent', 'instructor-school'],
			'Session expired.'
		);

		const clientIP = getClientIP(event);
		if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const form = await superValidate(event.request, zod(setupTeachingSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const currentUser = await userService.getUserById(user.id);

			await instructorService.updateInstructorProfile(user.id, {
				bio: currentUser?.bio ?? undefined,
				professionalCountryCode: currentUser?.professionalCountryCode
					? parseInt(currentUser.professionalCountryCode)
					: 1,
				professionalPhone: currentUser?.professionalPhone ?? '',
				resort: form.data.resort,
				sports: form.data.sports,
				spokenLanguages: currentUser?.spokenLanguages ?? [],
				profileImageUrl: currentUser?.profileImageUrl,
				qualificationUrl: currentUser?.qualificationUrl
			});
		} catch (error) {
			console.error('[Setup] saveTeaching error:', error);
			return fail(500, { form });
		}

		if (user.role === 'instructor-school') {
			throw redirect(303, '/dashboard');
		}
		throw redirect(303, '?step=3');
	},

	saveRate: async (event) => {
		const user = requireDashboardRole(
			event,
			['instructor-independent'],
			'Session expired.'
		);

		const clientIP = getClientIP(event);
		if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
			return fail(429, { message: 'Too many requests. Please try again later.' });
		}

		const form = await superValidate(event.request, zod(setupRateSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const [instructorData, existingLessons] = await Promise.all([
				instructorService.getInstructorWithRelations(user.id),
				lessonService.listLessonsByInstructor(user.id)
			]);

			const existingBaseLesson = existingLessons.find((l) => l.isBaseLesson);
			const sportIds = instructorData.sports;

			const lessonData = {
				basePrice: form.data.basePrice,
				currency: form.data.currency,
				duration: '1h',
				instructorId: user.id,
				isPublished: true,
				isBaseLesson: true
			} as any;

			if (existingBaseLesson) {
				await lessonService.updateLesson(existingBaseLesson.id, lessonData, sportIds);
			} else {
				await lessonService.createLesson(lessonData, sportIds);
			}
		} catch (error) {
			console.error('[Setup] saveRate error:', error);
			return fail(500, { form });
		}

		throw redirect(303, '/dashboard');
	}
};
