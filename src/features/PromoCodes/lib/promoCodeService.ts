// src/features/PromoCodes/lib/promoCodeService.ts
import { db } from '$lib/server/db';
import { launchCodes } from '$lib/server/db/schema';
import { eq, and, lte, gte, or } from 'drizzle-orm';

export interface PromoCodeValidation {
	valid: boolean;
	error?: string;
	code?: string;
	type?: 'launch_code' | 'promotion'; // Future: 'promotion' for instructor-created promos
}

/**
 * Unified Promo Code Service
 *
 * Validates promo codes from multiple sources:
 * 1. Launch codes (admin-managed, stored in launch_codes table)
 * 2. Future: Promotions (instructor-managed, will be in promotions table)
 *
 * This ensures both types of codes work seamlessly and won't conflict.
 */
export class PromoCodeService {
	/**
	 * Validate a promo code - checks both launch codes and future promotions
	 */
	async validateCode(code: string): Promise<PromoCodeValidation> {
		if (!code || code.trim().length === 0) {
			return {
				valid: false,
				error: 'Please enter a promo code'
			};
		}

		const upperCode = code.trim().toUpperCase();

		// Check launch codes table
		const launchCodeResult = await this.checkLaunchCode(upperCode);
		if (launchCodeResult.valid) {
			return launchCodeResult;
		}

		// TODO: Future - Check promotions table
		// const promotionResult = await this.checkPromotion(upperCode);
		// if (promotionResult.valid) {
		// 	return promotionResult;
		// }

		// If not found in either table
		return {
			valid: false,
			error: 'Invalid or expired promo code'
		};
	}

	/**
	 * Check if code exists in launch_codes table
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
	 * Future: Check if code exists in promotions table
	 * This will be implemented when instructor-created promotions are added
	 */
	// private async checkPromotion(code: string): Promise<PromoCodeValidation> {
	// 	// TODO: Implement when promotions table exists
	// 	return { valid: false };
	// }

	/**
	 * Record usage of a promo code
	 */
	async recordUsage(code: string): Promise<void> {
		const upperCode = code.trim().toUpperCase();

		// Try to increment launch code usage
		try {
			await db
				.update(launchCodes)
				.set({
					currentUses: db.raw('current_uses + 1')
				})
				.where(eq(launchCodes.code, upperCode));
		} catch (error) {
			console.error('Error recording promo code usage:', error);
		}

		// TODO: Future - Also try to increment promotion usage if it exists
	}

	/**
	 * Get promo code details (for display purposes)
	 */
	async getCodeDetails(code: string) {
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

		// TODO: Future - Check promotions table

		return null;
	}
}
