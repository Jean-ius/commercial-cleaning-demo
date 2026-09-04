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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg shadow-black/40">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sales Pipeline Progression
          </span>
          {activeLead && (
            <span className="ml-2 text-xs text-blue-400 font-medium">
              (Active: {activeLead.companyName} • {activeLead.leadId})
            </span>
          )}
        </div>
        {activeLead && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Walkthrough Status:{' '}
              <span className={`font-semibold ${
                activeLead.walkthroughStatus === 'COMPLETED' ? 'text-emerald-400' :
                activeLead.walkthroughStatus === 'SCHEDULED' ? 'text-amber-400' : 'text-slate-500'
              }`}>
                {activeLead.walkthroughStatus}
              </span>
            </span>
            <span>•</span>
            <span>
              Proposal Status:{' '}
              <span className={`font-semibold ${
                activeLead.proposalStatus === 'ACCEPTED' ? 'text-emerald-400' :
                activeLead.proposalStatus === 'GENERATED' || activeLead.proposalStatus === 'SENT' ? 'text-blue-400' : 'text-slate-500'
              }`}>
                {activeLead.proposalStatus}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Interactive Stages Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isCurrent = activeLead?.status === stage.id;
          const count = counts[stage.id] || 0;

          let badgeColor = "bg-slate-800/80 text-slate-400 hover:bg-slate-800 border-slate-800";
          if (isCurrent) {
            if (stage.id === 'WON') {
              badgeColor = "bg-emerald-900/60 text-emerald-200 border-emerald-500/50 ring-2 ring-emerald-500/30";
            } else if (stage.id === 'LOST') {
              badgeColor = "bg-rose-900/60 text-rose-200 border-rose-500/50 ring-2 ring-rose-500/30";
            } else {
              badgeColor = "bg-blue-900/60 text-blue-200 border-blue-500/50 ring-2 ring-blue-500/30";
            }
          }

          return (
            <button
              key={stage.id}
              type="button"
              disabled={!activeLead}
              onClick={() => onStatusChange(stage.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${badgeColor} ${
                activeLead ? 'cursor-pointer hover:border-slate-600' : 'opacity-70 cursor-default'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs font-medium truncate">{stage.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                isCurrent ? 'bg-white/20 text-white' : 'bg-slate-700/80 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
