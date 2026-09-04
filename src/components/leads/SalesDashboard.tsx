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
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUALIFIED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'WALKTHROUGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PROPOSAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'WON':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'LOST':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSectorName = (sectorId: string) => {
    const s = facilitySectors.find(item => item.id === sectorId);
    return s ? s.name : sectorId;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Internal Commercial Sales Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Opportunities &amp; Estimating CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Canonical LeadRecord management, instant square-footage bidding, and Google Sheets synchronization across {brandConfig.primaryCity}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
        <div className="bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/90 border border-blue-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                {activeLead.leadId}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {activeLead.companyName}
              </h3>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(activeLead.status)}`}>
                {activeLead.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-1">
              <span>Contact: <strong className="text-slate-900">{activeLead.fullName || 'Not specified'}</strong></span>
              <span>•</span>
              <span>Facility: <strong className="text-slate-900">{getSectorName(activeLead.facilityType)}</strong> ({activeLead.squareFootage.toLocaleString()} sq ft)</span>
              <span>•</span>
              <span>Monthly Rate: <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(activeLead.monthlyEstimate)}/mo</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenEstimatorForLead(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Estimate</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenWalkthroughModal(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Walkthrough ({activeLead.walkthroughStatus})</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenProposalForLead(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Generate Proposal</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by company, contact, ID, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Status:</span>
          {['ALL', 'NEW', 'QUALIFIED', 'WALKTHROUGH', 'PROPOSAL', 'WON', 'LOST'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table (Executive 15-Column Mirror) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
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
                          ? 'bg-blue-50/70 hover:bg-blue-50' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Lead ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {lead.leadId}
                        <span className="block font-sans text-[10px] font-normal text-slate-400">
                          {lead.createdDate}
                        </span>
                      </td>

                      {/* Company & Contact */}
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 font-bold text-sm block">
                          {lead.companyName}
                        </strong>
                        <span className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{lead.fullName || 'No contact specified'}</span>
                          {lead.phoneNumber && (
                            <span className="text-slate-400">• {lead.phoneNumber}</span>
                          )}
                        </span>
                      </td>

                      {/* Facility & Specs */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium block">
                          {getSectorName(lead.facilityType)}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">
                          {lead.squareFootage.toLocaleString()} sq ft • {lead.cleaningFrequency.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Monthly Estimate */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm tabular-nums whitespace-nowrap">
                        {lead.monthlyEstimate > 0 ? (
                          formatCurrency(lead.monthlyEstimate)
                        ) : (
                          <span className="text-slate-400 font-sans text-xs">Uncalculated</span>
                        )}
                        <span className="block font-sans text-[10px] font-normal text-slate-400">
                          ACV: {formatCurrency(lead.annualContractValue || lead.monthlyEstimate * 12)}
                        </span>
                      </td>

                      {/* Walkthrough */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          lead.walkthroughStatus === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : lead.walkthroughStatus === 'SCHEDULED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {lead.walkthroughStatus}
                        </span>
                      </td>

                      {/* Proposal */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          lead.proposalStatus === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : lead.proposalStatus === 'GENERATED' || lead.proposalStatus === 'SENT'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
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
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Schedule Walkthrough"
                            onClick={() => onOpenWalkthroughModal(lead)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Generate Proposal"
                            onClick={() => onOpenProposalForLead(lead)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 border border-slate-200 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
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
