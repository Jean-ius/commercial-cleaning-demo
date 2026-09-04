import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Code, 
  Copy, 
  Check, 
  Layers, 
  ServerOff
} from 'lucide-react';
import { googleAppsScriptTemplate } from '../../data/googleAppsScriptCode';

interface PackagesViewProps {
  onSelectPackage?: (pkgName: string) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({ onSelectPackage }) => {
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptTemplate);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 relative z-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3.5 shadow-sm">
          <Layers className="w-3.5 h-3.5" />
          <span>Productized High-Ticket System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          CleanCommand Pro Implementation Packages
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Turnkey sales, estimating, and proposal infrastructure deployed directly into your commercial cleaning business. Zero SaaS subscriptions required to remain fully operational.
        </p>
      </div>

      {/* Package Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* PACKAGE 1 */}
        <div className="p-6 rounded-2xl clean-card flex flex-col justify-between transition-all duration-200">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 uppercase tracking-wider">
              Package 1 • Entry System
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Quote &amp; Proposal System
            </h3>
            <p className="text-xs text-slate-600 mt-1 min-h-[36px]">
              For established cleaners with an existing website who need standardized quoting and fast proposal generation.
            </p>

            <div className="my-5 pb-5 border-b border-slate-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                $1,200
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">One-time implementation</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Embeddable Quote Calculator Widget</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Professional Corporate Proposal Generator</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Google Sheets CRM Webhook Setup</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Client Pricing Rules &amp; Labor Rates Config</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-3 font-medium">
              Optional Managed Support: <strong className="text-slate-800">$99/mo</strong>
            </span>
            <button
              onClick={() => onSelectPackage && onSelectPackage('Package 1')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-semibold transition-colors"
            >
              Select Package 1
            </button>
          </div>
        </div>

        {/* PACKAGE 2 - PRIMARY OFFER */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-900 to-slate-900 border-2 border-blue-500 text-white flex flex-col justify-between shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            ⭐ Flagship / Primary Offer
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 uppercase tracking-wider">
              Package 2 • Complete Funnel
            </span>
            <h3 className="text-lg font-bold text-white mt-2">
              Commercial Lead Gen System
            </h3>
            <p className="text-xs text-blue-200/90 mt-1 min-h-[36px]">
              Full standalone sales system: high-converting corporate website, live estimator, and automated lead capture.
            </p>

            <div className="my-5 pb-5 border-b border-blue-800/80">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                $2,400
              </span>
              <span className="text-xs text-blue-200 block mt-0.5">One-time turnkey deployment</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Everything in Package 1</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Corporate Cleaning Authority Website</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>5 Sector Landing Pages (Medical, Office, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sales Pipeline &amp; New Lead Capture System</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Google Business Profile Optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Full Independent Deployment (Zero DB fees)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-800/80">
            <span className="text-[11px] text-blue-200 block mb-3">
              Optional Managed Care: <strong>$149/mo</strong>
            </span>
            <button
              onClick={() => onSelectPackage && onSelectPackage('Package 2')}
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-lg shadow-blue-500/40 transition-all cursor-pointer"
            >
              Select Primary Package
            </button>
          </div>
        </div>

        {/* PACKAGE 3 - PREMIUM UPSELL */}
        <div className="p-6 rounded-2xl clean-card flex flex-col justify-between transition-all duration-200">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase tracking-wider">
              Package 3 • Sales Machine
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Complete Sales System
            </h3>
            <p className="text-xs text-slate-600 mt-1 min-h-[36px]">
              For operators scaling to $30k–$100k/mo needing advanced multi-sector bidding and sales workflow onboarding.
            </p>

            <div className="my-5 pb-5 border-b border-slate-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                $3,800
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">One-time implementation</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Everything in Package 2</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Multi-Sector Custom Bidding Rules</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Digital Quality Audit Inspection Scorekeeper</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>5-Step Automated Quote Nurture Sequences</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>1-on-1 Sales Closing Process Training</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-3 font-medium">
              Optional Growth Retainer: <strong className="text-slate-800">$199/mo</strong>
            </span>
            <button
              onClick={() => onSelectPackage && onSelectPackage('Package 3')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-semibold transition-colors"
            >
              Select Package 3
            </button>
          </div>
        </div>

        {/* PACKAGE 4 - CUSTOM GROWTH */}
        <div className="p-6 rounded-2xl clean-card flex flex-col justify-between transition-all duration-200">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 uppercase tracking-wider">
              Package 4 • Multi-City
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Custom Growth System
            </h3>
            <p className="text-xs text-slate-600 mt-1 min-h-[36px]">
              Multi-city regional expansion with custom target account research and video proposal presentation architecture.
            </p>

            <div className="my-5 pb-5 border-b border-slate-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                $5,200+
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">Custom enterprise setup</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Everything in Package 3</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Multi-City Local Service Landing Pages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Target Account Research &amp; Prospecting Setup</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Video Proposal Presentation Landing Page</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Dedicated Conversion Optimization &amp; Review</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-3 font-medium">
              Optional Scale Retainer: <strong className="text-slate-800">$299/mo</strong>
            </span>
            <button
              onClick={() => onSelectPackage && onSelectPackage('Package 4')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-semibold transition-colors"
            >
              Select Package 4
            </button>
          </div>
        </div>

      </div>

      {/* Developer & Implementation Deployment Hub */}
      <div className="p-6 sm:p-8 rounded-2xl clean-card bg-blue-50/50 border-blue-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <ServerOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Zero-Database Client Architecture
              </h3>
              <p className="text-xs text-slate-600">
                Each client owns their private Google Sheet CRM. You maintain zero ongoing database infrastructure costs.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowScriptModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Code className="w-4 h-4 text-blue-600" />
            <span>View Google Apps Script Code</span>
          </button>
        </div>
      </div>

      {/* Google Apps Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Google Apps Script (Code.gs) Deployment Template
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={() => setShowScriptModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 bg-slate-900 text-slate-200">
              <pre className="whitespace-pre-wrap">{googleAppsScriptTemplate}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
