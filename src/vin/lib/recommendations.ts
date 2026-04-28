import { WineryProfile } from './supabase';

export type WineIntent = 'rouge' | 'blanc' | 'rose' | 'bulles' | 'open';
export type VisitIntent = 'deguster' | 'acheter' | 'decouvrir' | 'visiter';

export interface UserPreferences {
  wineType: WineIntent;
  visitIntent: VisitIntent;
  nonAlcoholicOnly?: boolean;
}

interface ScoredWinery {
  winery: WineryProfile;
  score: number;
}

function scoreWinery(winery: WineryProfile, prefs: UserPreferences): number {
  let score = 0;

  if (prefs.wineType !== 'open') {
    if (winery.wine_types.includes(prefs.wineType)) score += 40;
  } else {
    score += 20;
  }

  if (prefs.visitIntent === 'deguster') {
    if (winery.tasting_available) score += 30;
    if (!winery.reservation_required) score += 10;
  }

  if (prefs.visitIntent === 'acheter') {
    if (winery.direct_purchase) score += 30;
    if (winery.whatsapp) score += 10;
  }

  if (prefs.visitIntent === 'visiter') {
    if (winery.visit_available) score += 30;
    if (winery.tasting_available) score += 10;
  }

  if (prefs.visitIntent === 'decouvrir') {
    score += 20;
    if (winery.bio_ab || winery.is_organic) score += 10;
    if (winery.hve || winery.terra_vitis) score += 5;
    if (winery.association_member_status === 'member' && winery.association_badge_enabled) score += 10;
  }

  if (winery.association_member_status === 'member' && winery.association_badge_enabled) score += 5;
  if (winery.is_premium) score += 3;
  if (winery.bio_ab || winery.is_organic) score += 3;

  return score;
}

export function rankWineries(
  wineries: WineryProfile[],
  prefs: UserPreferences,
  limit = 6,
): WineryProfile[] {
  const pool = prefs.nonAlcoholicOnly
    ? wineries.filter((w) => w.has_non_alcoholic)
    : wineries;

  const scored: ScoredWinery[] = pool.map((w) => ({
    winery: w,
    score: scoreWinery(w, prefs),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.winery);
}

export function describeRecommendation(prefs: UserPreferences): string {
  const wineLabel: Record<WineIntent, string> = {
    rouge: 'vins rouges',
    blanc: 'vins blancs',
    rose: 'rosés',
    bulles: 'vins pétillants',
    open: 'tous les vins',
  };

  const intentLabel: Record<VisitIntent, string> = {
    deguster: 'pour la dégustation',
    acheter: 'avec vente directe',
    decouvrir: 'à découvrir',
    visiter: 'avec visites du domaine',
  };

  return `${wineLabel[prefs.wineType]} ${intentLabel[prefs.visitIntent]}`;
}
