import { describe, expect, it } from 'vitest';
import { hasAdminAccess, hasRole, type UserLike } from './roles';

describe('admin/operator access', () => {
	it('grants full internal management access to admins and operators', () => {
		expect(hasAdminAccess({ roles: ['admin'] })).toBe(true);
		expect(hasAdminAccess({ roles: ['operator'] })).toBe(true);
		expect(hasAdminAccess({ role: 'admin' })).toBe(true);
		expect(hasAdminAccess({ role: 'operator' })).toBe(true);
	});

	it('does not collapse operator into the admin role label', () => {
		const operator: UserLike = { roles: ['operator'] };

		expect(hasRole(operator, 'admin')).toBe(false);
		expect(hasAdminAccess(operator)).toBe(true);
	});

	it('keeps public and provider roles out of internal management', () => {
		expect(hasAdminAccess({ roles: ['client'] })).toBe(false);
		expect(hasAdminAccess({ roles: ['instructor-independent'] })).toBe(false);
		expect(hasAdminAccess({ roles: ['school-admin'] })).toBe(false);
		expect(hasAdminAccess(null)).toBe(false);
	});
});
