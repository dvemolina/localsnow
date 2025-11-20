// src/features/PromoCodes/lib/promoCodeService.ts
import { db } from '$lib/server/db';
import { launchCodes, promoCodes } from '$lib/server/db/schema';
import { eq, and, lte, gte, or } from 'drizzle-orm';

export interface PromoCodeValidation {
	valid: boolean;
	error?: string;
	code?: string;
	type?: 'launch_code' | 'instructor_promo';
	discountPercent?: number; // For instructor promos
	instructorId?: number; // For instructor promos
	lessonId?: number; // For instructor promos
}

/**
 * Unified Promo Code Service
 *
 * Validates promo codes from BOTH sources:
 * 1. Launch codes (admin-managed, platform-wide, stored in launch_codes table)
 * 2. Promo codes (instructor-managed, lesson-specific, stored in promo_codes table)
 *
 * This ensures both types of codes work seamlessly without conflicts.
 */
export class PromoCodeService {
	/**
	 * Validate a promo code - checks BOTH launch codes AND instructor promo codes
	 */
	async validateCode(code: string, lessonId?: number): Promise<PromoCodeValidation> {
		if (!code || code.trim().length === 0) {
			return {
				valid: false,
				error: 'Please enter a promo code'
			};
		}

		const upperCode = code.trim().toUpperCase();

		// Check launch codes table (admin codes - platform wide)
		const launchCodeResult = await this.checkLaunchCode(upperCode);
		if (launchCodeResult.valid) {
			return launchCodeResult;
		}

		// Check promo codes table (instructor codes - lesson specific)
		const promoCodeResult = await this.checkInstructorPromo(upperCode, lessonId);
		if (promoCodeResult.valid) {
			return promoCodeResult;
		}

		// If not found in either table
		return {
			valid: false,
			error: 'Invalid or expired promo code'
		};
	}

	/**
	 * Check if code exists in launch_codes table (admin codes)
	 */
	private async checkLaunchCode(code: string): Promise<PromoCodeValidation> {
		try {
			const result = await db.query.launchCodes.findFirst({
				where: and(
					eq(launchCodes.code, code),
					eq(launchCodes.isActive, true),
					gte(launchCodes.validUntil, new Date())
				)
			});

			if (!result) {
				return { valid: false };
			}

			// Check max uses if set
			if (result.maxUses !== null && result.currentUses >= result.maxUses) {
				return {
					valid: false,
					error: 'This promo code has reached its maximum uses'
				};
			}

			return {
				valid: true,
				code: result.code,
				type: 'launch_code'
			};
		} catch (error) {
			console.error('Error checking launch code:', error);
			return {
				valid: false,
				error: 'Error validating promo code'
			};
		}
	}

	/**
	 * Check if code exists in promo_codes table (instructor codes)
	 */
	private async checkInstructorPromo(code: string, lessonId?: number): Promise<PromoCodeValidation> {
		try {
			// Build where conditions
			const conditions = [eq(promoCodes.code, code)];

			// If lessonId provided, only check codes for that lesson
			if (lessonId) {
				conditions.push(eq(promoCodes.lessonId, lessonId));
			}

			const result = await db.query.promoCodes.findFirst({
				where: and(...conditions)
			});

			if (!result) {
				return { valid: false };
			}

			// Check if expired
			if (result.validUntil && new Date(result.validUntil) < new Date()) {
				return {
					valid: false,
					error: 'This promo code has expired'
				};
			}

			// Check max uses if set
			if (result.maxUses !== null && (result.currentUses || 0) >= result.maxUses) {
				return {
					valid: false,
					error: 'This promo code has reached its maximum uses'
				};
			}

			return {
				valid: true,
				code: result.code,
				type: 'instructor_promo',
				discountPercent: result.discountPercent,
				instructorId: result.instructorId,
				lessonId: result.lessonId
			};
		} catch (error) {
			console.error('Error checking instructor promo code:', error);
			return {
				valid: false,
				error: 'Error validating promo code'
			};
		}
	}

	/**
	 * Record usage of a promo code (updates currentUses in appropriate table)
	 */
	async recordUsage(code: string, lessonId?: number): Promise<void> {
		const upperCode = code.trim().toUpperCase();

		// Try to increment launch code usage
		try {
			const launchCodeResult = await db
				.update(launchCodes)
				.set({
					currentUses: db.raw('current_uses + 1')
				})
				.where(eq(launchCodes.code, upperCode))
				.returning();

			// If launch code was updated, we're done
			if (launchCodeResult.length > 0) {
				return;
			}
		} catch (error) {
			console.error('Error updating launch code usage:', error);
		}

		// Try to increment instructor promo code usage
		try {
			const conditions = [eq(promoCodes.code, upperCode)];
			if (lessonId) {
				conditions.push(eq(promoCodes.lessonId, lessonId));
			}

			await db
				.update(promoCodes)
				.set({
					currentUses: db.raw('current_uses + 1')
				})
				.where(and(...conditions));
		} catch (error) {
			console.error('Error updating promo code usage:', error);
		}
	}

	/**
	 * Get promo code details (for display purposes)
	 */
	async getCodeDetails(code: string, lessonId?: number) {
		const upperCode = code.trim().toUpperCase();

		// Check launch codes
		const launchCode = await db.query.launchCodes.findFirst({
			where: eq(launchCodes.code, upperCode)
		});

		if (launchCode) {
			return {
				code: launchCode.code,
				description: launchCode.description,
				validUntil: launchCode.validUntil,
				type: 'launch_code' as const
			};
		}

		// Check instructor promo codes
		const conditions = [eq(promoCodes.code, upperCode)];
		if (lessonId) {
			conditions.push(eq(promoCodes.lessonId, lessonId));
		}

		const promoCode = await db.query.promoCodes.findFirst({
			where: and(...conditions)
		});

		if (promoCode) {
			return {
				code: promoCode.code,
				discountPercent: promoCode.discountPercent,
				validUntil: promoCode.validUntil,
				type: 'instructor_promo' as const,
				instructorId: promoCode.instructorId,
				lessonId: promoCode.lessonId
			};
		}

		return null;
	}
}
