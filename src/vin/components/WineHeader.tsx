import { useState, useEffect } from 'react';
import { Menu, X, Wine, Send } from 'lucide-react';

interface WineHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenContact: () => void;
}

export function WineHeader({ currentPage, onNavigate, onOpenContact }: WineHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { key: 'home', label: 'Accueil' },
    { key: 'domaines', label: 'Les Domaines' },
    { key: 'decouvrir', label: 'Découvrir' },
    { key: 'terroir', label: 'Le Terroir' },
    { key: 'association', label: 'La Route' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: isScrolled ? 'rgba(252,250,246,0.97)' : 'rgba(247,244,238,0.88)',
          borderBottom: '1px solid rgba(210,204,192,0.6)',
          backdropFilter: 'blur(12px)',
          boxShadow: isScrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex justify-between items-center py-3">

            <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: '#2d968a' }}
              >
                <Wine className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span
                  className="text-[13px] font-bold leading-tight transition-colors"
                  style={{ color: '#1c2e28' }}
                >
                  Maxilocal
                </span>
                <span
                  className="text-[9px] font-medium leading-tight tracking-wide transition-colors"
                  style={{ color: '#9a8f7e' }}
                >
                  Vinocap 2026
                </span>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={
                    currentPage === item.key
                      ? { color: '#1e8a7e', fontWeight: 600, background: 'rgba(45,150,138,0.08)' }
                      : { color: '#7a7060' }
                  }
                >
                  {item.label}
                </button>
              ))}
              <div className="ml-2">
                <button
                  onClick={() => handleNav('participer')}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all"
                  style={{ background: '#2d968a' }}
                >
                  Participer
                </button>
              </div>
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#7a7060' }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setIsMenuOpen(false)}
          />
          <nav
            className="relative h-full flex flex-col max-w-xs w-full ml-auto shadow-2xl"
            style={{ background: '#faf8f4', borderLeft: '1px solid #e2dcd2' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #e8e2d9' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2d968a' }}>
                  <Wine className="w-[15px] h-[15px] text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight" style={{ color: '#1c2e28' }}>Maxilocal</div>
                  <div className="text-[10px] leading-tight" style={{ color: '#9a8f7e' }}>Vinocap 2026</div>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#9a8f7e' }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              <div className="space-y-0.5 px-3">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all"
                    style={
                      currentPage === item.key
                        ? { background: 'rgba(45,150,138,0.09)', color: '#1e8a7e', fontWeight: 600 }
                        : { color: '#7a7060' }
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: currentPage === item.key ? '#2d968a' : '#d8d0c4' }}
                    />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4" style={{ borderTop: '1px solid #e2dcd2' }}>
              <button
                onClick={() => handleNav('participer')}
                className="w-full px-5 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all text-sm"
                style={{ background: '#2d968a' }}
              >
                <Send className="w-4 h-4" />
                Participer en tant que domaine
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
