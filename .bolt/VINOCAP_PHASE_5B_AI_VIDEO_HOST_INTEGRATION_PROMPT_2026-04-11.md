# BOLT PROMPT — VINOCAP PHASE 5B: AI / VIDEO HOST INTEGRATION LAYER

**Status:** Active implementation prompt  
**Scope:** Host/video layer for the active campaign experience  
**Mode:** Replace the current host placeholder with a real host integration layer  
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
- campaign/QR foundation is implemented
- active campaign experience shell is implemented, including:
  - active campaign welcome
  - host/video placeholder block
  - first smart-question flow
  - recommendation/result shell
- `sans alcool` is now supported as an attribute, not a primary opening question
- build is currently clean

Do not break any of the above.

---

## PRIMARY GOAL

Replace the current host/video placeholder in the active campaign experience with a **real host integration layer** that feels like the beginning of the final scan experience.

This phase is built around the locked product flow:

**scan → campaign resolver → video/AI welcome → a few smart questions → relevant cards**

The resolver and experience shell already exist.

This phase must make the **hosted opening** feel real enough to demo, while keeping the implementation stable and future-ready.

---

## STRATEGIC INTENT

The user should feel that the scan opens onto a guided host presence.

Not necessarily a full conversational AI yet.
But definitely more than a static placeholder.

The host layer should feel like:
- campaign-aware
- intentional
- premium
- video/AI-ready
- naturally connected to the question flow

This is one of the highest-value wow layers because it is the first emotional moment after the scan.

---

## CRITICAL RULES

- Do **not** touch the Maxilocal homepage at `/`
- Do **not** break existing Vinocap routes/pages/cards
- Do **not** remove the campaign resolver
- Do **not** rebuild the question flow or result shell from scratch unless clearly necessary
- Do **not** redesign the whole site
- Do **not** build the full admin system yet
- Do **not** publish yet

This phase is about the **host integration layer**, not a platform-wide redesign.

---

## WHAT THIS PHASE MUST SOLVE

The active campaign experience now needs to answer:

1. What is the host layer the user sees after scanning?
2. How is the host connected to the campaign context?
3. How does the host introduce the experience?
4. How does the user move from host welcome into the existing question flow?
5. How can this later evolve into richer AI/video behavior without rewriting the rest?

---

## REQUIRED PRODUCT OUTCOME

After this phase, an active campaign QR should lead to:

1. campaign resolver
2. host/video welcome layer that feels real
3. clear handoff into the existing question flow
4. question flow
5. relevant cards

The host layer should be convincing enough for a demo shown to:
- Pierre Quinonero
- association members
- wineries
- institutional actors

---

## IMPLEMENTATION PRIORITIES

### 1. Audit the current active campaign experience shell
Inspect the current:
- `CampaignResolverPage`
- `ActiveCampaignExperience`
- host placeholder block
- campaign data available in the active experience
- question-flow transition logic

Determine the cleanest insertion point for the host layer.

### 2. Replace the placeholder with a real host component
Create a dedicated host component for the active campaign experience.

This host component should be:
- campaign-aware
- visually strong
- ready to accept later video or AI behavior
- clearly separated from the rest of the shell

Suggested examples:
- `CampaignHostIntro`
- `CampaignHostPanel`
- `CampaignGuideIntro`

Choose the cleanest naming for the current codebase.

### 3. Support a real host-mode structure
The host layer should support a structured configuration model, even if minimal for now.

Suggested host-related concepts:
- host name / role
- host label (sommelier, guide, butler, etc.)
- campaign intro text
- optional video URL / poster / media hook
- fallback text mode if no video is available
- CTA to continue into the guided questions

Do not overbuild a huge CMS.
But make the host layer configurable enough to prove the concept.

### 4. Integrate campaign-specific host content
If the campaign model already has `experience_key`, use it now as the hook for host behavior.

The goal is:
- different campaigns can later load different host personas / intros
- current implementation should already be compatible with that
- Vinocap 2026 can have a host identity without hardcoding the entire future system

### 5. Preserve the current question/results shell
Do not replace the working recommendation shell.

Instead:
- make the host the real opening layer
- then hand off into the existing question flow
- keep the current 2-question + results structure as the next step

### 6. Make the transition feel intentional
The movement from host welcome to question flow should feel designed, not abrupt.

This can be done through:
- a clear primary CTA
- optional short intro copy
- light animation if extremely simple and useful
- stronger visual staging

Do not add heavy complexity.

---

## PREFERRED HOST EXPERIENCE SHAPE

The active campaign experience should now feel something like:

### Stage 1 — Host welcome
- campaign/event label
- host identity or role
- host intro text
- optional media/video treatment or clearly media-ready surface
- CTA such as:
  - `Commencer`
  - `Lancer la découverte`
  - `Trouver les domaines qui vous correspondent`

### Stage 2 — Guided questions
Keep the existing question flow structure unless a small improvement is needed.

### Stage 3 — Relevant cards
Keep the existing recommendation/result shell unless a small improvement is needed.

---

## HOST COMPATIBILITY RULES

The host layer must be ready for future evolution into:
- embedded video host
- AI persona
- script-driven campaign intro
- speech/video greeting
- richer question handoff

So do not hardcode it in a way that makes later replacement difficult.

The rest of the shell should remain usable if the host media changes later.

---

## DATA / CONFIG GUIDANCE

Audit the cleanest place to store or derive host configuration.

Possible approaches:
- derive from `campaign.experience_key`
- small config map in code for now
- minimal campaign host config fields if truly needed

Only add schema/config complexity if necessary.

The safest rule is:
- use existing campaign data first
- introduce the smallest additional configuration mechanism second

---

## UX / PRODUCT RULES

- mobile-first is mandatory
- the host must feel appropriate for QR entry
- this should be emotionally stronger than the current placeholder
- the user should understand quickly what to do next
- the host should not overwhelm the scan flow with too much text
- the result should still feel premium and guided

---

## WHAT NOT TO DO

Do not:
- build the full conversational AI engine yet
- build the full admin campaign UI yet
- rebuild all recommendation logic
- redesign all Vinocap pages
- touch Maxilocal `/`
- overcomplicate media management
- publish

This phase is about the **host integration layer**, not the final AI platform.

---

## FUTURE COMPATIBILITY REQUIREMENT

The implementation must remain ready for later phases such as:
- richer AI sommelier/butler logic
- campaign-specific script branching
- host-specific question sets
- video + AI hybrid welcome
- scan/session-based personalization

This phase should make those future steps easier, not harder.

---

## REQUIRED OUTPUT

After implementation, return a strict file-aware report with these sections:

## 1. Summary
- what was added to make the host layer real

## 2. Files changed
- exact file paths
- what changed in each

## 3. Host experience structure
- what the user now sees in the host welcome layer

## 4. Campaign-aware behavior
- how the host layer now reads or responds to campaign context

## 5. Handoff into question flow
- how the host now transitions into the existing guided questions

## 6. Future compatibility
- how this implementation remains ready for richer AI/video logic later

## 7. Safety check
Confirm explicitly:
- Maxilocal `/` untouched
- existing Vinocap routes/pages/cards preserved
- resolver foundation preserved
- active campaign shell preserved and improved
- build still clean

Proceed carefully and keep the implementation guided, campaign-aware, and future-ready.
