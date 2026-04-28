import { WineryProfile } from './supabase';

export interface ReadinessCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface ProfileReadiness {
  checks: ReadinessCheck[];
  passedCount: number;
  totalCount: number;
  isPreviewReady: boolean;
  isPublicationReady: boolean;
  completenessPercent: number;
}

const READINESS_CRITERIA: { key: keyof WineryProfile; label: string; required: boolean }[] = [
  { key: 'domaine_name', label: 'Nom du domaine renseigné', required: true },
  { key: 'contact_name', label: 'Nom du contact renseigné', required: true },
  { key: 'email', label: 'Email de contact renseigné', required: true },
  { key: 'town', label: 'Commune renseignée', required: true },
  { key: 'wine_types', label: 'Au moins un type de vin sélectionné', required: true },
  { key: 'short_presentation', label: 'Présentation courte rédigée', required: true },
  { key: 'consent_publication', label: 'Consentement de publication accordé', required: true },
  { key: 'consent_content_use', label: 'Consentement d\'utilisation accordé', required: true },
  { key: 'phone', label: 'Numéro de téléphone renseigné', required: false },
  { key: 'appellation', label: 'Appellation renseignée', required: false },
  { key: 'flagship_product', label: 'Cuvée phare renseignée', required: false },
  { key: 'opening_times', label: 'Horaires d\'ouverture renseignés', required: false },
];

function isFieldFilled(value: WineryProfile[keyof WineryProfile]): boolean {
  if (typeof value === 'boolean') return value === true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
}

export function computeProfileReadiness(profile: Partial<WineryProfile>): ProfileReadiness {
  const checks: ReadinessCheck[] = READINESS_CRITERIA.map((criterion) => ({
    key: criterion.key,
    label: criterion.label,
    passed: isFieldFilled(profile[criterion.key] as WineryProfile[keyof WineryProfile]),
  }));

  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;
  const completenessPercent = Math.round((passedCount / totalCount) * 100);

  const requiredKeys = READINESS_CRITERIA.filter((c) => c.required).map((c) => c.key);
  const allRequiredPassed = requiredKeys.every((key) =>
    isFieldFilled(profile[key] as WineryProfile[keyof WineryProfile]),
  );

  const isPreviewReady = allRequiredPassed;
  const isPublicationReady = allRequiredPassed && completenessPercent >= 75;

  return {
    checks,
    passedCount,
    totalCount,
    isPreviewReady,
    isPublicationReady,
    completenessPercent,
  };
}

export type AssociationMemberStatus = 'none' | 'pending' | 'member' | 'former';

export const ASSOCIATION_MEMBER_STATUS_LABELS: Record<AssociationMemberStatus, string> = {
  none: 'Sans association',
  pending: 'Adhésion en cours',
  member: 'Membre actif',
  former: 'Ancien membre',
};

export function isCurrentMember(status: string | null | undefined): boolean {
  return status === 'member';
}

export function isFormerMember(status: string | null | undefined): boolean {
  return status === 'former';
}

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'ready_for_publication'
  | 'published';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Dossier soumis',
  under_review: 'En cours de validation',
  ready_for_publication: 'Prêt pour publication',
  published: 'Publié',
};

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  draft: 'text-stone-600 bg-stone-100 border-stone-200',
  submitted: 'text-amber-700 bg-amber-50 border-amber-200',
  under_review: 'text-blue-700 bg-blue-50 border-blue-200',
  ready_for_publication: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  published: 'text-emerald-700 bg-emerald-100 border-emerald-300',
};
