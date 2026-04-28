import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Building2, Loader2, CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabase';

type StructureType = 'domaine' | 'cooperative';
type PaymentMethod = 'carte' | 'virement';
type SubmitState = 'idle' | 'saving' | 'payment' | 'coop-success' | 'error';

// Manually-defined run calendar. cutoff = distribution date minus 45 days.
// Format: { label, cutoffDate (ISO), distributionDate (display only) }
export const RUNS = [
  { label: 'Mai 2026',   cutoffDate: '2026-03-16', distributionLabel: '30 avril 2026' },
  { label: 'Juin 2026',  cutoffDate: '2026-04-16', distributionLabel: '31 mai 2026' },
  { label: 'Juillet 2026', cutoffDate: '2026-05-17', distributionLabel: '1 juillet 2026' },
] as const;

export type RunLabel = typeof RUNS[number]['label'];

function isRunOpen(cutoffDate: string) {
  return new Date() <= new Date(cutoffDate);
}

function firstOpenRun() {
  return RUNS.find(r => isRunOpen(r.cutoffDate)) ?? null;
}

function fmtCutoff(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface FormState {
  prenom: string;
  nom: string;
  nomStructure: string;
  type: StructureType;
  ville: string;
  codePostal: string;
  email: string;
  mobile: string;
  paymentMethod: PaymentMethod;
  runMonth: RunLabel;
  cguAccepted: boolean;
}

interface ReservationModalProps {
  onClose: () => void;
}

function generateReference(zip: string, lastName: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const clean = lastName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  return `VIN-${zip}-${clean}-${ts}`;
}

export function ReservationModal({ onClose }: ReservationModalProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    prenom: '',
    nom: '',
    nomStructure: '',
    type: 'domaine',
    ville: '',
    codePostal: '',
    email: '',
    mobile: '',
    paymentMethod: 'carte',
    runMonth: (firstOpenRun() ?? RUNS[0]).label,
    cguAccepted: false,
  });
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const ctaLabel = () => {
    if (form.type === 'cooperative') return 'Recevoir la proposition';
    if (form.paymentMethod === 'virement') return 'Voir la facture pro forma';
    return 'Continuer vers le paiement';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('saving');
    setErrorMsg('');

    const isCoop = form.type === 'cooperative';
    const isWire = !isCoop && form.paymentMethod === 'virement';
    const isCard = !isCoop && form.paymentMethod === 'carte';

    const ref = isCoop ? null : generateReference(form.codePostal, form.nom);
    const status = isCoop
      ? 'coop_lead'
      : isWire
      ? 'awaiting_wire'
      : 'awaiting_card_payment';

    const selectedRun = RUNS.find(r => r.label === form.runMonth) ?? RUNS[0];

    const { error } = await supabase.from('wine_reservations').insert({
      first_name: form.prenom.trim(),
      last_name: form.nom.trim(),
      structure_name: form.nomStructure.trim(),
      structure_type: form.type,
      town: form.ville.trim(),
      zip_code: form.codePostal.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      zone: 'Agde+',
      payment_method: isCoop ? null : (isWire ? 'wire' : 'card'),
      payment_reference: ref,
      status,
      run_month: form.runMonth,
      cutoff_date: selectedRun.cutoffDate,
    });

    if (error) {
      setErrorMsg('Une erreur est survenue. Veuillez réessayer.');
      setSubmitState('error');
      return;
    }

    if (isCoop) {
      setSubmitState('coop-success');
    } else if (isWire) {
      navigate(`/vin/proforma/${encodeURIComponent(ref ?? '')}`);
      onClose();
    } else if (isCard) {
      const paymentUrl = import.meta.env.VITE_PAYMENT_URL;
      if (paymentUrl) {
        window.location.href = `${paymentUrl}?ref=${encodeURIComponent(ref ?? '')}`;
      } else {
        setSubmitState('payment');
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#f8f4ee',
    border: '1px solid #ddd6c8',
    color: '#1c2e28',
    width: '100%',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    fontSize: '14px',
    outline: 'none',
  };

  // Coop success screen
  if (submitState === 'coop-success') {
    return (
      <Overlay ref={overlayRef} onClick={handleOverlayClick}>
        <Bubble>
          <CloseBtn onClick={onClose} />
          <IconBadge><Building2 className="w-7 h-7" style={{ color: '#2d968a' }} /></IconBadge>
          <h2 className="font-bold text-xl mb-2 text-center" style={{ color: '#1c2e28' }}>Demande bien reçue</h2>
          <p className="text-sm leading-relaxed text-center" style={{ color: '#6b7f72' }}>
            Nous vous enverrons une proposition adaptée à votre volume et votre zone dans les prochains jours.
          </p>
          <GreenBtn onClick={onClose} className="mt-6">Fermer</GreenBtn>
        </Bubble>
      </Overlay>
    );
  }

  // Card payment fallback (when payment URL not configured)
  if (submitState === 'payment') {
    return (
      <Overlay ref={overlayRef} onClick={handleOverlayClick}>
        <Bubble>
          <CloseBtn onClick={onClose} />
          <IconBadge><Building2 className="w-7 h-7" style={{ color: '#2d968a' }} /></IconBadge>
          <h2 className="font-bold text-xl mb-2 text-center" style={{ color: '#1c2e28' }}>Pré-réservation enregistrée</h2>
          <p className="text-sm leading-relaxed mb-6 text-center" style={{ color: '#6b7f72' }}>
            Le module de paiement en ligne sera disponible très prochainement. Nous vous contacterons à l'adresse indiquée pour finaliser votre réservation.
          </p>
          <GreenBtn onClick={onClose}>Compris</GreenBtn>
        </Bubble>
      </Overlay>
    );
  }

  // Main form
  const isSaving = submitState === 'saving';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(20,32,28,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: '#ddd6c8' }} />
        </div>

        <div className="px-6 pt-4 pb-3 sm:pt-6" style={{ borderBottom: '1px solid #f0ebe2' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: '#f4ede3', color: '#9a8f7e' }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="pr-10">
            <h2 className="font-bold text-[18px] leading-snug mb-1" style={{ color: '#1c2e28' }}>
              Réserver votre présence locale de mai
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: '#6b7f72' }}>
              Maxilocal propose aux domaines, caves et coopératives une présence tout le mois de mai sur 100&nbsp;000 sacs à pain autour d'Agde.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium"
              style={{ background: 'rgba(45,150,138,0.08)', border: '1px solid rgba(45,150,138,0.18)', color: '#1e8a7e' }}
            >
              QR vers votre fiche digitale
            </div>
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', color: '#92680a' }}
            >
              Tarif lancement Domaine&nbsp;: 250&nbsp;€&nbsp;HT
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <input required type="text" value={form.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Marie" style={inputStyle} />
            </Field>
            <Field label="Nom">
              <input required type="text" value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Dupont" style={inputStyle} />
            </Field>
          </div>

          <Field label="Nom du domaine / de la coopérative">
            <input required type="text" value={form.nomStructure} onChange={(e) => set('nomStructure', e.target.value)} placeholder="Domaine de la Garrigue" style={inputStyle} />
          </Field>

          <div>
            <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9a8f7e' }}>Type de structure</label>
            <div className="grid grid-cols-2 gap-2">
              {(['domaine', 'cooperative'] as StructureType[]).map((t) => (
                <RadioChip key={t} active={form.type === t} onClick={() => set('type', t)}>
                  {t === 'domaine' ? 'Domaine' : 'Coopérative'}
                </RadioChip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville">
              <input required type="text" value={form.ville} onChange={(e) => set('ville', e.target.value)} placeholder="Agde" style={inputStyle} />
            </Field>
            <Field label="Code postal">
              <input required type="text" inputMode="numeric" value={form.codePostal} onChange={(e) => set('codePostal', e.target.value)} placeholder="34300" style={inputStyle} />
            </Field>
          </div>

          <Field label="Email">
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@mondomaine.fr" style={inputStyle} />
          </Field>

          <Field label="Mobile">
            <input required type="tel" inputMode="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="06 xx xx xx xx" style={inputStyle} />
          </Field>

          <Field label="Zone sélectionnée">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ background: '#f8f4ee', border: '1px solid #ddd6c8', color: '#1c2e28' }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#2d968a' }} />
              Agde+
              <span className="ml-auto text-xs font-normal" style={{ color: '#9a8f7e' }}>Zone unique disponible</span>
            </div>
          </Field>

          {(() => {
            const openRuns = RUNS.filter(r => isRunOpen(r.cutoffDate));
            const hasNoOpenRun = openRuns.length === 0;
            return (
              <div>
                <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9a8f7e' }}>Édition souhaitée</label>
                <div className="flex flex-wrap gap-2">
                  {RUNS.map((run) => {
                    const closed = !isRunOpen(run.cutoffDate);
                    return (
                      <RadioChip
                        key={run.label}
                        active={form.runMonth === run.label}
                        disabled={closed}
                        onClick={() => { if (!closed) set('runMonth', run.label); }}
                      >
                        {run.label}
                      </RadioChip>
                    );
                  })}
                </div>
                {hasNoOpenRun ? (
                  <div
                    className="mt-3 flex items-start gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)' }}
                  >
                    <CalendarClock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                    <p className="text-[12px] leading-relaxed" style={{ color: '#b91c1c' }}>
                      Aucune édition n'est actuellement ouverte à l'inscription. Contactez-nous pour toute demande exceptionnelle.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const run = RUNS.find(r => r.label === form.runMonth);
                    if (!run) return null;
                    return (
                      <div
                        className="mt-3 flex items-start gap-3 px-4 py-3.5 rounded-xl"
                        style={{ background: 'rgba(45,150,138,0.06)', border: '1px solid rgba(45,150,138,0.18)' }}
                      >
                        <CalendarClock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2d968a' }} />
                        <div>
                          <p className="text-[12px] font-semibold mb-0.5" style={{ color: '#1e8a7e' }}>
                            Date limite d'intégration&nbsp;: {fmtCutoff(run.cutoffDate)}.
                          </p>
                          <p className="text-[11px] leading-relaxed" style={{ color: '#5a8a82' }}>
                            Distribution&nbsp;: {run.distributionLabel}.
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            );
          })()}

          {form.type === 'domaine' ? (
            <div>
              <label className="block text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9a8f7e' }}>Mode de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                {(['carte', 'virement'] as PaymentMethod[]).map((m) => (
                  <RadioChip key={m} active={form.paymentMethod === m} onClick={() => set('paymentMethod', m)}>
                    {m === 'carte' ? 'Carte bancaire' : 'Virement bancaire'}
                  </RadioChip>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="px-4 py-3.5 rounded-xl text-[13px] leading-relaxed"
              style={{ background: 'rgba(45,150,138,0.06)', border: '1px solid rgba(45,150,138,0.15)', color: '#3a7a72' }}
            >
              Les coopératives reçoivent une proposition adaptée selon le volume et la zone.
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => set('cguAccepted', !form.cguAccepted)}
              className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
              style={{
                borderColor: form.cguAccepted ? '#2d968a' : '#c5b99e',
                background: form.cguAccepted ? '#2d968a' : 'transparent',
              }}
            >
              {form.cguAccepted && (
                <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 5 4.5 8.5 11 1" />
                </svg>
              )}
            </button>
            <span className="text-[12px] leading-relaxed" style={{ color: '#6b7f72' }}>
              J'accepte les conditions générales d'utilisation et la politique de confidentialité de Maxilocal.
            </span>
          </label>

          {submitState === 'error' && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#b91c1c' }}>
              {errorMsg}
            </div>
          )}

          <p className="text-[11px] text-center" style={{ color: '#b0a898' }}>
            Réservation validée après règlement. Finalisation de la fiche après paiement.
          </p>

          <button
            type="submit"
            disabled={!form.cguAccepted || isSaving}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98]"
            style={{
              background: form.cguAccepted && !isSaving ? '#2d968a' : '#c8d8d4',
              color: '#fff',
              boxShadow: form.cguAccepted && !isSaving ? '0 4px 16px rgba(45,150,138,0.3)' : 'none',
              cursor: form.cguAccepted && !isSaving ? 'pointer' : 'not-allowed',
            }}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            ) : (
              <>{ctaLabel()} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#9a8f7e' }}>{label}</label>
      {children}
    </div>
  );
}

function RadioChip({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: disabled ? '#f0ede8' : active ? 'rgba(45,150,138,0.1)' : '#f8f4ee',
        border: disabled ? '1.5px solid #e0d9cd' : active ? '1.5px solid rgba(45,150,138,0.4)' : '1.5px solid #ddd6c8',
        color: disabled ? '#c5b99e' : active ? '#1e8a7e' : '#6b7f72',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: disabled ? '#d9d1c4' : active ? '#2d968a' : '#c5b99e' }}
      >
        {active && !disabled && <span className="w-2 h-2 rounded-full" style={{ background: '#2d968a' }} />}
      </span>
      {children}
      {disabled && <span className="text-[10px] font-normal ml-auto" style={{ color: '#c5b99e' }}>Fermé</span>}
    </button>
  );
}

function Overlay({ children, onClick, ref }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; ref: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,32,28,0.55)', backdropFilter: 'blur(6px)' }}
    >
      {children}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full max-w-md rounded-3xl p-8 flex flex-col"
      style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
    >
      {children}
    </div>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.2)' }}>
      {children}
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="absolute top-4 right-4 p-2 rounded-full transition-colors" style={{ color: '#9a8f7e' }}>
      <X className="w-4 h-4" />
    </button>
  );
}

function GreenBtn({ onClick, children, className = '' }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-xl font-semibold text-sm ${className}`}
      style={{ background: '#2d968a', color: '#fff' }}
    >
      {children}
    </button>
  );
}
