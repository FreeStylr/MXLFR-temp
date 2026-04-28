import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Search, X, ChevronDown, Loader2, AlertCircle, ExternalLink, ChevronRight,
  ShieldAlert, Save,
} from 'lucide-react';
import { RUNS } from '../../components/ReservationModal';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FN_BASE = `${SUPABASE_URL}/functions/v1/ops-prospects`;

export interface Reservation {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  structure_name: string;
  structure_type: string;
  town: string;
  zip_code: string;
  email: string;
  mobile: string;
  zone: string;
  payment_method: string | null;
  payment_reference: string;
  status: string;
  allocated_code: string;
  notes: string;
  run_month: string | null;
  cutoff_date: string | null;
  manual_override: boolean;
  override_note: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  awaiting_wire:         'bg-amber-50 text-amber-700',
  awaiting_card_payment: 'bg-sky-50 text-sky-700',
  coop_lead:             'bg-stone-100 text-stone-600',
  paid:                  'bg-emerald-50 text-emerald-700',
  completed:             'bg-emerald-100 text-emerald-800',
  payment_confirmed:     'bg-emerald-50 text-emerald-700',
  success:               'bg-emerald-50 text-emerald-700',
  refunded:              'bg-red-50 text-red-600',
  cancelled:             'bg-stone-100 text-stone-400',
};

const STATUS_LABELS: Record<string, string> = {
  awaiting_wire:         'Virement attendu',
  awaiting_card_payment: 'CB en attente',
  coop_lead:             'Coop',
  paid:                  'Payé',
  completed:             'Complété',
  payment_confirmed:     'Paiement confirmé',
  success:               'Succès',
  refunded:              'Remboursé',
  cancelled:             'Annulé',
};

