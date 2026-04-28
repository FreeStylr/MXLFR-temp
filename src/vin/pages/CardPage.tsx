import { useEffect, useState } from 'react';
import { ArrowLeft, Wine, Clock, Check, Fish } from 'lucide-react';
import { supabase, WineryProfile } from '../lib/supabase';
import { WineryCard } from '../components/WineryCard';
import { SUBMISSION_STATUS_LABELS, SUBMISSION_STATUS_COLORS, SubmissionStatus } from '../lib/profileReadiness';

interface CardPageProps {
  slug: string;
  onBack: () => void;
}

export function CardPage({ slug, onBack }: CardPageProps) {
  const [winery, setWinery] = useState<WineryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from('wine_profiles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setWinery(data as WineryProfile);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: '#faf7f1' }}>
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2d968a', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (notFound || !winery) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-5" style={{ background: '#faf7f1' }}>
        <div className="text-center max-w-xs">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f0ece5', border: '1px solid #e0dbd2' }}
          >
            <Wine className="w-7 h-7" style={{ color: '#c5b99e' }} />
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: '#1e2a26' }}>Fiche introuvable</h2>
          <p className="text-sm mb-5" style={{ color: '#9a8f7e' }}>Ce domaine n'existe pas sur la plateforme.</p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ background: '#2d968a' }}
          >
            Voir les domaines
          </button>
        </div>
      </div>
    );
  }

  if (!winery.is_published) {
    const status = (winery.submission_status as SubmissionStatus) ?? 'submitted';
    const statusLabel = SUBMISSION_STATUS_LABELS[status] ?? 'En cours de traitement';
    const statusColor = SUBMISSION_STATUS_COLORS[status] ?? SUBMISSION_STATUS_COLORS['submitted'];

    const isRouteMember =
      winery.association_member_status === 'member' &&
      winery.association_badge_enabled &&
      winery.association_entry_path === 'invite';

    const steps = [
      {
        label: isRouteMember ? 'Dossier soumis via invitation Route' : 'Dossier soumis',
        done: true,
        desc: isRouteMember
          ? 'Votre appartenance à la Route est enregistrée dans votre profil.'
          : 'Vos informations ont été enregistrées.',
      },
      {
        label: "Validation par l'équipe Vinocap",
        done: status === 'under_review' || status === 'ready_for_publication',
        desc: isRouteMember
          ? "Votre fiche est vérifiée — parcours membre accéléré."
          : "Un membre de l'équipe vérifie votre fiche.",
      },
      {
        label: 'Fiche prête pour publication',
        done: status === 'ready_for_publication',
        desc: 'Votre fiche a passé la revue qualité.',
      },
      {
        label: isRouteMember ? 'Publication avec badge Route' : 'Publication en ligne',
        done: false,
        desc: isRouteMember
          ? 'Votre fiche sera visible avec le badge Membre de la Route.'
          : 'Votre fiche sera visible publiquement sur cette URL.',
      },
    ];

    return (
      <div className="min-h-screen pt-16" style={{ background: '#faf7f1' }}>
        <div className="max-w-md mx-auto px-5 py-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: '#9a8f7e' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </button>

          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: '#fff', border: '1px solid #e8e2d9' }}
          >
            <div className="h-1" style={{ background: 'linear-gradient(to right, #c5b060, #e0c87a)' }} />
            <div className="p-6">
              <div className="flex items-start gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(197,176,96,0.1)', border: '1px solid rgba(197,176,96,0.25)' }}
                >
                  <Clock className="w-5 h-5" style={{ color: '#a08830' }} />
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-1.5 ${statusColor}`}>
                    {statusLabel}
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: '#1e2a26' }}>{winery.domaine_name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#9a8f7e' }}>{winery.town}</p>
                </div>
              </div>

              {winery.association_badge_enabled && winery.association_member_status === 'member' && winery.association_name && (
                <div
                  className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(45,99,48,0.06)', border: '1px solid rgba(45,99,48,0.18)' }}
                >
                  <Fish className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2d6330' }} />
                  <span className="text-xs font-semibold" style={{ color: '#2d6330' }}>
                    {winery.association_join_label || `Membre · ${winery.association_name}`}
                  </span>
                  {winery.association_entry_path === 'invite' && (
                    <span className="ml-auto text-xs font-medium" style={{ color: '#9a8f7e' }}>Voie membre</span>
                  )}
                </div>
              )}

              <p className="text-sm leading-relaxed mb-5" style={{ color: '#7a7060' }}>
                Votre fiche est en cours de préparation. Elle sera publiée sur cette adresse une fois validée par l'équipe Vinocap.
              </p>

              <div className="space-y-3.5">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={
                        step.done
                          ? { background: 'rgba(45,138,128,0.12)', color: '#2d8a80' }
                          : { background: '#f0ece5', color: '#9a8f7e' }
                      }
                    >
                      {step.done ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <div>
                      <div
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: step.done ? '#2d8a80' : '#7a7060' }}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: '#9a8f7e' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3.5" style={{ background: '#faf9f7', borderTop: '1px solid #f0ece5' }}>
              <p className="text-xs" style={{ color: '#9a8f7e' }}>
                Cette URL est votre adresse Vinocap permanente. Elle sera active dès publication.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const BOUTIQUE_ACTIVE_SLUGS = new Set([
    'mas-saint-chinian',
    'chateau-montagnac',
    'terrasses-du-larzac',
    'vignobles-de-letang',
  ]);
  const boutiqueActive = BOUTIQUE_ACTIVE_SLUGS.has(slug);

  return (
    <div className="min-h-screen pt-16" style={{ background: '#faf7f1' }}>
      <div
        className="sticky top-16 z-20 backdrop-blur-md"
        style={{ background: 'rgba(252,249,244,0.96)', borderBottom: '1px solid #ddd6c8' }}
      >
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors group"
            style={{ color: '#9a8f7e' }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Domaines
          </button>
          <div className="flex-1 min-w-0 text-center">
            <span className="text-sm font-semibold truncate block" style={{ color: '#1e2a26' }}>{winery.domaine_name}</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-28">
        <WineryCard winery={winery} />
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex justify-center"
        style={{ background: 'rgba(250,247,241,0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid #ddd6c8' }}
      >
        <div className="w-full max-w-2xl px-5 py-4">
          {boutiqueActive ? (
            <a
              href="https://www.vinatis.com/maisons/domaine-de-la-garance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#FFDE00', color: '#111827', boxShadow: '0 6px 20px -4px rgba(255,222,0,0.5)' }}
            >
              Voir la boutique
            </a>
          ) : (
            <div
              className="flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed select-none"
              style={{ background: '#f0ece5', color: '#b5aa98', border: '1px solid #e0dbd2' }}
            >
              Boutique non activée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
