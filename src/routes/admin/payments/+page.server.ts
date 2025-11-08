// src/routes/admin/payments/+page.server.ts
import { db } from '$lib/server/db';
import { clientDeposits, leadPayments } from '$lib/server/db/schema';
import { sum, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Client deposits
	const deposits = await db.query.clientDeposits.findMany({
		limit: 50,
		orderBy: (deposits, { desc }) => [desc(deposits.createdAt)],
		with: {
			bookingRequest: {
				columns: {
					id: true,
					clientName: true,
					clientEmail: true
				}
			}
		}
	});

	// Lead payments
	const leadPaymentsList = await db.query.leadPayments.findMany({
		limit: 50,
		orderBy: (payments, { desc }) => [desc(payments.createdAt)],
		with: {
			bookingRequest: {
				columns: {
					id: true,
					clientName: true
				}
			},
			instructor: {
				columns: {
					id: true,
					name: true,
					lastName: true,
					email: true
				}
			}
		}
	});

	// Revenue stats
	const depositStats = await db
		.select({
			total: sum(clientDeposits.amount),
			count: count()
		})
		.from(clientDeposits);

	const leadStats = await db
		.select({
			total: sum(leadPayments.amount),
			count: count()
		})
		.from(leadPayments);

	return {
		deposits,
		leadPayments: leadPaymentsList,
		stats: {
			deposits: depositStats[0],
			leads: leadStats[0]
		}
	};
};
