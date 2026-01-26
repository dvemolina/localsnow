import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { resortRequests } from '$lib/server/db/schema';
import { resortRequestSchema } from '$src/features/Resorts/lib/resortSchemas';
import { EmailService } from '$lib/server/email/service';
import { hasAnyRole } from '$src/lib/utils/roles';

const emailService = new EmailService();

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check if user is authenticated
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only allow instructors to request resorts
	if (!hasAnyRole(user, ['instructor-independent', 'instructor-school', 'school-admin'])) {
		return json({ error: 'Only instructors can request new resorts' }, { status: 403 });
	}

	try {
		const body = await request.json();

		// Validate request body
		const validatedData = resortRequestSchema.parse(body);

		// Create resort request
		const [resortRequest] = await db
			.insert(resortRequests)
			.values({
				requesterId: user.id,
				requesterEmail: user.email,
				requesterName: `${user.name} ${user.lastName}`,
				resortName: validatedData.resortName,
				countryId: validatedData.countryId,
				regionId: validatedData.regionId || null,
				website: validatedData.website || null,
				additionalInfo: validatedData.additionalInfo || null,
				status: 'pending'
			})
			.returning();

		// Send notification email to admin (via Telegram through email service)
		try {
			await emailService.send({
				to: 'admin@localsnow.org', // This will trigger Telegram notification via webhook
				subject: 'New Resort Request',
				html: `
					<h2>New Resort Request</h2>
					<p><strong>Requester:</strong> ${user.name} ${user.lastName} (${user.email})</p>
					<p><strong>Resort Name:</strong> ${validatedData.resortName}</p>
					<p><strong>Country ID:</strong> ${validatedData.countryId}</p>
					${validatedData.regionId ? `<p><strong>Region ID:</strong> ${validatedData.regionId}</p>` : ''}
					${validatedData.website ? `<p><strong>Website:</strong> ${validatedData.website}</p>` : ''}
					${validatedData.additionalInfo ? `<p><strong>Additional Info:</strong> ${validatedData.additionalInfo}</p>` : ''}
					<p><a href="https://localsnow.org/admin/resort-requests/${resortRequest.id}">Review Request</a></p>
				`,
				sendTelegram: true,
				telegramMessage: `🏔️ New Resort Request\n- Resort: ${validatedData.resortName}\n- From: ${user.name} ${user.lastName}\n- ID: #${resortRequest.id}`
			});
		} catch (emailError) {
			console.error('Failed to send resort request notification:', emailError);
			// Don't fail the request if email fails
		}

		return json({
			success: true,
			resortRequest: {
				id: resortRequest.id,
				status: resortRequest.status
			}
		});
	} catch (error) {
		console.error('Failed to create resort request:', error);

		if (error instanceof Error && 'issues' in error) {
			// Zod validation error
			return json({ error: 'Invalid request data', details: error }, { status: 400 });
		}

		return json({ error: 'Failed to create resort request' }, { status: 500 });
	}
};
