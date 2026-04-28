const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FN_BASE = `${SUPABASE_URL}/functions/v1/ops-prospects`;

export interface Run {
  id: string;
  label: string;
  cutoff_date: string;
  distribution_label: string;
  sort_order: number;
  is_active: boolean;
}

export function isRunOpen(cutoffDate: string): boolean {
  return new Date() <= new Date(cutoffDate);
}

export async function fetchActiveRuns(): Promise<Run[]> {
  const res = await fetch(`${FN_BASE}/runs`, {
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Apikey': ANON_KEY,
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export async function fetchAllRuns(opsToken: string): Promise<Run[]> {
  const res = await fetch(`${FN_BASE}/runs/all`, {
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Apikey': ANON_KEY,
      'X-Ops-Token': opsToken,
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export async function updateRun(opsToken: string, id: string, patch: Partial<Omit<Run, 'id'>>): Promise<Run> {
  const res = await fetch(`${FN_BASE}/runs/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Apikey': ANON_KEY,
      'X-Ops-Token': opsToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data.data;
}

export async function createRun(opsToken: string, run: Omit<Run, 'id'>): Promise<Run> {
  const res = await fetch(`${FN_BASE}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Apikey': ANON_KEY,
      'X-Ops-Token': opsToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(run),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data.data;
}
