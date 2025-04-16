import { ResortService } from '$src/features/Resorts/lib/ResortsService.js';
import { json } from '@sveltejs/kit';

const resortService = new ResortService()

export async function GET({ url }) {
	const q = url.searchParams.get('q')?.trim();

	const results = await resortService.getSuggestions(q ?? '');
	return json(results);
}