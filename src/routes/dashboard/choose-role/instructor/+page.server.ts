import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { redirect, type Actions } from '@sveltejs/kit';
import { requireAuth } from '$src/lib/utils/auth';
import { instructorQuickSignupSchema } from '$src/features/Instructors/lib/instructorSchemas';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { validateSessionToken, sessionCookieName } from '$src/lib/server/session';
import { getRoles } from '$src/lib/utils/roles';
import { funnelEventService } from '$lib/server/services/funnelEventService';

const instructorService = new InstructorService();

function getLocaleFromPath(pathname: string): string {
	const match = pathname.match(/^\/(en|es)\//);
	return match ? match[1] : 'en';
}

export const load: PageServerLoad = async (event) => {
	const user = requireAuth(event, 'Login to choose a role for your account');
	const locale = getLocaleFromPath(event.url.pathname);

	if (getRoles(user).length > 0) {
		redirect(302, `/${locale}/dashboard`);
	}

	const form = await superValidate(zod(instructorQuickSignupSchema));
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const user = requireAuth(event, 'Session expired. Login again to proceed');
		const form = await superValidate(event.request, zod(instructorQuickSignupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await instructorService.assignInstructorRole(user.id, form.data.instructorType);

			await funnelEventService.track(event, {
				eventType: 'supply.instructor_role_assigned',
				funnel: 'supply',
				stage: 'role_assigned',
				userId: user.id,
				entityType: 'user',
				entityId: user.id,
				metadata: { instructorType: form.data.instructorType }
			});
		} catch (error) {
			console.error('[Instructor Quick Signup] Error assigning role:', error);
			return fail(500, { form });
		}

		// Refresh session so the sidebar and role-based UI update immediately
		const sessionToken = event.cookies.get(sessionCookieName);
		if (sessionToken) {
			const { user: updatedUser } = await validateSessionToken(sessionToken);
			if (updatedUser) {
				event.locals.user = updatedUser;
			}
		}

		const locale = getLocaleFromPath(event.url.pathname);
		throw redirect(303, `/${locale}/dashboard`);
	}
};
