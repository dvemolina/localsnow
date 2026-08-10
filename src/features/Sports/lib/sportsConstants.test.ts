import { describe, expect, it } from 'vitest';
import { isSportName, isSportSlug } from './sportsConstants';

describe('sport enum guards', () => {
	it('accepts only persisted sport enum values', () => {
		expect(isSportName('Ski')).toBe(true);
		expect(isSportName('Snowboard')).toBe(true);
		expect(isSportName('Surf')).toBe(false);
		expect(isSportName(null)).toBe(false);
	});

	it('accepts only persisted sport slug enum values', () => {
		expect(isSportSlug('ski')).toBe(true);
		expect(isSportSlug('snowboard')).toBe(true);
		expect(isSportSlug('surf')).toBe(false);
		expect(isSportSlug(undefined)).toBe(false);
	});
});
