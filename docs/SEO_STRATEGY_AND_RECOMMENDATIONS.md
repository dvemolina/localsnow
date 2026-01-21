# Local Snow - Comprehensive SEO Strategy & Recommendations

**Document Version:** 1.0
**Date:** 2026-01-21
**Target:** Rank #1 for snowsports instructor and school searches

---

## Executive Summary

This document outlines a complete SEO strategy for Local Snow to dominate search results for ski instructor and ski school queries. The focus is on creating strong **SEO silos**, optimal **URL structures**, comprehensive **schema markup**, and strategic **geographic targeting**.

**Current Status:** ✅ Good foundation with schema.org markup
**Opportunity:** 🚀 Implement geographic silos and enhanced internal linking

---

## 1. Current SEO Implementation Review

### ✅ What's Working Well

1. **Schema.org Markup**
   - Person schema for instructors (/instructors/[slug])
   - Organization schema for schools (/schools/[slug])
   - BreadcrumbList on all detail pages
   - AggregateRating for reviews
   - Offer schema for pricing

2. **Clean URL Structure**
   - `/instructors` and `/instructors/[slug]`
   - `/schools` and `/schools/[slug]`
   - `/resorts` directory exists

3. **Technical SEO Basics**
   - Canonical tags
   - Open Graph meta tags
   - Semantic HTML

### ⚠️ Current Limitations

1. **No Geographic Silo Structure**
   - Missing country/region/resort hierarchy in URLs
   - All instructors/schools in flat directory
   - No location-specific landing pages

2. **Weak Internal Linking**
   - Instructors don't link to their schools prominently (**NOW FIXED** ✅)
   - Schools don't appear on homepage (**NOW FIXED** ✅)
   - Resorts don't have dedicated instructor/school pages

3. **Missing LocalBusiness Schema**
   - Schools should use LocalBusiness type
   - Missing geographic coordinates
   - No service area markup

---

## 2. Recommended URL Structure & Silo Architecture

### 🎯 Primary Goal: Geographic Silos

Create clear geographic hierarchies that Google can understand and rank for local searches.

### Option A: Geographic-First (RECOMMENDED)

```
Homepage: /
├── /spain (Country landing)
│   ├── /spain/pyrenees (Region landing)
│   │   ├── /spain/pyrenees/baqueira-beret (Resort landing)
│   │   │   ├── /spain/pyrenees/baqueira-beret/instructors (Instructor listing for resort)
│   │   │   ├── /spain/pyrenees/baqueira-beret/schools (School listing for resort)
│   │   │   └── /spain/pyrenees/baqueira-beret/ski-lessons (Content page)
│   │   ├── /spain/pyrenees/formigal-panticosa
│   │   └── /spain/pyrenees/cerler
│   ├── /spain/sierra-nevada (Region landing)
│   └── /spain/catalunya
├── /instructors (Global directory - KEEP)
│   └── /instructors/[slug] (Individual instructor - KEEP)
├── /schools (Global directory - KEEP)
│   └── /schools/[slug] (Individual school - KEEP)
```

**Why this works:**
- ✅ Clear geographic hierarchy for Google
- ✅ Matches user search intent ("ski instructor baqueira beret")
- ✅ Strong topical relevance per page
- ✅ Easy internal linking within silos
- ✅ Keeps existing URLs (no redirect hell)

### Option B: Service-First (Current, Keep As-Is)

```
/instructors (Global listing)
/instructors/[slug] (Individual profiles)
/schools (Global listing)
/schools/[slug] (Individual profiles)
```

**Recommendation:** **Use BOTH approaches**
- Keep Option B for global discovery
- Add Option A for geographic targeting
- Use canonical tags to avoid duplicate content

---

## 3. Implementation Roadmap

### Phase 1: Immediate Wins (Completed ✅)

1. ✅ **Show School Names on Instructor Cards**
   - Display school affiliation with clickable link
   - Implemented with proper schema markup
   - Strengthens internal linking

