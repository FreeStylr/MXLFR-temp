import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wine, Search, ChevronLeft, AlertCircle } from 'lucide-react';

const DEMO_CODE_MAP: Record<string, string> = {
  '001': 'serre-du-littoral',
  '002': 'mas-saint-chinian',
  '003': 'chateau-montagnac',
  '004': 'terrasses-du-larzac',
  '005': 'vignobles-de-letang',
};

type Stage = 'poster' | 'video' | 'choice' | 'codeEntry';

function VideoPlayer({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const handleEnded = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    completedRef.current = false;
    vid.currentTime = 0;

    const start = async () => {
      try {
        await vid.play();
      } catch (_) {
        // swallow autoplay/play errors; user interaction already triggered this flow
      }
    };

    start();
  }, []);

  return (
    <div className="fixed inset-0" style={{ background: '#000' }}>
      <video
        ref={videoRef}
        src="/vinocap_demo_video_qr.mp4"
        playsInline
        preload="auto"
        onEnded={handleEnded}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

export function QREntryPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('poster');
  const [videoKey, setVideoKey] = useState(0);
  const [codeFrom, setCodeFrom] = useState<'poster' | 'choice'>('choice');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const launchVideo = () => {
    setVideoKey((k) => k + 1);
    setStage('video');
  };

  const handleVideoComplete = useCallback(() => {
    setStage('choice');
  }, []);

  const handleCodeSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setCodeError('');
    const slug = DEMO_CODE_MAP[trimmed];

    if (slug) {
      navigate(`/vinocap/carte/${slug}`);
    } else {
      setCodeError('Code non reconnu. Vérifiez-le ou explorez les domaines disponibles.');
    }
  };

  const goDiscover = () => navigate('/vinocap/decouvrir');
  const goAllDomaines = () => navigate('/vinocap/domaines');

  if (stage === 'codeEntry') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #0d1e22 0%, #122a30 60%, #0a181c 100%)' }}
      >
        <div className="w-full max-w-sm mx-auto px-6">
          <button
            onClick={() => {
              setCode('');
              setCodeError('');
              setStage(codeFrom);
            }}
            className="flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(121,215,242,0.7)' }}
          >
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'rgba(34,199,201,0.12)',
              border: '1px solid rgba(34,199,201,0.25)',
            }}
          >
            <Search className="w-5 h-5" style={{ color: '#22C7C9' }} />
          </div>

          <h2 className="text-2xl font-bold mb-2 leading-tight" style={{ color: '#FCFBF7' }}>
            Entrez le code de votre domaine
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(121,215,242,0.6)' }}>
            Le code de chaque domaine se trouve au dos du sac.
          </p>

          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCodeError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
            placeholder="Ex. 001"
            autoFocus
            className="w-full text-center text-2xl font-bold tracking-[0.3em] py-4 rounded-2xl mb-3 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: codeError
                ? '1px solid rgba(239,68,68,0.5)'
                : '1px solid rgba(121,215,242,0.25)',
              color: '#FCFBF7',
            }}
          />

          {codeError && (
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'rgba(239,68,68,0.85)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {codeError}
            </div>
          )}

          <button
            onClick={handleCodeSubmit}
            disabled={!code.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)',
              boxShadow: '0 8px 32px -8px rgba(34,199,201,0.5)',
            }}
          >
            Accéder au domaine <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'choice') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(160deg, #0d1e22 0%, #122a30 60%, #0a181c 100%)' }}
      >
        <div className="w-full max-w-sm mx-auto text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'rgba(34,199,201,0.12)',
              border: '1px solid rgba(34,199,201,0.25)',
            }}
          >
            <Wine className="w-6 h-6" style={{ color: '#22C7C9' }} />
          </div>

          <h2 className="text-2xl font-bold mb-2 leading-tight" style={{ color: '#FCFBF7' }}>
            Comment souhaitez-vous
            <br />
            explorer VinoCap ?
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: 'rgba(121,215,242,0.55)' }}>
            Cap d&apos;Agde Méditerranée · 2026
          </p>

          <div className="space-y-3">
            <button
              onClick={goDiscover}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] duration-200 group"
              style={{
                background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)',
                boxShadow: '0 8px 32px -8px rgba(34,199,201,0.55)',
              }}
            >
              <span>Je découvre les vins</span>
              <ArrowRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button
              onClick={() => {
                setCodeFrom('choice');
                setStage('codeEntry');
              }}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] duration-200 group"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(121,215,242,0.28)',
                color: '#FCFBF7',
              }}
            >
              <span>J&apos;ai un code domaine</span>
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          <button
            onClick={goAllDomaines}
            className="mt-6 text-sm transition-opacity hover:opacity-70"
            style={{ color: 'rgba(121,215,242,0.5)' }}
          >
            Voir tous les domaines
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'video') {
    return <VideoPlayer key={videoKey} onComplete={handleVideoComplete} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0a181c' }}>
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={launchVideo}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <img
          src="/vinocap_video_launcher.png"
          alt="Lancer l'expérience VinoCap"
          className="w-full h-full object-cover object-center select-none"
          draggable={false}
        />
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCodeFrom('poster');
            setStage('codeEntry');
          }}
          className="pointer-events-auto text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
          style={{
            background: 'rgba(10,24,28,0.55)',
            border: '1px solid rgba(121,215,242,0.3)',
            color: 'rgba(121,215,242,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          J&apos;ai déjà un code →
        </button>
      </div>
    </div>
  );
}

The important part is the VideoPlayer.

If you want, paste your current VideoPlayer block after you apply it and I’ll verify it fast.