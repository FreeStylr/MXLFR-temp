import { MapPin, Phone, Globe, Clock, Leaf, Award, Grape, ShoppingBag, Calendar, MessageCircle, ShieldCheck, Fish, ChevronRight, GlassWater, Wine, ArrowRight } from 'lucide-react';
import { WineryProfile } from '../lib/supabase';

// All images are verified wine/vineyard subjects from Pexels
const BANNER_IMAGES = [
  'https://images.pexels.com/photos/2702805/pexels-photo-2702805.jpeg?auto=compress&cs=tinysrgb&w=900',   // red wine pouring into glass
  'https://images.pexels.com/photos/5370804/pexels-photo-5370804.jpeg?auto=compress&cs=tinysrgb&w=900',   // vineyard rows
  'https://images.pexels.com/photos/5732806/pexels-photo-5732806.jpeg?auto=compress&cs=tinysrgb&w=900',   // vineyard landscape
  'https://images.pexels.com/photos/8287356/pexels-photo-8287356.jpeg?auto=compress&cs=tinysrgb&w=900',   // vineyard close-up
  'https://images.pexels.com/photos/10772487/pexels-photo-10772487.jpeg?auto=compress&cs=tinysrgb&w=900', // glass of red wine outdoor
  'https://images.pexels.com/photos/19284897/pexels-photo-19284897.jpeg?auto=compress&cs=tinysrgb&w=900', // wine bottle and glass on wood
];

const BANNER_OVERRIDES: Record<string, string> = {};

function getBannerImage(slug: string): string {
  if (BANNER_OVERRIDES[slug]) return BANNER_OVERRIDES[slug];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % BANNER_IMAGES.length;
  }
  return BANNER_IMAGES[Math.abs(hash) % BANNER_IMAGES.length];
}

const wineTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  rouge: { bg: 'rgba(139,38,53,0.07)', text: '#8b2635', border: 'rgba(139,38,53,0.2)' },
  rose: { bg: 'rgba(200,94,124,0.07)', text: '#c85e7c', border: 'rgba(200,94,124,0.22)' },
  blanc: { bg: 'rgba(138,110,36,0.07)', text: '#7a6020', border: 'rgba(138,110,36,0.2)' },
  bulles: { bg: 'rgba(45,122,143,0.07)', text: '#2d7a8f', border: 'rgba(45,122,143,0.2)' },
};

const wineTypeLabels: Record<string, string> = {
  rouge: 'Rouge',
  rose: 'Rosé',
  blanc: 'Blanc',
  bulles: 'Bulles',
};

interface WineryCardProps {
  winery: WineryProfile;
  compact?: boolean;
  onViewCard?: (slug: string) => void;
}

function OriginBadge({ winery }: { winery: WineryProfile }) {
  if (!winery.origin_scheme_type || winery.origin_scheme_type === 'none') return null;
  const display =
    winery.protected_display_term ||
    (winery.appellation_name ? `${winery.appellation_name} ${winery.origin_scheme_type}` : null);
  if (!display) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ background: 'rgba(138,110,36,0.06)', color: '#7a6020', borderColor: 'rgba(138,110,36,0.2)' }}
    >
      <Award className="w-2.5 h-2.5" />
      {display}
    </span>
  );
}

function CertBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ background: 'rgba(45,99,48,0.06)', color: '#2d6330', borderColor: 'rgba(45,99,48,0.18)' }}
    >
      {icon}
      {label}
    </span>
  );
}

