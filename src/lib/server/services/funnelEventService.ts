import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { funnelEvents } from '$lib/server/db/schema';
import { getCookieConsentStatus, hasMeasurementConsent } from '$lib/server/consent';

type FunnelName = 'supply' | 'demand' | 'retention' | 'ops';

interface TrackFunnelEventInput {
	eventType: string;
	funnel: FunnelName;
	stage: string;
	entityType?: string | null;
	entityId?: number | null;
	userId?: number | null;
	sourcePath?: string | null;
	locale?: string | null;
	countryCode?: string | number | null;
	isSpain?: boolean;
	metadata?: Record<string, unknown>;
	requireConsent?: boolean;
}

function normalizeCountryCode(input?: string | number | null): string | null {
	if (input === null || input === undefined) return null;
	const value = String(input).trim();
	if (!value) return null;
	return value.toUpperCase();
}

function inferSpain(input: {
	countryCode: string | null;
	isSpain?: boolean;
	metadata?: Record<string, unknown>;
}): boolean {
	if (typeof input.isSpain === 'boolean') return input.isSpain;
	if (!input.countryCode) return false;

	// Support both ISO (ES) and Spain phone prefix (34).
	if (input.countryCode === 'ES' || input.countryCode === '34') return true;

	const countrySlug = input.metadata?.countrySlug;
	return typeof countrySlug === 'string' && countrySlug.toLowerCase() === 'spain';
}

async function track(event: RequestEvent, input: TrackFunnelEventInput): Promise<void> {
	try {
		const consentStatus = getCookieConsentStatus(event);
		const requiresConsent = input.requireConsent ?? true;

		if (requiresConsent && !hasMeasurementConsent(consentStatus)) {
			return;
		}

		const normalizedCountryCode = normalizeCountryCode(input.countryCode);
		const isSpain = inferSpain({
			countryCode: normalizedCountryCode,
			isSpain: input.isSpain,
			metadata: input.metadata
		});

		await db.insert(funnelEvents).values({
			eventType: input.eventType,
			funnel: input.funnel,
			stage: input.stage,
			entityType: input.entityType ?? null,
			entityId: input.entityId ?? null,
			userId: input.userId ?? null,
			sourcePath: input.sourcePath ?? event.url.pathname,
			locale: input.locale ?? event.locals.locale ?? null,
			countryCode: normalizedCountryCode,
			isSpain,
			consentStatus,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null
		});
	} catch (error) {
		console.error('[FunnelEventService] Failed to track event:', error);
	}
}

export const funnelEventService = { track };
