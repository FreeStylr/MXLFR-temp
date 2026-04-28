import { Award, Sun, Droplets, Mountain } from 'lucide-react';

const APPELLATIONS = [
  { name: 'Saint-Chinian AOC', type: 'Rouge, Blanc', note: 'Terroir schisteux et calcaire, vins de caractère' },
  { name: 'Pézenas AOC', type: 'Rouge, Blanc, Rosé', note: 'Argilo-calcaire, vins gastronomiques' },
  { name: 'Languedoc AOC', type: 'Rouge, Blanc, Rosé', note: 'Grande aire, diversité de terroirs' },
  { name: 'Terrasses du Larzac', type: 'Rouge', note: 'Altitude, fraîcheur, vins de garde reconnus' },
  { name: "IGP Pays de l'Hérault", type: 'Tous types', note: 'Grande liberté de cépages et de styles' },
  { name: 'IGP Côtes de Thau', type: 'Blanc, Bulles, Rosé', note: 'Influence maritime, vins vifs et iodés' },
];

const CLIMATE = [
  { icon: Sun, label: '300 jours de soleil', note: 'Maturité exceptionnelle des raisins' },
  { icon: Droplets, label: 'Méditerranée & Thau', note: 'Fraîcheur, minéralité, iode' },
  { icon: Mountain, label: 'Reliefs variés', note: 'Des coteaux de Thau au Massif Central' },
];

const CEPAGES = [
  { color: 'bg-red-500', line: 'Grenache, Syrah, Mourvèdre — rouges' },
  { color: 'bg-amber-400', line: 'Picpoul, Vermentino, Chardonnay — blancs' },
  { color: 'bg-pink-400', line: 'Grenache, Cinsault — rosés' },
  { color: 'bg-sky-400', line: 'Mauzac, Clairette — bulles' },
];

export function TerroirPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-16">

      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-cypress-950 overflow-hidden" style={{ minHeight: 200 }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=1200)' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[11px] font-bold text-white/60 uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cypress-400" />
            Terroir
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight mb-1">
            Le territoire Vinocap
          </h1>
          <p className="text-white/40 text-sm">Hérault · Languedoc · Méditerranée</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 space-y-8">

        <div className="grid grid-cols-3 gap-3">
          {CLIMATE.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-white border border-warm-200 rounded-2xl p-3.5 text-center">
                <div className="w-8 h-8 rounded-xl bg-warm-100 border border-warm-200 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-warm-600" />
                </div>
                <div className="font-bold text-slate-900 text-xs leading-snug">{c.label}</div>
                <div className="text-warm-400 text-[10px] mt-0.5 leading-snug">{c.note}</div>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-[11px] font-bold text-warm-500 uppercase tracking-wider mb-3">Appellations présentes</h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {APPELLATIONS.map((app) => (
              <div key={app.name} className="flex items-start gap-3 p-4 bg-white border border-warm-200 rounded-2xl hover:border-warm-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-warm-100 border border-warm-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4 text-warm-500" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{app.name}</div>
                  <div className="text-xs font-medium text-cypress-600 mb-0.5">{app.type}</div>
                  <div className="text-warm-400 text-xs">{app.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5">
          <h2 className="text-[11px] font-bold text-white/50 mb-3 uppercase tracking-wider">Cépages principaux</h2>
          <div className="space-y-2">
            {CEPAGES.map((c) => (
              <div key={c.line} className="flex items-center gap-2.5 text-sm text-white/40">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.color}`} />
                {c.line}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-warm-200 rounded-2xl p-5">
          <h2 className="text-[11px] font-bold text-warm-500 uppercase tracking-wider mb-3">Repères géographiques</h2>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div className="text-warm-400">Département</div><div className="font-semibold text-slate-900">Hérault (34)</div>
            <div className="text-warm-400">Région</div><div className="font-semibold text-slate-900">Occitanie</div>
            <div className="text-warm-400">Proximité</div><div className="font-semibold text-slate-900">Méditerranée, Thau, Massif Central</div>
            <div className="text-warm-400">Villes-clés</div><div className="font-semibold text-slate-900">Sète, Agde, Pézenas, Saint-Chinian</div>
          </div>
        </div>

      </div>
    </div>
  );
}
