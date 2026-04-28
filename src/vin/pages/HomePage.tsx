import { useState, useEffect } from 'react';
import { Wine, Fish, ArrowRight, ChevronRight, Scan, Grape, MapPin, Leaf, Waves, Zap, Store, Users } from 'lucide-react';
import { supabase, WineryProfile } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onViewCard?: (slug: string) => void;
}

const STATIC_PREVIEWS = [
  {
    name: 'Domaine de la Garrigue',
    town: 'Villeveyrac',
    types: ['Rouge'],
    img: 'https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=700',
    route: false,
  },
  {
    name: 'Mas du Soleil',
    town: 'Montagnac',
    types: ['Rosé'],
    img: 'https://images.pexels.com/photos/2954929/pexels-photo-2954929.jpeg?auto=compress&cs=tinysrgb&w=700',
    route: true,
  },
  {
    name: 'Château des Pierres',
    town: 'Loupian',
    types: ['Blanc'],
    img: 'https://images.pexels.com/photos/1343317/pexels-photo-1343317.jpeg?auto=compress&cs=tinysrgb&w=700',
    route: false,
  },
  {
    name: 'Clos Méditerranéen',
    town: 'Agde',
    types: ['Rosé'],
    img: 'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg?auto=compress&cs=tinysrgb&w=700',
    route: true,
  },
];

const CARD_IMGS = [
  'https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/2954929/pexels-photo-2954929.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1343317/pexels-photo-1343317.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg?auto=compress&cs=tinysrgb&w=700',
  'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=700',
];

const SLUG_IMG_OVERRIDES: Record<string, string> = {
  'serre-du-littoral': 'https://images.pexels.com/photos/2954929/pexels-photo-2954929.jpeg?auto=compress&cs=tinysrgb&w=700',
  'terrasses-du-larzac': 'https://images.pexels.com/photos/1343317/pexels-photo-1343317.jpeg?auto=compress&cs=tinysrgb&w=700',
};

function getImg(slug: string) {
  if (SLUG_IMG_OVERRIDES[slug]) return SLUG_IMG_OVERRIDES[slug];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % CARD_IMGS.length;
  return CARD_IMGS[Math.abs(hash) % CARD_IMGS.length];
}

