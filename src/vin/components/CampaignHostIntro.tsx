import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { ArrowRight, MapPin, Clock, Play, Volume2, VolumeX, ChevronDown, Loader2 } from 'lucide-react';
import { Campaign } from '../lib/campaigns';
import { AvatarConfig } from '../lib/heygen';

const LiveAvatarHost = lazy(() =>
  import('./LiveAvatarHost').then((m) => ({ default: m.LiveAvatarHost }))
);

export interface HostConfig {
  name: string;
  role: string;
  tagline: string;
  introLines: string[];
  videoUrl?: string;
  posterUrl?: string;
  ctaLabel: string;
  skipLabel: string;
  accentColor: string;
  accentBg: string;
  ctaBg: string;
  ctaBgHover: string;
  questionIntro: string;
  questionSubtitle: string;
  resultHeadline: (hasPrefs: boolean) => string;
  resultSubtitle: (hasPrefs: boolean, count: number, description: string) => string;
  resultCtaLabel: string;
  resultTerrLabel: string;
  avatar?: AvatarConfig;
}

const EXPERIENCE_CONFIGS: Record<string, HostConfig> = {
  wine_2026: {
    name: 'Sophie',
    role: 'Sommelière & guide Vinocap',
    tagline: 'Votre découverte commence ici.',
    introLines: [
      "Je suis là pour vous aider à trouver les domaines qui correspondent vraiment à ce que vous cherchez aujourd'hui.",
      'Deux questions suffisent.',
    ],
    ctaLabel: 'Commencer la découverte',
    skipLabel: 'Voir tous les domaines directement',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
    ctaBg: 'bg-amber-700',
    ctaBgHover: 'hover:bg-amber-600 active:bg-amber-800',
    questionIntro: 'Sophie vous guide',
    questionSubtitle: "Deux questions pour affiner votre découverte",
    resultHeadline: (hasPrefs) =>
      hasPrefs ? 'Votre sélection personnalisée' : 'Les domaines présents',
    resultSubtitle: (hasPrefs, count, description) =>
      hasPrefs
        ? `${count} domaine${count !== 1 ? 's' : ''} sélectionné${count !== 1 ? 's' : ''} · ${description}`
        : `${count} domaine${count !== 1 ? 's' : ''} présents au salon`,
    resultCtaLabel: 'Explorer tous les domaines',
    resultTerrLabel: 'Découvrir le terroir',
    avatar: {
      avatarId: 'default',
      introText:
        "Bienvenue. Je suis Sophie, votre sommelière. Je vais vous aider à trouver les domaines qui correspondent à ce que vous cherchez aujourd'hui. C'est très simple, deux questions suffisent.",
      quality: 'medium',
      language: 'fr',
    },
  },
  default: {
    name: 'Votre guide',
    role: 'Guide Vinocap',
    tagline: 'Trouvez le domaine qui vous correspond.',
    introLines: [
      'Répondez à deux questions pour découvrir les vignerons présents qui correspondent à ce que vous cherchez.',
    ],
    ctaLabel: 'Trouver mes domaines',
    skipLabel: 'Voir tous les domaines',
    accentColor: 'text-cypress-400',
    accentBg: 'bg-cypress-500/20',
    ctaBg: 'bg-cypress-700',
    ctaBgHover: 'hover:bg-cypress-600 active:bg-cypress-800',
    questionIntro: 'Votre guide',
    questionSubtitle: 'Quelques questions pour mieux vous orienter',
    resultHeadline: (hasPrefs) =>
      hasPrefs ? 'Vos domaines recommandés' : 'Les exposants',
    resultSubtitle: (hasPrefs, count, description) =>
      hasPrefs
        ? `${count} domaine${count !== 1 ? 's' : ''} · ${description}`
        : `${count} domaine${count !== 1 ? 's' : ''} disponibles`,
    resultCtaLabel: 'Voir tous les domaines',
    resultTerrLabel: 'En savoir plus sur le terroir',
  },
};

