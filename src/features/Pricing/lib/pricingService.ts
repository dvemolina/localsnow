import { PricingRepository } from "./pricingRepository";

export interface PricingCalculationParams {
    lessonId: number;
    basePrice: number;
    currency: string;
    numberOfStudents?: number;
    durationHours?: number;
    promoCode?: string;
    date?: Date;
}

export interface PricingBreakdown {
    basePrice: number;
    currency: string;
    conditionalAdjustments: {
        type: string;
        description: string;
        amount: number;
    }[];
    promotionalDiscount: {
        code?: string;
        description: string;
        amount: number;
    } | null;
    subtotal: number;
    finalPrice: number;
    pricePerStudent?: number;
}

export class PricingService {
    private repository: PricingRepository;

    constructor() {
        this.repository = new PricingRepository();
    }

    // ============================================
    // DATA RETRIEVAL
    // ============================================
    
    /**
     * Get all pricing data for a lesson
     */
    async getLessonPricingData(lessonId: number) {
        const [groupTiers, durationPackagesList, promoCodesList] = await Promise.all([
            this.repository.getLessonGroupTiers(lessonId),
            this.repository.getLessonDurationPackages(lessonId),
            this.repository.getLessonPromoCodes(lessonId)
        ]);

        return {
            groupTiers,
            durationPackages: durationPackagesList,
            promoCodes: promoCodesList
        };
    }

    // ============================================
    // GROUP PRICING TIERS
    // ============================================

    async createGroupTier(data: {
        lessonId: number;
        minStudents: number;
        maxStudents: number;
        pricePerHour: number;
    }) {
        if (data.minStudents >= data.maxStudents) {
            throw new Error('Min students must be less than max students');
        }
        if (data.pricePerHour < 0) {
            throw new Error('Price must be positive');
        }

        return await this.repository.createGroupTier(data);
    }

    async updateGroupTier(tierId: number, data: {
        minStudents: number;
        maxStudents: number;
        pricePerHour: number;
    }) {
        if (data.minStudents >= data.maxStudents) {
            throw new Error('Min students must be less than max students');
        }
        if (data.pricePerHour < 0) {
            throw new Error('Price must be positive');
        }

        return await this.repository.updateGroupTier(tierId, data);
    }

    async deleteGroupTier(tierId: number) {
        return await this.repository.deleteGroupTier(tierId);
    }

    // ============================================
    // DURATION PACKAGES
    // ============================================

    async createDurationPackage(data: {
        lessonId: number;
        name: string;
        hours: number;
        price: number;
        description?: string;
    }) {
        if (data.hours <= 0) {
            throw new Error('Hours must be positive');
        }
        if (data.price < 0) {
            throw new Error('Price must be positive');
        }

        return await this.repository.createDurationPackage(data);
    }

    async updateDurationPackage(packageId: number, data: {
        name: string;
        hours: number;
        price: number;
        description?: string;
    }) {
        if (data.hours <= 0) {
            throw new Error('Hours must be positive');
        }
        if (data.price < 0) {
            throw new Error('Price must be positive');
        }

        return await this.repository.updateDurationPackage(packageId, data);
    }

    async deleteDurationPackage(packageId: number) {
        return await this.repository.deleteDurationPackage(packageId);
    }

    // ============================================
    // PROMO CODES
    // ============================================

    async createPromoCode(data: {
        lessonId: number;
        instructorId: number;
        code: string;
        discountPercent: number;
        validUntil?: Date;
        maxUses?: number;
    }) {
        if (data.discountPercent < 1 || data.discountPercent > 100) {
            throw new Error('Discount must be between 1 and 100');
        }
        if (data.code.length < 3) {
            throw new Error('Code must be at least 3 characters');
        }

        return await this.repository.createPromoCode(data);
    }

    async updatePromoCode(promoId: number, data: {
        code: string;
        discountPercent: number;
        validUntil?: Date;
        maxUses?: number;
    }) {
        if (data.discountPercent < 1 || data.discountPercent > 100) {
            throw new Error('Discount must be between 1 and 100');
        }
        if (data.code.length < 3) {
            throw new Error('Code must be at least 3 characters');
        }

        return await this.repository.updatePromoCode(promoId, data);
    }

    async deletePromoCode(promoId: number) {
        return await this.repository.deletePromoCode(promoId);
    }

    // ============================================
    // PRICE CALCULATION (Future feature)
    // ============================================
    
    async calculatePrice(params: PricingCalculationParams): Promise<PricingBreakdown> {
        // This is for future booking flow - simplified for now
        const { basePrice, currency, numberOfStudents = 1 } = params;
        
        return {
            basePrice,
            currency,
            conditionalAdjustments: [],
            promotionalDiscount: null,
            subtotal: basePrice,
            finalPrice: basePrice,
            pricePerStudent: numberOfStudents > 1 ? basePrice / numberOfStudents : undefined
        };
    }

    async getMinimumPrice(lessonId: number, basePrice: number, currency: string): Promise<number> {
        return basePrice; // Simplified for now
    }

    async incrementPromoUsage(promoCode: string): Promise<void> {
        await this.repository.incrementPromoUsage(promoCode);
    }
}