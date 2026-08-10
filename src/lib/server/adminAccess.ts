import { fail } from '@sveltejs/kit';
import { hasAdminAccess, type UserLike } from '$lib/utils/roles';

export function getAdminActionAccessFailure(user: UserLike | null | undefined) {
	if (hasAdminAccess(user)) return null;
	return fail(403, { error: 'Unauthorized' });
}
