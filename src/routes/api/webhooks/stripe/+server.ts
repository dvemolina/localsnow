import { json, type RequestHandler } from '@sveltejs/kit';
// TODO: Stripe imports kept for potential future monetization features
// import Stripe from 'stripe';
// import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$lib/server/config';

/**
 * Stripe Webhook Endpoint
 *
 * PAYMENT PROCESSING REMOVED - Platform is 100% free
 *
 * This endpoint is kept to:
 * 1. Acknowledge Stripe webhooks (prevent webhook failures in Stripe dashboard)
 * 2. Maintain infrastructure for potential future features
 * 3. Avoid breaking existing Stripe webhook configurations
 *
 * All booking requests have contactInfoUnlocked = true by default (set in booking creation)
 * No payment processing occurs - instructors receive full client contact info immediately
 */
export const POST: RequestHandler = async ({ request }) => {
    // Acknowledge webhook receipt
    // No payment processing - platform is 100% free
    console.log('Stripe webhook received (payment processing disabled - free platform)');

    // Return 200 OK to prevent webhook retry storms
    return json({
        received: true,
        message: 'Payment processing disabled - platform is 100% free'
    });
};
