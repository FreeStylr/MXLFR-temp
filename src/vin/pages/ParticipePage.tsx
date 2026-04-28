import { useState } from 'react';
import { Check, Wine, Globe, Smartphone, TrendingUp, FileText, ArrowRight, ChevronRight, Link, Send, ChevronLeft, Mail, Phone as PhoneIcon, User } from 'lucide-react';
import { OnboardingForm } from '../components/OnboardingForm';
import { WineryCard } from '../components/WineryCard';
import { WineryProfile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const BENEFITS = [
  { icon: Smartphone, title: 'QR Code sur votre stand', desc: 'Accès instantané à votre fiche — sans téléchargement.' },
  { icon: Globe, title: 'Fiche publique 365 jours', desc: 'Avant, pendant et après Vinocap — votre profil reste actif.' },
  { icon: TrendingUp, title: 'Audience qualifiée', desc: 'Visiteurs, acheteurs pros, amateurs — toute la région.' },
  { icon: Wine, title: 'Carte domaine complète', desc: 'Vins, certifications, contact, horaires — tout en un.' },
];

const PREVIEW_WINERY: WineryProfile = {
  id: 'preview',
  created_at: '',
  domaine_name: 'Votre Domaine',
  contact_name: 'Vous',
  phone: '04 67 00 00 00',
  email: 'contact@votre-domaine.fr',
  website: 'www.votre-domaine.fr',
  town: 'Votre Commune',
  address: 'Votre adresse',
  appellation: 'Votre AOC',
  territory: 'Languedoc',
  wine_types: ['rouge', 'blanc'],
  style_cues: 'Votre style, vos descripteurs',
  flagship_product: 'Votre Cuvée Phare 2022',
  is_organic: true,
  is_premium: false,
  is_sustainable: true,
  tasting_available: true,
  visit_available: true,
  direct_purchase: true,
  opening_times: 'Du lundi au samedi 9h–18h',
  reservation_required: false,
  whatsapp: true,
  where_to_buy: '',
  short_presentation: "Votre histoire, votre terroir, votre passion — présentés sur votre fiche domaine personnalisée. Visible sur la plateforme Vinocap 2026 toute l'année.",
  specialties: 'Vos spécialités et savoir-faire',
  differentiators: 'Ce qui vous distingue des autres domaines',
  is_published: true,
  is_seeded: false,
  slug: 'preview',
  origin_scheme_type: 'AOC',
  appellation_name: 'Votre Appellation',
  protected_display_term: 'Votre Appellation AOC',
  official_origin_verified: false,
  official_origin_logo_enabled: true,
  bio_ab: true,
  hve: false,
  terra_vitis: false,
  vegan: false,
  sustainable_claim: '',
  certification_notes: '',
  association_id: 'route-des-vignerons-et-des-pecheurs',
  association_name: 'Route des Vignerons et des Pêcheurs',
  association_member_status: 'member',
  association_verified: false,
  association_badge_enabled: true,
  association_join_label: 'Membre de la Route des Vignerons et des Pêcheurs',
  submission_status: 'published',
  submitted_at: null,
  review_notes: '',
  publication_ready_at: null,
};

interface ParticipatePageProps {
  onNavigate: (page: string) => void;
}

interface QuickFormData {
  domaine_name: string;
  contact_name: string;
  email: string;
  phone: string;
}

export function ParticiperPage({ onNavigate }: ParticipatePageProps) {
  const [mode, setMode] = useState<'landing' | 'quick' | 'full' | 'success'>('landing');
  const [successSlug, setSuccessSlug] = useState('');
  const [quickData, setQuickData] = useState<QuickFormData>({ domaine_name: '', contact_name: '', email: '', phone: '' });
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickError, setQuickError] = useState('');

  const handleSuccess = (slug: string) => {
    setSuccessSlug(slug);
    setMode('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSubmit = async () => {
    if (!quickData.domaine_name || !quickData.email) return;
    setQuickSubmitting(true);
    setQuickError('');

    const slug = quickData.domaine_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueSlug = `${slug}-${Date.now()}`;

    const { error: dbError } = await supabase.from('wine_profiles').insert({
      domaine_name: quickData.domaine_name,
      contact_name: quickData.contact_name,
      email: quickData.email,
      phone: quickData.phone,
      slug: uniqueSlug,
      is_published: false,
      is_seeded: false,
      submission_status: 'submitted',
      submitted_at: new Date().toISOString(),
      wine_types: [],
    });

    if (dbError) {
      setQuickError('Une erreur est survenue. Veuillez réessayer.');
      setQuickSubmitting(false);
      return;
    }

    setQuickSubmitting(false);
    handleSuccess(uniqueSlug);
  };

  if (mode === 'success') {
    return (
      <div className="min-h-screen pt-16" style={{ background: '#FCFBF7' }}>
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid rgba(121,215,242,0.25)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.1)' }}>
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #22C7C9 0%, #79D7F2 100%)' }} />
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(34,199,201,0.1)' }}>
                <Check className="w-6 h-6" style={{ color: '#22C7C9' }} />
              </div>
              <h1 className="text-xl font-bold mb-1" style={{ color: '#24343A' }}>Dossier reçu !</h1>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#7a9ea6' }}>
                Votre demande est en cours de traitement. Votre fiche sera publiée sous 48h après validation.
              </p>

              <div className="space-y-3 mb-5">
                {[
                  { n: 1, label: 'Demande reçue', done: true, desc: 'Vos informations ont été enregistrées.' },
                  { n: 2, label: 'Validation Vinocap', done: false, desc: "Un membre de l'équipe vérifie votre dossier." },
                  { n: 3, label: 'Publication de votre fiche', done: false, desc: 'Votre profil sera mis en ligne et accessible.' },
                  { n: 4, label: 'Génération du QR Code', done: false, desc: 'Votre code unique pour affichage sur le stand.' },
                ].map((item) => (
                  <div key={item.n} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: item.done ? 'rgba(34,199,201,0.12)' : 'rgba(121,215,242,0.1)',
                        color: item.done ? '#22C7C9' : '#9ab8b0',
                      }}
                    >
                      {item.done ? <Check className="w-3 h-3" /> : item.n}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: item.done ? '#22C7C9' : '#4a6a72' }}>{item.label}</div>
                      <div className="text-xs leading-relaxed" style={{ color: '#7a9ea6' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {successSlug && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(121,215,242,0.07)', border: '1px solid rgba(121,215,242,0.25)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(34,199,201,0.1)' }}>
                    <Link className="w-3 h-3" style={{ color: '#22C7C9' }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: '#24343A' }}>Votre URL Vinocap permanente</div>
                    <div className="text-xs font-mono mt-0.5 break-all" style={{ color: '#7a9ea6' }}>/vin/carte/{successSlug}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onNavigate('domaines')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all text-sm hover:scale-[1.02] duration-300"
              style={{ background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)', boxShadow: '0 8px 24px -8px rgba(34,199,201,0.4)' }}
            >
              Voir les domaines <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-3 rounded-xl font-semibold transition-all text-sm"
              style={{ border: '1px solid rgba(121,215,242,0.3)', color: '#4a6a72', background: 'transparent' }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'full') {
    return (
      <div className="min-h-screen pt-16" style={{ background: '#FCFBF7' }}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => setMode('landing')}
            className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: '#79D7F2' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Retour
          </button>
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3"
              style={{ background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)' }}
            >
              <FileText className="w-3 h-3" /> Dossier complet
            </span>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#24343A' }}>Compléter ma fiche domaine</h1>
            <p className="text-sm" style={{ color: '#7a9ea6' }}>5 étapes · 10–15 minutes</p>
          </div>
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(121,215,242,0.25)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.08)' }}>
            <OnboardingForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quick') {
    const canSubmit = !!quickData.domaine_name && !!quickData.email;
    return (
      <div className="min-h-screen pt-16" style={{ background: '#FCFBF7' }}>
        <div className="max-w-md mx-auto px-4 py-10">
          <button
            onClick={() => setMode('landing')}
            className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: '#79D7F2' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Retour
          </button>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(121,215,242,0.25)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.1)' }}>
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #22C7C9 0%, #79D7F2 100%)' }} />
            <div className="p-6">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider mb-4"
                style={{ background: 'rgba(34,199,201,0.1)', border: '1px solid rgba(34,199,201,0.28)', color: '#15a8aa' }}
              >
                Etape 1 — Premiers contacts
              </span>
              <h2 className="text-xl font-bold mb-1" style={{ color: '#24343A' }}>Manifestez votre intérêt</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#7a9ea6' }}>
                Renseignez vos informations de base. Vous compléterez votre fiche domaine dans un second temps, une fois votre place confirmée.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#4a6a72' }}>
                    <Wine className="w-3.5 h-3.5" style={{ color: '#79D7F2' }} /> Nom du domaine *
                  </label>
                  <input
                    type="text"
                    value={quickData.domaine_name}
                    onChange={(e) => setQuickData({ ...quickData, domaine_name: e.target.value })}
                    placeholder="Domaine de la Serre"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ border: '1px solid rgba(121,215,242,0.3)', background: 'rgba(255,255,255,0.8)', color: '#24343A' }}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#4a6a72' }}>
                    <User className="w-3.5 h-3.5" style={{ color: '#79D7F2' }} /> Nom du contact
                  </label>
                  <input
                    type="text"
                    value={quickData.contact_name}
                    onChange={(e) => setQuickData({ ...quickData, contact_name: e.target.value })}
                    placeholder="Marie Fontaine"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ border: '1px solid rgba(121,215,242,0.3)', background: 'rgba(255,255,255,0.8)', color: '#24343A' }}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#4a6a72' }}>
                    <Mail className="w-3.5 h-3.5" style={{ color: '#79D7F2' }} /> Email *
                  </label>
                  <input
                    type="email"
                    value={quickData.email}
                    onChange={(e) => setQuickData({ ...quickData, email: e.target.value })}
                    placeholder="contact@domaine.fr"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ border: '1px solid rgba(121,215,242,0.3)', background: 'rgba(255,255,255,0.8)', color: '#24343A' }}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#4a6a72' }}>
                    <PhoneIcon className="w-3.5 h-3.5" style={{ color: '#79D7F2' }} /> Téléphone
                  </label>
                  <input
                    type="tel"
                    value={quickData.phone}
                    onChange={(e) => setQuickData({ ...quickData, phone: e.target.value })}
                    placeholder="04 67 77 12 34"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ border: '1px solid rgba(121,215,242,0.3)', background: 'rgba(255,255,255,0.8)', color: '#24343A' }}
                  />
                </div>
              </div>

              {quickError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                  {quickError}
                </div>
              )}

              <div className="mt-6 space-y-2.5">
                <button
                  onClick={handleQuickSubmit}
                  disabled={!canSubmit || quickSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)', boxShadow: '0 8px 24px -8px rgba(34,199,201,0.4)' }}
                >
                  {quickSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer ma demande
                    </>
                  )}
                </button>
                <button
                  onClick={() => setMode('full')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ color: '#7a9ea6' }}
                >
                  Remplir le dossier complet directement
                </button>
              </div>

              <p className="text-center text-xs mt-4 leading-relaxed" style={{ color: '#9ab8b0' }}>
                Après confirmation, vous recevrez un lien pour compléter votre fiche domaine.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: '#FCFBF7' }}>

      <div className="bg-white" style={{ borderBottom: '1px solid rgba(121,215,242,0.25)' }}>
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(34,199,201,0.1)', border: '1px solid rgba(34,199,201,0.28)', color: '#15a8aa' }}
          >
            Exposants Vinocap 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight mb-2" style={{ color: '#24343A' }}>
            Rejoignez la plateforme
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#7a9ea6' }}>
            Déposez votre dossier. Votre fiche domaine sera publiée et accessible toute l'année — avant, pendant et après l'événement.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(121,215,242,0.25)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.1)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #22C7C9 0%, #79D7F2 100%)' }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#24343A' }}>Participer à Vinocap 2026</h2>
                <p className="text-xs mt-0.5" style={{ color: '#9ab8b0' }}>Gratuit pour les exposants · Validation sous 48h</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,199,201,0.1)', border: '1px solid rgba(34,199,201,0.22)' }}>
                <Wine className="w-5 h-5" style={{ color: '#22C7C9' }} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => { setMode('quick'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] duration-300"
                style={{ background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)', boxShadow: '0 6px 20px -6px rgba(34,199,201,0.4)' }}
              >
                <Send className="w-4 h-4" />
                Manifester mon intérêt
              </button>
              <button
                onClick={() => { setMode('full'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{ border: '1px solid rgba(121,215,242,0.3)', color: '#4a6a72' }}
              >
                <FileText className="w-4 h-4" />
                Dossier complet
              </button>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(121,215,242,0.2)' }}>
              <div className="flex items-center gap-4 text-xs" style={{ color: '#7a9ea6' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C7C9' }} />
                  Gratuit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#79D7F2' }} />
                  Publication sous 48h
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F3D77A' }} />
                  QR Code inclus
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="bg-white rounded-2xl p-4 transition-transform hover:scale-[1.02] duration-300" style={{ border: '1px solid rgba(121,215,242,0.22)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.08)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(34,199,201,0.1)', border: '1px solid rgba(34,199,201,0.2)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#22C7C9' }} />
                </div>
                <div className="font-bold text-sm mb-0.5" style={{ color: '#24343A' }}>{b.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: '#7a9ea6' }}>{b.desc}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(121,215,242,0.22)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.08)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#9ab8b0' }}>Comment ça marche</h3>
          <div className="space-y-3">
            {[
              { n: '1', label: 'Manifestez votre intérêt', desc: 'Formulaire rapide — nom, contact, email.' },
              { n: '2', label: 'Finalisez votre fiche', desc: 'Complétez vins, photos et descripteurs à votre rythme.' },
              { n: '3', label: 'Validation & publication', desc: "L'équipe Vinocap vérifie et publie votre profil." },
              { n: '4', label: 'QR Code sur votre stand', desc: 'Votre code unique est prêt pour l\'événement.' },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#22C7C9' }}>
                  {s.n}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#24343A' }}>{s.label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: '#7a9ea6' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ab8b0' }}>Aperçu de votre fiche</h3>
            <span className="text-[10px] font-medium" style={{ color: '#9ab8b0' }}>Une fois publiée</span>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(121,215,242,0.25)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.08)' }}>
            <WineryCard winery={PREVIEW_WINERY} compact onViewCard={() => {}} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(121,215,242,0.22)', boxShadow: '0 10px 30px -10px rgba(36,52,58,0.08)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#9ab8b0' }}>Questions fréquentes</h3>
          <div className="space-y-4">
            {[
              { q: 'Combien coûte la participation ?', a: "L'inscription est gratuite pour les exposants Vinocap 2026." },
              { q: 'Comment fonctionne le QR Code ?', a: 'Une fois votre fiche validée, vous recevez un QR Code unique à afficher sur votre stand.' },
              { q: "La fiche reste en ligne après l'événement ?", a: 'Oui. Votre présence digitale perdure entre les éditions.' },
            ].map((faq, i, arr) => (
              <div key={i} className="pb-4 last:pb-0" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(121,215,242,0.15)' : 'none' }}>
                <div className="font-semibold text-sm mb-1" style={{ color: '#24343A' }}>{faq.q}</div>
                <div className="text-xs leading-relaxed" style={{ color: '#7a9ea6' }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setMode('quick'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] duration-300"
          style={{ background: 'linear-gradient(135deg, #22C7C9 0%, #1ab0b2 100%)', boxShadow: '0 8px 24px -8px rgba(34,199,201,0.4)' }}
        >
          Manifester mon intérêt
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
