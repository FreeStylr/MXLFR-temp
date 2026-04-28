import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, QrCode, ScanLine, Circle,
  Copy, Check, ExternalLink, Clock, Globe, Loader2, Save, Pencil,
} from 'lucide-react';
import {
  fetchCampaignById,
  fetchQRsForCampaign,
  fetchScanBreakdown,
  fetchTotalScanCount,
  fetchScanCountPerQR,
  fetchScansForCampaign,
  updateCampaignDates,
  type ScanBreakdown,
  type ScanEvent,
} from '../../lib/adminData';
import type { Campaign, CampaignQR, CampaignStatus, ScanResult } from '../../lib/campaigns';

const TOKEN_KEY = 'vc_ops_token';
function getOpsToken(): string {
  try { return sessionStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; }
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; dot: string }> = {
  draft: { label: 'Brouillon', color: 'bg-stone-100 text-stone-600', dot: 'text-stone-400' },
  scheduled: { label: 'Programmée', color: 'bg-sky-50 text-sky-700', dot: 'text-sky-400' },
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700', dot: 'text-emerald-400' },
  paused: { label: 'En pause', color: 'bg-amber-50 text-amber-700', dot: 'text-amber-400' },
  ended: { label: 'Terminée', color: 'bg-stone-100 text-stone-500', dot: 'text-stone-400' },
  archived: { label: 'Archivée', color: 'bg-stone-100 text-stone-400', dot: 'text-stone-300' },
};

const SCAN_RESULT_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-600 bg-emerald-50' },
  ended: { label: 'Terminée', color: 'text-stone-500 bg-stone-100' },
  not_yet_live: { label: 'Pas encore live', color: 'text-amber-600 bg-amber-50' },
  paused: { label: 'En pause', color: 'text-amber-600 bg-amber-50' },
  invalid: { label: 'Invalide', color: 'text-red-600 bg-red-50' },
  archived: { label: 'Archivée', color: 'text-stone-400 bg-stone-100' },
};

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildResolverUrl(qrSlug: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/vin/q/${qrSlug}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all hover:bg-stone-100"
      title="Copier l'URL"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600">Copié</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500">Copier</span>
        </>
      )}
    </button>
  );
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  // datetime-local requires "YYYY-MM-DDTHH:mm"
  return new Date(iso).toISOString().slice(0, 16);
}

