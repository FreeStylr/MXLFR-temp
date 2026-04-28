# BOLT PROMPT — VINOCAP PHASE 5A: ACTIVE CAMPAIGN EXPERIENCE SHELL

**Status:** Active implementation prompt  
**Scope:** Post-scan active campaign experience only  
**Mode:** Experience shell, question flow, recommendation logic foundation  
**Do not publish yet**

---

## CURRENT VERIFIED BASELINE

These points are already established and must remain intact:

- `/` serves the restored main Maxilocal homepage
- Vinocap is isolated under `/vinocap`
- real Vinocap routes exist, including:
  - `/vinocap`
  - `/vinocap/domaines`
  - `/vinocap/decouvrir`
  - `/vinocap/participer`
  - `/vinocap/terroir`
  - `/vinocap/carte/:slug`
  - `/vinocap/association/route-des-vignerons-et-des-pecheurs`
  - `/vinocap/invite/:token`
  - `/vinocap/q/:qrSlug`
- the association recognition layer is implemented
- onboarding has been hardened into a dossier workflow
- profile/card lifecycle has been clarified
- association/member mechanics have been refined
- former-member rule is encoded
- the campaign/QR foundation is now implemented, including:
  - `vinocap_campaigns`
  - `vinocap_campaign_qrs`
  - `vinocap_scan_events`
  - `resolveQR()`
  - `CampaignResolverPage`
  - differentiated resolver states: active / ended / not_yet_live / paused / invalid
- build is currently clean

Do not break any of the above.

---

## PRIMARY GOAL

Build the **active campaign experience shell** that comes after QR resolution for an active campaign.

This phase is built around the locked product flow:

**scan → campaign resolver → video/AI welcome → a few smart questions → relevant cards**

The resolver foundation already exists.

This phase should implement the **shell and logic structure** for the active experience, without attempting full AI integration yet.

---

## STRATEGIC INTENT

The user should not scan a QR and land on a generic page.

The active campaign experience should feel like:
- guided
- contextual
- campaign-specific
- mobile-first
- ready for a future AI sommelier / butler / host layer

This must feel like the beginning of a real interactive experience, not just a holding page.

---

## CRITICAL RULES

- Do **not** touch the Maxilocal homepage at `/`
- Do **not** break existing Vinocap routes/pages/cards
- Do **not** remove the campaign resolver
- Do **not** build the full AI/video integration yet
- Do **not** redesign the whole site
- Do **not** build the full admin system yet
- Do **not** publish yet

This phase is about the **experience shell and recommendation flow foundation**, not final AI execution.

---

## WHAT THIS PHASE MUST SOLVE

For an **active campaign**, the system must now answer:

1. What does the user see immediately after scanning?
2. How is the campaign introduced?
3. Where will the future video/AI host live?
4. What first questions are asked?
5. How do those answers influence which cards are shown?
6. How does the experience remain campaign-aware and zone-aware?

---

## REQUIRED PRODUCT OUTCOME

After this phase, an active QR scan should lead to a convincing structured experience such as:

1. active campaign welcome
2. host/video placeholder area
3. a few smart questions
4. filtered / prioritized relevant cards
5. a path into deeper exploration

The result should feel like a real guided discovery layer, even before the final AI host is installed.

---

## IMPLEMENTATION PRIORITIES

### 1. Audit the current active resolver state
Inspect the current `CampaignResolverPage` and determine:
- how the active state is currently rendered
- what can be preserved
- what should become the shell of the future hosted experience

### 2. Build the active campaign experience shell
For the `active` resolver state, create a proper experience surface with at minimum:

- campaign-aware hero/welcome block
- campaign context (event name, zone, current availability context)
- dedicated host/video placeholder area
- question flow area
- results/recommendation area

This should be mobile-first and designed for QR entry.

### 3. Add a host/video placeholder block
Do not integrate full AI/video yet.

Instead, create a clearly defined host block that can later be replaced by:
- video host
- AI butler/sommelier
- campaign-specific intro script

This block should feel intentional, not like a TODO box.

