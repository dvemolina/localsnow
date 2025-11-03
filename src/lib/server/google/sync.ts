import { db } from '$lib/server/db';
import { instructorCalendarBlocks, instructorGoogleTokens } from '$lib/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { getInstructorCalendarClient } from './oauth';

/**
 * Sync Google Calendar events to database
 * Fetches events from now to 6 months ahead
 */
export async function syncInstructorCalendar(instructorId: number) {
	try {
		const calendar = await getInstructorCalendarClient(instructorId);
		
		// Fetch events from now to 6 months ahead
		const timeMin = new Date();
		const timeMax = new Date();
		timeMax.setMonth(timeMax.getMonth() + 6);
		
		const response = await calendar.events.list({
			calendarId: 'primary',
			timeMin: timeMin.toISOString(),
			timeMax: timeMax.toISOString(),
			singleEvents: true,
			orderBy: 'startTime'
		});
		
		const events = response.data.items || [];
		
		// Transaction: delete old Google blocks and insert new ones
		await db.transaction(async (tx) => {
			// Delete old Google Calendar blocks (keep booking blocks intact)
			await tx.delete(instructorCalendarBlocks)
				.where(
					and(
						eq(instructorCalendarBlocks.instructorId, instructorId),
						eq(instructorCalendarBlocks.source, 'google_calendar'),
						gte(instructorCalendarBlocks.startDatetime, timeMin)
					)
				);
			
			// Insert new blocks from Google Calendar
			if (events.length > 0) {
				const blocksToInsert = events
					.filter(event => {
						// Only import events that block time (not transparent events)
						return event.transparency !== 'transparent' && 
							   (event.start?.dateTime || event.start?.date);
					})
					.map(event => {
						const isAllDay = !!event.start?.date && !event.start?.dateTime;
						
						const startDatetime = isAllDay 
							? new Date(event.start!.date!)
							: new Date(event.start!.dateTime!);
						
						const endDatetime = isAllDay
							? new Date(event.end!.date!)
							: new Date(event.end!.dateTime!);
						
						return {
							instructorId,
							startDatetime,
							endDatetime,
							allDay: isAllDay,
							source: 'google_calendar' as const,
							googleEventId: event.id || null,
							title: event.summary || 'Busy'
						};
					});
				
				if (blocksToInsert.length > 0) {
					await tx.insert(instructorCalendarBlocks).values(blocksToInsert);
				}
			}
		});
		
		// Update last sync timestamp
		await db.update(instructorGoogleTokens)
			.set({ 
				lastSyncAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(instructorGoogleTokens.instructorId, instructorId));
		
		return { 
			success: true, 
			eventsImported: events.length,
			message: `Synced ${events.length} events from Google Calendar`
		};
		
	} catch (error) {
		console.error(`Calendar sync failed for instructor ${instructorId}:`, error);
		
		// If token is invalid, disable sync
		if (error instanceof Error && error.message.includes('invalid_grant')) {
			await db.update(instructorGoogleTokens)
				.set({ 
					syncEnabled: false,
					updatedAt: new Date()
				})
				.where(eq(instructorGoogleTokens.instructorId, instructorId));
		}
		
		throw error;
	}
}

/**
 * Sync all active instructors (for cron job)
 */
export async function syncAllInstructorCalendars() {
	// Use select() instead of db.query
	const activeTokens = await db
		.select({ instructorId: instructorGoogleTokens.instructorId })
		.from(instructorGoogleTokens)
		.where(eq(instructorGoogleTokens.syncEnabled, true));
	
	const results = {
		total: activeTokens.length,
		succeeded: 0,
		failed: 0,
		errors: [] as { instructorId: number; error: string }[]
	};
	
	for (const { instructorId } of activeTokens) {
		try {
			await syncInstructorCalendar(instructorId);
			results.succeeded++;
		} catch (error) {
			results.failed++;
			results.errors.push({
				instructorId,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
	
	return results;
}

/**
 * Manual sync trigger (for instructor dashboard)
 */
export async function triggerManualSync(instructorId: number) {
	return await syncInstructorCalendar(instructorId);
}