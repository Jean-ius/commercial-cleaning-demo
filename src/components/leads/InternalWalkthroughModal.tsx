import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { LeadRecord, WalkthroughStatus } from '../../types/cleanCommand';

interface InternalWalkthroughModalProps {
  isOpen: boolean;
  lead: LeadRecord | null;
  onClose: () => void;
  onSaveWalkthrough: (updatedFields: Partial<LeadRecord>) => Promise<void> | void;
}

export const InternalWalkthroughModal: React.FC<InternalWalkthroughModalProps> = ({
  isOpen,
  lead,
  onClose,
  onSaveWalkthrough
}) => {
  if (!isOpen || !lead) return null;

  const [walkthroughStatus, setWalkthroughStatus] = useState<WalkthroughStatus>(
    lead.walkthroughStatus === 'NOT SCHEDULED' ? 'SCHEDULED' : lead.walkthroughStatus
  );
  const [walkthroughDate, setWalkthroughDate] = useState(lead.walkthroughDate || '');
  const [walkthroughTime, setWalkthroughTime] = useState(lead.walkthroughTime || '10:00 AM - 11:30 AM');
  const [assignedSalesRep, setAssignedSalesRep] = useState(lead.assignedSalesRep || 'Marcus Sterling');
  const [meetingInstructions, setMeetingInstructions] = useState(lead.meetingInstructions || '');
  const [walkthroughNotes, setWalkthroughNotes] = useState(lead.walkthroughNotes || '');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!walkthroughDate && walkthroughStatus === 'SCHEDULED') {
      setErrorMsg('Please select a walkthrough date.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveWalkthrough({
        walkthroughStatus,
        walkthroughDate,
        walkthroughTime,
        assignedSalesRep,
        meetingInstructions,
        walkthroughNotes,
        lastUpdated: new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save walkthrough.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Schedule On-Site Walkthrough</h2>
              <p className="text-xs text-slate-500">
                Facility inspection for <span className="text-slate-900 font-semibold">{lead.companyName}</span> ({lead.leadId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Walkthrough Status</label>
              <select
                value={walkthroughStatus}
                onChange={(e) => setWalkthroughStatus(e.target.value as WalkthroughStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
              >
                <option value="NOT SCHEDULED">NOT SCHEDULED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={assignedSalesRep}
                  onChange={(e) => setAssignedSalesRep(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Walkthrough Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={walkthroughDate}
                  onChange={(e) => setWalkthroughDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Window</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 11:30 AM"
                  value={walkthroughTime}
                  onChange={(e) => setWalkthroughTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting & Access Instructions</label>
            <input
              type="text"
              placeholder="e.g. Meet at Security Desk Suite 400. Bring photo ID."
              value={meetingInstructions}
              onChange={(e) => setMeetingInstructions(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Walkthrough Notes & Frustrations</label>
            <textarea
              rows={3}
              placeholder="Current contractor missed restrooms, high dust on return diffusers..."
              value={walkthroughNotes}
              onChange={(e) => setWalkthroughNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none shadow-sm"
            />
          </div>

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
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Walkthrough
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
