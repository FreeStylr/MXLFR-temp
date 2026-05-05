# ARCHITECTURAL DNA EXTRACTION & AUDIT
## Project: Vinocap / Maxilocal Resonance
## Date: 2026-05-05

---

## 1. FULL SYSTEM BLUEPRINT

### 1.1 Stack Overview

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + TypeScript 5.5 |
| Build | Vite 5.4 |
| Routing | react-router-dom 7.14 |
| Styling | Tailwind CSS 3.4 + inline CSS-in-JS (mixed) |
| Icons | Lucide React 0.344 |
| Database | Supabase (PostgreSQL with RLS) |
| Edge Functions | Deno (Supabase Edge Runtime) |
| AI/Avatar | HeyGen Streaming Avatar SDK 2.1 |
| Email | Resend API |
| Hosting | Netlify (inferred from `_redirects` file) |

---

### 1.2 State Management

The application uses **no centralized state management library** (no Redux, Zustand, Jotai, or Context providers). State is handled via:

| Pattern | Usage |
|---------|-------|
| Component-local `useState` | Every page manages its own fetch lifecycle (loading, data, error) |
| React Router params | URL-driven state for campaign IDs, slugs, payment references, invite tokens |
| `sessionStorage` | Ops admin authentication (`vc_ops_granted`, `vc_ops_token`) |
| Prop drilling | Legacy `WineApp.tsx` passes `onNavigate`, `onViewCard` as callback props |
| URL as state | QR flow encodes campaign/QR resolution in URL segments (`/vin/q/:qrSlug`) |
| No shared global state | Each page fetches independently from Supabase on mount |

---

### 1.3 Core Logic & Algorithms

#### 1.3.1 QR Campaign Resolution (`src/vin/lib/campaigns.ts`)

```
resolveQR(qrSlug, entryPath, userAgent?, sessionKey?)
  -> lookup wine_campaign_qrs by qr_slug
  -> lookup wine_campaigns by campaign_id
  -> deriveScanResult(campaign):
       archived? -> 'archived'
       paused?   -> 'paused'
       end_at < now? -> 'ended'
       start_at > now? -> 'not_yet_live'
       else -> 'active'
  -> logScan(event) -> insert into wine_scan_events
  -> return { scanResult, campaign, qr }
```

#### 1.3.2 Wine Recommendation Engine (`src/vin/lib/recommendations.ts`)

```
scoreWinery(winery, preferences):
  +40 pts: wine type match (rouge/blanc/rose/bulles)
  +30 pts: visit intent match (tasting/purchase/visit availability)
  +bonus:  certifications (organic, bio, HVE, Terra Vitis)
  +bonus:  association membership badge

rankWineries(wineries, prefs, limit=6):
  filter by nonAlcoholicOnly if set
  score all
  sort descending
  return top N
```

#### 1.3.3 Profile Readiness Calculator (`src/vin/lib/profileReadiness.ts`)

```
computeProfileReadiness(profile):
  evaluate 12 criteria (8 required, 4 optional)
  isPreviewReady = all 8 required fields filled
  isPublicationReady = all required + completeness >= 75%
  return { checks, passedCount, totalCount, completenessPercent, isPreviewReady, isPublicationReady }
```

#### 1.3.4 Video Playback Gate (`src/vin/pages/QREntryPage.tsx`)

```
Hardened against premature browser 'ended' events:
  Guard 1: wall-clock elapsed >= 16,000ms since first onPlaying
  Guard 2: video.currentTime within 1s of video.duration
  Both must pass before 'Continue' button appears
  If autoplay blocked -> show manual play button
```

#### 1.3.5 Reservation Reference Generator

