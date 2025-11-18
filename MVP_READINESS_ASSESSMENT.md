# LocalSnow MVP Readiness Assessment

**Date:** 2025-11-18
**Overall Status:** 70% Ready
**Estimated Time to Production:** 1-2 weeks with focused effort

---

## Executive Summary

LocalSnow is a **B2C ski instructor booking platform** targeting Spanish ski resorts (Baqueira-Beret, Formigal, Cerler, Sierra Nevada). The core business logic is complete and functional, but **critical security vulnerabilities** and **lack of testing** must be addressed before production launch.

### What's Working Well
- Complete booking-to-review workflow
- Stripe payment integration (deposits + lead payments)
- Google Calendar sync
- Admin dashboard with moderation tools
- Docker Swarm deployment infrastructure
- CI/CD with GitHub Actions

### What's Blocking Launch
1. **Security vulnerabilities** in 4 API endpoints
2. **Zero test coverage** - high regression risk
3. **120+ debug console.log statements** in production code
4. **Hardcoded production values** that need environment variables

---

## Feature Completion Status

### ✅ Complete (100%) - Ready for Production

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ | Google OAuth + email/password |
| Instructor Profiles | ✅ | Search, filters, public profiles |
| Booking System | ✅ | Full workflow: request → payment → confirmation |
| Deposit System | ✅ | €15 held, auto-refund on review |
| Lead Payments | ✅ | €5 to unlock client contact |
| Review System | ✅ | 1-5 stars, verified badge, stats |
| Availability Management | ✅ | Working hours + Google Calendar |
| Dynamic Pricing | ✅ | Groups, duration packages, promos |
| Admin Dashboard | ✅ | Metrics, verification, moderation |
| Audit Logging | ✅ | All admin actions tracked |
| Cloudflare R2 Storage | ✅ | Profile images, documents |
| Email Notifications | ✅ | n8n webhook infrastructure |
| Database Schema | ✅ | 25+ tables, normalized, relations |
| Docker Deployment | ✅ | Multi-stage build, health checks |
| CI/CD Pipeline | ✅ | GitHub Actions → Docker Swarm |

### ⚠️ Needs Work Before Launch

| Feature | Status | Issue |
|---------|--------|-------|
| Security | 50% | Missing auth checks on critical endpoints |
| Testing | 0% | No tests exist - critical gap |
| Debug Code Cleanup | 20% | 120+ console.log statements |
| Environment Config | 70% | Hardcoded values need externalization |
| Error Handling | 60% | No error boundaries, inconsistent responses |
| SEO | 30% | Missing meta tags, sitemap, robots.txt |
| Spanish Translation | 0% | i18n framework ready, translations missing |

---

## Critical Issues (Must Fix Before Launch)

### 1. Security Vulnerabilities - HIGH PRIORITY

#### Missing Authorization Checks

**`/src/routes/api/deposits/[depositId]/capture/+server.ts`**
- **Issue:** No authentication - anyone can capture any deposit
- **Impact:** Attackers can steal deposits
- **Fix:** Add `requireAuth(event)` and verify booking ownership

**`/src/routes/api/reviews/submit/+server.ts`**
- **Issue:** No validation that user owns the booking
- **Impact:** Fake reviews, manipulation
- **Fix:** Validate client email against booking, require auth

**`/src/routes/api/calendar/auth/callback/+server.ts:56-57`**
- **Issue:** Unsafe JSON.parse without error handling
- **Fix:** Add try-catch and state validation

#### Session Cookie Security

**`/src/lib/server/session.ts:71-74`**
- **Issue:** Missing security attributes on session cookie
- **Current:** Only sets `expires` and `path`
- **Fix:** Add `httpOnly: true, secure: true, sameSite: 'lax'`

#### Database SSL

**`/src/lib/server/db/index.ts:16`**
- **Issue:** SSL set to `rejectUnauthorized: false` in production
- **Impact:** Vulnerable to MITM attacks
- **Fix:** Change to `rejectUnauthorized: true`

#### Cron Endpoint

**`/src/routes/api/cron/availability/+server.ts:16`**
- **Issue:** Falls back to `'your-secret-token-here'` if env var missing
- **Fix:** Throw error instead of using default

---

### 2. No Test Coverage - HIGH PRIORITY

**Current State:** Zero tests found in entire codebase

- No `.test.ts` or `.spec.ts` files
- No test framework configured
- No test dependencies in package.json

**Impact:**
- Cannot verify critical payment flows
- High regression risk
- No CI/CD verification possible

**Recommendation:**
```bash
pnpm add -D vitest @testing-library/svelte @testing-library/jest-dom
```

Priority test coverage:
1. Auth flows (login, signup, OAuth)
2. Booking creation and payment
3. Review submission and refund
4. Authorization middleware
5. Rate limiting

---

### 3. Debug Code in Production - MEDIUM PRIORITY

**120+ console.log statements** found throughout codebase, including:

**Worst offenders:**

| File | Lines | Issue |
|------|-------|-------|
| `src/features/Availability/services/slotGenerationService.ts` | 40+ | Extensive emoji-based debug logging (🔍, 📅) |
| `src/routes/dashboard/lessons/+page.server.ts` | 20+ | Form data logging |
| `src/routes/api/bookings/webhooks/deposit-paid/+server.ts` | 15+ | Payment debug info |
| `src/routes/api/resorts/+server.ts` | 5+ | Data dump logging |

**Fix:** Replace with structured logger or remove

---

### 4. Hardcoded Values - MEDIUM PRIORITY

