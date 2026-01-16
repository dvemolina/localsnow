import { db } from '$lib/server/db/index';
import { instructorLeads } from '$lib/server/db/schema';
import type { InstructorLead, InsertInstructorLead } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export class LeadRepository {
	/**
	 * Create a new lead
	 */
	async createLead(leadData: InsertInstructorLead): Promise<InstructorLead> {
		const result = await db.insert(instructorLeads).values(leadData).returning();

		if (!result[0]) {
			throw new Error('Failed to create lead');
		}

		return result[0];
	}

	/**
	 * Get leads for a specific instructor
	 */
	async getLeadsByInstructor(
		instructorId: number,
		limit: number = 50,
		offset: number = 0
	): Promise<InstructorLead[]> {
		return await db
			.select()
			.from(instructorLeads)
			.where(eq(instructorLeads.instructorId, instructorId))
			.orderBy(desc(instructorLeads.createdAt))
			.limit(limit)
			.offset(offset);
	}

	/**
	 * Get lead by ID
	 */
	async getLeadById(leadId: number): Promise<InstructorLead | null> {
		const result = await db
			.select()
			.from(instructorLeads)
			.where(eq(instructorLeads.id, leadId))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Update lead status
	 */
	async updateLeadStatus(
		leadId: number,
		status: 'new' | 'contacted' | 'converted' | 'spam'
	): Promise<InstructorLead | null> {
		const result = await db
			.update(instructorLeads)
			.set({
				status,
				updatedAt: new Date()
			})
			.where(eq(instructorLeads.id, leadId))
			.returning();

		return result[0] || null;
	}

	/**
	 * Get lead count by instructor and optional status
	 */
	async getLeadCount(instructorId: number, status?: string): Promise<number> {
		const conditions = [eq(instructorLeads.instructorId, instructorId)];

		if (status) {
			conditions.push(eq(instructorLeads.status, status));
		}

		const result = await db
			.select()
			.from(instructorLeads)
			.where(and(...conditions));

		return result.length;
	}

	/**
	 * Delete a lead
	 */
	async deleteLead(leadId: number): Promise<boolean> {
		const result = await db
			.delete(instructorLeads)
			.where(eq(instructorLeads.id, leadId))
			.returning();

		return result.length > 0;
	}
}
