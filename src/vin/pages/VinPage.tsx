import { useState } from 'react';
import { ArrowRight, Scan, MapPin, QrCode, Store } from 'lucide-react';
import { ReservationModal } from '../components/ReservationModal';

export function VinPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#faf7f1' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #fdf9f2 0%, #f2fbf8 55%, #e8f6f3 100%)', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 65% 70% at -5% 60%, rgba(230,200,110,0.15) 0%, transparent 55%)', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 105% 30%, rgba(60,195,180,0.13) 0%, transparent 55%)', zIndex: 0 }} />

      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 pt-16 pb-20">
        <div className="flex items-center gap-2 mb-10">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.22)', color: '#1e8a7e' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2d968a' }} />
            Maxilocal — Offre mai 2026
          </div>
        </div>

        <h1
          className="font-bold leading-[1.08] tracking-tight mb-4"
          style={{ fontSize: 'clamp(1.65rem, 5vw, 2.4rem)', color: '#1c2e28' }}
        >
          Présence locale de mai pour domaines, caves et coopératives
        </h1>

        <p className="text-[15px] leading-[1.75] mb-3" style={{ color: '#5a6e63' }}>
          Maxilocal propose une présence tout le mois de mai sur 100&nbsp;000 sacs à pain autour d'Agde, avec QR vers votre fiche digitale.
        </p>

        <p className="text-[13px] leading-relaxed mb-8" style={{ color: '#8a9e92' }}>
          Contact, site, boutique, visite&nbsp;: un accès direct depuis votre fiche.
        </p>

        <div className="grid grid-cols-1 gap-3 mb-8">
          {[
            { icon: Scan, title: '100 000 sacs à pain', body: "Présence physique quotidienne sur tout le mois de mai autour d'Agde." },
            { icon: QrCode, title: 'QR vers votre fiche digitale', body: 'Contact, site, boutique, visite — un scan suffit pour vous trouver.' },
            { icon: MapPin, title: 'Zone Agde+', body: "Habitants et visiteurs de l'Hérault ciblés au moment où ils choisissent leur vin." },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-4 px-5 py-4 rounded-2xl"
              style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(45,150,138,0.09)', border: '1px solid rgba(45,150,138,0.16)' }}
              >
                <Icon className="w-4 h-4" style={{ color: '#2d968a' }} />
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5" style={{ color: '#1c2e28' }}>{title}</div>
                <p className="text-xs leading-relaxed" style={{ color: '#7a8f82' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0ebe2' }}>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#9a8f7e' }}>Tarif lancement</div>
              <div className="font-bold text-[22px]" style={{ color: '#1c2e28' }}>250&nbsp;<span className="text-base font-semibold">€&nbsp;HT</span></div>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(251,191,36,0.13)', border: '1px solid rgba(251,191,36,0.35)', color: '#92680a' }}
            >
              Domaine
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="group w-full flex items-stretch"
            style={{ background: '#2d968a' }}
          >
            <div className="flex items-center gap-4 px-6 py-5 flex-1 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <Store className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-[15px] leading-snug">Réserver ma présence</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Domaines — Caves — Coopératives</div>
              </div>
            </div>
            <div
              className="flex items-center justify-center px-5 flex-shrink-0 transition-all duration-200 group-hover:brightness-105"
              style={{ background: '#fbbf24', borderLeft: '1px solid rgba(255,255,255,0.12)' }}
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: '#78350f' }} />
            </div>
          </button>
        </div>

        <p className="text-[11px] text-center" style={{ color: '#b0a898' }}>
          Réservation validée après règlement. Finalisation de la fiche après paiement.
        </p>

        <div className="mt-6 px-4 py-3.5 rounded-xl text-[12px] leading-relaxed text-center" style={{ background: 'rgba(45,150,138,0.05)', border: '1px solid rgba(45,150,138,0.12)', color: '#4a7a72' }}>
          Coopérative&nbsp;? Indiquez-le dans le formulaire — vous recevrez une proposition adaptée à votre volume.
        </div>
      </div>

      {showModal && <ReservationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
