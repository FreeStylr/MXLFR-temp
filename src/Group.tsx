import { Shield, Building2, Globe2 } from 'lucide-react';

function Group() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors">
            ← Retour à Maxilocal France
          </a>
        </div>
      </header>

      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            MXL Group
          </h1>
          <p className="text-2xl text-gray-600 font-light">
            Supporting European communication platforms
          </p>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Globe2 className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                  Vision
                </h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Investir dans les technologies de communication et l'intelligence territoriale.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                  Structure
                </h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Siège européen à Dublin (Irlande), opérant à travers des sociétés nationales dont Maxilocal France.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                  Engagement
                </h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Conformité européenne, protection des données et transparence opérationnelle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 MXL Group – Dublin, Ireland – Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Group;
