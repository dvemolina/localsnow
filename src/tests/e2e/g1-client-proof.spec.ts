import { expect, test } from '@playwright/test';

test('G1 client proof path shows availability confidence and free/protected choices', async ({
	page
}) => {
	await page.goto('/en/instructors?resort=baqueira-beret');

	const firstProfileLink = page
		.getByRole('link')
		.filter({ hasText: /View Profile/i })
		.first();
	const profileCount = await firstProfileLink.count();
	test.skip(profileCount === 0, 'No seeded instructor result is available for the G1 smoke route');

	await firstProfileLink.click();

	await expect(
		page.getByText(/Available to request|Request availability|Availability not set/i).first()
	).toBeVisible();

	await page
		.getByRole('button', { name: /Contact instructor free/i })
		.first()
		.click();
	await expect(page.getByText(/Free direct request/i)).toBeVisible();
	await expect(page.getByText(/No LocalSnow fee/i)).toBeVisible();
	await page.keyboard.press('Escape');

	const protectedSupport = page.getByRole('button', { name: /Request protected booking/i }).first();
	if ((await protectedSupport.count()) > 0 && (await protectedSupport.isEnabled())) {
		await protectedSupport.click();
		await expect(page.getByText(/Protected booking request/i)).toBeVisible();
		await expect(
			page.getByText(/reschedules, finds another suitable instructor, or refunds/i)
		).toBeVisible();
		await expect(page.getByText(/approves the difference first/i)).toBeVisible();
		await expect(page.getByText(/Protected booking total before you pay/i)).toBeVisible();
		await expect(page.getByText(/one protected booking total/i)).toBeVisible();
		await expect(page.getByText(/separate LocalSnow protected booking fee/i)).toHaveCount(0);
	} else {
		await expect(
			page.getByRole('button', { name: /Use free request for now/i }).first()
		).toBeVisible();
		await expect(
			page.getByText(/protected support will be enabled profile by profile/i).first()
		).toBeVisible();
	}
});