const METHOD_LABELS: Record<string, string> = {
  wire:   'Virement',
  card:   'CB',
  null:   'Coop',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-stone-100 text-stone-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

async function fetchReservations(
  opsToken: string,
  opts: { search?: string; status?: string; payment_method?: string; limit?: number } = {},
): Promise<{ data: Reservation[]; count: number }> {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.status) params.set('status', opts.status);
  if (opts.payment_method) params.set('payment_method', opts.payment_method);
  params.set('limit', String(opts.limit ?? 300));
  const res = await fetch(`${FN_BASE}/reservations?${params}`, {
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Apikey': ANON_KEY,
      'X-Ops-Token': opsToken,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data;
}

async function patchReservation(
  opsToken: string,
  id: string,
  patch: Partial<Pick<Reservation, 'manual_override' | 'override_note' | 'status' | 'run_month' | 'cutoff_date' | 'notes'>>,
): Promise<Reservation> {
  const res = await fetch(`${FN_BASE}/reservations/${id}`, {
    method: 'PATCH',
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

// ── Detail panel ────────────────────────────────────────────────────────────

function DetailPanel({
  r: initial,
  opsToken,
  onClose,
  onUpdated,
}: {
  r: Reservation;
  opsToken: string;
  onClose: () => void;
  onUpdated: (updated: Reservation) => void;
}) {
  const [r, setR] = useState(initial);
  const isWire = r.payment_method === 'wire';

  // Override edit state
  const [overrideOn, setOverrideOn] = useState(r.manual_override);
  const [overrideNote, setOverrideNote] = useState(r.override_note ?? '');
  const [runMonth, setRunMonth] = useState(r.run_month ?? '');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saved, setSaved] = useState(false);

  const isDirty = overrideOn !== r.manual_override
    || overrideNote !== (r.override_note ?? '')
    || runMonth !== (r.run_month ?? '');

  const handleSaveOverride = async () => {
    setSaving(true); setSaveErr(''); setSaved(false);
    try {
      const updated = await patchReservation(opsToken, r.id, {
        manual_override: overrideOn,
        override_note: overrideNote.trim() || null,
        run_month: runMonth || null,
      });
      setR(updated);
      setOverrideOn(updated.manual_override);
      setOverrideNote(updated.override_note ?? '');
      setRunMonth(updated.run_month ?? '');
      setSaved(true);
      onUpdated(updated);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-stone-800 text-sm truncate max-w-[280px]">
            {r.structure_name || `${r.first_name} ${r.last_name}`}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Status + method */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={r.status} />
            {r.payment_method && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-600">
                {METHOD_LABELS[r.payment_method] ?? r.payment_method}
              </span>
            )}
            {r.manual_override && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldAlert className="w-3 h-3" /> Exception manuelle
              </span>
            )}
          </div>

          {/* Reference */}
          {r.payment_reference && (
            <div>
              <p className="text-xs text-stone-400 font-medium mb-1">Référence</p>
              <p className="text-sm font-mono text-stone-800 bg-stone-50 px-3 py-2 rounded-lg break-all">{r.payment_reference}</p>
            </div>
          )}

          {/* Run + cutoff */}
          {(r.run_month || r.cutoff_date) && (
            <div className="space-y-1.5">
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Édition</p>
              <div className="grid grid-cols-2 gap-x-4 text-sm">
                {r.run_month && (
                  <div>
                    <span className="text-xs text-stone-400">Run</span>
                    <p className="text-stone-700 font-medium">{r.run_month}</p>
                  </div>
                )}
                {r.cutoff_date && (
                  <div>
                    <span className="text-xs text-stone-400">Date limite</span>
                    <p className="text-stone-700">{fmtDate(r.cutoff_date)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Contact</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div>
                <span className="text-xs text-stone-400">Prénom</span>
                <p className="text-stone-700">{r.first_name || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-stone-400">Nom</span>
                <p className="text-stone-700">{r.last_name || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-stone-400">Structure</span>
                <p className="text-stone-700">{r.structure_name || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-stone-400">Email</span>
                <p className="text-stone-700 break-all">{r.email || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-stone-400">Mobile</span>
                <p className="text-stone-700 font-mono">{r.mobile || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-stone-400">Ville</span>
                <p className="text-stone-700">{r.town || '—'}{r.zip_code ? ` (${r.zip_code})` : ''}</p>
              </div>
              {r.zone && (
                <div>
                  <span className="text-xs text-stone-400">Zone</span>
                  <p className="text-stone-700">{r.zone}</p>
                </div>
              )}
              {r.structure_type && (
                <div>
                  <span className="text-xs text-stone-400">Type</span>
                  <p className="text-stone-700">{r.structure_type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-1.5">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Dates</p>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <div>
                <span className="text-xs text-stone-400">Créé</span>
                <p className="text-stone-700">{fmtDate(r.created_at)}</p>
              </div>
              {r.updated_at && r.updated_at !== r.created_at && (
                <div>
                  <span className="text-xs text-stone-400">Mis à jour</span>
                  <p className="text-stone-700">{fmtDate(r.updated_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {r.notes && (
            <div>
              <p className="text-xs text-stone-400 font-medium mb-1">Notes</p>
              <p className="text-sm text-stone-600 bg-stone-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{r.notes}</p>
            </div>
          )}

          {/* Manual override section */}
          <div className="border-t border-stone-100 pt-4 space-y-3">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Override ops
            </p>

            <div>
              <p className="text-xs text-stone-400 mb-1.5">Édition assignée</p>
              <div className="relative">
                <select
                  value={runMonth}
                  onChange={e => setRunMonth(e.target.value)}
                  className="appearance-none w-full bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-7 py-2 text-xs outline-none focus:border-stone-400 cursor-pointer text-stone-700"
                >
                  <option value="">— non définie —</option>
                  {RUNS.map(r => (
                    <option key={r.label} value={r.label}>{r.label} (limite {r.cutoffDate})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setOverrideOn(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${overrideOn ? 'bg-amber-500' : 'bg-stone-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${overrideOn ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </button>
              <span className="text-xs text-stone-600 group-hover:text-stone-800 transition-colors">
                Exception manuelle approuvée
              </span>
            </label>

            {overrideOn && (
              <textarea
                value={overrideNote}
                onChange={e => setOverrideNote(e.target.value)}
                placeholder="Note interne : raison de l'exception…"
                rows={2}
                className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-stone-400 resize-none bg-stone-50 text-stone-700 placeholder:text-stone-300"
              />
            )}

            {saveErr && (
              <p className="text-xs text-red-600">{saveErr}</p>
            )}

            {isDirty && (
              <button
                onClick={handleSaveOverride}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Enregistrer
              </button>
            )}
            {saved && !isDirty && (
              <p className="text-xs text-emerald-600 font-medium">Enregistré.</p>
            )}
          </div>

          {/* Quick links */}
          {(isWire || r.payment_reference) && (
            <div className="pt-1 border-t border-stone-100 space-y-2">
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Liens rapides</p>
              {isWire && r.payment_reference && (
                <a
                  href={`/vin/proforma/${r.payment_reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-3 py-2 rounded-lg transition-all border border-stone-100"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  Proforma — {r.payment_reference}
                </a>
              )}
              {r.payment_reference && (
                <a
                  href={`/vin/finaliser?ref=${r.payment_reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-3 py-2 rounded-lg transition-all border border-stone-100"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  Finaliser fiche — {r.payment_reference}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

const ALL_STATUSES = [
  'awaiting_wire', 'awaiting_card_payment', 'coop_lead',
  'paid', 'completed', 'payment_confirmed', 'success',
  'refunded', 'cancelled',
];

interface ReservationsPageProps {
  opsToken: string;
}

export function ReservationsPage({ opsToken }: ReservationsPageProps) {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const result = await fetchReservations(opsToken, {
        search: search.trim(),
        status: statusFilter,
        payment_method: methodFilter,
      });
      setRows(result.data ?? []);
      setTotal(result.count ?? 0);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally { setLoading(false); }
  }, [opsToken, search, statusFilter, methodFilter]);

  useEffect(() => { load(); }, [load]);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(load, 350);
  };

  // Derive summary counts from loaded rows (not filtered)
  const paid = rows.filter(r => ['paid', 'completed', 'payment_confirmed', 'success'].includes(r.status)).length;
  const wire = rows.filter(r => r.payment_method === 'wire').length;
  const card = rows.filter(r => r.payment_method === 'card').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-stone-800">Réservations</h1>
          <p className="text-xs text-stone-400 mt-0.5">{total} entrée{total !== 1 ? 's' : ''}</p>
        </div>
        {!loading && rows.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              {paid} payé{paid !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />
              {wire} virement{wire !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-300 inline-block" />
              {card} CB
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Structure, email, mobile, réf, ville…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-lg pl-8 pr-4 py-2 text-xs outline-none focus:border-stone-400 transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); load(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-stone-200 rounded-lg pl-3 pr-7 py-2 text-xs outline-none focus:border-stone-400 cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="appearance-none bg-white border border-stone-200 rounded-lg pl-3 pr-7 py-2 text-xs outline-none focus:border-stone-400 cursor-pointer"
          >
            <option value="">Tous modes</option>
            <option value="wire">Virement</option>
            <option value="card">CB</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {err}
          <button onClick={load} className="ml-auto underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm">
          {search || statusFilter || methodFilter ? 'Aucun résultat pour ces filtres.' : 'Aucune réservation.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-semibold text-stone-500 whitespace-nowrap">Réf. paiement</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Structure</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Email</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Mobile</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Mode</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Statut</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Édition</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Créé</th>
                  <th className="px-3 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {rows.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => setDetail(r)}
                    className="hover:bg-stone-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-mono text-stone-700 whitespace-nowrap">
                      {r.payment_reference || '—'}
                    </td>
                    <td className="px-3 py-3 max-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-stone-800 truncate">
                          {r.structure_name || `${r.first_name} ${r.last_name}`.trim() || '—'}
                        </span>
                        {r.manual_override && (
                          <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" title="Exception manuelle" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-stone-500 max-w-[160px] truncate">{r.email || '—'}</td>
                    <td className="px-3 py-3 text-stone-500 font-mono whitespace-nowrap">{r.mobile || '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {r.payment_method
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-600">
                            {METHOD_LABELS[r.payment_method] ?? r.payment_method}
                          </span>
                        : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3 text-stone-500 whitespace-nowrap">{r.run_month || <span className="text-stone-300">—</span>}</td>
                    <td className="px-3 py-3 text-stone-400 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="px-3 py-3 text-stone-300 group-hover:text-stone-500 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 300 && (
            <div className="px-4 py-3 border-t border-stone-100 text-xs text-stone-400 text-center">
              Affichage des 300 premiers résultats sur {total}. Affinez la recherche pour voir plus.
            </div>
          )}
        </div>
      )}

      {detail && (
        <DetailPanel
          r={detail}
          opsToken={opsToken}
          onClose={() => setDetail(null)}
          onUpdated={(updated) => {
            setRows(prev => prev.map(row => row.id === updated.id ? updated : row));
            setDetail(updated);
          }}
        />
      )}
    </div>
  );
}
