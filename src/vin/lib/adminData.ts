import { supabase } from './supabase';
import type { Campaign, CampaignQR, ScanResult } from './campaigns';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FN_BASE = `${SUPABASE_URL}/functions/v1/ops-prospects`;

export async function updateCampaignDates(
  opsToken: string,
  campaignId: string,
  startAt: string | null,
  endAt: string | null,
): Promise<Campaign> {
  const res = await fetch(`${FN_BASE}/campaigns/${campaignId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Apikey': ANON_KEY,
      'X-Ops-Token': opsToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ start_at: startAt, end_at: endAt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
  return json.data as Campaign;
}

export interface CampaignWithCounts extends Campaign {
  qr_count: number;
  scan_count: number;
}

export interface ScanEvent {
  id: string;
  campaign_id: string | null;
  qr_id: string | null;
  qr_slug: string;
  scanned_at: string;
  entry_path: string;
  scan_result: ScanResult;
  user_agent: string | null;
  session_key: string | null;
  created_at: string;
}

export interface ScanBreakdown {
  active: number;
  ended: number;
  not_yet_live: number;
  paused: number;
  invalid: number;
  archived: number;
}

export async function fetchCampaignsWithCounts(): Promise<CampaignWithCounts[]> {
  const { data: campaigns } = await supabase
    .from('wine_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (!campaigns || campaigns.length === 0) return [];

  const ids = campaigns.map((c: Campaign) => c.id);

  const { data: qrCounts } = await supabase
    .from('wine_campaign_qrs')
    .select('campaign_id')
    .in('campaign_id', ids);

  const { data: scanCounts } = await supabase
    .from('wine_scan_events')
    .select('campaign_id')
    .in('campaign_id', ids);

  const qrMap: Record<string, number> = {};
  const scanMap: Record<string, number> = {};

  (qrCounts ?? []).forEach((r: { campaign_id: string }) => {
    qrMap[r.campaign_id] = (qrMap[r.campaign_id] ?? 0) + 1;
  });
  (scanCounts ?? []).forEach((r: { campaign_id: string }) => {
    scanMap[r.campaign_id] = (scanMap[r.campaign_id] ?? 0) + 1;
  });

  return campaigns.map((c: Campaign) => ({
    ...c,
    qr_count: qrMap[c.id] ?? 0,
    scan_count: scanMap[c.id] ?? 0,
  }));
}

export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  const { data } = await supabase
    .from('wine_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data as Campaign | null;
}

export async function fetchQRsForCampaign(campaignId: string): Promise<CampaignQR[]> {
  const { data } = await supabase
    .from('wine_campaign_qrs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });
  return (data ?? []) as CampaignQR[];
}

export async function fetchScansForCampaign(campaignId: string): Promise<ScanEvent[]> {
  const { data } = await supabase
    .from('wine_scan_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('scanned_at', { ascending: false })
    .limit(100);
  return (data ?? []) as ScanEvent[];
}

export async function fetchScanBreakdown(campaignId: string): Promise<ScanBreakdown> {
  const { data } = await supabase
    .from('wine_scan_events')
    .select('scan_result')
    .eq('campaign_id', campaignId);

  const breakdown: ScanBreakdown = {
    active: 0,
    ended: 0,
    not_yet_live: 0,
    paused: 0,
    invalid: 0,
    archived: 0,
  };

  (data ?? []).forEach((r: { scan_result: string }) => {
    const key = r.scan_result as keyof ScanBreakdown;
    if (key in breakdown) breakdown[key]++;
  });

  return breakdown;
}

export async function fetchTotalScanCount(campaignId: string): Promise<number> {
  const { count } = await supabase
    .from('wine_scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);
  return count ?? 0;
}

export async function fetchScanCountPerQR(campaignId: string): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('wine_scan_events')
    .select('qr_id')
    .eq('campaign_id', campaignId)
    .not('qr_id', 'is', null);

  const map: Record<string, number> = {};
  (data ?? []).forEach((r: { qr_id: string | null }) => {
    if (r.qr_id) map[r.qr_id] = (map[r.qr_id] ?? 0) + 1;
  });
  return map;
}