export function WineryCard({ winery, compact = false, onViewCard }: WineryCardProps) {
  const bannerImg = getBannerImage(winery.slug);
  const isRouteMember = winery.association_badge_enabled && winery.association_member_status === 'member';

  const hasCerts = winery.bio_ab || winery.is_organic || winery.hve || winery.terra_vitis || winery.vegan;
  const hasVisit = winery.tasting_available || winery.visit_available || winery.direct_purchase || winery.opening_times;

  if (compact) {
    return (
      <button
        onClick={() => onViewCard?.(winery.slug)}
        className="w-full text-left group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 active:scale-[0.98]"
        style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={bannerImg}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(10,20,15,0.72) 0%, rgba(10,20,15,0.15) 50%, transparent 100%)' }}
          />

          <div className="absolute bottom-3 left-3 right-3">
            <div className="font-bold text-white text-[13px] leading-snug mb-1 drop-shadow-sm">{winery.domaine_name}</div>
            <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-[11px] truncate">{winery.town}{winery.territory ? ` · ${winery.territory}` : ''}</span>
            </div>
          </div>

          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
            {isRouteMember && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)' }}
              >
                <Fish className="w-3 h-3" style={{ color: '#2d6330' }} />
              </div>
            )}
          </div>

          <div className="absolute top-2.5 left-2.5 flex gap-1 flex-wrap">
            {winery.wine_types.slice(0, 1).map((type) => (
              <span
                key={type}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                {wineTypeLabels[type] || type}
              </span>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-[11px] mb-2.5" style={{ color: '#9a8f7e' }}>
            {winery.tasting_available && (
              <span className="flex items-center gap-1">
                <Grape className="w-3 h-3" />
                Dégustation
              </span>
            )}
            {(winery.bio_ab || winery.is_organic) && (
              <span className="flex items-center gap-1" style={{ color: '#3d7d3d' }}>
                <Leaf className="w-3 h-3" />
                Bio
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed flex-1 line-clamp-2 mb-0" style={{ color: '#9a8f7e', minHeight: '2.4em' }}>
            {winery.short_presentation}
          </p>
        </div>

        {/* ACTION FOOTER */}
        <div
          className="mx-3 mb-3 mt-2.5 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group-hover:brightness-105"
          style={{
            background: 'linear-gradient(135deg, #1e7a70 0%, #2d968a 100%)',
            boxShadow: '0 2px 8px rgba(45,150,138,0.2)',
          }}
        >
          <span className="text-[12px] font-bold text-white">Découvrir le domaine</span>
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div style={{ background: '#faf7f1' }}>

      {/* HERO IDENTITY ZONE */}
      <div className="relative" style={{ height: '60vw', maxHeight: '460px', minHeight: '300px' }}>
        <img
          src={bannerImg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,22,16,0.78) 0%, rgba(10,22,16,0.25) 45%, transparent 75%)' }}
        />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7">
          {isRouteMember && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
              style={{ background: 'rgba(45,99,48,0.35)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <Fish className="w-3 h-3" style={{ color: '#a8d4a8' }} />
              <span className="text-[11px] font-bold" style={{ color: '#c0e8c0' }}>Route des Vignerons & des Pêcheurs</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2 tracking-tight drop-shadow-sm">
            {winery.domaine_name}
          </h1>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-sm">{winery.address || winery.town}</span>
            </div>
            {winery.wine_types.map((type) => {
              const c = wineTypeColors[type];
              return (
                <span
                  key={type}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={c
                    ? { background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)' }
                    : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.18)' }
                  }
                >
                  {wineTypeLabels[type] || type}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-5 sm:px-6 pb-14 max-w-2xl mx-auto">

        {/* BADGES ROW */}
        {(hasCerts || winery.origin_scheme_type !== 'none' || winery.has_non_alcoholic) && (
          <div className="flex flex-wrap gap-2 pt-5 pb-4" style={{ borderBottom: '1px solid #ddd6c8' }}>
            <OriginBadge winery={winery} />
            {(winery.bio_ab || winery.is_organic) && <CertBadge label="Bio AB" icon={<Leaf className="w-2.5 h-2.5" />} />}
            {winery.hve && <CertBadge label="HVE" icon={<ShieldCheck className="w-2.5 h-2.5" />} />}
            {winery.terra_vitis && <CertBadge label="Terra Vitis" icon={<Leaf className="w-2.5 h-2.5" />} />}
            {winery.vegan && <CertBadge label="Vegan" icon={<Leaf className="w-2.5 h-2.5" />} />}
            {winery.has_non_alcoholic && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                style={{ background: 'rgba(45,122,143,0.06)', color: '#2d7a8f', borderColor: 'rgba(45,122,143,0.2)' }}
              >
                <GlassWater className="w-2.5 h-2.5" />
                Sans alcool
              </span>
            )}
            {winery.is_sustainable && !winery.hve && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                style={{ background: 'rgba(45,99,48,0.06)', color: '#2d6330', borderColor: 'rgba(45,99,48,0.18)' }}
              >
                <Award className="w-2.5 h-2.5" />
                Démarche durable
              </span>
            )}
          </div>
        )}

        {/* PRESENTATION */}
        {winery.short_presentation && (
          <div className="py-5" style={{ borderBottom: '1px solid #e2dcd2' }}>
            <p className="text-[15px] leading-relaxed" style={{ color: '#4a5e52', lineHeight: '1.8' }}>{winery.short_presentation}</p>
          </div>
        )}

        {/* SELECTION ZONE */}
        {(winery.flagship_product || winery.specialties || winery.style_cues) && (
          <div className="py-5" style={{ borderBottom: '1px solid #ddd6c8' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#9a8f7e' }}>
                La sélection du domaine
              </div>
              <button
                className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color: '#2d8a80' }}
              >
                Voir la sélection <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {winery.flagship_product && (
                <div
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 1px 5px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(138,110,36,0.08)', border: '1px solid rgba(138,110,36,0.15)' }}
                  >
                    <Wine className="w-5 h-5" style={{ color: '#7a6020' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: '#9a8f7e' }}>Cuvée phare</div>
                    <div className="font-bold text-base leading-snug" style={{ color: '#1e2a26' }}>{winery.flagship_product}</div>
                    {winery.style_cues && (
                      <div className="text-sm mt-1 leading-relaxed" style={{ color: '#9a8f7e' }}>{winery.style_cues}</div>
                    )}
                  </div>
                </div>
              )}

              {winery.specialties && (
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 1px 5px rgba(0,0,0,0.04)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: '#9a8f7e' }}>Spécialités</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5248' }}>{winery.specialties}</p>
                </div>
              )}

              {winery.differentiators && (
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: '#fff', border: '1px solid #ddd6c8', boxShadow: '0 1px 5px rgba(0,0,0,0.04)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: '#9a8f7e' }}>Ce qui nous distingue</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5248' }}>{winery.differentiators}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRUST + VISITABILITY ZONE */}
        {hasVisit && (
          <div className="py-5" style={{ borderBottom: '1px solid #ddd6c8' }}>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#9a8f7e' }}>
              Visiter & déguster
            </div>
            <div className="space-y-2.5">
              {winery.tasting_available && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(45,150,138,0.07)', border: '1px solid rgba(45,150,138,0.16)' }}
                  >
                    <Grape className="w-3.5 h-3.5" style={{ color: '#2d8a80' }} />
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: '#2e3a34' }}>
                      Dégustation disponible
                    </span>
                    {winery.reservation_required && (
                      <span className="text-xs ml-1.5" style={{ color: '#9a8f7e' }}>(sur rendez-vous)</span>
                    )}
                  </div>
                </div>
              )}
              {winery.visit_available && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(45,150,138,0.07)', border: '1px solid rgba(45,150,138,0.16)' }}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#2d8a80' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#2e3a34' }}>Visites du domaine</span>
                </div>
              )}
              {winery.direct_purchase && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(45,150,138,0.07)', border: '1px solid rgba(45,150,138,0.16)' }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" style={{ color: '#2d8a80' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#2e3a34' }}>Vente directe au domaine</span>
                </div>
              )}
              {winery.opening_times && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(45,150,138,0.07)', border: '1px solid rgba(45,150,138,0.16)' }}
                  >
                    <Clock className="w-3.5 h-3.5" style={{ color: '#9a8f7e' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#5a5248' }}>{winery.opening_times}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTION ZONE */}
        <div className="pt-6 space-y-2.5">

          {/* PRIMARY — contact */}
          {winery.phone && (
            <a
              href={`tel:${winery.phone.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #1e7a70 0%, #2d968a 100%)',
                boxShadow: '0 4px 18px rgba(45,150,138,0.3)',
              }}
            >
              <Phone className="w-4 h-4" />
              Contacter le domaine
            </a>
          )}

          {winery.reservation_required && (
            <button
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#fff', border: '1px solid #c2d8c8', color: '#2d7a5a' }}
            >
              <Calendar className="w-4 h-4" />
              Réserver une visite
            </button>
          )}

          {winery.whatsapp && winery.phone && (
            <a
              href={`https://wa.me/33${winery.phone.replace(/^0/, '').replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#f4faf8', border: '1px solid #c2d8ce', color: '#2d7a5a' }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}

          {/* TERTIARY — support actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{ background: '#f5f2ec', border: '1px solid #e2dcd2', color: '#7a7060' }}
            >
              <Grape className="w-3.5 h-3.5" />
              Voir la sélection
            </button>

            {winery.website ? (
              <a
                href={`https://${winery.website.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: '#f5f2ec', border: '1px solid #e2dcd2', color: '#7a7060' }}
              >
                <Globe className="w-3.5 h-3.5" />
                Site web
              </a>
            ) : (
              <button
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: '#f5f2ec', border: '1px solid #e2dcd2', color: '#7a7060' }}
              >
                <MapPin className="w-3.5 h-3.5" />
                Itinéraire
              </button>
            )}
          </div>
        </div>

        {/* FOOTER ATTRIBUTION */}
        <div className="mt-8 pt-5 text-center" style={{ borderTop: '1px solid #ddd6c8' }}>
          <p className="text-xs" style={{ color: '#c0b8ac' }}>
            Carte publiée via <span className="font-medium" style={{ color: '#9a8f7e' }}>Maxilocal Resonance</span> · Vinocap 2026
          </p>
        </div>
      </div>
    </div>
  );
}
