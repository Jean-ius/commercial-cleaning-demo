import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  HelpCircle,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { ClientBrandConfig, EstimateResult } from '../../types/cleanCommand';
import { facilitySectors } from '../../config/clientConfig';
import { CommercialQuoteCalculator } from '../calculator/CommercialQuoteCalculator';

interface CorporateLandingProps {
  brandConfig: ClientBrandConfig;
  onOpenProposalGenerator: (estimate: EstimateResult) => void;
  onNavigateToPackages?: () => void;
}

export const CorporateLanding: React.FC<CorporateLandingProps> = ({
  brandConfig,
  onOpenProposalGenerator,
  onNavigateToPackages
}) => {
  return (
    <div className="relative space-y-20 pb-24 overflow-hidden">
      
      {/* Global Clean Grid Overlay */}
      <div className="absolute inset-0 bg-clean-grid pointer-events-none opacity-60"></div>
      
      {/* 1. High-Impact Editorial Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Soft Ambient Light Cones */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-200/40 via-sky-100/30 to-indigo-100/40 rounded-full blur-[90px] pointer-events-none -z-10"></div>

        <div className="text-center max-w-4xl mx-auto relative z-10">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700 mb-8 transition-transform hover:scale-[1.02]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Serving Commercial Facilities Across {brandConfig.primaryCity}</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-mono font-bold">{brandConfig.insuranceCoverage.split('&')[0]}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.14]">
            Corporate Janitorial &amp; Facility Sanitization Engineered for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
              Zero Disruption
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {brandConfig.companyName} delivers certified medical-grade disinfection, dedicated night supervision, and transparent square-footage pricing for commercial property managers across {brandConfig.primaryCity}.
          </p>

          {/* Direct Actions */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#estimator"
              className="flex items-center gap-2 px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Instant Square-Footage Estimator</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={`tel:${brandConfig.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2.5 px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm shadow-sm transition-all hover:border-slate-300"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Operations: {brandConfig.phone}</span>
            </a>
          </div>

          {/* Mini Trust Stats Card Grid */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl clean-card">
              <span className="block text-2xl font-extrabold text-slate-900 font-mono tracking-tight">100%</span>
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">Background Vetted Crew</span>
            </div>
            <div className="p-4 rounded-xl clean-card">
              <span className="block text-2xl font-extrabold text-slate-900 font-mono tracking-tight">&lt; 2hr</span>
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">Supervisor SLA Response</span>
            </div>
            <div className="p-4 rounded-xl clean-card">
              <span className="block text-2xl font-extrabold text-slate-900 font-mono tracking-tight">ISSA 540</span>
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">Standardized Workloading</span>
            </div>
            <div className="p-4 rounded-xl clean-card">
              <span className="block text-2xl font-extrabold text-slate-900 font-mono tracking-tight">Net-30</span>
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">Corporate Invoicing</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Facility Sectors Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Tailored Industry Protocols</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Specialized Commercial Facility Sectors
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every building operates under strict cleanliness and compliance requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilitySectors.map((sector) => (
            <div
              key={sector.id}
              className="p-6 rounded-2xl clean-card transition-all duration-200 space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  {sector.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {sector.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {sector.shortDesc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                {sector.protocols.slice(0, 2).map((prot, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{prot}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The Core Interactive Estimator Section */}
      <div className="relative">
        <CommercialQuoteCalculator
          brandConfig={brandConfig}
          onOpenProposalGenerator={onOpenProposalGenerator}
        />
      </div>

      {/* 4. Comparison Matrix: Franchise Cleaners vs CleanCommand Pro System */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The CleanCommand Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Corporate Property Managers Switch To Us
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Standard budget franchise cleaners rotate untrained contractors. We engineer a dedicated facility care system.
          </p>
        </div>

        <div className="clean-card rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-md">
          <div className="grid grid-cols-3 bg-slate-100 p-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
            <span className="text-slate-700">Operational Standard</span>
            <span className="text-rose-600 text-center">Budget Franchise Cleaners</span>
            <span className="text-blue-700 text-center">{brandConfig.companyName}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-800">Supervisor Oversight</span>
              <span className="text-slate-500 text-center flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                Unannounced / Absent
              </span>
              <span className="text-emerald-700 font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Dedicated Night Supervisor
              </span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-800">Staff Consistency</span>
              <span className="text-slate-500 text-center flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                High turnover sub-contractors
              </span>
              <span className="text-emerald-700 font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Permanent Vetted Crew
              </span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-800">Pricing Transparency</span>
              <span className="text-slate-500 text-center flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                Hidden fees &amp; arbitrary rates
              </span>
              <span className="text-emerald-700 font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Transparent ISSA Rates
              </span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-800">Insurance &amp; Liability</span>
              <span className="text-slate-500 text-center">Minimum basic coverage</span>
              <span className="text-emerald-700 font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {brandConfig.insuranceCoverage.split('&')[0]}
              </span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-800">Proposal Turnaround</span>
              <span className="text-slate-500 text-center">3 to 5 business days</span>
              <span className="text-emerald-700 font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Instant Ballpark + 24hr SOW
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Corporate FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Frequently Asked Questions for Facility Managers</span>
        </h2>

        <div className="space-y-3.5 text-xs">
          <div className="p-5 rounded-xl clean-card">
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">
              How quickly can you commence commercial service once the agreement is authorized?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Standard onboarding takes 3 to 5 business days. This allows our operations team to conduct an initial security orientation, keycard protocol setup, color-coded chemical supply placement, and dedicated crew orientation.
            </p>
          </div>

          <div className="p-5 rounded-xl clean-card">
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">
              Are your cleaning technicians directly employed and background-checked?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Yes. 100% of technicians assigned to your facility undergo nationwide background screening, 10-panel drug testing, OSHA safety training, and execute strict commercial confidentiality non-disclosure agreements.
            </p>
          </div>

          <div className="p-5 rounded-xl clean-card">
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">
              How does our facility evaluation and quote process work?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Our regional operations supervisor conducts an evaluation of your building to verify cleanable square footage, flooring compositions, high-traffic restroom banks, and key security doors. Within 24 hours, you receive your formalized Scope of Work proposal.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Bottom Banner CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900 text-center relative overflow-hidden shadow-2xl text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Standardize Your Commercial Facility Maintenance?
          </h3>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Get an instant ballpark estimate above or contact our operations team directly in {brandConfig.primaryCity}.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="#estimator"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Calculate My Building Rate
            </a>
            {onNavigateToPackages && (
              <button
                onClick={onNavigateToPackages}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                View High-Ticket Implementation Packages
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
