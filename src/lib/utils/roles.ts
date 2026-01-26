export type UserRole = 'admin' | 'instructor-independent' | 'instructor-school' | 'school-admin' | 'client';
export type UserLike = {
	role?: UserRole | null;
	roles?: UserRole[] | null;
};

export function getRoles(user?: UserLike | null): UserRole[] {
	if (!user) return [];
	const roles = Array.isArray(user.roles) ? user.roles.filter(Boolean) : [];
	if (roles.length > 0) return roles;
	return user.role ? [user.role] : [];
}

export function hasRole(user: UserLike | null | undefined, role: UserRole): boolean {
	return getRoles(user).includes(role);
}

export function hasAnyRole(user: UserLike | null | undefined, roles: UserRole[]): boolean {
	if (!roles.length) return false;
	const userRoles = getRoles(user);
	return roles.some(role => userRoles.includes(role));
}

export function hasInstructorRole(user: UserLike | null | undefined): boolean {
	return hasAnyRole(user, ['instructor-independent', 'instructor-school']);
}
