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
  FileText, 
  Sliders, 
  User, 
  Edit3, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../utils/pricingEngine';

interface SalesDashboardProps {
  leads: LeadRecord[];
  activeLead: LeadRecord | null;
  brandConfig: ClientBrandConfig;
  isSyncing?: boolean;
  onSyncFromGoogleSheets?: () => void;
  onSelectLead: (lead: LeadRecord) => void;
  onOpenNewLeadModal: () => void;
  onOpenEditLeadModal: (lead: LeadRecord) => void;
  onOpenEstimatorForLead: (lead: LeadRecord) => void;
  onOpenProposalForLead: (lead: LeadRecord) => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
}

const FILTER_STATUSES: (LeadStatus | 'ALL')[] = [
  'ALL',
  'New',
  'Contacted',
  'Estimating',
  'Quoted',
  'Negotiation',
  'Won',
  'Lost'
];

export const getStatusBadge = (status: LeadStatus) => {
  switch (status) {
    case 'New':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'Contacted':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Estimating':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Quoted':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Negotiation':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Won':
      return 'bg-emerald-100 text-emerald-900 border-emerald-400 font-extrabold';
    case 'Lost':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getScheduleStatusBadge = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'Not Scheduled':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  leads,
  activeLead,
  brandConfig,
  isSyncing = false,
  onSyncFromGoogleSheets,
  onSelectLead,
  onOpenNewLeadModal,
  onOpenEditLeadModal,
  onOpenEstimatorForLead,
  onOpenProposalForLead,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filter leads based on search & status
  const filteredLeads = leads.filter((lead) => {
    const contact = lead.contactPerson || lead.fullName || '';
    const company = lead.companyName || '';
    const id = lead.leadId || '';
    const location = lead.projectLocation || lead.propertyAddress || '';
    const project = lead.projectName || '';

    const matchesSearch = 
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pipeline metrics
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedValue || l.annualContractValue || 0), 0);
  const wonCount = leads.filter(l => l.status === 'Won').length;
  const activeLeadsCount = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* 1. Header with Stats & New Lead Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales &amp; Pipeline Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Leads &amp; Commercial Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized prospect records, estimate snapshots, and proposal workflow for {brandConfig.companyName}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* 2. Pipeline Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{leads.length}</p>
          <span className="text-[11px] text-slate-500">{activeLeadsCount} active in pipeline</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono text-emerald-700">
            {formatCurrency(totalPipelineValue)}
          </p>
          <span className="text-[11px] text-slate-500">Estimated contract value</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Won Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono text-emerald-700">{wonCount}</p>
          <span className="text-[11px] text-slate-500">
            {leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0}% win conversion
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Source</span>
              {onSyncFromGoogleSheets && (
                <button
                  type="button"
                  onClick={onSyncFromGoogleSheets}
                  disabled={isSyncing}
                  title="Pull latest leads from Google Sheets"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Sheet'}</span>
                </button>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900 mt-2 truncate">Google Sheets Sync</p>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {leads.length > 0 ? `${leads.length} active leads in pipeline` : '0 leads (Google Sheet is empty)'}
          </span>
        </div>
      </div>

      {/* 3. Interactive Sales Pipeline Bar */}
      <SalesPipelineBar
        activeLead={activeLead}
        leads={leads}
        onStatusChange={(newStatus) => {
          if (activeLead) {
            onUpdateStatus(activeLead.leadId, newStatus);
          }
        }}
      />

      {/* 4. Active Lead Highlight Banner (if selected) */}
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
              <span>Contact: <strong className="text-slate-900">{activeLead.contactPerson || activeLead.fullName || 'Not specified'}</strong></span>
              <span>•</span>
              <span>Project: <strong className="text-slate-900">{activeLead.projectName || activeLead.companyName}</strong></span>
              <span>•</span>
              <span>Value: <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(activeLead.estimatedValue || activeLead.annualContractValue || 0)}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenEditLeadModal(activeLead)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Lead</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenEstimatorForLead(activeLead)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Create / Adjust Estimate</span>
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

      {/* 5. Filters & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, contact person, lead ID, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {FILTER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Lead ID</th>
                <th className="py-3.5 px-4">Company &amp; Project</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Estimated Value</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-9 h-9 mx-auto text-slate-300 mb-2" />
                    {leads.length === 0 ? (
                      <div>
                        <p className="text-sm font-bold text-slate-700">Google Sheet is empty (0 leads)</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          All rows have been cleared from your Google Sheet. Click below or calculate an estimate to add your first commercial lead.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-600">No leads match your filter criteria.</p>
                    )}
                    <button
                      type="button"
                      onClick={onOpenNewLeadModal}
                      className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Lead</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = activeLead?.leadId === lead.leadId;
                  const contact = lead.contactPerson || lead.fullName || 'Not specified';
                  const email = lead.email || lead.businessEmail || '';
                  const phone = lead.phone || lead.phoneNumber || '';
                  const location = lead.projectLocation || lead.propertyAddress || 'Not specified';
                  const value = lead.estimatedValue || lead.annualContractValue || 0;

                  return (
                    <tr
                      key={lead.leadId}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      {/* Lead ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {lead.leadId}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {lead.dateCreated || lead.createdDate || 'Recent'}
                        </div>
                      </td>

                      {/* Company & Project */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {lead.companyName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{lead.projectName || lead.projectType || 'Commercial Scope'}</span>
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{contact}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {email || phone || 'No direct contact'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      </td>

                      {/* Estimated Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(value)}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {lead.leadSource || 'Website'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateStatus(lead.leadId, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer ${getStatusBadge(lead.status)}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Estimating">Estimating</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            title="Edit Lead Record"
                            onClick={() => onOpenEditLeadModal(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Create / Adjust Estimate"
                            onClick={() => onOpenEstimatorForLead(lead)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Generate Proposal"
                            onClick={() => onOpenProposalForLead(lead)}
                            className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
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
