import type { DurationPackage, GroupPricingTier, PromoCode } from "$src/features/Lessons/lib/lessonSchema";

export interface PricingInput {
	baseHourlyRate: number;
	numStudents: number;
	hoursPerDay: number;
	numDays: number;
	durationPackages?: DurationPackage[];
	groupPricingTiers?: GroupPricingTier[];
	promoCode?: PromoCode | null;
}

export interface PriceBreakdown {
	baseRate: number;
	regularRate: number;
	packageDiscount: number;
	groupDiscount: number;
	promoDiscount: number;
	finalPrice: number;
	pricePerDay: number;
	effectiveHourlyRate: number;
	appliedPackage?: DurationPackage;
	appliedTier?: GroupPricingTier;
	appliedPromo?: PromoCode;
	breakdown: string[];
}

export class BookingPriceCalculator {
	private input: PricingInput;

	constructor(input: PricingInput) {
		this.input = input;
	}

	/**
	 * Main calculation method - calculates price per day first, then multiplies by number of days
	 */
	calculate(): PriceBreakdown {
		const {
			baseHourlyRate,
			numStudents,
			hoursPerDay,
			numDays,
			durationPackages = [],
			groupPricingTiers = [],
			promoCode
		} = this.input;

		const breakdown: string[] = [];
		const totalHours = hoursPerDay * numDays;

		// STEP 1: Calculate base price per day
		const baseRatePerDay = baseHourlyRate * hoursPerDay;
		const baseRate = baseRatePerDay * numDays;

		breakdown.push(`Base: ${baseHourlyRate}€/hr × ${hoursPerDay}hr/day × ${numDays} day${numDays > 1 ? 's' : ''}`);

		// STEP 2: Check for duration package (best price per day)
		let pricePerDay = baseRatePerDay;
		let regularRate = baseRate;
		let packageDiscount = 0;
		let groupDiscount = 0;
		let appliedPackage: DurationPackage | undefined;
		let appliedTier: GroupPricingTier | undefined;

		// Find applicable duration package
		const applicablePackage = this.findApplicablePackage(hoursPerDay, numStudents, durationPackages);
		
		if (applicablePackage) {
			// Package found - use package price per day
			pricePerDay = applicablePackage.price;
			packageDiscount = (baseRatePerDay - applicablePackage.price) * numDays;
			appliedPackage = applicablePackage;
			
			breakdown.push(`Package "${applicablePackage.name}": ${applicablePackage.price}€/day`);
			if (numDays > 1) {
				breakdown.push(`× ${numDays} days`);
			}
		} else {
			// No package - check for group tier discount
			const applicableTier = this.findApplicableTier(numStudents, groupPricingTiers);
			
			if (applicableTier) {
				// Group tier applies
				const tierPricePerDay = applicableTier.pricePerHour * hoursPerDay;
				pricePerDay = tierPricePerDay;
				groupDiscount = (baseRatePerDay - tierPricePerDay) * numDays;
				appliedTier = applicableTier;

				breakdown.push(`Group rate: ${applicableTier.pricePerHour}€/hr (${numStudents} students)`);
				breakdown.push(`Per day: ${tierPricePerDay.toFixed(2)}€`);
				if (numDays > 1) {
					breakdown.push(`× ${numDays} days`);
				}
			} else {
				// No discounts - use base rate
				if (numDays > 1) {
					breakdown.push(`× ${numDays} days`);
				}
			}
		}

		// STEP 3: Calculate subtotal (price per day × number of days)
		let subtotal = pricePerDay * numDays;
		
		// STEP 4: Apply promo code to total
		let promoDiscount = 0;
		let appliedPromo: PromoCode | undefined;

		if (promoCode && this.isPromoCodeValid(promoCode)) {
			promoDiscount = this.calculatePromoDiscount(promoCode, subtotal);
			appliedPromo = promoCode;
			
			breakdown.push(`Promo "${promoCode.code}": ${promoCode.discountPercent}% off`);
		}

		const finalPrice = Math.max(0, subtotal - promoDiscount);
		const effectiveHourlyRate = finalPrice / totalHours;

		return {
			baseRate,
			regularRate,
			packageDiscount,
			groupDiscount,
			promoDiscount,
			finalPrice,
			pricePerDay,
			effectiveHourlyRate,
			appliedPackage,
			appliedTier,
			appliedPromo,
			breakdown
		};
	}

	/**
	 * Find applicable duration package matching hours and student count
	 */
	private findApplicablePackage(
		hours: number,
		students: number,
		packages: DurationPackage[]
	): DurationPackage | undefined {
		return packages
			.filter((pkg) => {
				const hoursMatch = Number(pkg.hours) === hours;
				const studentsInRange = 
					students >= (pkg.minStudents || 1) && 
					students <= (pkg.maxStudents || 999);
				return hoursMatch && studentsInRange;
			})
			.sort((a, b) => a.price - b.price)[0]; // Get cheapest if multiple match
	}

	/**
	 * Find applicable group pricing tier for student count
	 */
	private findApplicableTier(
		students: number,
		tiers: GroupPricingTier[]
	): GroupPricingTier | undefined {
		return tiers
			.filter((tier) => {
				const inRange = students >= tier.minStudents && students <= tier.maxStudents;
				return inRange;
			})
			.sort((a, b) => a.pricePerHour - b.pricePerHour)[0]; // Get cheapest
	}

	/**
	 * Check if promo code is valid
	 */
	private isPromoCodeValid(promo: PromoCode): boolean {
		const now = new Date();
		
		// Check expiry
		if (promo.validUntil && new Date(promo.validUntil) < now) {
			return false;
		}

		// Check usage limit
		if (promo.maxUses && promo.currentUses >= promo.maxUses) {
			return false;
		}

		return true;
	}

	/**
	 * Calculate promo discount amount (percentage only for now)
	 */
	private calculatePromoDiscount(promo: PromoCode, subtotal: number): number {
		return Math.round(subtotal * (promo.discountPercent / 100));
	}

	/**
	 * Static helper for quick calculations
	 */
	static quickCalculate(input: PricingInput): number {
		const calculator = new BookingPriceCalculator(input);
		return calculator.calculate().finalPrice;
	}
}