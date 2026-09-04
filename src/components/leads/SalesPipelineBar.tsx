import React from 'react';
import { LeadRecord, LeadStatus } from '../../types/cleanCommand';
import { 
  CircleDot, 
  PhoneCall, 
  Calculator, 
  FileCheck, 
  Handshake, 
  Award, 
  XCircle 
} from 'lucide-react';

interface SalesPipelineBarProps {
  activeLead: LeadRecord | null;
  leads: LeadRecord[];
  onStatusChange: (newStatus: LeadStatus) => void;
}

const PIPELINE_STAGES: { id: LeadStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'New', label: 'New Lead', icon: CircleDot },
  { id: 'Contacted', label: 'Contacted', icon: PhoneCall },
  { id: 'Estimating', label: 'Estimating', icon: Calculator },
  { id: 'Quoted', label: 'Quoted', icon: FileCheck },
  { id: 'Negotiation', label: 'Negotiation', icon: Handshake },
  { id: 'Won', label: 'Closed Won', icon: Award },
  { id: 'Lost', label: 'Closed Lost', icon: XCircle }
];

export const SalesPipelineBar: React.FC<SalesPipelineBarProps> = ({
  activeLead,
  leads,
  onStatusChange
}) => {
  // Compute counts per stage
  const counts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sales Pipeline Progression
          </span>
          {activeLead && (
            <span className="ml-2 text-xs text-blue-700 font-semibold">
              (Active: {activeLead.companyName} • {activeLead.leadId})
            </span>
          )}
        </div>
        {activeLead && (
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              Current Stage:{' '}
              <span className="font-bold text-blue-700">
                {activeLead.status}
              </span>
            </span>
            <span>•</span>
            <span>
              Estimated Value:{' '}
              <span className="font-bold text-emerald-700 font-mono">
                ${(activeLead.estimatedValue || activeLead.annualContractValue || 0).toLocaleString()}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Stage Flow Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isCurrent = activeLead?.status === stage.id;
          const stageCount = counts[stage.id] || 0;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onStatusChange(stage.id)}
              disabled={!activeLead}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 ring-2 ring-blue-500/30'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
              } ${!activeLead ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{stage.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  isCurrent
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {stageCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
