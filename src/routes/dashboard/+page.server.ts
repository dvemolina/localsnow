// src/routes/dashboard/+page.server.ts
import { requireAuth } from "$src/lib/utils/auth";
import type { PageServerLoad } from "./$types";
import { getMonthlyVisits } from "$src/features/Dashboard/lib/utils";
import { LeadService } from "$src/features/Leads/lib/leadService";
import { LessonService } from "$src/features/Lessons/lib/lessonService";
import { WorkingHoursService } from "$src/features/Availability/lib/workingHoursService";
import { hasInstructorRole, hasRole } from "$src/lib/utils/roles";
import { db } from "$src/lib/server/db";
import { instructorSports, instructorResorts, schoolInstructors, schools } from "$src/lib/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const leadService = new LeadService();
const lessonService = new LessonService();
const workingHoursService = new WorkingHoursService();

export interface ProfileCompletionItem {
    key: string;
    label: string;
    description: string;
    completed: boolean;
    required: boolean;
    href: string;
}

interface CompletionConfig {
    user: ReturnType<typeof requireAuth>;
    sports: { instructorId: number }[];
    resorts: { instructorId: number }[];
    hasWorkingHours: boolean;
    hasBaseLesson: boolean;
    activeSchoolName: string | null;
    pendingSchoolType: 'application' | 'invitation' | null;
    pendingSchoolName: string | null;
}

