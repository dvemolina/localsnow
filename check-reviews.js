// Quick script to check reviews in database
import { db } from './src/lib/server/db/index.js';
import { instructorReviews } from './src/lib/server/db/schema.js';

async function checkReviews() {
	console.log('Checking instructor_reviews table...');

	const allReviews = await db.select().from(instructorReviews);

	console.log(`\nTotal reviews found: ${allReviews.length}`);

	if (allReviews.length > 0) {
		console.log('\nReviews:');
		allReviews.forEach((review, index) => {
			console.log(`\n${index + 1}. Review #${review.id}`);
			console.log(`   Instructor ID: ${review.instructorId}`);
			console.log(`   Rating: ${review.rating}/5`);
			console.log(`   Comment: ${review.comment || 'No comment'}`);
			console.log(`   Verified: ${review.isVerified}`);
			console.log(`   Published: ${review.isPublished}`);
			console.log(`   Client: ${review.clientEmail}`);
			console.log(`   Created: ${review.createdAt}`);
		});
	} else {
		console.log('\nNo reviews found in instructor_reviews table.');
	}

	process.exit(0);
}

checkReviews().catch(err => {
	console.error('Error:', err);
	process.exit(1);
});
