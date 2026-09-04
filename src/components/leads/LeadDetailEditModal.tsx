import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Sliders, 
  FileText, 
  Save, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { LeadRecord, LeadStatus, LeadSource } from '../../types/cleanCommand';

interface LeadDetailEditModalProps {
  isOpen: boolean;
  lead: LeadRecord | null;
  onClose: () => void;
  onSaveLead: (updatedLead: LeadRecord) => Promise<void> | void;
  onOpenEstimatorForLead?: (lead: LeadRecord) => void;
  onOpenProposalForLead?: (lead: LeadRecord) => void;
}

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Estimating',
  'Quoted',
  'Negotiation',
  'Won',
  'Lost'
];

const LEAD_SOURCE_OPTIONS: LeadSource[] = [
  'Phone',
  'Email',
  'Referral',
  'Website',
  'LinkedIn',
  'Other'
];

export const LeadDetailEditModal: React.FC<LeadDetailEditModalProps> = ({
  isOpen,
  lead,
  onClose,
  onSaveLead,
  onOpenEstimatorForLead,
  onOpenProposalForLead
}) => {
  if (!isOpen || !lead) return null;

  const [companyName, setCompanyName] = useState(lead.companyName || '');
  const [contactPerson, setContactPerson] = useState(lead.contactPerson || lead.fullName || '');
  const [email, setEmail] = useState(lead.email || lead.businessEmail || '');
  const [phone, setPhone] = useState(lead.phone || lead.phoneNumber || '');
  const [projectName, setProjectName] = useState(lead.projectName || '');
  const [projectType, setProjectType] = useState(lead.projectType || 'Commercial Office');
  const [projectLocation, setProjectLocation] = useState(lead.projectLocation || lead.propertyAddress || '');
  const [estimatedValue, setEstimatedValue] = useState<number | string>(lead.estimatedValue ?? lead.annualContractValue ?? 0);
  const [leadSource, setLeadSource] = useState<LeadSource>(lead.leadSource || 'Website');
  const [status, setStatus] = useState<LeadStatus>(lead.status || 'New');
  const [notes, setNotes] = useState(lead.notes || lead.internalNotes || '');
  const [specialRequirements, setSpecialRequirements] = useState(lead.specialRequirements || '');
  const [assignedSalesRep, setAssignedSalesRep] = useState(lead.assignedSalesRep || 'Unassigned');
  const [squareFootage, setSquareFootage] = useState<number | string>(lead.squareFootage || 12000);
  const [cleaningFrequency, setCleaningFrequency] = useState<string>(lead.cleaningFrequency || 'business_5x');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (lead) {
      setCompanyName(lead.companyName || '');
      setContactPerson(lead.contactPerson || lead.fullName || '');
      setEmail(lead.email || lead.businessEmail || '');
      setPhone(lead.phone || lead.phoneNumber || '');
      setProjectName(lead.projectName || '');
      setProjectType(lead.projectType || lead.propertyType || 'Commercial Office');
      setProjectLocation(lead.projectLocation || lead.propertyAddress || '');
      setEstimatedValue(lead.estimatedValue ?? lead.annualContractValue ?? 0);
      setLeadSource(lead.leadSource || 'Website');
      setStatus(lead.status || 'New');
      setNotes(lead.notes || lead.internalNotes || '');
      setSpecialRequirements(lead.specialRequirements || '');
      setAssignedSalesRep(lead.assignedSalesRep || 'Unassigned');
      setSquareFootage(lead.squareFootage || 12000);
      setCleaningFrequency(lead.cleaningFrequency || 'business_5x');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [lead?.leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!companyName.trim() && !contactPerson.trim()) {
      setErrorMsg('Please provide a Company Name or Contact Person.');
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const numEstimatedValue = typeof estimatedValue === 'number' 
        ? estimatedValue 
        : parseFloat(String(estimatedValue)) || 0;
      const numSquareFootage = typeof squareFootage === 'number' 
        ? squareFootage 
        : parseFloat(String(squareFootage)) || 0;

      const updatedLead: LeadRecord = {
        ...lead,
        leadSource,
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        propertyAddress: projectLocation.trim(),
        propertyType: projectType.trim(),
        squareFootage: numSquareFootage,
        cleaningFrequency: cleaningFrequency as any,
        specialRequirements: specialRequirements.trim(),
        assignedSalesRep: assignedSalesRep.trim() || 'Unassigned',
        status,
        notes: notes.trim(),
        lastUpdated: today,

        // Estimator & Proposal connections
        projectName: projectName.trim() || companyName.trim(),
        projectLocation: projectLocation.trim(),
        estimatedValue: numEstimatedValue,
        annualContractValue: numEstimatedValue,
        updatedDate: today,

        // Sync compatibility helpers
        fullName: contactPerson.trim(),
        businessEmail: email.trim(),
        phoneNumber: phone.trim(),
        internalNotes: notes.trim(),
        monthlyEstimate: Math.round(numEstimatedValue / 12) || lead.monthlyEstimate || 0
      };

      await onSaveLead(updatedLead);
      setSuccessMsg('Lead record updated and synchronized to Google Sheet!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update lead in Google Sheet. Please check network/Apps Script.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Lead Record Details</h2>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {lead.leadId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created on {lead.dateCreated || lead.createdDate || 'Recent'} • Last updated {lead.updatedDate || 'Today'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Shortcuts Bar */}
        <div className="bg-slate-50/70 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium">Quick Workflows:</span>
          <div className="flex items-center gap-2">
            {onOpenEstimatorForLead && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEstimatorForLead(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Create / Adjust Estimate</span>
              </button>
            )}
            {onOpenProposalForLead && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProposalForLead(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold transition-all cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Generate Proposal</span>
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Company & Contact */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-3">
              Prospect Identification
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Project Scope & Location */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-3">
              Project & Facility Details
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Facility Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Location / Property Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Value */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-3">
              Pipeline Status & Value
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm font-semibold"
                >
                  {LEAD_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Value ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                >
                  {LEAD_SOURCE_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <input
                  type="text"
                  value={assignedSalesRep}
                  onChange={(e) => setAssignedSalesRep(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requirements</label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. HEPA filtration, after-hours security badge..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Square Footage</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cleaning Frequency</label>
                <input
                  type="text"
                  value={cleaningFrequency}
                  onChange={(e) => setCleaningFrequency(e.target.value)}
                  placeholder="e.g. business_5x, daily_7x, weekly_1x"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Conversation history, client preferences, special facility requirements..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Lead...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