2. ✅ **Featured Schools on Homepage**
   - Verified schools showcase
   - Schema.org ItemList markup
   - Increases school visibility

3. ✅ **Search Toggle (Instructors/Schools)**
   - User can switch search targets
   - Improves UX and conversion
   - More pageviews = better engagement metrics

### Phase 2: Geographic Silo Implementation (HIGH PRIORITY)

#### A. Create Resort Landing Pages

**File:** `/src/routes/[country]/[region]/[resort]/+page.svelte`

**Content Structure:**
```html
<h1>Ski Instructors & Schools in [Resort Name]</h1>
<section>
  <h2>Top Rated Ski Instructors in [Resort]</h2>
  <!-- Featured instructors for this resort -->
</section>

<section>
  <h2>Ski Schools in [Resort]</h2>
  <!-- Featured schools for this resort -->
</section>

<section>
  <h2>About [Resort Name]</h2>
  <!-- Brief resort description with keywords -->
  <ul>
    <li>Elevation: [min-max]m</li>
    <li>Best for: [beginner/intermediate/advanced]</li>
    <li>Season: [December-April]</li>
  </ul>
</section>

<section>
  <h2>Why Book a Ski Instructor in [Resort]?</h2>
  <!-- SEO content about benefits -->
</section>
```

**Schema Markup:**
```javascript
{
  "@context": "https://schema.org",
  "@type": "SkiResort",
  "name": "Baqueira Beret",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "Catalonia",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "42.7",
    "longitude": "0.9"
  },
  "hasMap": "URL to resort map",
  "offers": {
    "@type": "AggregateOffer",
    "description": "Ski lessons from certified instructors",
    "lowPrice": "45",
    "highPrice": "120",
    "priceCurrency": "EUR"
  }
}
```

#### B. Create Resort-Specific Instructor Listings

**File:** `/src/routes/[country]/[region]/[resort]/instructors/+page.svelte`

**Server Load:**
```typescript
export const load: PageServerLoad = async ({ params }) => {
  const { country, region, resort } = params;

  // Fetch instructors teaching at this specific resort
  const instructors = await instructorService.searchInstructors({
    resortSlug: resort,
    sortBy: 'rating_desc'
  });

  // Fetch resort details for breadcrumb and content
  const resortData = await resortService.getResortBySlug(resort);

  return {
    instructors,
    resort: resortData,
    country,
    region
  };
};
```

**SEO Elements:**
- **Title:** `Ski Instructors in ${resortName} | ${regionName} | LocalSnow`
- **Meta Description:** `Find certified ski and snowboard instructors in ${resortName}. ${count} local instructors. Book directly, no commission. From €${minPrice}/hour.`
- **H1:** `Ski & Snowboard Instructors in ${resortName}`
- **Canonical:** `https://localsnow.org/${country}/${region}/${resort}/instructors`

#### C. Create Region Landing Pages

**File:** `/src/routes/[country]/[region]/+page.svelte`

**Content:**
```html
<h1>Ski Instructors & Schools in [Region Name]</h1>
<p>Find certified instructors at [X] ski resorts across [Region]...</p>

<section>
  <h2>Popular Ski Resorts in [Region]</h2>
  <!-- Grid of resort cards -->
</section>

<section>
  <h2>About Skiing in [Region]</h2>
  <!-- Regional overview content -->
</section>
```

#### D. Create Country Landing Page

**File:** `/src/routes/[country]/+page.svelte`

**Content:**
```html
<h1>Ski Instructors & Schools in Spain</h1>
<section>
  <h2>Ski Regions in Spain</h2>
  <!-- Pyrenees, Sierra Nevada, etc. -->
</section>
```

### Phase 3: Schema Markup Enhancements

#### A. Update School Schema to LocalBusiness

**Current:** `Organization`
**Recommended:** `LocalBusiness` or `SportsActivityLocation`

