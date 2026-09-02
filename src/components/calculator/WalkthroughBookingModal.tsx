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
  MessageSquare
} from 'lucide-react';
import { EstimateResult, ClientBrandConfig, WalkthroughLead } from '../../types/cleanCommand';
import { facilitySectors, frequencyOptions } from '../../config/clientConfig';
import { formatCurrency } from '../../utils/pricingEngine';

interface WalkthroughBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: EstimateResult;
  brandConfig: ClientBrandConfig;
  onLeadSubmitted?: (lead: WalkthroughLead) => void;
}

export const WalkthroughBookingModal: React.FC<WalkthroughBookingModalProps> = ({
  isOpen,
  onClose,
  estimate,
  brandConfig,
  onLeadSubmitted
}) => {
  const [step, setStep] = useState<'details' | 'success' | 'error'>('details');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTimeWindow: 'Morning (8:00 AM – 12:00 PM)',
    currentPainPoints: '',
    termsAgreed: true
  });

  if (!isOpen) return null;

  const sector = facilitySectors.find(s => s.id === estimate.sectorId) || facilitySectors[0];
  const frequency = frequencyOptions.find(f => f.id === estimate.frequencyId) || frequencyOptions[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const leadPayload: WalkthroughLead = {
      contactName: formData.contactName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      facilityType: sector.name,
      squareFootage: estimate.squareFootage,
      frequency: frequency.label,
      estimatedMonthlyValue: estimate.totalEstimatedMonthlyInvestment,
      preferredWalkthroughDate: formData.preferredDate || 'Earliest Available',
      preferredTimeWindow: formData.preferredTimeWindow,
      currentCleaningPainPoints: formData.currentPainPoints || 'Not specified',
      submittedAt: new Date().toISOString()
    };

    // If client provided a live Google Apps Script endpoint, dispatch HTTPS POST
    if (brandConfig.googleAppsScriptUrl && brandConfig.googleAppsScriptUrl.startsWith('http')) {
      try {
        await fetch(brandConfig.googleAppsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script handles no-cors redirects cleanly
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(leadPayload)
        });
        
        if (onLeadSubmitted) onLeadSubmitted(leadPayload);
        setStep('success');
      } catch (err) {
        console.error('Webhook dispatch error:', err);
        setErrorMessage('Failed to connect to Google Sheets CRM. Please verify the Webhook URL in client configuration.');
        setStep('error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Demo / Local Mode (Endpoint not yet populated)
      setTimeout(() => {
        if (onLeadSubmitted) onLeadSubmitted(leadPayload);
        setIsSubmitting(false);
        setStep('success');
      }, 700);
    }
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
                Lock in your ballpark rate &amp; get a formal Scope of Work proposal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estimate Summary Ribbon */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
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

        {/* Body Form */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g. David Vance"
                  />
                </div>
              </div>

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
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g. Apex Innovation Park"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="facility.mgr@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Direct Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Walkthrough Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Time Window
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={formData.preferredTimeWindow}
                    onChange={(e) => setFormData({ ...formData, preferredTimeWindow: e.target.value })}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Cleaning Frustrations / Special Instructions (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={formData.currentPainPoints}
                  onChange={(e) => setFormData({ ...formData, currentPainPoints: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. Current cleaners consistently miss restroom grout and conference room trash cans."
                />
              </div>
            </div>

            {/* Trust Assurance */}
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
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Logging to Google Sheet...</span>
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

        {/* Success Confirmation View */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold text-slate-900">
              Walkthrough Request Received!
            </h4>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-slate-900">{formData.contactName}</strong>. Your estimate of{' '}
              <strong className="text-blue-700 font-bold">{formatCurrency(estimate.totalEstimatedMonthlyInvestment)}/month</strong> has been logged. Our commercial supervisor for{' '}
              <span className="text-blue-600 font-semibold">{brandConfig.primaryCity}</span> will contact you at{' '}
              <strong className="text-slate-900">{formData.phone}</strong> to confirm your walkthrough time.
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Back to Estimator
              </button>
            </div>
          </div>
        )}

        {/* Error View */}
        {step === 'error' && (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-bold text-slate-900">
              Submission Notice
            </h4>

            <p className="text-xs text-rose-600 max-w-md mx-auto">
              {errorMessage}
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setStep('details')}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-300"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
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
