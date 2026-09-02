import React, { useState } from 'react';
import { Video, ChevronDown, ChevronUp, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { ClientBrandConfig } from '../../types/cleanCommand';

interface LoomPitchToolbarProps {
  brandConfig: ClientBrandConfig;
  onUpdateBrand: (updated: Partial<ClientBrandConfig>) => void;
  onResetDefaults: () => void;
}

export const LoomPitchToolbar: React.FC<LoomPitchToolbarProps> = ({
  brandConfig,
  onUpdateBrand,
  onResetDefaults
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);

  const presets: { name: string; city: string; phone: string; color: string; areas: string[] }[] = [
    {
      name: "Apex Commercial Cleaning",
      city: "Dallas, TX",
      phone: "(214) 555-0192",
      color: "#2563EB",
      areas: ["Downtown Dallas", "Plano", "Frisco", "Irving", "Fort Worth"]
    },
    {
      name: "Vanguard Janitorial Group",
      city: "Atlanta, GA",
      phone: "(404) 555-8391",
      color: "#059669", // Emerald Corporate
      areas: ["Buckhead", "Midtown Atlanta", "Alpharetta", "Perimeter Center"]
    },
    {
      name: "Sterling Facility Solutions",
      city: "Sydney, NSW",
      phone: "+61 2 8999 4410",
      color: "#D97706", // Amber Gold
      areas: ["Sydney CBD", "North Sydney", "Parramatta", "Macquarie Park"]
    },
    {
      name: "MetroCare Commercial Services",
      city: "Chicago, IL",
      phone: "(312) 555-3920",
      color: "#7C3AED", // Violet Corporate
      areas: ["The Loop", "Fulton Market", "River North", "O'Hare Corridor"]
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    onUpdateBrand({
      companyName: preset.name,
      primaryCity: preset.city,
      phone: preset.phone,
      primaryAccentColor: preset.color,
      serviceAreas: preset.areas,
      email: `contracts@${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    });
  };

  if (isRecordingMode) {
    return (
      <div className="fixed top-3 right-3 z-50 animate-fade-in">
        <button
          onClick={() => setIsRecordingMode(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300 hover:text-white backdrop-blur-md shadow-2xl transition-all"
          title="Exit Stealth Recording Mode"
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono">Loom Demo Mode</span>
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Loom Pitch Mode Toolbar" className="bg-[#0B132B] border-b border-blue-900/40 text-slate-200 text-xs px-4 py-2.5 shadow-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Badge & Context */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold tracking-wide uppercase text-[10px]">
            <Video className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Loom Sales Pitch Mode</span>
          </div>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Personalize this live demo for your 60-second video audit in &lt; 1 minute:
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Presets */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider mr-1">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  brandConfig.companyName === p.name
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {p.city.split(',')[0]}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

          {/* Stealth Hide Toolbar */}
          <button
            onClick={() => setIsRecordingMode(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            title="Hide toolbar for clean video recording"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Hide for Video</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetDefaults}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title="Reset to Default Client Configuration"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Live Input Form */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 animate-slide-up">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Prospect Business Name
            </label>
            <input
              type="text"
              value={brandConfig.companyName}
              onChange={(e) => onUpdateBrand({ companyName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Acme Commercial Clean"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Target City / Metro
            </label>
            <input
              type="text"
              value={brandConfig.primaryCity}
              onChange={(e) => onUpdateBrand({ primaryCity: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Phoenix, AZ"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Direct Phone Number
            </label>
            <input
              type="text"
              value={brandConfig.phone}
              onChange={(e) => onUpdateBrand({ phone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. (602) 555-0199"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Contract Inquiries Email
            </label>
            <input
              type="email"
              value={brandConfig.email}
              onChange={(e) => onUpdateBrand({ email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. bids@client.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Brand Accent Tone
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brandConfig.primaryAccentColor}
                onChange={(e) => onUpdateBrand({ primaryAccentColor: e.target.value })}
                className="w-8 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-300 uppercase">
                {brandConfig.primaryAccentColor}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
