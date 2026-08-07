# Ski Network Product Boundaries — LocalSnow + SkiRelay

**Date:** 2026-08-07  
**Status:** Draft for CEO/product approval before further implementation  
**Scope:** Define how LocalSnow and SkiRelay work together without merging into one confused product.

---

## 1. CEO decision

LocalSnow and SkiRelay should not become one giant app.

They should share a small ski-instruction domain spine, while keeping separate product surfaces:

```txt
Shared ski domain spine
  -> canonical instructor/person/profile identity
  -> resorts, sports, credentials, languages
  -> availability/commitment engine
  -> offer/service primitives

LocalSnow
  -> public demand/acquisition surface
  -> SEO, resort pages, instructor/school profiles
  -> client inquiries, public services, optional protected booking

SkiRelay
  -> private supply/liquidity surface
  -> instructor availability, overflow classes, referrals, job board
  -> acceptance, completion, referral/payment trail
```

The company loop is:

```txt
Client demand appears in LocalSnow
  -> instructor can take it directly OR cannot take it
  -> if cannot take it, the opportunity can enter SkiRelay
  -> trusted instructor accepts
  -> lesson happens
  -> commission/protected-service value is justified
```

This is the bridge. Do not optimize for architectural elegance before this loop works.

---

## 2. Product jobs

### LocalSnow owns public demand

LocalSnow answers the client question:

> “Who can teach me or my group at this resort, and how do I contact/book them safely?”

LocalSnow should own:

- public homepage and SEO/resort pages;
- public instructor profiles;
- public school profiles;
- public services/lesson cards;
- client search/filtering;
- direct inquiry/contact;
- optional protected booking/rescheduling/help layer;
- reviews/social proof;
- public trust copy.

LocalSnow must keep its free/direct value ungated:

- instructors can get visibility without mandatory payment;
- clients can discover/contact directly where appropriate;
- monetization comes from optional protected/assisted value, not from blocking the core directory.

### SkiRelay owns private supply/liquidity

SkiRelay answers the instructor question:

> “Who can take this class, and how do we track the handoff/payment without WhatsApp chaos?”

SkiRelay should own:

- private instructor directory;
- private availability/status;
- job board/opportunity posting;
- direct assignment/claim/confirm flow;
- referrals;
- accepted/completed/cancelled state;
- referral/payment ledger;
- invite/vouch network growth.

SkiRelay MVP should remain independent-instructor-first. Schools can enter later as organizations/referrers only after the independent flow proves value.

---

## 3. Current repo reality

### LocalSnow current shape

Observed in `src/lib/server/db/schema.ts`:

- Users have broad public-directory roles:
  - `instructor-independent`
  - `instructor-school`
  - `school-admin`
  - `client`
- Schools are first-class:
  - `schools`
  - `schoolAdmins`
  - `schoolInstructors`
  - `schoolInstructorHistory`
  - `schoolSports`
  - `schoolResorts`
- Public geography/silos are first-class:
  - `countries`
  - `regions`
  - `resorts`
  - resort/sport combinations
- Bookings/leads/payments exist in a marketplace-ish shape:
  - `bookingRequests`
  - `instructorLeads`
  - `leadPayments`
  - `clientDeposits`
  - `reviews`
- Services/pricing are complex:
  - `lessons`
  - `conditionalPricing`
  - `promotionalPricing`
  - `groupPricingTiers`
  - `durationPackages`
  - `promoCodes`
- Availability exists as working hours plus calendar blocks:
  - `instructorWorkingHours`
  - `instructorCalendarBlocks`
  - `instructorGoogleTokens`

LocalSnow has more surface area than the current product proof needs. It was designed as a broad SEO/public directory and drifted toward marketplace complexity.

### SkiRelay current shape

Observed in `src/lib/server/db/schema.ts` and feature services:

- Instructors are compact and private-network oriented:
  - name, phone, IBAN/Bizum, sports, bio, avatar, status, resort slug, invite metadata
- Availability is simpler:
  - `availabilityConfig`: season start/end, working days, hours start/end
  - `availabilityBlocks`: date, optional start/end, reason, optional external calendar event id
- Referral/job flows are clearer:
  - `jobPosts`: sessions, sport, level, payment flow, agreed amount/hour, student info, status
  - `referrals`: sessions, from/to instructor, flow, agreed amount/hour, lesson price/hour, payment method/status, events
  - `referralEvents`: lifecycle audit trail

SkiRelay has the cleaner operational model for private instructor workflows.

---

## 4. Source-of-truth decision: availability / booking / scheduling

Moli’s instinct is right: availability/booking/scheduling is the strongest candidate for one shared source of truth.

But “availability” must be modeled in layers, because LocalSnow and SkiRelay use it differently.

### Decision

Use one shared **Availability + Commitments engine**, with product-specific visibility and interpretation.

Do not create two independent engines.

Do not copy/paste LocalSnow availability into SkiRelay or SkiRelay availability into LocalSnow without a boundary.

### Shared concepts

