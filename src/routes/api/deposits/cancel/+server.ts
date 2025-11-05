import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    // User cancelled the payment - redirect back to homepage or search
    throw redirect(303, '/?cancelled=true');
};