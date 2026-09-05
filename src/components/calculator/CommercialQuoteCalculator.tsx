import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Layers, 
  Clock, 
  Users, 
  ShieldCheck, 
  Info, 
  Sliders, 
  Check, 
  Sparkles, 
  Save, 
  Building2, 
  AlertTriangle,
  X,
  Monitor
} from 'lucide-react';
import { 
  FacilitySectorId, 
  FrequencyId, 
  AddOnServiceId, 
  ClientBrandConfig, 
  EstimateResult, 
  PricingParameters,
  LeadRecord
} from '../../types/cleanCommand';
import { 
  facilitySectors, 
  frequencyOptions, 
  addOnServices, 
  defaultPricingParameters 
} from '../../config/clientConfig';
import { calculateCommercialEstimate, formatCurrency } from '../../utils/pricingEngine';
import { SaveEstimateModal } from './SaveEstimateModal';

interface CommercialQuoteCalculatorProps {
  brandConfig: ClientBrandConfig;
  onOpenProposalGenerator: (estimate: EstimateResult) => void;
  pricingParams?: PricingParameters;
  activeLead?: LeadRecord | null;
  leads?: LeadRecord[];
  onSaveEstimateToLead?: (
    leadId: string,
    estimate: EstimateResult, 
    facilitySpecs: { 
      squareFootage: number; 
      facilityType: FacilitySectorId; 
      cleaningFrequency: FrequencyId; 
      selectedAddOns: AddOnServiceId[]; 
    }
  ) => Promise<void>;
  onSaveEstimate?: (
    estimate: EstimateResult, 
    facilitySpecs: { 
      squareFootage: number; 
      facilityType: FacilitySectorId; 
      cleaningFrequency: FrequencyId; 
      selectedAddOns: AddOnServiceId[]; 
    }
  ) => Promise<void> | void;
  onSaveAsNewLead?: (
    estimate: EstimateResult,
    facilitySpecs: {
      squareFootage: number;
      facilityType: FacilitySectorId;
      cleaningFrequency: FrequencyId;
      selectedAddOns: AddOnServiceId[];
    }
  ) => void;
  onSaveStandalone?: (estimate: EstimateResult) => void;
  onClearActiveLead?: () => void;
}