```txt
AvailabilityConfig
  instructorId
  seasonStart
  seasonEnd
  workingDays
  hoursStart
  hoursEnd
  timezone/resort context later

AvailabilityBlock
  instructorId
  start/end OR date/full-day
  source
  visibility
  reason/title
  externalCalendarEventId

Commitment
  instructorId
  sessions: [{ date, startTime, endTime }]
  sourceProduct: localsnow | skirelay | manual | google_calendar
  sourceRecordId
  status: tentative | confirmed | completed | cancelled | expired
  visibility: private | network | public-derived
```

The engine answers:

```txt
Can this instructor potentially work on this date/time?
What blocks or commitments occupy that time?
Is the conflict tentative or confirmed?
Should this fact be visible publicly, privately, or only as an availability state?
```

### LocalSnow interpretation

LocalSnow should not expose raw private calendar details.

It should show client-safe states:

- “Available to request”
- “Limited availability”
- “Request anyway”
- “Ask LocalSnow for help”
- eventually: exact bookable slots if the instructor enables them

LocalSnow commitments include:

- direct client inquiry/request;
- optional protected booking;
- pending booking hold;
- confirmed LocalSnow lesson;
- manual founder/concierge booking.

### SkiRelay interpretation

SkiRelay can expose more operational availability to trusted instructors.

It should show network-useful states:

- available;
- partially available;
- occupied;
- unavailable;
- rough blocks/notes if instructor allows;
- open jobs matching free time.

SkiRelay commitments include:

- accepted referral;
- claimed job-board post;
- manual block;
- Google Calendar block;
- possibly LocalSnow protected booking if relevant.

### Why SkiRelay’s design should lead

SkiRelay’s current model is simpler and closer to the real mountain workflow:

- season config;
- working days;
- working hours;
- blocks;
- sessions array;
- referral/job lifecycle;
- payment trail.

LocalSnow has useful concepts SkiRelay lacks:

- tentative holds / pending booking blocks;
- booking request/deposit lifecycle;
- public inquiry context;
- school/public profile relation.

So the mature target is not “use LocalSnow’s whole availability system” or “use SkiRelay exactly as-is.”

The mature target is:

> Start from SkiRelay’s simpler availability model, then add LocalSnow’s commitment/hold needs as explicit sources/statuses.

---

## 5. Services / lesson pricing / options

Services and pricing should be partially shared, not fully unified immediately.

### Shared primitive: Teaching Offer

Create/standardize a shared concept later:

```txt
TeachingOffer
  ownerType: instructor | school
  ownerId
  title
  sport
  level/audience
  resort/location scope
  duration options
  group size constraints
  base public price or “price on request”
  currency
  visibility: public | private-network | both
```

This is the offer someone teaches or sells.

### LocalSnow use

LocalSnow uses Teaching Offers as public service cards:

- “Private ski lesson”
- “Snowboard beginner lesson”
- “Half-day family lesson”
- “Full-day guided lesson”
- price shown or price-on-request
- direct inquiry/protected booking CTA

LocalSnow may need richer public pricing later, but current repo complexity should be reduced to what clients understand.

### SkiRelay use

SkiRelay should not depend on complex public service pricing.

For referrals, the critical fields are:

- sessions/date/time;
- sport;
- level;
- student/group notes;
- who collects from client;
- agreed amount per hour owed between instructors;
- optional lesson price per hour charged to client;
- payment method/status.

That is already close to the current SkiRelay model.

### Decision

Do not make LocalSnow’s complex pricing engine the shared canonical model yet.

Use this split:

```txt
Shared: basic TeachingOffer primitives and session duration/group constraints.
LocalSnow-only for now: public price display, packages, promos, protected booking price.
SkiRelay-only for now: referral economics, amount owed, who collects, payment due/status.
```

Later, if real bookings prove it, LocalSnow protected bookings and SkiRelay referrals can both write to a shared ledger/settlement layer. Not now.

---

## 6. Profile/account boundaries

### Shared person/instructor identity

The same real instructor should not exist as disconnected duplicates.

Shared canonical fields:

- legal/display name;
- phone/contact;
- email/user account link;
- avatar/photo;
- bio;
- sports;
- languages;
- qualifications/verification;
- resorts served;
- public/private status flags.

### Product-specific profile surfaces

LocalSnow public profile:

- SEO slug;
- public bio/copy;
- public services;
- public reviews;
- public contact/protected booking CTA;
- school affiliation if any.

SkiRelay private profile:

- trusted-network status;
- invite/vouch metadata;
- availability status;
- payment info like IBAN/Bizum;
- private referral history.

### Bridge: SkiRelay to LocalSnow

SkiRelay can be a supply acquisition channel for LocalSnow:

```txt
Instructor joins SkiRelay
  -> completes private operational profile
  -> is invited to publish a free LocalSnow profile
  -> chooses public fields/services/visibility
  -> LocalSnow gets more supply
```

This bridge should be explicit and permissioned. Joining SkiRelay must not automatically publish a public LocalSnow profile without instructor consent.

---

## 7. Schools boundary

### Decision

LocalSnow may include schools. SkiRelay MVP should stay independent-instructor-first.

### Why

Clients naturally search for both independent instructors and schools. That belongs in LocalSnow.

