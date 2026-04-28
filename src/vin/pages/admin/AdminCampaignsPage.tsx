import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, ScanLine, ChevronRight, Circle } from 'lucide-react';
import { fetchCampaignsWithCounts, type CampaignWithCounts } from '../../lib/adminData';
import type { CampaignStatus } from '../../lib/campaigns';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; dot: string }> = {
  draft: { label: 'Brouillon', color: 'bg-stone-100 text-stone-600', dot: 'text-stone-400' },
  scheduled: { label: 'Programmée', color: 'bg-sky-50 text-sky-700', dot: 'text-sky-400' },
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700', dot: 'text-emerald-400' },
  paused: { label: 'En pause', color: 'bg-amber-50 text-amber-700', dot: 'text-amber-400' },
  ended: { label: 'Terminée', color: 'bg-stone-100 text-stone-500', dot: 'text-stone-400' },
  archived: { label: 'Archivée', color: 'bg-stone-100 text-stone-400', dot: 'text-stone-300' },
};

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Circle className={`w-2 h-2 fill-current ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignsWithCounts().then((data) => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Campagnes</h1>
        <p className="text-sm text-stone-500">
          {campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400 text-sm">Aucune campagne pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              to={`/vin/ops-42xf/campaigns/${c.id}`}
              className="block bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-base font-bold text-stone-900 truncate">
                        {c.name}
                      </h2>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-400">
                      <span className="font-mono">{c.slug}</span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 font-medium">
                        {c.campaign_type}
                      </span>
                      {c.is_public && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                          public
                        </span>
                      )}
                      {c.experience_key && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 font-medium">
                          {c.experience_key}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0 mt-1" />
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-500">
                  {c.zone && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {c.zone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {formatDate(c.start_at)} - {formatDate(c.end_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-stone-400" />
                    {c.qr_count} QR{c.qr_count !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <ScanLine className="w-3.5 h-3.5 text-stone-400" />
                    {c.scan_count} scan{c.scan_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
