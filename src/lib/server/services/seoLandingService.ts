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
      image: string | null;
      description: string | null
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
      description: resorts.description,
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
          website: resortData.website,
          description: resortData.description
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
        website: resortData.website,
        description: resortData.description
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
 * Get individual resort information for resort detail page
 */
export async function getResortDetails(
  countrySlug: string,
  regionSlug: string,
  resortSlug: string
) {
  // Get resort info
  const resortData = await db
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
      countryCode: countries.countryCode,
      image: resorts.image,
      description: resorts.description
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

  if (resortData.length === 0) return null;

  const resort = resortData[0];

  // Get count of verified instructors per sport at this resort
  const sportCounts = await db
    .select({
      sportId: sports.id,
      sport: sports.sport,
      sportSlug: sports.sportSlug,
      // Use a raw SQL count
    })
    .from(sports)
    .leftJoin(instructorSports, eq(sports.id, instructorSports.sportId))
    .leftJoin(instructorResorts,
      and(
        eq(instructorSports.instructorId, instructorResorts.instructorId),
        eq(instructorResorts.resortId, resort.resortId)
      )
    )
    .leftJoin(users,
      and(
        eq(instructorResorts.instructorId, users.id),
        eq(users.isVerified, true)
      )
    )
    .groupBy(sports.id, sports.sport, sports.sportSlug);

  // Count instructors manually for each sport
  const sportsWithCounts = await Promise.all(
    sportCounts.map(async (sportData) => {
      const count = await db
        .select({ instructorId: instructorResorts.instructorId })
        .from(instructorResorts)
        .innerJoin(instructorSports, eq(instructorResorts.instructorId, instructorSports.instructorId))
        .innerJoin(users, eq(instructorResorts.instructorId, users.id))
        .where(
          and(
            eq(instructorResorts.resortId, resort.resortId),
            eq(instructorSports.sportId, sportData.sportId),
            eq(users.isVerified, true)
          )
        );

      return {
        ...sportData,
        instructorCount: count.length
      };
    })
  );

  // Get nearby resorts in the same region/country
  const nearbyResorts = await db
    .select({
      id: resorts.id,
      name: resorts.name,
      slug: resorts.slug,
      minElevation: resorts.minElevation,
      maxElevation: resorts.maxElevation,
      regionSlug: regions.regionSlug,
      countrySlug: countries.countrySlug
    })
    .from(resorts)
    .innerJoin(countries, eq(resorts.countryId, countries.id))
    .leftJoin(regions, eq(resorts.regionId, regions.id))
    .where(
      and(
        eq(countries.id, resort.countryId),
        resort.regionId ? eq(regions.id, resort.regionId) : undefined,
        ne(resorts.id, resort.resortId)
      )
    )
    .limit(6);

  return {
    resort: {
      id: resort.resortId,
      name: resort.resortName,
      slug: resort.resortSlug,
      minElevation: resort.minElevation,
      maxElevation: resort.maxElevation,
      lat: resort.lat,
      lon: resort.lon,
      website: resort.website,
      description: resort.description
    },
    location: {
      country: {
        id: resort.countryId,
        country: resort.countryName,
        countrySlug: resort.countrySlug,
        countryCode: resort.countryCode
      },
      region: resort.regionId ? {
        id: resort.regionId,
        region: resort.regionName!,
        regionSlug: resort.regionSlug!
      } : undefined
    },
    sportsAvailable: sportsWithCounts,
    nearbyResorts
  };
}

/**
 * Get country-level details showing all regions and resorts
 */
export async function getCountryDetails(countrySlug: string) {
  // Get country info
  const countryData = await db
    .select({
      id: countries.id,
      country: countries.country,
      countrySlug: countries.countrySlug,
      countryCode: countries.countryCode
    })
    .from(countries)
    .where(eq(countries.countrySlug, countrySlug))
    .limit(1);

  if (countryData.length === 0) return null;

  const country = countryData[0];

  // Get all regions in this country
  const regionsData = await db
    .select({
      id: regions.id,
      region: regions.region,
      regionSlug: regions.regionSlug
    })
    .from(regions)
    .where(eq(regions.countryId, country.id))
    .orderBy(regions.region);

  // Get all resorts in this country grouped by region
  const resortsData = await db
    .select({
      id: resorts.id,
      name: resorts.name,
      slug: resorts.slug,
      minElevation: resorts.minElevation,
      maxElevation: resorts.maxElevation,
      regionId: regions.id,
      regionName: regions.region,
      regionSlug: regions.regionSlug
    })
    .from(resorts)
    .leftJoin(regions, eq(resorts.regionId, regions.id))
    .where(eq(resorts.countryId, country.id))
    .orderBy(regions.region, resorts.name);

  // Group resorts by region
  const resortsByRegion = resortsData.reduce((acc, resort) => {
    const regionKey = resort.regionSlug || 'no-region';
    if (!acc[regionKey]) {
      acc[regionKey] = {
        region: resort.regionName || 'Other',
        regionSlug: resort.regionSlug || '',
        resorts: []
      };
    }
    acc[regionKey].resorts.push({
      id: resort.id,
      name: resort.name,
      slug: resort.slug,
      minElevation: resort.minElevation,
      maxElevation: resort.maxElevation
    });
    return acc;
  }, {} as Record<string, any>);

  return {
    country,
    regions: regionsData,
    resortsByRegion: Object.values(resortsByRegion),
    totalResorts: resortsData.length
  };
}

/**
 * Get region-level details showing all resorts in a region
 */
export async function getRegionDetails(countrySlug: string, regionSlug: string) {
  // Get region and country info
  const regionData = await db
    .select({
      regionId: regions.id,
      region: regions.region,
      regionSlug: regions.regionSlug,
      countryId: countries.id,
      country: countries.country,
      countrySlug: countries.countrySlug,
      countryCode: countries.countryCode
    })
    .from(regions)
    .innerJoin(countries, eq(regions.countryId, countries.id))
    .where(
      and(
        eq(regions.regionSlug, regionSlug),
        eq(countries.countrySlug, countrySlug)
      )
    )
    .limit(1);

  if (regionData.length === 0) return null;

  const region = regionData[0];

  // Get all resorts in this region
  const resortsData = await db
    .select({
      id: resorts.id,
      name: resorts.name,
      slug: resorts.slug,
      minElevation: resorts.minElevation,
      maxElevation: resorts.maxElevation,
      lat: resorts.lat,
      lon: resorts.lon,
      website: resorts.website
    })
    .from(resorts)
    .where(eq(resorts.regionId, region.regionId))
    .orderBy(resorts.name);

  return {
    region: {
      id: region.regionId,
      region: region.region,
      regionSlug: region.regionSlug
    },
    country: {
      id: region.countryId,
      country: region.country,
      countrySlug: region.countrySlug,
      countryCode: region.countryCode
    },
    resorts: resortsData,
    totalResorts: resortsData.length
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