#### Stripe API Version (5 files)
- Hardcoded: `apiVersion: '2025-10-29.clover'`
- Files: `createDepositCheckoutSession.ts`, `createLeadCheckoutSession.ts`, `captureDepositPayment.ts`, `refundDeposit.ts`, `stripe webhook handler`
- **Fix:** Create single Stripe client config

#### Lead Price (2 files)
- Hardcoded: `$5` / `€5`
- **Fix:** Move to environment variable or database config

#### N8N Webhook
**`/src/lib/server/webhooks/n8n/email-n8n.ts:3`**
- Has TODO comment: "Delete the '-test' for production"
- **Fix:** Use environment variable

#### URLs
- `localsnow.org` and `localsnow.com` hardcoded in 5+ locations
- **Fix:** Use `PROJECT_URL` environment variable

---

## Moderate Issues (Fix After Initial Launch)

### Error Handling

- No `+error.svelte` error boundary pages
- Inconsistent error response formats
- Silent email failures (fire-and-forget)

**Recommendation:** Add error boundaries and standardize API error responses

### Logging

- Console-only logging (logs lost on restart)
- No log aggregation
- Potential sensitive data exposure

**Recommendation:** Implement Pino or Winston with structured logging

### SEO & Accessibility

- Missing meta descriptions
- No robots.txt or sitemap.xml
- No ARIA attributes
- No Open Graph tags

**Recommendation:** Add after core security fixes

### Spanish Translation

- i18n framework (Paraglide.js) is configured
- `messages/en.json` exists
- Need `messages/es.json` for Spanish market

---

## Action Plan

### Phase 1: Security Fixes (3-4 days)

- [ ] Add auth to `/api/deposits/[depositId]/capture`
- [ ] Add auth to `/api/reviews/submit`
- [ ] Fix session cookie security attributes
- [ ] Enable database SSL validation
- [ ] Remove cron secret fallback
- [ ] Fix calendar callback error handling

### Phase 2: Test Infrastructure (3-4 days)

- [ ] Install Vitest + Testing Library
- [ ] Configure test environment
- [ ] Write auth flow tests
- [ ] Write booking/payment tests
- [ ] Write review system tests
- [ ] Add CI test step

### Phase 3: Code Cleanup (2 days)

- [ ] Remove/replace 120+ console.log statements
- [ ] Centralize Stripe configuration
- [ ] Externalize hardcoded values
- [ ] Fix n8n webhook URL

### Phase 4: Deploy (1 day)

- [ ] Configure production environment variables
- [ ] Set up Stripe live keys
- [ ] Configure Google OAuth production
- [ ] Run database migrations
- [ ] Seed production data (resorts, sports)
- [ ] Test full booking flow

### Phase 5: Polish (Post-Launch)

- [ ] Add error boundaries
- [ ] Implement structured logging
- [ ] SEO optimization
- [ ] Spanish translation
- [ ] Monitoring (Sentry, GA)

---

## Technical Debt Summary

| Category | Count | Severity |
|----------|-------|----------|
| Security vulnerabilities | 6 | Critical |
| Missing tests | 100% | Critical |
| Console.log statements | 120+ | Medium |
| Hardcoded values | 15+ | Medium |
| TODO comments | 10+ | Low |
| Type `any` usage | 6+ | Low |

---

## Deployment Readiness

### What's Ready
- ✅ Dockerfile (multi-stage, optimized)
- ✅ docker-compose.prod.yml (Swarm config)
- ✅ GitHub Actions CI/CD
- ✅ Traefik reverse proxy + SSL
- ✅ Database migrations (Drizzle)
- ✅ Comprehensive DEPLOYMENT.md guide

### What You Need to Do
1. **Recover SSH access** to VPS (as you mentioned)
2. Configure GitHub Secrets:
   - `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
   - `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - All other env vars from `.env.example`
3. Set up Cloudflare DNS for domain
4. Configure Google OAuth production redirect URIs
5. Set up n8n workflows for cron jobs

---

## Risk Assessment

### High Risk (Address Before Launch)
- **Data breach** via missing auth checks
- **Payment fraud** via deposit manipulation
- **Session hijacking** via insecure cookies
- **Regression bugs** due to no tests

### Medium Risk (Monitor)
- **Performance** - N+1 queries in lessons page
- **Availability** - No error tracking
- **Data loss** - No backup strategy documented

### Low Risk (Can wait)
- SEO ranking
- Spanish translation
- Advanced analytics

---

## Conclusion

**LocalSnow has a solid foundation** with complete core features. The booking, payment, and review systems are well-implemented. The deployment infrastructure is production-grade.

**However, launching now would be risky** due to:
1. Security vulnerabilities that could lead to data breaches
2. Zero tests making changes dangerous
3. Debug code that could expose sensitive information

**Recommended approach:**
1. **Week 1:** Security fixes + basic test coverage
2. **Week 2:** Code cleanup + deployment
3. **Week 3+:** SEO, translation, monitoring

With focused effort on the critical issues, LocalSnow can be production-ready in **7-10 days**.

---

## Quick Reference: File Locations

### Critical Security Fixes
- `/src/routes/api/deposits/[depositId]/capture/+server.ts`
- `/src/routes/api/reviews/submit/+server.ts`
- `/src/lib/server/session.ts:71-74`
- `/src/lib/server/db/index.ts:16`
- `/src/routes/api/cron/availability/+server.ts:16`
- `/src/routes/api/calendar/auth/callback/+server.ts:56-57`

### Debug Code Cleanup
- `/src/features/Availability/services/slotGenerationService.ts`
- `/src/routes/dashboard/lessons/+page.server.ts`
- `/src/routes/api/bookings/webhooks/deposit-paid/+server.ts`

### Hardcoded Values
- `/src/lib/server/webhooks/n8n/email-n8n.ts:3`
- All Stripe-related files (API version)
