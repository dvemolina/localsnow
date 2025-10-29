import { PricingService } from "$src/features/Pricing/lib/pricingService";

export interface BookingPriceParams {
    lessonId: number;
    basePrice: number;
    currency: string;
    numberOfStudents: number;
    startDate: Date;
    endDate?: Date;
    hoursPerDay: number;
    promoCode?: string;
}

export interface PriceBreakdown {
    basePrice: number;
    currency: string;
    numberOfDays: number;
    totalHours: number;
    hoursPerDay: number;
    pricePerDay: number;
    groupDiscount: number;
    groupDiscountPerDay: number;
    durationPackageApplied: boolean;
    durationPackageName?: string;
    promoDiscount: number;
    promoCode?: string;
    subtotal: number;
    totalPrice: number;
    pricePerPerson: number;
    breakdown: Array<{
        description: string;
        amount: number;
    }>;
}

export class BookingPriceCalculator {
    private pricingService: PricingService;

    constructor() {
        this.pricingService = new PricingService();
    }

    async calculateBookingPrice(params: BookingPriceParams): Promise<PriceBreakdown> {
        const {
            lessonId,
            basePrice,
            currency,
            numberOfStudents,
            startDate,
            endDate,
            hoursPerDay,
            promoCode
        } = params;

        // Calculate number of days
        const numberOfDays = endDate 
            ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 1;

        const totalHours = hoursPerDay * numberOfDays;

        // Get pricing data
        const pricingData = await this.pricingService.getLessonPricingData(lessonId);

        // STEP 1: Calculate price PER DAY (this is key!)
        let pricePerDay = basePrice * hoursPerDay;
        let groupDiscountPerDay = 0;
        let durationPackageApplied = false;
        let durationPackageName: string | undefined;

        // Check for duration packages (applies per day)
        const applicablePackage = pricingData.durationPackages.find(
            pkg => Math.abs(Number(pkg.hours) - hoursPerDay) < 0.5 // Allow 0.5 hour tolerance
        );

        if (applicablePackage) {
            const packagePrice = applicablePackage.price;
            const regularDayPrice = basePrice * hoursPerDay;
            
            // Only apply package if it's cheaper
            if (packagePrice < regularDayPrice) {
                pricePerDay = packagePrice;
                durationPackageApplied = true;
                durationPackageName = applicablePackage.name;
            }
        }

        // Check for group pricing tiers (applies per day)
        const applicableTier = pricingData.groupTiers.find(
            tier => numberOfStudents >= tier.minStudents && numberOfStudents <= tier.maxStudents
        );

        if (applicableTier) {
            // If we have a package deal, compare tier pricing with package
            if (durationPackageApplied) {
                const tierDayPrice = applicableTier.pricePerHour * hoursPerDay;
                
                // Use whichever is cheaper: package deal or group tier
                if (tierDayPrice < pricePerDay) {
                    groupDiscountPerDay = pricePerDay - tierDayPrice;
                    pricePerDay = tierDayPrice;
                    durationPackageApplied = false; // Group tier is better
                    durationPackageName = undefined;
                }
            } else {
                // No package, just apply group tier
                const regularDayPrice = basePrice * hoursPerDay;
                const tierDayPrice = applicableTier.pricePerHour * hoursPerDay;
                
                if (tierDayPrice < regularDayPrice) {
                    groupDiscountPerDay = regularDayPrice - tierDayPrice;
                    pricePerDay = tierDayPrice;
                }
            }
        }

        // STEP 2: Calculate total by multiplying the per-day price by number of days
        const subtotal = pricePerDay * numberOfDays;
        const totalGroupDiscount = groupDiscountPerDay * numberOfDays;

        // STEP 3: Apply promo codes to the total
        let promoDiscount = 0;
        let validPromoCode: string | undefined;

        if (promoCode) {
            const applicablePromo = pricingData.promoCodes.find(
                promo => promo.code.toUpperCase() === promoCode.toUpperCase()
            );

            if (applicablePromo) {
                // Check validity
                const now = new Date();
                const isValid = 
                    (!applicablePromo.validUntil || new Date(applicablePromo.validUntil) >= now) &&
                    (!applicablePromo.maxUses || applicablePromo.currentUses < applicablePromo.maxUses);

                if (isValid) {
                    promoDiscount = Math.round(subtotal * (applicablePromo.discountPercent / 100));
                    validPromoCode = applicablePromo.code;
                }
            }
        }

        const totalPrice = subtotal - promoDiscount;
        const pricePerPerson = Math.round(totalPrice / numberOfStudents);

        // Build breakdown - make it crystal clear
        const breakdown: Array<{ description: string; amount: number }> = [];

        // Show daily calculation first
        if (durationPackageApplied && durationPackageName) {
            breakdown.push({
                description: `${durationPackageName} package (${hoursPerDay}hrs)`,
                amount: pricePerDay
            });
        } else if (groupDiscountPerDay > 0) {
            breakdown.push({
                description: `Base rate: ${basePrice}${currency}/hr × ${hoursPerDay}hrs`,
                amount: basePrice * hoursPerDay
            });
            breakdown.push({
                description: `Group discount (${numberOfStudents} students)`,
                amount: -groupDiscountPerDay
            });
        } else {
            breakdown.push({
                description: `Base rate: ${basePrice}${currency}/hr × ${hoursPerDay}hrs`,
                amount: pricePerDay
            });
        }

        // Show multiplication by days if multi-day
        if (numberOfDays > 1) {
            breakdown.push({
                description: `Price per day × ${numberOfDays} days`,
                amount: subtotal - pricePerDay // Show the additional days cost
            });
        }

        // Show promo discount if applicable
        if (promoDiscount > 0 && validPromoCode) {
            breakdown.push({
                description: `Promo code: ${validPromoCode} (${Math.round((promoDiscount / subtotal) * 100)}% off)`,
                amount: -promoDiscount
            });
        }

        return {
            basePrice,
            currency,
            numberOfDays,
            totalHours,
            hoursPerDay,
            pricePerDay,
            groupDiscount: totalGroupDiscount,
            groupDiscountPerDay,
            durationPackageApplied,
            durationPackageName,
            promoDiscount,
            promoCode: validPromoCode,
            subtotal,
            totalPrice,
            pricePerPerson,
            breakdown
        };
    }
}