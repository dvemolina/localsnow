import { db } from "$lib/server/db";
import { bookingRequests, leadPayments } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$lib/server/config';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover'
});

const LEAD_PRICE = 5; // €5 per lead
const CURRENCY = 'eur';

export class LeadPaymentService {
    async createCheckoutSession(bookingRequestId: number, instructorId: number, successUrl: string, cancelUrl: string) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: CURRENCY,
                            product_data: {
                                name: 'Booking Request Contact Information',
                                description: `Unlock contact details for booking request #${bookingRequestId}`,
                            },
                            unit_amount: LEAD_PRICE * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl,
                metadata: {
                    bookingRequestId: bookingRequestId.toString(),
                    instructorId: instructorId.toString(),
                    type: 'lead_payment'
                }
            });

            await db.insert(leadPayments).values({
                bookingRequestId,
                instructorId,
                amount: LEAD_PRICE.toString(),
                currency: CURRENCY,
                stripeCheckoutSessionId: session.id,
                status: 'pending'
            });

            return {
                sessionId: session.id,
                url: session.url
            };
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw new Error('Failed to create payment session');
        }
    }

    async handleSuccessfulPayment(sessionId: string) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            
            if (session.payment_status === 'paid') {
                const bookingRequestId = parseInt(session.metadata?.bookingRequestId || '0');
                
                // Update payment status
                await db.update(leadPayments)
                    .set({ 
                        status: 'paid',
                        paidAt: new Date(),
                        stripePaymentIntentId: session.payment_intent as string,
                        updatedAt: new Date()
                    })
                    .where(eq(leadPayments.stripeCheckoutSessionId, sessionId));
                
                // Mark booking request as unlocked
                await db.update(bookingRequests)
                    .set({ contactInfoUnlocked: true })
                    .where(eq(bookingRequests.id, bookingRequestId));
                
                return {
                    success: true,
                    bookingRequestId
                };
            }
            
            return { success: false };
        } catch (error) {
            console.error('Error handling successful payment:', error);
            throw new Error('Failed to process payment');
        }
    }

    async getPaymentByBookingRequest(bookingRequestId: number) {
        const result = await db.select()
            .from(leadPayments)
            .where(eq(leadPayments.bookingRequestId, bookingRequestId));
        
        return result[0] ?? null;
    }

    async hasInstructorPaidForLead(bookingRequestId: number, instructorId: number) {
        const payment = await db.select()
            .from(leadPayments)
            .where(eq(leadPayments.bookingRequestId, bookingRequestId));
        
        return payment.some(p => p.status === 'paid' && p.instructorId === instructorId);
    }
}