export function HomePage({ onNavigate, onViewCard }: HomePageProps) {
  const [codeInput, setCodeInput] = useState('');
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [liveWineries, setLiveWineries] = useState<WineryProfile[]>([]);

  useEffect(() => {
    supabase
      .from('wine_profiles')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('domaine_name')
      .limit(5)
      .then(({ data, count }) => {
        setLiveCount(count ?? 0);
        if (data && data.length > 0) setLiveWineries(data as WineryProfile[]);
      });
  }, []);

  const handleCodeSubmit = () => {
    const v = codeInput.trim();
    if (v) onNavigate('domaines');
  };

  const previews = liveWineries.length > 0 ? null : STATIC_PREVIEWS;
  const countDisplay = liveCount !== null && liveCount > 0 ? liveCount : null;

  return (
    <div className="min-h-screen" style={{ background: '#faf7f1' }}>

      {/* ===== A. PLATFORM HERO ===== */}
      <section className="relative pt-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #fdf9f2 0%, #f2fbf8 55%, #e8f6f3 100%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 70% at -5% 60%, rgba(230,200,110,0.18) 0%, transparent 55%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 105% 30%, rgba(60,195,180,0.16) 0%, transparent 55%)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-14">

          {/* Platform badge */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.22)', color: '#1e8a7e' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2d968a' }} />
              Maxilocal Résonance
            </div>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: '#d8d0c4' }} />
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#b0a898' }}>
              Plateforme territoriale
            </span>
          </div>

          {/* H1 — vigneron-first promise */}
          <h1
            className="font-bold leading-[1.06] tracking-tight mb-3"
            style={{
              fontSize: 'clamp(1.85rem, 5vw, 3rem)',
              color: '#1c2e28',
            }}
          >
            Du domaine à la table,<br />
            <span style={{ color: '#2d968a' }}>en un clic.</span>
          </h1>

          <p
            className="leading-[1.75] mb-3 max-w-lg"
            style={{ fontSize: '15px', color: '#6b7f72' }}
          >
            Le vin du territoire en accès direct, au moment précis où il se choisit&nbsp;: à l'apéritif, au déjeuner, au dîner.
          </p>

          {/* Vinocap activation marker */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl mb-8"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #ddd6ca' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(45,150,138,0.12)', border: '1px solid rgba(45,150,138,0.2)' }}
            >
              <Wine className="w-3.5 h-3.5" style={{ color: '#2d968a' }} />
            </div>
            <div>
              <span className="font-bold text-sm" style={{ color: '#1c2e28' }}>Vinocap 2026</span>
              <span className="text-xs ml-2" style={{ color: '#9a8f7e' }}>· Première activation · Hérault · Occitanie</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full ml-1 animate-pulse" style={{ background: '#4db8ac' }} />
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Primary: Je suis vigneron */}
            <button
              onClick={() => onNavigate('participer')}
              className="group flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
              style={{
                background: '#2d968a',
                boxShadow: '0 4px 20px rgba(45,150,138,0.25), 0 1px 4px rgba(45,150,138,0.15)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-[15px] leading-snug">Je suis vigneron</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Activer ma présence locale</div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>

            {/* Secondary: Découvrir les domaines */}
            <button
              onClick={() => onNavigate('domaines')}
              className="group flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid #ddd6ca',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.18)' }}
              >
                <Wine className="w-5 h-5" style={{ color: '#2d968a' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] leading-snug" style={{ color: '#1c2e28' }}>Découvrir les domaines</div>
                <div className="text-xs mt-0.5" style={{ color: '#9a8f7e' }}>Tous les exposants Vinocap</div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform flex-shrink-0" style={{ color: '#c5b99e' }} />
            </button>
          </div>

          <button
            onClick={() => onNavigate('decouvrir')}
            className="mt-3.5 flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: '#9a8f7e' }}
          >
            Explorer par style, désir ou territoire
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* ===== B. 3 PRODUCER VALUE GAINS ===== */}
      <section style={{ background: '#faf7f1', paddingTop: '0.5rem', paddingBottom: '1.5rem' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Waves,
                title: 'Présence quotidienne',
                body: 'Votre domaine entre dans la vie réelle du territoire, au bon moment.',
              },
              {
                icon: Zap,
                title: 'Accès direct',
                body: 'Le public vous trouve sans recherche, sans détour, sans distance.',
              },
              {
                icon: Store,
                title: "Jusqu'à la boutique",
                body: "En un scan, le public peut découvrir votre univers et aller jusqu'à votre boutique.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl px-5 py-4"
                  style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(45,150,138,0.09)', border: '1px solid rgba(45,150,138,0.16)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#2d968a' }} />
                  </div>
                  <div className="font-bold text-sm mb-1" style={{ color: '#1c2e28' }}>{item.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: '#7a8f82' }}>{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== C. PLATFORM POSITIONING BLOCK ===== */}
      <section
        style={{
          background: 'linear-gradient(180deg, #fdf9f2 0%, #f0f8f5 100%)',
          borderTop: '1px solid #e6e0d6',
          borderBottom: '1px solid #e6e0d6',
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="flex items-start gap-5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.2)' }}
            >
              <Grape className="w-5 h-5" style={{ color: '#2d968a' }} />
            </div>
            <div>
              <h2 className="font-bold text-[17px] leading-snug mb-2" style={{ color: '#1c2e28' }}>
                Une nouvelle plateforme locale d'accès direct aux producteurs
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7f72' }}>
                Maxilocal rapproche radicalement les domaines et le public, à travers une présence quotidienne, un accès mobile immédiat et une logique simple d'activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== D. PRODUCER ENTRY STRIP ===== */}
      <section style={{ background: '#faf7f1', paddingTop: '2rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl px-6 py-5"
            style={{
              background: 'linear-gradient(135deg, #1c2e28 0%, #243d35 100%)',
              boxShadow: '0 4px 18px rgba(28,46,40,0.2)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-[15px] leading-snug mb-0.5">Vous êtes vigneron ?</div>
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Activez votre présence locale et votre accès direct au public.
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('participer')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all active:scale-[0.97] flex-shrink-0"
              style={{ background: '#2d968a', color: '#fff', boxShadow: '0 2px 10px rgba(45,150,138,0.35)' }}
            >
              Voir l'offre domaine
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== E. FEATURED DOMAINES ===== */}
      <section style={{ background: '#faf7f1', paddingTop: '2.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5"
                style={{ color: '#9a8f7e' }}
              >
                {countDisplay ? `${countDisplay} domaines` : 'Domaines exposants'}
              </div>
              <h2 className="text-[17px] font-bold" style={{ color: '#1c2e28' }}>
                Les cartes Vinocap 2026
              </h2>
            </div>
            <button
              onClick={() => onNavigate('domaines')}
              className="flex items-center gap-0.5 text-xs font-semibold transition-colors"
              style={{ color: '#2d968a' }}
            >
              Voir tous <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {liveWineries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {liveWineries.slice(0, 5).map((w) => {
                const img = getImg(w.slug);
                const isRoute = w.association_badge_enabled && w.association_member_status === 'member';
                return (
                  <button
                    key={w.id}
                    onClick={() => onViewCard?.(w.slug)}
                    className="group text-left rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.97]"
                    style={{
                      background: '#fff',
                      border: '1px solid #e2dcd2',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(12,22,18,0.68) 0%, transparent 58%)' }}
                      />
                      <div className="absolute bottom-2 left-2.5 flex gap-1">
                        {w.wine_types.slice(0, 1).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                            style={{
                              background: 'rgba(255,255,255,0.2)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.3)',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {isRoute && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.92)' }}
                        >
                          <Fish className="w-2.5 h-2.5" style={{ color: '#2d6330' }} />
                        </div>
                      )}
                    </div>
                    <div className="px-3 pt-2.5 pb-1">
                      <div
                        className="font-bold text-[11px] leading-snug truncate"
                        style={{ color: '#1c2e28' }}
                      >
                        {w.domaine_name}
                      </div>
                      <div
                        className="flex items-center gap-1 text-[10px] mt-0.5"
                        style={{ color: '#9a8f7e' }}
                      >
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{w.town}</span>
                      </div>
                    </div>
                    <div
                      className="mx-2.5 mb-2.5 mt-1.5 flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #1e7a70 0%, #2d968a 100%)', boxShadow: '0 2px 6px rgba(45,150,138,0.2)' }}
                    >
                      <span className="text-[10px] font-bold text-white">Découvrir le domaine</span>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                        <ArrowRight className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : previews ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previews.map((d) => (
                <button
                  key={d.name}
                  onClick={() => onNavigate('domaines')}
                  className="group text-left rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.97]"
                  style={{
                    background: '#fff',
                    border: '1px solid #ddd6c8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  }}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={d.img}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(12,22,18,0.68) 0%, transparent 58%)' }}
                    />
                    <div className="absolute bottom-2 left-2.5 flex gap-1">
                      {d.types.slice(0, 1).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {d.route && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.92)' }}
                      >
                        <Fish className="w-2.5 h-2.5" style={{ color: '#2d6330' }} />
                      </div>
                    )}
                  </div>
                  <div className="px-3 pt-2.5 pb-1">
                    <div className="font-bold text-[11px] leading-snug truncate" style={{ color: '#1c2e28' }}>
                      {d.name}
                    </div>
                    <div
                      className="flex items-center gap-1 text-[10px] mt-0.5"
                      style={{ color: '#9a8f7e' }}
                    >
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{d.town}</span>
                    </div>
                  </div>
                  <div
                    className="mx-2.5 mb-2.5 mt-1.5 flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #1e7a70 0%, #2d968a 100%)', boxShadow: '0 2px 6px rgba(45,150,138,0.2)' }}
                  >
                    <span className="text-[10px] font-bold text-white">Découvrir le domaine</span>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                      <ArrowRight className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl h-44 animate-pulse" style={{ background: '#ece8e0' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== F. ROUTE COMMUNITY STRIP ===== */}
      <section style={{ background: '#faf7f1', paddingTop: '2rem', paddingBottom: '1.5rem' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <button
            onClick={() => onNavigate('association')}
            className="group w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 active:scale-[0.99] rounded-2xl"
            style={{ background: '#fff', border: '1px solid #e2dcd2' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#edf5ee', border: '1px solid #c2d8c2' }}
            >
              <Fish className="w-4 h-4" style={{ color: '#3d7a3d' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-snug" style={{ color: '#1c2e28' }}>
                Route des Vignerons & des Pêcheurs
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#9a8f7e' }}>
                Collectif local · partenaire Vinocap · membres identifiés sur chaque fiche
              </div>
            </div>
            <ChevronRight
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5 flex-shrink-0"
              style={{ color: '#c5b99e' }}
            />
          </button>
        </div>
      </section>

      {/* ===== G. VINOCAP / TERRITORIAL BENEFIT ===== */}
      <section
        style={{
          background: 'linear-gradient(180deg, #fdf9f2 0%, #f8f4ec 100%)',
          borderTop: '1px solid #ddd6c8',
          paddingTop: '2.5rem',
          paddingBottom: '2rem',
        }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(138,110,36,0.08)', border: '1px solid rgba(138,110,36,0.2)' }}
            >
              <Wine className="w-4 h-4" style={{ color: '#7a6020' }} />
            </div>
            <div>
              <h2 className="font-bold text-[16px] leading-snug mb-1.5" style={{ color: '#1c2e28' }}>
                Une offre qui bénéficie aussi au territoire et à l'événement
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7f72' }}>
                Pendant la phase de lancement, la face avant peut mettre en valeur Vinocap, un partenaire territorial ou un temps fort local, pendant que les domaines profitent d'un bénéfice direct à l'arrière.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== H. TERRITORIAL PROOF STRIP ===== */}
      <section
        style={{
          background: '#f8f4ec',
          borderTop: '1px solid #e2dcd2',
          paddingTop: '2rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: '#9a8f7e' }}
            >
              La plateforme en chiffres
            </span>
            <div className="flex-1 h-px" style={{ background: '#e2dcd2' }} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Scan, label: '30 jours', note: 'par activation' },
              { icon: Zap, label: 'Reconductible', note: 'chaque saison' },
              { icon: Waves, label: 'Habitants & visiteurs', note: 'Hérault · Occitanie' },
              { icon: Grape, label: 'Pont physique→digital', note: 'Minimum de friction' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl p-4 text-center"
                  style={{ border: '1px solid #ddd6c8', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2.5"
                    style={{ background: '#fff', border: '1px solid #e2dcd2' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#9a8f7e' }} />
                  </div>
                  <div className="font-bold text-xs leading-snug" style={{ color: '#1c2e28' }}>
                    {item.label}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#9a8f7e' }}>
                    {item.note}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('participer')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ border: '1px solid #c8d8c4', color: '#3d7a3d', background: '#f4f8f4' }}
          >
            <Leaf className="w-4 h-4" />
            Rejoindre en tant que domaine exposant
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
