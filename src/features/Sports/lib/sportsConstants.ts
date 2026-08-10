/**
 * Sports constants for client-side usage
 * These match the database enum values
 */

export const SPORT_NAMES: Record<number, string> = {
	1: 'Ski',
	2: 'Snowboard',
	3: 'Telemark'
} as const;

export const SPORT_SLUGS: Record<number, string> = {
	1: 'ski',
	2: 'snowboard',
	3: 'telemark'
} as const;

export type SportId = 1 | 2 | 3;
export type SportName = 'Ski' | 'Snowboard' | 'Telemark';
export type SportSlug = 'ski' | 'snowboard' | 'telemark';

const SPORT_NAME_VALUES = ['Ski', 'Snowboard', 'Telemark'] as const;
const SPORT_SLUG_VALUES = ['ski', 'snowboard', 'telemark'] as const;

export function isSportName(value: unknown): value is SportName {
	return typeof value === 'string' && SPORT_NAME_VALUES.includes(value as SportName);
}

export function isSportSlug(value: unknown): value is SportSlug {
	return typeof value === 'string' && SPORT_SLUG_VALUES.includes(value as SportSlug);
}

/**
 * Get sport name by ID
 */
export function getSportName(id: number): string {
	return SPORT_NAMES[id] || 'Unknown Sport';
}

/**
 * Get sport slug by ID
 */
export function getSportSlug(id: number): string {
	return SPORT_SLUGS[id] || 'unknown';
}

/**
 * Get sport ID by slug
 */
export function getSportIdBySlug(slug: string): number | undefined {
	const entry = Object.entries(SPORT_SLUGS).find(([_, s]) => s === slug);
	return entry ? Number(entry[0]) : undefined;
}
