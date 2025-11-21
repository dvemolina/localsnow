-- Add 'cancelled' value to the booking status enum
-- This value is already used throughout the codebase but was missing from the enum definition

-- Add the new enum value
ALTER TYPE status ADD VALUE IF NOT EXISTS 'cancelled';

-- Add comment explaining the status
COMMENT ON TYPE status IS
'Booking request status:
- pending: Awaiting payment/action
- viewed: Instructor has viewed the request
- accepted: Instructor has accepted
- rejected: Instructor has rejected
- cancelled: Client has cancelled
- expired: Request has expired
- completed: Lesson completed
- no_show: Client did not show up';
