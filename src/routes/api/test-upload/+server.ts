import type { RequestHandler } from './$types';

/**
 * Simple test endpoint to diagnose file upload issues
 * Returns request details without processing files
 */
export const POST: RequestHandler = async ({ request }) => {
	console.log('[Test Upload] Request received');
	console.log('[Test Upload] Content-Type:', request.headers.get('content-type'));
	console.log('[Test Upload] Content-Length:', request.headers.get('content-length'));

	try {
		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('multipart/form-data')) {
			console.log('[Test Upload] Parsing multipart form data...');
			const formData = await request.formData();

			const files: Array<{ name: string; size: number; type: string }> = [];

			for (const [key, value] of formData.entries()) {
				if (value instanceof File) {
					console.log(`[Test Upload] File field "${key}": ${value.name}, ${value.size} bytes, ${value.type}`);
					files.push({
						name: value.name,
						size: value.size,
						type: value.type
					});
				} else {
					console.log(`[Test Upload] Text field "${key}": ${value}`);
				}
			}

			console.log('[Test Upload] Success! Received', files.length, 'file(s)');

			return new Response(JSON.stringify({
				success: true,
				message: 'Upload test successful',
				filesReceived: files.length,
				files: files,
				totalSize: files.reduce((sum, f) => sum + f.size, 0)
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		} else {
			console.log('[Test Upload] Not multipart, content-type:', contentType);
			return new Response(JSON.stringify({
				success: false,
				message: 'Expected multipart/form-data',
				contentType: contentType
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
	} catch (error) {
		console.error('[Test Upload] Error:', error);
		return new Response(JSON.stringify({
			success: false,
			message: 'Upload test failed',
			error: error instanceof Error ? error.message : String(error)
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
