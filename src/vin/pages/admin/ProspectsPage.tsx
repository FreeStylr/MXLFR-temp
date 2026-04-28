import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Search, Plus, Upload, X, ChevronDown, Pencil, Trash2,
  Check, Loader2, AlertCircle, Download,
} from 'lucide-react';
import {
  fetchProspects, createProspect, updateProspect, deleteProspect,
  bulkInsertProspects, lookupProspectMatches, deriveIndicators,
  PROSPECT_STATUSES, EMPTY_DRAFT,
  type Prospect, type ProspectDraft, type ProspectStatus, type LookupResult,
} from '../../lib/prospects';

const STATUS_COLORS: Record<ProspectStatus, string> = {
  new:              'bg-stone-100 text-stone-600',
  contacted:        'bg-sky-50 text-sky-700',
  interested:       'bg-blue-50 text-blue-700',
  reserved:         'bg-amber-50 text-amber-700',
  paid:             'bg-emerald-50 text-emerald-700',
  fiche_incomplete: 'bg-orange-50 text-orange-700',
  listed:           'bg-teal-50 text-teal-700',
  deferred:         'bg-stone-100 text-stone-500',
  refunded:         'bg-red-50 text-red-600',
  lost:             'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: 'Nouveau', contacted: 'Contacté', interested: 'Intéressé',
  reserved: 'Réservé', paid: 'Payé', fiche_incomplete: 'Fiche incomplète',
  listed: 'Listé', deferred: 'Différé', refunded: 'Remboursé', lost: 'Perdu',
};

