import React, { useState } from 'react';
import { 
  LeadRecord, 
  LeadStatus, 
  ClientBrandConfig 
} from '../../types/cleanCommand';
import { SalesPipelineBar } from './SalesPipelineBar';
import { 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  FileText, 
  Sliders, 
  User
} from 'lucide-react';
import { formatCurrency } from '../../utils/pricingEngine';
import { facilitySectors } from '../../config/clientConfig';

interface SalesDashboardProps {
  leads: LeadRecord[];
  activeLead: LeadRecord | null;
  brandConfig: ClientBrandConfig;
  onSelectLead: (lead: LeadRecord) => void;
  onOpenNewLeadModal: () => void;
  onOpenWalkthroughModal: (lead: LeadRecord) => void;
  onOpenEstimatorForLead: (lead: LeadRecord) => void;
  onOpenProposalForLead: (lead: LeadRecord) => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  leads,
  activeLead,
  brandConfig,
  onSelectLead,
  onOpenNewLeadModal,
  onOpenWalkthroughModal,
  onOpenEstimatorForLead,
  onOpenProposalForLead,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-950/60 text-blue-300 border-blue-800';
      case 'QUALIFIED':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800';
      case 'WALKTHROUGH':
        return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'PROPOSAL':
        return 'bg-purple-950/60 text-purple-300 border-purple-800';
      case 'WON':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'LOST':
        return 'bg-rose-950/60 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSectorName = (sectorId: string) => {
    const s = facilitySectors.find(item => item.id === sectorId);
    return s ? s.name : sectorId;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Internal Commercial Sales Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sales Opportunities &amp; Estimating CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Canonical LeadRecord management, instant square-footage bidding, and Google Sheets synchronization across {brandConfig.primaryCity}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Summary Bar */}
      <SalesPipelineBar
        activeLead={activeLead}
        leads={leads}
        onStatusChange={(newStatus) => {
          if (activeLead) {
            onUpdateStatus(activeLead.leadId, newStatus);
          }
        }}
      />

      {/* Active Lead Highlight Banner (if selected) */}
      {activeLead && (
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                {activeLead.leadId}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {activeLead.companyName}
              </h3>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(activeLead.status)}`}>
                {activeLead.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3 pt-1">
              <span>Contact: <strong className="text-white">{activeLead.fullName || 'Not specified'}</strong></span>
              <span>•</span>
              <span>Facility: <strong className="text-white">{getSectorName(activeLead.facilityType)}</strong> ({activeLead.squareFootage.toLocaleString()} sq ft)</span>
              <span>•</span>
              <span>Monthly Rate: <strong className="text-emerald-400 font-mono text-sm">{formatCurrency(activeLead.monthlyEstimate)}/mo</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenEstimatorForLead(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Estimate</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenWalkthroughModal(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Walkthrough ({activeLead.walkthroughStatus})</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenProposalForLead(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Generate Proposal</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by company, contact, ID, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Status:</span>
          {['ALL', 'NEW', 'QUALIFIED', 'WALKTHROUGH', 'PROPOSAL', 'WON', 'LOST'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table (Executive 15-Column Mirror) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Lead ID</th>
                <th className="py-3.5 px-4">Company &amp; Contact</th>
                <th className="py-3.5 px-4">Facility &amp; Specs</th>
                <th className="py-3.5 px-4 text-right">Monthly Est.</th>
                <th className="py-3.5 px-4 text-center">Walkthrough</th>
                <th className="py-3.5 px-4 text-center">Proposal</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No sales leads found.</p>
                    <p className="text-xs mt-1">Click "+ New Lead" above to initialize your first opportunity.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = activeLead?.leadId === lead.leadId;
                  return (
                    <tr
                      key={lead.leadId}
                      onClick={() => onSelectLead(lead)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-950/40 hover:bg-blue-950/60' 
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Lead ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {lead.leadId}
                        <span className="block font-sans text-[10px] font-normal text-slate-500">
                          {lead.createdDate}
                        </span>
                      </td>

                      {/* Company & Contact */}
                      <td className="py-3.5 px-4">
                        <strong className="text-white font-semibold text-sm block">
                          {lead.companyName}
                        </strong>
                        <span className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{lead.fullName || 'No contact specified'}</span>
                          {lead.phoneNumber && (
                            <span className="text-slate-500">• {lead.phoneNumber}</span>
                          )}
                        </span>
                      </td>

                      {/* Facility & Specs */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-200 font-medium block">
                          {getSectorName(lead.facilityType)}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {lead.squareFootage.toLocaleString()} sq ft • {lead.cleaningFrequency.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Monthly Estimate */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm tabular-nums whitespace-nowrap">
                        {lead.monthlyEstimate > 0 ? (
                          formatCurrency(lead.monthlyEstimate)
                        ) : (
                          <span className="text-slate-500 font-sans text-xs">Uncalculated</span>
                        )}
                        <span className="block font-sans text-[10px] font-normal text-slate-500">
                          ACV: {formatCurrency(lead.annualContractValue || lead.monthlyEstimate * 12)}
                        </span>
                      </td>

                      {/* Walkthrough */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          lead.walkthroughStatus === 'COMPLETED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : lead.walkthroughStatus === 'SCHEDULED'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {lead.walkthroughStatus}
                        </span>
                      </td>

                      {/* Proposal */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          lead.proposalStatus === 'ACCEPTED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : lead.proposalStatus === 'GENERATED' || lead.proposalStatus === 'SENT'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {lead.proposalStatus}
                        </span>
                      </td>

                      {/* Pipeline Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            title="Open in Estimator"
                            onClick={() => onOpenEstimatorForLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Schedule Walkthrough"
                            onClick={() => onOpenWalkthroughModal(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Generate Proposal"
                            onClick={() => onOpenProposalForLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
