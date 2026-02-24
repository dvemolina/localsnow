/**
 * Normalize a name segment for use in a URL slug.
 */
function normalizePart(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // strip diacritics
		.replace(/[^a-z0-9\s-]/g, '') // remove special chars
		.trim()
		.replace(/\s+/g, '-');
}

/**
 * Generate a URL slug for an instructor profile.
 * Format: {firstName}-{lastName}-{id}
 * Example: john-doe-2
 */
export function generateInstructorSlug(id: number, name: string, lastName: string): string {
	return `${normalizePart(name)}-${normalizePart(lastName)}-${id}`;
}

/**
 * Parse an instructor slug to extract the ID.
 *
 * Supports two formats:
 *   New: {firstName}-{lastName}-{id}  →  "john-doe-2"    (ID is the last numeric segment)
 *   Old: {id}-{name}-{initial}        →  "2-john-d"      (ID is the first segment, legacy)
 *
 * Returns null if the slug is invalid.
 */
export function parseInstructorSlug(slug: string): number | null {
	const parts = slug.split('-');

	if (parts.length < 2) {
		// Bare numeric ID (legacy support)
		const id = parseInt(slug);
		return isNaN(id) ? null : id;
	}

	// New format: ID is the last segment
	const lastId = parseInt(parts[parts.length - 1]);
	if (!isNaN(lastId)) return lastId;

	// Old format: ID is the first segment (backwards compatibility)
	const firstId = parseInt(parts[0]);
	if (!isNaN(firstId)) return firstId;

	return null;
}

/**
 * Validate that a slug matches the expected canonical format for an instructor.
 * Used for canonical URL redirects.
 */
export function validateInstructorSlug(
	slug: string,
	id: number,
	name: string,
	lastName: string
): boolean {
	const expectedSlug = generateInstructorSlug(id, name, lastName);
	return slug === expectedSlug;
}
