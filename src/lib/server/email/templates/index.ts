/**
 * Export all email templates
 */

// User emails
export { signupWelcome } from './signup-welcome';
export { instructorContactForm } from './instructor-contact-form';

// Booking emails
export { bookingNotificationInstructor } from './booking-notification-instructor';
export { bookingConfirmationClient } from './booking-confirmation-client';
export { bookingContactInfo } from './booking-contact-info';
export { bookingCancellationInstructor } from './booking-cancellation-instructor';
export { bookingCancellationClient } from './booking-cancellation-client';

// School emails
export { schoolInstructorInvitation } from './school-instructor-invitation';
export { schoolApplication } from './school-application';
export { schoolInstructorAccepted } from './school-instructor-accepted';
export { schoolInstructorRejected } from './school-instructor-rejected';
export { schoolInvitationAccepted } from './school-invitation-accepted';
export { schoolInstructorDeactivated } from './school-instructor-deactivated';
