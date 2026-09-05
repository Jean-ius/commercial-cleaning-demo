import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  AlertCircle, 
  Briefcase 
} from 'lucide-react';
import { 
  LeadRecord, 
  LeadStatus, 
  LeadSource,
  FacilitySectorId,
  FrequencyId,
  AddOnServiceId,
  EstimateResult
} from '../../types/cleanCommand';
import { facilitySectors, frequencyOptions } from '../../config/clientConfig';
import { calculateCommercialEstimate } from '../../utils/pricingEngine';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: LeadRecord) => Promise<void> | void;
  nextLeadSequence?: number;
  suggestedLeadId?: string;
  initialEstimateSpecs?: {
    squareFootage?: number;
    facilityType?: FacilitySectorId;
    cleaningFrequency?: FrequencyId;
    estimatedValue?: number;
    monthlyEstimate?: number;
    ratePerVisit?: number;
    discretionaryAdjustmentPercent?: number;
    recommendedMonthlyRate?: number;
    selectedAddOns?: AddOnServiceId[];
    propertyType?: string;
    specialRequirements?: string;
    notes?: string;
    estimateSnapshot?: EstimateResult;
  };
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

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead,
  nextLeadSequence = 1,
  suggestedLeadId,
  initialEstimateSpecs
}) => {
  // Required Canonical Lead Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(initialEstimateSpecs?.propertyType || 'Commercial Corporate Office');
  const [projectLocation, setProjectLocation] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | string>(
    initialEstimateSpecs?.estimatedValue !== undefined && initialEstimateSpecs.estimatedValue !== null
      ? initialEstimateSpecs.estimatedValue
      : ''
  );
  const [leadSource, setLeadSource] = useState<LeadSource>('Website');
  const [status, setStatus] = useState<LeadStatus>(initialEstimateSpecs ? 'Estimating' : 'New');
  const [notes, setNotes] = useState(initialEstimateSpecs?.notes || '');
  const [specialRequirements, setSpecialRequirements] = useState(initialEstimateSpecs?.specialRequirements || '');
  const [assignedSalesRep, setAssignedSalesRep] = useState('Unassigned');

  // Optional technical specs to connect directly to estimator
  const [squareFootage, setSquareFootage] = useState<number | string>(initialEstimateSpecs?.squareFootage ?? '');
  const [facilityType, setFacilityType] = useState<FacilitySectorId>(initialEstimateSpecs?.facilityType || 'corporate_office');
  const [cleaningFrequency, setCleaningFrequency] = useState<FrequencyId>(initialEstimateSpecs?.cleaningFrequency || 'business_5x');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically pre-fill form fields whenever modal opens from an active estimate, or clean reset
  React.useEffect(() => {
    if (isOpen) {
      if (initialEstimateSpecs && (initialEstimateSpecs.estimatedValue !== undefined || initialEstimateSpecs.estimateSnapshot)) {
        // Opened from Estimator: Auto-prefill exact final estimate amount (single source of truth)
        const exactVal = initialEstimateSpecs.estimatedValue !== undefined 
          ? initialEstimateSpecs.estimatedValue 
          : (initialEstimateSpecs.estimateSnapshot?.annualContractValue ?? '');
        setEstimatedValue(exactVal);
        setSquareFootage(initialEstimateSpecs.squareFootage !== undefined ? initialEstimateSpecs.squareFootage : '');
        setFacilityType(initialEstimateSpecs.facilityType || 'corporate_office');
        setCleaningFrequency(initialEstimateSpecs.cleaningFrequency || 'business_5x');
        setProjectType(initialEstimateSpecs.propertyType || 'Commercial Corporate Office');
        setStatus('Estimating');
        setSpecialRequirements(initialEstimateSpecs.specialRequirements || '');
        setNotes(initialEstimateSpecs.notes || '');
      } else {
        // Opened directly via "+ New Lead" without estimator context:
        // Field MUST be blank (no hardcoded 25000, no previous estimate)
        setEstimatedValue('');
        setSquareFootage('');
        setFacilityType('corporate_office');
        setCleaningFrequency('business_5x');
        setProjectType('Commercial Corporate Office');
        setStatus('New');
        setSpecialRequirements('');
        setNotes('');
      }
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setProjectName('');
      setProjectLocation('');
      setLeadSource('Website');
      setAssignedSalesRep('Unassigned');
      setErrorMsg('');
    }
  }, [isOpen, initialEstimateSpecs]);

  if (!isOpen) return null;

  const leadId = suggestedLeadId || `LD-${new Date().getFullYear()}-${String(nextLeadSequence).padStart(3, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName.trim() && !contactPerson.trim()) {
      setErrorMsg('Please provide a Company Name or Contact Person.');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const numSquareFootage = typeof squareFootage === 'number' 
        ? squareFootage 
        : parseFloat(String(squareFootage)) || 0;

      // Use attached estimate snapshot if available, or calculate baseline
      const baselineEstimate = initialEstimateSpecs?.estimateSnapshot || calculateCommercialEstimate(
        numSquareFootage || 12000,
        facilityType,
        cleaningFrequency,
        initialEstimateSpecs?.selectedAddOns || []
      );

      const numEstimatedValue = typeof estimatedValue === 'number' 
        ? estimatedValue 
        : (estimatedValue !== '' && !isNaN(Number(estimatedValue)))
          ? parseFloat(String(estimatedValue))
          : (initialEstimateSpecs?.estimatedValue ?? 0);

      const finalEstimatedValue = numEstimatedValue;

      const newLead: LeadRecord = {
        leadId,
        leadSource,
        companyName: companyName.trim() || 'Untitled Prospect',
        contactPerson: contactPerson.trim() || 'Primary Contact',
        email: email.trim(),
        phone: phone.trim(),
        propertyAddress: projectLocation.trim(),
        propertyType: projectType.trim(),
        projectType: projectType.trim(),
        squareFootage: numSquareFootage,
        cleaningFrequency,
        specialRequirements: specialRequirements.trim(),
        assignedSalesRep: assignedSalesRep.trim() || 'Unassigned',
        status,
        notes: notes.trim(),
        dateCreated: today,
        lastUpdated: today,

        // Legacy / Estimator connection fields
        projectName: projectName.trim() || `${companyName.trim() || 'Prospect'} Facility`,
        projectLocation: projectLocation.trim(),
        estimatedValue: finalEstimatedValue,
        facilityType,
        selectedAddOns: initialEstimateSpecs?.selectedAddOns || [],
        ratePerVisit: initialEstimateSpecs?.ratePerVisit || (finalEstimatedValue > 0 ? baselineEstimate.pricePerVisit : 0),
        annualContractValue: finalEstimatedValue,
        estimatedLaborHours: baselineEstimate.hoursPerCleaningVisit,
        recommendedCrewSize: baselineEstimate.recommendedCrewSize,
        discretionaryAdjustmentPercent: initialEstimateSpecs?.discretionaryAdjustmentPercent ?? initialEstimateSpecs?.estimateSnapshot?.discretionaryAdjustmentPercent ?? 0,
        recommendedMonthlyRate: initialEstimateSpecs?.recommendedMonthlyRate ?? initialEstimateSpecs?.estimateSnapshot?.recommendedMonthlyRate,
        recommendedPricePerVisit: initialEstimateSpecs?.estimateSnapshot?.recommendedPricePerVisit,
        recommendedAnnualContractValue: initialEstimateSpecs?.estimateSnapshot?.recommendedAnnualContractValue,
        finalProposedMonthlyRate: initialEstimateSpecs?.monthlyEstimate ?? initialEstimateSpecs?.estimateSnapshot?.finalProposedMonthlyRate,
        finalProposedPricePerVisit: initialEstimateSpecs?.ratePerVisit ?? initialEstimateSpecs?.estimateSnapshot?.finalProposedPricePerVisit,
        finalProposedAnnualContractValue: finalEstimatedValue,
        estimateSnapshot: initialEstimateSpecs?.estimateSnapshot 
          ? { ...initialEstimateSpecs.estimateSnapshot, annualContractValue: finalEstimatedValue }
          : (finalEstimatedValue > 0 ? { ...baselineEstimate, annualContractValue: finalEstimatedValue } : undefined),
        updatedDate: today,

        // Sync compatibility helpers
        fullName: contactPerson.trim() || 'Primary Contact',
        businessEmail: email.trim(),
        phoneNumber: phone.trim(),
        internalNotes: notes.trim(),
        monthlyEstimate: initialEstimateSpecs?.monthlyEstimate || (finalEstimatedValue > 0 ? Math.round(finalEstimatedValue / 12) : 0),
        createdDate: today
      };

      await onCreateLead(newLead);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create lead in Google Sheets. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 my-auto sm:my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header (Fixed at top) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Create New Lead</h2>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {leadId}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">Add a new prospect to your sales pipeline and Google Sheets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 mobile-scroll-container">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Prospect & Company */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-2.5">
              1. Prospect &amp; Company (Required)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Center"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Project Scope & Location */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-2.5">
              2. Project Scope &amp; Location
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Headquarters Facility Janitorial"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Office, Medical Facility..."
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Location / Property Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 100 Technology Blvd, Suite 200, Dallas, TX"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status, Estimated Value, and Lead Source */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-2.5">
              3. Status, Value &amp; Source
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm font-semibold min-h-[44px]"
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
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 35000"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm font-mono min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                >
                  {LEAD_SOURCE_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance / Sales Team"
                  value={assignedSalesRep}
                  onChange={(e) => setAssignedSalesRep(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. HEPA filtration, after-hours key access..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <textarea
                rows={2}
                placeholder="Initial conversation notes, client preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Section 4: Estimator Technical Specs (Pre-connects to Quote Engine) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Estimator Pre-Configuration (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Facility Sector</label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value as FacilitySectorId)}
                  className="w-full px-2.5 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 min-h-[42px]"
                >
                  {facilitySectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Square Footage</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 15000"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                  className="w-full px-2.5 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-mono min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Cleaning Frequency</label>
                <select
                  value={cleaningFrequency}
                  onChange={(e) => setCleaningFrequency(e.target.value as FrequencyId)}
                  className="w-full px-2.5 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 min-h-[42px]"
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

          {/* Footer Actions (Sticky bottom bar) */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving to Google Sheets...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