```javascript
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "SportsActivityLocation"],
  "name": "Alpine Ski School Baqueira",
  "description": "Professional ski and snowboard instruction",
  "image": "URL to logo",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Baqueira Beret Resort",
    "addressLocality": "Baqueira-Beret",
    "addressRegion": "Catalonia",
    "postalCode": "25598",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "42.75",
    "longitude": "0.95"
  },
  "url": "https://localsnow.org/schools/alpine-ski-school-baqueira",
  "telephone": "+34-XXX-XXX-XXX",
  "email": "info@alpineskischool.com",
  "priceRange": "€€",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "42.75",
      "longitude": "0.95"
    },
    "geoRadius": "5000" // 5km
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47"
  },
  "member": [
    {
      "@type": "Person",
      "@id": "https://localsnow.org/instructors/john-smith",
      "name": "John Smith",
      "jobTitle": "Ski Instructor"
    }
  ]
}
```

#### B. Add Service Schema

For both instructors and schools:

```javascript
{
  "@type": "Service",
  "serviceType": "Ski Instruction",
  "provider": {
    "@type": "Person", // or LocalBusiness
    "name": "John Smith"
  },
  "areaServed": {
    "@type": "City",
    "name": "Baqueira-Beret"
  },
  "offers": {
    "@type": "Offer",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "60",
      "priceCurrency": "EUR",
      "unitText": "per hour"
    }
  }
}
```

#### C. Add FAQPage Schema

On resort landing pages and school/instructor profiles:

```javascript
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much do ski instructors cost in Baqueira Beret?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Private ski lessons in Baqueira Beret range from €45-120 per hour depending on instructor experience and lesson duration."
      }
    }
  ]
}
```

### Phase 4: Internal Linking Strategy

#### A. Bi-Directional Linking

1. **Instructors → Schools**
   - ✅ Already implemented on instructor cards
   - Add prominent section on instructor detail pages

2. **Schools → Instructors**
   - ✅ Already exists on school detail pages
   - Add "Our Team" schema with member links

3. **Resorts → Instructors/Schools**
   - Add "Find Instructors" and "Find Schools" sections
   - Link to geo-specific pages

4. **Instructors/Schools → Resorts**
   - Add "Teaching Locations" with resort links
   - Use structured data for areaServed

#### B. Breadcrumb Navigation

Update all pages to include geographic breadcrumbs:

```html
Home > Spain > Pyrenees > Baqueira Beret > Instructors > John Smith
```

With schema:
```javascript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsnow.org" },
    { "@type": "ListItem", "position": 2, "name": "Spain", "item": "https://localsnow.org/spain" },
    { "@type": "ListItem", "position": 3, "name": "Pyrenees", "item": "https://localsnow.org/spain/pyrenees" },
    { "@type": "ListItem", "position": 4, "name": "Baqueira Beret", "item": "https://localsnow.org/spain/pyrenees/baqueira-beret" },
    { "@type": "ListItem", "position": 5, "name": "Instructors", "item": "https://localsnow.org/spain/pyrenees/baqueira-beret/instructors" },
    { "@type": "ListItem", "position": 6, "name": "John Smith" }
  ]
}
```

#### C. Hub Pages

Create topic cluster hubs:

1. **[Resort] Ski Lessons Hub**
   - `/spain/pyrenees/baqueira-beret/ski-lessons`
   - Links to all instructors, schools, and lesson types
   - 1500+ word content piece

2. **Snowboard Lessons Hub**
   - `/spain/pyrenees/baqueira-beret/snowboard-lessons`
   - Links to snowboard-specific instructors

3. **Beginner Lessons Hub**
   - Content targeting "beginner ski lessons [resort]"

### Phase 5: Geographic Targeting & Hreflang

#### A. Hreflang Tags (Multi-language)

Already using `/en/` and `/es/` URLs. Ensure hreflang is implemented:

```html
<link rel="alternate" hreflang="en" href="https://localsnow.org/instructors/john-smith" />
<link rel="alternate" hreflang="es" href="https://localsnow.org/es/instructors/john-smith" />
<link rel="alternate" hreflang="x-default" href="https://localsnow.org/instructors/john-smith" />
```