// CSV column name -> Prospect field mapping
const CSV_MAP: Record<string, keyof ProspectDraft> = {
  domain_name: 'domain_name', domaine: 'domain_name', 'nom domaine': 'domain_name', name: 'domain_name',
  contact_name_raw: 'contact_name_raw', 'contact name': 'contact_name_raw',
  contact_first_name: 'contact_first_name', prenom: 'contact_first_name', 'first name': 'contact_first_name', firstname: 'contact_first_name',
  contact_last_name: 'contact_last_name', nom: 'contact_last_name', 'last name': 'contact_last_name', lastname: 'contact_last_name',
  gender: 'gender', genre: 'gender', civilite: 'gender',
  primary_mobile: 'primary_mobile', mobile: 'primary_mobile', portable: 'primary_mobile', telephone_mobile: 'primary_mobile',
  landline: 'landline', fixe: 'landline', telephone_fixe: 'landline',
  other_phones: 'other_phones', autres_telephones: 'other_phones',
  email: 'email', 'e-mail': 'email', courriel: 'email',
  website_url: 'website_url', site: 'website_url', website: 'website_url', url: 'website_url',
  association_name: 'association_name', association: 'association_name',
  zip_code: 'zip_code', cp: 'zip_code', code_postal: 'zip_code', 'code postal': 'zip_code',
  town: 'town', ville: 'town', commune: 'town',
  address: 'address', adresse: 'address',
  years_participated: 'years_participated', annees: 'years_participated', participations: 'years_participated',
  status: 'status', statut: 'status',
  short_note: 'short_note', note: 'short_note', notes: 'short_note', commentaire: 'short_note',
  zone_interest: 'zone_interest', zone: 'zone_interest',
  run_month_interest: 'run_month_interest', mois: 'run_month_interest',
  source: 'source',
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];
  const delim = lines[0].includes(';') ? ';' : ',';

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ;
      } else if (ch === delim && !inQ) { result.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function csvRowToProspect(row: Record<string, string>): ProspectDraft {
  const draft = { ...EMPTY_DRAFT, source: 'csv' };
  for (const [csvKey, val] of Object.entries(row)) {
    const field = CSV_MAP[csvKey.toLowerCase().trim()];
    if (field && val) {
      if (field === 'published') {
        (draft as Record<string, unknown>)[field] = val.toLowerCase() === 'true' || val === '1';
      } else {
        (draft as Record<string, unknown>)[field] = val;
      }
    }
  }
  return draft;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProspectStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-stone-100 text-stone-500'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface EditPanelProps {
  prospect: Prospect | null;
  onClose: () => void;
  onSave: (id: string | null, draft: ProspectDraft) => Promise<void>;
}

function EditPanel({ prospect, onClose, onSave }: EditPanelProps) {
  const [form, setForm] = useState<ProspectDraft>(prospect ? { ...prospect } : { ...EMPTY_DRAFT });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (field: keyof ProspectDraft, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.domain_name.trim() && !form.contact_last_name.trim()) {
      setErr('Renseignez au moins le nom du domaine ou le nom du contact.');
      return;
    }
    setSaving(true); setErr('');
    try { await onSave(prospect?.id ?? null, form); onClose(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Erreur inconnue'); }
    finally { setSaving(false); }
  };

  const field = (label: string, key: keyof ProspectDraft, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
      <input
        type={type}
        value={String(form[key] ?? '')}
        onChange={e => set(key, e.target.value)}
        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-stone-800 text-sm">
            {prospect ? 'Modifier le prospect' : 'Nouveau prospect'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {field('Domaine / Structure', 'domain_name')}
            {field('Nom brut (import)', 'contact_name_raw')}
            {field('Prénom', 'contact_first_name')}
            {field('Nom', 'contact_last_name')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Genre</label>
              <select
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400"
              >
                <option value="">—</option>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as ProspectStatus)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400"
              >
                {PROSPECT_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('Mobile principal', 'primary_mobile', 'tel')}
            {field('Fixe', 'landline', 'tel')}
          </div>

          {field('Autres téléphones', 'other_phones')}
          {field('Email', 'email', 'email')}
          {field('Site internet', 'website_url', 'url')}

          <div className="grid grid-cols-2 gap-3">
            {field('CP', 'zip_code')}
            {field('Ville', 'town')}
          </div>

          {field('Adresse', 'address')}
          {field('Association', 'association_name')}
          {field('Années de participation', 'years_participated')}

          <div className="grid grid-cols-2 gap-3">
            {field('Zone intérêt', 'zone_interest')}
            {field('Mois intérêt', 'run_month_interest')}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Note courte</label>
            <textarea
              value={form.short_note}
              onChange={e => set('short_note', e.target.value)}
              rows={2}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 resize-none"
            />
          </div>

          <div className="pt-1 border-t border-stone-100 space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Conversion</p>
            {field('Réf. réservation', 'reservation_ref')}
            {field('Statut paiement', 'payment_status')}
            {field('Slug fiche listée', 'listed_profile_slug')}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pub-check"
                checked={form.published}
                onChange={e => set('published', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="pub-check" className="text-sm text-stone-700">Publié</label>
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{err}
            </div>
          )}

          <div className="pt-2 pb-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ImportPanelProps {
  onClose: () => void;
  onImport: (rows: ProspectDraft[]) => Promise<void>;
}

function ImportPanel({ onClose, onImport }: ImportPanelProps) {
  const [preview, setPreview] = useState<ProspectDraft[]>([]);
  const [rawRows, setRawRows] = useState<ProspectDraft[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text).map(csvRowToProspect);
        setRawRows(rows);
        setPreview(rows.slice(0, 5));
        setErr('');
      } catch { setErr('Impossible de lire le fichier CSV.'); }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!rawRows.length) return;
    setImporting(true); setErr('');
    try { await onImport(rawRows); setDone(true); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Erreur import'); }
    finally { setImporting(false); }
  };

  const PREVIEW_COLS = ['domain_name', 'contact_first_name', 'contact_last_name', 'primary_mobile', 'email', 'town', 'status'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 text-sm">Import CSV</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!done ? (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all"
              >
                <Upload className="w-7 h-7 text-stone-400 mx-auto mb-3" />
                <p className="text-sm text-stone-600 font-medium">Déposez votre CSV ici ou cliquez</p>
                <p className="text-xs text-stone-400 mt-1">Séparateur virgule ou point-virgule · UTF-8</p>
                <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>

              {rawRows.length > 0 && (
                <>
                  <p className="text-xs text-stone-500">
                    <span className="font-semibold text-stone-700">{rawRows.length}</span> lignes détectées · aperçu des 5 premières
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-stone-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-100">
                          {PREVIEW_COLS.map(k => (
                            <th key={k} className="text-left px-3 py-2 font-semibold text-stone-500">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-b border-stone-50 last:border-0">
                            {PREVIEW_COLS.map(k => (
                              <td key={k} className="px-3 py-2 text-stone-600 truncate max-w-[120px]">{String(row[k] ?? '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {err && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5" />{err}
                    </div>
                  )}

                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {importing ? 'Import en cours…' : `Importer ${rawRows.length} prospects`}
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-semibold text-stone-800 mb-1">{rawRows.length} prospects importés</p>
              <p className="text-sm text-stone-500">Les données sont disponibles dans la liste.</p>
              <button onClick={onClose} className="mt-6 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-all">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

interface ProspectsPageProps {
  opsToken: string;
}

export function ProspectsPage({ opsToken }: ProspectsPageProps) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lookup, setLookup] = useState<LookupResult>({ reservations: [], profiles: [] });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'' | 'true' | 'false'>('');
  const [editTarget, setEditTarget] = useState<Prospect | null | 'new'>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const result = await fetchProspects(opsToken, {
        search: search.trim(), status: statusFilter, published: publishedFilter, limit: 200,
      });
      const rows = result.data ?? [];
      setProspects(rows);
      setTotal(result.count ?? 0);
      // Fire lookup in parallel; failures are silent (indicators just won't show)
      lookupProspectMatches(opsToken, rows).then(setLookup).catch(() => {});
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally { setLoading(false); }
  }, [opsToken, search, statusFilter, publishedFilter]);

  useEffect(() => { load(); }, [load]);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(load, 350);
  };

  const handleSave = async (id: string | null, draft: ProspectDraft) => {
    if (id) {
      const updated = await updateProspect(opsToken, id, draft);
      setProspects(ps => ps.map(p => p.id === id ? updated : p));
    } else {
      const created = await createProspect(opsToken, draft);
      setProspects(ps => [created, ...ps]);
      setTotal(t => t + 1);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProspect(opsToken, id);
    setProspects(ps => ps.filter(p => p.id !== id));
    setTotal(t => t - 1);
    setDeleteConfirm(null);
  };

  const handleImport = async (rows: ProspectDraft[]) => {
    await bulkInsertProspects(opsToken, rows);
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-stone-800">Prospects</h1>
          <p className="text-xs text-stone-400 mt-0.5">{total} entrée{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => setEditTarget('new')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Domaine, nom, email, mobile, ville…"
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
            {PROSPECT_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={publishedFilter}
            onChange={e => setPublishedFilter(e.target.value as '' | 'true' | 'false')}
            className="appearance-none bg-white border border-stone-200 rounded-lg pl-3 pr-7 py-2 text-xs outline-none focus:border-stone-400 cursor-pointer"
          >
            <option value="">Tous</option>
            <option value="true">Publiés</option>
            <option value="false">Non publiés</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {err}
          <button onClick={load} className="ml-auto underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : prospects.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm">
          {search || statusFilter || publishedFilter ? 'Aucun résultat.' : 'Aucun prospect. Importez un CSV ou ajoutez manuellement.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-semibold text-stone-500 whitespace-nowrap">Domaine</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Prénom</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Nom</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Mobile</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Fixe</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Email</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Ville</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Statut</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Note</th>
                  <th className="text-left px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Pub.</th>
                  <th className="text-center px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Rés.</th>
                  <th className="text-center px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Payé</th>
                  <th className="text-center px-3 py-3 font-semibold text-stone-500 whitespace-nowrap">Listé</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {prospects.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors group">
                    <td className="px-4 py-3 font-medium text-stone-800 max-w-[160px] truncate">{p.domain_name || '—'}</td>
                    <td className="px-3 py-3 text-stone-600 whitespace-nowrap">{p.contact_first_name || '—'}</td>
                    <td className="px-3 py-3 text-stone-600 whitespace-nowrap">{p.contact_last_name || '—'}</td>
                    <td className="px-3 py-3 text-stone-600 whitespace-nowrap font-mono">{p.primary_mobile || '—'}</td>
                    <td className="px-3 py-3 text-stone-500 whitespace-nowrap font-mono">{p.landline || '—'}</td>
                    <td className="px-3 py-3 text-stone-500 max-w-[160px] truncate">{p.email || '—'}</td>
                    <td className="px-3 py-3 text-stone-500 whitespace-nowrap">{p.town || '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><StatusBadge status={p.status as ProspectStatus} /></td>
                    <td className="px-3 py-3 text-stone-400 max-w-[140px] truncate">{p.short_note || ''}</td>
                    <td className="px-3 py-3 text-center">
                      {p.published
                        ? <span className="inline-flex w-4 h-4 rounded-full bg-emerald-400 mx-auto" title="Publié" />
                        : <span className="inline-flex w-4 h-4 rounded-full bg-stone-200 mx-auto" title="Non publié" />}
                    </td>
                    {(() => {
                      const ind = deriveIndicators(p, lookup);
                      return (
                        <>
                          <td className="px-3 py-3 text-center">
                            {ind.reserved
                              ? <span
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold cursor-default"
                                  title={ind.reservationRef ? `Réf: ${ind.reservationRef} · ${ind.paymentStatus}` : ind.paymentStatus}
                                >R</span>
                              : <span className="inline-flex w-4 h-4 rounded-full bg-stone-100 mx-auto" />}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {ind.paid
                              ? <span
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold cursor-default"
                                  title={ind.reservationRef ? `Réf: ${ind.reservationRef}` : 'Payé'}
                                >P</span>
                              : <span className="inline-flex w-4 h-4 rounded-full bg-stone-100 mx-auto" />}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {ind.listed
                              ? <span
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[9px] font-bold cursor-default"
                                  title={ind.profileSlug ? `/${ind.profileSlug}` : 'Listé'}
                                >L</span>
                              : <span className="inline-flex w-4 h-4 rounded-full bg-stone-100 mx-auto" />}
                          </td>
                        </>
                      );
                    })()}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditTarget(p)}
                          className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-all"
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-all text-[10px] font-semibold"
                            >Suppr.</button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 transition-all">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-stone-300 hover:text-red-500 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 200 && (
            <div className="px-4 py-3 border-t border-stone-100 text-xs text-stone-400 text-center">
              Affichage des 200 premiers résultats sur {total}. Affinez la recherche pour voir plus.
            </div>
          )}
        </div>
      )}

      {editTarget !== null && (
        <EditPanel
          prospect={editTarget === 'new' ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}

      {showImport && (
        <ImportPanel
          onClose={() => { setShowImport(false); load(); }}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
