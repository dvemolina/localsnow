import type { PageServerLoad } from './$types';
import { LeadService } from '$src/features/Leads/lib/leadService';
import { LessonService } from '$src/features/Lessons/lib/lessonService';
import { requireDashboardRole } from '$src/lib/utils/dashboardAuth';

const leadService = new LeadService();
const lessonService = new LessonService();

export const load: PageServerLoad = async (event) => {
	const user = requireDashboardRole(
		event,
		['instructor-independent', 'instructor-school'],
		'Login to access leads'
	);

	// Get filter from URL
	const statusFilter = event.url.searchParams.get('status') || 'all';

	try {
		// Fetch all leads for this instructor and their lessons (for lead-to-booking conversion)
		const [allLeads, instructorLessons] = await Promise.all([
			leadService.getInstructorLeads(user.id),
			lessonService.listLessonsByInstructor(user.id)
		]);

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
			instructorLessons,
			stats,
			currentFilter: statusFilter
		};
	} catch (error) {
		console.error('Error loading leads:', error);
		return {
			user,
			leads: [],
			instructorLessons: [],
			stats: { total: 0, new: 0, contacted: 0, converted: 0, spam: 0 },
			currentFilter: statusFilter
		};
	}
};
