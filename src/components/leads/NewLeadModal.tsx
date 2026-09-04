import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { 
  LeadRecord, 
  FacilitySectorId, 
  FrequencyId, 
  LeadSource 
} from '../../types/cleanCommand';
import { facilitySectors, frequencyOptions } from '../../config/clientConfig';
import { calculateCommercialEstimate } from '../../utils/pricingEngine';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: LeadRecord) => Promise<void> | void;
  nextLeadSequence?: number;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead,
  nextLeadSequence = 1
}) => {
  // Required fields (Contact Name or Company Name must be provided)
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [facilityType, setFacilityType] = useState<FacilitySectorId>('corporate_office');
  const [squareFootage, setSquareFootage] = useState<number>(12000);
  const [cleaningFrequency, setCleaningFrequency] = useState<FrequencyId>('business_5x');

  // Optional fields
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('Phone');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName.trim() && !fullName.trim()) {
      setErrorMsg('Please provide at least a Company Name or Contact Name.');
      return;
    }

    if (!squareFootage || squareFootage <= 0) {
      setErrorMsg('Please enter a valid facility square footage.');
      return;
    }

    setIsSubmitting(true);

    try {
      const year = new Date().getFullYear();
      const paddedSeq = String(nextLeadSequence).padStart(4, '0');
      const leadId = `LEAD-${year}-${paddedSeq}`;

      const dateStr = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date());

      // Calculate initial baseline estimate snapshot
      const estimate = calculateCommercialEstimate(squareFootage, facilityType, cleaningFrequency, []);

      const newLead: LeadRecord = {
        leadId,
        status: 'NEW',
        leadSource,
        createdDate: dateStr,
        lastUpdated: new Date().toISOString(),

        fullName: fullName.trim(),
        companyName: companyName.trim() || fullName.trim(),
        businessEmail: businessEmail.trim(),
        phoneNumber: phoneNumber.trim(),

        propertyAddress: propertyAddress.trim(),
        facilityType,
        squareFootage,
        cleaningFrequency,
        selectedAddOns: [],
        specialRequirements: specialRequirements.trim(),
        internalNotes: internalNotes.trim(),

        monthlyEstimate: estimate.totalEstimatedMonthlyInvestment,
        ratePerVisit: estimate.pricePerVisit,
        annualContractValue: estimate.annualContractValue,
        estimatedLaborHours: estimate.hoursPerCleaningVisit,
        recommendedCrewSize: estimate.recommendedCrewSize,
        estimateSnapshot: estimate,

        walkthroughStatus: 'NOT SCHEDULED',
        walkthroughDate: '',
        walkthroughTime: '',
        assignedSalesRep: 'Marcus Sterling',
        meetingInstructions: '',
        walkthroughNotes: '',

        proposalId: '',
        proposalStatus: 'NOT GENERATED',
        proposalIssueDate: '',
        proposalValidThrough: '',
        proposalSentDate: ''
      };

      await onCreateLead(newLead);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create New Sales Lead</h2>
              <p className="text-xs text-slate-400">Initialize a centralized LeadRecord with facility specs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/80 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Required Identity / Prospect Details */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-3">
              1. Prospect & Company (Required)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Center"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Contact Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Facility & Scope Details */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-3">
              2. Facility Specs & Cleaning Frequency (Required)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Facility Sector</label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value as FacilitySectorId)}
                  className="w-full px-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {facilitySectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Square Footage</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Frequency</label>
                <select
                  value={cleaningFrequency}
                  onChange={(e) => setCleaningFrequency(e.target.value as FrequencyId)}
                  className="w-full px-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {frequencyOptions.map((freq) => (
                    <option key={freq.id} value={freq.id}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Optional Contact & Pipeline Info */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              3. Additional Contact & Source Info (Optional)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Lead Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Phone">Phone Inbound</option>
                  <option value="Email">Direct Email</option>
                  <option value="Referral">Client Referral</option>
                  <option value="Website">Website Lead Form</option>
                  <option value="LinkedIn">LinkedIn Prospecting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Property Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 100 Technology Blvd, Suite 200, Dallas, TX"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Special Facility Requirements</label>
              <input
                type="text"
                placeholder="e.g. Night keycard access, medical waste handling, carpet high-traffic areas..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Internal Notes</label>
              <textarea
                rows={2}
                placeholder="Initial conversation notes, special facility requirements, access codes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Lead...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create LeadRecord
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