#### B. Geographic Targeting in Search Console

Set up separate properties for:
- Spain (primary market)
- Future markets (France, Switzerland, Austria)

---

## 4. Content Strategy for SEO

### Keyword Targeting Strategy

#### Primary Keywords (High Volume, High Intent)

| Keyword | Search Intent | Target Page |
|---------|--------------|-------------|
| "ski instructor [resort name]" | Transactional | `/spain/[region]/[resort]/instructors` |
| "ski school [resort name]" | Transactional | `/spain/[region]/[resort]/schools` |
| "[resort name] ski lessons" | Transactional | `/spain/[region]/[resort]/ski-lessons` |
| "private ski instructor [resort]" | Transactional | `/spain/[region]/[resort]/instructors` |
| "snowboard instructor [resort]" | Transactional | `/spain/[region]/[resort]/instructors?sport=snowboard` |

#### Secondary Keywords (Medium Volume)

| Keyword | Search Intent | Target Page |
|---------|--------------|-------------|
| "best ski instructors in [resort]" | Informational | `/spain/[region]/[resort]/instructors` |
| "how to find ski instructor" | Informational | `/blog/how-to-find-ski-instructor` |
| "ski lesson prices [resort]" | Informational | `/spain/[region]/[resort]/prices` |
| "ski schools vs private instructors" | Informational | `/blog/schools-vs-private-instructors` |

#### Long-Tail Keywords (Low Competition, High Conversion)

- "english speaking ski instructor baqueira beret"
- "beginner ski lessons sierra nevada"
- "kids ski instructor formigal"
- "advanced snowboard coaching cerler"

### Content Types

1. **Location Landing Pages** (Priority 1)
   - Resort pages
   - Region pages
   - Country pages

2. **Service Pages** (Priority 2)
   - Ski lessons overview
   - Snowboard lessons overview
   - Kids lessons
   - Group vs private lessons

3. **Blog Content** (Priority 3)
   - Resort guides
   - "Best ski instructors in [resort]" (listicles)
   - Ski tips and tricks
   - Season updates

### Content Optimization Checklist

For every page:
- ✅ H1 contains primary keyword
- ✅ Meta title: 55-60 characters, keyword in first 30
- ✅ Meta description: 150-160 characters, includes CTA
- ✅ URL contains keyword (slug)
- ✅ First paragraph contains keyword
- ✅ Alt text on all images
- ✅ Internal links to related pages (3-5 minimum)
- ✅ Schema markup appropriate to page type
- ✅ Mobile-optimized
- ✅ Page speed < 3 seconds

---

## 5. Technical SEO Checklist

### Performance

- [ ] Core Web Vitals optimization
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Image optimization (WebP format)
- [ ] Lazy loading for images below fold
- [ ] CDN for static assets
- [ ] Minify CSS/JS

### Indexing

- [ ] XML sitemap generation
  - `/sitemap-instructors.xml`
  - `/sitemap-schools.xml`
  - `/sitemap-resorts.xml`
- [ ] Robots.txt optimization
- [ ] Canonical tags on all pages
- [ ] No duplicate content issues

### Structured Data

- [ ] Schema validation in Google Rich Results Test
- [ ] Breadcrumb markup on all pages
- [ ] Review markup where applicable
- [ ] Organization/Person markup
- [ ] LocalBusiness markup for schools

### Mobile SEO

- [ ] Mobile-first design (already using Tailwind)
- [ ] Touch-friendly elements (44x44px minimum)
- [ ] No horizontal scrolling
- [ ] Fast mobile page speed

---

## 6. Link Building Strategy

### Internal Links (Priority 1 - Full Control)

1. **Contextual Links**
   - Instructor bios link to their school
   - School profiles link to all their instructors
   - Resort pages link to instructors/schools at that resort

2. **Navigation Links**
   - Footer: Quick links to popular resorts
   - Header: Dropdown with top regions/resorts

