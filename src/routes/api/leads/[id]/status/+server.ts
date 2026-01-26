import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { LeadService } from '$src/features/Leads/lib/leadService';
import { hasInstructorRole } from '$src/lib/utils/roles';

const leadService = new LeadService();

export const PATCH: RequestHandler = async (event) => {
	// Check authentication
	const user = event.locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	// Only instructors can update lead status
	if (!hasInstructorRole(user)) {
		throw error(403, 'Only instructors can update lead status');
	}

	const leadId = parseInt(event.params.id);
	if (isNaN(leadId)) {
		throw error(400, 'Invalid lead ID');
	}

	try {
		// Get the lead to verify ownership
		const lead = await leadService.getLeadById(leadId);

		if (!lead) {
			throw error(404, 'Lead not found');
		}

		// Verify that this lead belongs to the instructor
		if (lead.instructorId !== user.id) {
			throw error(403, 'You can only update your own leads');
		}

		// Parse request body
		const body = await event.request.json();
		const { status } = body;

		// Validate status
		const validStatuses = ['new', 'contacted', 'converted', 'spam'];
		if (!status || !validStatuses.includes(status)) {
			throw error(400, 'Invalid status. Must be one of: new, contacted, converted, spam');
		}

		// Update lead status
		const updatedLead = await leadService.updateLeadStatus(leadId, status);

		if (!updatedLead) {
			throw error(500, 'Failed to update lead status');
		}

		return json({
			success: true,
			lead: updatedLead
		});
	} catch (err) {
		console.error('Error updating lead status:', err);

		// Re-throw SvelteKit errors
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to update lead status');
	}
};
