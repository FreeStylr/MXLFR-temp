import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PageIntent = 'succes' | 'attente' | 'annule';
type ResolvedState = 'loading' | 'paid' | 'pending' | 'cancelled' | 'not_found';

const PAID_STATUSES = ['paid', 'code_assigned', 'awaiting_final_onboarding', 'completed'];

interface Props {
  intent: PageIntent;
}

export function PaymentStatusPage({ intent }: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get('ref') ?? '';
  const [state, setState] = useState<ResolvedState>('loading');
  const [structureName, setStructureName] = useState('');

  useEffect(() => {
    if (!ref) {
      setState('not_found');
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('lookup_reservation_status', { ref });

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setState('not_found');
        return;
      }

      const row = data[0];
      setStructureName(row.structure_name ?? '');

      if (PAID_STATUSES.includes(row.status)) {
        setState('paid');
      } else if (row.status === 'awaiting_card_payment' || row.status === 'awaiting_wire') {
        setState(intent === 'annule' ? 'cancelled' : 'pending');
      } else {
        setState('pending');
      }
    })();

    return () => { cancelled = true; };
  }, [ref, intent]);

  if (state === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2d968a' }} />
          <p className="text-sm" style={{ color: '#6b7f72' }}>Vérification en cours...</p>
        </div>
      </Shell>
    );
  }

  if (state === 'not_found') {
    return (
      <Shell>
        <StatusCard
          icon={<XCircle className="w-8 h-8" style={{ color: '#b91c1c' }} />}
          iconBg="rgba(220,38,38,0.08)"
          title="Réservation introuvable"
          body="La référence indiquée ne correspond à aucune réservation. Vérifiez le lien ou contactez-nous."
        />
        <BackButton navigate={navigate} />
      </Shell>
    );
  }

  if (state === 'paid') {
    return (
      <Shell>
        <StatusCard
          icon={<CheckCircle2 className="w-8 h-8" style={{ color: '#16803c' }} />}
          iconBg="rgba(22,128,60,0.08)"
          title="Paiement confirmé"
          body={structureName
            ? `Le règlement pour ${structureName} a bien été reçu. Votre présence est réservée.`
            : 'Le règlement a bien été reçu. Votre présence est réservée.'}
        />
        <InfoLine text="Vous serez contacté prochainement pour finaliser votre fiche digitale." />
        <InfoLine text="Les intégrations se font dans l'ordre des règlements confirmés, dans la limite des places disponibles." />
        <BackButton navigate={navigate} />
      </Shell>
    );
  }

  if (state === 'cancelled') {
    return (
      <Shell>
        <StatusCard
          icon={<XCircle className="w-8 h-8" style={{ color: '#b45309' }} />}
          iconBg="rgba(180,83,9,0.08)"
          title="Paiement annulé"
          body="Le paiement n'a pas abouti. Aucun montant n'a été débité. Votre pré-réservation reste en attente."
        />
        <InfoLine text="Vous pouvez réessayer à tout moment depuis la page de réservation." />
        <BackButton navigate={navigate} label="Réessayer" />
      </Shell>
    );
  }

  // pending (default safe state)
  return (
    <Shell>
      <StatusCard
        icon={<Clock className="w-8 h-8" style={{ color: '#92680a' }} />}
        iconBg="rgba(251,191,36,0.1)"
        title="Vérification en cours"
        body="Votre pré-réservation est enregistrée. Le statut du paiement est en cours de vérification."
      />
      <InfoLine text="La réservation n'est confirmée qu'après règlement." />
      <InfoLine text="Si vous avez effectué un virement, le délai de traitement est de 1 à 3 jours ouvrés." />
      <InfoLine text="Vous serez contacté dès confirmation du règlement." />
      <BackButton navigate={navigate} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#faf7f1' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #fdf9f2 0%, #f2fbf8 55%, #e8f6f3 100%)', zIndex: 0 }} />
      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 pt-16 pb-20 space-y-5">
        {children}
      </div>
    </div>
  );
}

function StatusCard({ icon, iconBg, title, body }: { icon: React.ReactNode; iconBg: string; title: string; body: string }) {
  return (
    <div
      className="rounded-2xl px-7 py-8 text-center"
      style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <h1 className="font-bold text-xl mb-2" style={{ color: '#1c2e28' }}>{title}</h1>
      <p className="text-sm leading-relaxed" style={{ color: '#6b7f72' }}>{body}</p>
    </div>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm leading-relaxed"
      style={{ background: 'rgba(45,150,138,0.05)', border: '1px solid rgba(45,150,138,0.14)' }}
    >
      <span className="flex-shrink-0 font-bold text-base leading-none mt-0.5" style={{ color: '#2d968a' }}>{'\u2713'}</span>
      <span style={{ color: '#3a5048' }}>{text}</span>
    </div>
  );
}

function BackButton({ navigate, label }: { navigate: (path: string) => void; label?: string }) {
  return (
    <button
      onClick={() => navigate('/vin')}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
      style={{ background: '#fff', border: '1px solid #ddd6c8', color: '#6b7f72' }}
    >
      <ArrowLeft className="w-4 h-4" />
      {label ?? 'Retour'}
    </button>
  );
}