function buildProfileCompletion(cfg: CompletionConfig): {
    items: ProfileCompletionItem[];
    completedCount: number;
} {
    const { user } = cfg;

    const hasProfilePhoto =
        !!user.profileImageUrl && user.profileImageUrl !== '/local-snow-head.png';
    const hasQualification = !!user.qualificationUrl;
    const hasPhone = !!user.professionalPhone;
    const hasBio = !!(user.bio && user.bio.trim().length > 10);
    const hasSports = cfg.sports.length > 0;
    const hasLanguages = !!(user.spokenLanguages && user.spokenLanguages.length > 0);
    const hasResort = cfg.resorts.length > 0;
    const isSchoolInstructor = hasRole(user, 'instructor-school');
    const isIndependent = hasRole(user, 'instructor-independent');

    // School item description
    let schoolDescription: string;
    if (cfg.activeSchoolName) {
        schoolDescription = cfg.activeSchoolName;
    } else if (cfg.pendingSchoolType === 'application') {
        schoolDescription = `Application pending — ${cfg.pendingSchoolName}`;
    } else if (cfg.pendingSchoolType === 'invitation') {
        schoolDescription = `Invitation pending from ${cfg.pendingSchoolName}`;
    } else {
        schoolDescription = 'Apply to your ski school or request its registration';
    }

    const items: ProfileCompletionItem[] = [
        {
            key: 'instructorType',
            label: 'Instructor type',
            description: isSchoolInstructor ? 'School instructor' : 'Independent instructor',
            completed: true,
            required: false,
            href: '/dashboard/profile'
        },
        {
            key: 'qualification',
            label: 'Qualification document',
            description: hasQualification
                ? 'Uploaded'
                : 'Upload your certification PDF so we can verify your credentials',
            completed: hasQualification,
            required: true,
            href: '/dashboard/profile'
        },
        {
            key: 'sports',
            label: 'Sport(s)',
            description: hasSports
                ? `${cfg.sports.length} sport${cfg.sports.length > 1 ? 's' : ''} added`
                : 'Add the sports you teach (Ski, Snowboard, Telemark)',
            completed: hasSports,
            required: true,
            href: '/dashboard/profile'
        },
        {
            key: 'phone',
            label: 'Contact phone',
            description: hasPhone
                ? 'Added'
                : 'Provide a professional phone number for student contact',
            completed: hasPhone,
            required: true,
            href: '/dashboard/profile'
        },
        {
            key: 'profilePhoto',
            label: 'Profile photo',
            description: hasProfilePhoto
                ? 'Uploaded'
                : 'Add a professional photo so clients can recognise you',
            completed: hasProfilePhoto,
            required: false,
            href: '/dashboard/profile'
        },
        {
            key: 'bio',
            label: 'Bio',
            description: hasBio
                ? 'Written'
                : 'Write a short introduction — your experience, style, and approach',
            completed: hasBio,
            required: false,
            href: '/dashboard/profile'
        },
        {
            key: 'languages',
            label: 'Spoken languages',
            description: hasLanguages
                ? `${user.spokenLanguages!.length} language${user.spokenLanguages!.length > 1 ? 's' : ''} listed`
                : 'List the languages you teach in',
            completed: hasLanguages,
            required: false,
            href: '/dashboard/profile'
        },
        {
            key: 'resort',
            label: 'Resort',
            description: hasResort
                ? `${cfg.resorts.length} resort${cfg.resorts.length > 1 ? 's' : ''} added`
                : 'Add the resort(s) where you teach',
            completed: hasResort,
            required: false,
            href: '/dashboard/profile'
        },
        {
            key: 'workingHours',
            label: 'Availability',
            description: cfg.hasWorkingHours
                ? 'Working hours configured'
                : "Set your weekly schedule so clients know when you're available",
            completed: cfg.hasWorkingHours,
            required: false,
            href: '/dashboard/availability/working-hours'
        },
        // Independent only: base lesson pricing
        ...(isIndependent ? [{
            key: 'baseLesson',
            label: 'Lessons & pricing',
            description: cfg.hasBaseLesson
                ? 'Base lesson configured'
                : 'Set your base rate and lesson options for clients to book',
            completed: cfg.hasBaseLesson,
            required: true,
            href: '/dashboard/lessons'
        }] : []),
        // School instructor only: school association
        ...(isSchoolInstructor ? [{
            key: 'school',
            label: 'School',
            description: schoolDescription,
            completed: !!cfg.activeSchoolName,
            required: false,
            href: '/dashboard/my-school'
        }] : [])
    ];

    const completedCount = items.filter((i) => i.completed).length;
    return { items, completedCount };
}

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access the Dashboard');

    let profileVisits = 0;
    let leadStats = null;
    let recentLeads = null;
    let profileCompletion: { items: ProfileCompletionItem[]; completedCount: number } | null = null;

    if (hasInstructorRole(user)) {
        const isIndependent = hasRole(user, 'instructor-independent');
        const isSchoolInstructor = hasRole(user, 'instructor-school');

        // Build parallel query list — indices matter for result unpacking
        type AnyPromise = Promise<unknown>;
        const queries: AnyPromise[] = [
            getMonthlyVisits(user.id),                                                         // 0
            leadService.getInstructorLeadStats(user.id),                                       // 1
            leadService.getInstructorLeads(user.id, 10, 0),                                   // 2
            db.query.instructorSports.findMany({ where: eq(instructorSports.instructorId, user.id) }),  // 3
            db.query.instructorResorts.findMany({ where: eq(instructorResorts.instructorId, user.id) }), // 4
            workingHoursService.hasWorkingHours(user.id),                                      // 5
        ];

        if (isIndependent) queries.push(lessonService.listLessonsByInstructor(user.id));        // 6 (independent only)

        if (isSchoolInstructor) {
            queries.push(
                db.select({
                    schoolName: schools.name,
                    isActive: schoolInstructors.isActive,
                    requestedBy: schoolInstructors.requestedBy
                })
                    .from(schoolInstructors)
                    .innerJoin(schools, eq(schoolInstructors.schoolId, schools.id))
                    .where(and(
                        eq(schoolInstructors.instructorId, user.id),
                        isNull(schoolInstructors.rejectedAt)
                    ))
                    .limit(1)
            );
            // index: 6 if independent+school (multi-role), or 6 if school only
        }

        const results = await Promise.allSettled(queries);

        if (results[0].status === 'fulfilled') profileVisits = results[0].value as number;
        if (results[1].status === 'fulfilled') leadStats = results[1].value;
        if (results[2].status === 'fulfilled') recentLeads = results[2].value;

        // Only build completion while unverified
        if (!user.isVerified) {
            const sportsData = results[3].status === 'fulfilled'
                ? (results[3].value as { instructorId: number }[]) : [];
            const resortsData = results[4].status === 'fulfilled'
                ? (results[4].value as { instructorId: number }[]) : [];
            const hasWorkingHours = results[5].status === 'fulfilled'
                ? Boolean(results[5].value) : false;

            let hasBaseLesson = false;
            let activeSchoolName: string | null = null;
            let pendingSchoolType: 'application' | 'invitation' | null = null;
            let pendingSchoolName: string | null = null;

            // Index 6 = lessons (independent) OR school status (school-only)
            // Index 7 = school status when BOTH roles exist (edge case)
            const lessonIdx = 6;
            const schoolIdx = isIndependent ? 7 : 6;

            if (isIndependent && results[lessonIdx]?.status === 'fulfilled') {
                const lessons = results[lessonIdx].value as { isBaseLesson: boolean }[];
                hasBaseLesson = lessons.some(l => l.isBaseLesson);
            }

            if (isSchoolInstructor && results[schoolIdx]?.status === 'fulfilled') {
                const rows = results[schoolIdx].value as {
                    schoolName: string; isActive: boolean; requestedBy: string;
                }[];
                if (rows.length > 0) {
                    if (rows[0].isActive) {
                        activeSchoolName = rows[0].schoolName;
                    } else {
                        pendingSchoolType = rows[0].requestedBy === 'instructor' ? 'application' : 'invitation';
                        pendingSchoolName = rows[0].schoolName;
                    }
                }
            }

            profileCompletion = buildProfileCompletion({
                user,
                sports: sportsData,
                resorts: resortsData,
                hasWorkingHours,
                hasBaseLesson,
                activeSchoolName,
                pendingSchoolType,
                pendingSchoolName
            });
        }
    }

    return {
        user,
        profileVisits,
        leadStats,
        recentLeads,
        profileCompletion
    };
};
