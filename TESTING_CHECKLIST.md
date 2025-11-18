# Pre-Deploy Testing Checklist

Run through this checklist before each production deployment. Takes ~15 minutes.

---

## Critical Flows (Must Pass)

### 1. Authentication
- [ ] Sign up with email works
- [ ] Login with email works
- [ ] Google OAuth login works
- [ ] Logout clears session
- [ ] Protected pages redirect to login when not authenticated

### 2. Booking Flow (Client)
- [ ] Can search instructors by resort
- [ ] Can view instructor profile
- [ ] Can select date/time slots
- [ ] Booking form validates required fields
- [ ] Stripe checkout opens correctly
- [ ] After payment, booking appears in dashboard
- [ ] Booking confirmation page shows correct details

### 3. Instructor Actions
- [ ] Can view incoming booking requests
- [ ] Can accept booking (creates calendar block)
- [ ] Can reject booking
- [ ] Can pay to unlock client contact info
- [ ] Contact info visible after payment

### 4. Review System
- [ ] Review form accessible 1h after lesson
- [ ] Can submit rating (1-5 stars)
- [ ] Can submit comment
- [ ] Review appears on instructor profile
- [ ] Deposit refund triggered on review submit

### 5. Admin Functions
- [ ] Admin dashboard loads with stats
- [ ] Can verify instructor
- [ ] Can suspend user
- [ ] Audit log records actions

---

## Secondary Flows (Should Pass)

### Profile Management
- [ ] Can edit profile info
- [ ] Can upload profile image
- [ ] Image appears correctly

### Availability
- [ ] Can set working hours
- [ ] Can connect Google Calendar
- [ ] Calendar blocks show correctly

### Instructor Search
- [ ] Filters work (resort, sport, language)
- [ ] Sort options work
- [ ] Results update correctly

---

## Quick Smoke Tests

```bash
# Check the app builds without errors
pnpm run build

# Check for TypeScript errors
pnpm run check

# Check linting passes
pnpm run lint
```

---

## Stripe Testing

Use these test cards in development:

| Scenario | Card Number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| Auth Required | 4000 0025 0000 3155 |

Expiry: Any future date
CVC: Any 3 digits

---

## Environment Verification

Before deploying, verify these are set in production:

```bash
# Required
DATABASE_URL          # PostgreSQL connection
STRIPE_SECRET_KEY     # Live key (sk_live_...)
STRIPE_WEBHOOK_SECRET # Production webhook secret
GOOGLE_CLIENT_ID      # OAuth credentials
GOOGLE_CLIENT_SECRET
R2_ACCOUNT_ID         # Cloudflare R2
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
N8N_WEBHOOK_URL       # Email service
CRON_SECRET           # Secure random string
PROJECT_URL           # https://localsnow.org
NODE_ENV=production
```

---

## Post-Deploy Verification

After deploying to production:

1. [ ] Homepage loads
2. [ ] Can log in
3. [ ] Instructor search works
4. [ ] Create a test booking (use test Stripe mode first!)
5. [ ] Check Docker logs for errors: `docker service logs localsnow_app`

---

## When to Add Automated Tests

Consider adding tests when:
- You have product-market fit and stop major pivots
- You hire another developer
- A critical bug makes it to production twice
- You're spending too much time on manual testing

Start with:
1. Payment webhook tests (mock Stripe)
2. Auth flow integration tests
3. Booking state machine tests
