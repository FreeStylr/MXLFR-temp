import { useEffect, useState } from 'react';
import { Fish, ArrowLeft, Check, Wine, AlertTriangle, Clock, ArrowRight, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OnboardingForm } from '../components/OnboardingForm';

interface InviteRecord {
  id: string;
  token: string;
  association_id: string;
  association_name: string;
  association_join_label: string;
  invited_email: string;
  invited_name: string;
  status: string;
  expires_at: string | null;
}

interface AssociationInvitePageProps {
  token: string;
  onBack: () => void;
  onSuccess: (slug: string) => void;
}

export function AssociationInvitePage({ token, onBack, onSuccess }: AssociationInvitePageProps) {
  const [invite, setInvite] = useState<InviteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [expired, setExpired] = useState(false);
  const [successSlug, setSuccessSlug] = useState('');
  const [mode, setMode] = useState<'landing' | 'form' | 'success'>('landing');

  useEffect(() => {
    supabase
      .from('wine_association_invites')
      .select('*')
      .eq('token', token)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setInvalid(true);
        } else if (data.status !== 'pending') {
          setInvalid(true);
        } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setExpired(true);
        } else {
          setInvite(data as InviteRecord);
        }
        setLoading(false);
      });
  }, [token]);

  const handleSuccess = async (slug: string) => {
    const { data: profile } = await supabase
      .from('wine_profiles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    await supabase
      .from('wine_association_invites')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
        winery_profile_id: profile?.id ?? null,
      })
      .eq('token', token);

    setSuccessSlug(slug);
    setMode('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-warm-50 pt-24">
        <div className="max-w-md mx-auto px-5 py-20 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lien expiré</h2>
          <p className="text-warm-500 mb-6 text-sm leading-relaxed">
            Ce lien d'invitation n'est plus valide. Contactez l'association pour recevoir un nouveau lien.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all text-sm"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (invalid || !invite) {
    return (
      <div className="min-h-screen bg-warm-50 pt-24">
        <div className="max-w-md mx-auto px-5 py-20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wine className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invitation introuvable</h2>
          <p className="text-warm-500 mb-6 text-sm leading-relaxed">
            Ce lien d'invitation n'est pas valide ou a déjà été utilisé. Contactez l'association pour obtenir un nouveau lien.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all text-sm"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'success') {
    return (
      <div className="min-h-screen bg-warm-50 pt-24">
        <div className="max-w-xl mx-auto px-5 py-16">
          <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-8 py-8 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-5">
                <Check className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Fish className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                  Membre de la Route — Dossier reçu
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Votre dossier membre a été soumis</h1>
              <p className="text-blue-100 text-sm leading-relaxed">
                Votre appartenance à la Route des Vignerons et des Pêcheurs est enregistrée et sera visible sur votre fiche.
              </p>
            </div>

            <div className="px-8 py-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-warm-100" />
                <span className="text-xs font-semibold text-warm-400 uppercase tracking-wide">Statut du dossier membre</span>
                <div className="flex-1 h-px bg-warm-100" />
              </div>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-800">En cours de validation</span>
                <span className="ml-auto text-xs text-warm-400 font-medium">Voie membre prioritaire</span>
              </div>
              <p className="text-xs text-warm-400 mb-6 pl-5">
                En tant que membre invité par la Route, votre dossier entre directement en phase de validation — sans étape de tri générique.
              </p>

              <div className="space-y-4">
                {[
                  { num: 1, label: "Dossier soumis via invitation Route", done: true, desc: "Votre appartenance à la Route est enregistrée dans votre profil." },
                  { num: 2, label: "Validation par l'équipe Vinocap", done: false, desc: "Votre fiche est vérifiée — parcours membre accéléré." },
                  { num: 3, label: "Publication avec badge Route", done: false, desc: "Votre fiche sera visible avec le badge Membre de la Route." },
                  { num: 4, label: "Apparition sur la page de l'association", done: false, desc: "Votre domaine sera listé parmi les membres de la Route sur Vinocap." },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      item.done ? 'bg-blue-100 text-blue-700' : 'bg-warm-100 text-warm-400'
                    }`}>
                      {item.done ? <Check className="w-3.5 h-3.5" /> : item.num}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold mb-0.5 ${item.done ? 'text-blue-700' : 'text-slate-700'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-warm-400 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-5 bg-warm-50 border-t border-warm-100 space-y-3">
              {successSlug && (
                <div className="flex items-start gap-3 p-3 bg-white border border-warm-200 rounded-xl">
                  <div className="w-7 h-7 bg-warm-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Link className="w-3.5 h-3.5 text-warm-500" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-0.5">Votre URL permanente Vinocap</div>
                    <div className="text-xs text-warm-400 font-mono break-all">/vin/carte/{successSlug}</div>
                    <div className="text-xs text-warm-400 mt-1">Active dès publication de votre fiche.</div>
                  </div>
                </div>
              )}
              <p className="text-xs text-warm-500 leading-relaxed">
                Votre fiche apparaîtra sur la page de la Route des Vignerons et des Pêcheurs dès publication.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSuccess(successSlug)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all"
            >
              Voir mon dossier
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl font-semibold border border-warm-200 text-warm-600 hover:bg-warm-50 transition-all"
            >
              Retour à l'association
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'form') {
    return (
      <div className="min-h-screen bg-warm-50 pt-24">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 py-12">
          <button
            onClick={() => setMode('landing')}
            className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <Fish className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-xs font-semibold text-blue-800">{invite.association_name}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Invitation valide</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900 text-blue-100 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
              <Fish className="w-3 h-3" />
              Dossier de participation — Voie membre
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Rejoignez Vinocap 2026</h1>
            <p className="text-warm-500 leading-relaxed">
              Invité par la <strong className="text-slate-700">{invite.association_name}</strong>. Votre badge membre sera automatiquement ajouté. Durée estimée : 10–15 minutes.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-8">
            <div className="flex items-start gap-3">
              <Fish className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-800 mb-0.5">{invite.association_join_label}</div>
                <div className="text-xs text-blue-600">
                  Ce badge apparaîtra sur votre fiche publique et dans le listing de la Route. Votre dossier entre directement en phase de validation.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-warm-200 rounded-2xl p-8">
            <OnboardingForm
              onSuccess={handleSuccess}
              associationOverride={{
                association_id: invite.association_id,
                association_name: invite.association_name,
                association_member_status: 'member',
                association_verified: true,
                association_badge_enabled: true,
                association_join_label: invite.association_join_label,
                association_entry_path: 'invite',
                association_invited_at: new Date().toISOString(),
                submission_status_override: 'under_review',
              }}
              prefill={{
                email: invite.invited_email,
                contact_name: invite.invited_name,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pt-24">
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="flex items-center gap-2 mb-7">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <Fish className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-xs font-semibold text-blue-800">{invite.association_name}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <Check className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Invitation valide</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900 text-blue-100 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
            <Fish className="w-3 h-3" />
            Voie membre — Route des Vignerons
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Créez votre fiche domaine
          </h1>
          <p className="text-warm-500 leading-relaxed max-w-lg">
            Vous avez été invité par la <strong className="text-slate-700">{invite.association_name}</strong> à rejoindre Vinocap 2026. En tant que membre, votre dossier entre directement en phase de validation avec votre badge Route affiché.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Fish,
              title: 'Badge membre affiché',
              desc: "Votre appartenance à la Route est visible sur votre fiche publique.",
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: Clock,
              title: 'Validation accélérée',
              desc: "Dossier membre — validation prioritaire sans étape de tri générique.",
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: Check,
              title: 'Présence dans la Route',
              desc: "Votre domaine apparaîtra sur la page de l'association Vinocap.",
              color: 'bg-emerald-50 text-emerald-600',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white border border-warm-200 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-1">{item.title}</div>
                <div className="text-xs text-warm-400 leading-relaxed">{item.desc}</div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setMode('form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-blue-700 hover:bg-blue-800 text-white transition-all shadow-lg text-base mb-3"
        >
          <Fish className="w-5 h-5" />
          Créer mon dossier membre
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="text-xs text-warm-400">10–15 minutes · Validation prioritaire · Badge Route inclus</div>
      </div>
    </div>
  );
}
