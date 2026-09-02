import React, { useState } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Edit3, 
  Save, 
  Copy, 
  Check 
} from 'lucide-react';
import { EstimateResult, ClientBrandConfig, ProposalData } from '../../types/cleanCommand';
import { facilitySectors, frequencyOptions, addOnServices } from '../../config/clientConfig';
import { formatCurrency } from '../../utils/pricingEngine';

interface CommercialProposalGeneratorProps {
  estimate: EstimateResult;
  brandConfig: ClientBrandConfig;
  onBack: () => void;
}

export const CommercialProposalGenerator: React.FC<CommercialProposalGeneratorProps> = ({
  estimate,
  brandConfig,
  onBack
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Proposal Signer Information (Editable)
  const [repSignerName, setRepSignerName] = useState<string>('Marcus Sterling');
  const [repSignerTitle, setRepSignerTitle] = useState<string>('Director of Operations');

  const [clientSignerName, setClientSignerName] = useState<string>('David Vance');
  const [clientSignerTitle, setClientSignerTitle] = useState<string>('Director of Facilities');

  // Proposal Metadata
  const [proposalData, setProposalData] = useState<ProposalData>(() => {
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 30);

    return {
      proposalId: `PROP-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      validUntilDate: validUntil.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      clientName: 'David Vance',
      clientCompany: 'Commercial Facility Client',
      clientEmail: 'facilities@clientcompany.com',
      clientPhone: '(555) 234-5678',
      facilityAddress: `1200 Commerce Blvd, Suite 400, ${brandConfig.primaryCity}`,
      estimate
    };
  });

  const sector = facilitySectors.find(s => s.id === estimate.sectorId) || facilitySectors[0];
  const frequency = frequencyOptions.find(f => f.id === estimate.frequencyId) || frequencyOptions[1];

  const handleCopyEmailSummary = () => {
    const text = `COMMERCIAL CLEANING SERVICE PROPOSAL
Service Provider: ${brandConfig.companyName}
Reference ID: ${proposalData.proposalId}
Prepared For: ${proposalData.clientName} | ${proposalData.clientCompany}
Facility: ${estimate.squareFootage.toLocaleString()} sq ft • ${sector.name}
Schedule: ${frequency.label} (${frequency.sublabel})
Monthly Investment: ${formatCurrency(estimate.totalEstimatedMonthlyInvestment)} / month ($${estimate.pricePerVisit} / visit)
Annual Contract Value: ${formatCurrency(estimate.annualContractValue)}
Insurance & Compliance: ${brandConfig.insuranceCoverage}
Guaranteed SLA: ${brandConfig.qualitySla || '4-Hour Prompt Re-Clean Guarantee'}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8 text-slate-900 selection:bg-blue-600 selection:text-white print:bg-white print:p-0 print:m-0 print:min-h-0">
      
      {/* Top Action Toolbar (Hidden on Print) */}
      <div className="max-w-[794px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Estimator</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyEmailSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            {isEditing ? <Save className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-blue-600" />}
            <span>{isEditing ? 'Done' : 'Edit Info'}</span>
          </button>

          {/* UNIFIED NATIVE PRINT & SAVE AS PDF BUTTON */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* 
        ==================================================================
        EXECUTIVE COMMERCIAL CLEANING SERVICE PROPOSAL
        1-Page A4 Precision Layout (210mm x 297mm / 794px x 1123px).
        Strict Visual Parity between Screen Preview, Browser Print & Saved PDF.
        ==================================================================
      */}
      <div 
        id="official-proposal-sheet"
        className="mx-auto bg-white text-slate-900 shadow-2xl rounded-xl border border-slate-200 p-8 sm:p-10 text-xs leading-normal flex flex-col justify-between"
        style={{ 
          width: '794px', 
          minHeight: '1123px',
          boxSizing: 'border-box',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        
        {/* ================= UPPER & MIDDLE PROPOSAL BODY ================= */}
        <div className="space-y-4">
          
          {/* 1. Header: Elegant Corporate Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            {/* Company Info */}
            <div className="flex items-start gap-3">
              <div 
                className="w-11 h-11 rounded-lg text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0 mt-0.5"
                style={{ backgroundColor: brandConfig.primaryAccentColor || '#2563EB' }}
              >
                {brandConfig.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none">
                  {brandConfig.companyName}
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mt-1">
                  Commercial Janitorial &amp; Facility Operations
                </p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  {brandConfig.address} • {brandConfig.phone} • {brandConfig.email}
                </p>
              </div>
            </div>

            {/* Proposal Title & Metadata */}
            <div className="text-right shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950 block">
                Commercial Cleaning Proposal
              </span>
              <p className="text-[11px] font-mono font-bold text-slate-700 mt-0.5">
                Ref: {proposalData.proposalId}
              </p>
              <div className="text-[10.5px] text-slate-500 mt-1 space-y-0.5">
                <p>Issued: <strong className="text-slate-900 font-semibold">{proposalData.createdDate}</strong></p>
                <p>Valid Through: <strong className="text-slate-900 font-semibold">{proposalData.validUntilDate}</strong></p>
              </div>
            </div>
          </div>

          {/* 2. Prepared For / Facility Overview (Clean Structured Two-Column Layout) */}
          <div className="grid grid-cols-12 gap-6 border-b border-slate-200 pb-3 text-xs">
            {/* Left: Client Details */}
            <div className="col-span-6 space-y-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Prepared For
              </span>
              {isEditing ? (
                <div className="space-y-1.5 pr-4">
                  <input
                    type="text"
                    value={proposalData.clientName}
                    onChange={(e) => setProposalData({ ...proposalData, clientName: e.target.value })}
                    className="w-full text-xs font-bold p-1 border border-slate-300 rounded bg-white text-slate-950"
                    placeholder="Contact Name"
                  />
                  <input
                    type="text"
                    value={proposalData.clientCompany}
                    onChange={(e) => setProposalData({ ...proposalData, clientCompany: e.target.value })}
                    className="w-full text-xs font-bold p-1 border border-slate-300 rounded bg-white text-slate-950"
                    placeholder="Company Name"
                  />
                  <input
                    type="text"
                    value={proposalData.facilityAddress}
                    onChange={(e) => setProposalData({ ...proposalData, facilityAddress: e.target.value })}
                    className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-slate-950"
                    placeholder="Facility Address"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-black text-slate-950 leading-snug">
                    {proposalData.clientName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 leading-snug">
                    {proposalData.clientCompany}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {proposalData.facilityAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Facility Overview (Primary Specs Dominant, Production Secondary) */}
            <div className="col-span-6 space-y-1 pl-2 border-l border-slate-100">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Facility Overview
              </span>
              <div className="space-y-0.5 text-xs">
                <p className="text-slate-900 font-bold">
                  {estimate.squareFootage.toLocaleString()} sq ft <span className="font-normal text-slate-400">•</span> {sector.name}
                </p>
                <p className="text-slate-700 font-medium text-[11px]">
                  Cleaning Schedule: <strong className="text-slate-900 font-semibold">{frequency.label}</strong> ({frequency.sublabel})
                </p>
                <p className="text-slate-400 text-[10px] pt-0.5">
                  Staffing Benchmark: {estimate.hoursPerCleaningVisit} hrs / visit • {estimate.recommendedCrewSize} Dedicated Cleaner{estimate.recommendedCrewSize > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Scope of Services (Clean Editorial 4-Pillar Layout - Configurable Standards) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                Scope of Services
              </h2>
              {brandConfig.industryStandards ? (
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  {brandConfig.industryStandards}
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Restrooms &amp; Common Areas</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                  Daily touchpoint disinfection, fixture sanitization &amp; polishing, consumable restocking, and bacteriological damp mopping.
                </p>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Offices &amp; Workspaces</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                  Microfiber dusting of workstations, conference room glass detailing, high-touch handle sanitization, and HEPA carpet vacuuming.
                </p>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Breakrooms &amp; Kitchens</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                  Countertop sanitation, exterior appliance degreasing, sink deep scrubbing, dining table disinfection, and hard floor mopping.
                </p>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Floor Care &amp; Security Protocol</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                  Corridor auto-scrubbing, entrance mat vacuuming, waste stream diversion, and end-of-shift facility perimeter security arming.
                </p>
              </div>
            </div>

            {/* Periodic Specialty Services (Compact Single Row) */}
            {estimate.selectedAddOns.length > 0 && (
              <div className="pt-1.5 pb-1 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-[11px] text-slate-700">
                  <strong className="text-slate-950 font-bold uppercase text-[10px] tracking-wider mr-1.5">Included Periodic Services:</strong>
                  {estimate.selectedAddOns.map(id => addOnServices.find(a => a.id === id)?.name).filter(Boolean).join(' • ')}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                  Included in Monthly Rate
                </span>
              </div>
            )}
          </div>

          {/* 4. Service Investment (The Visual Centerpiece of the Proposal) */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                Service Investment
              </h2>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">
                Fixed Flat-Rate Commercial Agreement
              </span>
            </div>

            {/* Highlight Pricing Banner */}
            <div className="bg-slate-50 border-y-2 border-slate-900 py-3 px-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                  Monthly Service Investment
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  All-inclusive: labor, dedicated night supervision, chemicals, dual-motor equipment &amp; insurance.
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                  {formatCurrency(estimate.totalEstimatedMonthlyInvestment)}
                </span>
                <span className="text-xs font-bold text-slate-700"> / month</span>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-1 text-center text-xs">
              <div className="py-1 border-r border-slate-200">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Rate Per Visit</span>
                <strong className="text-slate-950 font-mono text-sm font-black">{formatCurrency(estimate.pricePerVisit)}</strong>
              </div>
              <div className="py-1 border-r border-slate-200">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Monthly Visits</span>
                <strong className="text-slate-950 font-mono text-sm font-black">{estimate.cleaningVisitsPerMonth} Visits / mo</strong>
              </div>
              <div className="py-1">
                <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Annual Contract Value</span>
                <strong className="text-slate-950 font-mono text-sm font-black">{formatCurrency(estimate.annualContractValue)}</strong>
              </div>
            </div>
          </div>

          {/* 5. Service Commitments (Clean 3-Column Executive Summary) */}
          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
              Service Commitments
            </h2>
            <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="space-y-0.5">
                <strong className="text-slate-950 block text-[11px] font-bold">1. Quality SLA Guarantee</strong>
                <p className="text-[10.5px] text-slate-600 leading-snug">
                  {brandConfig.qualitySla || '4-hour prompt re-clean response at zero added charge if any area is unsatisfactory.'}
                </p>
              </div>
              <div className="space-y-0.5">
                <strong className="text-slate-950 block text-[11px] font-bold">2. Insurance &amp; Bonding</strong>
                <p className="text-[10.5px] text-slate-600 leading-snug">
                  {brandConfig.insuranceCoverage}. Formal COI issued upon agreement authorization.
                </p>
              </div>
              <div className="space-y-0.5">
                <strong className="text-slate-950 block text-[11px] font-bold">3. Terms &amp; Invoicing</strong>
                <p className="text-[10.5px] text-slate-600 leading-snug">
                  {brandConfig.paymentTerms || 'Invoiced monthly on Net-30 terms. 12-month standard term with 30-day mutual flexibility.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ================= LOWER SIGNATURE & FOOTER BLOCK ================= */}
        <div className="pt-4 border-t-2 border-slate-900 text-xs space-y-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          
          <div className="grid grid-cols-2 gap-8">
            
            {/* Service Provider Signature Column */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-700 tracking-wider block">
                Authorized Service Provider ({brandConfig.companyName}):
              </span>

              {/* Clean signature line providing adequate room for signing */}
              <div className="h-10 border-b border-slate-900"></div>

              <div className="text-[11px] text-slate-900 pt-0.5">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={repSignerName}
                      onChange={(e) => setRepSignerName(e.target.value)}
                      className="w-1/2 text-xs p-1 border border-slate-300 rounded bg-white font-bold"
                      placeholder="Signer Name"
                    />
                    <input
                      type="text"
                      value={repSignerTitle}
                      onChange={(e) => setRepSignerTitle(e.target.value)}
                      className="w-1/2 text-xs p-1 border border-slate-300 rounded bg-white"
                      placeholder="Title"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span><strong className="font-bold text-slate-950">{repSignerName}</strong>, {repSignerTitle}</span>
                    <span className="font-mono text-slate-500 text-[10px]">{proposalData.createdDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Acceptance Signature Column */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-700 tracking-wider block">
                Authorized Client Acceptance ({proposalData.clientCompany}):
              </span>

              {/* Clean signature line providing adequate room for signing */}
              <div className="h-10 border-b border-slate-900"></div>

              <div className="text-[11px] text-slate-900 pt-0.5">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clientSignerName}
                      onChange={(e) => setClientSignerName(e.target.value)}
                      className="w-1/2 text-xs p-1 border border-slate-300 rounded bg-white font-bold"
                      placeholder="Client Signer Name"
                    />
                    <input
                      type="text"
                      value={clientSignerTitle}
                      onChange={(e) => setClientSignerTitle(e.target.value)}
                      className="w-1/2 text-xs p-1 border border-slate-300 rounded bg-white"
                      placeholder="Title"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span><strong className="font-bold text-slate-950">{clientSignerName || proposalData.clientName}</strong>, {clientSignerTitle}</span>
                    <span className="font-mono text-slate-500 text-[10px]">Date: ____________</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Subtle Balanced Footer */}
          <div className="pt-2 text-center text-[10.5px] text-slate-400">
            {brandConfig.companyName} • License #{brandConfig.licenseNumber} • Serving {brandConfig.primaryCity}
          </div>

        </div>

      </div>

    </div>
  );
};
