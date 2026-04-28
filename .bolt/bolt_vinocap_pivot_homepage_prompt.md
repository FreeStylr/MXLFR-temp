# BOLT PROMPT — HOMEPAGE PIVOT ONLY

## MODEL
Claude Sonnet 4.6

## TASK TYPE
Low-risk homepage content/UI reshaping only.

## STRICT DIRECTIVE
Do **not** redesign the app.
Do **not** change routes.
Do **not** change logic.
Do **not** change the QR flow.
Do **not** change the video.
Do **not** change the scan behavior.
Do **not** change data models.
Do **not** change backend code.
Do **not** change winery-detail behavior.
Do **not** remove Vinocap or territorial/event language.
Do **not** modify anything that is not explicitly listed below.

This is a **homepage-first hierarchy and messaging pivot** only.
The goal is to make the first page feel more like a premium, app-like, high-value platform for wineries, while preserving the existing experience and keeping Vinocap/territorial value visible.

---

## OBJECTIVE
Reposition the homepage so that it reads in this order:

1. **Maxilocal is the platform / vehicle**
2. **The vigneron gets the direct commercial benefit first**
3. **Vinocap and the territory still benefit and remain visible**

The homepage should feel less like an event microsite and more like a premium direct-access platform.

Keep the current visual identity, existing routing, and current scan/video mechanics.
Only tighten hierarchy, wording, CTA emphasis, and card action visibility.

---

## WHAT MUST STAY UNCHANGED
- QR code logic
- Video logic and video content
- Scan entry flow
- Existing routes and navigation behavior
- Existing data fetching and state logic
- Existing winery cards overall structure
- Existing discovery/browsing mechanics
- Existing winery pages and domain detail flow
- Any backend/database/API code
- Any non-homepage functionality unless directly required for the exact CTA labels or homepage section text

---

## WHAT TO CHANGE

### 1. HERO — CHANGE THE PROMISE
The hero must pivot away from an event-first reading.
It must now present Maxilocal as a premium local access platform for wineries.

Use this exact headline and subheadline unless a tiny layout adjustment is required.

**H1:**
Le domaine entre dans le quotidien. Son vin est à portée immédiate.

**Subheadline:**
Présence locale quotidienne, accès direct au domaine, et parcours simple jusqu’à la découverte ou la commande.

### 2. HERO CTA BUTTONS
Replace the current hero CTA labels only if needed to match the following structure:

**Primary CTA:**
Je suis vigneron

**Secondary CTA:**
Découvrir les domaines

Do not change the CTA destinations unless absolutely necessary. Reuse existing destinations/actions wherever possible.

### 3. ADD / REPLACE THE FIRST VALUE BLOCK UNDER THE HERO
Immediately under the hero, show 3 short premium value blocks/cards/tiles.
Do not create a heavy new section. Keep it compact and app-like.

Use the following exact structure:

**Card 1 title:**
Présence quotidienne

**Card 1 text:**
Votre domaine entre dans la vie réelle du territoire, au bon moment.

**Card 2 title:**
Accès direct

**Card 2 text:**
Le public vous trouve sans recherche, sans détour, sans distance.

**Card 3 title:**
Jusqu’à la boutique

**Card 3 text:**
En un scan, le public peut découvrir votre univers et aller jusqu’à votre boutique.

### 4. ADD A SHORT PLATFORM POSITIONING BLOCK
Add one short section below the 3 gains.
It must make Maxilocal feel like a platform, not just a campaign page.
Keep it concise.

**Title:**
Une nouvelle plateforme locale d’accès direct aux producteurs

**Body:**
Maxilocal rapproche radicalement les domaines et le public, à travers une présence quotidienne, un accès mobile immédiat et une logique simple d’activation.

### 5. KEEP VINOCAP / TERRITORIAL BENEFIT VISIBLE
Do **not** remove Vinocap.
Do **not** hide the territorial/event benefit.
Instead, move it one level below the vigneron-first benefit.
This should remain clearly visible on the homepage.

