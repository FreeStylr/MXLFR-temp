import { supabase } from './supabase';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'ended'
  | 'archived';

export type ScanResult =
  | 'active'
  | 'ended'
  | 'not_yet_live'
  | 'paused'
  | 'invalid'
  | 'archived';

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  campaign_type: string;
  context_label: string;
  zone: string;
  start_at: string | null;
  end_at: string | null;
  status: CampaignStatus;
  owner_type: string;
  owner_name: string;
  experience_key: string | null;
  is_public: boolean;
  created_at: string;
}

export interface CampaignQR {
  id: string;
  campaign_id: string;
  qr_slug: string;
  label: string;
  is_active: boolean;
  created_at: string;
}

export interface ResolverResult {
  scanResult: ScanResult;
  campaign: Campaign | null;
  qr: CampaignQR | null;
}

function deriveScanResult(campaign: Campaign): ScanResult {
  const now = new Date();
  const start = campaign.start_at ? new Date(campaign.start_at) : null;
  const end = campaign.end_at ? new Date(campaign.end_at) : null;

  if (campaign.status === 'archived') return 'archived';
  if (campaign.status === 'ended') return 'ended';
  if (campaign.status === 'paused') return 'paused';
  if (campaign.status === 'draft') return 'not_yet_live';

  if (end && now > end) return 'ended';
  if (start && now < start) return 'not_yet_live';

  if (campaign.status === 'active' || campaign.status === 'scheduled') return 'active';

  return 'not_yet_live';
}

export async function resolveQR(
  qrSlug: string,
  entryPath: string,
  userAgent?: string,
  sessionKey?: string,
): Promise<ResolverResult> {
  const { data: qrData } = await supabase
    .from('wine_campaign_qrs')
    .select('*')
    .eq('qr_slug', qrSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (!qrData) {
    await logScan({
      qrSlug,
      entryPath,
      scanResult: 'invalid',
      userAgent,
      sessionKey,
    });
    return { scanResult: 'invalid', campaign: null, qr: null };
  }

  const qr = qrData as CampaignQR;

  const { data: campaignData } = await supabase
    .from('wine_campaigns')
    .select('*')
    .eq('id', qr.campaign_id)
    .maybeSingle();

  if (!campaignData) {
    await logScan({
      qrSlug,
      entryPath,
      scanResult: 'invalid',
      userAgent,
      sessionKey,
    });
    return { scanResult: 'invalid', campaign: null, qr };
  }

  const campaign = campaignData as Campaign;
  const scanResult = deriveScanResult(campaign);

  await logScan({
    campaignId: campaign.id,
    qrId: qr.id,
    qrSlug,
    entryPath,
    scanResult,
    userAgent,
    sessionKey,
  });

  return { scanResult, campaign, qr };
}

interface LogScanParams {
  campaignId?: string;
  qrId?: string;
  qrSlug: string;
  entryPath: string;
  scanResult: ScanResult;
  userAgent?: string;
  sessionKey?: string;
}

async function logScan(params: LogScanParams): Promise<void> {
  await supabase.from('wine_scan_events').insert({
    campaign_id: params.campaignId ?? null,
    qr_id: params.qrId ?? null,
    qr_slug: params.qrSlug,
    scanned_at: new Date().toISOString(),
    entry_path: params.entryPath,
    scan_result: params.scanResult,
    user_agent: params.userAgent ?? navigator.userAgent,
    session_key: params.sessionKey ?? null,
  });
}