3. **Related Content**
   - "Other instructors at [resort]" section
   - "Similar schools in [region]" section

### External Links (Priority 2 - Outreach Required)

1. **Resort Websites**
   - Get listed on official resort instructor directories
   - Offer to write guest posts about instruction

2. **Tourism Boards**
   - Regional tourism websites
   - "Things to do" sections

3. **Ski Forums & Communities**
   - Reddit (r/skiing, r/snowboarding)
   - SkiTalk forums
   - Local Facebook groups

4. **Travel Blogs**
   - Reach out to ski travel bloggers
   - Offer featured instructor profiles

5. **Local Business Directories**
   - Google Business Profile for schools
   - Yelp, TripAdvisor mentions
   - Local Spanish directories

### Link Acquisition Tactics

1. **Resource Page Link Building**
   - Find "ski resources" pages
   - Reach out with value proposition

2. **Digital PR**
   - "Best Ski Schools in Spain 2026" press release
   - Unique data/statistics about ski instruction market

3. **Partnerships**
   - Partner with equipment rental shops
   - Collaborate with accommodation providers

---

## 7. Measurement & KPIs

### Primary Metrics

1. **Organic Traffic**
   - Target: 10,000+ monthly visits within 12 months
   - Track by landing page type (resorts, instructors, schools)

2. **Keyword Rankings**
   - Track top 50 keywords in Search Console
   - Target: Rank #1-3 for "[resort] ski instructor" queries

3. **Click-Through Rate (CTR)**
   - Target: >3% average CTR from SERP
   - Optimize meta descriptions based on performance

4. **Conversion Rate**
   - Contact form submissions
   - Profile views → contact
   - Target: 5% conversion rate

### Secondary Metrics

- Domain Authority (Ahrefs/Moz)
- Backlink count
- Pages indexed
- Core Web Vitals scores
- Bounce rate per page type

### Tools

- Google Search Console (primary)
- Google Analytics 4
- Ahrefs or SEMrush (keyword tracking)
- Schema markup validator

---

## 8. Competitive Analysis

### Competitors

1. **GetYourGuide** - Activity marketplace
2. **Viator** - Tours & activities
3. **Resort-specific platforms** - Individual resort booking systems
4. **Local ski schools** - Direct competitors with their own sites

### Competitive Advantages

1. **Zero Commission** - Huge differentiator
2. **Direct Contact** - No middleman
3. **Verified Profiles** - Trust signal
4. **Multi-resort Coverage** - Aggregator advantage
5. **SEO Focus** - Most competitors don't optimize well

### Competitive Disadvantages

1. **Brand Recognition** - GetYourGuide has huge brand
2. **Marketing Budget** - Can't compete on paid ads
3. **Established Relationships** - Resorts trust existing partners

**Strategy:** Win on SEO and organic trust, not paid advertising.

---

## 9. Rollout Timeline

### Month 1-2: Foundation
- ✅ Implement school links on instructor cards
- ✅ Add featured schools to homepage
- ✅ Add search toggle
- [ ] Create first 5 resort landing pages
- [ ] Implement LocalBusiness schema for schools

### Month 3-4: Geographic Expansion
- [ ] Build out all Spanish resort pages (30+ resorts)
- [ ] Create region landing pages
- [ ] Implement breadcrumb navigation site-wide
- [ ] Add FAQPage schema to top pages

### Month 5-6: Content & Links
- [ ] Write 10 resort guide blog posts
- [ ] Reach out to 50 resort websites for links
- [ ] Submit to tourism directories
- [ ] Create "Best of" listicles

### Month 7-12: Scale & Optimize
- [ ] Expand to France (if applicable)
- [ ] A/B test meta descriptions
- [ ] Create video content (if possible)
- [ ] Continue link building outreach

---

## 10. Priority Actions (Start Immediately)

### 🔥 Critical (Do This Week)

1. **Create Resort Landing Pages**
   - Start with top 5 Spanish resorts
   - Basic template: resort info + instructor/school listings

