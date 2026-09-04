import React from 'react';
import { LeadRecord, LeadStatus } from '../../types/cleanCommand';
import { 
  CheckCircle2, 
  CircleDot, 
  FileCheck, 
  Award, 
  XCircle,
  Calendar
} from 'lucide-react';

interface SalesPipelineBarProps {
  activeLead: LeadRecord | null;
  leads: LeadRecord[];
  onStatusChange: (newStatus: LeadStatus) => void;
}

const PIPELINE_STAGES: { id: LeadStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'NEW', label: 'New Lead', icon: CircleDot },
  { id: 'QUALIFIED', label: 'Qualified', icon: CheckCircle2 },
  { id: 'WALKTHROUGH', label: 'Walkthrough', icon: Calendar },
  { id: 'PROPOSAL', label: 'Proposal', icon: FileCheck },
  { id: 'WON', label: 'Won / Contract', icon: Award },
  { id: 'LOST', label: 'Closed / Lost', icon: XCircle }
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
              Walkthrough Status:{' '}
              <span className={`font-bold ${
                activeLead.walkthroughStatus === 'COMPLETED' ? 'text-emerald-700' :
                activeLead.walkthroughStatus === 'SCHEDULED' ? 'text-amber-700' : 'text-slate-500'
              }`}>
                {activeLead.walkthroughStatus}
              </span>
            </span>
            <span>•</span>
            <span>
              Proposal Status:{' '}
              <span className={`font-bold ${
                activeLead.proposalStatus === 'ACCEPTED' ? 'text-emerald-700' :
                activeLead.proposalStatus === 'SENT' ? 'text-blue-700' :
                activeLead.proposalStatus === 'GENERATED' ? 'text-indigo-700' : 'text-slate-500'
              }`}>
                {activeLead.proposalStatus}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Stage Flow Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
