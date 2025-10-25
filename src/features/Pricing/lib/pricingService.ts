import { db } from "$lib/server/db";
import { conditionalPricing, promotionalPricing, lessons } from "$src/lib/server/db/schema";
import { eq, and, lte, gte, isNull, or } from "drizzle-orm";

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
    /**
     * Calculate the final price with all adjustments
     */
    async calculatePrice(params: PricingCalculationParams): Promise<PricingBreakdown> {
        const {
            lessonId,
            basePrice,
            currency,
            numberOfStudents = 1,
            durationHours = 1,
            promoCode,
            date = new Date()
        } = params;

        let currentPrice = basePrice * durationHours;
        const conditionalAdjustments: PricingBreakdown['conditionalAdjustments'] = [];

        // 1. Apply conditional pricing rules (group discounts, duration discounts)
        const conditions = await this.getApplicableConditionalPricing(
            lessonId,
            numberOfStudents,
            durationHours,
            date
        );

        for (const condition of conditions) {
            const adjustment = this.applyConditionalAdjustment(
                currentPrice,
                condition,
                numberOfStudents,
                durationHours
            );

            if (adjustment.amount !== 0) {
                conditionalAdjustments.push(adjustment);
                currentPrice += adjustment.amount;
            }
        }

        const subtotal = currentPrice;

        // 2. Apply promotional pricing (promo codes, seasonal discounts)
        let promotionalDiscount: PricingBreakdown['promotionalDiscount'] = null;
        
        const promo = await this.getApplicablePromotionalPricing(
            lessonId,
            promoCode,
            date,
            subtotal
        );

        if (promo) {
            const discountAmount = this.calculatePromotionalDiscount(subtotal, promo);
            if (discountAmount > 0) {
                promotionalDiscount = {
                    code: promo.code || undefined,
                    description: promo.code 
                        ? `Promo code: ${promo.code}` 
                        : 'Seasonal discount',
                    amount: -discountAmount
                };
                currentPrice -= discountAmount;
            }
        }

        return {
            basePrice,
            currency,
            conditionalAdjustments,
            promotionalDiscount,
            subtotal,
            finalPrice: Math.max(0, Math.round(currentPrice * 100) / 100), // Round to 2 decimals, min 0
            pricePerStudent: numberOfStudents > 1 
                ? Math.round((currentPrice / numberOfStudents) * 100) / 100 
                : undefined
        };
    }

    /**
     * Get the minimum possible price (for "from X€" displays)
     */
    async getMinimumPrice(lessonId: number, basePrice: number, currency: string): Promise<number> {
        // Calculate with maximum discounts
        const breakdown = await this.calculatePrice({
            lessonId,
            basePrice,
            currency,
            numberOfStudents: 10, // Maximum group size for max discount
            durationHours: 1
        });

        return breakdown.finalPrice;
    }

    /**
     * Get applicable conditional pricing rules
     */
    private async getApplicableConditionalPricing(
        lessonId: number,
        numberOfStudents: number,
        durationHours: number,
        date: Date
    ) {
        const rules = await db
            .select()
            .from(conditionalPricing)
            .where(
                and(
                    eq(conditionalPricing.lessonId, lessonId),
                    eq(conditionalPricing.isActive, true)
                )
            )
            .orderBy(conditionalPricing.priority);

        // Filter rules that match the conditions
        return rules.filter(rule => {
            if (rule.conditionType === 'students') {
                const matchesMin = rule.minValue === null || numberOfStudents >= rule.minValue;
                const matchesMax = rule.maxValue === null || numberOfStudents <= rule.maxValue;
                return matchesMin && matchesMax;
            }

            if (rule.conditionType === 'duration') {
                const matchesMin = rule.minValue === null || durationHours >= rule.minValue;
                const matchesMax = rule.maxValue === null || durationHours <= rule.maxValue;
                return matchesMin && matchesMax;
            }

            return false;
        });
    }

    /**
     * Apply a conditional adjustment
     */
    private applyConditionalAdjustment(
        currentPrice: number,
        condition: any,
        numberOfStudents: number,
        durationHours: number
    ) {
        const value = parseFloat(condition.adjustmentValue);
        let amount = 0;
        let description = '';

        switch (condition.adjustmentType) {
            case 'percentage':
                amount = currentPrice * (value / 100);
                description = `${value}% ${value > 0 ? 'increase' : 'discount'} for ${this.getConditionDescription(condition, numberOfStudents, durationHours)}`;
                break;

            case 'fixed_amount':
                amount = value;
                description = `${Math.abs(value)}€ ${value > 0 ? 'increase' : 'discount'} for ${this.getConditionDescription(condition, numberOfStudents, durationHours)}`;
                break;

            case 'multiplier':
                amount = currentPrice * value - currentPrice;
                description = `${value}x multiplier for ${this.getConditionDescription(condition, numberOfStudents, durationHours)}`;
                break;
        }

        return {
            type: condition.conditionType,
            description,
            amount: Math.round(amount * 100) / 100
        };
    }

    /**
     * Get human-readable condition description
     */
    private getConditionDescription(condition: any, students: number, hours: number): string {
        if (condition.conditionType === 'students') {
            if (students === 1) return '1 student';
            return `${students} students`;
        }
        if (condition.conditionType === 'duration') {
            if (hours === 1) return '1 hour';
            return `${hours} hours`;
        }
        return condition.conditionType;
    }

    /**
     * Get applicable promotional pricing
     */
    private async getApplicablePromotionalPricing(
        lessonId: number,
        promoCode: string | undefined,
        date: Date,
        subtotal: number
    ) {
        const query = db
            .select()
            .from(promotionalPricing)
            .where(
                and(
                    eq(promotionalPricing.isActive, true),
                    or(
                        isNull(promotionalPricing.startDate),
                        lte(promotionalPricing.startDate, date)
                    ),
                    or(
                        isNull(promotionalPricing.endDate),
                        gte(promotionalPricing.endDate, date)
                    )
                )
            );

        const promos = await query;

        // Filter by lesson, instructor, code, and minimum purchase
        return promos.find(promo => {
            // Check if applies to this lesson
            if (promo.lessonId !== null && promo.lessonId !== lessonId) {
                return false;
            }

            // Check promo code
            if (promoCode) {
                if (promo.code !== promoCode) return false;
            } else {
                // If no code provided, only consider automatic discounts
                if (promo.code !== null) return false;
            }

            // Check minimum purchase amount
            if (promo.minPurchaseAmount !== null && subtotal < parseFloat(promo.minPurchaseAmount)) {
                return false;
            }

            // Check max uses
            if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
                return false;
            }

            return true;
        });
    }

    /**
     * Calculate promotional discount amount
     */
    private calculatePromotionalDiscount(subtotal: number, promo: any): number {
        const value = parseFloat(promo.discountValue);

        if (promo.discountType === 'percentage') {
            return subtotal * (value / 100);
        }

        if (promo.discountType === 'fixed_amount') {
            return Math.min(value, subtotal); // Don't discount more than the subtotal
        }

        return 0;
    }

    /**
     * Increment promo code usage (call after successful booking)
     */
    async incrementPromoUsage(promoCode: string): Promise<void> {
        await db
            .update(promotionalPricing)
            .set({
                currentUses: db.raw('current_uses + 1'),
                updatedAt: new Date()
            })
            .where(eq(promotionalPricing.code, promoCode));
    }
}import { PricingRepository } from "./pricingRepository";

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
        // Business logic validation
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
        // Business logic validation
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
        // Business logic validation
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
        // Business logic validation
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
        // Business logic validation
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
        // Business logic validation
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
    // PRICE CALCULATION
    // ============================================
    
    async calculatePrice(params: PricingCalculationParams): Promise<PricingBreakdown> {
        const {
            lessonId,
            basePrice,
            currency,
            numberOfStudents = 1,
            durationHours = 1,
            promoCode,
            date = new Date()
        } = params;

        let currentPrice = basePrice * durationHours;
        const conditionalAdjustments: PricingBreakdown['conditionalAdjustments'] = [];

        const conditions = await this.getApplicableConditionalPricing(
            lessonId,
            numberOfStudents,
            durationHours,
            date
        );

        for (const condition of conditions) {
            const adjustment = this.applyConditionalAdjustment(
                currentPrice,
                condition,
                numberOfStudents,
                durationHours
            );

            if (adjustment.amount !== 0) {
                conditionalAdjustments.push(adjustment);
                currentPrice += adjustment.amount;
            }
        }

        const subtotal = currentPrice;

        let promotionalDiscount: PricingBreakdown['promotionalDiscount'] = null;
        
        const promo = await this.getApplicablePromotionalPricing(
            lessonId,
            promoCode,
            date,
            subtotal
        );

        if (promo) {
            const discountAmount = this.calculatePromotionalDiscount(subtotal, promo);
            if (discountAmount > 0) {
                promotionalDiscount = {
                    code: promo.code || undefined,
                    description: promo.code 
                        ? `Promo code: ${promo.code}` 
                        : 'Seasonal discount',
                    amount: -discountAmount
                };
                currentPrice -= discountAmount;
            }
        }

        return {
            basePrice,
            currency,
            conditionalAdjustments,
            promotionalDiscount,
            subtotal,
            finalPrice: Math.max(0, Math.round(currentPrice * 100) / 100),
            pricePerStudent: numberOfStudents > 1 
                ? Math.round((currentPrice / numberOfStudents) * 100) / 100 
                : undefined
        };
    }

    async getMinimumPrice(lessonId: number, basePrice: number, currency: string): Promise<number> {
        const breakdown = await this.calculatePrice({
            lessonId,
            basePrice,
            currency,
            numberOfStudents: 10,
            durationHours: 1
        });

        return breakdown.finalPrice;
    }

    async incrementPromoUsage(promoCode: string): Promise<void> {
        await this.repository.incrementPromoUsage(promoCode);
    }

    // Private helper methods
    private async getApplicableConditionalPricing(
        lessonId: number,
        numberOfStudents: number,
        durationHours: number,
        date: Date
    ) {
        const rules = await this.repository.getConditionalPricingRules(lessonId);

        return rules.filter(rule => {
            if (rule.conditionType === 'students') {
                const matchesMin = rule.minValue === null || numberOfStudents >= rule.minValue;
                const matchesMax = rule.maxValue === null || numberOfStudents <= rule.maxValue;
                return matchesMin && matchesMax;
            }

            if (rule.conditionType === 'duration') {
                const matchesMin = rule.minValue === null || durationHours >= rule.minValue;
                const matchesMax = rule.maxValue === null || durationHours <= rule.maxValue;
                return matchesMin && matchesMax;
            }

            return false;
        });
    }

    private applyConditionalAdjustment(
        currentPrice: number,
        condition: any,
        numberOfStudents: number,
        durationHours: number
    ) {
        const value = parseFloat(condition.adjustmentValue);
        let amount = 0;
        let description = '';

        switch (condition.adjustmentType) {
            case 'percentage':
                amount = currentPrice * (value / 100);
                description = `${value}% ${value > 0 ? 'increase' : 'discount'} for ${this.getConditionDescription(condition, numberOfStudents, durationHours)}`;
                break;

            case 'fixed_amount':
                amount = value;
                description = `${Math.abs(value)}€ ${value > 0 ? 'increase' : 'discount'} for ${this.getConditionDescription(condition, numberOfStudents, durationHours)}`;
                break;

            case 'multiplier':
                amount = currentPrice * value - currentPrice;
                description = `${value}x multiplier for ${this.getConditionDescription(condition, numberOfStudents, durationHours)}`;
                break;
        }

        return {
            type: condition.conditionType,
            description,
            amount: Math.round(amount * 100) / 100
        };
    }

    private getConditionDescription(condition: any, students: number, hours: number): string {
        if (condition.conditionType === 'students') {
            if (students === 1) return '1 student';
            return `${students} students`;
        }
        if (condition.conditionType === 'duration') {
            if (hours === 1) return '1 hour';
            return `${hours} hours`;
        }
        return condition.conditionType;
    }

    private async getApplicablePromotionalPricing(
        lessonId: number,
        promoCode: string | undefined,
        date: Date,
        subtotal: number
    ) {
        const promos = await this.repository.getPromotionalPricingRules(date);

        return promos.find(promo => {
            if (promo.lessonId !== null && promo.lessonId !== lessonId) {
                return false;
            }

            if (promoCode) {
                if (promo.code !== promoCode) return false;
            } else {
                if (promo.code !== null) return false;
            }

            if (promo.minPurchaseAmount !== null && subtotal < parseFloat(promo.minPurchaseAmount)) {
                return false;
            }

            if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
                return false;
            }

            return true;
        });
    }

    private calculatePromotionalDiscount(subtotal: number, promo: any): number {
        const value = parseFloat(promo.discountValue);

        if (promo.discountType === 'percentage') {
            return subtotal * (value / 100);
        }

        if (promo.discountType === 'fixed_amount') {
            return Math.min(value, subtotal);
        }

        return 0;
    }
}