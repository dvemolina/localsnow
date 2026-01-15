import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { LeadService } from '$src/features/Leads/lib/leadService';

const leadService = new LeadService();

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(302, '/auth/login');
	}

	// Only instructors can access leads
	if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
		throw redirect(302, '/dashboard');
	}

	// Get filter from URL
	const statusFilter = url.searchParams.get('status') || 'all';

	try {
		// Fetch all leads for this instructor
		const allLeads = await leadService.getLeadsByInstructor(user.id);

		// Filter leads based on status
		let filteredLeads = allLeads;
		if (statusFilter !== 'all') {
			filteredLeads = allLeads.filter(lead => lead.status === statusFilter);
		}

		// Calculate statistics
		const stats = {
			total: allLeads.length,
			new: allLeads.filter(l => l.status === 'new').length,
			contacted: allLeads.filter(l => l.status === 'contacted').length,
			converted: allLeads.filter(l => l.status === 'converted').length,
			spam: allLeads.filter(l => l.status === 'spam').length
		};

		return {
			user,
			leads: filteredLeads,
			stats,
			currentFilter: statusFilter
		};
	} catch (error) {
		console.error('Error loading leads:', error);
		return {
			user,
			leads: [],
			stats: { total: 0, new: 0, contacted: 0, converted: 0, spam: 0 },
			currentFilter: statusFilter
		};
	}
};
