import React, { useState, useEffect } from 'react';
import { 
  ClientBrandConfig, 
  EstimateResult, 
  LeadRecord, 
  LeadStatus,
  ProposalStatus,
  FacilitySectorId,
  FrequencyId,
  AddOnServiceId
} from './types/cleanCommand';
import { defaultClientBrand } from './config/clientConfig';
import { initialDemoLeads } from './data/demoLeads';
import { calculateCommercialEstimate } from './utils/pricingEngine';
import { LoomPitchToolbar } from './components/pitch/LoomPitchToolbar';
import { Navbar } from './components/Navbar';
import { CorporateLanding } from './components/landing/CorporateLanding';
import { CommercialProposalGenerator } from './components/proposal/CommercialProposalGenerator';
import { PackagesView } from './components/packages/PackagesView';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { SalesDashboard } from './components/leads/SalesDashboard';
import { NewLeadModal } from './components/leads/NewLeadModal';
import { LeadDetailEditModal } from './components/leads/LeadDetailEditModal';
import { CommercialQuoteCalculator } from './components/calculator/CommercialQuoteCalculator';
import { 
  loadLeadsFromGoogleSheets, 
  createLeadInGoogleSheets, 
  updateLeadInGoogleSheets,
  saveEstimateToGoogleSheets, 
  updateProposalInGoogleSheets, 
  updateStatusInGoogleSheets 
} from './services/googleSheetsService';

