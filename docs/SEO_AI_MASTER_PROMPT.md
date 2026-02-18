# Local Snow SEO Master Prompt (Copy/Paste)

Use this prompt in any AI tool to get a production-grade SEO strategy and execution plan for Local Snow.

## 1) Master Prompt

```text
You are my senior SEO strategist and organic growth lead for a two-sided marketplace: Local Snow (https://localsnow.org), a directory connecting skiers/snowboarders with local instructors.

Date context: February 14, 2026.

Business reality:
- MVP is live.
- Very low marketplace supply (few/no active instructor listings in many resorts).
- Goal is to compete against booking/lesson platforms (e.g., CheckYeti, Maison Sport) over time.
- We must avoid thin, doorway, or spammy SEO.
- We need strategy + practical execution with measurable milestones.

Brand positioning:
- Direct connection with instructors.
- Transparent, low-fee or no-platform-fee mindset.
- Local discovery and trust.

Tech context (important):
- Multilingual URLs (English + Spanish).
- Dynamic sitemap at /sitemap.xml.
- robots.txt exists.
- Strong technical SEO foundation already exists (canonical/hreflang/schema on core pages).
- Need content strategy, IA expansion, and authority building.

What I need from you right now:
1. Build a 12-month SEO growth strategy with 90-day sprint detail.
2. Prioritize for low inventory stage first (must still create indexable value).
3. Give a specific keyword universe by intent:
   - BOFU (high intent)
   - Comparison/alternative intent
   - MOFU/TOFU support content
4. Propose a page architecture we can realistically ship now.
5. Provide a first wave of exactly 30 pages (URL + primary keyword + search intent + brief outline + CTA type + internal links).
6. Include a blog strategy that directly supports conversion pages.
7. Include authority strategy (digital PR, partnerships, backlinks) without manipulative tactics.
8. Include SEO measurement framework (GSC + GA4 + weekly KPI dashboard + decision rules).
9. Include a content quality rubric (E-E-A-T + helpful content + anti-thin-content safeguards).
10. Include a technical QA checklist before publishing any page.

Critical constraints:
- Do NOT invent fake instructor inventory, fake reviews, fake stats, or fake claims.
- Do NOT produce generic advice. Everything must be marketplace-specific.
- Do NOT propose creating thousands of low-value location pages.
- Must be realistic for a small team/founder.
- If assumptions are needed, state them clearly.

Output format (strict):
- Section A: Executive strategy (1-page concise).
- Section B: 90-day roadmap (week-by-week).
- Section C: Keyword map (clustered by intent).
- Section D: 30-page launch plan table (exactly 30 rows).
- Section E: Blog/editorial calendar (12 weeks).
- Section F: Internal linking blueprint.
- Section G: Off-page/authority plan.
- Section H: Measurement/KPI framework.
- Section I: Risks + mitigation.
- Section J: “Next 7 days” tactical checklist.

Tone:
- Operator-level, no fluff.
- Specific and implementation-ready.

Before finalizing:
- Run a self-critique for: feasibility, thin-content risk, keyword cannibalization, and conversion alignment.
- Then provide a revised final plan.
```

## 2) Fill-In Brief Template (Use before running the prompt)

```text
Project: Local Snow
Domain: https://localsnow.org
Primary markets this quarter: [e.g., Spain + Andorra]
Priority language(s): [English, Spanish]
Current instructor count (published): [number]
Current school count (published): [number]
Top resorts we can support now (real only):
- [resort 1]
- [resort 2]
- [resort 3]

Business KPI priority (pick top 2):
- Qualified organic leads
- Instructor signups
- School signups
- Brand search growth
- Non-brand clicks

Operational capacity:
- New pages/week: [number]
- Blog posts/week: [number]
- Outreach hours/week: [number]

Do-not-target topics/markets:
- [list]

Known constraints:
- [legal/compliance/brand constraints]
```

## 3) First 30 Pages Blueprint (Starter Version)

Use this when you need a realistic first wave. Replace resorts/countries with real supply as needed.

### Cluster 1: Core money pages (6)
1. `/en/instructors` - ski instructors directory - BOFU - main conversion hub
2. `/es/instructores` - instructores de ski - BOFU - Spanish conversion hub
3. `/en/schools` - ski schools directory - BOFU - school discovery
4. `/es/escuelas` - escuelas de ski - BOFU - Spanish school discovery
5. `/en/how-it-works` - how to find ski instructor - MOFU - process trust page
6. `/es/como-funciona` - como encontrar instructor de ski - MOFU - process trust page

