import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Wine, Leaf, Award, Globe, Phone, Mail, MapPin, Clock, ShoppingBag, MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WINE_TYPES = [
  { key: 'rouge', label: 'Rouge', color: 'border-red-300 bg-red-50 text-red-700' },
  { key: 'blanc', label: 'Blanc', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { key: 'rose', label: 'Rosé', color: 'border-pink-300 bg-pink-50 text-pink-700' },
  { key: 'bulles', label: 'Bulles', color: 'border-sky-300 bg-sky-50 text-sky-700' },
];

const STEPS = [
  { title: 'Identité du domaine', subtitle: 'Coordonnées et contact' },
  { title: 'Profil viticole', subtitle: 'Vins, appellations, démarches' },
  { title: 'Accueil & vente', subtitle: 'Services et présence locale' },
  { title: 'Présentation', subtitle: 'Votre histoire et vos atouts' },
  { title: 'Validation du dossier', subtitle: 'Récapitulatif et consentements' },
];

interface FormData {
  domaine_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  town: string;
  address: string;
  wine_types: string[];
  appellation: string;
  territory: string;
  style_cues: string;
  flagship_product: string;
  is_organic: boolean;
  is_sustainable: boolean;
  tasting_available: boolean;
  visit_available: boolean;
  direct_purchase: boolean;
  opening_times: string;
  reservation_required: boolean;
  whatsapp: boolean;
  where_to_buy: string;
  short_presentation: string;
  specialties: string;
  differentiators: string;
  consent_publication: boolean;
  consent_content_use: boolean;
}

const initialData: FormData = {
  domaine_name: '', contact_name: '', phone: '', email: '', website: '', town: '', address: '',
  wine_types: [], appellation: '', territory: '', style_cues: '', flagship_product: '',
  is_organic: false, is_sustainable: false,
  tasting_available: false, visit_available: false, direct_purchase: false,
  opening_times: '', reservation_required: false, whatsapp: false, where_to_buy: '',
  short_presentation: '', specialties: '', differentiators: '',
  consent_publication: false, consent_content_use: false,
};

interface AssociationOverride {
  association_id: string;
  association_name: string;
  association_member_status: 'member' | 'pending' | 'none';
  association_verified: boolean;
  association_badge_enabled: boolean;
  association_join_label: string;
  association_entry_path?: 'none' | 'direct' | 'invite';
  association_invited_at?: string;
  submission_status_override?: 'draft' | 'submitted' | 'under_review' | 'ready_for_publication' | 'published';
}

interface PrefillData {
  email?: string;
  contact_name?: string;
}

interface OnboardingFormProps {
  onSuccess: (slug: string) => void;
  associationOverride?: AssociationOverride;
  prefill?: PrefillData;
}

export function OnboardingForm({ onSuccess, associationOverride, prefill }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    ...initialData,
    ...(prefill?.email ? { email: prefill.email } : {}),
    ...(prefill?.contact_name ? { contact_name: prefill.contact_name } : {}),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWineType = (type: string) => {
    const current = data.wine_types;
    set('wine_types', current.includes(type) ? current.filter((t) => t !== type) : [...current, type]);
  };

  const canAdvance = () => {
    if (step === 0) return data.domaine_name && data.contact_name && data.email;
    if (step === 1) return data.wine_types.length > 0;
    if (step === 4) return data.consent_publication && data.consent_content_use;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    const slug = data.domaine_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const uniqueSlug = `${slug}-${Date.now()}`;

    const { submission_status_override, ...cleanAssociationOverride } = associationOverride ?? {};

    const { error: dbError } = await supabase.from('wine_profiles').insert({
      ...data,
      slug: uniqueSlug,
      is_published: false,
      is_seeded: false,
      submission_status: submission_status_override ?? 'submitted',
      submitted_at: new Date().toISOString(),
      ...cleanAssociationOverride,
    });

    if (dbError) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onSuccess(uniqueSlug);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-cypress-600 text-white' : i === step ? 'bg-cypress-700 text-white ring-4 ring-cypress-100' : 'bg-warm-100 text-warm-400'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 transition-all ${i < step ? 'bg-cypress-300' : 'bg-warm-200'}`} />
              )}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{STEPS[step].title}</h2>
        <p className="text-warm-500 text-sm">{STEPS[step].subtitle}</p>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Nom du domaine *" icon={<Wine className="w-4 h-4" />}>
            <input type="text" value={data.domaine_name} onChange={(e) => set('domaine_name', e.target.value)}
              placeholder="Domaine de la Serre" className={inputClass} />
          </Field>
          <Field label="Nom du contact *" icon={<span className="text-xs font-bold text-warm-400">NOM</span>}>
            <input type="text" value={data.contact_name} onChange={(e) => set('contact_name', e.target.value)}
              placeholder="Marie Fontaine" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone" icon={<Phone className="w-4 h-4" />}>
              <input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="04 67 77 12 34" className={inputClass} />
            </Field>
            <Field label="Email *" icon={<Mail className="w-4 h-4" />}>
              <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)}
                placeholder="contact@domaine.fr" className={inputClass} />
            </Field>
          </div>
          <Field label="Site internet" icon={<Globe className="w-4 h-4" />}>
            <input type="url" value={data.website} onChange={(e) => set('website', e.target.value)}
              placeholder="www.mon-domaine.fr" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Commune" icon={<MapPin className="w-4 h-4" />}>
              <input type="text" value={data.town} onChange={(e) => set('town', e.target.value)}
                placeholder="Saint-Chinian" className={inputClass} />
            </Field>
            <Field label="Adresse" icon={<MapPin className="w-4 h-4" />}>
              <input type="text" value={data.address} onChange={(e) => set('address', e.target.value)}
                placeholder="12 chemin des Vignes" className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Types de vins produits *</label>
            <div className="grid grid-cols-2 gap-3">
              {WINE_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => toggleWineType(type.key)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 font-semibold transition-all ${
                    data.wine_types.includes(type.key) ? type.color + ' border-current' : 'border-warm-200 text-warm-500 hover:border-warm-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                    data.wine_types.includes(type.key) ? 'border-current bg-current' : 'border-warm-300'
                  }`}>
                    {data.wine_types.includes(type.key) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Appellation" icon={<Award className="w-4 h-4" />}>
            <input type="text" value={data.appellation} onChange={(e) => set('appellation', e.target.value)}
              placeholder="Saint-Chinian AOC, IGP Pays de l'Hérault…" className={inputClass} />
          </Field>
          <Field label="Territoire / région" icon={<MapPin className="w-4 h-4" />}>
            <input type="text" value={data.territory} onChange={(e) => set('territory', e.target.value)}
              placeholder="Languedoc-Roussillon, Hérault…" className={inputClass} />
          </Field>
          <Field label="Cuvée phare" icon={<Wine className="w-4 h-4" />}>
            <input type="text" value={data.flagship_product} onChange={(e) => set('flagship_product', e.target.value)}
              placeholder="Cuvée La Serre Rouge 2021" className={inputClass} />
          </Field>
          <Field label="Style / descripteurs" icon={<span className="text-xs font-bold text-warm-400">STYLE</span>}>
            <input type="text" value={data.style_cues} onChange={(e) => set('style_cues', e.target.value)}
              placeholder="Élégant, structuré, fruité…" className={inputClass} />
          </Field>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Démarches</label>
            <div className="space-y-2">
              <Toggle checked={data.is_organic} onChange={(v) => set('is_organic', v)} icon={<Leaf className="w-4 h-4 text-emerald-600" />} label="Agriculture biologique" />
              <Toggle checked={data.is_sustainable} onChange={(v) => set('is_sustainable', v)} icon={<Award className="w-4 h-4 text-teal-600" />} label="Démarche durable (HVE, biodynamie…)" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Services proposés</label>
            <div className="space-y-2">
              <Toggle checked={data.tasting_available} onChange={(v) => set('tasting_available', v)} icon={<Wine className="w-4 h-4 text-wine-600" />} label="Dégustation disponible" />
              <Toggle checked={data.visit_available} onChange={(v) => set('visit_available', v)} icon={<MapPin className="w-4 h-4 text-warm-500" />} label="Visite du domaine" />
              <Toggle checked={data.direct_purchase} onChange={(v) => set('direct_purchase', v)} icon={<ShoppingBag className="w-4 h-4 text-emerald-600" />} label="Vente directe au domaine" />
              <Toggle checked={data.reservation_required} onChange={(v) => set('reservation_required', v)} icon={<Clock className="w-4 h-4 text-warm-400" />} label="Sur rendez-vous uniquement" />
              <Toggle checked={data.whatsapp} onChange={(v) => set('whatsapp', v)} icon={<MessageCircle className="w-4 h-4 text-green-600" />} label="Contact WhatsApp disponible" />
            </div>
          </div>

          <Field label="Horaires d'ouverture" icon={<Clock className="w-4 h-4" />}>
            <input type="text" value={data.opening_times} onChange={(e) => set('opening_times', e.target.value)}
              placeholder="Lundi–Samedi 9h–12h / 14h–18h" className={inputClass} />
          </Field>
          <Field label="Où trouver nos vins" icon={<MapPin className="w-4 h-4" />}>
            <input type="text" value={data.where_to_buy} onChange={(e) => set('where_to_buy', e.target.value)}
              placeholder="Cave coopérative de Sète, épiceries bio…" className={inputClass} />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Présentation courte *</label>
            <p className="text-xs text-warm-400 mb-2">Ce texte apparaîtra sur votre carte publique (2–4 phrases)</p>
            <textarea
              value={data.short_presentation}
              onChange={(e) => set('short_presentation', e.target.value)}
              rows={4}
              placeholder="Niché au cœur du Languedoc, notre domaine familial perpétue un savoir-faire de quatre générations…"
              className={inputClass + ' resize-none'}
            />
          </div>
          <Field label="Spécialités" icon={<Award className="w-4 h-4" />}>
            <input type="text" value={data.specialties} onChange={(e) => set('specialties', e.target.value)}
              placeholder="Vinification parcellaire, élevage en foudres…" className={inputClass} />
          </Field>
          <Field label="Ce qui vous distingue" icon={<span className="text-xs font-bold text-wine-600">★</span>}>
            <input type="text" value={data.differentiators} onChange={(e) => set('differentiators', e.target.value)}
              placeholder="L'un des rares domaines bio certifiés depuis 2008…" className={inputClass} />
          </Field>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-warm-50 border border-warm-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Récapitulatif du dossier</h3>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">En cours de saisie</span>
            </div>
            <div className="space-y-1.5 text-sm text-warm-600">
              <div className="flex gap-2">
                <span className="text-warm-400 w-24 flex-shrink-0">Domaine</span>
                <span className="font-medium text-slate-900">{data.domaine_name || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-warm-400 w-24 flex-shrink-0">Commune</span>
                <span>{data.town || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-warm-400 w-24 flex-shrink-0">Contact</span>
                <span>{data.contact_name || '—'}</span>
              </div>
              {data.wine_types.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-warm-400 w-24 flex-shrink-0">Vins</span>
                  <span>{data.wine_types.map((t) => wineTypeLabels[t] || t).join(', ')}</span>
                </div>
              )}
              {data.appellation && (
                <div className="flex gap-2">
                  <span className="text-warm-400 w-24 flex-shrink-0">Appellation</span>
                  <span>{data.appellation}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-warm-200">
              <p className="text-xs text-warm-400">Une fois soumis, votre dossier entre en phase de validation. Votre fiche sera publiée sous 48h après confirmation.</p>
            </div>
          </div>

          <div className="space-y-3">
            <ConsentCheck
              checked={data.consent_publication}
              onChange={(v) => set('consent_publication', v)}
              label="J'autorise la publication de ma fiche domaine sur la plateforme Vinocap 2026"
            />
            <ConsentCheck
              checked={data.consent_content_use}
              onChange={(v) => set('consent_content_use', v)}
              label="J'accepte que les informations saisies soient utilisées pour créer ma présence digitale dans le cadre de l'événement Vinocap"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-warm-100">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm font-medium text-warm-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-warm-50 transition-all">
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-cypress-600 hover:bg-cypress-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Continuer
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canAdvance() || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-cypress-600 hover:bg-cypress-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Soumettre mon dossier
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const wineTypeLabels: Record<string, string> = {
  rouge: 'Rouge', blanc: 'Blanc', rose: 'Rosé', bulles: 'Bulles',
};

const inputClass = 'w-full px-4 py-2.5 border border-warm-200 rounded-lg text-sm focus:ring-2 focus:ring-cypress-300 focus:border-transparent outline-none transition-all text-slate-900 placeholder-warm-400';

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
        <span className="text-warm-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, icon, label }: { checked: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
        checked ? 'border-cypress-200 bg-cypress-50' : 'border-warm-200 bg-white hover:border-warm-300'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        checked ? 'border-cypress-600 bg-cypress-600' : 'border-warm-300'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-warm-400 flex-shrink-0">{icon}</span>
      <span className={`text-sm font-medium ${checked ? 'text-cypress-800' : 'text-warm-600'}`}>{label}</span>
    </button>
  );
}

function ConsentCheck({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-start gap-3 px-4 py-4 rounded-xl border transition-all text-left ${
        checked ? 'border-cypress-200 bg-cypress-50' : 'border-warm-200 bg-white hover:border-warm-300'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
        checked ? 'border-cypress-600 bg-cypress-600' : 'border-warm-300'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm text-warm-600 leading-snug">{label}</span>
    </button>
  );
}
