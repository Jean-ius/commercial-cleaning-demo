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
  FrequencyId
} from '../../types/cleanCommand';
import { facilitySectors, frequencyOptions } from '../../config/clientConfig';
import { calculateCommercialEstimate } from '../../utils/pricingEngine';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: LeadRecord) => Promise<void> | void;
  nextLeadSequence?: number;
  initialEstimateSpecs?: {
    squareFootage?: number;
    facilityType?: FacilitySectorId;
    cleaningFrequency?: FrequencyId;
    estimatedValue?: number;
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
  initialEstimateSpecs
}) => {
  // Required Canonical Lead Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Commercial Corporate Office');
  const [projectLocation, setProjectLocation] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(initialEstimateSpecs?.estimatedValue || 25000);
  const [leadSource, setLeadSource] = useState<LeadSource>('Website');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [notes, setNotes] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [assignedSalesRep, setAssignedSalesRep] = useState('Unassigned');

  // Optional technical specs to connect directly to estimator
  const [squareFootage, setSquareFootage] = useState<number>(initialEstimateSpecs?.squareFootage || 12000);
  const [facilityType, setFacilityType] = useState<FacilitySectorId>(initialEstimateSpecs?.facilityType || 'corporate_office');
  const [cleaningFrequency, setCleaningFrequency] = useState<FrequencyId>(initialEstimateSpecs?.cleaningFrequency || 'business_5x');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const leadId = `LD-${new Date().getFullYear()}-${String(nextLeadSequence).padStart(3, '0')}`;

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

      // Calculate initial baseline estimate if squareFootage provided
      const baselineEstimate = calculateCommercialEstimate(
        squareFootage,
        facilityType,
        cleaningFrequency,
        []
      );

      const finalEstimatedValue = estimatedValue > 0 
        ? estimatedValue 
        : baselineEstimate.annualContractValue;

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
        squareFootage,
        cleaningFrequency,
        specialRequirements: specialRequirements.trim(),
        assignedSalesRep: assignedSalesRep.trim() || 'Unassigned',
        status,
        notes: notes.trim(),
        dateCreated: today,
        lastUpdated: today,

        // Legacy / Estimator connection fields
        projectName: projectName.trim() || `${companyName.trim()} Facility`,
        projectLocation: projectLocation.trim(),
        estimatedValue: finalEstimatedValue,
        facilityType,
        selectedAddOns: [],
        ratePerVisit: baselineEstimate.pricePerVisit,
        annualContractValue: finalEstimatedValue,
        estimatedLaborHours: baselineEstimate.hoursPerCleaningVisit,
        recommendedCrewSize: baselineEstimate.recommendedCrewSize,
        estimateSnapshot: baselineEstimate,
        updatedDate: today,

        // Sync compatibility helpers
        fullName: contactPerson.trim() || 'Primary Contact',
        businessEmail: email.trim(),
        phoneNumber: phone.trim(),
        internalNotes: notes.trim(),
        monthlyEstimate: Math.round(finalEstimatedValue / 12),
        createdDate: today
      };

      await onCreateLead(newLead);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create lead. Please check network/Apps Script and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Lead</h2>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {leadId}
                </span>
              </div>
              <p className="text-xs text-slate-500">Add a new prospect to your sales pipeline and Google Sheets database</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Prospect & Company */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-3">
              1. Prospect & Company (Required)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Center"
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
                    placeholder="e.g. Sarah Jenkins"
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
                    placeholder="contact@company.com"
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
                    placeholder="(555) 000-0000"
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
              2. Project Scope & Location
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Headquarters Facility Janitorial"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
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
                  placeholder="e.g. 100 Technology Blvd, Suite 200, Dallas, TX"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status, Estimated Value, and Lead Source */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-3">
              3. Status, Value & Source
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
                    step="500"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
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
                  placeholder="e.g. Marcus Vance / CleanCommand Sales"
                  value={assignedSalesRep}
                  onChange={(e) => setAssignedSalesRep(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. HEPA filtration, biohazard protocol, after-hours key access..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Section 4: Estimator Technical Specs (Pre-connects to Quote Engine) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Estimator Pre-Configuration (Optional)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Facility Sector</label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value as FacilitySectorId)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
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
                  min="500"
                  step="500"
                  value={squareFootage}
                  onChange={(e) => {
                    const sqft = Number(e.target.value);
                    setSquareFootage(sqft);
                    const calc = calculateCommercialEstimate(sqft, facilityType, cleaningFrequency, []);
                    setEstimatedValue(calc.annualContractValue);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Cleaning Frequency</label>
                <select
                  value={cleaningFrequency}
                  onChange={(e) => {
                    const freq = e.target.value as FrequencyId;
                    setCleaningFrequency(freq);
                    const calc = calculateCommercialEstimate(squareFootage, facilityType, freq, []);
                    setEstimatedValue(calc.annualContractValue);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
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