It should clearly correspond to the future “video/AI welcome” step.

### 4. Add the first smart-question layer
Implement a small, focused question flow that can influence the results shown.

Keep this lightweight but real.

Examples of acceptable questions:
- what are you looking for? (rosé / blanc / rouge / bulles / open)
- discovery mode or direct search?
- nearby / no preference?
- tasting / visit / purchase / explore?

Use the smallest useful question set that creates meaningful recommendation changes.

### 5. Add recommendation/result logic
Based on the selected answers, show relevant cards.

This does not need to be an advanced recommendation engine yet.
But it must be real enough to feel personalized.

The recommendation layer should be campaign-aware and future-ready for more advanced AI logic later.

### 6. Preserve direct exploration
The guided experience must not trap the user.

There should still be clear paths to:
- see recommended results
- explore all relevant domaines
- continue to broader discovery if desired

---

## PREFERRED EXPERIENCE SHAPE

For an active campaign, the shell should feel something like:

### Stage 1 — campaign welcome
- event/campaign label
- zone/date context if useful
- brief framing

### Stage 2 — host block
- future AI/video host placeholder
- a clear visual area reserved for the sommelier/butler/guide

### Stage 3 — quick question flow
- 2 to 4 focused questions
- mobile-first controls
- no long forms

### Stage 4 — relevant cards
- show cards filtered or prioritized by answers
- preserve a route into full exploration

### Stage 5 — continue exploring
- CTA to open broader domain list / route / terroir if wanted

---

## RECOMMENDATION LOGIC GUIDANCE

Keep the recommendation logic simple but meaningful.

Examples:
- wine type preferences influence matching cards
- “tasting” preference favors wineries with tasting/visit signals
- “buy” preference favors direct-purchase/where-to-buy signals
- campaign zone can be used as contextual emphasis
- association member cards can optionally be highlighted if that fits the campaign

Do not overbuild complex ranking.
The goal is believable guidance, not full ML.

---

## CAMPAIGN-AWARE RULES

The experience should read campaign context from the resolver result/campaign object.

It should be compatible with:
- future event campaigns
- future institutional campaigns
- future sponsor-led campaigns

Do not hardcode everything specifically to Vinocap if a more reusable campaign-aware structure is easy to achieve safely.

---

## UI / PRODUCT RULES

- mobile-first is mandatory
- this route opens from QR scans, so it must feel fast and obvious
- the experience should be more focused than the general `/vinocap` homepage
- do not overload it with too many sections
- the results should feel like answers to the user’s intent
- preserve a premium, guided feeling

---

## WHAT NOT TO DO

Do not:
- build the full AI video/voice layer yet
- build campaign admin screens yet
- redesign all Vinocap pages
- touch Maxilocal `/`
- rebuild unrelated routing
- add heavy analytics dashboards
- overcomplicate the recommendation model
- publish

This phase is about the **active campaign experience shell**, not the final host system.

---

## FUTURE COMPATIBILITY REQUIREMENT

The implementation must remain ready for the next intended phase:

**Active campaign shell → replace host placeholder with AI/video host**

So structure the active state in a way that makes later host insertion easy.

The host block should be replaceable without rewriting the rest of the flow.

---

## REQUIRED OUTPUT

After implementation, return a strict file-aware report with these sections:

## 1. Summary
- what was added to the active campaign experience

## 2. Files changed
- exact file paths
- what changed in each

## 3. Active experience structure
- what the user now sees after scanning an active campaign QR

## 4. Host placeholder
- where the future AI/video host now lives in the experience

## 5. Question flow
- what questions are asked
- how they affect the results

## 6. Recommendation logic
- how relevant cards are now selected or prioritized

## 7. Future compatibility
- how this shell is now ready for the future AI/video host layer

## 8. Safety check
Confirm explicitly:
- Maxilocal `/` untouched
- existing Vinocap routes/pages/cards preserved
- resolver foundation preserved
- build still clean

Proceed carefully and keep the implementation guided, mobile-first, and future-ready.
