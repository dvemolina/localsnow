// Quick script to verify Verbier resort setup
// Run with: tsx scripts/verify-verbier.ts

import { db } from '../src/lib/server/db';
import { countries, regions, resorts, users, instructorResorts } from '../src/lib/server/db/schema';
import { eq, sql, and, isNull, or } from 'drizzle-orm';

async function verifyVerbier() {
	console.log('\n🔍 Checking if Switzerland exists...');
	const switzerland = await db
		.select()
		.from(countries)
		.where(sql`UPPER(${countries.countryCode}) = 'CH'`)
		.limit(1);

	if (switzerland.length === 0) {
		console.log('❌ Switzerland NOT found in database');
		console.log('   Run migration: pnpm drizzle-kit push');
		return;
	}
	console.log('✅ Switzerland found:', switzerland[0]);

	console.log('\n🔍 Checking if Valais region exists...');
	const valais = await db
		.select()
		.from(regions)
		.where(eq(regions.regionSlug, 'valais'))
		.limit(1);

	if (valais.length === 0) {
		console.log('❌ Valais region NOT found');
		console.log('   Run migration: pnpm drizzle-kit push');
		return;
	}
	console.log('✅ Valais found:', valais[0]);

	console.log('\n🔍 Checking if Verbier resort exists...');
	const verbier = await db
		.select({
			id: resorts.id,
			name: resorts.name,
			slug: resorts.slug,
			minElevation: resorts.minElevation,
			maxElevation: resorts.maxElevation,
			lat: resorts.lat,
			lon: resorts.lon,
			country: countries.country,
			region: regions.region
		})
		.from(resorts)
		.innerJoin(countries, eq(resorts.countryId, countries.id))
		.leftJoin(regions, eq(resorts.regionId, regions.id))
		.where(eq(resorts.slug, 'verbier'))
		.limit(1);

	if (verbier.length === 0) {
		console.log('❌ Verbier resort NOT found in database');
		console.log('   Run migration: pnpm drizzle-kit push');
		return;
	}
	console.log('✅ Verbier found:', verbier[0]);

	console.log('\n🔍 Checking for instructors at Verbier...');
	const instructorsAtVerbier = await db
		.select({
			id: users.id,
			name: users.name,
			lastName: users.lastName,
			email: users.email,
			role: users.role
		})
		.from(users)
		.innerJoin(instructorResorts, eq(users.id, instructorResorts.instructorId))
		.innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
		.where(
			and(
				eq(resorts.slug, 'verbier'),
				isNull(users.deletedAt),
				or(
					eq(users.role, 'instructor-independent'),
					eq(users.role, 'instructor-school')
				)
			)
		);

	if (instructorsAtVerbier.length === 0) {
		console.log('⚠️  No instructors found at Verbier');
		console.log('\n📋 Why Verbier is not appearing in search:');
		console.log('   The resorts page only shows resorts with at least 1 active instructor.');
		console.log('\n✅ How to fix:');
		console.log('   1. Sign in as an instructor (or create instructor account)');
		console.log('   2. Go to Dashboard → Profile → Edit');
		console.log('   3. Add "Verbier" to your resort list');
		console.log('   4. Save changes');
		console.log('   5. Verbier will now appear in /resorts and search results');
		console.log(`\n   Resort ID: ${verbier[0].id} (use this when adding to instructor profile)`);
	} else {
		console.log(`✅ Found ${instructorsAtVerbier.length} instructor(s) at Verbier:`);
		instructorsAtVerbier.forEach(instructor => {
			console.log(`   - ${instructor.name} ${instructor.lastName} (${instructor.email})`);
		});
		console.log('\n✅ Verbier should appear in search results!');
	}

	console.log('\n');
	process.exit(0);
}

verifyVerbier().catch(err => {
	console.error('Error:', err);
	process.exit(1);
});
