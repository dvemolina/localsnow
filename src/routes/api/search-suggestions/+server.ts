import { ResortsService } from '$src/features/Resorts/lib/ResortsService.js';
import { json } from '@sveltejs/kit';

const resortsService = new ResortsService()

export async function GET({ url }) {
	const q = url.searchParams.get('q')?.trim();

	const results = await resortsService.getSuggestions(q ?? '');
	return json(results);
}