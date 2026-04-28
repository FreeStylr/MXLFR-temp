import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Copy, Check, ArrowLeft, Grape } from 'lucide-react';
import { useState } from 'react';

const TITULAIRE = 'Maxilocal SAS';
const IBAN = 'FR76 XXXX XXXX XXXX XXXX XXXX XXX';
const BIC = 'XXXXXXXXX';

function formatDate(): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
}

export function ProformaPage() {
  const { ref = '' } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#faf7f1' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #fdf9f2 0%, #f2fbf8 55%, #e8f6f3 100%)', zIndex: 0 }} />

      <div className="relative z-10 max-w-xl mx-auto px-5 sm:px-8 pt-10 pb-20">

        <button
          onClick={() => navigate('/vin')}
          className="no-print flex items-center gap-2 mb-8 text-sm font-medium transition-colors"
          style={{ color: '#6b7f72' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 6px 32px rgba(0,0,0,0.07)' }}
        >
          {/* Header */}
          <div
            className="px-8 py-7"
            style={{ background: 'linear-gradient(135deg, #1c2e28 0%, #2a4038 100%)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(45,150,138,0.25)', border: '1px solid rgba(45,150,138,0.4)' }}
                  >
                    <Grape className="w-4 h-4" style={{ color: '#5de0d0' }} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Maxilocal
                  </span>
                </div>
                <h1 className="font-bold text-2xl sm:text-3xl tracking-tight mb-1" style={{ color: '#fff', lineHeight: 1.1 }}>
                  Facture pro forma
                </h1>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Pré-réservation enregistrée</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Date</div>
                <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{formatDate()}</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-7">

            {/* Reference */}
            {ref && (
              <div
                className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.28)' }}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#92680a' }}>
                    Référence de paiement
                  </div>
                  <div className="font-bold font-mono text-base tracking-wide" style={{ color: '#78350f' }}>
                    {ref}
                  </div>
                </div>
                <button
                  onClick={() => copy(ref, setCopiedRef)}
                  className="no-print flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: copiedRef ? 'rgba(45,150,138,0.12)' : 'rgba(251,191,36,0.14)', border: '1px solid rgba(251,191,36,0.3)', color: copiedRef ? '#1e8a7e' : '#92680a' }}
                >
                  {copiedRef ? <><Check className="w-3.5 h-3.5" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
                </button>
              </div>
            )}

            {/* Offer */}
            <Section title="Commande">
              <Row label="Offre" value="Présence locale de mai" />
              <Row label="Zone" value="Agde+" />
              <Row label="Support" value="100 000 sacs à pain — mai 2026" />
              <Row label="Inclus" value="QR vers fiche digitale" />
              <div style={{ borderTop: '1px dashed #e2dcd2', margin: '10px 0' }} />
              <Row label="Montant HT" value="250 €" bold />
              <Row label="TVA" value="Non applicable (Art. 293 B CGI)" small />
              <Row label="Montant TTC" value="250 €" bold />
            </Section>

            {/* Banking */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd6c8' }}>
              <div className="px-5 py-3" style={{ background: '#f8f4ee', borderBottom: '1px solid #e6dfd3' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9a8f7e' }}>
                  Coordonnées bancaires — Virement
                </div>
              </div>
              <div className="px-5 py-5 space-y-3.5">
                <BankRow label="Titulaire" value={TITULAIRE} />
                <BankRow label="IBAN" value={IBAN} mono copyable onCopy={() => copy(IBAN.replace(/\s/g, ''), setCopiedIban)} copied={copiedIban} />
                <BankRow label="BIC" value={BIC} mono />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              {ref && (
                <Instruction
                  highlight
                  text={`Merci d'indiquer cette référence dans l'intitulé du virement : ${ref}`}
                />
              )}
              <Instruction text="La réservation est confirmée à réception du règlement." />
              <Instruction text="Le règlement permet de bloquer votre présence et de lancer votre intégration." />
              <Instruction text="Les intégrations se font dans l'ordre des règlements confirmés, dans la limite des places disponibles." />
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: '#f8f4ee', borderTop: '1px solid #e6dfd3' }}
          >
            <p className="text-[11px] text-center sm:text-left" style={{ color: '#b0a898' }}>
              Document non contractuel. Valide jusqu'au règlement ou annulation.
            </p>
            <div className="text-[11px] font-semibold" style={{ color: '#9a8f7e' }}>
              Maxilocal — Offre mai 2026
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="no-print mt-6 space-y-3">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]"
            style={{ background: '#1c2e28', color: '#fff', boxShadow: '0 4px 16px rgba(28,46,40,0.2)' }}
          >
            <Printer className="w-4 h-4" />
            Imprimer / Enregistrer en PDF
          </button>
          <button
            onClick={() => navigate('/vin')}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all"
            style={{ background: '#fff', border: '1px solid #ddd6c8', color: '#6b7f72' }}
          >
            J'ai bien noté
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .fixed { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9a8f7e' }}>{title}</div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e6dfd3' }}>
        <div className="divide-y" style={{ borderColor: '#f0ebe2' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, small }: { label: string; value: string; bold?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5" style={{ background: '#fff' }}>
      <span className={small ? 'text-[11px]' : 'text-sm'} style={{ color: '#8a9e92' }}>{label}</span>
      <span
        className={`text-right ${bold ? 'font-bold' : 'font-medium'} ${small ? 'text-[11px]' : 'text-sm'}`}
        style={{ color: bold ? '#1c2e28' : '#3a5048' }}
      >
        {value}
      </span>
    </div>
  );
}

function BankRow({ label, value, mono, copyable, onCopy, copied }: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm flex-shrink-0" style={{ color: '#8a9e92', minWidth: 72 }}>{label}</span>
      <span
        className={`flex-1 text-sm font-semibold text-right ${mono ? 'font-mono' : ''}`}
        style={{ color: '#1c2e28', letterSpacing: mono ? '0.04em' : undefined }}
      >
        {value}
      </span>
      {copyable && (
        <button
          onClick={onCopy}
          className="no-print flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: copied ? 'rgba(45,150,138,0.1)' : 'rgba(45,150,138,0.06)', border: '1px solid rgba(45,150,138,0.2)', color: copied ? '#1e8a7e' : '#4a7a72' }}
        >
          {copied ? <><Check className="w-3 h-3" /> Copié</> : <><Copy className="w-3 h-3" /> IBAN</>}
        </button>
      )}
    </div>
  );
}

function Instruction({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm leading-relaxed"
      style={{
        background: highlight ? 'rgba(251,191,36,0.07)' : 'rgba(45,150,138,0.05)',
        border: `1px solid ${highlight ? 'rgba(251,191,36,0.25)' : 'rgba(45,150,138,0.14)'}`,
      }}
    >
      <span className="flex-shrink-0 font-bold text-base leading-none mt-0.5" style={{ color: highlight ? '#92680a' : '#2d968a' }}>
        {highlight ? '\u2192' : '\u2713'}
      </span>
      <span style={{ color: highlight ? '#78350f' : '#3a5048' }}>{text}</span>
    </div>
  );
}
