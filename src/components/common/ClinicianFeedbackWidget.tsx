import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Send,
  X,
  Sparkles,
  Clock,
  FileCheck,
  ChevronDown,
  ChevronUp,
  History,
  AlertCircle
} from 'lucide-react';
import { ClinicianAiFeedback, PatientDigitalTwinState } from '../../types';

interface ClinicianFeedbackWidgetProps {
  patient: PatientDigitalTwinState;
  predictionSnippet?: string;
  className?: string;
  onFeedbackSubmitted?: (feedback: ClinicianAiFeedback) => void;
}

const STORAGE_KEY = 'quantum_rx_clinician_ai_feedback';

export const ClinicianFeedbackWidget: React.FC<ClinicianFeedbackWidgetProps> = ({
  patient,
  predictionSnippet,
  className = '',
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<'accurate' | 'inaccurate' | null>(null);
  const [showInaccuracyForm, setShowInaccuracyForm] = useState(false);
  const [category, setCategory] = useState<ClinicianAiFeedback['inaccuracyCategory']>('dosage_error');
  const [severity, setSeverity] = useState<ClinicianAiFeedback['severity']>('medium');
  const [notes, setNotes] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<ClinicianAiFeedback | null>(null);
  const [recentFlaggedLogs, setRecentFlaggedLogs] = useState<ClinicianAiFeedback[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing feedback history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentFlaggedLogs(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveFeedbackToStorage = (newFeedback: ClinicianAiFeedback) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newFeedback, ...(Array.isArray(parsed) ? parsed : [])].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentFlaggedLogs(updated);
    } catch {
      // ignore
    }
  };

  const handleThumbsUp = () => {
    setRating('accurate');
    setShowInaccuracyForm(false);
    const feedback: ClinicianAiFeedback = {
      id: `FB-${Date.now().toString().slice(-6)}`,
      patientId: patient.patientId,
      predictionSnippet: predictionSnippet || `AI Insights & Recommendation for ${patient.name}`,
      rating: 'accurate',
      flaggedForReview: false,
      reviewStatus: 'resolved',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      submittedBy: 'Attending Clinician'
    };
    setSubmittedFeedback(feedback);
    saveFeedbackToStorage(feedback);
    if (onFeedbackSubmitted) onFeedbackSubmitted(feedback);
  };

  const handleThumbsDown = () => {
    setRating('inaccurate');
    setShowInaccuracyForm(true);
  };

  const handleSubmitInaccurateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedback: ClinicianAiFeedback = {
      id: `FLAG-REV-${Date.now().toString().slice(-6)}`,
      patientId: patient.patientId,
      predictionSnippet: predictionSnippet || `AI reasoning output for ${patient.name}`,
      rating: 'inaccurate',
      inaccuracyCategory: category,
      severity: severity,
      clinicianNotes: notes.trim() || 'Clinician flagged prediction as clinically inaccurate.',
      flaggedForReview: true,
      reviewStatus: 'queued',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      submittedBy: 'Attending Clinician'
    };

    setTimeout(() => {
      setSubmittedFeedback(feedback);
      setShowInaccuracyForm(false);
      setIsSubmitting(false);
      saveFeedbackToStorage(feedback);
      if (onFeedbackSubmitted) onFeedbackSubmitted(feedback);
    }, 400);
  };

  const handleReset = () => {
    setRating(null);
    setShowInaccuracyForm(false);
    setSubmittedFeedback(null);
    setNotes('');
  };

  const categoryLabels: Record<NonNullable<ClinicianAiFeedback['inaccuracyCategory']>, string> = {
    dosage_error: '💊 Incorrect Dosage / Kinetics Calculation',
    missed_contraindication: '⚠️ Missed Contraindication / Safety Alert',
    interaction_hallucination: '🔍 Hallucinated Drug Interaction',
    guideline_discrepancy: '📚 Clinical Guideline Discrepancy (KDIGO/ADA/CPIC)',
    genomic_mismatch: '🧬 PGx Metabolic Pathway Mismatch',
    other: '📝 Other Clinical Reasoning Discrepancy'
  };

  const severityBadges: Record<NonNullable<ClinicianAiFeedback['severity']>, { label: string; class: string }> = {
    low: { label: 'Minor Discrepancy', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    medium: { label: 'Actionable Inaccuracy', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    critical: { label: 'Critical Safety Risk', class: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const patientSpecificFlagged = recentFlaggedLogs.filter((f) => f.patientId === patient.patientId);

  return (
    <div className={`rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs transition-all ${className}`}>
      {/* Top Bar: Title & Thumbs Up/Down Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0F172A]">Clinician AI Prediction Feedback</span>
              <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                Model Quality & Safety
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Was this AI clinical reasoning output accurate for {patient.name.split(' (')[0]}?
            </p>
          </div>
        </div>

        {/* Action Controls / Feedback State */}
        <div className="flex items-center space-x-2 shrink-0">
          {!submittedFeedback ? (
            <>
              <button
                type="button"
                onClick={handleThumbsUp}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                  rating === 'accurate'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                }`}
                title="Accurate Prediction"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Accurate</span>
              </button>

              <button
                type="button"
                onClick={handleThumbsDown}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                  rating === 'inaccurate'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                }`}
                title="Report Inaccurate Prediction & Flag for Review"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Inaccurate (Flag)</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 border ${
                  submittedFeedback.rating === 'accurate'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {submittedFeedback.rating === 'accurate' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Marked Accurate</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5 text-rose-600" />
                    <span>Flagged for Review</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline font-mono"
              >
                Edit
              </button>
            </div>
          )}

          {recentFlaggedLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryModal(!showHistoryModal)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-all flex items-center space-x-1 border border-slate-200"
              title="View Flagged Review Queue"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Review Queue ({recentFlaggedLogs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Accurate State Notification Banner */}
      {submittedFeedback && submittedFeedback.rating === 'accurate' && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Feedback Recorded:</strong> Verified by clinician. Output logged to active safety calibration dataset.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600">{submittedFeedback.timestamp}</span>
        </div>
      )}

      {/* Inaccuracy Reporting & Flagging Form */}
      {showInaccuracyForm && !submittedFeedback && (
        <form onSubmit={handleSubmitInaccurateReport} className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900">
              <strong className="block font-semibold">Report Inaccurate Clinical Reasoning</strong>
              <span>
                Please specify the nature of the inaccuracy. This discrepancy will be logged in the Pharmacovigilance & Model Safety Review queue for verification against clinical trials and guideline committees.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Discrepancy Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discrepancy Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClinicianAiFeedback['inaccuracyCategory'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
              >
                <option value="dosage_error">💊 Incorrect Dosage / Kinetics Calculation</option>
                <option value="missed_contraindication">⚠️ Missed Contraindication / Safety Alert</option>
                <option value="interaction_hallucination">🔍 Hallucinated Drug-Drug Interaction</option>
                <option value="guideline_discrepancy">📚 Clinical Guideline Discrepancy (KDIGO/ADA/CPIC)</option>
                <option value="genomic_mismatch">🧬 PGx Metabolic Pathway Mismatch</option>
                <option value="other">📝 Other Clinical Reasoning Inaccuracy</option>
              </select>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Severity Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'critical'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold capitalize transition-all border ${
                      severity === lvl
                        ? lvl === 'critical'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : lvl === 'medium'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clinician Notes & Correction */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinician Correction & Reasoning Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what the model got wrong, what guideline was breached, or what the correct clinical recommendation should be..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowInaccuracyForm(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 transition-all font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all font-mono disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Flagging Review...' : 'Submit & Flag for Future Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Flagged Status Confirmation Card */}
      {submittedFeedback && submittedFeedback.rating === 'inaccurate' && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-bold text-rose-900 font-mono">
                FLAGGED FOR REVIEW: {submittedFeedback.id}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase border border-rose-200">
              Status: {submittedFeedback.reviewStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Category</span>
              <span className="font-semibold text-slate-800">
                {categoryLabels[submittedFeedback.inaccuracyCategory || 'other']}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Severity</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  severityBadges[submittedFeedback.severity || 'medium'].class
                }`}
              >
                {severityBadges[submittedFeedback.severity || 'medium'].label}
              </span>
            </div>
          </div>

          {submittedFeedback.clinicianNotes && (
            <div className="pt-2 border-t border-rose-200/60 text-xs text-slate-700">
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Clinician Correction:</span>
              <p className="mt-0.5 italic">"{submittedFeedback.clinicianNotes}"</p>
            </div>
          )}

          <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Submitted to Clinical AI Safety Oversight Queue</span>
            <span>{submittedFeedback.timestamp}</span>
          </div>
        </div>
      )}

      {/* Review Queue Drawer / Modal */}
      {showHistoryModal && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-[#0F172A]">Flagged Prediction Review Queue</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {recentFlaggedLogs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No feedback entries recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {recentFlaggedLogs.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {item.rating === 'accurate' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Flag className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {item.id}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                  </div>

                  {item.inaccuracyCategory && (
                    <p className="text-[11px] font-semibold text-slate-700">
                      {categoryLabels[item.inaccuracyCategory]}
                    </p>
                  )}

                  {item.clinicianNotes && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-2">
                      "{item.clinicianNotes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
