import { useEffect, useState } from 'react';
import { Search, Wine, Leaf, Fish, Award, GlassWater, X } from 'lucide-react';
import { supabase, WineryProfile } from '../lib/supabase';
import { WineryCard } from '../components/WineryCard';

const WINE_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'rouge', label: 'Rouge' },
  { key: 'blanc', label: 'Blanc' },
  { key: 'rose', label: 'Rosé' },
  { key: 'bulles', label: 'Bulles' },
];

interface DomainesPageProps {
  onViewCard: (slug: string) => void;
}

export function DomainesPage({ onViewCard }: DomainesPageProps) {
  const [wineries, setWineries] = useState<WineryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wineFilter, setWineFilter] = useState('');
  const [bioOnly, setBioOnly] = useState(false);
  const [sansAlcoolOnly, setSansAlcoolOnly] = useState(false);
  const [associationOnly, setAssociationOnly] = useState(false);
  const [originFilter, setOriginFilter] = useState('');

  useEffect(() => {
    supabase
      .from('wine_profiles')
      .select('*')
      .eq('is_published', true)
      .order('domaine_name')
      .then(({ data }) => {
        setWineries((data as WineryProfile[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = wineries.filter((w) => {
    const matchSearch =
      !search ||
      w.domaine_name.toLowerCase().includes(search.toLowerCase()) ||
      w.town.toLowerCase().includes(search.toLowerCase()) ||
      w.appellation.toLowerCase().includes(search.toLowerCase()) ||
      (w.appellation_name || '').toLowerCase().includes(search.toLowerCase());
    const matchWine = !wineFilter || w.wine_types.includes(wineFilter);
    const matchBio = !bioOnly || w.is_organic || w.bio_ab;
    const matchSansAlcool = !sansAlcoolOnly || w.has_non_alcoholic;
    const matchAssociation =
      !associationOnly ||
      (w.association_member_status === 'member' && w.association_badge_enabled);
    const matchOrigin =
      !originFilter ||
      (originFilter === 'aop-aoc'
        ? w.origin_scheme_type === 'AOP' || w.origin_scheme_type === 'AOC'
        : w.origin_scheme_type === originFilter);
    return matchSearch && matchWine && matchBio && matchSansAlcool && matchAssociation && matchOrigin;
  });

  const hasAssociationMembers = wineries.some(
    (w) => w.association_member_status === 'member' && w.association_badge_enabled,
  );
  const hasAopAoc = wineries.some(
    (w) => w.origin_scheme_type === 'AOP' || w.origin_scheme_type === 'AOC',
  );
  const hasIgp = wineries.some((w) => w.origin_scheme_type === 'IGP');

  const anyFilter = !!(wineFilter || bioOnly || sansAlcoolOnly || associationOnly || originFilter || search);

  const chip = (active: boolean) =>
    active
      ? 'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all bg-cypress-600 text-white border border-cypress-600 shadow-sm'
      : 'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all bg-white border border-warm-200 text-warm-600 hover:border-cypress-300 hover:text-cypress-700';

  return (
    <div className="min-h-screen bg-warm-50 pt-16">

      <div className="sticky top-16 z-30 bg-white border-b border-warm-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-3 pb-2.5">
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Domaine, commune, appellation…"
              className="w-full pl-9 pr-9 py-2.5 bg-warm-50 border border-warm-200 focus:border-cypress-400 focus:bg-white rounded-xl text-sm outline-none text-slate-900 placeholder-warm-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {WINE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setWineFilter(f.key)}
                className={chip(wineFilter === f.key)}
              >
                {f.label}
              </button>
            ))}
            <div className="w-px bg-warm-200 self-stretch mx-0.5 flex-shrink-0" />
            <button onClick={() => setBioOnly(!bioOnly)} className={chip(bioOnly) + ' flex items-center gap-1'}>
              <Leaf className="w-3 h-3" /> Bio
            </button>
            <button onClick={() => setSansAlcoolOnly(!sansAlcoolOnly)} className={chip(sansAlcoolOnly) + ' flex items-center gap-1'}>
              <GlassWater className="w-3 h-3" /> Sans alcool
            </button>
            {hasAssociationMembers && (
              <button onClick={() => setAssociationOnly(!associationOnly)} className={chip(associationOnly) + ' flex items-center gap-1'}>
                <Fish className="w-3 h-3" /> Route
              </button>
            )}
            {hasAopAoc && (
              <button onClick={() => setOriginFilter(originFilter === 'aop-aoc' ? '' : 'aop-aoc')} className={chip(originFilter === 'aop-aoc') + ' flex items-center gap-1'}>
                <Award className="w-3 h-3" /> AOP/AOC
              </button>
            )}
            {hasIgp && (
              <button onClick={() => setOriginFilter(originFilter === 'IGP' ? '' : 'IGP')} className={chip(originFilter === 'IGP') + ' flex items-center gap-1'}>
                <Award className="w-3 h-3" /> IGP
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-4 pb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
            {loading ? 'Chargement…' : `${filtered.length} domaine${filtered.length !== 1 ? 's' : ''}`}
          </span>
          {anyFilter && (
            <button
              onClick={() => { setWineFilter(''); setBioOnly(false); setSansAlcoolOnly(false); setAssociationOnly(false); setOriginFilter(''); setSearch(''); }}
              className="text-xs font-semibold text-cypress-600 hover:text-cypress-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-warm-200 h-60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 border border-warm-200 flex items-center justify-center mb-4">
              <Wine className="w-7 h-7 text-warm-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Aucun domaine</h3>
            <p className="text-warm-400 text-sm">Modifiez vos critères</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((winery) => (
              <WineryCard key={winery.id} winery={winery} compact onViewCard={onViewCard} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
