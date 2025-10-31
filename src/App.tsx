import { useState, useEffect } from 'react';
import { Phone, MapPin, Menu, X, Globe, Search, Megaphone, Palette, BarChart3, Building2, Database, Zap, Network, Newspaper, Linkedin, Facebook, Shield, Send } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', company: '', email: '', message: '', honeypot: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const openContactModal = () => {
    setIsContactModalOpen(true);
    setFormData({ firstName: '', lastName: '', company: '', email: '', message: '', honeypot: '' });
    setSubmitStatus('idle');
    setIsMenuOpen(false);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ firstName: '', lastName: '', company: '', email: '', message: '', honeypot: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isContactModalOpen) {
        closeContactModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isContactModalOpen]);

  const zones = [
    { name: 'Nice', isPilot: false },
    { name: 'Toulouse', isPilot: false },
    { name: 'Montpellier', isPilot: true },
    { name: 'Sète', isPilot: true },
    { name: 'Agde', isPilot: true },
    { name: 'Le Puy', isPilot: false },
    { name: 'Clermont Ferrand', isPilot: false },
    { name: 'Lille', isPilot: false },
    { name: 'Arras', isPilot: false },
  ];

  const services = [
    {
      icon: Globe,
      title: 'Architecture de Présence Multi-Marchés',
      description: 'Déploiement coordonné sur plusieurs territoires avec adaptation locale'
    },
    {
      icon: Search,
      title: 'Cartographie & Intelligence Territoriale',
      description: 'Analyse des zones de chalandise, identification des points de contact stratégiques'
    },
    {
      icon: Megaphone,
      title: 'Activation Réseaux Locaux',
      description: 'Orchestration de canaux de distribution et points de vente régionaux'
    },
    {
      icon: Palette,
      title: 'Adaptation & Déploiement de Marque',
      description: 'Cohérence de marque (grands groupes, PME) avec personnalisation territoriale'
    },
    {
      icon: BarChart3,
      title: 'Analytique de Pénétration Marché',
      description: 'Métriques de performance par territoire et visibilité temps réel'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <style>{`
        .fade-in-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .gradient-text {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -8px rgba(22, 163, 74, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .wave-divider {
          position: relative;
          width: 100%;
          height: 60px;
          overflow: hidden;
        }

        .wave-divider svg {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100%;
        }

        .hero-map-bg {
          position: absolute;
          inset: 0;
          opacity: 0.4;
          background-image:
            linear-gradient(rgba(45, 212, 191, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%),
            radial-gradient(circle at 30% 20%, rgba(45, 212, 191, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(56, 189, 248, 0.12) 0%, transparent 50%);
        }

        .map-network {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(229, 231, 235, 0.5) 50px, rgba(229, 231, 235, 0.5) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(229, 231, 235, 0.5) 50px, rgba(229, 231, 235, 0.5) 51px);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%);
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .pulse-node {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #2DD4BF, #38BDF8);
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(45, 212, 191, 0.5);
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .hero-headline {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .hero-subheadline {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .hero-cta {
          animation: fadeInUp 1s ease-out 0.4s forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pulse-node { animation: none !important; }
          .hero-headline, .hero-subheadline, .hero-cta { animation: none !important; opacity: 1 !important; }
          .animate-fadeIn { animation: none !important; }
        }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-100' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    Maxilocal
                  </h1>
                  <span className="text-sm font-semibold text-primary-600">France</span>
                </div>
                <p className="hidden sm:block text-xs font-medium text-neutral-500">
                  Activation territoriale
                </p>
              </div>
            </div>

            <nav className="hidden xl:flex items-center space-x-1">
              <button onClick={() => scrollToSection('accueil')} className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all text-sm font-medium px-4 py-2 rounded-lg">
                Accueil
              </button>
              <button onClick={() => scrollToSection('mission')} className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all text-sm font-medium px-4 py-2 rounded-lg">
                Concept
              </button>
              <button onClick={() => scrollToSection('services')} className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all text-sm font-medium px-4 py-2 rounded-lg">
                Solutions
              </button>
              <button onClick={() => scrollToSection('technologie')} className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all text-sm font-medium px-4 py-2 rounded-lg">
                Technologie
              </button>
              <div className="ml-4">
                <button onClick={openContactModal} className="btn-primary bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm">
                  Contact
                </button>
              </div>
              <a href="tel:0769248418" className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                <Phone className="w-4 h-4" />
                <span className="hidden 2xl:inline">07 69 24 84 18</span>
              </a>
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-neutral-900 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden bg-white/95 backdrop-blur-lg">
          <nav className="flex flex-col items-center justify-center h-full space-y-8 text-center">
            <button onClick={() => scrollToSection('accueil')} className="text-2xl text-neutral-900 hover:text-primary-600 transition-colors font-medium">
              Accueil
            </button>
            <button onClick={() => scrollToSection('mission')} className="text-2xl text-neutral-900 hover:text-primary-600 transition-colors font-medium">
              Concept
            </button>
            <button onClick={() => scrollToSection('services')} className="text-2xl text-neutral-900 hover:text-primary-600 transition-colors font-medium">
              Solutions
            </button>
            <button onClick={() => scrollToSection('technologie')} className="text-2xl text-neutral-900 hover:text-primary-600 transition-colors font-medium">
              Technologie
            </button>
            <button onClick={openContactModal} className="text-2xl text-neutral-900 hover:text-primary-600 transition-colors font-medium">
              Entrer en relation
            </button>
            <a href="tel:0769248418" className="flex items-center gap-3 px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xl">
              <Phone className="w-5 h-5" />
              07 69 24 84 18
            </a>
          </nav>
        </div>
      )}

      <section id="accueil" className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(22,163,74,0.05),rgba(255,255,255,0))]" aria-hidden="true"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)', backgroundSize: '40px 40px'}} aria-hidden="true"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center py-32 mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary-700">Plateforme d'activation territoriale</span>
          </div>

          <h2 className="hero-headline text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-neutral-900 mb-6 leading-tight">
            Reconnecter l'économie<br /><span className="gradient-text">à ses territoires.</span>
          </h2>

          <p className="hero-subheadline text-lg sm:text-xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Nous redonnons vie aux économies locales en créant les passerelles entre valeur nationale et impact de proximité — guidés par la technologie, ancrés dans l'humain
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => scrollToSection('services')}
              className="btn-primary bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-xl font-semibold text-base shadow-lg"
            >
              Explorer nos capacités
            </button>
            <button
              onClick={openContactModal}
              className="border-2 border-gray-300 text-neutral-700 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-neutral-50 hover:border-teal-500 transition-all"
            >
              Entrer en relation
            </button>
          </div>

          <p className="text-sm text-neutral-500 font-medium" style={{opacity: 0, animation: 'fadeInUp 1s ease-out 0.6s forwards'}}>
            Parce qu'une économie forte se construit quartier par quartier
          </p>
        </div>
      </section>

      <div className="wave-divider bg-white">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L0,60 Q300,90 600,60 T1200,60 L1200,0 Z" fill="#F9FAFB" opacity="0.5"/>
          <path d="M0,0 L0,80 Q300,50 600,80 T1200,80 L1200,0 Z" fill="#F9FAFB"/>
        </svg>
      </div>

      <section id="mission" className="py-32 bg-neutral-50 fade-in-on-scroll">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-6 uppercase tracking-wide">
            Notre Approche
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-8 leading-tight">
            Économies locales, systèmes intelligents
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed mb-6">
            Chaque territoire possède son propre écosystème, ses dynamiques, ses besoins. Nous créons les ponts qui permettent aux marques, PME et entreprises locales d'apporter de la valeur là où elle compte vraiment — au niveau local.
          </p>
          <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed">
            Notre technologie identifie les opportunités, active les bons canaux, et mesure l'impact réel sur les communautés. Parce que la croissance durable naît de la proximité.
          </p>
        </div>
      </section>

      <section className="py-32 bg-white fade-in-on-scroll">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
              Nos Principes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Comment nous travaillons
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <MapPin className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Ancrage Local</h3>
              <p className="text-neutral-600 leading-relaxed">
                Nous comprenons les spécificités de chaque territoire pour créer des connexions authentiques entre entreprises (marques nationales, PME, commerces locaux) et communautés.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Tech au Service de l'Humain</h3>
              <p className="text-neutral-600 leading-relaxed">
                Infrastructure européenne qui amplifie l'action locale sans jamais perdre la dimension humaine des échanges commerciaux.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <BarChart3 className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Impact Mesurable</h3>
              <p className="text-neutral-600 leading-relaxed">
                Visibilité claire sur les résultats : où votre entreprise crée de la valeur, comment les territoires répondent, quel impact économique local.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-neutral-50 fade-in-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 text-center uppercase tracking-wider">
            Plateforme d'Activation Territoriale
          </h2>
          <p className="text-center text-neutral-600 mb-16 text-lg max-w-3xl mx-auto">
            Les outils et méthodes pour faire rayonner votre entreprise (marque nationale, PME ou commerce local) au cœur des territoires — avec intelligence, respect et résultats tangibles.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 p-6 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="technologie" className="py-32 bg-neutral-900 text-white fade-in-on-scroll">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block px-3 py-1 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-full mb-6 uppercase tracking-wide">
            Technologie
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Infrastructure & Systèmes
          </h2>
          <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed mb-16 max-w-2xl mx-auto">
            La technologie comme catalyseur — pour amplifier l'humain, connecter les opportunités, et créer des synergies entre échelle et proximité.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-neutral-800/50 border border-neutral-700 hover:border-primary-600 transition-all">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">Architecture Répartie</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Infrastructure conçue pour évoluer avec vos ambitions territoriales
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-neutral-800/50 border border-neutral-700 hover:border-primary-600 transition-all">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">Orchestration Intelligente</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Automatisation intelligente qui libère du temps pour l'essentiel : les relations humaines
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-neutral-800/50 border border-neutral-700 hover:border-primary-600 transition-all">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Network className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3">API & Connecteurs</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Connexions fluides avec vos outils existants et vos réseaux partenaires
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white fade-in-on-scroll">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
              Notre Écosystème
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Des partenariats stratégiques avec des acteurs industriels, distributeurs et réseaux locaux
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Industriels & Fabricants</h3>
              <p className="text-neutral-600 text-sm">
                Marques nationales, PME et entreprises régionales cherchant une pénétration locale authentique
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Réseaux de Distribution</h3>
              <p className="text-neutral-600 text-sm">
                Circuits régionaux, points de vente et structures de proximité
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Acteurs Territoriaux</h3>
              <p className="text-neutral-600 text-sm">
                Organisations locales et relais communautaires
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white fade-in-on-scroll">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
              Déploiement
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Couverture Territoriale
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Capacités de déploiement sur les principaux marchés français et expansion internationale en cours
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8">
            <div className="flex flex-wrap justify-center gap-3">
              {zones.map((zone, index) => (
                <div
                  key={index}
                  className={`relative px-6 py-3 rounded-lg font-semibold transition-all ${
                    zone.isPilot
                      ? 'bg-primary-100 border-2 border-primary-300 text-primary-700'
                      : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {zone.name}
                  {zone.isPilot && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Pilot
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-neutral-500 mt-6">
              Zones pilotes : Sète, Agde et environs
            </p>
          </div>
        </div>
      </section>


      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <h3 className="text-2xl font-bold uppercase">Maxilocal</h3>
                <span className="text-base font-medium text-teal-400">France</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Plateforme d'activation territoriale pour entreprises et marques
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Navigation</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => scrollToSection('services')} className="block text-gray-400 hover:text-teal-400 transition-colors">
                  Solutions
                </button>
                <button onClick={() => scrollToSection('technologie')} className="block text-gray-400 hover:text-teal-400 transition-colors">
                  Technologie
                </button>
                <button onClick={openContactModal} className="block text-gray-400 hover:text-teal-400 transition-colors">
                  Entrer en relation
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Légal</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => setIsLegalModalOpen(true)} className="block text-gray-400 hover:text-primary-400 transition-colors text-left">
                  Mentions légales
                </button>
                <button onClick={() => setIsPrivacyModalOpen(true)} className="block text-gray-400 hover:text-primary-400 transition-colors text-left">
                  Politique de confidentialité
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Suivez-nous</h4>
              <div className="flex gap-3 mb-6">
                <a href="https://www.linkedin.com/company/maxilocal/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all border border-neutral-700 hover:border-primary-500">
                  <Linkedin className="w-5 h-5" />
                </a>
                <button onClick={() => setIsFacebookModalOpen(true)} className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all border border-neutral-700 hover:border-primary-500">
                  <Facebook className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="text-center space-y-2">
              <div className="text-sm text-neutral-500">
                © 2025 Maxilocal France – Tous droits réservés
              </div>
              <p className="text-xs text-neutral-600" style={{fontSize: '0.75rem', marginTop: '8px'}}>
                Affiliation légale : MXL Group Ltd – Dublin (Irlande)
              </p>
            </div>
          </div>
        </div>
      </footer>

      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeContactModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 id="contact-modal-title" className="text-2xl font-bold text-neutral-900">
                Entrer en relation
              </h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-neutral-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 mb-2">Message envoyé !</h4>
                <p className="text-neutral-600 mb-6">Nous vous recontacterons très prochainement.</p>
                <button
                  onClick={closeContactModal}
                  className="btn-primary bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleFormChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-1">Entreprise *</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    Une erreur s'est produite. Veuillez réessayer.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {isFacebookModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsFacebookModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Facebook className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              Bientôt disponible
            </h3>
            <p className="text-neutral-600 mb-6">
              Notre page Facebook est en préparation. Suivez-nous sur LinkedIn pour rester informé.
            </p>
            <button
              onClick={() => setIsFacebookModalOpen(false)}
              className="btn-primary bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium w-full"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {isLegalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsLegalModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Mentions Légales</h3>
              <button
                onClick={() => setIsLegalModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-neutral-700 space-y-4">
              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Éditeur du site</h4>
                <p>
                  <strong>Raison sociale :</strong> Maxilocal France<br />
                  <strong>Siège social :</strong> France<br />
                  <strong>Affiliation légale :</strong> MXL Group Ltd., Dublin, Irlande
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Hébergement</h4>
                <p>
                  Ce site est hébergé par Vercel Inc.<br />
                  340 S Lemon Ave #4133, Walnut, CA 91789, USA
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Propriété intellectuelle</h4>
                <p>
                  L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de Maxilocal France ou de ses partenaires. Toute reproduction, distribution, modification ou utilisation sans autorisation préalable écrite est strictement interdite.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Responsabilité</h4>
                <p>
                  Maxilocal France s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Maxilocal France ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Données personnelles</h4>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Pour exercer ce droit, veuillez nous contacter via le formulaire de contact.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {isPrivacyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsPrivacyModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Politique de Confidentialité</h3>
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-neutral-700 space-y-4">
              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Collecte des données</h4>
                <p>
                  Maxilocal France collecte uniquement les données personnelles que vous nous fournissez volontairement via nos formulaires de contact. Ces données incluent : nom, prénom, adresse e-mail, nom de l'entreprise et le message que vous nous adressez.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Utilisation des données</h4>
                <p>
                  Les données collectées sont utilisées exclusivement pour :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Répondre à vos demandes d'information</li>
                  <li>Établir un contact commercial avec vous</li>
                  <li>Améliorer nos services</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Conservation des données</h4>
                <p>
                  Vos données personnelles sont conservées uniquement le temps nécessaire pour traiter votre demande et ne sont pas stockées dans une base de données permanente.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Partage des données</h4>
                <p>
                  Maxilocal France ne vend, ne loue ni ne partage vos données personnelles avec des tiers, sauf obligation légale.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Vos droits</h4>
                <p>
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit d'opposition</li>
                  <li>Droit à la portabilité</li>
                </ul>
                <p className="mt-2">
                  Pour exercer ces droits, contactez-nous via le formulaire de contact.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Cookies</h4>
                <p>
                  Ce site n'utilise pas de cookies de suivi ou de publicité. Seuls les cookies techniques nécessaires au bon fonctionnement du site peuvent être utilisés.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">Contact</h4>
                <p>
                  Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via le formulaire de contact disponible sur le site.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