2. **Add LocalBusiness Schema to Schools**
   - Update schema.org markup
   - Include geo coordinates
   - Add aggregate ratings

3. **Fix Missing Alt Text on Images**
   - Audit all pages
   - Add descriptive alt text with keywords

### ⚡ High Priority (Do This Month)

1. **Build Geographic Silo Structure**
   - Implement `/[country]/[region]/[resort]` routes
   - Create breadcrumb component
   - Update internal links

2. **Generate XML Sitemaps**
   - Separate sitemaps for each content type
   - Submit to Search Console

3. **Content Audit**
   - Identify thin content pages
   - Expand to 300+ words minimum

### 📈 Medium Priority (Do Next Quarter)

1. **Blog Launch**
   - Resort guides
   - SEO-optimized articles

2. **Link Outreach Campaign**
   - Resort partnerships
   - Tourism boards

3. **Performance Optimization**
   - Image compression
   - Code splitting

---

## 11. SEO Best Practices Summary

### URL Structure Best Practices

✅ **DO:**
- Use geographic hierarchy: `/spain/pyrenees/baqueira-beret/instructors`
- Keep URLs short and readable
- Use hyphens (not underscores)
- Include primary keyword in URL
- Use lowercase only

❌ **DON'T:**
- Don't use query parameters for main content (`?instructor_id=123`)
- Don't nest too deeply (max 4-5 levels)
- Don't use special characters or spaces
- Don't change URLs without 301 redirects

### Internal Linking Best Practices

✅ **DO:**
- Link related content naturally
- Use descriptive anchor text (not "click here")
- Link from high-authority pages to new pages
- Create content hubs with spoke links
- Use breadcrumbs on every page

❌ **DON'T:**
- Don't over-optimize anchor text
- Don't link to every page from every page
- Don't hide links or use tiny text
- Don't link to noindexed pages

### Schema Markup Best Practices

✅ **DO:**
- Use specific types (LocalBusiness > Organization)
- Include all recommended properties
- Validate with Google's Rich Results Test
- Update schema when content changes
- Use JSON-LD format (not microdata)

❌ **DON'T:**
- Don't markup content not visible on page
- Don't use schema for spammy purposes
- Don't leave out required properties
- Don't mix multiple schema syntaxes

---

## 12. Expected Results & ROI

### Conservative Projections (12 Months)

- **Organic Traffic:** 5,000-10,000 monthly visits
- **Keyword Rankings:** 20-30 keywords in top 10
- **Leads Generated:** 50-100 monthly booking inquiries
- **Revenue Impact:** If 10% convert at avg €500 booking = €2,500-5,000/month

### Aggressive Projections (12 Months)

- **Organic Traffic:** 15,000-25,000 monthly visits
- **Keyword Rankings:** 50+ keywords in top 10
- **Leads Generated:** 200-300 monthly booking inquiries
- **Revenue Impact:** €10,000-15,000/month in bookings facilitated

### Long-term Vision (24+ Months)

- Dominate "ski instructor [resort]" searches for all major Spanish resorts
- Expand to France, Austria, Switzerland
- Build brand recognition as THE directory for ski instructors
- Potential to monetize with premium listings (while staying free for basic)

---

## Conclusion

Local Snow has a **strong foundation** for SEO success. The key to ranking #1 is implementing a clear **geographic silo structure** that matches user search intent, combined with comprehensive **schema markup** and strategic **internal linking**.

### The Winning Formula

1. **Geographic Silos:** `/country/region/resort/instructors`
2. **Rich Schema:** LocalBusiness + Person + Reviews + Breadcrumbs
3. **Internal Linking:** Instructors ↔ Schools ↔ Resorts
4. **Content Depth:** 500+ word landing pages for each resort
5. **Zero Competition:** Free model differentiates from paid platforms

**Next Step:** Implement Phase 1-2 over the next 2 months, then measure and iterate.

---

**Document Maintainer:** Claude
**Last Updated:** 2026-01-21
**Next Review:** Quarterly after implementation begins