export const CommercialQuoteCalculator: React.FC<CommercialQuoteCalculatorProps> = ({
  brandConfig,
  onOpenProposalGenerator,
  pricingParams = defaultPricingParameters,
  activeLead,
  leads = [],
  onSaveEstimateToLead,
  onSaveEstimate,
  onSaveAsNewLead,
  onSaveStandalone,
  onClearActiveLead
}) => {
  const [squareFootage, setSquareFootage] = useState<number>(activeLead?.squareFootage || 12500);
  const [selectedSectorId, setSelectedSectorId] = useState<FacilitySectorId>(activeLead?.facilityType || 'corporate_office');
  const [selectedFrequencyId, setSelectedFrequencyId] = useState<FrequencyId>(activeLead?.cleaningFrequency || 'business_5x');
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnServiceId[]>(activeLead?.selectedAddOns || ['carpet_extraction']);
  
  const [discretionaryAdjustment, setDiscretionaryAdjustment] = useState<number>(() => {
    return activeLead?.discretionaryAdjustmentPercent ?? activeLead?.estimateSnapshot?.discretionaryAdjustmentPercent ?? 0;
  });
  
  const [isSavingEstimate, setIsSavingEstimate] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [validationWarning, setValidationWarning] = useState<string>('');
  const [isSaveDestinationModalOpen, setIsSaveDestinationModalOpen] = useState<boolean>(false);

  // Sync state if activeLead changes
  useEffect(() => {
    if (activeLead) {
      setSquareFootage(activeLead.squareFootage || 12500);
      setSelectedSectorId(activeLead.facilityType || 'corporate_office');
      setSelectedFrequencyId(activeLead.cleaningFrequency || 'business_5x');
      setSelectedAddOns(activeLead.selectedAddOns || []);
      setDiscretionaryAdjustment(
        activeLead.discretionaryAdjustmentPercent ?? activeLead.estimateSnapshot?.discretionaryAdjustmentPercent ?? 0
      );
    } else {
      // Clean reset for New Blank Estimate (Requirement 4 & 8)
      setDiscretionaryAdjustment(0);
    }
  }, [activeLead?.leadId]);

  // Calculate live estimate (strictly applying discretionary adjustment after recommended price)
  const estimate = useMemo(() => {
    return calculateCommercialEstimate(
      squareFootage,
      selectedSectorId,
      selectedFrequencyId,
      selectedAddOns,
      pricingParams,
      discretionaryAdjustment
    );
  }, [squareFootage, selectedSectorId, selectedFrequencyId, selectedAddOns, pricingParams, discretionaryAdjustment]);

  const activeSector = facilitySectors.find(s => s.id === selectedSectorId) || facilitySectors[0];

  const toggleAddOn = (id: AddOnServiceId) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickSqFt = (amount: number) => {
    setSquareFootage(amount);
  };

  const handleProposalClick = () => {
    setValidationWarning('');
    // If active lead is present, validate proposal requirements
    if (activeLead) {
      const missing: string[] = [];
      if (!activeLead.fullName && !activeLead.companyName) missing.push('Contact Name or Company');
      if (!activeLead.businessEmail) missing.push('Business Email');
      if (!activeLead.phoneNumber) missing.push('Phone Number');
      if (!activeLead.propertyAddress) missing.push('Property Address');

      if (missing.length > 0) {
        setValidationWarning(`Incomplete lead fields for formal proposal: ${missing.join(', ')}. Please update in CRM or complete during proposal editing.`);
      }
    }
    onOpenProposalGenerator(estimate);
  };

  return (
    <section id="estimator" className="py-8 sm:py-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-20">
      
      {/* Active Lead Context Banner (When estimating for an internal opportunity) */}
      {activeLead && (
        <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-2xl bg-blue-950/80 border border-blue-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{activeLead.leadId}</span>
                <span className="text-sm font-bold text-white">{activeLead.companyName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 border border-blue-700">
                  {activeLead.status}
                </span>
              </div>
              <p className="text-xs text-blue-300 mt-0.5">
                Modifying parameters updates this lead's estimate snapshot and proposal scope.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClearActiveLead && (
              <button
                type="button"
                onClick={onClearActiveLead}
                className="w-full sm:w-auto text-xs text-blue-300 hover:text-white px-3 py-1.5 rounded-lg border border-blue-800 hover:border-blue-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>New Blank Estimate</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3.5 shadow-sm">
          <Sliders className="w-3.5 h-3.5" />
          <span>Transparent B2B Bidding Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Instant Commercial Janitorial Rate Calculator
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-600">
          Get an itemized ballpark monthly estimate for your facility in {brandConfig.primaryCity} based on cleanable square footage, ISSA production standards, and sanitization protocols.
        </p>
      </div>

      {/* Desktop Advisory Banner for Mobile Viewports (Requirement 6) */}
      <div className="block lg:hidden mb-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-2xl p-4 text-xs shadow-xs text-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Monitor className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-slate-900 text-sm">
              Best experienced on desktop or laptop.
            </div>
            <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
              The estimating workspace is optimized for larger screens. All calculations and controls below remain accessible on mobile.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Interactive Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 clean-card rounded-2xl p-4 sm:p-8 shadow-sm">
          
          {/* 1. Square Footage Slider & Stepper */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>1. Cleanable Facility Square Footage</span>
                <span className="text-xs font-normal text-slate-500 font-mono">
                  (ISSA 540 Standards)
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Quick Select:</span>
                {[5000, 15000, 30000, 60000].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleQuickSqFt(size)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      squareFootage === size 
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {(size / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
              <input
                type="range"
                min="1000"
                max="100000"
                step="500"
                value={squareFootage}
                onChange={(e) => setSquareFootage(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto sm:min-w-[140px] px-3 py-2 sm:py-1.5 rounded-xl border border-slate-300 bg-white shadow-inner">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(Math.max(0, Number(e.target.value)))}
                  className="w-full font-mono text-base sm:text-sm font-bold text-slate-900 text-right focus:outline-none"
                />
                <span className="text-xs font-medium text-slate-500 shrink-0">sq ft</span>
              </div>
            </div>
          </div>

          {/* 2. Facility Sector Selector */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-3.5">
              2. Facility Type &amp; Compliance Sector
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facilitySectors.map((sector) => {
                const isSelected = selectedSectorId === sector.id;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => setSelectedSectorId(sector.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {sector.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sector.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {sector.shortDesc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Cleaning Frequency Selector */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-3.5">
              3. Service Frequency (Days Per Week)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {frequencyOptions.map((freq) => {
                const isSelected = selectedFrequencyId === freq.id;
                return (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setSelectedFrequencyId(freq.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {freq.isPopular && (
                      <span className="absolute top-0 right-0 bg-amber-400 text-slate-900 font-extrabold text-[9px] px-1.5 py-0.2 rounded-bl">
                        POPULAR
                      </span>
                    )}
                    <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {freq.label}
                    </span>
                    <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {freq.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Specialty Add-On Services */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-3.5">
              4. Recommended Specialty Add-Ons
            </label>
            <div className="space-y-2.5">
              {addOnServices.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id)}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{addon.name}</span>
                        <span className="text-xs font-mono font-bold text-blue-700">
                          +${addon.basePrice} <span className="text-[10px] font-normal text-slate-500">/{addon.unit}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{addon.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Estimate Breakdown & CTAs (5 cols) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          
          <div className="rounded-2xl p-4 sm:p-7 bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
            
            {/* Soft backdrop glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-700/80">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 block font-semibold">
                  Commercial Janitorial Bid
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {brandConfig.companyName}
                </h3>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Model</span>
              </div>
            </div>

            {/* 1. Base Calculated Selling Price (Model Recommended) */}
            <div className="pt-4 pb-3 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  RECOMMENDED PRICE
                </span>
                <span className="text-[11px] text-slate-400">
                  Model baseline ({activeSector.name})
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-bold font-mono text-slate-200 tabular-nums">
                  {formatCurrency(estimate.recommendedMonthlyRate)}
                </span>
                <span className="text-xs text-slate-400 font-sans ml-1">/ month</span>
              </div>
            </div>

            {/* 2. DISCRETIONARY PRICING ADJUSTMENT Slider Control */}
            <div className="py-4 border-b border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label 
                  htmlFor="discretionary-pricing-slider" 
                  className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-extrabold flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>DISCRETIONARY PRICING ADJUSTMENT</span>
                </label>

                {/* Exact active percentage badge */}
                <div className="flex items-center gap-2">
                  <span 
                    id="discretionary-percentage-badge"
                    className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-lg border tabular-nums transition-colors ${
                      discretionaryAdjustment > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                        : discretionaryAdjustment < 0
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {discretionaryAdjustment > 0 ? '+' : ''}{discretionaryAdjustment.toFixed(1)}%
                  </span>
                  {discretionaryAdjustment !== 0 && (
                    <button
                      type="button"
                      onClick={() => setDiscretionaryAdjustment(0)}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                      title="Reset adjustment to 0%"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Polished Range Slider (-20% to +20%, step 0.5%) */}
              <div className="space-y-1.5 pt-1">
                <input
                  id="discretionary-pricing-slider"
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={discretionaryAdjustment}
                  onChange={(e) => {
                    const rawVal = parseFloat(e.target.value);
                    const cleanVal = Number.isFinite(rawVal) ? Math.min(20, Math.max(-20, rawVal)) : 0;
                    setDiscretionaryAdjustment(cleanVal);
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                  aria-label="Discretionary pricing adjustment percentage"
                />

                {/* Preset notch ticks */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5 select-none">
                  {[-20, -10, -5, 0, 5, 10, 20].map((tick) => (
                    <button
                      key={tick}
                      type="button"
                      onClick={() => setDiscretionaryAdjustment(tick)}
                      className={`hover:text-white transition-colors cursor-pointer py-0.5 ${
                        discretionaryAdjustment === tick ? 'text-blue-400 font-bold' : ''
                      }`}
                    >
                      {tick > 0 ? `+${tick}%` : `${tick}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. FINAL PROPOSED PRICE (Hero Centerpiece) */}
            <div className="py-5 border-b border-slate-700/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-extrabold block">
                FINAL PROPOSED PRICE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight transition-all duration-150 tabular-nums">
                  {formatCurrency(estimate.totalEstimatedMonthlyInvestment)}
                </span>
                <span className="text-sm font-medium text-slate-300">/ month</span>
              </div>

              <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Ballpark range: <strong className="text-white tabular-nums">{formatCurrency(estimate.lowMonthlyRange)}</strong> – <strong className="text-white tabular-nums">{formatCurrency(estimate.highMonthlyRange)}/mo</strong>
                </span>
              </p>

              {/* FINAL CONTRACT VALUE Badge */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                    FINAL CONTRACT VALUE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums">
                    {formatCurrency(estimate.annualContractValue)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  Annual 12-Month Total
                </span>
              </div>
            </div>

            {/* Operational Specs Grid */}
            <div className="py-4 space-y-2.5 text-xs border-b border-slate-700/80">
              <div className="flex justify-between text-slate-200">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Service Rate Per Visit:
                </span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {formatCurrency(estimate.pricePerVisit)} / visit
                </span>
              </div>

              <div className="flex justify-between text-slate-200">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Estimated Labor Time:
                </span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {estimate.hoursPerCleaningVisit} hrs / visit ({estimate.totalMonthlyLaborHours} hrs/mo)
                </span>
              </div>

              <div className="flex justify-between text-slate-200">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Recommended Crew Size:
                </span>
                <span className="font-mono font-semibold text-white">
                  {estimate.recommendedCrewSize} Dedicated Cleaner{estimate.recommendedCrewSize > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex justify-between text-slate-200">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Specialty Add-Ons:
                </span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {estimate.addOnMonthlyRate > 0 ? `+${formatCurrency(estimate.addOnMonthlyRate)}/mo` : 'None Selected'}
                </span>
              </div>
            </div>

            {/* Validation warning if applicable */}
            {validationWarning && (
              <div className="mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{validationWarning}</span>
              </div>
            )}

            {/* CTAs Hierarchy */}
            <div className="pt-5 space-y-3">
              {/* PRIMARY ACTION: Save Estimate (Always opens destination choice dialog) */}
              <button
                type="button"
                onClick={() => setIsSaveDestinationModalOpen(true)}
                disabled={isSavingEstimate}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isSavingEstimate ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Estimate to Google Sheets...</span>
                  </>
                ) : justSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Estimate Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Estimate</span>
                    {activeLead && (
                      <span className="text-[10px] bg-blue-700/80 px-2 py-0.5 rounded-full text-blue-200 border border-blue-500/50">
                        {activeLead.companyName || activeLead.leadId}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* SECONDARY ACTION: Generate Professional Proposal */}
              <button
                type="button"
                onClick={handleProposalClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Generate Professional Proposal Document</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                {brandConfig.insuranceCoverage} • Direct Phone: <strong className="text-slate-200">{brandConfig.phone}</strong>
              </p>
            </div>
          </div>

          {/* Sector Protocols Callout */}
          <div className="p-4.5 rounded-xl clean-card text-xs space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Included {activeSector.name} Protocols:</span>
            </h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              {activeSector.protocols.map((protocol, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{protocol}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Save Destination Choice Modal (Existing Lead, New Lead, or Standalone) */}
      <SaveEstimateModal
        isOpen={isSaveDestinationModalOpen}
        onClose={() => setIsSaveDestinationModalOpen(false)}
        estimate={estimate}
        specs={{
          squareFootage,
          facilityType: activeSector.name,
          cleaningFrequency: frequencyOptions.find(f => f.id === selectedFrequencyId)?.label || selectedFrequencyId,
          selectedAddOns
        }}
        leads={leads}
        activeLead={activeLead}
        onConfirmSaveToExisting={async (targetLeadId) => {
          setIsSavingEstimate(true);
          try {
            if (onSaveEstimateToLead) {
              await onSaveEstimateToLead(targetLeadId, estimate, {
                squareFootage,
                facilityType: selectedSectorId,
                cleaningFrequency: selectedFrequencyId,
                selectedAddOns
              });
            } else if (onSaveEstimate) {
              await onSaveEstimate(estimate, {
                squareFootage,
                facilityType: selectedSectorId,
                cleaningFrequency: selectedFrequencyId,
                selectedAddOns
              });
            }
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 3000);
          } finally {
            setIsSavingEstimate(false);
          }
        }}
        onConfirmSaveToNew={() => {
          if (onSaveAsNewLead) {
            onSaveAsNewLead(estimate, {
              squareFootage,
              facilityType: selectedSectorId,
              cleaningFrequency: selectedFrequencyId,
              selectedAddOns
            });
          }
        }}
        onConfirmSaveStandalone={() => {
          if (onSaveStandalone) {
            onSaveStandalone(estimate);
          }
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 3000);
        }}
      />
    </section>
  );
};
