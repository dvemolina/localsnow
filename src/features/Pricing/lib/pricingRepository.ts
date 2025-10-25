import { db } from '$lib/server/db';
import {
	groupPricingTiers,
	durationPackages,
	promoCodes,
	conditionalPricing,
	promotionalPricing
} from '$src/lib/server/db/schema';
import { eq, and, lte, gte, isNull, or } from 'drizzle-orm';

export class PricingRepository {
	// ============================================
	// DATA RETRIEVAL
	// ============================================

	async getLessonGroupTiers(lessonId: number) {
		return await db
			.select()
			.from(groupPricingTiers)
			.where(eq(groupPricingTiers.lessonId, lessonId));
	}

	async getLessonDurationPackages(lessonId: number) {
		return await db.select().from(durationPackages).where(eq(durationPackages.lessonId, lessonId));
	}

	async getLessonPromoCodes(lessonId: number) {
		return await db.select().from(promoCodes).where(eq(promoCodes.lessonId, lessonId));
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
		const [tier] = await db.insert(groupPricingTiers).values(data).returning();
		return tier;
	}

	async updateGroupTier(
		tierId: number,
		data: {
			minStudents: number;
			maxStudents: number;
			pricePerHour: number;
		}
	) {
		const [tier] = await db
			.update(groupPricingTiers)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(groupPricingTiers.id, tierId))
			.returning();
		return tier;
	}

	async deleteGroupTier(tierId: number) {
		await db.delete(groupPricingTiers).where(eq(groupPricingTiers.id, tierId));
		return true;
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
		const [pkg] = await db
			.insert(durationPackages)
			.values({
				...data,
				description: data.description || null
			})
			.returning();
		return pkg;
	}

	async updateDurationPackage(
		packageId: number,
		data: {
			name: string;
			hours: number;
			price: number;
			description?: string;
		}
	) {
		const [pkg] = await db
			.update(durationPackages)
			.set({
				...data,
				description: data.description || null,
				updatedAt: new Date()
			})
			.where(eq(durationPackages.id, packageId))
			.returning();
		return pkg;
	}

	async deleteDurationPackage(packageId: number) {
		await db.delete(durationPackages).where(eq(durationPackages.id, packageId));
		return true;
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
		const [promo] = await db
			.insert(promoCodes)
			.values({
				...data,
				code: data.code.toUpperCase(),
				validUntil: data.validUntil || null,
				maxUses: data.maxUses || null,
				currentUses: 0
			})
			.returning();
		return promo;
	}

	async updatePromoCode(
		promoId: number,
		data: {
			code: string;
			discountPercent: number;
			validUntil?: Date;
			maxUses?: number;
		}
	) {
		const [promo] = await db
			.update(promoCodes)
			.set({
				code: data.code.toUpperCase(),
				discountPercent: data.discountPercent,
				validUntil: data.validUntil || null,
				maxUses: data.maxUses || null,
				updatedAt: new Date()
			})
			.where(eq(promoCodes.id, promoId))
			.returning();
		return promo;
	}

	async deletePromoCode(promoId: number) {
		await db.delete(promoCodes).where(eq(promoCodes.id, promoId));
		return true;
	}

	// ============================================
	// CONDITIONAL & PROMOTIONAL PRICING (for calculations)
	// ============================================

	async getConditionalPricingRules(lessonId: number) {
		return await db
			.select()
			.from(conditionalPricing)
			.where(and(eq(conditionalPricing.lessonId, lessonId), eq(conditionalPricing.isActive, true)))
			.orderBy(conditionalPricing.priority);
	}

	async getPromotionalPricingRules(date: Date) {
		return await db
			.select()
			.from(promotionalPricing)
			.where(
				and(
					eq(promotionalPricing.isActive, true),
					or(isNull(promotionalPricing.startDate), lte(promotionalPricing.startDate, date)),
					or(isNull(promotionalPricing.endDate), gte(promotionalPricing.endDate, date))
				)
			);
	}

	async incrementPromoUsage(promoCode: string) {
		await db
			.update(promotionalPricing)
			.set({
				currentUses: db.raw('current_uses + 1'),
				updatedAt: new Date()
			})
			.where(eq(promotionalPricing.code, promoCode));
	}
}
