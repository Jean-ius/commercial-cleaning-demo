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
    const text = `COMMERCIAL CLEANING PROPOSAL — ${brandConfig.companyName}
Document ID: ${proposalData.proposalId}
Client: ${proposalData.clientName} | ${proposalData.clientCompany}
Facility: ${estimate.squareFootage.toLocaleString()} sq ft • ${sector.name}
Schedule: ${frequency.label} (${frequency.sublabel})
Monthly Rate: ${formatCurrency(estimate.totalEstimatedMonthlyInvestment)} / month ($${estimate.pricePerVisit}/visit)
Annual Value: ${formatCurrency(estimate.annualContractValue)}
Insurance: ${brandConfig.insuranceCoverage}
Guaranteed SLA: 4-hour re-clean at zero added cost.`;

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
        MASTER OFFICIAL COMMERCIAL SERVICE PROPOSAL
        100% Identical on Website and on Print Preview.
        Clean Corporate Letterhead (Blue Logo & Blue Subtitle).
        Body is 100% Crisp Pure White Paper with Solid Typography.
        ==================================================================
      */}
      <div 
        id="official-proposal-sheet"
        className="mx-auto bg-white text-slate-950 shadow-xl rounded-xl border border-slate-300 p-8 text-xs leading-normal print:shadow-none print:w-full print:m-0 flex flex-col justify-between"
        style={{ 
          width: '794px', 
          boxSizing: 'border-box',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        
        {/* UPPER BODY CONTAINER */}
        <div className="space-y-3.5">
          
          {/* 1. Header Row (Branded Logo & Subtitle) */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0 mt-0.5">
                {brandConfig.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight leading-tight">
                  {brandConfig.companyName}
                </h1>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mt-0.5">
                  Commercial Janitorial &amp; Facility Operations
                </div>
                <div className="text-xs font-medium text-slate-600 mt-0.5">
                  {brandConfig.address} • {brandConfig.phone} • {brandConfig.email}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 rounded border border-blue-300 bg-blue-50 font-mono text-xs font-bold text-blue-900 uppercase tracking-wider">
                {proposalData.proposalId}
              </span>
              <div className="text-xs font-semibold text-slate-700 mt-1.5 space-y-0.5">
                <p>Issued: <span className="text-slate-950 font-bold">{proposalData.createdDate}</span></p>
                <p>Valid Through: <span className="text-slate-950 font-bold">{proposalData.validUntilDate}</span></p>
              </div>
            </div>
          </div>

          {/* 2. Client & Property Summary Box (Pure White Crisp Box) */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg border border-slate-300 bg-white text-xs">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block mb-1">
                Client &amp; Facility Property:
              </span>
              {isEditing ? (
                <div className="space-y-1.5">
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
                  <p className="font-black text-slate-950 text-sm leading-snug">{proposalData.clientName}</p>
                  <p className="font-bold text-slate-800 text-xs leading-snug">{proposalData.clientCompany}</p>
                  <p className="font-medium text-slate-600 text-xs mt-0.5 leading-snug">{proposalData.facilityAddress}</p>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block mb-1">
                Facility Specifications:
              </span>
              <p className="font-black text-slate-950 text-sm leading-snug">
                {estimate.squareFootage.toLocaleString()} sq ft • {sector.name}
              </p>
              <p className="text-slate-900 font-bold text-xs mt-0.5 leading-snug">
                {frequency.label} ({frequency.sublabel})
              </p>
              <p className="font-medium text-slate-600 text-xs mt-0.5 leading-snug">
                {estimate.hoursPerCleaningVisit} hrs / visit • {estimate.recommendedCrewSize} Dedicated Cleaner{estimate.recommendedCrewSize > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* 3. Section 1: Master Scope of Work (Pure White Cards with Sharp Borders) */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-0.5 mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                1. Master Scope of Work &amp; Sanitization Specifications
              </h2>
              <span className="text-[10.5px] font-semibold text-slate-600">
                EPA List N Disinfection • Dual-HEPA Filtration
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-1 text-xs font-bold">
                  • Restrooms &amp; Touchpoints
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium text-[10.5px] leading-snug">
                  <li>Sanitize &amp; polish toilets, urinals, faucets, and mirrors</li>
                  <li>Restock hand soap, paper towels, and sanitary receptacles</li>
                  <li>Damp-mop hard surface tile with hospital-grade disinfectant</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-1 text-xs font-bold">
                  • Offices &amp; Workstations
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium text-[10.5px] leading-snug">
                  <li>Microfiber dust-wipe desks, computer stands, and touchpoints</li>
                  <li>Disinfect high-touch door handles, keypads, and switches</li>
                  <li>Detailed HEPA vacuuming of carpeted paths and trash removal</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-1 text-xs font-bold">
                  • Breakrooms &amp; Kitchens
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium text-[10.5px] leading-snug">
                  <li>Damp-wipe and sanitize countertops, tables, and chair frames</li>
                  <li>Clean exterior of microwaves, refrigerators, and coffee stations</li>
                  <li>Sweep, degrease, and damp-mop all hard surface kitchen floors</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-1 text-xs font-bold">
                  • Floor Care &amp; Security
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium text-[10.5px] leading-snug">
                  <li>Entrance glass smudge extraction and mat vacuuming</li>
                  <li>Auto-scrub / damp mop all main corridor hard flooring</li>
                  <li>End-of-shift building perimeter audit, light check, and arming</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Specialty Add-Ons */}
          {estimate.selectedAddOns.length > 0 && (
            <div className="p-2.5 rounded-lg border border-slate-300 bg-white flex items-center justify-between text-xs">
              <span className="font-bold text-slate-950">
                Included Periodic Specialty Services: {estimate.selectedAddOns.map(id => addOnServices.find(a => a.id === id)?.name).filter(Boolean).join(' • ')}
              </span>
              <span className="font-black text-slate-900 font-mono text-[11px]">Included in Rate</span>
            </div>
          )}

          {/* 4. Section 2: Commercial Investment Schedule (Clean Corporate Financial Table) */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-0.5 mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                2. Commercial Investment Schedule
              </h2>
              <span className="text-[10.5px] font-semibold text-slate-600">Fixed Flat-Rate Monthly Agreement</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-300 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-950 uppercase tracking-wide block">
                  Total Monthly Service Investment:
                </span>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                  Includes all labor, supervision, chemicals, dual-motor equipment, and insurance.
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                  {formatCurrency(estimate.totalEstimatedMonthlyInvestment)}
                </span>
                <span className="text-xs font-bold text-slate-800"> / month</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mt-2.5">
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white">
                <span className="block text-slate-600 text-[10px] uppercase font-bold">Rate Per Visit</span>
                <strong className="text-slate-950 font-mono text-xs font-black">{formatCurrency(estimate.pricePerVisit)}</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white">
                <span className="block text-slate-600 text-[10px] uppercase font-bold">Monthly Frequency</span>
                <strong className="text-slate-950 font-mono text-xs font-black">{estimate.cleaningVisitsPerMonth} Visits / mo</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white">
                <span className="block text-slate-600 text-[10px] uppercase font-bold">Annual Contract Value</span>
                <strong className="text-slate-950 font-mono text-xs font-black">{formatCurrency(estimate.annualContractValue)}</strong>
              </div>
            </div>
          </div>

          {/* 5. Section 3: Commercial Service Terms */}
          <div className="border-t border-slate-200 pt-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5">
              3. Commercial Service Terms &amp; Quality Commitments
            </h2>
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-700 font-medium">
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-0.5 font-bold text-xs">1. Quality SLA</strong>
                <span className="leading-snug text-[10.5px] text-slate-700">If any area is unsatisfactory, we re-clean within 4 hours at zero added cost.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-0.5 font-bold text-xs">2. Insurance &amp; Bonding</strong>
                <span className="leading-snug text-[10.5px] text-slate-700">{brandConfig.insuranceCoverage}. Certificate of Insurance (COI) provided upon execution.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white">
                <strong className="text-slate-950 block mb-0.5 font-bold text-xs">3. Terms &amp; Invoicing</strong>
                <span className="leading-snug text-[10.5px] text-slate-700">Invoiced monthly on Net-30 terms. 12-month standard term with mutual 30-day flexibility.</span>
              </div>
            </div>
          </div>

        </div>

        {/* 
          6. DUAL SIGNATURE AUTHORIZATION BLOCK (Identical on Website & Print)
        */}
        <div className="grid grid-cols-2 gap-4 pt-3.5 border-t-2 border-slate-900 text-xs mt-3.5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          
          {/* Service Provider Signature Box */}
          <div className="p-3 rounded-lg border border-slate-300 bg-white flex flex-col justify-between" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-700 tracking-wider block mb-1.5">
                Authorized Provider ({brandConfig.companyName}):
              </span>

              <div className="h-12 border-b-2 border-slate-900 flex items-end pb-1 px-1">
                <span className="text-slate-400 font-mono text-xs select-none">
                  X _____________________________________________
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-950 font-bold">
              {isEditing ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={repSignerName}
                    onChange={(e) => setRepSignerName(e.target.value)}
                    className="w-1/2 text-[11px] p-1 border border-slate-300 rounded bg-white"
                    placeholder="Signer Name"
                  />
                  <input
                    type="text"
                    value={repSignerTitle}
                    onChange={(e) => setRepSignerTitle(e.target.value)}
                    className="w-1/2 text-[11px] p-1 border border-slate-300 rounded bg-white"
                    placeholder="Title"
                  />
                </div>
              ) : (
                <>
                  <span>{repSignerName} ({repSignerTitle})</span>
                  <span className="font-mono text-slate-600 font-semibold">{proposalData.createdDate}</span>
                </>
              )}
            </div>
          </div>

          {/* Client Acceptance Signature Box */}
          <div className="p-3 rounded-lg border border-slate-300 bg-white flex flex-col justify-between" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-700 tracking-wider block mb-1.5">
                Authorized Client Acceptance ({proposalData.clientCompany}):
              </span>

              <div className="h-12 border-b-2 border-slate-900 flex items-end pb-1 px-1">
                <span className="text-slate-400 font-mono text-xs select-none">
                  X _____________________________________________
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-950 font-bold">
              {isEditing ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={clientSignerName}
                    onChange={(e) => setClientSignerName(e.target.value)}
                    className="w-1/2 text-[11px] p-1 border border-slate-300 rounded bg-white"
                    placeholder="Client Signer Name"
                  />
                  <input
                    type="text"
                    value={clientSignerTitle}
                    onChange={(e) => setClientSignerTitle(e.target.value)}
                    className="w-1/2 text-[11px] p-1 border border-slate-300 rounded bg-white"
                    placeholder="Title"
                  />
                </div>
              ) : (
                <>
                  <span>{clientSignerName || proposalData.clientName} ({clientSignerTitle})</span>
                  <span className="font-mono text-slate-600 font-semibold">Date: ____________</span>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
