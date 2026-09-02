import React from 'react';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';
import { ClientBrandConfig } from '../types/cleanCommand';

interface FooterProps {
  brandConfig: ClientBrandConfig;
  onNavigate: (view: 'landing' | 'proposal' | 'packages') => void;
}

export const Footer: React.FC<FooterProps> = ({ brandConfig, onNavigate }) => {
  return (
    <footer className="bg-[#060A14] border-t border-slate-800/80 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {brandConfig.companyName.charAt(0)}
            </div>
            <span className="font-extrabold text-white text-base">
              {brandConfig.companyName}
            </span>
          </div>
          <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
            {brandConfig.tagline}
          </p>
          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{brandConfig.insuranceCoverage}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>License #{brandConfig.licenseNumber} • Serving {brandConfig.primaryCity}</span>
            </p>
          </div>
        </div>

        {/* Service Areas */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
            Service Districts
          </h4>
          <ul className="space-y-1.5 text-slate-400 text-xs">
            {brandConfig.serviceAreas.map((area, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Nav */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
            System &amp; Operations
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#estimator" className="hover:text-white transition-colors">
                Commercial Rate Estimator
              </a>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('packages')}
                className="hover:text-white transition-colors text-left"
              >
                Implementation Packages
              </button>
            </li>
            <li>
              <a href={`mailto:${brandConfig.email}`} className="hover:text-white transition-colors">
                Contract Inquiries ({brandConfig.email})
              </a>
            </li>
            <li>
              <a href={`tel:${brandConfig.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                Dispatch Phone ({brandConfig.phone})
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 text-center text-slate-500 text-[11px]">
        <p>
          © {new Date().getFullYear()} {brandConfig.companyName}. All commercial rights reserved. CleanCommand Pro Sales &amp; Bidding Infrastructure.
        </p>
      </div>
    </footer>
  );
};
