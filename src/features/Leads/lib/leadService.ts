import { LeadRepository } from './leadRepository';
import type { InstructorLead, InsertInstructorLead } from '$lib/server/db/schema';

export class LeadService {
	private repository: LeadRepository;

	constructor() {
		this.repository = new LeadRepository();
	}

	/**
	 * Create a new lead from contact form
	 */
	async createLead(data: {
		instructorId: number;
		clientName?: string;
		clientEmail: string;
		clientPhone?: string;
		message: string;
	}): Promise<InstructorLead> {
		try {
			// Validate email format (basic check)
			if (!this.isValidEmail(data.clientEmail)) {
				throw new Error('Invalid email address');
			}

			// Validate message length
			if (!data.message || data.message.trim().length < 10) {
				throw new Error('Message must be at least 10 characters');
			}

			if (data.message.length > 1000) {
				throw new Error('Message must be less than 1000 characters');
			}

			const leadData: InsertInstructorLead = {
				instructorId: data.instructorId,
				clientName: data.clientName || null,
				clientEmail: data.clientEmail.toLowerCase().trim(),
				clientPhone: data.clientPhone || null,
				message: data.message.trim(),
				status: 'new'
			};

			return await this.repository.createLead(leadData);
		} catch (error) {
			console.error('Error creating lead:', error);
			throw error;
		}
	}

	/**
	 * Get leads for an instructor
	 */
	async getInstructorLeads(instructorId: number, limit: number = 50, offset: number = 0): Promise<InstructorLead[]> {
		try {
			return await this.repository.getLeadsByInstructor(instructorId, limit, offset);
		} catch (error) {
			console.error('Error fetching instructor leads:', error);
			throw new Error('Failed to fetch leads');
		}
	}

	/**
	 * Get lead statistics for an instructor
	 */
	async getInstructorLeadStats(instructorId: number): Promise<{
		total: number;
		thisMonth: number;
		new: number;
		contacted: number;
		converted: number;
	}> {
		try {
			const [allLeads, newLeads, contactedLeads, convertedLeads] = await Promise.all([
				this.repository.getLeadCount(instructorId),
				this.repository.getLeadCount(instructorId, 'new'),
				this.repository.getLeadCount(instructorId, 'contacted'),
				this.repository.getLeadCount(instructorId, 'converted')
			]);

			// Get this month's leads
			const leads = await this.repository.getLeadsByInstructor(instructorId, 1000, 0);
			const now = new Date();
			const thisMonth = leads.filter((lead) => {
				if (!lead.createdAt) return false;
				const leadDate = new Date(lead.createdAt);
				return (
					leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear()
				);
			});

			return {
				total: allLeads,
				thisMonth: thisMonth.length,
				new: newLeads,
				contacted: contactedLeads,
				converted: convertedLeads
			};
		} catch (error) {
			console.error('Error calculating lead stats:', error);
			throw new Error('Failed to calculate lead statistics');
		}
	}

	/**
	 * Update lead status
	 */
	async updateLeadStatus(
		leadId: number,
		status: 'new' | 'contacted' | 'converted' | 'spam'
	): Promise<InstructorLead | null> {
		try {
			return await this.repository.updateLeadStatus(leadId, status);
		} catch (error) {
			console.error('Error updating lead status:', error);
			throw new Error('Failed to update lead status');
		}
	}

	/**
	 * Get single lead by ID
	 */
	async getLeadById(leadId: number): Promise<InstructorLead | null> {
		try {
			return await this.repository.getLeadById(leadId);
		} catch (error) {
			console.error('Error fetching lead:', error);
			throw new Error('Failed to fetch lead');
		}
	}

	/**
	 * Delete a lead (for spam or GDPR requests)
	 */
	async deleteLead(leadId: number): Promise<boolean> {
		try {
			return await this.repository.deleteLead(leadId);
		} catch (error) {
			console.error('Error deleting lead:', error);
			throw new Error('Failed to delete lead');
		}
	}

	/**
	 * Validate email format
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}
