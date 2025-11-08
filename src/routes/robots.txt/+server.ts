// src/routes/robots.txt/+server.ts
const BASE_URL = 'https://localsnow.com';

export async function GET() {
	const robots = `# Local Snow robots.txt
User-agent: *
Allow: /

# Disallow private areas
Disallow: /dashboard/
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

	return new Response(robots, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
		}
	});
}
