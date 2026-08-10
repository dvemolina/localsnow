import { describe, expect, it } from 'vitest';
import type { UserLike } from '$lib/utils/roles';
import { getAdminActionAccessFailure } from './adminAccess';

describe('getAdminActionAccessFailure', () => {
	it('rejects missing and external users', () => {
		expect(getAdminActionAccessFailure(null)?.status).toBe(403);
		expect(getAdminActionAccessFailure({ role: 'client' } satisfies UserLike)?.status).toBe(403);
		expect(
			getAdminActionAccessFailure({ role: 'instructor-independent' } satisfies UserLike)?.status
		).toBe(403);
	});

	it('allows admin and operator users to perform internal actions', () => {
		expect(getAdminActionAccessFailure({ role: 'admin' } satisfies UserLike)).toBeNull();
		expect(getAdminActionAccessFailure({ role: 'operator' } satisfies UserLike)).toBeNull();
		expect(getAdminActionAccessFailure({ roles: ['operator'] } satisfies UserLike)).toBeNull();
	});
});
