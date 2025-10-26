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
    groupDiscount: number;
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

        let pricePerHour = basePrice;
        let groupDiscount = 0;
        let durationPackageApplied = false;
        let durationPackageName: string | undefined;

        // Check for group pricing tiers
        const applicableTier = pricingData.groupTiers.find(
            tier => numberOfStudents >= tier.minStudents && numberOfStudents <= tier.maxStudents
        );

        if (applicableTier) {
            pricePerHour = applicableTier.pricePerHour;
            groupDiscount = (basePrice - applicableTier.pricePerHour) * totalHours;
        }

        // Check for duration packages (only for single-day bookings)
        if (numberOfDays === 1) {
            const applicablePackage = pricingData.durationPackages.find(
                pkg => Math.abs(Number(pkg.hours) - hoursPerDay) < 0.5 // Allow 0.5 hour tolerance
            );

            if (applicablePackage) {
                const packageTotal = applicablePackage.price;
                const hourlyTotal = pricePerHour * hoursPerDay;
                
                if (packageTotal < hourlyTotal) {
                    durationPackageApplied = true;
                    durationPackageName = applicablePackage.name;
                    pricePerHour = packageTotal / hoursPerDay;
                }
            }
        }

        const subtotal = pricePerHour * totalHours;

        // Check for promo codes
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

        // Build breakdown
        const breakdown: Array<{ description: string; amount: number }> = [
            {
                description: `Base rate: ${basePrice}${currency}/hr × ${totalHours} hours`,
                amount: basePrice * totalHours
            }
        ];

        if (groupDiscount > 0) {
            breakdown.push({
                description: `Group discount (${numberOfStudents} students)`,
                amount: -groupDiscount
            });
        }

        if (durationPackageApplied && durationPackageName) {
            breakdown.push({
                description: `Package deal: ${durationPackageName}`,
                amount: -(basePrice * totalHours - subtotal)
            });
        }

        if (promoDiscount > 0 && validPromoCode) {
            breakdown.push({
                description: `Promo code: ${validPromoCode}`,
                amount: -promoDiscount
            });
        }

        return {
            basePrice,
            currency,
            numberOfDays,
            totalHours,
            groupDiscount,
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