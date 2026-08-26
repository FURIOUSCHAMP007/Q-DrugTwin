import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldAlert,
  Dna,
  Pill,
  Activity,
  ArrowRight,
  CheckCircle2,
  Filter,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { PatientRiskNotification, PatientDigitalTwinState } from '../../types';

interface PatientRiskNotificationPanelProps {
  activePatient: PatientDigitalTwinState;
  notifications: PatientRiskNotification[];
  allCohortNotifications?: PatientRiskNotification[];
  onSelectPatient?: (patientId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const PatientRiskNotificationPanel: React.FC<PatientRiskNotificationPanelProps> = ({
  activePatient,
  notifications,
  allCohortNotifications = [],
  onSelectPatient,
  onNavigateToTab,
  onDismissAlert
}) => {
  const [viewScope, setViewScope] = useState<'active' | 'cohort'>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'moderate'>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(notifications[0]?.id || null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const displayedList = viewScope === 'active' ? notifications : allCohortNotifications;

  const filteredAlerts = displayedList.filter((alert) => {
    if (severityFilter === 'all') return true;
    return alert.severity === severityFilter;
  });

  const criticalCount = displayedList.filter((a) => a.severity === 'critical').length;
  const highCount = displayedList.filter((a) => a.severity === 'high').length;
  const moderateCount = displayedList.filter((a) => a.severity === 'moderate').length;

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getAlertIcon = (type: PatientRiskNotification['type']) => {
    switch (type) {
      case 'dosage_threshold':
        return <Gauge className="w-4 h-4 text-rose-600" />;
      case 'ddi':
        return <AlertTriangle className="w-4 h-4" />;
      case 'renal_dose':
        return <Activity className="w-4 h-4" />;
      case 'genomic':
        return <Dna className="w-4 h-4" />;
      case 'adr_toxicity':
        return <AlertOctagon className="w-4 h-4" />;
      default:
        return <Pill className="w-4 h-4" />;
    }
  };

  const getSeverityStyle = (severity: PatientRiskNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
          indicator: 'bg-rose-600',
          accentBorder: 'border-l-rose-500',
          cardBg: 'bg-rose-50/30 hover:bg-rose-50/50'
        };
      case 'high':
        return {
          badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
          indicator: 'bg-amber-500',
          accentBorder: 'border-l-amber-500',
          cardBg: 'bg-amber-50/30 hover:bg-amber-50/50'
        };
      case 'moderate':
        return {
          badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
          indicator: 'bg-blue-500',
          accentBorder: 'border-l-blue-500',
          cardBg: 'bg-blue-50/30 hover:bg-blue-50/50'
        };
      default:
        return {
          badgeBg: 'bg-slate-50 border-slate-200 text-slate-700',
          indicator: 'bg-slate-400',
          accentBorder: 'border-l-slate-400',
          cardBg: 'bg-slate-50/30 hover:bg-slate-50/50'
        };
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white via-[#F8FAFF] to-white">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                Predictive Clinical Risk & Pharmacovigilance Alerts
              </h3>
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold animate-pulse">
                  {criticalCount} CRITICAL
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous neural monitoring across DDI graphs, organ clearance caps, and CYP450 diplotypes
            </p>
          </div>
        </div>

        {/* Filter Controls & Scope Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active vs Cohort Switch */}
          <div className="p-0.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewScope('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewScope === 'active'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activePatient.patientId} ({notifications.length})
            </button>
            <button
              onClick={() => setViewScope('cohort')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewScope === 'cohort'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Cohort ({allCohortNotifications.length})
            </button>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                severityFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All ({displayedList.length})
            </button>
            {criticalCount > 0 && (
              <button
                onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  severityFilter === 'critical'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                Critical ({criticalCount})
              </button>
            )}
            {highCount > 0 && (
              <button
                onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  severityFilter === 'high'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                High ({highCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert List Container */}
      <div className="p-4 sm:p-5 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8FAFF] border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Active Clinical Risk Alerts</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All monitored patient parameters, organ clearance thresholds, and medication combinations are within guideline-concordant limits.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            const isAcknowledged = acknowledgedAlerts.has(alert.id);
            const style = getSeverityStyle(alert.severity);

            return (
              <div
                key={alert.id}
                onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                className={`rounded-2xl border border-slate-200/90 border-l-4 ${style.accentBorder} transition-all cursor-pointer shadow-xs ${
                  isAcknowledged ? 'opacity-70 bg-slate-50' : 'bg-white hover:border-slate-300'
                }`}
              >
                {/* Collapsed Header Bar */}
                <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${style.badgeBg}`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {viewScope === 'cohort' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectPatient) onSelectPatient(alert.patientId);
                            }}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200 hover:bg-blue-100"
                          >
                            {alert.patientId} • {alert.patientName}
                          </button>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${style.badgeBg}`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {alert.type.replace('_', ' ')}
                        </span>
                        {isAcknowledged && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold">
                            ACKNOWLEDGED
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-1 font-normal">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => handleAcknowledge(alert.id, e)}
                      title={isAcknowledged ? 'Mark unacknowledged' : 'Acknowledge clinical alert'}
                      className={`p-1.5 rounded-xl border text-[11px] font-mono transition-all flex items-center space-x-1 ${
                        isAcknowledged
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{isAcknowledged ? 'Reviewed' : 'Acknowledge'}</span>
                    </button>

                    <div className="p-1 rounded-lg text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Clinical Details Accordion */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 bg-[#F8FAFF]/60 rounded-b-2xl">
                    {/* Dosage Threshold Comparison Card */}
                    {alert.dosageDetails && (
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs font-mono">
                        <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                          <span className="font-bold text-rose-900 flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5 text-rose-600" />
                            <span>Digital Twin Historical Tolerance Metric</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            +{alert.dosageDetails.percentageExceeded}% EXCEEDED
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                          <div className="p-2 rounded-lg bg-white border border-rose-100">
                            <span className="text-[10px] text-slate-500 block">Proposed / Active</span>
                            <span className="text-sm font-extrabold text-rose-700">
                              {alert.dosageDetails.proposedDose} {alert.dosageDetails.unit}/d
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-rose-100">
                            <span className="text-[10px] text-slate-500 block">Safe Historical Cap</span>
                            <span className="text-sm font-extrabold text-emerald-700">
                              {alert.dosageDetails.thresholdDose} {alert.dosageDetails.unit}/d
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-rose-100">
                            <span className="text-[10px] text-slate-500 block">Limiting Mechanism</span>
                            <span className="text-xs font-bold text-slate-800 uppercase block truncate">
                              {alert.dosageDetails.limitingFactor.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                      {/* Clinical Rationale */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                          Biomedical Mechanism / Rationale
                        </span>
                        <p className="text-slate-700 leading-relaxed font-normal">
                          {alert.clinicalRationale}
                        </p>
                      </div>

                      {/* Action Recommendation */}
                      <div className="p-3 rounded-xl bg-white border border-blue-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-blue-700 block flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          Recommended Clinical Action
                        </span>
                        <p className="text-slate-800 font-semibold leading-relaxed">
                          {alert.actionRecommendation}
                        </p>
                      </div>
                    </div>

                    {/* Affected Medications & Evidence Source */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Affected Meds:</span>
                        {alert.affectedMedications.map((med, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold"
                          >
                            {med}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <span>Source:</span>
                        <span className="text-purple-700 font-semibold">{alert.evidenceSource}</span>
                      </div>
                    </div>

                    {/* Direct Quick Action CTAs */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/60">
                      {onNavigateToTab && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToTab('simulation-lab');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Simulate Regimen Adjustment</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToTab('quantum-optimizer');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 flex items-center space-x-1.5"
                          >
                            <Zap className="w-3 h-3 text-purple-600" />
                            <span>Run QUBO Deprescribing Optimizer</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToTab('interactions');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center space-x-1.5"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                            <span>Inspect in PharmaGNN Graph</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
