import { useState, useEffect } from 'react';
import {
  MapPin, Wine, Grape, ShoppingBag, Leaf, Fish,
  Compass, ChevronRight, Sparkles, GlassWater, ArrowLeft
} from 'lucide-react';
import { Campaign } from '../lib/campaigns';
import { supabase, WineryProfile } from '../lib/supabase';
import { rankWineries, describeRecommendation, UserPreferences, WineIntent, VisitIntent } from '../lib/recommendations';
import { CampaignHostIntro, getHostConfig, HostConfig } from '../components/CampaignHostIntro';

interface ActiveCampaignExperienceProps {
  campaign: Campaign;
  onNavigate: (page: string) => void;
  onViewCard: (slug: string) => void;
}

type Stage = 'welcome' | 'questions' | 'results';

const WINE_OPTIONS: { key: WineIntent; label: string; color: string; dot: string }[] = [
  { key: 'rouge', label: 'Rouge', color: 'border-red-700/40 bg-red-950/40 hover:border-red-600/60 data-[sel=true]:border-red-500 data-[sel=true]:bg-red-900/60', dot: 'bg-red-500' },
  { key: 'blanc', label: 'Blanc', color: 'border-amber-600/40 bg-amber-950/30 hover:border-amber-500/60 data-[sel=true]:border-amber-400 data-[sel=true]:bg-amber-900/40', dot: 'bg-amber-400' },
  { key: 'rose', label: 'Rosé', color: 'border-pink-700/40 bg-pink-950/40 hover:border-pink-600/60 data-[sel=true]:border-pink-500 data-[sel=true]:bg-pink-900/60', dot: 'bg-pink-400' },
  { key: 'bulles', label: 'Bulles', color: 'border-sky-700/40 bg-sky-950/30 hover:border-sky-600/60 data-[sel=true]:border-sky-400 data-[sel=true]:bg-sky-900/40', dot: 'bg-sky-400' },
  { key: 'open', label: 'Tout explorer', color: 'border-white/10 bg-white/5 hover:border-white/20 data-[sel=true]:border-white/30 data-[sel=true]:bg-white/10', dot: 'bg-white/50' },
];

const INTENT_OPTIONS: { key: VisitIntent; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: 'deguster',
    label: 'Déguster',
    desc: 'Goûter les vins sur place',
    icon: <Grape className="w-5 h-5" />,
  },
  {
    key: 'acheter',
    label: 'Acheter',
    desc: 'Repartir avec des bouteilles',
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    key: 'visiter',
    label: 'Visiter',
    desc: 'Découvrir le domaine',
    icon: <Compass className="w-5 h-5" />,
  },
  {
    key: 'decouvrir',
    label: 'Découvrir',
    desc: 'Explorer sans idée précise',
    icon: <Sparkles className="w-5 h-5" />,
  },
];

