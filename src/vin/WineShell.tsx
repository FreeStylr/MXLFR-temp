import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { WineHeader } from './components/WineHeader';
import { WineFooter } from './components/WineFooter';
import { HomePage } from './pages/HomePage';
import { DomainesPage } from './pages/DomainesPage';
import { DecouvrirPage } from './pages/DecouvrirPage';
import { TerroirPage } from './pages/TerroirPage';
import { ParticiperPage } from './pages/ParticipePage';
import { CardPage } from './pages/CardPage';
import { AssociationPage } from './pages/AssociationPage';
import { AssociationInvitePage } from './pages/AssociationInvitePage';
import { CampaignResolverPage } from './pages/CampaignResolverPage';
import { QREntryPage } from './pages/QREntryPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage';
import { AdminCampaignDetailPage } from './pages/admin/AdminCampaignDetailPage';
import { ProspectsPage } from './pages/admin/ProspectsPage';
import { ReservationsPage } from './pages/admin/ReservationsPage';
import { RunsPage } from './pages/admin/RunsPage';
import { OpsGate, useOpsAuth } from './pages/ops/OpsGate';

const ASSOCIATION_CANONICAL = '/vin/association/route-des-vignerons-et-des-pecheurs';

function usePageNav() {
  const navigate = useNavigate();
  return (page: string) => {
    const map: Record<string, string> = {
      home: '/vin',
      domaines: '/vin/domaines',
      decouvrir: '/vin/decouvrir',
      participer: '/vin/participer',
      terroir: '/vin/terroir',
      association: ASSOCIATION_CANONICAL,
    };
    navigate(map[page] ?? '/vin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

function HomeRouteWrapper() {
  const navigate = useNavigate();
  const onNavigate = usePageNav();
  const onViewCard = (slug: string) => {
    navigate(`/vin/carte/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <HomePage onNavigate={onNavigate} onViewCard={onViewCard} />;
}

function DomainesRouteWrapper() {
  const navigate = useNavigate();
  const onViewCard = (slug: string) => {
    navigate(`/vin/carte/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <DomainesPage onViewCard={onViewCard} />;
}

function DecouvrirRouteWrapper() {
  const navigate = useNavigate();
  const onNavigate = usePageNav();
  const onViewCard = (slug: string) => {
    navigate(`/vin/carte/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <DecouvrirPage onNavigate={onNavigate} onViewCard={onViewCard} />;
}

function ParticiperRouteWrapper() {
  const onNavigate = usePageNav();
  return <ParticiperPage onNavigate={onNavigate} />;
}

function CardRouteWrapper() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const onBack = () => {
    navigate('/vin/domaines');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <CardPage slug={slug} onBack={onBack} />;
}

function AssociationRouteWrapper() {
  const navigate = useNavigate();
  const onNavigate = usePageNav();
  const onViewCard = (slug: string) => {
    navigate(`/vin/carte/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onJoinViaInvite = (token: string) => {
    navigate(`/vin/invite/${token}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <AssociationPage
      onViewCard={onViewCard}
      onNavigate={onNavigate}
      onJoinViaInvite={onJoinViaInvite}
    />
  );
}

function QRResolverRouteWrapper() {
  const { qrSlug = '' } = useParams<{ qrSlug: string }>();
  const navigate = useNavigate();
  const onNavigate = usePageNav();
  const onViewCard = (slug: string) => {
    navigate(`/vin/carte/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <CampaignResolverPage qrSlug={qrSlug} onNavigate={onNavigate} onViewCard={onViewCard} />;
}

function InviteRouteWrapper() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const onBack = () => {
    navigate(ASSOCIATION_CANONICAL);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onSuccess = (slug: string) => {
    navigate(`/vin/carte/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <AssociationInvitePage token={token} onBack={onBack} onSuccess={onSuccess} />;
}

function ShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const onNavigate = (page: string) => {
    const map: Record<string, string> = {
      home: '/vin',
      domaines: '/vin/domaines',
      decouvrir: '/vin/decouvrir',
      participer: '/vin/participer',
      terroir: '/vin/terroir',
      association: ASSOCIATION_CANONICAL,
    };
    navigate(map[page] ?? '/vin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pathToPage: Record<string, string> = {
    '/vin': 'home',
    '/vin/': 'home',
    '/vin/domaines': 'domaines',
    '/vin/decouvrir': 'decouvrir',
    '/vin/participer': 'participer',
    '/vin/terroir': 'terroir',
    '/vin/association': 'association',
    '/vin/association/route-des-vignerons-et-des-pecheurs': 'association',
  };
  const currentPage = pathToPage[location.pathname] ?? 'home';

  return (
    <div className="min-h-screen bg-warm-50 text-slate-900">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <WineHeader
        currentPage={currentPage}
        onNavigate={onNavigate}
        onOpenContact={() => onNavigate('participer')}
      />

      <main>
        <Routes>
          <Route path="/" element={<HomeRouteWrapper />} />
          <Route path="/domaines" element={<DomainesRouteWrapper />} />
          <Route path="/decouvrir" element={<DecouvrirRouteWrapper />} />
          <Route path="/terroir" element={<TerroirPage />} />
          <Route path="/participer" element={<ParticiperRouteWrapper />} />
          <Route path="/carte/:slug" element={<CardRouteWrapper />} />
          <Route path="/association/route-des-vignerons-et-des-pecheurs" element={<AssociationRouteWrapper />} />
          <Route path="/association" element={<Navigate to={ASSOCIATION_CANONICAL} replace />} />
          <Route path="/invite/:token" element={<InviteRouteWrapper />} />
          <Route path="*" element={<HomeRouteWrapper />} />
        </Routes>
      </main>

      <WineFooter onNavigate={onNavigate} />
    </div>
  );
}

function OpsShell() {
  const { granted, grant, revoke, getToken } = useOpsAuth();
  const navigate = useNavigate();

  // grant() lives here so the state update happens in this component,
  // which controls the granted/gate branch — not in a sibling hook instance.
  const handleGranted = (token: string) => {
    grant(token);
    navigate('/vin/ops-42xf/campaigns', { replace: true });
  };

  if (!granted) {
    return <OpsGate onGranted={handleGranted} />;
  }

  const opsToken = getToken();

  return (
    <AdminLayout onRevoke={() => { revoke(); navigate('/vin', { replace: true }); }}>
      <Routes>
        <Route path="campaigns/:id" element={<AdminCampaignDetailPage />} />
        <Route path="campaigns" element={<AdminCampaignsPage />} />
        <Route path="prospects" element={<ProspectsPage opsToken={opsToken} />} />
        <Route path="reservations" element={<ReservationsPage opsToken={opsToken} />} />
        <Route path="runs" element={<RunsPage opsToken={opsToken} />} />
        <Route path="*" element={<Navigate to="/vin/ops-42xf/campaigns" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export function WineShell() {
  return (
    <Routes>
      <Route path="/qr" element={<QREntryPage />} />
      <Route path="/q/:qrSlug" element={<QRResolverRouteWrapper />} />
      <Route path="/ops-42xf/*" element={<OpsShell />} />
      <Route path="/*" element={<ShellLayout />} />
    </Routes>
  );
}
