import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QrCode, MapPin, Clock, ArrowRight, Wine, CalendarX, Pause } from 'lucide-react';
import { resolveQR, ResolverResult, ScanResult } from '../lib/campaigns';
import { ActiveCampaignExperience } from './ActiveCampaignExperience';

interface CampaignResolverPageProps {
  qrSlug: string;
  onNavigate: (page: string) => void;
  onViewCard: (slug: string) => void;
}

function getSessionKey(): string {
  const key = 'wine_session';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
        <p className="text-white/40 text-sm">Résolution en cours...</p>
      </div>
    </div>
  );
}

function InvalidState({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-900/40 border border-red-800/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">QR code invalide</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Ce code QR n'est pas reconnu ou n'est plus actif. Vérifiez que vous scannez le bon code.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all mx-auto"
        >
          Découvrir Vinocap
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function NotYetLiveState({ result, onNavigate }: { result: ResolverResult; onNavigate: (page: string) => void }) {
  const { campaign } = result;
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-amber-900/40 border border-amber-700/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-7 h-7 text-amber-400" />
        </div>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Pas encore ouvert
        </p>
        <h1 className="text-xl font-bold text-white mb-2">
          {campaign?.context_label ?? 'Campagne à venir'}
        </h1>
        {campaign?.start_at && (
          <p className="text-white/40 text-sm mb-6">
            Ouverture le {formatDate(campaign.start_at)}
          </p>
        )}
        {campaign?.zone && (
          <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs mb-8">
            <MapPin className="w-3.5 h-3.5" />
            <span>{campaign.zone}</span>
          </div>
        )}
        <button
          onClick={() => onNavigate('domaines')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all mx-auto"
        >
          Voir les domaines
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EndedState({ result, onNavigate }: { result: ResolverResult; onNavigate: (page: string) => void }) {
  const { campaign } = result;
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <CalendarX className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          {result.scanResult === 'archived' ? 'Archivé' : 'Terminé'}
        </p>
        <h1 className="text-xl font-bold text-white mb-2">
          {campaign?.context_label ?? 'Campagne terminée'}
        </h1>
        {campaign?.end_at && (
          <p className="text-slate-500 text-sm mb-2">
            Clôturé le {formatDate(campaign.end_at)}
          </p>
        )}
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Cet événement est terminé. Les fiches domaines restent accessibles sur la plateforme.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => onNavigate('domaines')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
          >
            <Wine className="w-4 h-4" />
            Voir les domaines
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-slate-500 hover:text-slate-300 font-semibold text-sm transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

function PausedState({ result, onNavigate }: { result: ResolverResult; onNavigate: (page: string) => void }) {
  const { campaign } = result;
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Pause className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          En pause
        </p>
        <h1 className="text-xl font-bold text-white mb-2">
          {campaign?.context_label ?? 'Campagne en pause'}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Cette campagne est temporairement suspendue. Les fiches domaines restent accessibles.
        </p>
        <button
          onClick={() => onNavigate('domaines')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all mx-auto"
        >
          Voir les domaines
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


export function CampaignResolverPage({ qrSlug, onNavigate, onViewCard }: CampaignResolverPageProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResolverResult | null>(null);
  const location = useLocation();

  useEffect(() => {
    resolveQR(
      qrSlug,
      location.pathname,
      undefined,
      getSessionKey(),
    ).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, [qrSlug, location.pathname]);

  if (loading) return <LoadingState />;
  if (!result) return <InvalidState onNavigate={onNavigate} />;

  const stateMap: Record<ScanResult, JSX.Element> = {
    active: result.campaign
      ? <ActiveCampaignExperience campaign={result.campaign} onNavigate={onNavigate} onViewCard={onViewCard} />
      : <InvalidState onNavigate={onNavigate} />,
    not_yet_live: <NotYetLiveState result={result} onNavigate={onNavigate} />,
    ended: <EndedState result={result} onNavigate={onNavigate} />,
    archived: <EndedState result={result} onNavigate={onNavigate} />,
    paused: <PausedState result={result} onNavigate={onNavigate} />,
    invalid: <InvalidState onNavigate={onNavigate} />,
  };

  return stateMap[result.scanResult] ?? <InvalidState onNavigate={onNavigate} />;
}
