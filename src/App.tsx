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
import { defaultClientBrand, facilitySectors } from './config/clientConfig';
import { calculateCommercialEstimate, formatCurrency } from './utils/pricingEngine';
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
        const parsed = JSON.parse(saved);
        if (!parsed.googleAppsScriptUrl || typeof parsed.googleAppsScriptUrl !== 'string' || parsed.googleAppsScriptUrl.trim() === '') {
          parsed.googleAppsScriptUrl = defaultClientBrand.googleAppsScriptUrl;
        }
        return { ...defaultClientBrand, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for brand config:', e);
    }
    return defaultClientBrand;
  });

  // Current view: default to 'landing' for corporate presentation
  const [currentView, setCurrentView] = useState<'sales' | 'landing' | 'proposal' | 'packages'>('landing');

  // Leads CRM State: starts empty or reads verified local cache
  const [leads, setLeads] = useState<LeadRecord[]>(() => {
    try {
      const cached = localStorage.getItem('cleancommand_leads_cache');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [activeLead, setActiveLead] = useState<LeadRecord | null>(null);

  // Active Estimate for Standalone or Linked Estimating
  const [activeEstimate, setActiveEstimate] = useState<EstimateResult>(() => {
    return calculateCommercialEstimate(
      12500,
      'corporate_office',
      'business_5x',
      ['carpet_extraction']
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
    monthlyEstimate?: number;
    ratePerVisit?: number;
    selectedAddOns?: AddOnServiceId[];
    propertyType?: string;
    specialRequirements?: string;
    notes?: string;
    estimateSnapshot?: EstimateResult;
  } | undefined>(undefined);

  // Compute next guaranteed unique Lead ID across all existing leads (e.g., LD-2026-004)
  const generateNextLeadId = (): string => {
    const curYear = new Date().getFullYear();
    let maxSeq = 0;
    leads.forEach(l => {
      const match = String(l.leadId || '').match(/^LD-(\d{4})-(\d+)$/i);
      if (match) {
        const seq = parseInt(match[2], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    });
    return `LD-${curYear}-${String(maxSeq + 1).padStart(3, '0')}`;
  };

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  // Load leads from Google Sheets on start / refresh
  useEffect(() => {
    let isMounted = true;
    async function initLeads() {
      setIsSyncing(true);
      try {
        const res = await loadLeadsFromGoogleSheets(brandConfig.googleAppsScriptUrl);
        if (isMounted) {
          if (res.mode === 'live') {
            // Google Sheets is the authoritative source of truth
            setLeads(res.leads);
            if (res.leads.length === 0) {
              setActiveLead(null);
            } else if (!activeLead || !res.leads.some(l => l.leadId === activeLead.leadId)) {
              setActiveLead(res.leads[0]);
            }
          } else if (res.leads && res.leads.length > 0) {
            // Offline fallback
            setLeads(res.leads);
            if (!activeLead) setActiveLead(res.leads[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load remote leads:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }
    initLeads();
    return () => { isMounted = false; };
  }, [brandConfig.googleAppsScriptUrl]);

  // Manual trigger to pull latest sheet changes or deletions
  const handleSyncFromGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await loadLeadsFromGoogleSheets(brandConfig.googleAppsScriptUrl);
      if (res.mode === 'live') {
        setLeads(res.leads);
        if (res.leads.length === 0) {
          setActiveLead(null);
        } else if (!activeLead || !res.leads.some(l => l.leadId === activeLead.leadId)) {
          setActiveLead(res.leads[0]);
        }
        triggerToast(`Google Sheets Synced: ${res.leads.length} active leads in pipeline`);
      } else {
        triggerToast('Could not reach Google Sheets. Offline cache active.');
      }
    } catch (err: any) {
      triggerToast('Sync error: ' + (err?.message || 'Check network connection'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Lead Lifecycle Actions: BUG 2 ATOMIC SEQUENCE FOR SAVE TO NEW LEAD
  const handleCreateLead = async (newLead: LeadRecord) => {
    // 1. Validate Lead data
    if (!newLead.companyName?.trim() && !newLead.contactPerson?.trim()) {
      throw new Error('Please provide a Company Name or Contact Person.');
    }

    // 2. Write new Lead to Google Sheets first (Persistent Company Data Store)
    const createRes = await createLeadInGoogleSheets(newLead, brandConfig.googleAppsScriptUrl);
    if (!createRes.success) {
      throw new Error(createRes.error || 'Failed to create lead in Google Sheets.');
    }

    const confirmedLeadId = createRes.leadId || newLead.leadId;

    // 3. If an estimate was attached, save estimate specifically with the confirmed Lead ID
    if (newLead.estimateSnapshot) {
      const finalAnnualVal = newLead.estimatedValue || newLead.annualContractValue || newLead.estimateSnapshot.annualContractValue;
      try {
        await saveEstimateToGoogleSheets(confirmedLeadId, {
          estimatedValue: finalAnnualVal,
          monthlyEstimate: newLead.monthlyEstimate || newLead.estimateSnapshot.totalEstimatedMonthlyInvestment,
          ratePerVisit: newLead.ratePerVisit || newLead.estimateSnapshot.pricePerVisit,
          annualContractValue: finalAnnualVal,
          estimatedLaborHours: newLead.estimateSnapshot.hoursPerCleaningVisit,
          recommendedCrewSize: newLead.estimateSnapshot.recommendedCrewSize,
          squareFootage: newLead.squareFootage,
          facilityType: newLead.facilityType,
          cleaningFrequency: newLead.cleaningFrequency,
          selectedAddOns: newLead.selectedAddOns,
          status: 'Estimating'
        }, brandConfig.googleAppsScriptUrl);
      } catch (estErr: any) {
        console.warn('Lead created but estimate save encountered warning:', estErr);
      }
    }

    // 4. Refresh full leads dataset from Google Sheets to confirm complete persistence
    let finalLead: LeadRecord = { ...newLead, leadId: confirmedLeadId };
    try {
      const fresh = await loadLeadsFromGoogleSheets(brandConfig.googleAppsScriptUrl);
      if (fresh.mode === 'live') {
        setLeads(fresh.leads);
        const reloaded = fresh.leads.find(l => l.leadId === confirmedLeadId);
        if (reloaded) {
          finalLead = { 
            ...reloaded, 
            estimatedValue: newLead.estimatedValue || reloaded.estimatedValue,
            annualContractValue: newLead.annualContractValue || reloaded.annualContractValue,
            estimateSnapshot: newLead.estimateSnapshot 
          };
        }
      } else {
        setLeads(prev => [finalLead, ...prev]);
      }
    } catch {
      setLeads(prev => [finalLead, ...prev]);
    }

    setActiveLead(finalLead);
    if (finalLead.estimateSnapshot) {
      setActiveEstimate(finalLead.estimateSnapshot);
    }
    triggerToast(`Created new lead ${confirmedLeadId} for ${finalLead.companyName} in Google Sheets!`);
  };

  const handleUpdateLead = async (updatedLead: LeadRecord) => {
    // 1. Send update to Google Sheets first
    await updateLeadInGoogleSheets(updatedLead, brandConfig.googleAppsScriptUrl);

    // 2. Only after Google Sheets write succeeds: refresh from Google Sheets
    try {
      const fresh = await loadLeadsFromGoogleSheets(brandConfig.googleAppsScriptUrl);
      if (fresh.mode === 'live') {
        setLeads(fresh.leads);
        const reloaded = fresh.leads.find(l => l.leadId === updatedLead.leadId);
        if (reloaded) {
          setActiveLead({ ...reloaded, estimateSnapshot: updatedLead.estimateSnapshot || activeEstimate });
        }
      } else {
        setLeads(prev => prev.map(l => l.leadId === updatedLead.leadId ? updatedLead : l));
        if (activeLead && activeLead.leadId === updatedLead.leadId) {
          setActiveLead(updatedLead);
        }
      }
    } catch {
      setLeads(prev => prev.map(l => l.leadId === updatedLead.leadId ? updatedLead : l));
      if (activeLead && activeLead.leadId === updatedLead.leadId) {
        setActiveLead(updatedLead);
      }
    }
    triggerToast(`Updated lead ${updatedLead.leadId} (${updatedLead.companyName}) in Google Sheets!`);
  };

  // BUG 1 ATOMIC SEQUENCE: Save estimate specifically to an existing lead by Lead ID
  const handleSaveEstimateToLead = async (
    targetLeadId: string,
    estimate: EstimateResult,
    facilitySpecs: {
      squareFootage: number;
      facilityType: FacilitySectorId;
      cleaningFrequency: FrequencyId;
      selectedAddOns: AddOnServiceId[];
    }
  ) => {
    const targetLead = leads.find(l => l.leadId === targetLeadId) || activeLead;
    if (!targetLead) {
      throw new Error(`Lead ${targetLeadId} could not be located in records.`);
    }

    try {
      // 1. Write estimate updates directly to Google Sheets matching targetLead.leadId
      await saveEstimateToGoogleSheets(targetLead.leadId, {
        estimatedValue: estimate.annualContractValue,
        monthlyEstimate: estimate.totalEstimatedMonthlyInvestment,
        ratePerVisit: estimate.pricePerVisit,
        annualContractValue: estimate.annualContractValue,
        estimatedLaborHours: estimate.hoursPerCleaningVisit,
        recommendedCrewSize: estimate.recommendedCrewSize,
        squareFootage: facilitySpecs.squareFootage,
        facilityType: facilitySpecs.facilityType,
        cleaningFrequency: facilitySpecs.cleaningFrequency,
        selectedAddOns: facilitySpecs.selectedAddOns,
        status: targetLead.status === 'New' ? 'Estimating' : targetLead.status
      }, brandConfig.googleAppsScriptUrl);

      // 2. Reconcile / Refresh directly from Google Sheets (MANDATORY REQUIREMENT 8)
      let refreshedLead: LeadRecord | undefined;
      try {
        const fresh = await loadLeadsFromGoogleSheets(brandConfig.googleAppsScriptUrl);
        if (fresh.mode === 'live') {
          setLeads(fresh.leads);
          refreshedLead = fresh.leads.find(l => l.leadId === targetLead.leadId);
        }
      } catch (refreshErr) {
        console.warn('Post-save Google Sheets refresh note:', refreshErr);
      }

      const updatedLead: LeadRecord = refreshedLead ? {
        ...refreshedLead,
        estimateSnapshot: estimate
      } : {
        ...targetLead,
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
        status: targetLead.status === 'New' ? 'Estimating' : targetLead.status,
        updatedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        monthlyEstimate: estimate.totalEstimatedMonthlyInvestment
      };

      setActiveLead(updatedLead);
      setActiveEstimate(estimate);
      if (!refreshedLead) {
        setLeads(prev => prev.map(l => l.leadId === updatedLead.leadId ? updatedLead : l));
      }

      // 3. Show success ONLY after successful synchronization (MANDATORY REQUIREMENT 9)
      triggerToast(`Saved estimate ($${formatCurrency(estimate.totalEstimatedMonthlyInvestment)}/mo) to ${updatedLead.companyName} (${updatedLead.leadId}) in Google Sheets!`);
    } catch (e: any) {
      triggerToast(`Failed to save estimate to Google Sheets: ${e?.message || 'Error'}`);
      throw e;
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
    await handleSaveEstimateToLead(activeLead.leadId, estimate, facilitySpecs);
  };

  // Convert estimate to a new lead with all pre-filled estimator information
  const handleSaveAsNewLead = (
    estimate: EstimateResult,
    facilitySpecs: {
      squareFootage: number;
      facilityType: FacilitySectorId;
      cleaningFrequency: FrequencyId;
      selectedAddOns: AddOnServiceId[];
    }
  ) => {
    setActiveEstimate(estimate);
    const sectorObj = facilitySectors.find(s => s.id === facilitySpecs.facilityType);
    const sectorLabel = sectorObj ? sectorObj.name : 'Commercial Office';
    const addOnList = facilitySpecs.selectedAddOns.length > 0
      ? `Add-ons: ${facilitySpecs.selectedAddOns.join(', ')}`
      : '';
    const summaryNotes = `Commercial cleaning estimate: ${facilitySpecs.squareFootage.toLocaleString()} sq ft, ${facilitySpecs.cleaningFrequency}. ${addOnList}`;

    setInitialSpecsForNewLead({
      squareFootage: facilitySpecs.squareFootage,
      facilityType: facilitySpecs.facilityType,
      cleaningFrequency: facilitySpecs.cleaningFrequency,
      estimatedValue: estimate.annualContractValue,
      monthlyEstimate: estimate.totalEstimatedMonthlyInvestment,
      ratePerVisit: estimate.pricePerVisit,
      selectedAddOns: facilitySpecs.selectedAddOns,
      propertyType: sectorLabel,
      specialRequirements: addOnList,
      notes: summaryNotes,
      estimateSnapshot: estimate
    });
    setIsNewLeadModalOpen(true);
  };

  // Save calculation standalone without any lead (WORKFLOW 3)
  const handleSaveStandalone = (estimate: EstimateResult) => {
    setActiveEstimate(estimate);
    setActiveLead(null);
    triggerToast(`Estimate saved standalone ($${formatCurrency(estimate.totalEstimatedMonthlyInvestment)}/mo). Ready for proposal.`);
  };

  // Reset/Clear active lead so user can start an independent estimate for another company
  const handleClearActiveLead = () => {
    setActiveLead(null);
    triggerToast('Cleared active lead. Ready for a new blank estimate.');
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.leadId === leadId);
    const prevStatus = lead?.status;

    try {
      await updateStatusInGoogleSheets(leadId, newStatus, prevStatus, brandConfig.googleAppsScriptUrl);

      setLeads(prev => prev.map(l => l.leadId === leadId ? { 
        ...l, 
        status: newStatus, 
        updatedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0] 
      } : l));

      if (activeLead && activeLead.leadId === leadId) {
        setActiveLead(prev => prev ? { 
          ...prev, 
          status: newStatus, 
          updatedDate: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0] 
        } : null);
      }

      triggerToast(`Lead ${leadId} status set to ${newStatus} in Google Sheets!`);
    } catch (e: any) {
      triggerToast(`Failed to update status in Google Sheets: ${e?.message || 'Error'}`);
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
              isSyncing={isSyncing}
              onSyncFromGoogleSheets={handleSyncFromGoogleSheets}
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
                leads={leads}
                onSaveEstimateToLead={handleSaveEstimateToLead}
                onSaveEstimate={handleSaveEstimate}
                onSaveAsNewLead={handleSaveAsNewLead}
                onSaveStandalone={handleSaveStandalone}
                onClearActiveLead={handleClearActiveLead}
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
        onClose={() => {
          setIsNewLeadModalOpen(false);
          setInitialSpecsForNewLead(undefined);
        }}
        onCreateLead={handleCreateLead}
        suggestedLeadId={generateNextLeadId()}
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
