import { ClientDepositRepository } from "./clientDepositRepository";
import { BookingRequestRepository } from "./bookingRequestRepository";
import { ReviewService } from "$src/features/Reviews/lib/reviewService";
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover'
});

const DEPOSIT_AMOUNT = 15; // €15 deposit
const CURRENCY = 'eur';
const DEPOSIT_EXPIRY_HOURS = 48;

export class ClientDepositService {

    private repository: ClientDepositRepository;
    private bookingRepository: BookingRequestRepository;
    private reviewService: ReviewService;

    constructor() {
        this.repository = new ClientDepositRepository();
        this.bookingRepository = new BookingRequestRepository();
        this.reviewService = new ReviewService();
    }

    /**
     * Create a held deposit record and update with payment intent
     * Used by webhook after successful payment
     */
    async createHeldDeposit(
        bookingRequestId: number,
        clientEmail: string,
        paymentIntentId: string
    ) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + DEPOSIT_EXPIRY_HOURS);

        const deposit = await this.repository.createDeposit({
            bookingRequestId,
            clientEmail,
            amount: DEPOSIT_AMOUNT.toString(),
            currency: CURRENCY,
            expiresAt
        });

        return await this.repository.updateDepositStatus(deposit.id, 'held', {
            stripePaymentIntentId: paymentIntentId
        });
    }
    
    /**
     * Create a Stripe Payment Intent for client deposit (held, not captured)
     */
    async createDepositPaymentIntent(bookingRequestId: number, clientEmail: string, successUrl: string, cancelUrl: string) {
        try {
            // Check if deposit already exists for this booking
            const existingDeposit = await this.repository.getDepositByBookingRequest(bookingRequestId);
            
            if (existingDeposit) {
                throw new Error('Deposit already exists for this booking request');
            }

            // Calculate expiry time (48 hours from now)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + DEPOSIT_EXPIRY_HOURS);

            // Create Stripe Checkout Session with payment intent
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: CURRENCY,
                            product_data: {
                                name: 'Booking Request Deposit',
                                description: '€15 refundable deposit - automatically refunded if no instructor accepts within 48h',
                            },
                            unit_amount: DEPOSIT_AMOUNT * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                payment_intent_data: {
                    capture_method: 'manual', // Don't capture immediately - hold the funds
                    metadata: {
                        bookingRequestId: bookingRequestId.toString(),
                        type: 'client_deposit',
                        clientEmail
                    }
                },
                success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl,
                customer_email: clientEmail,
                metadata: {
                    bookingRequestId: bookingRequestId.toString(),
                    type: 'client_deposit'
                }
            });

            // Create deposit record in database via repository
            const deposit = await this.repository.createDeposit({
                bookingRequestId,
                clientEmail,
                amount: DEPOSIT_AMOUNT.toString(),
                currency: CURRENCY,
                expiresAt
            });

            return {
                sessionId: session.id,
                url: session.url,
                depositId: deposit.id
            };
        } catch (error) {
            console.error('Error creating deposit payment intent:', error);
            throw new Error('Failed to create deposit payment session');
        }
    }

    /**
     * Handle successful deposit payment from Stripe
     */
    async handleSuccessfulDeposit(sessionId: string) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent']
            });
            
            if (session.payment_status === 'paid') {
                const bookingRequestId = parseInt(session.metadata?.bookingRequestId || '0');
                const paymentIntent = session.payment_intent as Stripe.PaymentIntent;

                // Get the deposit
                const deposit = await this.repository.getDepositByBookingRequest(bookingRequestId);
                if (!deposit) {
                    throw new Error('Deposit not found');
                }

                // Update deposit status to 'held'
                await this.repository.updateDepositStatus(deposit.id, 'held', {
                    stripePaymentIntentId: paymentIntent.id
                });
                
                return {
                    success: true,
                    bookingRequestId,
                    paymentIntentId: paymentIntent.id
                };
            }
            
            return { success: false };
        } catch (error) {
            console.error('Error handling successful deposit:', error);
            throw new Error('Failed to process deposit payment');
        }
    }

    /**
     * Capture deposit (forfeit to platform) - used for no-shows
     */
    async captureDeposit(depositId: number, reason: string = 'no_show') {
        try {
            const deposit = await this.repository.getDepositById(depositId);

            if (!deposit) {
                throw new Error('Deposit not found');
            }

            if (deposit.status !== 'held') {
                throw new Error(`Cannot capture deposit with status: ${deposit.status}`);
            }

            if (!deposit.stripePaymentIntentId) {
                throw new Error('No payment intent ID found');
            }

            // Capture the payment intent in Stripe
            await stripe.paymentIntents.capture(deposit.stripePaymentIntentId);

            // Update deposit status via repository
            await this.repository.updateDepositStatus(deposit.id, 'forfeited', {
                forfeitedAt: new Date()
            });

            return { success: true, depositId, reason };
        } catch (error) {
            console.error('Error capturing deposit:', error);
            throw new Error('Failed to capture deposit');
        }
    }

    /**
     * Refund deposit to client
     * REQUIRES a review to be left before refunding (unless reason is automatic like 'expired_no_acceptance')
     */
    async refundDeposit(depositId: number, reason: string = 'lesson_completed') {
        try {
            const deposit = await this.repository.getDepositById(depositId);

            if (!deposit) {
                throw new Error('Deposit not found');
            }

            if (deposit.status !== 'held') {
                throw new Error(`Cannot refund deposit with status: ${deposit.status}`);
            }

            if (!deposit.stripePaymentIntentId) {
                throw new Error('No payment intent ID found');
            }

            // Check if review is required for this refund
            const automaticRefundReasons = ['expired_no_acceptance', 'booking_rejected'];
            const requiresReview = !automaticRefundReasons.includes(reason);

            if (requiresReview) {
                // Check if review exists for this booking
                const hasReview = await this.reviewService.hasReview(deposit.bookingRequestId);

                if (!hasReview) {
                    throw new Error('A review is required before the deposit can be refunded');
                }
            }

            // Cancel the payment intent (releases the hold)
            await stripe.paymentIntents.cancel(deposit.stripePaymentIntentId);

            // Update deposit status via repository
            await this.repository.updateDepositStatus(deposit.id, 'refunded', {
                refundedAt: new Date()
            });

            return { success: true, depositId, reason };
        } catch (error) {
            console.error('Error refunding deposit:', error);
            throw new Error('Failed to refund deposit');
        }
    }

    /**
     * Get deposit by booking request ID
     */
    async getDepositByBookingRequest(bookingRequestId: number) {
        return await this.repository.getDepositByBookingRequest(bookingRequestId);
    }

    /**
     * Check and process expired deposits (for cron job)
     * Returns array of processed deposit IDs
     */
    async processExpiredDeposits() {
        try {
            const now = new Date();
            
            // Find all held deposits that have expired
            const expiredDeposits = await this.repository.getExpiredHeldDeposits(now);

            const processedDeposits: number[] = [];

            for (const { deposit, booking } of expiredDeposits) {
                // Check if booking was accepted (contact info unlocked)
                if (booking && !booking.contactInfoUnlocked) {
                    // No instructor accepted - refund the deposit
                    await this.refundDeposit(deposit.id, 'expired_no_acceptance');
                    processedDeposits.push(deposit.id);

                    // Mark booking as expired via booking repository
                    await this.bookingRepository.updateBookingStatus(deposit.bookingRequestId, 'rejected');
                }
            }

            return {
                success: true,
                processedCount: processedDeposits.length,
                depositIds: processedDeposits
            };
        } catch (error) {
            console.error('Error processing expired deposits:', error);
            throw new Error('Failed to process expired deposits');
        }
    }

    /**
     * Check if booking request has valid deposit
     */
    async hasValidDeposit(bookingRequestId: number): Promise<boolean> {
        const deposit = await this.repository.getDepositByBookingRequest(bookingRequestId);
        return deposit !== null && deposit.status === 'held';
    }

    /**
     * Get deposit status for display
     */
    async getDepositStatus(bookingRequestId: number) {
        const deposit = await this.repository.getDepositByBookingRequest(bookingRequestId);
        
        if (!deposit) {
            return { exists: false, status: null };
        }

        return {
            exists: true,
            status: deposit.status,
            amount: deposit.amount,
            currency: deposit.currency,
            expiresAt: deposit.expiresAt,
            refundedAt: deposit.refundedAt,
            forfeitedAt: deposit.forfeitedAt
        };
    }
}