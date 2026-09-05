import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Calculator, Building2, Sparkles, Users } from 'lucide-react';
import { ClientBrandConfig } from '../types/cleanCommand';

interface NavbarProps {
  currentView: 'landing' | 'proposal' | 'packages' | 'sales';
  onNavigate: (view: 'landing' | 'proposal' | 'packages' | 'sales') => void;
  brandConfig: ClientBrandConfig;
  isProductionMode?: boolean;
  onOpenNewLeadModal?: () => void;
  leadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  brandConfig,
  isProductionMode = false,
  onOpenNewLeadModal,
  leadCount = 0
}) => {
  const [activeSection, setActiveSection] = useState<'services' | 'estimator' | 'packages' | 'sales'>('sales');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // ScrollSpy to track if user scrolled into the estimator or services
  useEffect(() => {
    if (currentView === 'packages') {
      setActiveSection('packages');
      return;
    }
    if (currentView === 'sales') {
      setActiveSection('sales');
      return;
    }

    if (currentView !== 'landing') return;

    const handleScroll = () => {
      const estimatorEl = document.getElementById('estimator');
      if (estimatorEl) {
        const rect = estimatorEl.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 150) {
          setActiveSection('estimator');
          return;
        }
      }
      if (window.scrollY < 400) {
        setActiveSection('services');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleNavClick = (section: 'services' | 'estimator' | 'packages' | 'sales') => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);

    if (section === 'sales') {
      onNavigate('sales');
    } else if (section === 'services') {
      if (currentView !== 'landing') {
        onNavigate('landing');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (section === 'estimator') {
      if (currentView !== 'landing') {
        onNavigate('landing');
        setTimeout(() => {
          const el = document.getElementById('estimator');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById('estimator');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (section === 'packages') {
      onNavigate('packages');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => handleNavClick('sales')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-md group-hover:scale-105 transition-transform shrink-0">
            {brandConfig.companyName.charAt(0)}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight block leading-tight truncate max-w-[150px] xs:max-w-[190px] sm:max-w-none">
              {brandConfig.companyName}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate max-w-[150px] xs:max-w-[190px] sm:max-w-none">
              Commercial Sales Hub • {brandConfig.primaryCity}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 border border-slate-200/90 rounded-full p-1 text-xs">
          <button
            onClick={() => handleNavClick('sales')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'sales'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span>Sales Hub</span>
            {leadCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentView === 'sales' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                {leadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('estimator')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
              currentView === 'landing' && activeSection === 'estimator'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Rate Estimator
          </button>

          <button
            onClick={() => handleNavClick('services')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
              currentView === 'landing' && activeSection === 'services'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Services &amp; Standards
          </button>

          {/* System Packages is only visible during Sales / Agency Pitch Mode */}
          {!isProductionMode && (
            <button
              onClick={() => handleNavClick('packages')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                currentView === 'packages'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              Packages ($1k–$5k)
            </button>
          )}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${brandConfig.phone.replace(/[^0-9+]/g, '')}`}
            className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{brandConfig.phone}</span>
          </a>

          {onOpenNewLeadModal && (
            <button
              onClick={onOpenNewLeadModal}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 min-h-[38px]"
            >
              <span>+ New Lead</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Sliding Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 md:hidden animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white border-b border-slate-200 shadow-2xl px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                Navigation
              </span>
              
              <button
                onClick={() => handleNavClick('sales')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                  currentView === 'sales'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Sales Pipeline CRM</span>
                </div>
                {leadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                    {leadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('estimator')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                  currentView === 'landing' && activeSection === 'estimator'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>ISSA Rate Estimator</span>
              </button>

              <button
                onClick={() => handleNavClick('services')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                  currentView === 'landing' && activeSection === 'services'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Services &amp; Standards</span>
              </button>

              {!isProductionMode && (
                <button
                  onClick={() => handleNavClick('packages')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                    currentView === 'packages'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>High-Ticket Packages ($1k–$5k)</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <a
                href={`tel:${brandConfig.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Direct Dispatch: {brandConfig.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


