import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, ArrowLeft, LogOut } from 'lucide-react';

const OPS_ROUTE = '/vin/ops-42xf';

interface AdminLayoutProps {
  children: React.ReactNode;
  onRevoke: () => void;
}

export function AdminLayout({ children, onRevoke }: AdminLayoutProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/vin"
                className="flex items-center gap-1.5 text-stone-400 hover:text-white text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Vinocap
              </Link>
              <div className="w-px h-5 bg-stone-700" />
              <span className="text-white font-semibold text-sm tracking-tight">
                Ops
              </span>
            </div>

            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1">
                <Link
                  to={`${OPS_ROUTE}/campaigns`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive(`${OPS_ROUTE}/campaigns`) || location.pathname.startsWith(`${OPS_ROUTE}/campaigns`)
                      ? 'bg-white/10 text-white'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Campagnes
                </Link>
                <Link
                  to={`${OPS_ROUTE}/prospects`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    location.pathname.startsWith(`${OPS_ROUTE}/prospects`)
                      ? 'bg-white/10 text-white'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Prospects
                </Link>
                <Link
                  to={`${OPS_ROUTE}/reservations`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    location.pathname.startsWith(`${OPS_ROUTE}/reservations`)
                      ? 'bg-white/10 text-white'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Réservations
                </Link>
              </nav>

              <button
                onClick={onRevoke}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all"
                title="Terminate session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
