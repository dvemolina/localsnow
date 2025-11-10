import { db } from "$src/lib/server/db/index";
import {
  users,
  resorts,
  regions,
  countries,
  sports,
  instructorResorts,
  instructorSports
} from "$src/lib/server/db/schema";
import { eq, and, inArray, ne } from "drizzle-orm";

export interface InstructorLandingData {
  id: number;
  uuid: string;
  name: string;
  lastName: string;
  bio: string | null;
  profileImageUrl: string | null;
  isVerified: boolean;
  sports: Array<{
    id: number;
    sport: string;
    sportSlug: string;
  }>;
  resorts: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface LandingPageData {
  location: {
    country: { id: number; country: string; countrySlug: string; countryCode: string };
    region?: { id: number; region: string; regionSlug: string };
    resort?: {
      id: number;
      name: string;
      slug: string;
      minElevation: number | null;
      maxElevation: number | null;
      lat: string | null;
      lon: string | null;
      website: string | null;
    };
  };
  sport: {
    id: number;
    sport: string;
    sportSlug: string;
  };
  instructors: InstructorLandingData[];
  relatedResorts?: Array<{
    id: number;
    name: string;
    slug: string;
    regionSlug: string;
    countrySlug: string;
  }>;
  totalInstructors: number;
}

/**
 * Fetch instructors for a specific resort + sport combination
 * This is the most specific landing page type
 */
export async function getResortSportInstructors(
  countrySlug: string,
  regionSlug: string,
  resortSlug: string,
  sportSlug: string
): Promise<LandingPageData | null> {
  // First, verify the location exists
  const resort = await db
    .select({
      resortId: resorts.id,
      resortName: resorts.name,
      resortSlug: resorts.slug,
      minElevation: resorts.minElevation,
      maxElevation: resorts.maxElevation,
      lat: resorts.lat,
      lon: resorts.lon,
      website: resorts.website,
      regionId: regions.id,
      regionName: regions.region,
      regionSlug: regions.regionSlug,
      countryId: countries.id,
      countryName: countries.country,
      countrySlug: countries.countrySlug,
      countryCode: countries.countryCode
    })
    .from(resorts)
    .innerJoin(countries, eq(resorts.countryId, countries.id))
    .leftJoin(regions, eq(resorts.regionId, regions.id))
    .where(
      and(
        eq(resorts.slug, resortSlug),
        eq(countries.countrySlug, countrySlug),
        regionSlug ? eq(regions.regionSlug, regionSlug) : undefined
      )
    )
    .limit(1);

  if (resort.length === 0) return null;

  const resortData = resort[0];

  // Get the sport
  const sportData = await db
    .select()
    .from(sports)
    .where(eq(sports.sportSlug, sportSlug))
    .limit(1);

  if (sportData.length === 0) return null;

  const sport = sportData[0];

  // Find instructors who:
  // 1. Are verified
  // 2. Teach at this resort
  // 3. Teach this sport
  const instructorIds = await db
    .select({ instructorId: instructorResorts.instructorId })
    .from(instructorResorts)
    .innerJoin(instructorSports, eq(instructorResorts.instructorId, instructorSports.instructorId))
    .where(
      and(
        eq(instructorResorts.resortId, resortData.resortId),
        eq(instructorSports.sportId, sport.id)
      )
    );

  if (instructorIds.length === 0) {
    return {
      location: {
        country: {
          id: resortData.countryId,
          country: resortData.countryName,
          countrySlug: resortData.countrySlug,
          countryCode: resortData.countryCode
        },
        region: resortData.regionId ? {
          id: resortData.regionId,
          region: resortData.regionName!,
          regionSlug: resortData.regionSlug!
        } : undefined,
        resort: {
          id: resortData.resortId,
          name: resortData.resortName,
          slug: resortData.resortSlug,
          minElevation: resortData.minElevation,
          maxElevation: resortData.maxElevation,
          lat: resortData.lat,
          lon: resortData.lon,
          website: resortData.website
        }
      },
      sport: {
        id: sport.id,
        sport: sport.sport,
        sportSlug: sport.sportSlug
      },
      instructors: [],
      totalInstructors: 0
    };
  }

  const ids = instructorIds.map(i => i.instructorId);

  // Get full instructor details
  const instructorsData = await db
    .select({
      id: users.id,
      uuid: users.uuid,
      name: users.name,
      lastName: users.lastName,
      bio: users.bio,
      profileImageUrl: users.profileImageUrl,
      isVerified: users.isVerified
    })
    .from(users)
    .where(
      and(
        inArray(users.id, ids),
        eq(users.isVerified, true)
      )
    );

  // Get each instructor's sports and resorts
  const instructors: InstructorLandingData[] = await Promise.all(
    instructorsData.map(async (instructor) => {
      const instructorSportsData = await db
        .select({
          id: sports.id,
          sport: sports.sport,
          sportSlug: sports.sportSlug
        })
        .from(instructorSports)
        .innerJoin(sports, eq(instructorSports.sportId, sports.id))
        .where(eq(instructorSports.instructorId, instructor.id));

      const instructorResortsData = await db
        .select({
          id: resorts.id,
          name: resorts.name,
          slug: resorts.slug
        })
        .from(instructorResorts)
        .innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
        .where(eq(instructorResorts.instructorId, instructor.id));

      return {
        ...instructor,
        sports: instructorSportsData,
        resorts: instructorResortsData
      };
    })
  );

  // Get related resorts in the same region for internal linking
  const relatedResorts = await db
    .select({
      id: resorts.id,
      name: resorts.name,
      slug: resorts.slug,
      regionSlug: regions.regionSlug,
      countrySlug: countries.countrySlug
    })
    .from(resorts)
    .innerJoin(countries, eq(resorts.countryId, countries.id))
    .leftJoin(regions, eq(resorts.regionId, regions.id))
    .where(
      and(
        eq(countries.id, resortData.countryId),
        resortData.regionId ? eq(regions.id, resortData.regionId) : undefined,
        // Exclude current resort
        ne(resorts.id, resortData.resortId)
      )
    )
    .limit(6);

  return {
    location: {
      country: {
        id: resortData.countryId,
        country: resortData.countryName,
        countrySlug: resortData.countrySlug,
        countryCode: resortData.countryCode
      },
      region: resortData.regionId ? {
        id: resortData.regionId,
        region: resortData.regionName!,
        regionSlug: resortData.regionSlug!
      } : undefined,
      resort: {
        id: resortData.resortId,
        name: resortData.resortName,
        slug: resortData.resortSlug,
        minElevation: resortData.minElevation,
        maxElevation: resortData.maxElevation,
        lat: resortData.lat,
        lon: resortData.lon,
        website: resortData.website
      }
    },
    sport: {
      id: sport.id,
      sport: sport.sport,
      sportSlug: sport.sportSlug
    },
    instructors,
    relatedResorts,
    totalInstructors: instructors.length
  };
}

/**
 * Get all valid resort + sport combinations for sitemap generation
 */
export async function getAllResortSportCombinations() {
  const combinations = await db
    .select({
      countrySlug: countries.countrySlug,
      regionSlug: regions.regionSlug,
      resortSlug: resorts.slug,
      sportSlug: sports.sportSlug
    })
    .from(instructorResorts)
    .innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
    .innerJoin(countries, eq(resorts.countryId, countries.id))
    .leftJoin(regions, eq(resorts.regionId, regions.id))
    .innerJoin(instructorSports, eq(instructorResorts.instructorId, instructorSports.instructorId))
    .innerJoin(sports, eq(instructorSports.sportId, sports.id))
    .innerJoin(users, eq(instructorResorts.instructorId, users.id))
    .where(eq(users.isVerified, true))
    .groupBy(countries.countrySlug, regions.regionSlug, resorts.slug, sports.sportSlug);

  return combinations;
}
