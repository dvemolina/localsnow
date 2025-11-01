// src/routes/api/webhooks/stripe/+server.ts
import { json, error, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { LeadPaymentService } from '$src/features/Bookings/lib/leadPaymentService';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia'
});

const paymentService = new LeadPaymentService();

export const POST: RequestHandler = async ({ request }) => {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
        throw error(400, 'Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
        const body = await request.text();
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        throw error(400, 'Invalid signature');
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            
            if (session.metadata?.type === 'lead_payment' && session.payment_status === 'paid') {
                try {
                    await paymentService.handleSuccessfulPayment(session.id);
                    console.log('Lead payment processed successfully:', session.id);
                } catch (err) {
                    console.error('Error processing lead payment:', err);
                }
            }
            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('Payment failed:', paymentIntent.id);
            // You could update the payment status to 'failed' here if needed
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
};