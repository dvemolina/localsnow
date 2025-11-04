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