function QuestionsStage({
  config,
  onComplete,
  onSkip,
  onBack,
}: {
  config: HostConfig;
  onComplete: (prefs: UserPreferences) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [wineType, setWineType] = useState<WineIntent | null>(null);

  function handleWineSelect(key: WineIntent) {
    setWineType(key);
    setStep(2);
  }

  function handleIntentSelect(key: VisitIntent) {
    if (wineType) {
      onComplete({ wineType, visitIntent: key });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="w-8 h-8 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className={`text-xs font-bold uppercase tracking-widest ${config.accentColor}`}>
              {config.questionIntro}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-all duration-400 ${
                n <= step ? config.ctaBg : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-white/25 text-xs mt-1.5">
          {config.questionSubtitle}
        </p>
      </div>

      <div className="flex-1 px-5 pb-8">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1.5 mt-5 leading-snug">
              Quel type de vin vous tente ?
            </h2>
            <p className="text-white/35 text-sm mb-7">
              Choisissez ou explorez tout
            </p>
            <div className="grid grid-cols-2 gap-3">
              {WINE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  data-sel={wineType === opt.key}
                  onClick={() => handleWineSelect(opt.key)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl border text-left font-semibold text-white text-sm transition-all ${opt.color} ${
                    opt.key === 'open' ? 'col-span-2' : ''
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1.5 mt-5 leading-snug">
              Qu'est-ce qui vous amène ?
            </h2>
            <p className="text-white/35 text-sm mb-7">
              Pour vous orienter vers les bons domaines
            </p>
            <div className="space-y-3">
              {INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleIntentSelect(opt.key)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 active:bg-white/12 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/50 group-hover:text-white/80 transition-colors">
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{opt.label}</div>
                    <div className="text-white/35 text-xs">{opt.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-8">
        <button
          onClick={onSkip}
          className="w-full py-3 text-white/25 hover:text-white/45 text-xs font-medium transition-colors"
        >
          Passer et tout voir
        </button>
      </div>
    </div>
  );
}

function ResultCard({
  winery,
  onViewCard,
}: {
  winery: WineryProfile;
  onViewCard: (slug: string) => void;
}) {
  const wineColors: Record<string, string> = {
    rouge: 'bg-red-900/40 text-red-300 border-red-800/40',
    blanc: 'bg-amber-900/30 text-amber-300 border-amber-800/30',
    rose: 'bg-pink-900/40 text-pink-300 border-pink-800/40',
    bulles: 'bg-sky-900/30 text-sky-300 border-sky-800/30',
  };

  return (
    <button
      onClick={() => onViewCard(winery.slug)}
      className="w-full text-left group bg-white/5 border border-white/8 rounded-2xl p-4 hover:border-white/15 hover:bg-white/8 active:bg-white/12 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-cypress-300 transition-colors truncate">
            {winery.domaine_name}
          </h3>
          <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{winery.town}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 flex-shrink-0 mt-0.5 transition-colors" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {winery.wine_types.slice(0, 3).map((t) => (
          <span
            key={t}
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${wineColors[t] || 'bg-white/8 text-white/50 border-white/10'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-white/25 flex-wrap">
        {winery.tasting_available && (
          <span className="flex items-center gap-1">
            <Grape className="w-3 h-3" />
            Dégustation
          </span>
        )}
        {winery.direct_purchase && (
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            Vente directe
          </span>
        )}
        {(winery.bio_ab || winery.is_organic) && (
          <span className="flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            Bio
          </span>
        )}
        {winery.has_non_alcoholic && (
          <span className="flex items-center gap-1 text-lagoon-400/60">
            <GlassWater className="w-3 h-3" />
            Sans alcool
          </span>
        )}
        {winery.association_member_status === 'member' && winery.association_badge_enabled && (
          <span className="flex items-center gap-1">
            <Fish className="w-3 h-3" />
            Route
          </span>
        )}
      </div>
    </button>
  );
}

function ResultsStage({
  config,
  prefs,
  allWineries,
  onViewCard,
  onViewAll,
  onNavigate,
  onRestart,
}: {
  config: HostConfig;
  prefs: UserPreferences | null;
  allWineries: WineryProfile[];
  onViewCard: (slug: string) => void;
  onViewAll: () => void;
  onNavigate: (page: string) => void;
  onRestart: () => void;
}) {
  const [nonAlcoholicOnly, setNonAlcoholicOnly] = useState(false);

  const effectivePrefs: UserPreferences | null = prefs
    ? { ...prefs, nonAlcoholicOnly }
    : null;

  const hasNonAlcoholicWineries = allWineries.some((w) => w.has_non_alcoholic);

  const recommended = effectivePrefs
    ? rankWineries(allWineries, effectivePrefs, 6)
    : nonAlcoholicOnly
    ? allWineries.filter((w) => w.has_non_alcoholic).slice(0, 6)
    : allWineries.slice(0, 6);

  const description = prefs ? describeRecommendation(prefs) : '';

  const headline = config.resultHeadline(!!prefs);
  const subtitle = allWineries.length > 0
    ? config.resultSubtitle(!!prefs, recommended.length, description)
    : 'Chargement…';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-5">
          {prefs && (
            <button
              onClick={onRestart}
              className="w-8 h-8 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <p className={`text-xs font-bold uppercase tracking-widest ${config.accentColor}`}>
            {prefs ? config.questionIntro : 'Vinocap'}
          </p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1.5 leading-tight">
          {headline}
        </h2>
        <p className="text-white/35 text-sm mb-4">
          {subtitle}
        </p>

        {prefs && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-white/50 text-xs font-medium">
              <div className={`w-2 h-2 rounded-full ${
                prefs.wineType === 'rouge' ? 'bg-red-400' :
                prefs.wineType === 'blanc' ? 'bg-amber-400' :
                prefs.wineType === 'rose' ? 'bg-pink-400' :
                prefs.wineType === 'bulles' ? 'bg-sky-400' : 'bg-white/40'
              }`} />
              {prefs.wineType === 'open' ? 'Tous les vins' : prefs.wineType.charAt(0).toUpperCase() + prefs.wineType.slice(1)}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-white/50 text-xs font-medium">
              {prefs.visitIntent === 'deguster' && <Grape className="w-3 h-3" />}
              {prefs.visitIntent === 'acheter' && <ShoppingBag className="w-3 h-3" />}
              {prefs.visitIntent === 'visiter' && <Compass className="w-3 h-3" />}
              {prefs.visitIntent === 'decouvrir' && <Sparkles className="w-3 h-3" />}
              {prefs.visitIntent.charAt(0).toUpperCase() + prefs.visitIntent.slice(1)}
            </div>
          </div>
        )}

        {hasNonAlcoholicWineries && (
          <button
            onClick={() => setNonAlcoholicOnly(!nonAlcoholicOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              nonAlcoholicOnly
                ? 'bg-lagoon-900/50 border-lagoon-600/50 text-lagoon-300'
                : 'bg-white/5 border-white/10 text-white/35 hover:border-white/20 hover:text-white/50'
            }`}
          >
            <GlassWater className="w-3.5 h-3.5" />
            Sans alcool uniquement
          </button>
        )}
      </div>

      <div className="flex-1 px-5">
        {allWineries.length === 0 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : recommended.length === 0 ? (
          <div className="text-center py-16">
            <Wine className="w-10 h-10 text-white/15 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Aucun domaine disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommended.map((w) => (
              <ResultCard key={w.id} winery={w} onViewCard={onViewCard} />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-6 pb-10 space-y-3">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white font-semibold text-sm transition-all"
        >
          <Wine className="w-4 h-4" />
          {config.resultCtaLabel}
          {allWineries.length > 0 && (
            <span className="text-white/35 font-normal">· {allWineries.length}</span>
          )}
        </button>
        <button
          onClick={() => onNavigate('terroir')}
          className="w-full py-3 text-white/25 hover:text-white/50 text-xs font-medium transition-colors"
        >
          {config.resultTerrLabel}
        </button>
      </div>
    </div>
  );
}

export function ActiveCampaignExperience({
  campaign,
  onNavigate,
  onViewCard,
}: ActiveCampaignExperienceProps) {
  const [stage, setStage] = useState<Stage>('welcome');
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [wineries, setWineries] = useState<WineryProfile[]>([]);

  const config = getHostConfig(campaign.experience_key);

  useEffect(() => {
    supabase
      .from('wine_profiles')
      .select('*')
      .eq('is_published', true)
      .order('domaine_name')
      .then(({ data }) => {
        setWineries((data as WineryProfile[]) || []);
      });
  }, []);

  function handleBegin() {
    setStage('questions');
  }

  function handleSkipToAll() {
    setPrefs(null);
    setStage('results');
  }

  function handleQuestionsComplete(p: UserPreferences) {
    setPrefs(p);
    setStage('results');
  }

  function handleViewAll() {
    onNavigate('domaines');
  }

  function handleRestartQuestions() {
    setStage('questions');
  }

  return (
    <>
      {stage === 'welcome' && (
        <CampaignHostIntro
          campaign={campaign}
          onBegin={handleBegin}
          onSkip={handleSkipToAll}
        />
      )}
      {stage === 'questions' && (
        <QuestionsStage
          config={config}
          onComplete={handleQuestionsComplete}
          onSkip={handleSkipToAll}
          onBack={handleBegin}
        />
      )}
      {stage === 'results' && (
        <ResultsStage
          config={config}
          prefs={prefs}
          allWineries={wineries}
          onViewCard={onViewCard}
          onViewAll={handleViewAll}
          onNavigate={onNavigate}
          onRestart={handleRestartQuestions}
        />
      )}
    </>
  );
}
