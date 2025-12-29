import type { LayoutServerLoad } from './$types';
import { requireSchoolAdmin } from '$lib/utils/schoolAuth';

export const load: LayoutServerLoad = async (event) => {
	const { user, school } = await requireSchoolAdmin(event);

	return {
		user,
		school
	};
};
