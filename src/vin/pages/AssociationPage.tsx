import { useEffect, useState } from 'react';
import { Fish, ArrowRight, Award, ChevronRight, Shield } from 'lucide-react';
import { supabase, WineryProfile } from '../lib/supabase';
import { getAssociationById } from '../lib/associations';
import { WineryCard } from '../components/WineryCard';

const ASSOCIATION_ID = 'route-des-vignerons-et-des-pecheurs';

interface AssociationPageProps {
  onViewCard: (slug: string) => void;
  onNavigate: (page: string) => void;
  onJoinViaInvite?: (token: string) => void;
}

export function AssociationPage({ onViewCard, onNavigate, onJoinViaInvite }: AssociationPageProps) {
  const [members, setMembers] = useState<WineryProfile[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const association = getAssociationById(ASSOCIATION_ID);

  useEffect(() => {
    Promise.all([
      supabase
        .from('wine_profiles')
        .select('*')
        .eq('is_published', true)
        .eq('association_id', ASSOCIATION_ID)
        .eq('association_member_status', 'member')
        .eq('association_badge_enabled', true)
        .order('domaine_name'),
      supabase
        .from('wine_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', false)
        .eq('association_id', ASSOCIATION_ID)
        .eq('association_member_status', 'member'),
    ]).then(([publishedRes, pendingRes]) => {
      setMembers((publishedRes.data as WineryProfile[]) || []);
      setPendingCount(pendingRes.count ?? 0);
      setLoading(false);
    });
  }, []);

  if (!association) return null;

  const demoInviteToken = 'route-invite-2026-demo';
  const organicCount = loading ? null : members.filter((m) => m.bio_ab || m.is_organic).length;
  const appellationCount = loading
    ? null
    : new Set(members.map((m) => m.origin_scheme_type).filter((t) => t && t !== 'none')).size;

  return (
    <div className="min-h-screen bg-warm-50 pt-16">

      <div className="bg-white border-b border-warm-200">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cypress-50 border border-cypress-200 rounded-full text-[11px] font-bold text-cypress-700 uppercase tracking-widest mb-4">
            <Fish className="w-3 h-3 text-cypress-600" />
            Partenaire structurant · Vinocap 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-2">
            Route des Vignerons<br />& des Pêcheurs
          </h1>
          <p className="text-warm-500 text-sm max-w-md leading-relaxed">
            Association du littoral héraultais portant une valorisation commune des producteurs ancrée dans la Méditerranée.
          </p>

          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-warm-200">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">{loading ? '—' : members.length}</div>
              <div className="text-[11px] text-warm-400 mt-0.5">membres</div>
            </div>
            <div className="w-px h-8 bg-warm-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">{loading ? '—' : organicCount ?? 0}</div>
              <div className="text-[11px] text-warm-400 mt-0.5">en bio</div>
            </div>
            <div className="w-px h-8 bg-warm-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">{loading ? '—' : appellationCount ?? 0}</div>
              <div className="text-[11px] text-warm-400 mt-0.5">appellations</div>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => onJoinViaInvite?.(demoInviteToken)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cypress-600 hover:bg-cypress-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Créer ma fiche
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 space-y-8">

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: 'Badge visible', desc: 'Sur chaque fiche membre' },
            { icon: Fish, label: 'Page dédiée', desc: 'Accessible depuis la nav' },
            { icon: Award, label: 'Appartenance', desc: 'Affirmée, pas cachée' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white border border-warm-200 rounded-2xl p-3.5 text-center">
                <div className="w-8 h-8 rounded-xl bg-warm-100 border border-warm-200 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-warm-600" />
                </div>
                <div className="font-bold text-slate-900 text-xs">{item.label}</div>
                <div className="text-warm-400 text-[10px] mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">
              Domaines membres
            </h2>
            <button
              onClick={() => onNavigate('domaines')}
              className="text-xs font-semibold text-cypress-600 hover:text-cypress-700 flex items-center gap-1"
            >
              Tous les domaines <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {!loading && pendingCount > 0 && (
            <div className="flex items-center gap-3 mb-3 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-800 font-medium">
                {pendingCount} dossier{pendingCount > 1 ? 's' : ''} en cours de validation
              </span>
              <span className="text-xs text-amber-500 ml-auto">À venir</span>
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-warm-200 h-60 animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-warm-200 rounded-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-warm-100 border border-warm-200 flex items-center justify-center mb-3">
                <Fish className="w-5 h-5 text-warm-300" />
              </div>
              <p className="text-warm-500 font-medium text-sm mb-1">Aucun membre publié</p>
              <p className="text-warm-400 text-xs">Les vignerons invités apparaîtront ici.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((winery) => (
                <WineryCard key={winery.id} winery={winery} compact onViewCard={onViewCard} />
              ))}
            </div>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-white border border-warm-200 p-6">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cypress-50 border border-cypress-200 flex items-center justify-center">
                <Fish className="w-3.5 h-3.5 text-cypress-600" />
              </div>
              <span className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">
                Rejoindre la Route sur Vinocap
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug">
              Membre de l'association ?<br />
              <span className="text-warm-400">Votre fiche vous attend.</span>
            </h2>
            <p className="text-warm-500 text-xs leading-relaxed mb-4 max-w-sm">
              L'association envoie un lien personnalisé à chaque membre. Un formulaire, et votre fiche est en ligne — avec badge Route affiché dès validation.
            </p>

            <div className="grid sm:grid-cols-3 gap-2 mb-4">
              {[
                { n: '1', t: 'Invitation reçue', d: "Lien personnalisé envoyé par l'association" },
                { n: '2', t: 'Formulaire rempli', d: 'Pré-rempli avec vos infos membres' },
                { n: '3', t: 'Badge visible', d: 'Affiché sur votre fiche dès validation' },
              ].map((s) => (
                <div key={s.n} className="bg-warm-50 border border-warm-200 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-cypress-600 mb-1">Étape {s.n}</div>
                  <div className="text-slate-900 text-xs font-semibold leading-snug mb-0.5">{s.t}</div>
                  <div className="text-warm-400 text-[10px] leading-relaxed">{s.d}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onJoinViaInvite?.(demoInviteToken)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cypress-600 hover:bg-cypress-700 text-white font-bold text-sm transition-all"
            >
              <Fish className="w-4 h-4" />
              Démo — Accéder au formulaire membre
            </button>

            <p className="text-warm-400 text-[10px] text-center mt-3">
              Vous n'avez pas reçu de lien ? Contactez directement la Route des Vignerons & des Pêcheurs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
