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

		// Base calculation (hourly rate × hours per day × number of students)
		const baseRatePerDay = baseHourlyRate * hoursPerDay * numStudents;
		const baseRate = baseRatePerDay * numDays;

		breakdown.push(`Base: ${baseHourlyRate}€/hr × ${hoursPerDay}hr/day × ${numStudents} student${numStudents > 1 ? 's' : ''} × ${numDays} day${numDays > 1 ? 's' : ''}`);

		// Find best price per day (either from package or group tier)
		let pricePerDay = baseRatePerDay;
		let regularRate = baseRate;
		let packageDiscount = 0;
		let groupDiscount = 0;
		let appliedPackage: DurationPackage | undefined;
		let appliedTier: GroupPricingTier | undefined;

		// Check for applicable duration package
		const applicablePackage = this.findApplicablePackage(hoursPerDay, numStudents, durationPackages);
		
		if (applicablePackage) {
			const packagePricePerDay = applicablePackage.price;
			pricePerDay = packagePricePerDay;
			regularRate = baseRate;
			packageDiscount = (baseRatePerDay - packagePricePerDay) * numDays;
			appliedPackage = applicablePackage;
			
			breakdown.push(`Package "${applicablePackage.name}": ${packagePricePerDay}€/day`);
			if (numDays > 1) {
				breakdown.push(`Multi-day: ${packagePricePerDay}€ × ${numDays} days`);
			}
		} else {
			// Check for applicable group tier
			const applicableTier = this.findApplicableTier(numStudents, groupPricingTiers);
			
			if (applicableTier) {
				const tierPricePerDay = this.calculateTierPrice(
					applicableTier,
					baseHourlyRate,
					hoursPerDay,
					numStudents
				);
				pricePerDay = tierPricePerDay;
				regularRate = baseRate;
				groupDiscount = (baseRatePerDay - tierPricePerDay) * numDays;
				appliedTier = applicableTier;

				const discountDisplay = applicableTier.discountType === 'percentage'
					? `${applicableTier.discountValue}% off`
					: `${applicableTier.discountValue}€ off`;
				
				breakdown.push(`Group discount (${numStudents} students): ${discountDisplay}`);
				breakdown.push(`Per day: ${tierPricePerDay.toFixed(2)}€`);
				if (numDays > 1) {
					breakdown.push(`Multi-day: ${tierPricePerDay.toFixed(2)}€ × ${numDays} days`);
				}
			} else {
				// No package or tier, use base rate
				if (numDays > 1) {
					breakdown.push(`Multi-day: ${baseRatePerDay.toFixed(2)}€/day × ${numDays} days`);
				}
			}
		}

		// Calculate subtotal before promo
		let subtotal = pricePerDay * numDays;
		
		// Apply promo code
		let promoDiscount = 0;
		let appliedPromo: PromoCode | undefined;

		if (promoCode && this.isPromoCodeValid(promoCode)) {
			promoDiscount = this.calculatePromoDiscount(promoCode, subtotal);
			appliedPromo = promoCode;
			
			const promoDisplay = promoCode.discountType === 'percentage'
				? `${promoCode.discountValue}% off`
				: `${promoCode.discountValue}€ off`;
			
			breakdown.push(`Promo "${promoCode.code}": ${promoDisplay}`);
		}

		const finalPrice = Math.max(0, subtotal - promoDiscount);
		const effectiveHourlyRate = finalPrice / totalHours / numStudents;

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
	 * Find the applicable duration package for the given hours and students
	 */
	private findApplicablePackage(
		hours: number,
		students: number,
		packages: DurationPackage[]
	): DurationPackage | undefined {
		return packages
			.filter((pkg) => {
				const hoursMatch = pkg.hours === hours;
				const studentsInRange = 
					students >= pkg.minStudents && 
					students <= pkg.maxStudents;
				return pkg.isActive && hoursMatch && studentsInRange;
			})
			.sort((a, b) => a.price - b.price)[0]; // Get cheapest if multiple match
	}

	/**
	 * Find the applicable group pricing tier for the given number of students
	 */
	private findApplicableTier(
		students: number,
		tiers: GroupPricingTier[]
	): GroupPricingTier | undefined {
		return tiers
			.filter((tier) => {
				const inRange = students >= tier.minStudents && students <= tier.maxStudents;
				return tier.isActive && inRange;
			})
			.sort((a, b) => b.priority - a.priority)[0]; // Get highest priority
	}

	/**
	 * Calculate the price per day with tier discount applied
	 */
	private calculateTierPrice(
		tier: GroupPricingTier,
		baseHourlyRate: number,
		hours: number,
		students: number
	): number {
		const basePrice = baseHourlyRate * hours * students;

		if (tier.discountType === 'percentage') {
			return basePrice * (1 - tier.discountValue / 100);
		} else if (tier.discountType === 'fixed_amount') {
			return Math.max(0, basePrice - tier.discountValue);
		} else if (tier.discountType === 'price_override') {
			return tier.discountValue;
		}

		return basePrice;
	}

	/**
	 * Check if promo code is valid and within usage limits
	 */
	private isPromoCodeValid(promo: PromoCode): boolean {
		if (!promo.isActive) return false;

		const now = new Date();
		if (promo.validFrom && new Date(promo.validFrom) > now) return false;
		if (promo.validUntil && new Date(promo.validUntil) < now) return false;

		if (promo.maxUses && promo.currentUses >= promo.maxUses) return false;

		return true;
	}

	/**
	 * Calculate promo discount amount
	 */
	private calculatePromoDiscount(promo: PromoCode, subtotal: number): number {
		if (promo.discountType === 'percentage') {
			const discount = subtotal * (promo.discountValue / 100);
			return promo.maxDiscountAmount ? Math.min(discount, promo.maxDiscountAmount) : discount;
		} else if (promo.discountType === 'fixed_amount') {
			return Math.min(promo.discountValue, subtotal);
		}
		return 0;
	}

	/**
	 * Static helper to quick-calculate price without full breakdown
	 */
	static quickCalculate(input: PricingInput): number {
		const calculator = new BookingPriceCalculator(input);
		return calculator.calculate().finalPrice;
	}
}