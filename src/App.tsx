import React, { useState, useEffect } from 'react';
import { ClientBrandConfig, EstimateResult } from './types/cleanCommand';
import { defaultClientBrand } from './config/clientConfig';
import { calculateCommercialEstimate } from './utils/pricingEngine';
import { LoomPitchToolbar } from './components/pitch/LoomPitchToolbar';
import { Navbar } from './components/Navbar';
import { CorporateLanding } from './components/landing/CorporateLanding';
import { CommercialProposalGenerator } from './components/proposal/CommercialProposalGenerator';
import { PackagesView } from './components/packages/PackagesView';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Check if forced into production client mode via URL or config
  const isUrlProductionMode = typeof window !== 'undefined' && 
    (window.location.search.includes('mode=production') || window.location.search.includes('demo=false'));

  const [isProductionPreview, setIsProductionPreview] = useState<boolean>(isUrlProductionMode);

  // Brand Configuration with localStorage sync for Loom pitch customization
  const [brandConfig, setBrandConfig] = useState<ClientBrandConfig>(() => {
    try {
      const saved = localStorage.getItem('cleancommand_brand_config');
      if (saved) {
        return { ...defaultClientBrand, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for brand config:', e);
    }
    return defaultClientBrand;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'proposal' | 'packages'>('landing');
  const [activeEstimate, setActiveEstimate] = useState<EstimateResult>(() => {
    return calculateCommercialEstimate(12500, 'corporate_office', 'business_5x', ['carpet_extraction']);
  });

  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const handleUpdateBrand = (updated: Partial<ClientBrandConfig>) => {
    setBrandConfig(prev => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('cleancommand_brand_config', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist brand config:', e);
      }
      return next;
    });
  };

  const handleResetDefaults = () => {
    setBrandConfig(defaultClientBrand);
    try {
      localStorage.removeItem('cleancommand_brand_config');
    } catch (e) {}
    triggerToast('Reset to default Apex Commercial Cleaning profile');
  };

  const handleOpenProposalGenerator = (estimate: EstimateResult) => {
    setActiveEstimate(estimate);
    setToastVisible(false); // Dismiss any active toast immediately when opening proposal
    setCurrentView('proposal');
  };

  const handleSelectPackage = (pkgName: string) => {
    triggerToast(`Selected ${pkgName}. Ready to deploy for client.`);
  };

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Supercharged Loom Sales Pitch Mode Toolbar (For Master Pitching - Hidden on Proposal View) */}
      {!isProductionPreview && currentView !== 'proposal' && (
        <LoomPitchToolbar
          brandConfig={brandConfig}
          onUpdateBrand={handleUpdateBrand}
          onResetDefaults={handleResetDefaults}
        />
      )}

      {/* Production Mode Indicator / Switcher */}
      {isProductionPreview && (
        <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex items-center justify-between shadow-sm">
          <span className="font-mono text-[11px] font-semibold">
            🔒 Client Production View (Loom Toolbar Hidden)
          </span>
          <button
            onClick={() => setIsProductionPreview(false)}
            className="text-[11px] underline hover:text-white"
          >
            Back to Loom Pitch Mode
          </button>
        </div>
      )}

      {/* 2. Top Navigation Bar (Hidden on Proposal View when printing) */}
      {currentView !== 'proposal' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          brandConfig={brandConfig}
          isProductionMode={isProductionPreview}
        />
      )}

      {/* 3. Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <CorporateLanding
            brandConfig={brandConfig}
            onOpenProposalGenerator={handleOpenProposalGenerator}
            onNavigateToPackages={() => setCurrentView('packages')}
          />
        )}

        {currentView === 'proposal' && (
          <CommercialProposalGenerator
            estimate={activeEstimate}
            brandConfig={brandConfig}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'packages' && (
          <PackagesView
            onSelectPackage={handleSelectPackage}
          />
        )}
      </main>

      {/* 4. Luxury Corporate Footer (Hidden on Proposal View) */}
      {currentView !== 'proposal' && (
        <Footer
          brandConfig={brandConfig}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {/* 5. Toast Feedback */}
      <Toast message={toastMsg} isVisible={toastVisible} />
    </div>
  );
};

export default App;