Add a short section with this structure:

**Title:**
Une offre qui bénéficie aussi au territoire et à l’événement

**Body:**
Pendant la phase de lancement, la face avant peut mettre en valeur Vinocap, un partenaire territorial ou un temps fort local, pendant que les domaines profitent d’un bénéfice direct à l’arrière.

### 6. ADD A CLEAR PRODUCER ENTRY STRIP
Somewhere near the top half of the homepage, add a concise winery-facing prompt.
Keep it visually integrated with the current design.

**Title:**
Vous êtes vigneron ?

**Body:**
Activez votre présence locale et votre accès direct au public.

**Button:**
Voir l’offre domaine

Reuse an existing route/action if possible. Do not invent a new backend flow.
If needed, this can scroll to an existing relevant section rather than a new page.

### 7. UPDATE WINERY CARD ACTION EMPHASIS ONLY
Keep the current winery cards.
Do not redesign their structure.
Do not remove appellation/type/badge logic.
Do not change the image logic.

Only make the commercial/action layer more visible.

#### Card adjustments
- Make the main action button more prominent visually
- Keep the current card design intact otherwise
- Slightly reduce the visual dominance of secondary metadata if needed
- Add a short commercial micro-label above the CTA only if it fits cleanly

Use one of these micro-labels if the design supports it:
- Accès direct
- Boutique / infos / contact
- À portée immédiate

Use this CTA label unless a route/behavior constraint forces a safer wording:
**Découvrir le domaine**

If the existing route truly already supports shop/order discovery naturally, you may use:
**Découvrir & commander**

Do not fake e-commerce if it is not already supported by the current flow.

---

## DESIGN / FEEL DIRECTION
This is **not** a redesign.
It is a surface-level premium productization pass.

The homepage should feel:
- more app-like
- more premium
- more mobile-first
- more platform-like
- more direct-access / commercial
- less brochure-like
- less event-microsite-first

### Allowed visual adjustments
- tighten spacing in the first screen if helpful
- improve hierarchy
- make CTAs more visible
- make first-screen blocks feel more tappable/productized
- use small premium chips/badges if already consistent with the design system

### Forbidden visual changes
- no new visual system
- no major layout rewrite
- no route changes
- no replacing the existing product identity
- no changes to the QR/video experience

---

## COPY PRIORITY / TONE
Use a premium, direct, founder-grade tone.
Short, confident, commercial, not brochure-like.

Prioritize this vocabulary:
- quotidien
- accès direct
- à portée immédiate
- domaine
- public
- boutique
- découverte
- activation
- territoire
- Vinocap

Avoid overexplaining.
Avoid turning the page into a long editorial narrative.
Keep the first screen compact and high-value.

---

## IMPLEMENTATION RULES
- Make the minimum number of code changes necessary
- Prefer editing existing homepage components/sections over creating new architecture
- Reuse existing components wherever possible
- Do not touch unrelated files
- Do not refactor for cleanliness unless required for this exact task
- Preserve current responsiveness and mobile usability
- Preserve existing behavior everywhere outside the explicitly requested text/UI emphasis changes

---
If any requested change would require touching unrelated logic, stop and only modify homepage copy, CTA labels, section order, and card CTA emphasis.
---

## OUTPUT REQUIRED FROM BOLT
After making the changes, report back with:

1. Exact files changed
2. Exact sections changed
3. Any CTA destination reused
4. Whether the winery-card CTA remained “Découvrir le domaine” or was changed to “Découvrir & commander”
5. Confirmation that QR/video/scan flow was left untouched
6. Confirmation that no routes or backend logic were changed

---

## FINAL REMINDER
This is a **homepage messaging and emphasis pivot only**.
It must feel like a more valuable, app-like, premium winery-access platform.
It must still visibly preserve the Vinocap / territorial / event promotional angle.
It must not alter any logic or functionality we did not explicitly request.