### Cluster 2: Comparison/alternative pages (4)
7. `/en/checkyeti-alternative` - checkyeti alternative - BOFU comparison
8. `/en/maison-sport-alternative` - maison sport alternative - BOFU comparison
9. `/es/alternativa-a-checkyeti` - alternativa a checkyeti - BOFU comparison
10. `/es/alternativa-a-maison-sport` - alternativa a maison sport - BOFU comparison

### Cluster 3: High-intent location pages (12)
11. `/en/resorts/spain/baqueira-beret/ski-instructors`
12. `/en/resorts/spain/baqueira-beret/snowboard-instructors`
13. `/en/resorts/spain/formigal-panticosa/ski-instructors`
14. `/en/resorts/spain/formigal-panticosa/snowboard-instructors`
15. `/en/resorts/spain/sierra-nevada/ski-instructors`
16. `/en/resorts/spain/sierra-nevada/snowboard-instructors`
17. `/es/estaciones/espana/baqueira-beret/instructores-esqui`
18. `/es/estaciones/espana/baqueira-beret/instructores-snowboard`
19. `/es/estaciones/espana/formigal-panticosa/instructores-esqui`
20. `/es/estaciones/espana/formigal-panticosa/instructores-snowboard`
21. `/es/estaciones/espana/sierra-nevada/instructores-esqui`
22. `/es/estaciones/espana/sierra-nevada/instructores-snowboard`

### Cluster 4: Conversion-support content pages (8)
23. `/en/private-ski-lessons-cost-spain`
24. `/es/precio-clases-particulares-esqui-espana`
25. `/en/how-to-choose-a-ski-instructor`
26. `/es/como-elegir-instructor-de-esqui`
27. `/en/ski-school-vs-independent-instructor`
28. `/es/escuela-de-esqui-vs-instructor-independiente`
29. `/en/first-ski-lesson-checklist`
30. `/es/checklist-primera-clase-de-esqui`

Note:
- If translated slugs differ in your router, map to your actual localized route system.
- If a resort has no supply yet, keep the page but add honest copy + waitlist CTA + instructor signup CTA.

## 4) Page Brief Prompt (Per-Page Production Prompt)

Use this to generate one production page brief at a time:

```text
Create a production-grade SEO + content brief for this page:

URL: [insert URL]
Primary keyword: [insert keyword]
Secondary keywords: [insert list]
Search intent: [BOFU/MOFU/TOFU]
Target locale/language: [en/es]
Business goal: [lead/instructor signup/school signup]
Current inventory status: [low/medium/high]

Return:
1) Title tag (<=60 chars) - 3 variants
2) Meta description (<=155 chars) - 3 variants
3) H1 options - 3 variants
4) Full H2/H3 outline
5) Required trust blocks (proof, transparency, safety, verification)
6) CTA copy blocks (primary + secondary)
7) FAQ section (5-8 Q&A)
8) Internal links in/out (exact anchors)
9) JSON-LD recommendation
10) Content quality checklist (E-E-A-T + helpful content)
11) What NOT to say (compliance + anti-overclaim)
```

## 5) 12-Week Editorial Engine Prompt

```text
Build a 12-week editorial calendar for Local Snow where every article supports a conversion page.

Rules:
- 1-2 posts/week max.
- 70% BOFU-supporting local intent.
- 20% comparison/decision intent.
- 10% broad educational.
- Every post must include: target keyword, intent, target page to link to, CTA, schema type, and distribution plan.

Output as table with:
- Week
- Post URL slug
- Working title
- Primary keyword
- Intent
- Linked money page
- CTA objective
- Brief outline
- Publish owner
```

## 6) Weekly SEO Operating Cadence (for AI assistant)

```text
Act as my weekly SEO operator for Local Snow.

Every week, do these steps:
1) Review KPI snapshot (impressions, clicks, CTR, avg position, indexed pages).
2) Identify 3 pages to improve CTR.
3) Identify 3 pages to improve rankings via content depth/internal links.
4) Propose 2 new pages from keyword gap.
5) Propose 5 outreach targets for backlinks/mentions.
6) Output a one-week action list with owner, effort, and expected impact.

Use practical, founder-friendly sequencing.
```

## 7) Minimum Production Quality Gate

Any AI-generated plan/page is rejected unless it passes all:
- Clear target keyword + intent match.
- Unique value not duplicate of another page.
- Honest claims (no fake inventory/social proof).
- Strong internal link placement.
- Primary CTA and secondary CTA defined.
- Title/meta/H1 aligned and non-cannibalizing.
- Schema recommendation included.
- Measurement plan attached.

