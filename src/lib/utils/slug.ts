/**
 * Generate a URL slug for an instructor profile
 * Format: {id}-{name}-{lastInitial}
 * Example: 2-john-d
 *
 * This maintains privacy by only showing first letter of surname
 */
export function generateInstructorSlug(id: number, name: string, lastName: string): string {
	// Normalize name: lowercase, remove special chars, replace spaces with hyphens
	const normalizedName = name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // Remove special chars
		.trim()
		.replace(/\s+/g, '-'); // Replace spaces with hyphens

	// Get first letter of last name, lowercase
	const lastInitial = lastName.charAt(0).toLowerCase();

	return `${id}-${normalizedName}-${lastInitial}`;
}

/**
 * Parse an instructor slug to extract the ID
 * Format: {id}-{name}-{lastInitial}
 * Example: "2-john-d" returns 2
 *
 * Returns null if slug is invalid
 */
export function parseInstructorSlug(slug: string): number | null {
	// Extract the first part before the first hyphen
	const parts = slug.split('-');

	if (parts.length < 3) {
		// Invalid format, might be just an ID (legacy support)
		const id = parseInt(slug);
		return isNaN(id) ? null : id;
	}

	const id = parseInt(parts[0]);
	return isNaN(id) ? null : id;
}

/**
 * Validate that a slug matches the expected format for an instructor
 * This is used for canonical URL redirects
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
