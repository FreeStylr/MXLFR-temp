import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

type GuardState = 'loading' | 'allowed' | 'blocked';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const PAID_STATUSES = ['paid', 'code_assigned', 'awaiting_final_onboarding', 'completed'];

interface FicheForm {
  nomAffiche: string;
  telephone: string;
  whatsapp: boolean;
  siteInternet: string;
  boutiqueEnLigne: string;
  lienVisite: string;
  presentation: string;
  actionPrincipale: string;
}

const EMPTY_FORM: FicheForm = {
  nomAffiche: '',
  telephone: '',
  whatsapp: false,
  siteInternet: '',
  boutiqueEnLigne: '',
  lienVisite: '',
  presentation: '',
  actionPrincipale: '',
};

export function FinaliserPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get('ref') ?? '';

  const [guard, setGuard] = useState<GuardState>('loading');
  const [structureName, setStructureName] = useState('');
  const [form, setForm] = useState<FicheForm>(EMPTY_FORM);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!ref) {
      setGuard('blocked');
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('lookup_reservation_status', { ref });
      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setGuard('blocked');
        return;
      }

      const row = data[0];
      setStructureName(row.structure_name ?? '');

      if (PAID_STATUSES.includes(row.status)) {
        setForm((f) => ({ ...f, nomAffiche: row.structure_name ?? '' }));
        setGuard('allowed');
      } else {
        setGuard('blocked');
      }
    })();

    return () => { cancelled = true; };
  }, [ref]);

  const set = <K extends keyof FicheForm>(field: K, value: FicheForm[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('saving');
    setErrorMsg('');

    const { data: result, error } = await supabase.rpc('submit_paid_fiche', {
      p_ref: ref,
      p_domaine_name: form.nomAffiche.trim(),
      p_contact_name: structureName.trim(),
      p_phone: form.telephone.trim(),
      p_whatsapp: form.whatsapp,
      p_website: form.siteInternet.trim(),
      p_where_to_buy: form.boutiqueEnLigne.trim(),
      p_map_link: form.lienVisite.trim(),
      p_short_presentation: form.presentation.trim(),
      p_style_cues: form.actionPrincipale.trim(),
    });

    if (error) {
      setErrorMsg('Une erreur est survenue. Veuillez réessayer ou nous contacter.');
      setSaveState('error');
      return;
    }

    if (result === 'already_submitted') {
      // Treat as success — idempotent from the user's perspective
      setSaveState('saved');
      return;
    }

    if (result === 'unpaid' || result === 'invalid_ref') {
      // Guard was bypassed somehow — re-block
      setGuard('blocked');
      return;
    }

    if (result === 'ok') {
      setSaveState('saved');
      return;
    }

    setErrorMsg('Une erreur inattendue est survenue. Veuillez nous contacter.');
    setSaveState('error');
  };

  // Loading guard
  if (guard === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#2d968a' }} />
          <p className="text-sm" style={{ color: '#6b7f72' }}>Vérification en cours...</p>
        </div>
      </Shell>
    );
  }

  // Blocked state
  if (guard === 'blocked') {
    return (
      <Shell>
        <div
          className="rounded-2xl px-7 py-10 flex flex-col items-center text-center"
          style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(155,60,30,0.07)', border: '1px solid rgba(155,60,30,0.15)' }}
          >
            <Lock className="w-6 h-6" style={{ color: '#9b3c1e' }} />
          </div>
          <h1 className="font-bold text-xl mb-3" style={{ color: '#1c2e28' }}>Accès non disponible</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#6b7f72' }}>
            La finalisation de la fiche est disponible après confirmation du règlement.
          </p>
          <button
            onClick={() => navigate('/vin')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#2d968a', color: '#fff' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'offre
          </button>
        </div>
      </Shell>
    );
  }

  // Saved success state
  if (saveState === 'saved') {
    return (
      <Shell>
        <div
          className="rounded-2xl px-7 py-10 flex flex-col items-center text-center"
          style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.2)' }}
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: '#2d968a' }} />
          </div>
          <h2 className="font-bold text-xl mb-2" style={{ color: '#1c2e28' }}>Vos informations ont bien été enregistrées.</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#6b7f72' }}>
            Nous finalisons votre fiche digitale et vous contacterons prochainement avant la mise en ligne.
          </p>
          <button
            onClick={() => navigate('/vin')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: '#f8f4ee', border: '1px solid #ddd6c8', color: '#6b7f72' }}
          >
            Retour à l'offre
          </button>
        </div>
      </Shell>
    );
  }

  // Main form (paid + not yet saved)
  const isSaving = saveState === 'saving';

  return (
    <Shell>
      {/* Page header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/vin')}
          className="flex items-center gap-2 mb-5 text-sm font-medium"
          style={{ color: '#6b7f72' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] mb-4"
          style={{ background: 'rgba(45,150,138,0.1)', border: '1px solid rgba(45,150,138,0.22)', color: '#1e8a7e' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2d968a' }} />
          Paiement confirmé
        </div>
        <h1 className="font-bold text-2xl leading-snug mb-1" style={{ color: '#1c2e28' }}>Finaliser votre fiche</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#6b7f72' }}>
          Complétez les informations essentielles pour activer votre présence.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <SectionLabel>Identité</SectionLabel>
          <Field label="Nom affiché">
            <input
              required
              type="text"
              value={form.nomAffiche}
              onChange={(e) => set('nomAffiche', e.target.value)}
              placeholder="Domaine de la Garrigue"
              style={inputStyle}
            />
          </Field>
        </Card>

        <Card>
          <SectionLabel>Contact</SectionLabel>
          <Field label="Téléphone">
            <input
              type="tel"
              inputMode="tel"
              value={form.telephone}
              onChange={(e) => set('telephone', e.target.value)}
              placeholder="04 xx xx xx xx"
              style={inputStyle}
            />
          </Field>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => set('whatsapp', !form.whatsapp)}
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: form.whatsapp ? '#2d968a' : '#c5b99e',
                  background: form.whatsapp ? '#2d968a' : 'transparent',
                }}
              >
                {form.whatsapp && (
                  <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 5 4.5 8.5 11 1" />
                  </svg>
                )}
              </button>
              <span className="text-sm" style={{ color: '#3a5048' }}>Disponible sur WhatsApp</span>
            </label>
          </div>
        </Card>

        <Card>
          <SectionLabel>Liens</SectionLabel>
          <div className="space-y-4">
            <Field label="Site internet">
              <input
                type="url"
                value={form.siteInternet}
                onChange={(e) => set('siteInternet', e.target.value)}
                placeholder="https://mondomaine.fr"
                style={inputStyle}
              />
            </Field>
            <Field label="Boutique en ligne">
              <input
                type="url"
                value={form.boutiqueEnLigne}
                onChange={(e) => set('boutiqueEnLigne', e.target.value)}
                placeholder="https://shop.mondomaine.fr"
                style={inputStyle}
              />
            </Field>
            <Field label="Lien de visite / oenotourisme">
              <input
                type="url"
                value={form.lienVisite}
                onChange={(e) => set('lienVisite', e.target.value)}
                placeholder="https://mondomaine.fr/visites"
                style={inputStyle}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <SectionLabel>Présentation</SectionLabel>
          <div className="space-y-4">
            <Field label="Texte court de présentation">
              <textarea
                value={form.presentation}
                onChange={(e) => set('presentation', e.target.value)}
                placeholder="Domaine familial de 12 hectares en appellation..."
                rows={4}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <p className="text-[11px] mt-1.5" style={{ color: '#b0a898' }}>
                2 à 4 phrases. Ce texte sera visible sur votre fiche digitale.
              </p>
            </Field>
            <Field label="Action principale souhaitée">
              <input
                type="text"
                value={form.actionPrincipale}
                onChange={(e) => set('actionPrincipale', e.target.value)}
                placeholder="Visite du domaine, dégustation sur place, commande en ligne..."
                style={inputStyle}
              />
              <p className="text-[11px] mt-1.5" style={{ color: '#b0a898' }}>
                Ce que vous souhaitez que les visiteurs fassent en priorité.
              </p>
            </Field>
          </div>
        </Card>

        {saveState === 'error' && (
          <div className="px-4 py-3.5 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#b91c1c' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || !form.nomAffiche.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]"
          style={{
            background: !isSaving && form.nomAffiche.trim() ? '#2d968a' : '#c8d8d4',
            color: '#fff',
            boxShadow: !isSaving && form.nomAffiche.trim() ? '0 4px 16px rgba(45,150,138,0.3)' : 'none',
            cursor: !isSaving && form.nomAffiche.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {isSaving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            : <>Enregistrer ma fiche <ArrowRight className="w-4 h-4" /></>
          }
        </button>

        <p className="text-[11px] text-center pb-4" style={{ color: '#b0a898' }}>
          Votre fiche sera relue par notre équipe avant mise en ligne.
        </p>
      </form>
    </Shell>
  );
}

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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#faf7f1' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #fdf9f2 0%, #f2fbf8 55%, #e8f6f3 100%)', zIndex: 0 }} />
      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 pt-12 pb-20">
        {children}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-6 py-5 space-y-4"
      style={{ background: '#fff', border: '1px solid #e2dcd2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest pb-1" style={{ color: '#9a8f7e', borderBottom: '1px solid #f0ebe2' }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#9a8f7e' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
