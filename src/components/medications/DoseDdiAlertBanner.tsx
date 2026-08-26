import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Info,
  Layers,
  FlaskConical,
  XCircle,
  FileCheck,
  Sliders
} from 'lucide-react';
import { DoseDdiConflict, MedicationScheduleReminder, PatientDigitalTwinState } from '../../types';
import { minutesToTimeString, timeStringToMinutes } from '../../utils/doseDdiConflictAnalyzer';
import { medicationScheduleService } from '../../services/medicationScheduleService';

interface DoseDdiAlertBannerProps {
  patient: PatientDigitalTwinState;
  conflicts: DoseDdiConflict[];
  schedules: MedicationScheduleReminder[];
  onRefreshSchedules: () => void;
  onNavigateToSimulation?: (drugName: string) => void;
  onOpenWhatIfSimulator?: () => void;
  onOpenScheduleEdit?: (schedule: MedicationScheduleReminder) => void;
}

export const DoseDdiAlertBanner: React.FC<DoseDdiAlertBannerProps> = ({
  patient,
  conflicts,
  schedules,
  onRefreshSchedules,
  onNavigateToSimulation,
  onOpenWhatIfSimulator,
  onOpenScheduleEdit
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'all' | 'critical' | 'high' | 'today'>('all');
  const [selectedConflictDetail, setSelectedConflictDetail] = useState<DoseDdiConflict | null>(null);
  const [overrideNotes, setOverrideNotes] = useState<Record<string, string>>({});
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [autoAdjustSuccessMessage, setAutoAdjustSuccessMessage] = useState<string | null>(null);

  if (conflicts.length === 0) {
    return (
      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900 flex items-center space-x-2">
              <span>DDI Dose Screening Status: Clear</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-semibold">
                0 Active Conflicts
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-sans mt-0.5">
              All upcoming scheduled medication administration times comply with pharmacokinetic separation guidelines and CPIC safety parameters.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
          Continuous Screening Active
        </span>
      </div>
    );
  }

  // Filter conflicts based on active tab
  const todayStr = '2026-08-25';
  const visibleConflicts = conflicts.filter((c) => {
    if (acknowledgedIds.has(c.id)) return false;
    if (selectedSeverityFilter === 'today') return c.date === todayStr;
    if (selectedSeverityFilter === 'critical') return c.severity === 'contraindicated';
    if (selectedSeverityFilter === 'high') return c.severity === 'high' || c.severity === 'contraindicated';
    return true;
  });

  const criticalCount = conflicts.filter((c) => c.severity === 'contraindicated').length;
  const highCount = conflicts.filter((c) => c.severity === 'high').length;
  const todayCount = conflicts.filter((c) => c.date === todayStr).length;

  // Handle Auto-Adjusting Schedule Time to resolve kinetic overlap
  const handleAutoAdjustDoseTime = (conflict: DoseDdiConflict) => {
    const targetScheduleId = conflict.scheduleBId || conflict.scheduleAId;
    const targetSchedule = schedules.find((s) => s.id === targetScheduleId);

    if (!targetSchedule) return;

    const offsetHours = conflict.suggestedTimeOffsetHours || 4;
    const currentMins = timeStringToMinutes(conflict.timeB && conflict.timeB !== 'Baseline Continuous' ? conflict.timeB : conflict.timeA);
    const newMins = (currentMins + offsetHours * 60) % 1440;
    const newTimeStr = minutesToTimeString(newMins);

    // Replace the conflicting time in schedule
    const updatedTimes = targetSchedule.timesOfDay.map((t) => {
      if (t === (conflict.timeB && conflict.timeB !== 'Baseline Continuous' ? conflict.timeB : conflict.timeA)) {
        return newTimeStr;
      }
      return t;
    });

    const updatedSchedule: MedicationScheduleReminder = {
      ...targetSchedule,
      timesOfDay: updatedTimes,
      specialPrecautions: `${targetSchedule.specialPrecautions ? targetSchedule.specialPrecautions + ' ' : ''}Time adjusted to ${newTimeStr} to prevent DDI kinetic peak with ${conflict.drugA}.`
    };

    medicationScheduleService.saveSchedule(updatedSchedule);
    onRefreshSchedules();

    setAutoAdjustSuccessMessage(
      `Auto-adjusted ${targetSchedule.medicationName} dosing time from ${conflict.timeB || conflict.timeA} to ${newTimeStr} (+${offsetHours}h separation). DDI kinetic conflict resolved!`
    );

    setTimeout(() => {
      setAutoAdjustSuccessMessage(null);
    }, 5000);
  };

  const handleAcknowledgeOverride = (conflictId: string) => {
    setAcknowledgedIds((prev) => new Set([...prev, conflictId]));
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-amber-50/90 via-rose-50/70 to-amber-50/90 border border-amber-300/80 p-4 lg:p-5 shadow-xs transition-all">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                Automated DDI Dose Collision Warning System
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-mono font-bold">
                {conflicts.length} Upcoming Conflicts Flagged
              </span>
              {todayCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                  {todayCount} on Today's Schedule
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 font-sans mt-0.5">
              The automated clinical decision engine detected scheduled dose timing overlaps with active drug-drug interactions for <span className="font-semibold text-slate-900">{patient.name.split(' (')[0]}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 text-xs font-mono font-bold text-slate-700 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <span>{isExpanded ? 'Collapse Alert Panel' : 'Review Conflicts'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Auto-Adjust Success Alert */}
      {autoAdjustSuccessMessage && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{autoAdjustSuccessMessage}</span>
        </div>
      )}

      {/* Expanded Conflict Cards & Filter Tabs */}
      {isExpanded && (
        <div className="mt-4 space-y-3 pt-3 border-t border-amber-200/80">
          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-slate-500 font-medium">Filter by:</span>
            <button
              onClick={() => setSelectedSeverityFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                selectedSeverityFilter === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-amber-200'
              }`}
            >
              All ({conflicts.length})
            </button>
            <button
              onClick={() => setSelectedSeverityFilter('today')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                selectedSeverityFilter === 'today'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-amber-200'
              }`}
            >
              Today's Schedule ({todayCount})
            </button>
            {criticalCount > 0 && (
              <button
                onClick={() => setSelectedSeverityFilter('critical')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                  selectedSeverityFilter === 'critical'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white/80 text-rose-700 hover:bg-white border border-rose-200'
                }`}
              >
                Contraindicated ({criticalCount})
              </button>
            )}
            <button
              onClick={() => setSelectedSeverityFilter('high')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                selectedSeverityFilter === 'high'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/80 text-amber-800 hover:bg-white border border-amber-200'
              }`}
            >
              High Risk ({highCount + criticalCount})
            </button>
          </div>

          {/* Conflict Cards Grid */}
          <div className="grid grid-cols-1 gap-3 font-sans">
            {visibleConflicts.map((conflict) => {
              const isContraindicated = conflict.severity === 'contraindicated';
              const isToday = conflict.date === todayStr;

              return (
                <div
                  key={conflict.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isContraindicated
                      ? 'bg-white border-rose-300 shadow-xs'
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Drugs & Severity */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase ${
                            isContraindicated
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : conflict.severity === 'high'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          {isContraindicated ? '🚨 Contraindicated Overlap' : `${conflict.severity.toUpperCase()} RISK INTERACTION`}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500">
                          Scheduled: <strong className="text-slate-800">{conflict.date}</strong>
                          {isToday && <span className="ml-1 text-blue-600 font-bold">(Today)</span>}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {conflict.timeDeltaMinutes === 0
                            ? 'Concurrent @ ' + conflict.timeA
                            : `Within ${conflict.timeDeltaMinutes} mins (${conflict.timeA} vs ${conflict.timeB})`}
                        </span>
                      </div>

                      {/* Drug Collision Badges */}
                      <div className="flex items-center space-x-2 pt-1 flex-wrap">
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{conflict.drugA}</span>
                          <span className="text-slate-500 font-normal text-[11px]">({conflict.dosageA || 'Active'} @ {conflict.timeA})</span>
                        </div>

                        <span className="text-rose-500 font-bold font-mono text-xs">⚡ CONFLICTS WITH ⚡</span>

                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>{conflict.drugB}</span>
                          <span className="text-slate-500 font-normal text-[11px]">
                            ({conflict.dosageB || 'Active'}{conflict.timeB ? ` @ ${conflict.timeB}` : ''})
                          </span>
                        </div>
                      </div>

                      {/* Mechanism & Effect description */}
                      <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1">
                        <strong className="text-slate-900">Adverse Impact:</strong> {conflict.clinicalEffect}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                        <strong className="text-slate-700">Kinetics:</strong> {conflict.mechanism}
                      </p>
                      <p className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 p-2 rounded-lg font-sans">
                        <strong className="font-semibold">Guideline Recommendation:</strong> {conflict.managementRecommendation}
                      </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                      {onOpenWhatIfSimulator && (
                        <button
                          onClick={onOpenWhatIfSimulator}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                          title="Simulate dosage reduction what-if scenarios"
                        >
                          <Sliders className="w-3.5 h-3.5 text-purple-600" />
                          <span>Simulate Dose Slider</span>
                        </button>
                      )}

                      {conflict.suggestedAction === 'separate_times' && (
                        <button
                          onClick={() => handleAutoAdjustDoseTime(conflict)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>⚡ Auto-Adjust Time (+{conflict.suggestedTimeOffsetHours || 4}h)</span>
                        </button>
                      )}

                      {conflict.suggestedAction === 'substitute_agent' && onNavigateToSimulation && (
                        <button
                          onClick={() => onNavigateToSimulation(conflict.drugA)}
                          className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                        >
                          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                          <span>Simulate Substitute in Lab</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleAcknowledgeOverride(conflict.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Acknowledge / Override</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