export const App: React.FC = () => {
  // Check if forced into production client mode via URL or config
  const isUrlProductionMode = typeof window !== 'undefined' && 
    (window.location.search.includes('mode=production') || window.location.search.includes('demo=false'));

  const [isProductionPreview, setIsProductionPreview] = useState<boolean>(isUrlProductionMode);

  // Brand Configuration with localStorage sync
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

  // Current view: default to 'landing' for corporate presentation
  const [currentView, setCurrentView] = useState<'sales' | 'landing' | 'proposal' | 'packages'>('landing');

  // Leads CRM State
  const [leads, setLeads] = useState<LeadRecord[]>(() => {
    try {
      const cached = localStorage.getItem('cleancommand_leads_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialDemoLeads;
  });

  const [activeLead, setActiveLead] = useState<LeadRecord | null>(() => {
    return initialDemoLeads.length > 0 ? initialDemoLeads[0] : null;
  });

  // Active Estimate for Standalone or Linked Estimating
  const [activeEstimate, setActiveEstimate] = useState<EstimateResult>(() => {
    return calculateCommercialEstimate(
      initialDemoLeads[0]?.squareFootage || 12500,
      initialDemoLeads[0]?.facilityType || 'corporate_office',
      initialDemoLeads[0]?.cleaningFrequency || 'business_5x',
      initialDemoLeads[0]?.selectedAddOns || ['carpet_extraction']
    );
  });

  // Modal controls
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<LeadRecord | null>(null);
  const [initialSpecsForNewLead, setInitialSpecsForNewLead] = useState<{
    squareFootage?: number;
    facilityType?: FacilitySectorId;
    cleaningFrequency?: FrequencyId;
    estimatedValue?: number;
  } | undefined>(undefined);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  // Load leads from Google Sheets on start / refresh
  useEffect(() => {
    let isMounted = true;
    async function initLeads() {
      try {
        const res = await loadLeadsFromGoogleSheets(brandConfig.googleAppsScriptUrl);
        if (isMounted && res.leads && res.leads.length > 0) {
          setLeads(res.leads);
          if (!activeLead) {
            setActiveLead(res.leads[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load remote leads:', err);
      }
    }
    initLeads();
    return () => { isMounted = false; };
  }, [brandConfig.googleAppsScriptUrl]);

  // Lead Lifecycle Actions
  const handleCreateLead = async (newLead: LeadRecord) => {
    setLeads(prev => [newLead, ...prev]);
    setActiveLead(newLead);
    if (newLead.estimateSnapshot) {
      setActiveEstimate(newLead.estimateSnapshot);
    }
    triggerToast(`Created lead ${newLead.leadId} for ${newLead.companyName}!`);

    try {
      await createLeadInGoogleSheets(newLead, brandConfig.googleAppsScriptUrl);
    } catch (e) {
      console.warn('Failed to sync new lead to Google Sheets:', e);
    }
  };

  const handleUpdateLead = async (updatedLead: LeadRecord) => {
    setLeads(prev => prev.map(l => l.leadId === updatedLead.leadId ? updatedLead : l));
    if (activeLead && activeLead.leadId === updatedLead.leadId) {
      setActiveLead(updatedLead);
    }
    triggerToast(`Updated lead ${updatedLead.leadId} (${updatedLead.companyName})!`);

    try {
      await updateLeadInGoogleSheets(updatedLead, brandConfig.googleAppsScriptUrl);
    } catch (e) {
      console.warn('Failed to sync lead update to Google Sheets:', e);
    }
  };

  const handleSaveEstimate = async (
    estimate: EstimateResult,
    facilitySpecs: {
      squareFootage: number;
      facilityType: FacilitySectorId;
      cleaningFrequency: FrequencyId;
      selectedAddOns: AddOnServiceId[];
    }
  ) => {
    if (!activeLead) return;

    const updatedLead: LeadRecord = {
      ...activeLead,
      squareFootage: facilitySpecs.squareFootage,
      facilityType: facilitySpecs.facilityType,
      cleaningFrequency: facilitySpecs.cleaningFrequency,
      selectedAddOns: facilitySpecs.selectedAddOns,
      estimatedValue: estimate.annualContractValue,
      ratePerVisit: estimate.pricePerVisit,
      annualContractValue: estimate.annualContractValue,
      estimatedLaborHours: estimate.hoursPerCleaningVisit,
      recommendedCrewSize: estimate.recommendedCrewSize,
      estimateSnapshot: estimate,
      status: activeLead.status === 'New' ? 'Estimating' : activeLead.status,
      updatedDate: new Date().toISOString().split('T')[0],

      // Compatibility helpers
      monthlyEstimate: estimate.totalEstimatedMonthlyInvestment,
      lastUpdated: new Date().toISOString()
    };

    setActiveLead(updatedLead);
    setActiveEstimate(estimate);
    setLeads(prev => prev.map(l => l.leadId === updatedLead.leadId ? updatedLead : l));
    triggerToast(`Saved estimate ($${estimate.totalEstimatedMonthlyInvestment}/mo) to ${updatedLead.companyName}!`);

    try {
      await saveEstimateToGoogleSheets(updatedLead.leadId, {
        estimatedValue: estimate.annualContractValue,
        monthlyEstimate: estimate.totalEstimatedMonthlyInvestment,
        ratePerVisit: estimate.pricePerVisit,
        annualContractValue: estimate.annualContractValue,
        estimatedLaborHours: estimate.hoursPerCleaningVisit,
        recommendedCrewSize: estimate.recommendedCrewSize,
        squareFootage: facilitySpecs.squareFootage,
        facilityType: facilitySpecs.facilityType,
        cleaningFrequency: facilitySpecs.cleaningFrequency,
        selectedAddOns: facilitySpecs.selectedAddOns
      }, brandConfig.googleAppsScriptUrl);
    } catch (e) {
      console.warn('Failed to save estimate to Google Sheets:', e);
    }
  };

  // Convert standalone estimate to a new lead
  const handleSaveAsNewLead = (
    estimate: EstimateResult,
    facilitySpecs: {
      squareFootage: number;
      facilityType: FacilitySectorId;
      cleaningFrequency: FrequencyId;
      selectedAddOns: AddOnServiceId[];
    }
  ) => {
    setInitialSpecsForNewLead({
      squareFootage: facilitySpecs.squareFootage,
      facilityType: facilitySpecs.facilityType,
      cleaningFrequency: facilitySpecs.cleaningFrequency,
      estimatedValue: estimate.annualContractValue
    });
    setIsNewLeadModalOpen(true);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.leadId === leadId);
    const prevStatus = lead?.status;

    setLeads(prev => prev.map(l => l.leadId === leadId ? { 
      ...l, 
      status: newStatus, 
      updatedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString() 
    } : l));

    if (activeLead && activeLead.leadId === leadId) {
      setActiveLead(prev => prev ? { 
        ...prev, 
        status: newStatus, 
        updatedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString() 
      } : null);
    }

    triggerToast(`Lead ${leadId} status set to ${newStatus}`);

    try {
      await updateStatusInGoogleSheets(leadId, newStatus, prevStatus, brandConfig.googleAppsScriptUrl);
    } catch (e) {
      console.warn('Failed to update status in Google Sheets:', e);
    }
  };

  const handleSaveProposal = async (proposalInfo: {
    proposalId: string;
    proposalStatus: ProposalStatus;
    proposalIssueDate: string;
    proposalValidThrough: string;
  }) => {
    if (!activeLead) return;

    const updatedLead: LeadRecord = {
      ...activeLead,
      proposalId: proposalInfo.proposalId,
      proposalStatus: proposalInfo.proposalStatus,
      proposalIssueDate: proposalInfo.proposalIssueDate,
      proposalValidThrough: proposalInfo.proposalValidThrough,
      status: 'Quoted',
      updatedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    };

    setActiveLead(updatedLead);
    setLeads(prev => prev.map(l => l.leadId === updatedLead.leadId ? updatedLead : l));
    triggerToast(`Proposal ${proposalInfo.proposalId} registered to ${updatedLead.companyName}`);

    try {
      await updateProposalInGoogleSheets(updatedLead.leadId, proposalInfo, brandConfig.googleAppsScriptUrl);
    } catch (e) {
      console.warn('Failed to update proposal in Google Sheets:', e);
    }
  };

  const handleOpenProposalGenerator = (estimate: EstimateResult) => {
    setActiveEstimate(estimate);
    setToastVisible(false);
    setCurrentView('proposal');
  };

  const handleOpenEstimatorForLead = (lead: LeadRecord) => {
    setActiveLead(lead);
    const est = lead.estimateSnapshot || calculateCommercialEstimate(
      lead.squareFootage || 12000,
      lead.facilityType || 'corporate_office',
      lead.cleaningFrequency || 'business_5x',
      lead.selectedAddOns || []
    );
    setActiveEstimate(est);
    setCurrentView('sales');
    // Smooth scroll down to estimator section
    setTimeout(() => {
      const el = document.getElementById('estimator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenProposalForLead = (lead: LeadRecord) => {
    setActiveLead(lead);
    const est = lead.estimateSnapshot || calculateCommercialEstimate(
      lead.squareFootage || 12000,
      lead.facilityType || 'corporate_office',
      lead.cleaningFrequency || 'business_5x',
      lead.selectedAddOns || []
    );
    setActiveEstimate(est);
    setCurrentView('proposal');
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

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Loom Pitch Mode Toolbar (Demo-specific, hidden on proposal view) */}
      {!isProductionPreview && currentView !== 'proposal' && (
        <LoomPitchToolbar
          brandConfig={brandConfig}
          onUpdateBrand={handleUpdateBrand}
          onResetDefaults={handleResetDefaults}
        />
      )}

      {/* Production Mode Indicator */}
      {isProductionPreview && (
        <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-200 text-xs px-4 py-1.5 flex items-center justify-between shadow-sm">
          <span className="font-mono text-[11px] font-semibold">
            🔒 Client Internal Mode (Pitch Toolbar Hidden)
          </span>
          <button
            onClick={() => setIsProductionPreview(false)}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Back to Loom Pitch Mode
          </button>
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      {currentView !== 'proposal' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          brandConfig={brandConfig}
          isProductionMode={isProductionPreview}
          onOpenNewLeadModal={() => {
            setInitialSpecsForNewLead(undefined);
            setIsNewLeadModalOpen(true);
          }}
          leadCount={leads.length}
        />
      )}

      {/* 3. Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: Internal Sales Hub & Integrated Estimator */}
        {currentView === 'sales' && (
          <div className="space-y-8 pb-16">
            <SalesDashboard
              leads={leads}
              activeLead={activeLead}
              brandConfig={brandConfig}
              onSelectLead={(lead) => {
                setActiveLead(lead);
                if (lead.estimateSnapshot) setActiveEstimate(lead.estimateSnapshot);
              }}
              onOpenNewLeadModal={() => {
                setInitialSpecsForNewLead(undefined);
                setIsNewLeadModalOpen(true);
              }}
              onOpenEditLeadModal={(lead) => {
                setSelectedLeadForEdit(lead);
                setIsEditLeadModalOpen(true);
              }}
              onOpenEstimatorForLead={handleOpenEstimatorForLead}
              onOpenProposalForLead={handleOpenProposalForLead}
              onUpdateStatus={handleUpdateStatus}
            />

            {/* Integrated Estimator (connects to activeLead or operates standalone) */}
            <div className="border-t border-slate-200 pt-4 bg-slate-50/60">
              <CommercialQuoteCalculator
                brandConfig={brandConfig}
                activeLead={activeLead}
                onSaveEstimate={handleSaveEstimate}
                onSaveAsNewLead={handleSaveAsNewLead}
                onOpenProposalGenerator={handleOpenProposalGenerator}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Corporate Public Authority Landing */}
        {currentView === 'landing' && (
          <CorporateLanding
            brandConfig={brandConfig}
            onOpenProposalGenerator={handleOpenProposalGenerator}
            onNavigateToPackages={() => setCurrentView('packages')}
          />
        )}

        {/* VIEW 3: Professional A4 Proposal Generator & Print Document */}
        {currentView === 'proposal' && (
          <CommercialProposalGenerator
            estimate={activeEstimate}
            brandConfig={brandConfig}
            activeLead={activeLead}
            onSaveProposal={handleSaveProposal}
            onBack={() => setCurrentView('sales')}
          />
        )}

        {/* VIEW 4: High-Ticket Implementation Packages */}
        {currentView === 'packages' && (
          <PackagesView
            onSelectPackage={(pkg) => triggerToast(`Selected ${pkg}. Ready to deploy for client.`)}
          />
        )}
      </main>

      {/* 4. Footer (Hidden on Proposal View) */}
      {currentView !== 'proposal' && (
        <Footer
          brandConfig={brandConfig}
          onNavigate={(view) => setCurrentView(view as any)}
        />
      )}

      {/* 5. Modals */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onCreateLead={handleCreateLead}
        nextLeadSequence={leads.length + 1}
        initialEstimateSpecs={initialSpecsForNewLead}
      />

      <LeadDetailEditModal
        isOpen={isEditLeadModalOpen}
        lead={selectedLeadForEdit}
        onClose={() => {
          setIsEditLeadModalOpen(false);
          setSelectedLeadForEdit(null);
        }}
        onSaveLead={handleUpdateLead}
        onOpenEstimatorForLead={handleOpenEstimatorForLead}
        onOpenProposalForLead={handleOpenProposalForLead}
      />

      {/* 6. Toast Feedback */}
      <Toast message={toastMsg} isVisible={toastVisible} />
    </div>
  );
};

export default App;