function MetadataSection({ campaign, onDatesUpdated }: { campaign: Campaign; onDatesUpdated: (c: Campaign) => void }) {
  const cfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;
  const [editing, setEditing] = useState(false);
  const [startAt, setStartAt] = useState(toDatetimeLocal(campaign.start_at));
  const [endAt, setEndAt] = useState(toDatetimeLocal(campaign.end_at));
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true); setSaveErr(''); setSaved(false);
    try {
      const updated = await updateCampaignDates(
        getOpsToken(),
        campaign.id,
        startAt ? new Date(startAt).toISOString() : null,
        endAt ? new Date(endAt).toISOString() : null,
      );
      onDatesUpdated(updated);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setStartAt(toDatetimeLocal(campaign.start_at));
    setEndAt(toDatetimeLocal(campaign.end_at));
    setSaveErr('');
    setEditing(true);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Informations</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-stone-400 mb-1">Statut</p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Circle className={`w-2 h-2 fill-current ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-1">Type</p>
          <p className="text-sm font-medium text-stone-700">{campaign.campaign_type}</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-1">Zone</p>
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            {campaign.zone || '--'}
          </p>
        </div>

        {/* Début + Fin — editable */}
        {editing ? (
          <>
            <div>
              <p className="text-xs text-stone-400 mb-1">Début</p>
              <input
                type="datetime-local"
                value={startAt}
                onChange={e => setStartAt(e.target.value)}
                className="w-full text-xs border border-stone-300 rounded-lg px-2 py-1.5 outline-none focus:border-stone-500 bg-stone-50 text-stone-800"
              />
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Fin</p>
              <input
                type="datetime-local"
                value={endAt}
                onChange={e => setEndAt(e.target.value)}
                className="w-full text-xs border border-stone-300 rounded-lg px-2 py-1.5 outline-none focus:border-stone-500 bg-stone-50 text-stone-800"
              />
            </div>
            <div className="col-span-2 sm:col-span-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Enregistrer
              </button>
              <button
                onClick={() => { setEditing(false); setSaveErr(''); }}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
              >
                Annuler
              </button>
              {saveErr && <p className="text-xs text-red-600">{saveErr}</p>}
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-stone-400 mb-1">Début</p>
              <p className="text-sm font-medium text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatDate(campaign.start_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Fin</p>
              <p className="text-sm font-medium text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatDate(campaign.end_at)}
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors border border-stone-200"
              >
                <Pencil className="w-3 h-3" />
                Modifier les dates
              </button>
              {saved && <span className="ml-2 text-xs text-emerald-600 font-medium">Enregistré.</span>}
            </div>
          </>
        )}

        <div>
          <p className="text-xs text-stone-400 mb-1">Visibilité</p>
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            {campaign.is_public ? 'Publique' : 'Privée'}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-1">Propriétaire</p>
          <p className="text-sm font-medium text-stone-700">
            {campaign.owner_name || campaign.owner_type}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-1">Slug</p>
          <p className="text-sm font-mono text-stone-600">{campaign.slug}</p>
        </div>
        {campaign.experience_key && (
          <div>
            <p className="text-xs text-stone-400 mb-1">Experience key</p>
            <p className="text-sm font-mono text-sky-600">{campaign.experience_key}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const STABLE_QR_PATH = '/vin/qr';

function QRSection({ qrs, scanCountPerQR }: { qrs: CampaignQR[]; scanCountPerQR: Record<string, number> }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          QR Codes
        </h2>
        <span className="text-xs text-stone-400">{qrs.length} code{qrs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Stable QR target — admin display only */}
      <div className="mb-4 pb-4 border-b border-stone-100">
        <p className="text-xs text-stone-400 mb-1.5">Cible QR stable</p>
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-md px-3 py-2">
          <QrCode className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
          <span className="text-xs font-mono text-stone-700 flex-1">{STABLE_QR_PATH}</span>
          <CopyButton text={STABLE_QR_PATH} />
        </div>
      </div>

      {qrs.length === 0 ? (
        <p className="text-stone-400 text-sm py-4">Aucun QR attaché a cette campagne.</p>
      ) : (
        <div className="space-y-3">
          {qrs.map((qr) => {
            const url = buildResolverUrl(qr.qr_slug);
            const scans = scanCountPerQR[qr.id] ?? 0;
            return (
              <div
                key={qr.id}
                className="border border-stone-150 rounded-lg p-4 bg-stone-50/50"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="w-4 h-4 text-stone-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-stone-900">{qr.label}</span>
                    </div>
                    <p className="text-xs font-mono text-stone-500">slug: {qr.qr_slug}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      qr.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-stone-100 text-stone-400'
                    }`}>
                      {qr.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <ScanLine className="w-3 h-3" />
                      {scans}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-3 py-2">
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-stone-600 truncate flex-1">
                    {url}
                  </span>
                  <CopyButton text={url} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScanBreakdownSection({ breakdown, total }: { breakdown: ScanBreakdown; total: number }) {
  const entries = Object.entries(breakdown).filter(([_, v]) => v > 0);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Scans</h2>
        <span className="text-lg font-bold text-stone-900">{total}</span>
      </div>

      {total === 0 ? (
        <p className="text-stone-400 text-sm py-4">Aucun scan enregistré pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([key, count]) => {
            const cfg = SCAN_RESULT_CONFIG[key] ?? { label: key, color: 'text-stone-500 bg-stone-100' };
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold min-w-[100px] text-center ${cfg.color}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-stone-500 min-w-[48px] text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecentScansSection({ scans }: { scans: ScanEvent[] }) {
  if (scans.length === 0) return null;

  const recent = scans.slice(0, 20);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
        Derniers scans
      </h2>
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left font-semibold text-stone-400 uppercase tracking-wider px-6 py-2">Date</th>
              <th className="text-left font-semibold text-stone-400 uppercase tracking-wider px-3 py-2">QR</th>
              <th className="text-left font-semibold text-stone-400 uppercase tracking-wider px-3 py-2">Résultat</th>
              <th className="text-left font-semibold text-stone-400 uppercase tracking-wider px-3 py-2">Chemin</th>
              <th className="text-left font-semibold text-stone-400 uppercase tracking-wider px-3 py-2">Session</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((s) => {
              const cfg = SCAN_RESULT_CONFIG[s.scan_result] ?? { label: s.scan_result, color: 'text-stone-500 bg-stone-100' };
              return (
                <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-2.5 text-stone-600 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {formatDateTime(s.scanned_at)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-stone-600">{s.qr_slug}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-stone-500 max-w-[200px] truncate">
                    {s.entry_path}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-stone-400 max-w-[100px] truncate">
                    {s.session_key || '--'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {scans.length > 20 && (
        <p className="text-xs text-stone-400 mt-3 px-6">
          Affichage des 20 derniers sur {scans.length} scans chargés.
        </p>
      )}
    </div>
  );
}

export function AdminCampaignDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [qrs, setQrs] = useState<CampaignQR[]>([]);
  const [breakdown, setBreakdown] = useState<ScanBreakdown | null>(null);
  const [totalScans, setTotalScans] = useState(0);
  const [scanCountPerQR, setScanCountPerQR] = useState<Record<string, number>>({});
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetchCampaignById(id),
      fetchQRsForCampaign(id),
      fetchScanBreakdown(id),
      fetchTotalScanCount(id),
      fetchScanCountPerQR(id),
      fetchScansForCampaign(id),
    ]).then(([c, q, b, t, sqr, scans]) => {
      setCampaign(c);
      setQrs(q);
      setBreakdown(b);
      setTotalScans(t);
      setScanCountPerQR(sqr);
      setRecentScans(scans);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-24">
        <p className="text-stone-400 text-sm mb-4">Campagne introuvable.</p>
        <Link
          to="/vin/ops-42xf/campaigns"
          className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux campagnes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/vin/ops-42xf/campaigns"
          className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Toutes les campagnes
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900">{campaign.name}</h1>
          {campaign.context_label && campaign.context_label !== campaign.name && (
            <span className="text-sm text-stone-400">({campaign.context_label})</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetadataSection campaign={campaign} onDatesUpdated={setCampaign} />
        <QRSection qrs={qrs} scanCountPerQR={scanCountPerQR} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {breakdown && (
          <ScanBreakdownSection breakdown={breakdown} total={totalScans} />
        )}
      </div>

      <div className="mt-6">
        <RecentScansSection scans={recentScans} />
      </div>
    </div>
  );
}