```
generateReference(zip, lastName):
  return `VIN-${zip}-${lastName.slice(0,4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
```

---

### 1.4 API & Integration Map

| Integration | Endpoint | Secret/Key | Purpose |
|---|---|---|---|
| Supabase DB | `https://gfyyxygshtjkudnjujzf.supabase.co` | `VITE_SUPABASE_ANON_KEY` (client-exposed) | All data persistence |
| HeyGen Streaming | `https://api.heygen.com/v1/streaming.create_token` | `HEYGEN_API_KEY` (edge secret) | AI avatar token |
| Resend Email | `https://api.resend.com/emails` | `re_dGCzJrSp_...` (**HARDCODED**) | Contact form delivery |
| ops-prospects | `/functions/v1/ops-prospects/*` | `OPS_ACCESS_TOKEN` (edge secret) | CRUD: prospects, reservations, runs, campaigns |
| ops-verify | `/functions/v1/ops-verify` | `OPS_ACCESS_TOKEN` (edge secret) | Admin code verification |
| heygen-token | `/functions/v1/heygen-token` | `HEYGEN_API_KEY` (edge secret) | Proxy for HeyGen token |
| send-contact-email | `/functions/v1/send-contact-email` | Resend key (hardcoded) | Email dispatch |

**Edge Function Secrets (deployed):**
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL
- HEYGEN_API_KEY
- OPS_ACCESS_TOKEN
- SUPABASE_JWKS
- SUPABASE_PUBLISHABLE_KEYS
- SUPABASE_SECRET_KEYS

---

## 2. DIRECTORY & FILE HIERARCHY

```
src/
├── App.tsx                         [1101 lines] Corporate landing page for Maxilocal France
│                                   Dependencies: supabase edge function (contact form), Lucide icons
│
├── Group.tsx                       Auxiliary/unknown (legacy or placeholder)
│
├── index.css                       Global CSS: Tailwind directives + custom utilities
│
├── main.tsx                        BrowserRouter entry point
│                                   Defines top-level routes: /vin, /vin/proforma/:ref,
│                                   /vin/paiement/*, /vin/finaliser, /vin/*, /vinocap/qr redirect, /*
│                                   Dependencies: react-router-dom, all page components
│
├── vite-env.d.ts                   Vite type declarations
│
└── vin/
    ├── WineApp.tsx                 DEPRECATED legacy SPA navigation (useState-based page switching)
    │                               Superseded by WineShell.tsx but still in the build
    │
    ├── WineShell.tsx               [243 lines] React Router shell for /vin/* subtree
    │                               Defines: public routes (ShellLayout), admin routes (OpsShell)
    │                               Dependencies: react-router-dom, OpsGate, AdminLayout, all pages
    │
    ├── components/
    │   ├── CampaignHostIntro.tsx   [327 lines] AI avatar/video intro for campaign experiences
    │   │                           Dependencies: LiveAvatarHost (lazy), heygen.ts, campaigns.ts
    │   │
    │   ├── LiveAvatarHost.tsx      HeyGen streaming avatar React wrapper
    │   │                           Dependencies: @heygen/streaming-avatar, heygen.ts
    │   │
    │   ├── OnboardingForm.tsx      [457 lines] 5-step winery profile submission wizard
    │   │                           Dependencies: supabase.ts
    │   │
    │   ├── ReservationModal.tsx    [518 lines] Multi-state reservation/payment modal
    │   │                           Dependencies: supabase.ts, runs.ts, react-router-dom
    │   │
    │   ├── WineFooter.tsx          Public site footer with navigation
    │   │                           Dependencies: Lucide icons
    │   │
    │   ├── WineHeader.tsx          [179 lines] Fixed header with mobile drawer
    │   │                           Dependencies: Lucide icons
    │   │
    │   └── WineryCard.tsx          [470 lines] Compact grid card + full winery detail card
    │                               Dependencies: supabase.ts (WineryProfile type), Lucide icons
    │
    ├── lib/
    │   ├── adminData.ts            Admin data fetchers: campaigns, QRs, scans, breakdowns
    │   │                           Dependencies: supabase.ts, campaigns.ts
    │   │
    │   ├── associations.ts         Static association registry (1 hardcoded entry)
    │   │                           Dependencies: none
    │   │
    │   ├── campaigns.ts            [149 lines] QR resolution + scan logging + status derivation
    │   │                           Dependencies: supabase.ts
    │   │
    │   ├── heygen.ts               HeyGen token fetch via edge function
    │   │                           Dependencies: env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
    │   │
    │   ├── profileReadiness.ts     Profile completeness calculator + status labels
    │   │                           Dependencies: supabase.ts (WineryProfile type)
    │   │
    │   ├── prospects.ts            [205 lines] Prospect CRUD + bulk insert + lookup/matching
    │   │                           Dependencies: env vars, fetch (edge function calls)
    │   │
    │   ├── recommendations.ts      [92 lines] Wine recommendation scoring engine
    │   │                           Dependencies: supabase.ts (WineryProfile type)
    │   │
    │   ├── runs.ts                 Distribution run CRUD client
    │   │                           Dependencies: env vars, fetch (edge function calls)
    │   │
    │   └── supabase.ts             Supabase client + WineryProfile interface (57 fields)
    │                               Dependencies: @supabase/supabase-js, env vars
    │
    └── pages/
        ├── ActiveCampaignExperience.tsx   Full guided campaign: avatar -> questions -> results
        │                                  Dependencies: CampaignHostIntro, recommendations.ts, supabase.ts
        │
        ├── AssociationInvitePage.tsx      [381 lines] Invite token validation + join flow
        │                                  Dependencies: supabase.ts, OnboardingForm, associations.ts
        │
        ├── AssociationPage.tsx            [215 lines] Public association page
        │                                  Dependencies: supabase.ts, WineryCard
        │
        ├── CampaignResolverPage.tsx       QR slug resolution -> routing to experience
        │                                  Dependencies: campaigns.ts (resolveQR)
        │
        ├── CardPage.tsx                   Individual winery card viewer
        │                                  Dependencies: supabase.ts, WineryCard
        │
        ├── DecouvrirPage.tsx              Guided discovery with preference selection
        │                                  Dependencies: supabase.ts, recommendations.ts
        │
        ├── DomainesPage.tsx               Filterable winery grid
        │                                  Dependencies: supabase.ts, WineryCard
        │
        ├── FinaliserPage.tsx              Post-payment profile finalization
        │                                  Dependencies: supabase.ts, OnboardingForm
        │
        ├── HomePage.tsx                   Public /vin landing
        │                                  Dependencies: supabase.ts, WineryCard
        │
        ├── ParticipePage.tsx              [508 lines] Participation landing (quick + full form)
        │                                  Dependencies: supabase.ts, OnboardingForm
        │
        ├── PaymentStatusPage.tsx          Payment confirmation/failure/pending states
        │                                  Dependencies: react-router-dom
        │
        ├── ProformaPage.tsx               [260 lines] Printable pro-forma invoice
        │                                  Dependencies: react-router-dom (useParams)
        │
        ├── QREntryPage.tsx                QR poster -> video gate -> choice flow
        │                                  Dependencies: react-router-dom (useNavigate), Lucide icons
        │
        ├── TerroirPage.tsx                Static terroir information page
        │                                  Dependencies: Lucide icons
        │
        ├── VinPage.tsx                    Sales page for bread-bag ad reservation
        │                                  Dependencies: ReservationModal
        │
        ├── admin/
        │   ├── AdminCampaignDetailPage.tsx [524 lines] Campaign detail + QR list + scan analytics
        │   │                               Dependencies: adminData.ts, campaigns.ts
        │   │
        │   ├── AdminCampaignsPage.tsx      Campaign list with status + counts
        │   │                               Dependencies: adminData.ts
        │   │
        │   ├── AdminLayout.tsx             Admin shell with sidebar nav + logout
        │   │                               Dependencies: react-router-dom
        │   │
        │   ├── ProspectsPage.tsx           [684 lines] Full CRUD + CSV import + indicators
        │   │                               Dependencies: prospects.ts
        │   │
        │   ├── ReservationsPage.tsx        [625 lines] Reservations list + override controls
        │   │                               Dependencies: adminData.ts (via fetch), runs.ts
        │   │
        │   └── RunsPage.tsx               [300 lines] Distribution run manager
        │                                   Dependencies: runs.ts
        │
        └── ops/
            └── OpsGate.tsx                Admin authentication gate (password via edge function)
                                           Dependencies: env vars, fetch (ops-verify)
```

---

## 3. DATABASE SCHEMA

### Tables (8 total, all RLS-enabled)

| Table | Rows | Purpose | Key Columns |
|---|---|---|---|
| `wine_profiles` | 10 | Winery digital cards | 57 columns: identity, contact, wine types, certifications, association, submission status |
| `wine_prospects` | 125 | Sales pipeline | domain_name, contact info, status (10 states), source, published flag |
| `wine_reservations` | 2 | Ad placement bookings | structure info, payment_method, payment_reference, status, run_month, manual_override |
| `wine_campaigns` | 1 | Campaign definitions | name, slug, status (6 states), start_at, end_at, experience_key, zone |
| `wine_campaign_qrs` | 1 | QR codes per campaign | qr_slug (unique), campaign_id FK, is_active |
| `wine_scan_events` | 7 | QR scan event log | campaign_id FK, qr_id FK, scan_result, entry_path, user_agent, session_key |
| `wine_association_invites` | 1 | Membership invite tokens | token (unique), association_id, status, expires_at, winery_profile_id FK |
| `wine_runs` | 3 | Distribution editions | label (unique), cutoff_date, sort_order, is_active |

### Foreign Key Relationships

```
wine_campaign_qrs.campaign_id ──> wine_campaigns.id
wine_scan_events.campaign_id ──> wine_campaigns.id
wine_scan_events.qr_id ──> wine_campaign_qrs.id
wine_association_invites.winery_profile_id ──> wine_profiles.id
```

---

## 4. THE "SHADOW AUDIT" (CRITICAL)

### 4.1 Security Vulnerabilities

| Severity | Issue | Location |
|---|---|---|
| **CRITICAL** | Resend API key hardcoded in source code | `supabase/functions/send-contact-email/index.ts` line 65 |
| **HIGH** | Single shared OPS_ACCESS_TOKEN for all admin users -- no user-level audit trail | `ops-verify`, `ops-prospects` |
| **HIGH** | sessionStorage auth is trivially spoofable (set `vc_ops_granted=1`) | `pages/ops/OpsGate.tsx` |
| **MEDIUM** | Supabase anon key committed in `.env` (should be deploy-time only) | `.env` |
| **MEDIUM** | No rate limiting on any edge function | All 4 functions |
| **MEDIUM** | String interpolation in `.or()` clauses risks injection | `ops-prospects/index.ts` search handlers |
| **LOW** | No HTTPS enforcement at application level | Relies on hosting |

### 4.2 Technical Debt

| Category | Issue |
|---|---|
| Dead code | `WineApp.tsx` entirely superseded by `WineShell.tsx` -- still imported/bundled |
| Dead code | `Group.tsx` exists at root with no known purpose |
| Dual navigation paradigm | Old callback-based (`onNavigate`) coexists with React Router `useNavigate()` |
| Prop drilling | `onNavigate`, `onViewCard`, `onBack` callbacks threaded through 3+ levels |
| No error boundaries | Any component crash takes down the entire application |
| No loading skeletons | Most pages show blank until data arrives |
| No data caching | Every route transition re-fetches from Supabase (no SWR/React Query) |
| Massive single-file components | Several pages 500-700 lines with inline sub-components |
| Inconsistent styling | Some components use Tailwind, others use `style={{}}` objects |
| No generated DB types | Supabase client is untyped (no `supabase gen types`) |
| Hardcoded demo data | `DEMO_CODE_MAP` in QREntryPage maps codes to slugs in source |
| Single static association | `associations.ts` contains exactly one entry |
| No pagination | ProspectsPage loads 200+, ReservationsPage loads 300+ |
| No optimistic updates | All mutations await server response before UI change |

### 4.3 Scalability Breaking Points (at 1000+ concurrent users)

| Component | Failure Mode |
|---|---|
| Edge Function: ops-prospects | Monolithic handler (12+ routes) with no queuing or connection pooling |
| Supabase queries | `.select('*')` pulls all 57 columns for every card render |
| External images | Pexels URLs with no CDN layer or optimization |
| Video delivery | 1080p MP4 from /public (no streaming, no adaptive bitrate, no CDN) |
| No realtime | Admin dashboard requires manual refresh for updates |
| CSV import | Entire array sent in single POST -- no chunking for large files |
| Client-side filtering | DomainesPage fetches ALL published wineries, filters in browser |
| No database indexes | No evidence of custom indexes beyond PKs and unique constraints |
| No invite cleanup | Expired association invites accumulate indefinitely |

### 4.4 Hardcoded Limitations (Blocking Multi-Vertical Use)

| Item | Rigidity |
|---|---|
| `wine_2026` experience key | Only one campaign experience template |
| Zone locked to "Agde+" | No zone selection in reservation flow |
| 250 EUR HT pricing | Baked into VinPage and ReservationModal strings |
| French language only | All UI text as raw French -- no i18n |
| Single product medium | "bread bags" baked into all copy |
| Wine-only vertical | Schema, filters, recommendations all wine-specific |
| OPS route `/vin/ops-42xf` | Security by obscurity |
| Single association | Static array with one entry |
| Custom Tailwind colors | `wine`, `coral`, `aqua`, `cypress`, `lagoon` -- wine branding |

---

## 5. REFACTORING STRATEGY

### 5.1 Domain Abstraction Layer

**Goal:** Replace wine-specific terminology with a configurable "vertical" system.

```typescript
interface VerticalConfig {
  id: string;                          // 'wine', 'artisan', 'fishing', 'gastro'
  entityName: { singular: string; plural: string };
  productTypes: ProductType[];
  certificationTypes: Certification[];
  scoringRules: ScoringRule[];
  associationModel: AssociationConfig;
  pricingTiers: PricingTier[];
  zoneDefinitions: Zone[];
  experienceTemplates: ExperienceTemplate[];
  brandColors: BrandPalette;
  locale: string;
}
```

- The recommendation engine becomes: `scoreEntity(entity, preferences, config.scoringRules)`
- Profile readiness becomes: `computeReadiness(entity, config.requiredFields)`
- Campaign experiences become: `resolveExperience(campaign, config.experienceTemplates)`

### 5.2 State Architecture Upgrade

| Current | Target |
|---|---|
| Scattered `useState` + fetch | Zustand stores with React Query for async |
| sessionStorage auth | Supabase Auth with RLS policies per role |
| Prop drilling callbacks | Hooks: `useVertical()`, `useAuth()`, `useEntityList()` |
| No caching | React Query with stale-while-revalidate |
| No optimistic UI | React Query mutations with optimistic callbacks |

### 5.3 Edge Function Decomposition

| Current (monolith) | Target (discrete) |
|---|---|
| `ops-prospects` handles 12+ routes | `fn-prospects`, `fn-reservations`, `fn-runs`, `fn-campaigns` |
| No validation | Zod schemas per endpoint |
| No rate limiting | Upstash Redis or pg_net-based throttle |
| Hardcoded Resend key | Environment variable |
| Single shared access token | Supabase Auth JWT with admin role |

### 5.4 Database Evolution

```sql
-- Generic entity system
CREATE TABLE entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id text NOT NULL,
  entity_type text NOT NULL,
  slug text UNIQUE,
  attributes jsonb NOT NULL DEFAULT '{}',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Vertical-specific views
CREATE VIEW wine_entities AS
  SELECT id, slug, attributes->>'domaine_name' as domaine_name, ...
  FROM entities WHERE vertical_id = 'wine';
```

- Campaigns, QR codes, and scan events remain vertical-agnostic (already generic)
- Reservations gain a `vertical_id` + `product_config jsonb` column
- Prospects gain a `vertical_id` discriminator

### 5.5 Modern Pattern Replacements

| Current Pattern | Replacement |
|---|---|
| Inline sub-components in 600-line files | Extract to `/components/shared/` with vertical config props |
| Manual fetch + loading state | `useQuery()` / `useMutation()` from React Query |
| `WineApp.tsx` legacy nav | Delete entirely -- WineShell handles everything |
| Direct Supabase calls in components | Data access layer: `src/data/entities.ts`, `src/data/campaigns.ts` |
| Hardcoded strings | `src/locales/{fr,en}.json` + `useT()` hook |
| `DEMO_CODE_MAP` in source | Database lookup (already exists in `wine_campaign_qrs`) |
| sessionStorage auth | `useSupabaseAuth()` + RLS policies |

### 5.6 Hooks to Extract

```typescript
// Core reusable hooks for the Master Framework
useVertical()          // returns current VerticalConfig
useAuth()              // Supabase auth state + role
useEntityList(filters) // paginated entity query with cache
useEntityDetail(slug)  // single entity with related data
useCampaignResolver(qrSlug) // QR -> campaign resolution
useVideoGate(config)   // hardened video playback gate
useAvatarSession(config)    // HeyGen avatar lifecycle
useReservationFlow()   // multi-step reservation state machine
useProfileReadiness(entity) // completeness calculator
useRecommendations(prefs)   // scoring + ranking
```

### 5.7 Preserved Core Logic (Vertical-Agnostic Versions)

**QR Resolution** -- already generic, needs only:
- Replace `wine_campaigns` / `wine_campaign_qrs` table names with `campaigns` / `campaign_qrs`
- Add `vertical_id` filter

**Recommendation Engine** -- needs scoring rule injection:
```typescript
function scoreEntity(entity: Entity, prefs: Preferences, rules: ScoringRule[]): number {
  return rules.reduce((score, rule) => {
    if (rule.condition(entity, prefs)) return score + rule.points;
    return score;
  }, 0);
}
```

**Video Gate** -- fully generic, no wine-specific logic. Preserve as-is.

**Profile Readiness** -- needs criteria injection:
```typescript
function computeReadiness(entity: Entity, criteria: ReadinessCriterion[]): ReadinessResult {
  const checks = criteria.map(c => ({ ...c, passed: isFieldFilled(entity[c.key]) }));
  // ... same logic with injected criteria
}
```

---

## 6. EDGE FUNCTION DETAILS (FULL SOURCE SUMMARY)

### heygen-token/index.ts
- Proxies `POST` to `https://api.heygen.com/v1/streaming.create_token`
- Reads `HEYGEN_API_KEY` from env
- Returns `{ token }` or error codes: `heygen_not_configured` (503), `heygen_token_failed` (502), `heygen_token_empty` (502)

### ops-verify/index.ts
- Accepts `POST { code: string }`
- Compares against `OPS_ACCESS_TOKEN` env var
- Returns `{ granted: boolean }`

### ops-prospects/index.ts (MONOLITH)
- **Public**: `GET /runs` -- active runs for booking modal
- **Protected** (all require X-Ops-Token):
  - `GET /` -- list prospects (search, status, published filter, pagination)
  - `GET /:id` -- single prospect
  - `POST /` -- create one or bulk
  - `PUT /:id` -- update prospect
  - `DELETE /:id` -- delete prospect
  - `POST /lookup` -- cross-reference emails/mobiles/domains against reservations + profiles
  - `GET /runs/all` -- all runs including inactive
  - `PUT /runs/:id` -- update run
  - `POST /runs` -- create run
  - `GET /reservations` -- list reservations (search, status, payment_method, pagination)
  - `PATCH /reservations/:id` -- update override fields
  - `PATCH /campaigns/:id` -- update start_at/end_at

### send-contact-email/index.ts
- Validates `{ firstName, lastName, company, email, message }`
- Builds HTML email
- Sends via Resend API to `maxilocal.pro@gmail.com`
- **SECURITY ISSUE**: API key hardcoded as string literal

---

## 7. SUPABASE MIGRATIONS (17 total, chronological)

| # | Migration | Purpose |
|---|---|---|
| 1 | `create_vinocap_schema` | Base tables: wine_profiles, wine_reservations |
| 2 | `add_recognition_layers` | Origin scheme, certifications (bio, HVE, Terra Vitis, vegan) |
| 3 | `create_association_invites` | wine_association_invites table |
| 4 | `add_submission_lifecycle` | submission_status, submitted_at, review_notes |
| 5 | `add_card_readiness` | preview_ready, public_card_ready flags |
| 6 | `add_association_member_mechanics` | association_member_status, badge, join_label |
| 7 | `add_former_member_state` | association_left_at, 'former' status |
| 8 | `create_campaign_qr_foundation` | wine_campaigns, wine_campaign_qrs, wine_scan_events |
| 9 | `add_non_alcoholic_attribute` | has_non_alcoholic boolean |
| 10 | `harden_vinocap_reservations_rls` | Tightened RLS policies |
| 11 | `fix_reservation_select_add_lookup` | RLS fix + lookup function |
| 12 | `tighten_reservation_insert_policy` | Further RLS hardening |
| 13 | `add_payment_reference_to_profiles` | payment_reference on wine_profiles |
| 14 | `create_submit_paid_fiche_function` | DB function for paid submission |
| 15 | `drop_vinocap_compat_views` | Removed legacy compatibility views |
| 16 | `add_run_month_cutoff_override` | run_month + cutoff_date on reservations |
| 17 | `create_wine_runs_table` | wine_runs table |

---

## 8. PUBLIC ASSETS

| File | Type | Purpose |
|---|---|---|
| `Maxilocal Wine Launch_ Vinia_1080p.mp4` | Video | QR entry page intro video |
| `Vinia_Play_Video.png` | Image | Video poster/launcher image |
| `image.png` | Image | Unknown/auxiliary |
| `_redirects` | Config | Netlify SPA redirect rules |

---

## 9. TAILWIND CUSTOM THEME (from tailwind.config.js)

Custom color palettes defined:
- `wine` -- wine/burgundy tones
- `coral` -- warm coral/salmon
- `aqua` -- cool blue-green
- `cypress` -- deep green (primary CTA color)
- `lagoon` -- teal/ocean
- `warm` -- warm neutrals (backgrounds, borders)
- `primary` -- alias palette
- `neutral` -- gray scale
- `sea` -- marine blue
- `sand` -- sandy neutrals
- `sage` -- muted green
- `terracotta` -- earthy orange

---

## 10. MIGRATION PRIORITY MATRIX

| Priority | Action | Effort | Impact |
|---|---|---|---|
| P0 (immediate) | Move Resend API key to env variable | 5 min | Eliminates critical security hole |
| P0 | Delete dead `WineApp.tsx` | 5 min | Reduces bundle + confusion |
| P1 | Add Supabase generated types | 30 min | Type safety across entire app |
| P1 | Split ops-prospects monolith | 2 hrs | Maintainability + independent scaling |
| P1 | Replace sessionStorage auth with Supabase Auth | 4 hrs | Real security model |
| P2 | Add React Query data layer | 4 hrs | Caching, deduplication, optimistic UI |
| P2 | Extract vertical config system | 8 hrs | Multi-category readiness |
| P2 | Add i18n layer | 4 hrs | Multi-language support |
| P3 | Video CDN migration | 2 hrs | Scalable media delivery |
| P3 | Pagination for all list views | 3 hrs | Scale beyond 500 entities |
| P3 | Add error boundaries + loading states | 2 hrs | Production resilience |
