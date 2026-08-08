import { describe, expect, it } from 'vitest';
import { toPublicAvailability } from './slotGenerationService';

describe('slotGenerationService public projection', () => {
	it('strips private block metadata from public availability API output', () => {
		const publicAvailability = toPublicAvailability([
			{
				date: '2027-01-04',
				dayOfWeek: 1,
				isWorkingDay: true,
				slots: [
					{
						date: '2027-01-04',
						startTime: '10:00',
						endTime: '11:00',
						status: 'blocked',
						blockSource: 'google_calendar',
						bookingId: 99
					},
					{
						date: '2027-01-04',
						startTime: '11:00',
						endTime: '12:00',
						status: 'available'
					}
				]
			}
		]);

		expect(publicAvailability).toEqual([
			{
				date: '2027-01-04',
				dayOfWeek: 1,
				isWorkingDay: true,
				slots: [
					{
						date: '2027-01-04',
						startTime: '10:00',
						endTime: '11:00',
						status: 'blocked'
					},
					{
						date: '2027-01-04',
						startTime: '11:00',
						endTime: '12:00',
						status: 'available'
					}
				]
			}
		]);
		expect(JSON.stringify(publicAvailability)).not.toContain('google_calendar');
		expect(JSON.stringify(publicAvailability)).not.toContain('bookingId');
		expect(JSON.stringify(publicAvailability)).not.toContain('99');
	});
});
