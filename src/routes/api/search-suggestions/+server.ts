import { ResortService } from '$src/features/Resorts/lib/ResortsService.js';
import { json } from '@sveltejs/kit';

const resortService = new ResortService()

export async function GET({ url }) {
	const q = url.searchParams.get('q')?.trim();
	const countryIdParam = url.searchParams.get('countryId');

	// Parse countryId if provided
	const countryId = countryIdParam ? parseInt(countryIdParam, 10) : undefined;

	const results = await resortService.getSuggestions(q ?? '', countryId);
	return json(results);
}