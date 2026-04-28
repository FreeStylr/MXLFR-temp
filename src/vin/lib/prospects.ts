const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FN_URL = `${SUPABASE_URL}/functions/v1/ops-prospects`;

export const PROSPECT_STATUSES = [
  'new', 'contacted', 'interested', 'reserved', 'paid',
  'fiche_incomplete', 'listed', 'deferred', 'refunded', 'lost',
] as const;

export type ProspectStatus = typeof PROSPECT_STATUSES[number];

export interface Prospect {
  id: string;
  domain_name: string;
  contact_name_raw: string;
  contact_first_name: string;
  contact_last_name: string;
  gender: string;
  primary_mobile: string;
  landline: string;
  other_phones: string;
  email: string;
  website_url: string;
  association_name: string;
  zip_code: string;
  town: string;
  address: string;
  years_participated: string;
  status: ProspectStatus;
  short_note: string;
  zone_interest: string;
  run_month_interest: string;
  reservation_ref: string;
  payment_status: string;
  listed_profile_slug: string;
  published: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export type ProspectDraft = Omit<Prospect, 'id' | 'created_at' | 'updated_at'>;

function headers(opsToken: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
    'Apikey': ANON_KEY,
    'X-Ops-Token': opsToken,
  };
}

async function call<T>(
  path: string,
  method: string,
  opsToken: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${FN_URL}${path}`, {
    method,
    headers: headers(opsToken),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

export async function fetchProspects(
  opsToken: string,
  opts: { search?: string; status?: string; published?: 'true' | 'false' | ''; limit?: number; offset?: number } = {},
): Promise<{ data: Prospect[]; count: number }> {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.status) params.set('status', opts.status);
  if (opts.published !== undefined && opts.published !== '') params.set('published', opts.published);
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.offset) params.set('offset', String(opts.offset));
  const qs = params.toString();
  return call(`/${qs ? '?' + qs : ''}`, 'GET', opsToken);
}

export async function createProspect(opsToken: string, draft: ProspectDraft): Promise<Prospect> {
  const res = await call<{ data: Prospect[] }>('/', 'POST', opsToken, draft);
  return res.data[0];
}

export async function updateProspect(opsToken: string, id: string, patch: Partial<ProspectDraft>): Promise<Prospect> {
  const res = await call<{ data: Prospect }>(`/${id}`, 'PUT', opsToken, patch);
  return res.data;
}

export async function deleteProspect(opsToken: string, id: string): Promise<void> {
  await call(`/${id}`, 'DELETE', opsToken);
}

export async function bulkInsertProspects(opsToken: string, rows: ProspectDraft[]): Promise<number> {
  const res = await call<{ data: Prospect[] }>('/', 'POST', opsToken, rows);
  return res.data?.length ?? 0;
}

export interface ReservationMatch {
  id: string;
  email: string;
  mobile: string;
  structure_name: string;
  status: string;
  payment_reference: string;
  payment_method: string | null;
}

export interface ProfileMatch {
  id: string;
  email: string;
  phone: string;
  domaine_name: string;
  slug: string;
  is_published: boolean;
}

export interface LookupResult {
  reservations: ReservationMatch[];
  profiles: ProfileMatch[];
}

export async function lookupProspectMatches(
  opsToken: string,
  prospects: Pick<Prospect, 'email' | 'primary_mobile' | 'domain_name'>[],
): Promise<LookupResult> {
  const emails = [...new Set(prospects.map(p => p.email.toLowerCase().trim()).filter(Boolean))];
  const mobiles = [...new Set(prospects.map(p => p.primary_mobile.replace(/\s/g, '')).filter(Boolean))];
  const domain_names = [...new Set(prospects.map(p => p.domain_name.toLowerCase().trim()).filter(Boolean))];

  if (!emails.length && !mobiles.length && !domain_names.length) {
    return { reservations: [], profiles: [] };
  }

  return call<LookupResult>('/lookup', 'POST', opsToken, { emails, mobiles, domain_names });
}

// Derive per-prospect indicators from a LookupResult.
// Matching order: email → primary_mobile → domain_name
export function deriveIndicators(
  prospect: Pick<Prospect, 'email' | 'primary_mobile' | 'domain_name'>,
  lookup: LookupResult,
): { reserved: boolean; paid: boolean; listed: boolean; reservationRef: string; paymentStatus: string; profileSlug: string } {
  const email = prospect.email.toLowerCase().trim();
  const mobile = prospect.primary_mobile.replace(/\s/g, '');
  const domain = prospect.domain_name.toLowerCase().trim();

  const resv = lookup.reservations.find(r =>
    (email && r.email?.toLowerCase().trim() === email) ||
    (mobile && r.mobile?.replace(/\s/g, '') === mobile) ||
    (domain && r.structure_name?.toLowerCase().trim() === domain)
  );

  const profile = lookup.profiles.find(p =>
    (email && p.email?.toLowerCase().trim() === email) ||
    (mobile && p.phone?.replace(/\s/g, '') === mobile) ||
    (domain && p.domaine_name?.toLowerCase().trim() === domain)
  );

  const paidStatuses = ['paid', 'completed', 'success', 'payment_confirmed'];
  const reservedStatuses = ['awaiting_wire', 'awaiting_card_payment', 'coop_lead', ...paidStatuses];

  const reserved = !!resv && reservedStatuses.includes(resv.status);
  const paid = !!resv && paidStatuses.includes(resv.status);
  const listed = !!profile;

  return {
    reserved,
    paid,
    listed,
    reservationRef: resv?.payment_reference ?? '',
    paymentStatus: resv?.status ?? '',
    profileSlug: profile?.slug ?? '',
  };
}

export const EMPTY_DRAFT: ProspectDraft = {
  domain_name: '',
  contact_name_raw: '',
  contact_first_name: '',
  contact_last_name: '',
  gender: '',
  primary_mobile: '',
  landline: '',
  other_phones: '',
  email: '',
  website_url: '',
  association_name: '',
  zip_code: '',
  town: '',
  address: '',
  years_participated: '',
  status: 'new',
  short_note: '',
  zone_interest: '',
  run_month_interest: '',
  reservation_ref: '',
  payment_status: '',
  listed_profile_slug: '',
  published: false,
  source: 'manual',
};
