import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Search,
  Dna,
  ShieldAlert,
  Plus,
  ArrowRight,
  Activity,
  CheckCircle,
  FlaskConical,
  ExternalLink,
  Calendar,
  Clock,
  Bell,
  Sparkles,
  Sliders
} from 'lucide-react';
import { PatientDigitalTwinState, Medication, MedicationScheduleReminder, DoseDdiConflict } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';
import { VoiceDictationButton } from '../common/VoiceDictationButton';
import { MedicationScheduleCalendar } from '../medications/MedicationScheduleCalendar';
import { MedicationReminderModal } from '../medications/MedicationReminderModal';
import { DoseDdiAlertBanner } from '../medications/DoseDdiAlertBanner';
import { WhatIfDosageSimulator } from '../medications/WhatIfDosageSimulator';
import { analyzeScheduleDdiConflicts } from '../../utils/doseDdiConflictAnalyzer';
import { medicationScheduleService } from '../../services/medicationScheduleService';

interface MedicationWorkspaceViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
  onSelectCandidateForSimulation: (candidate: Medication) => void;
}

type WorkspaceSubTab = 'calendar' | 'whatif-simulator' | 'regimen-pgx' | 'candidates';

export const MedicationWorkspaceView: React.FC<MedicationWorkspaceViewProps> = ({
  patient,
  onNavigate,
  onSelectCandidateForSimulation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Schedules state for the selected patient
  const [schedules, setSchedules] = useState<MedicationScheduleReminder[]>(() =>
    medicationScheduleService.getPatientSchedules(patient.patientId, patient)
  );

  // Modal state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<MedicationScheduleReminder | null>(null);

  // Reload schedules whenever patient changes
  useEffect(() => {
    setSchedules(medicationScheduleService.getPatientSchedules(patient.patientId, patient));
  }, [patient]);

  const handleRefreshSchedules = () => {
    setSchedules(medicationScheduleService.getPatientSchedules(patient.patientId, patient));
  };

  // Analyze active automated DDI conflicts across current schedules and medications
  const conflicts = useMemo(() => {
    return analyzeScheduleDdiConflicts(patient, schedules, '2026-08-25', 7);
  }, [patient, schedules]);

  // Automated intelligent dose collision resolution
  const handleAutoAdjustConflict = (conflict: DoseDdiConflict) => {
    const targetSchedule = schedules.find((s) => s.id === conflict.scheduleAId);
    if (targetSchedule) {
      const offset = conflict.suggestedTimeOffsetHours || 4;
      const updatedTimes = targetSchedule.timesOfDay.map((t) => {
        if (t === conflict.timeA) {
          const [hh, mm] = t.split(':').map(Number);
          const newHh = (hh + offset) % 24;
          return `${String(newHh).padStart(2, '0')}:${String(mm || 0).padStart(2, '0')}`;
        }
        return t;
      });

      const updatedSchedule: MedicationScheduleReminder = {
        ...targetSchedule,
        timesOfDay: updatedTimes,
        specialPrecautions: targetSchedule.specialPrecautions
          ? `${targetSchedule.specialPrecautions} (DDI Interval: Spaced from ${conflict.drugB})`
          : `DDI Timing Adjusted: Spaced ≥${offset}h from ${conflict.drugB}`
      };

      medicationScheduleService.saveSchedule(updatedSchedule);
      handleRefreshSchedules();
    }
  };

  const handleOpenCreateModal = (preselectedMed?: Medication) => {
    if (preselectedMed) {
      setEditingSchedule({
        id: `sched-${patient.patientId}-${preselectedMed.id}-${Date.now()}`,
        patientId: patient.patientId,
        medicationId: preselectedMed.id,
        medicationName: preselectedMed.name,
        dosage: preselectedMed.dosage,
        route: preselectedMed.route || 'Oral (Tablet)',
        frequencyType: preselectedMed.frequency.toLowerCase().includes('weekly')
          ? 'weekly'
          : preselectedMed.frequency.toLowerCase().includes('monthly')
          ? 'monthly'
          : 'daily',
        timesOfDay: preselectedMed.frequency.toLowerCase().includes('twice')
          ? ['08:00', '20:00']
          : ['08:00'],
        startDate: '2026-08-25',
        administrationInstruction: `Take ${preselectedMed.dosage} ${preselectedMed.frequency} as directed.`,
        notificationChannels: ['in_app', 'sms'],
        priority: 'standard',
        refillReminderEnabled: true,
        refillDaysNotice: 5,
        status: 'active',
        createdAt: new Date().toISOString(),
        colorTag: '#3B82F6',
        adherenceHistory: []
      });
    } else {
      setEditingSchedule(null);
    }
    setIsReminderModalOpen(true);
  };

  const handleOpenEditModal = (schedule: MedicationScheduleReminder) => {
    setEditingSchedule(schedule);
    setIsReminderModalOpen(true);
  };

  const handleSaveSchedule = (scheduleToSave: MedicationScheduleReminder) => {
    medicationScheduleService.saveSchedule(scheduleToSave);
    handleRefreshSchedules();
  };

  const filteredCandidates = CANDIDATE_MEDICATIONS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.brandName && m.brandName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || m.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] flex items-center space-x-2.5 tracking-tight">
            <Pill className="w-5 h-5 text-blue-600" />
            <span>Medication, <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Schedule & PGx</span> Workspace</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Configure calendar dosage reminders (daily, weekly, monthly), review active regimens, and evaluate CYP450 metabolic kinetics for {patient.name.split(' (')[0]}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('whatif-simulator')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs ${
              activeSubTab === 'whatif-simulator'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>⚡ What-If Dosage Simulator</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Clock className="w-4 h-4" />
            <span>+ Set Dosage Reminder</span>
          </button>

          <button
            onClick={() => onNavigate('simulation-lab')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.01] flex items-center space-x-2"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Simulation Lab</span>
          </button>
        </div>
      </div>

      {/* Automated Real-time DDI Alert Banner */}
      <DoseDdiAlertBanner
        patient={patient}
        conflicts={conflicts}
        schedules={schedules}
        onRefreshSchedules={handleRefreshSchedules}
        onOpenWhatIfSimulator={() => setActiveSubTab('whatif-simulator')}
        onNavigateToSimulation={(drugName) => {
          const cand = CANDIDATE_MEDICATIONS.find(c => c.name.toLowerCase().includes(drugName.toLowerCase()));
          if (cand) onSelectCandidateForSimulation(cand);
          onNavigate('simulation-lab');
        }}
        onOpenScheduleEdit={handleOpenEditModal}
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('whatif-simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'whatif-simulator'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-xs'
              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>What-If Dosage & DDI Simulator</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeSubTab === 'whatif-simulator' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
          }`}>
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar & Dosage Reminders</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {schedules.filter(s => s.status === 'active').length}
          </span>
          {conflicts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
              {conflicts.length} DDI
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('regimen-pgx')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'regimen-pgx'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Dna className="w-4 h-4" />
          <span>Active Regimen & PGx Metabolism</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'regimen-pgx' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {patient.currentMedications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('candidates')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'candidates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Candidate Add-on Catalog</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'candidates' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {CANDIDATE_MEDICATIONS.length}
          </span>
        </button>
      </div>

      {/* Tab 0: What-If Dosage & DDI Simulator */}
      {activeSubTab === 'whatif-simulator' && (
        <WhatIfDosageSimulator
          patient={patient}
          onNavigateToSimulation={(cand) => {
            if (cand) onSelectCandidateForSimulation(cand);
            onNavigate('simulation-lab');
          }}
        />
      )}

      {/* Tab 1: Calendar & Dosage Reminders */}
      {activeSubTab === 'calendar' && (
        <MedicationScheduleCalendar
          patient={patient}
          schedules={schedules}
          conflicts={conflicts}
          onAutoAdjustConflict={handleAutoAdjustConflict}
          onRefreshSchedules={handleRefreshSchedules}
          onOpenCreateModal={() => handleOpenCreateModal()}
          onOpenEditModal={handleOpenEditModal}
        />
      )}

      {/* Tab 2: Regimen & PGx Profile */}
      {activeSubTab === 'regimen-pgx' && (
        <div className="space-y-6">
          {/* Pharmacogenomics Profile Card */}
          <div className="rounded-2xl bg-white border border-purple-200/80 p-5 lg:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center space-x-2">
                <Dna className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Pharmacogenomic (PGx) Genetic Markers & Drug Metabolism
                </h3>
              </div>
              {patient.genomicProfile && (
                <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-700">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 font-semibold">
                    {patient.genomicProfile.panelVersion}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    {patient.genomicProfile.labAccreditation}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono text-xs">
              {(patient.genomicProfile?.markers || patient.genomics.map(g => ({
                gene: g.gene,
                diplotype: g.diplotype,
                phenotype: g.phenotype,
                metabolismImpact: 'Impaired Clearance (Toxicity Risk)',
                affectedDrugClasses: ['Substrate medications'],
                clinicalSummary: g.clinicalSignificance,
                metabolizerCategory: 'altered'
              }))).map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFF] border border-purple-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-purple-700">{m.gene}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                        {m.diplotype.replace(/\*/g, '')}
                      </span>
                    </div>
                    {m.metabolismImpact && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        {m.metabolismImpact.split(' (')[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#0F172A]">{m.phenotype}</p>
                  {m.affectedDrugClasses && m.affectedDrugClasses.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.affectedDrugClasses.slice(0, 2).map((dc, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600">
                          {dc}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                    {m.clinicalSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Regimen Table */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                  <span>Active Current Regimen</span>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                    {patient.currentMedications.length} Medications
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Simulated baseline pharmacokinetics and target receptors
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-mono">
                    <th className="pb-3 font-semibold">Medication</th>
                    <th className="pb-3 font-semibold">Dosing & Route</th>
                    <th className="pb-3 font-semibold">Primary Pathway</th>
                    <th className="pb-3 font-semibold">Target Receptor</th>
                    <th className="pb-3 font-semibold">Half-Life</th>
                    <th className="pb-3 font-semibold">Reminders</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {patient.currentMedications.map((med) => {
                    const hasSchedule = schedules.some(
                      (s) => s.medicationName.toLowerCase().includes(med.name.toLowerCase()) ||
                             med.name.toLowerCase().includes(s.medicationName.toLowerCase())
                    );

                    return (
                      <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pr-2">
                          <div className="font-bold text-[#0F172A]">{med.name}</div>
                          {med.brandName && (
                            <span className="text-[11px] text-blue-700 font-sans">({med.brandName})</span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-700">
                          <div>{med.dosage}</div>
                          <div className="text-[11px] text-slate-500 font-sans">{med.frequency}</div>
                        </td>
                        <td className="py-3.5 text-slate-700 font-sans max-w-[200px]">
                          {med.metabolismPathway.join(', ')}
                        </td>
                        <td className="py-3.5 text-slate-700 font-sans max-w-[180px]">
                          {med.primaryTargets.join(', ')}
                        </td>
                        <td className="py-3.5 text-slate-700">
                          {med.halfLifeHours} hrs
                        </td>
                        <td className="py-3.5">
                          {hasSchedule ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                              <Bell className="w-3 h-3 text-emerald-600" />
                              <span>Scheduled</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-sans">None</span>
                          )}
                        </td>
                        <td className="py-3.5 flex items-center space-x-1.5">
                          <button
                            onClick={() => setActiveSubTab('whatif-simulator')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors flex items-center space-x-1"
                            title="Simulate dosage what-if scenarios for this medication"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Simulate Dose</span>
                          </button>
                          <button
                            onClick={() => {
                              handleOpenCreateModal(med);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors flex items-center space-x-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{hasSchedule ? 'Edit Reminder' : 'Set Reminder'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Candidate Therapies Catalog */}
      {activeSubTab === 'candidates' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span>Candidate Add-on Therapies</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Targeted agents available for What-If treatment simulation and QUBO combinatorial optimization
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate therapies..."
                className="w-full pl-8 pr-11 py-2 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <VoiceDictationButton
                  size="sm"
                  onTranscribed={(t) => setSearchQuery(t)}
                  tooltip="Dictate drug or target name"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="rounded-2xl bg-[#F8FAFF] border border-slate-200/90 hover:border-blue-300 p-4.5 transition-all flex flex-col justify-between shadow-xs hover:bg-white"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{cand.name}</h4>
                      <span className="text-[11px] text-blue-700 font-mono block">
                        {cand.brandName} • {cand.dosage}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                      {cand.category.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-sans line-clamp-2">
                    {cand.mechanismSummary}
                  </p>

                  {/* Metrics */}
                  <div className="mt-3.5 grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white border border-slate-200 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Efficacy</span>
                      <span className="font-bold text-emerald-700">{cand.predictedEffectiveness}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">ADR Risk</span>
                      <span className="font-bold text-slate-700">{cand.adrRiskScore}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Score</span>
                      <span className="font-bold text-blue-700">{cand.suitabilityScore}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onSelectCandidateForSimulation(cand);
                      onNavigate('simulation-lab');
                    }}
                    className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Simulate in Treatment Lab</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Reminder Modal */}
      <MedicationReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        patient={patient}
        initialSchedule={editingSchedule}
      />
    </div>
  );
};