SkiRelay’s early workflow is instructor-to-instructor trust and class handoff. Adding schools too early creates extra complexity:

- organization permissions;
- managers vs instructors;
- commissions/liability;
- school-owned clients;
- staff calendars;
- brand politics.

### Later bridge

Schools can later enter SkiRelay as:

- organization account;
- overflow source;
- trusted referrer;
- multi-instructor availability pool.

But only after independent instructor relay proves real usage.

---

## 8. Data ownership matrix

| Domain | Source of truth | LocalSnow role | SkiRelay role | Decision |
|---|---|---|---|---|
| Person/user identity | Shared spine | public/client account link | private network account link | share eventually |
| Instructor profile basics | Shared spine | public profile read/publish | private profile read/write | share with visibility flags |
| Resorts/geography | LocalSnow currently; shared later | SEO/search source | simple resort slug/use | LocalSnow leads; SkiRelay maps to shared resort IDs later |
| Schools | LocalSnow | public school profiles | not MVP | LocalSnow-only for now |
| Availability config | Shared engine | read for client-safe availability/requesting | write/read for instructors | share, SkiRelay model leads |
| Blocks/calendar | Shared engine | write pending/confirmed bookings; hide details | write manual/private/calendar blocks | share with source + visibility |
| Booking/request | Product-specific, bridged | client lead/protected booking | can receive bridge opportunity | LocalSnow owns initial client demand |
| Job/opportunity | SkiRelay | can create bridge job when LocalSnow instructor unavailable | owns claim/assign/confirm | SkiRelay owns |
| Teaching offers/services | Shared primitive later | public services/pricing | simple session/job metadata | partial share, not full pricing engine |
| Pricing | Product-specific now | public/protected booking price | referral economics | do not fully unify yet |
| Payments/ledger | Product-specific now; shared later | client payment/deposit/commission | referral payment trail | separate now, ledger later |
| Reviews/trust | LocalSnow/public | verified public reviews | private trust/vouch later | separate now |

---

## 9. What not to build yet

Do not build yet:

- full app merge;
- full shared database migration;
- advanced public real-time booking calendar;
- full payment gateway unification;
- school admin system inside SkiRelay;
- complex LocalSnow pricing rules as shared law;
- automatic public profile publishing from SkiRelay without consent;
- broad SEO/silo expansion before Baqueira/client funnel works.

---

## 10. Recommended sequence

### Phase 0 — Product control

This document is the control baseline. Future implementation should classify work as:

- LocalSnow-only;
- SkiRelay-only;
- shared spine;
- bridge.

No more features should be added without this classification.

### Phase 1 — Fix LocalSnow client proof path

Goal:

```txt
Client searches Baqueira -> finds instructor -> profile -> sends inquiry successfully.
```

Fix only P0 trust/conversion blockers:

- card/profile navigation;
- contact modal/submission;
- resort filter label;
- profile role inconsistency;
- empty trust/list sections;
- first Playwright smoke test.

### Phase 2 — Compare and extract availability model

Create a small design/migration plan for a shared engine:

- keep LocalSnow and SkiRelay apps separate;
- choose canonical table/types;
- map LocalSnow working hours/calendar blocks to shared AvailabilityConfig/Block/Commitment;
- map SkiRelay availability config/blocks/referral sessions to same engine;
- decide integer vs UUID identity bridge before migrations.

Do not migrate production data until approved.

### Phase 3 — Build the first bridge

Recommended first bridge:

```txt
SkiRelay instructor -> publish/update LocalSnow public profile
```

Second bridge:

```txt
LocalSnow booking/request -> SkiRelay job post when original instructor cannot take it
```

### Phase 4 — Protected booking / settlement

Only after real client requests happen:

- define protected booking terms;
- decide fee/commission;
- create simple ledger events;
- add payment integration where it closes real money, not as architecture theatre.

---

## 11. Open CEO decisions

Moli should explicitly approve or correct these before implementation:

1. **Availability source of truth:** yes/no to one shared Availability + Commitments engine.
2. **Availability visibility:** should instructors be able to mark some availability as private-network-only and some as public-requestable?
3. **Exact booking promise:** should LocalSnow show exact bookable slots soon, or stay “request availability” until trust/supply is stronger?
4. **Services:** should the first public service model be simple cards/prices-on-request instead of advanced packages/promos?
5. **SkiRelay publishing:** should SkiRelay onboarding ask “Create free LocalSnow public profile?” as a core growth loop?
6. **Schools:** keep schools LocalSnow-only for MVP, yes/no?
7. **Payments:** keep LocalSnow client payments and SkiRelay referral payments separate until real transactions prove the ledger need, yes/no?

---

## 12. Mao recommendation

Approve this boundary:

```txt
One shared instructor/profile spine.
One shared availability/commitments engine.
Two separate product surfaces.
Partial shared teaching-offer primitive.
Separate payment flows until real money forces a ledger.
Schools in LocalSnow, not SkiRelay MVP.
SkiRelay supplies instructors into LocalSnow through explicit publish consent.
LocalSnow sends overflow/unserved demand into SkiRelay as the bridge.
```

This gives us the upside of unification without turning the products into a monster.
