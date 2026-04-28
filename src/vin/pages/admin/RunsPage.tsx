import { useEffect, useState } from 'react';
import {
  Loader2, AlertCircle, Pencil, X, Check, Save, Plus,
  CalendarClock, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { fetchAllRuns, updateRun, createRun, isRunOpen, type Run } from '../../lib/runs';

interface RunsPageProps {
  opsToken: string;
}

type EditState = { id: string | null; label: string; cutoff_date: string; distribution_label: string; sort_order: number; is_active: boolean };

const EMPTY_EDIT: EditState = {
  id: null,
  label: '',
  cutoff_date: '',
  distribution_label: '',
  sort_order: 0,
  is_active: true,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function RunsPage({ opsToken }: RunsPageProps) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true); setErr('');
    fetchAllRuns(opsToken)
      .then(data => { setRuns(data); setLoading(false); })
      .catch(e => { setErr(e instanceof Error ? e.message : 'Erreur de chargement'); setLoading(false); });
  };

  useEffect(() => { load(); }, [opsToken]);

  const openNew = () => setEditing({ ...EMPTY_EDIT, sort_order: runs.length + 1 });

  const openEdit = (r: Run) => setEditing({
    id: r.id,
    label: r.label,
    cutoff_date: r.cutoff_date,
    distribution_label: r.distribution_label,
    sort_order: r.sort_order,
    is_active: r.is_active,
  });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.label.trim() || !editing.cutoff_date) {
      setSaveErr('Le label et la date limite sont requis.');
      return;
    }
    setSaving(true); setSaveErr(''); setSaved(false);
    try {
      if (editing.id) {
        const updated = await updateRun(opsToken, editing.id, {
          label: editing.label.trim(),
          cutoff_date: editing.cutoff_date,
          distribution_label: editing.distribution_label.trim(),
          sort_order: editing.sort_order,
          is_active: editing.is_active,
        });
        setRuns(prev => prev.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await createRun(opsToken, {
          label: editing.label.trim(),
          cutoff_date: editing.cutoff_date,
          distribution_label: editing.distribution_label.trim(),
          sort_order: editing.sort_order,
          is_active: editing.is_active,
        });
        setRuns(prev => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      }
      setSaved(true);
      setEditing(null);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: Run) => {
    try {
      const updated = await updateRun(opsToken, r.id, { is_active: !r.is_active });
      setRuns(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-stone-800">Éditions (Runs)</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Gérez les éditions disponibles dans le formulaire de réservation.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle édition
        </button>
      </div>

      {err && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {err}
          <button onClick={load} className="ml-auto underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-lg">
          <Check className="w-4 h-4 flex-shrink-0" />
          Enregistré.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm">Aucune édition. Créez-en une.</div>
      ) : (
        <div className="space-y-2">
          {runs.map(r => {
            const open = isRunOpen(r.cutoff_date);
            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border px-5 py-4 flex items-center gap-4 transition-all ${
                  r.is_active ? 'border-stone-200' : 'border-stone-100 opacity-60'
                }`}
              >
                {/* Sort order badge */}
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 flex-shrink-0">
                  {r.sort_order}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-stone-800">{r.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      open
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      {open ? 'Ouvert' : 'Fermé'}
                    </span>
                    {!r.is_active && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-400">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-stone-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="w-3 h-3 text-stone-400" />
                      Limite&nbsp;: {fmtDate(r.cutoff_date)}
                    </span>
                    {r.distribution_label && (
                      <span>Distribution&nbsp;: {r.distribution_label}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(r)}
                    className="text-stone-400 hover:text-stone-700 transition-colors"
                    title={r.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {r.is_active
                      ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                      : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-all"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="fixed inset-0 bg-black/30" onClick={() => setEditing(null)} />
          <div className="relative z-10 w-full max-w-sm h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-stone-800 text-sm">
                {editing.id ? 'Modifier l\'édition' : 'Nouvelle édition'}
              </h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Label *</label>
                <input
                  type="text"
                  value={editing.label}
                  onChange={e => setEditing(s => s && ({ ...s, label: e.target.value }))}
                  placeholder="Ex: Août 2026"
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Date limite d'inscription *</label>
                <input
                  type="date"
                  value={editing.cutoff_date}
                  onChange={e => setEditing(s => s && ({ ...s, cutoff_date: e.target.value }))}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 transition-colors"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Dernière date à laquelle une réservation est acceptée pour cette édition.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Date de distribution (affichage)</label>
                <input
                  type="text"
                  value={editing.distribution_label}
                  onChange={e => setEditing(s => s && ({ ...s, distribution_label: e.target.value }))}
                  placeholder="Ex: 31 juillet 2026"
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={e => setEditing(s => s && ({ ...s, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 transition-colors"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setEditing(s => s && ({ ...s, is_active: !s.is_active }))}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${editing.is_active ? 'bg-emerald-500' : 'bg-stone-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${editing.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-stone-700">Visible dans le formulaire de réservation</span>
              </label>

              {saveErr && (
                <p className="text-xs text-red-600">{saveErr}</p>
              )}

              <div className="pt-2 pb-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
