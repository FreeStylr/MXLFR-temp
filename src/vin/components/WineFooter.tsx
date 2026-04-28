import { Wine, Fish, MapPin } from 'lucide-react';

interface WineFooterProps {
  onNavigate: (page: string) => void;
}

export function WineFooter({ onNavigate }: WineFooterProps) {
  const nav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ background: 'linear-gradient(180deg, #f2faf7 0%, #eaf5f1 100%)', borderTop: '1px solid #c8ddd8' }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <button onClick={() => nav('home')} className="flex items-center gap-2.5 mb-4 group">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#2d968a' }}
              >
                <Wine className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight" style={{ color: '#1c2e28' }}>Maxilocal</div>
                <div className="text-[10px] leading-tight" style={{ color: '#7a9e94' }}>Resonance</div>
              </div>
            </button>
            <p className="text-xs leading-relaxed mb-3 max-w-[220px]" style={{ color: '#7a9e94' }}>
              Plateforme de résonance territoriale — prolonger les événements et la vie locale dans les foyers.
            </p>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#9ab8b0' }}>
              <MapPin className="w-3 h-3" />
              Hérault · Occitanie · France
            </div>
          </div>

          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#8ab8ae' }}
            >
              Vinocap 2026
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'domaines', label: 'Les Domaines' },
                { key: 'decouvrir', label: 'Découvrir' },
                { key: 'terroir', label: 'Le Terroir' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => nav(item.key)}
                  className="block text-[13px] text-left transition-colors"
                  style={{ color: '#5a8a80' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#8ab8ae' }}
            >
              Participer
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => nav('participer')}
                className="block text-[13px] text-left transition-colors"
                style={{ color: '#5a8a80' }}
              >
                Devenir exposant
              </button>
              <button
                onClick={() => nav('association')}
                className="flex items-start gap-2 text-left transition-colors"
                style={{ color: '#5a8a80' }}
              >
                <Fish className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="text-[13px] leading-snug">La Route</span>
              </button>
            </div>
          </div>

          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#8ab8ae' }}
            >
              Plateforme
            </div>
            <div className="space-y-2.5 text-[13px]" style={{ color: '#7a9e94' }}>
              <div>Résonance territoriale</div>
              <div>Communication-continuité</div>
              <div>Pont physique–digital</div>
            </div>
          </div>
        </div>

        <div
          className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: '1px solid #c8ddd8' }}
        >
          <div className="text-[11px]" style={{ color: '#8ab8ae' }}>
            © 2026 Maxilocal Resonance · MXL Group Ltd, Dublin
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#8ab8ae' }}>
            <span>Vinocap 2026 — première activation</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2d968a' }} />
              Démo officielle
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
