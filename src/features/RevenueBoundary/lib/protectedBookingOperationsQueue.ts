export type ProtectedBookingOperationInput = {
	bookingId: number;
	clientName: string;
	clientEmail: string | null;
	requestedInstructorName: string;
	startDate: Date | string;
	createdAt: Date | string;
	numberOfStudents: number;
	sportLabels: string[];
	bookingStatus: string | null;
	depositStatus: string | null;
	protectedTotal: string | number | null;
	currency: string | null;
};

export type ProtectedBookingOperationStatus =
	| 'payment_pending'
	| 'confirm_requested_instructor_first'
	| 'requested_instructor_confirmed'
	| 'replacement_or_refund_needed'
	| 'refund_completed'
	| 'closed';

export type ProtectedBookingOperationItem = {
	bookingId: number;
	clientName: string;
	clientEmail: string | null;
	requestedInstructorName: string;
	startDate: Date | string;
	createdAt: Date | string;
	numberOfStudents: number;
	sportLabels: string[];
	protectedTotal: string;
	currency: string;
	status: ProtectedBookingOperationStatus;
	bookingStatus: string | null;
	depositStatus: string;
	priority: number;
	label: string;
	nextOperatorAction: string;
	exactInstructorRequired: false;
	payoutMode: 'manual';
	guaranteeCopy: string;
};

const NEEDS_REPLACEMENT_OR_REFUND = new Set(['rejected', 'cancelled', 'expired', 'no_show']);
const REQUESTED_INSTRUCTOR_CONFIRMED = new Set(['accepted', 'completed']);

export function buildProtectedBookingOperationsQueue(
	rows: ProtectedBookingOperationInput[]
): ProtectedBookingOperationItem[] {
	return rows
		.map(toProtectedBookingOperationItem)
		.filter((item): item is ProtectedBookingOperationItem => item != null)
		.sort((a, b) => a.priority - b.priority || Number(a.startDate) - Number(b.startDate));
}

function toProtectedBookingOperationItem(
	row: ProtectedBookingOperationInput
): ProtectedBookingOperationItem | null {
	if (!row.depositStatus || row.protectedTotal == null) {
		return null;
	}

	const status = getOperationStatus(row.bookingStatus, row.depositStatus);
	const meta = getOperationMeta(status, row.requestedInstructorName);

	return {
		bookingId: row.bookingId,
		clientName: row.clientName,
		clientEmail: row.clientEmail,
		requestedInstructorName: row.requestedInstructorName,
		startDate: row.startDate,
		createdAt: row.createdAt,
		numberOfStudents: row.numberOfStudents,
		sportLabels: row.sportLabels,
		protectedTotal: String(row.protectedTotal),
		currency: row.currency ?? 'EUR',
		status,
		bookingStatus: row.bookingStatus,
		depositStatus: row.depositStatus,
		priority: meta.priority,
		label: meta.label,
		nextOperatorAction: meta.nextOperatorAction,
		exactInstructorRequired: false,
		payoutMode: 'manual',
		guaranteeCopy:
			'Paid guarantee: confirm the requested instructor first; if they cannot serve, arrange a suitable replacement or refund.'
	};
}

function getOperationStatus(
	bookingStatus: string | null,
	depositStatus: string
): ProtectedBookingOperationStatus {
	if (depositStatus === 'refunded') return 'refund_completed';
	if (depositStatus === 'pending') return 'payment_pending';
	if (depositStatus === 'expired' || depositStatus === 'forfeited') return 'closed';

	if (NEEDS_REPLACEMENT_OR_REFUND.has(bookingStatus ?? '')) {
		return 'replacement_or_refund_needed';
	}

	if (REQUESTED_INSTRUCTOR_CONFIRMED.has(bookingStatus ?? '')) {
		return 'requested_instructor_confirmed';
	}

	return 'confirm_requested_instructor_first';
}

function getOperationMeta(
	status: ProtectedBookingOperationStatus,
	requestedInstructorName: string
): Pick<ProtectedBookingOperationItem, 'priority' | 'label' | 'nextOperatorAction'> {
	switch (status) {
		case 'replacement_or_refund_needed':
			return {
				priority: 1,
				label: 'Replacement/refund needed',
				nextOperatorAction:
					'The requested instructor cannot serve. Find a suitable replacement, ask client approval for any price increase, or refund.'
			};
		case 'confirm_requested_instructor_first':
			return {
				priority: 10,
				label: 'Confirm requested instructor first',
				nextOperatorAction: `Contact ${requestedInstructorName} first. If they cannot serve, find a suitable replacement before refunding.`
			};
		case 'payment_pending':
			return {
				priority: 20,
				label: 'Payment pending',
				nextOperatorAction: 'Wait for protected payment before starting paid guarantee operations.'
			};
		case 'requested_instructor_confirmed':
			return {
				priority: 30,
				label: 'Requested instructor confirmed',
				nextOperatorAction: 'Keep the lesson on track and leave instructor or school payout manual.'
			};
		case 'refund_completed':
			return {
				priority: 90,
				label: 'Refund completed',
				nextOperatorAction:
					'No further protected-booking action is needed unless the client rebooks.'
			};
		case 'closed':
			return {
				priority: 100,
				label: 'Closed',
				nextOperatorAction: 'No active protected-booking operation remains.'
			};
	}
}
