import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Layers, 
  Clock, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Sliders, 
  Check, 
  Sparkles
} from 'lucide-react';
import { 
  FacilitySectorId, 
  FrequencyId, 
  AddOnServiceId, 
  ClientBrandConfig, 
  EstimateResult, 
  PricingParameters 
} from '../../types/cleanCommand';
import { 
  facilitySectors, 
  frequencyOptions, 
  addOnServices, 
  defaultPricingParameters 
} from '../../config/clientConfig';
import { calculateCommercialEstimate, formatCurrency } from '../../utils/pricingEngine';
import { WalkthroughBookingModal } from './WalkthroughBookingModal';

interface CommercialQuoteCalculatorProps {
  brandConfig: ClientBrandConfig;
  onOpenProposalGenerator: (estimate: EstimateResult) => void;
  pricingParams?: PricingParameters;
}

export const CommercialQuoteCalculator: React.FC<CommercialQuoteCalculatorProps> = ({
  brandConfig,
  onOpenProposalGenerator,
  pricingParams = defaultPricingParameters
}) => {
  const [squareFootage, setSquareFootage] = useState<number>(12500);
  const [selectedSectorId, setSelectedSectorId] = useState<FacilitySectorId>('corporate_office');
  const [selectedFrequencyId, setSelectedFrequencyId] = useState<FrequencyId>('business_5x');
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnServiceId[]>(['carpet_extraction']);
  const [isWalkthroughModalOpen, setIsWalkthroughModalOpen] = useState<boolean>(false);

  // Calculate live estimate
  const estimate = useMemo(() => {
    return calculateCommercialEstimate(
      squareFootage,
      selectedSectorId,
      selectedFrequencyId,
      selectedAddOns,
      pricingParams
    );
  }, [squareFootage, selectedSectorId, selectedFrequencyId, selectedAddOns, pricingParams]);

  const activeSector = facilitySectors.find(s => s.id === selectedSectorId) || facilitySectors[0];

  const toggleAddOn = (id: AddOnServiceId) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickSqFt = (amount: number) => {
    setSquareFootage(amount);
  };

  return (
    <section id="estimator" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3.5 shadow-sm">
          <Sliders className="w-3.5 h-3.5" />
          <span>Transparent B2B Bidding Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Instant Commercial Janitorial Rate Calculator
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Get an itemized ballpark monthly estimate for your facility in {brandConfig.primaryCity} based on cleanable square footage, ISSA production standards, and sanitization protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-8 clean-card rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* 1. Square Footage Slider & Stepper */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>1. Cleanable Facility Square Footage</span>
                <span className="text-xs font-normal text-slate-500 font-mono">
                  (ISSA 540 Standards)
                </span>
              </label>
              
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-1.5 text-blue-700 font-mono font-bold text-base shadow-sm transition-all">
                <span className="tabular-nums">{squareFootage.toLocaleString()}</span>
                <span className="text-xs text-blue-600 font-normal">sq ft</span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={1000}
              max={100000}
              step={500}
              value={squareFootage}
              onChange={(e) => setSquareFootage(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all"
            />

            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2 mt-3.5">
              {[2500, 5000, 10000, 15000, 25000, 50000].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleQuickSqFt(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer ${
                    squareFootage === size
                      ? 'bg-blue-600 text-white shadow-sm font-bold scale-[1.03]'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {size >= 1000 ? `${size / 1000}k sq ft` : `${size} sq ft`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Facility Sector Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              2. Facility Type &amp; Sanitization Sector
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facilitySectors.map((sector) => {
                const isSelected = selectedSectorId === sector.id;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => setSelectedSectorId(sector.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 shadow-md ring-2 ring-blue-600/30 translate-y-[-1px]'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {sector.name}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-bold' 
                          : 'bg-slate-200 text-slate-700 font-medium'
                      }`}>
                        {sector.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {sector.shortDesc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Service Frequency */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              3. Service Frequency Schedule
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {frequencyOptions.map((freq) => {
                const isSelected = selectedFrequencyId === freq.id;
                return (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setSelectedFrequencyId(freq.id)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-md ring-2 ring-blue-600/30 font-bold translate-y-[-1px]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs">{freq.label}</span>
                      {freq.isPopular && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">
                      {freq.sublabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Periodic Specialty Add-On Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900">
                4. Periodic Specialty Services (Optional Add-Ons)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Amortized into monthly contract
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {addOnServices.map((addOn) => {
                const isChecked = selectedAddOns.includes(addOn.id);
                return (
                  <button
                    key={addOn.id}
                    type="button"
                    onClick={() => toggleAddOn(addOn.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 border-blue-600 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white scale-105' : 'border-slate-400 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isChecked ? 'font-bold text-blue-950' : 'font-medium text-slate-800'}`}>
                          {addOn.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {addOn.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Calculated Breakdown Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          
          {/* Main Price Card */}
          <div className="clean-card-featured rounded-2xl p-6 sm:p-7 relative overflow-hidden text-white transition-all">
            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Estimated Contract Value
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

            {/* Big Numbers */}
            <div className="py-6 border-b border-slate-700/80">
              <div className="flex items-baseline gap-2">
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

            {/* CTAs */}
            <div className="pt-5 space-y-3">
              <button
                type="button"
                onClick={() => setIsWalkthroughModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Lock In Ballpark &amp; Book Walkthrough</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenProposalGenerator(estimate)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold transition-all cursor-pointer hover:scale-[1.01]"
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

      {/* Walkthrough Lead Capture Modal */}
      <WalkthroughBookingModal
        isOpen={isWalkthroughModalOpen}
        onClose={() => setIsWalkthroughModalOpen(false)}
        estimate={estimate}
        brandConfig={brandConfig}
      />
    </section>
  );
};
