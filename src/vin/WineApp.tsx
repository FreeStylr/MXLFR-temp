import { useState } from 'react';
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

type Page =
  | 'home'
  | 'domaines'
  | 'decouvrir'
  | 'terroir'
  | 'participer'
  | 'carte'
  | 'association'
  | 'invite';

export function WineApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cardSlug, setCardSlug] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  const navigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewCard = (slug: string) => {
    setCardSlug(slug);
    setCurrentPage('carte');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openInvite = (token: string) => {
    setInviteToken(token);
    setCurrentPage('invite');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const noFooterPages: Page[] = [];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} onViewCard={viewCard} />;
      case 'domaines':
        return <DomainesPage onViewCard={viewCard} />;
      case 'decouvrir':
        return <DecouvrirPage onNavigate={navigate} onViewCard={viewCard} />;
      case 'terroir':
        return <TerroirPage />;
      case 'participer':
        return <ParticiperPage onNavigate={navigate} />;
      case 'carte':
        return <CardPage slug={cardSlug} onBack={() => setCurrentPage('domaines')} />;
      case 'association':
        return (
          <AssociationPage
            onViewCard={viewCard}
            onNavigate={navigate}
            onJoinViaInvite={openInvite}
          />
        );
      case 'invite':
        return (
          <AssociationInvitePage
            token={inviteToken}
            onBack={() => setCurrentPage('association')}
            onSuccess={(slug) => {
              setCardSlug(slug);
              setCurrentPage('carte');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`
        .wine-700 { color: #7c2d12; }

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
        onNavigate={navigate}
        onOpenContact={() => navigate('participer')}
      />

      <main>{renderPage()}</main>

      {!noFooterPages.includes(currentPage) && (
        <WineFooter onNavigate={navigate} />
      )}
    </div>
  );
}