export function getHostConfig(experienceKey: string | null): HostConfig {
  if (experienceKey && EXPERIENCE_CONFIGS[experienceKey]) {
    return EXPERIENCE_CONFIGS[experienceKey];
  }
  return EXPERIENCE_CONFIGS.default;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
}

function HostMediaSurface({ config }: { config: HostConfig }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);

  const hasAvatar = !!config.avatar && !avatarFailed;

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 120);
    return () => clearTimeout(t);
  }, []);

  function handlePlay() {
    if (!videoRef.current) return;
    videoRef.current.play();
    setPlaying(true);
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  return (
    <div
      className={`relative w-full aspect-[3/4] max-h-[58vh] rounded-2xl overflow-hidden bg-slate-900 border border-white/8 transition-all duration-700 ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {hasAvatar ? (
        <Suspense
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-3">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              <p className="text-white/30 text-xs font-medium">Préparation…</p>
            </div>
          }
        >
          <LiveAvatarHost
            avatarConfig={config.avatar!}
            onReady={() => setAvatarReady(true)}
            onFailed={() => setAvatarFailed(true)}
          />
        </Suspense>
      ) : config.videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={config.videoUrl}
            poster={config.posterUrl}
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!playing && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
            </button>
          )}
          {playing && (
            <button
              onClick={toggleMute}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-white/70" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/70" />
              )}
            </button>
          )}
        </>
      ) : (
        <HostStillFrame config={config} />
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pt-14 pb-5 pointer-events-none">
        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${config.accentColor}`}>
          {config.role}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-white font-bold text-base">{config.name}</p>
          <div className="flex items-center gap-1 ml-1">
            <div className={`w-1.5 h-1.5 rounded-full ${hasAvatar && avatarReady ? 'bg-emerald-400' : 'bg-emerald-400'} animate-pulse`} />
            <span className={`text-xs font-medium ${hasAvatar && avatarReady ? 'text-emerald-400/70' : 'text-emerald-400/70'}`}>
              {hasAvatar && avatarReady ? 'En direct' : 'En ligne'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HostStillFrame({ config }: { config: HostConfig }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pb-16">
        <div className="relative mb-7">
          <div className={`w-28 h-28 rounded-full ${config.accentBg} border border-white/10 flex items-center justify-center`}>
            <div className="w-20 h-20 rounded-full bg-white/8 border border-white/8 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/70 select-none tracking-tight">
                {config.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2.5 max-w-xs">
          {config.introLines.map((line, i) => (
            <p
              key={i}
              className={`leading-relaxed ${
                i === 0
                  ? 'text-white/75 text-sm font-medium'
                  : 'text-white/40 text-xs'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CampaignHostIntroProps {
  campaign: Campaign;
  onBegin: () => void;
  onSkip: () => void;
}

export function CampaignHostIntro({ campaign, onBegin, onSkip }: CampaignHostIntroProps) {
  const config = getHostConfig(campaign.experience_key);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 overflow-hidden">
      <div
        className={`flex-1 flex flex-col px-5 pt-12 pb-6 transition-all duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className={`w-1.5 h-5 rounded-full ${config.ctaBg}`} />
          <p className={`text-xs font-bold uppercase tracking-widest ${config.accentColor}`}>
            {campaign.context_label}
          </p>
        </div>

        <HostMediaSurface config={config} />

        <div className="mt-5 mb-6">
          <h1 className="text-xl font-bold text-white leading-snug mb-2">
            {config.tagline}
          </h1>

          {(campaign.zone || campaign.end_at) && (
            <div className="flex items-center gap-4 flex-wrap">
              {campaign.zone && (
                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{campaign.zone}</span>
                </div>
              )}
              {campaign.end_at && (
                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Jusqu'au {formatDate(campaign.end_at)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2.5 mt-auto">
          <button
            onClick={onBegin}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-base transition-all shadow-lg text-white ${config.ctaBg} ${config.ctaBgHover}`}
          >
            {config.ctaLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onSkip}
            className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-white/25 hover:text-white/50 font-medium text-sm transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            {config.skipLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
