import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Phone,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { 
  EstimateResult, 
  ClientBrandConfig, 
  WalkthroughBookingRecord 
} from '../../types/cleanCommand';
import { facilitySectors, frequencyOptions } from '../../config/clientConfig';
import { formatCurrency } from '../../utils/pricingEngine';
import { submitBookingToGoogleSheets } from '../../services/googleSheetsService';

interface WalkthroughBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: EstimateResult;
  brandConfig: ClientBrandConfig;
  onBookingSubmitted?: (booking: WalkthroughBookingRecord) => void;
}

export const WalkthroughBookingModal: React.FC<WalkthroughBookingModalProps> = ({
  isOpen,
  onClose,
  estimate,
  brandConfig,
  onBookingSubmitted
}) => {
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedBooking, setSubmittedBooking] = useState<WalkthroughBookingRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    businessEmail: '',
    phoneNumber: '',
    preferredWalkthroughDate: '',
    preferredTimeWindow: 'Morning (8:00 AM – 12:00 PM)',
    cleaningFrustrations: ''
  });

  // Validation Error State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const sector = facilitySectors.find(s => s.id === estimate.sectorId) || facilitySectors[0];
  const frequency = frequencyOptions.find(f => f.id === estimate.frequencyId) || frequencyOptions[1];

  // Helper to clear specific field error on user input
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name.';
    }

    if (!formData.companyName.trim() || formData.companyName.trim().length < 2) {
      errors.companyName = 'Please enter your company or property name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.businessEmail.trim() || !emailRegex.test(formData.businessEmail.trim())) {
      errors.businessEmail = 'Please enter a valid business work email.';
    }

    const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
    if (!formData.phoneNumber.trim() || digitsOnly.length < 7) {
      errors.phoneNumber = 'Please enter a valid phone number (min 7 digits).';
    }

    if (!formData.preferredWalkthroughDate) {
      errors.preferredWalkthroughDate = 'Please select a preferred walkthrough date.';
    }

    if (!formData.preferredTimeWindow) {
      errors.preferredTimeWindow = 'Please select a preferred time window.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate Unique Booking ID
  const generateBookingId = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `WK-${year}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate all inputs
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const now = new Date();
      const bookingId = generateBookingId();

      // 2. Build Structured Booking Record (Estimator snapshot captured at submission time)
      const bookingRecord: WalkthroughBookingRecord = {
        bookingId,
        submissionTimestamp: now.toISOString(),
        submissionDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        submissionTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        
        // Contact Information
        fullName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        businessEmail: formData.businessEmail.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        preferredWalkthroughDate: formData.preferredWalkthroughDate,
        preferredTimeWindow: formData.preferredTimeWindow,
        cleaningFrustrations: formData.cleaningFrustrations.trim() || 'None specified',
        
        // Estimator Context Snapshot at Submission Time
        facilityType: sector.name,
        squareFootage: estimate.squareFootage,
        cleaningFrequency: frequency.label,
        ballparkEstimateLow: estimate.lowMonthlyRange,
        ballparkEstimateHigh: estimate.highMonthlyRange,
        estimatedMonthlyInvestment: estimate.totalEstimatedMonthlyInvestment,
        ratePerVisit: estimate.pricePerVisit,
        annualContractValue: estimate.annualContractValue,
        
        // Internal Tracking & CRM Fields (Always initial 'NEW')
        bookingStatus: 'NEW',
        confirmedDate: '',
        confirmedTime: '',
        assignedSalesRep: '',
        internalNotes: '',
        lastUpdated: now.toISOString()
      };

      // 3. Dispatch to Google Sheets Backend via Google Apps Script Webhook
      await submitBookingToGoogleSheets(bookingRecord, brandConfig.googleAppsScriptUrl);

      setSubmittedBooking(bookingRecord);
      if (onBookingSubmitted) {
        onBookingSubmitted(bookingRecord);
      }
      setStep('success');

    } catch (err: unknown) {
      console.error('Booking submission error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while processing your request. Please try again.'
      );
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset modal state when closing
  const handleModalClose = () => {
    onClose();
    // Delay resetting step so exit animation looks smooth
    setTimeout(() => {
      setStep('form');
      setFormErrors({});
      setSubmittedBooking(null);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schedule On-Site Facility Walkthrough
              </h3>
              <p className="text-xs text-slate-500">
                Request a 15-minute building assessment &amp; verify cleanable square footage
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estimator Context Summary Ribbon (Captured Snapshot) */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-800 font-bold">{sector.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{estimate.squareFootage.toLocaleString()} sq ft</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{frequency.label}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Ballpark Estimate:</span>
            <span className="text-blue-700 font-bold font-mono text-sm">
              {formatCurrency(estimate.lowMonthlyRange)} – {formatCurrency(estimate.highMonthlyRange)}/mo
            </span>
          </div>
        </div>

        {/* 1. Body Form Step */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            
            {/* Form Validation Alert Banner if any errors */}
            {Object.keys(formErrors).length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Please correct the highlighted fields:</strong>
                  <span>Ensure all required contact and preferred schedule details are completed.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                      formErrors.fullName ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g. David Vance"
                  />
                </div>
                {formErrors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{formErrors.fullName}</p>
                )}
              </div>

              {/* Company / Property Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company / Property Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                      formErrors.companyName ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g. Apex Innovation Park"
                  />
                </div>
                {formErrors.companyName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{formErrors.companyName}</p>
                )}
              </div>

              {/* Business Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                      formErrors.businessEmail ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="facility.mgr@company.com"
                  />
                </div>
                {formErrors.businessEmail && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{formErrors.businessEmail}</p>
                )}
              </div>

              {/* Direct Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Direct Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                      formErrors.phoneNumber ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="(555) 000-0000"
                  />
                </div>
                {formErrors.phoneNumber && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{formErrors.phoneNumber}</p>
                )}
              </div>

              {/* Preferred Walkthrough Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Walkthrough Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.preferredWalkthroughDate}
                    onChange={(e) => handleInputChange('preferredWalkthroughDate', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                      formErrors.preferredWalkthroughDate ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {formErrors.preferredWalkthroughDate && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{formErrors.preferredWalkthroughDate}</p>
                )}
              </div>

              {/* Preferred Time Window */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Time Window <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={formData.preferredTimeWindow}
                    onChange={(e) => handleInputChange('preferredTimeWindow', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Morning (8:00 AM – 12:00 PM)">Morning (8:00 AM – 12:00 PM)</option>
                    <option value="Early Afternoon (12:00 PM – 3:00 PM)">Early Afternoon (12:00 PM – 3:00 PM)</option>
                    <option value="Late Afternoon (3:00 PM – 6:00 PM)">Late Afternoon (3:00 PM – 6:00 PM)</option>
                    <option value="After Hours (After 6:00 PM)">After Hours (After 6:00 PM)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Special Instructions / Frustrations */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Cleaning Frustrations / Special Instructions (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={formData.cleaningFrustrations}
                  onChange={(e) => handleInputChange('cleaningFrustrations', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all"
                  placeholder="e.g. Current cleaners miss restroom deep tile scrubbing and executive conference room glass."
                />
              </div>
            </div>

            {/* Trust Assurance Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Zero Obligation Guarantee:</strong> Our on-site walkthrough takes under 15 minutes. We will verify cleanable square footage and deliver an itemized Scope of Work proposal within 24 hours.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-60 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Processing Walkthrough Request...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Walkthrough Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 2. Professional Confirmation State */}
        {step === 'success' && submittedBooking && (
          <div className="p-8 space-y-5 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Reference ID: {submittedBooking.bookingId}</span>
              </div>

              <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Walkthrough Request Received
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900 font-bold">{submittedBooking.fullName}</strong>. Your on-site walkthrough request for <strong className="text-slate-900 font-bold">{submittedBooking.companyName}</strong> has been logged.
              </p>
            </div>

            {/* Booking Snapshot Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  Requested Schedule
                </span>
                <span className="text-slate-900 font-bold">
                  {submittedBooking.preferredWalkthroughDate} • {submittedBooking.preferredTimeWindow}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  Facility Context
                </span>
                <span className="text-slate-800 font-medium">
                  {submittedBooking.squareFootage.toLocaleString()} sq ft • {submittedBooking.facilityType} ({submittedBooking.cleaningFrequency})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  Ballpark Estimate
                </span>
                <span className="text-blue-700 font-mono font-bold">
                  {formatCurrency(submittedBooking.ballparkEstimateLow)} – {formatCurrency(submittedBooking.ballparkEstimateHigh)} / mo
                </span>
              </div>
            </div>

            {/* Next Steps Notice (Clear expectation: Request under review, will be confirmed) */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-[11.5px] leading-relaxed">
                <p>
                  <strong className="text-blue-950 font-bold">What happens next:</strong> Our operations team for <span className="font-semibold text-slate-900">{brandConfig.primaryCity}</span> is reviewing your requested date and time. A commercial supervisor will contact you at <strong className="text-slate-900 font-bold">{submittedBooking.phoneNumber}</strong> or <strong className="text-slate-900 font-bold">{submittedBooking.businessEmail}</strong> within 1 business day to confirm your on-site walkthrough.
                </p>
                <p className="text-slate-500 text-[10.5px]">
                  * Please note: This is a requested time slot. Your official walkthrough appointment will be confirmed by our team.
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Done / Back to Estimator
              </button>
            </div>
          </div>
        )}

        {/* 3. Error Handling State (Preserves form data so user can retry) */}
        {step === 'error' && (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-bold text-slate-900">
              Unable to Complete Request
            </h4>

            <p className="text-xs text-rose-600 max-w-md mx-auto">
              {errorMessage || 'There was a temporary problem processing your walkthrough request.'}
            </p>

            <div className="pt-3 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
