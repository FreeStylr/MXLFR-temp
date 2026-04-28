import { Wine, Leaf, Fish, MapPin, ChevronRight, ArrowRight, Grape, Droplets, Sunset, ThumbsUp, Users } from 'lucide-react';

interface DecouvrirPageProps {
  onNavigate: (page: string) => void;
  onViewCard: (slug: string) => void;
}

const DESIRE_PATHS = [
  {
    label: 'Un rosé pour cet été',
    sub: 'Fruité · Frais · Bassin de Thau',
    img: 'https://images.pexels.com/photos/2954929/pexels-photo-2954929.jpeg?auto=compress&cs=tinysrgb&w=600',
    accent: '#c85e7c',
    accentBg: 'rgba(200,94,124,0.08)',
    accentBorder: 'rgba(200,94,124,0.2)',
  },
  {
    label: 'Un rouge de garrigue',
    sub: 'Grenache · Syrah · Haut-Languedoc',
    img: 'https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=600',
    accent: '#8b2635',
    accentBg: 'rgba(139,38,53,0.07)',
    accentBorder: 'rgba(139,38,53,0.18)',
  },
  {
    label: 'Le Picpoul de Pinet',
    sub: 'Blanc minéral · Étang · Accord fruits de mer',
    img: 'https://images.pexels.com/photos/1343317/pexels-photo-1343317.jpeg?auto=compress&cs=tinysrgb&w=600',
    accent: '#8a6e24',
    accentBg: 'rgba(138,110,36,0.07)',
    accentBorder: 'rgba(138,110,36,0.18)',
  },
  {
    label: 'Des bulles naturelles',
    sub: 'Pétillants nat. · Crémants · Fête',
    img: 'https://images.pexels.com/photos/312080/pexels-photo-312080.jpeg?auto=compress&cs=tinysrgb&w=600',
    accent: '#2d7a8f',
    accentBg: 'rgba(45,122,143,0.07)',
    accentBorder: 'rgba(45,122,143,0.18)',
  },
];

const USAGE_MOMENTS = [
  { icon: Sunset, label: 'Apéritif sur la terrasse', sub: 'Rosé · Blanc léger · Bulles' },
  { icon: Fish, label: 'Repas de poisson ou fruit de mer', sub: 'Picpoul · Blanc minéral' },
  { icon: ThumbsUp, label: 'Cadeau à offrir', sub: 'Cuvée phare · Coffret domaine' },
  { icon: Users, label: 'Table festive ou barbecue', sub: 'Rouge charnu · Rosé de garrigue' },
];

const TERRITORY_AREAS = [
  {
    name: 'Bassin de Thau',
    sub: 'Picpoul de Pinet · Sète · Mèze',
    img: 'https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Haut-Languedoc',
    sub: 'Faugères · Saint-Chinian · Pézenas',
    img: 'https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Littoral héraultais',
    sub: "Grau-d'Agde · Cap d'Agde · Valras",
    img: 'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const APPROACH_CHIPS = [
  { label: 'Bio certifié', icon: Leaf },
  { label: 'Dégustation', icon: Grape },
  { label: 'Membres Route', icon: Fish },
  { label: 'Vente directe', icon: MapPin },
  { label: 'Sans alcool', icon: Droplets },
];

export function DecouvrirPage({ onNavigate }: DecouvrirPageProps) {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#faf7f1' }}>

      <div style={{ background: 'linear-gradient(160deg, #fdf9f2 0%, #eef8f5 100%)', borderBottom: '1px solid #ddd6c8' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-9 pb-7">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(45,150,138,0.09)', border: '1px solid rgba(45,150,138,0.2)', color: '#1e8a7e' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2d968a' }} />
            Vinocap 2026 · Découverte guidée
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight mb-2" style={{ color: '#1c2e28' }}>
            Qu'est-ce que vous cherchez ?
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#6b7f72' }}>
            Choisissez un désir, un moment, un lieu — et découvrez les domaines directement.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-7 space-y-9" style={{ color: '#1c2e28' }}>

        {/* BY DESIRE */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#9a8f7e' }}>Ce que vous cherchez</h2>
            <button onClick={() => onNavigate('domaines')} className="text-xs font-semibold flex items-center gap-0.5 transition-colors" style={{ color: '#2d8a80' }}>
              Tout voir <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DESIRE_PATHS.map((d) => (
              <button
                key={d.label}
                onClick={() => onNavigate('domaines')}
                className="group relative text-left rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.97]"
                style={{ border: `1px solid ${d.accentBorder}`, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
              >
                <div className="relative h-28 overflow-hidden">
                  <img src={d.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,18,14,0.72) 0%, transparent 55%)' }} />
                </div>
                <div className="px-3.5 pt-3 pb-3.5">
                  <div className="font-bold text-sm leading-snug mb-0.5" style={{ color: '#1e2a26' }}>{d.label}</div>
                  <div className="text-[11px] leading-snug" style={{ color: '#9a8f7e' }}>{d.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* USAGE MOMENTS */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#9a8f7e' }}>Pour quel moment ?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {USAGE_MOMENTS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => onNavigate('domaines')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 active:scale-[0.97]"
                  style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,150,138,0.09)', border: '1px solid rgba(45,150,138,0.18)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#2d968a' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[12px] leading-snug" style={{ color: '#1e2a26' }}>{m.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: '#9a8f7e' }}>{m.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* BY TERRITORY */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#9a8f7e' }}>Par territoire</h2>
            <button onClick={() => onNavigate('terroir')} className="text-xs font-semibold flex items-center gap-0.5 transition-colors" style={{ color: '#2d8a80' }}>
              Le terroir <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {TERRITORY_AREAS.map((area) => (
              <button
                key={area.name}
                onClick={() => onNavigate('domaines')}
                className="group w-full flex items-center gap-0 rounded-2xl overflow-hidden text-left transition-all duration-200 active:scale-[0.99]"
                style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
              >
                <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden">
                  <img src={area.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'rgba(15,25,20,0.15)' }} />
                </div>
                <div className="flex-1 text-left py-3 px-4 min-w-0">
                  <div className="font-bold text-sm leading-snug" style={{ color: '#1e2a26' }}>{area.name}</div>
                  <div className="text-xs truncate mt-0.5" style={{ color: '#9a8f7e' }}>{area.sub}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mr-4 group-hover:translate-x-0.5 transition-transform" style={{ color: '#c5b99e' }} />
              </button>
            ))}
          </div>
        </div>

        {/* BY APPROACH */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#9a8f7e' }}>Par approche</h2>
          <div className="flex flex-wrap gap-2">
            {APPROACH_CHIPS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.label}
                  onClick={() => onNavigate('domaines')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.96]"
                  style={{ border: '1px solid #c8ddd8', background: '#fff', color: '#2d7a70', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROUTE */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#9a8f7e' }}>Collectifs & associations</h2>
          <button
            onClick={() => onNavigate('association')}
            className="group w-full flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all active:scale-[0.99]"
            style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eef3ee', border: '1px solid #c5d9c5' }}>
              <Fish className="w-4 h-4" style={{ color: '#3d7d3d' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px] leading-snug" style={{ color: '#1e2a26' }}>Route des Vignerons & des Pêcheurs</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#9a8f7e' }}>Collectif local · membres identifiés sur chaque fiche</div>
            </div>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform flex-shrink-0" style={{ color: '#c5b99e' }} />
          </button>
        </div>

      </div>
    </div>
  );
}
