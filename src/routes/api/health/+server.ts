import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
    try {
        // Check database
        await db.execute('SELECT 1');
        
        return json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'ok',
                application: 'ok'
            }
        });
    } catch (error) {
        return json({ 
            status: 'unhealthy',
            error: error.message 
        }, { status: 503 });
    }
}