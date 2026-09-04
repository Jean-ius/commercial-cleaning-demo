import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Check, 
  Search, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LeadRecord, EstimateResult } from '../../types/cleanCommand';
import { formatCurrency } from '../../utils/pricingEngine';
import { getStatusBadge } from '../leads/SalesDashboard';

export type SaveDestinationMode = 'existing' | 'new' | 'standalone';

interface SaveEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: EstimateResult;
  specs: {
    squareFootage: number;
    facilityType: string;
    cleaningFrequency: string;
  };
  leads: LeadRecord[];
  activeLead?: LeadRecord | null;
  onConfirmSaveToExisting: (leadId: string) => Promise<void>;
  onConfirmSaveToNew: () => void;
  onConfirmSaveStandalone: () => void;
}

export const SaveEstimateModal: React.FC<SaveEstimateModalProps> = ({
  isOpen,
  onClose,
  estimate,
  specs,
  leads = [],
  activeLead,
  onConfirmSaveToExisting,
  onConfirmSaveToNew,
  onConfirmSaveStandalone
}) => {
  // If activeLead exists, default to 'existing', otherwise default to 'new'
  const [mode, setMode] = useState<SaveDestinationMode>(activeLead ? 'existing' : 'new');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(activeLead?.leadId || (leads[0]?.leadId || ''));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const filteredLeads = leads.filter(l => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (l.companyName || '').toLowerCase().includes(term) ||
      (l.contactPerson || l.fullName || '').toLowerCase().includes(term) ||
      (l.leadId || '').toLowerCase().includes(term) ||
      (l.propertyAddress || '').toLowerCase().includes(term)
    );
  });

  const handleContinue = async () => {
    setErrorMsg('');
    if (mode === 'existing') {
      if (!selectedLeadId) {
        setErrorMsg('Please select a lead from the list or choose "Save to New Lead".');
        return;
      }
      setIsSubmitting(true);
      try {
        await onConfirmSaveToExisting(selectedLeadId);
        onClose();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to save estimate to selected lead.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'new') {
      onClose();
      onConfirmSaveToNew();
    } else {
      onConfirmSaveStandalone();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Commercial Estimate Save Workflow</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Save Estimate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Where would you like to save this commercial cleaning estimate?
          </p>

          {/* Current Estimate Snapshot Badge */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Calculated Estimate
              </span>
              <span className="text-base font-mono font-extrabold text-emerald-400">
                {formatCurrency(estimate.totalEstimatedMonthlyInvestment)}
                <span className="text-xs text-slate-300 font-sans font-normal">/mo</span>
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-300 space-y-0.5">
              <div>{specs.squareFootage.toLocaleString()} sq ft • {specs.cleaningFrequency}</div>
              <div className="font-mono text-blue-300 font-semibold">{formatCurrency(estimate.annualContractValue)}/yr</div>
            </div>
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Destination Options */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          
          {/* OPTION 1: Save to Existing Lead */}
          <div 
            onClick={() => setMode('existing')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              mode === 'existing' 
                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                mode === 'existing' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {mode === 'existing' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">Save to Existing Lead</span>
                  {activeLead && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      Loaded: {activeLead.leadId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Attach this calculation to an existing prospect or company in your pipeline.
                </p>

                {/* Sub-section: Existing Leads Search & List (Shown when active) */}
                {mode === 'existing' && (
                  <div className="mt-3.5 pt-3.5 border-t border-blue-200/80 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search company, contact, or Lead ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-1.5 bg-white">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((l) => {
                          const isSelected = selectedLeadId === l.leadId;
                          return (
                            <div
                              key={l.leadId}
                              onClick={() => setSelectedLeadId(l.leadId)}
                              className={`p-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                  : 'hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {l.leadId}
                                  </span>
                                  <span className="truncate font-bold">{l.companyName}</span>
                                </div>
                                <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                  {l.contactPerson || l.fullName || 'No Contact'} • {l.propertyType || 'Commercial'}
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  isSelected 
                                    ? 'bg-blue-500/40 text-white border-blue-400' 
                                    : getStatusBadge(l.status)
                                }`}>
                                  {l.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400">
                          {leads.length === 0 
                            ? 'No existing leads found in CRM. Select "Save to New Lead" below.' 
                            : 'No matching leads found for this search.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OPTION 2: Save to New Lead */}
          <div 
            onClick={() => setMode('new')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              mode === 'new' 
                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                mode === 'new' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {mode === 'new' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">Save to New Lead</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Recommended for new prospect
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Create a completely new prospect/company record in Google Sheets and attach this estimate to it.
                </p>
              </div>
            </div>
          </div>

          {/* OPTION 3: Save Without Lead (Standalone) */}
          <div 
            onClick={() => setMode('standalone')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              mode === 'standalone' 
                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                mode === 'standalone' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {mode === 'standalone' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-bold text-slate-900">Save Without Lead (Standalone)</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Keep this estimate as an independent rate calculation without attaching it to any CRM prospect.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting || (mode === 'existing' && !selectedLeadId)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving to Google Sheets...</span>
              </>
            ) : mode === 'existing' ? (
              <>
                <span>Save to Selected Lead ({selectedLeadId})</span>
                <Check className="w-4 h-4" />
              </>
            ) : mode === 'new' ? (
              <>
                <span>Continue to New Lead Form</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Save as Standalone Estimate</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
