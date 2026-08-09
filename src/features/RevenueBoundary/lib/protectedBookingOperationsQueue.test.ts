import { describe, expect, it } from 'vitest';
import { buildProtectedBookingOperationsQueue } from './protectedBookingOperationsQueue';

describe('protectedBookingOperationsQueue', () => {
	const basePaidRequest = {
		bookingId: 77,
		clientName: 'Ana Client',
		clientEmail: 'ana@example.com',
		requestedInstructorName: 'Marta Snow',
		startDate: new Date('2026-02-10T09:00:00.000Z'),
		createdAt: new Date('2026-01-08T12:00:00.000Z'),
		numberOfStudents: 2,
		sportLabels: ['ski'],
		bookingStatus: 'pending',
		depositStatus: 'held',
		protectedTotal: '420.00',
		currency: 'EUR'
	};

	it('puts paid protected requests into the confirm-requested-instructor lane without blocking payment on exact instructor certainty', () => {
		const queue = buildProtectedBookingOperationsQueue([basePaidRequest]);

		expect(queue).toEqual([
			expect.objectContaining({
				bookingId: 77,
				status: 'confirm_requested_instructor_first',
				priority: 10,
				label: 'Confirm requested instructor first',
				nextOperatorAction:
					'Contact Marta Snow first. If they cannot serve, find a suitable replacement before refunding.',
				exactInstructorRequired: false,
				payoutMode: 'manual'
			})
		]);
	});

	it('moves rejected or cancelled paid requests into replacement-or-refund work before lower-priority confirmations', () => {
		const queue = buildProtectedBookingOperationsQueue([
			basePaidRequest,
			{
				...basePaidRequest,
				bookingId: 88,
				clientName: 'Bruno Client',
				bookingStatus: 'rejected'
			}
		]);

		expect(queue.map((item) => [item.bookingId, item.status, item.priority])).toEqual([
			[88, 'replacement_or_refund_needed', 1],
			[77, 'confirm_requested_instructor_first', 10]
		]);
		expect(queue[0].nextOperatorAction).toBe(
			'The requested instructor cannot serve. Find a suitable replacement, ask client approval for any price increase, or refund.'
		);
	});

	it('keeps confirmed and refunded protected bookings visible but lower priority', () => {
		const queue = buildProtectedBookingOperationsQueue([
			{
				...basePaidRequest,
				bookingId: 90,
				bookingStatus: 'accepted'
			},
			{
				...basePaidRequest,
				bookingId: 91,
				bookingStatus: 'cancelled',
				depositStatus: 'refunded'
			}
		]);

		expect(queue.map((item) => [item.bookingId, item.status, item.priority])).toEqual([
			[90, 'requested_instructor_confirmed', 30],
			[91, 'refund_completed', 90]
		]);
	});

	it('excludes bookings that have no LocalSnow client deposit because the free/direct route has no paid guarantee', () => {
		const queue = buildProtectedBookingOperationsQueue([
			{
				...basePaidRequest,
				bookingId: 99,
				depositStatus: null,
				protectedTotal: null
			}
		]);

		expect(queue).toEqual([]);
	});
});
