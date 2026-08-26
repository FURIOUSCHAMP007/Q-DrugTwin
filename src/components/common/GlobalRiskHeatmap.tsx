import React, { useState, useMemo } from 'react';
import {
  Grid,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Users,
  Search,
  Filter,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Pill,
  Activity,
  CheckCircle2,
  AlertOctagon,
  X
} from 'lucide-react';
import { PatientDigitalTwinState, DrugInteraction, Medication } from '../../types';

interface GlobalRiskHeatmapProps {
  patients: PatientDigitalTwinState[];
  interactions: DrugInteraction[];
  activePatient: PatientDigitalTwinState;
  onSelectPatient?: (patient: PatientDigitalTwinState) => void;
  onNavigate: (tab: any) => void;
}

type ViewMode = 'drug_matrix' | 'patient_matrix';
type SeverityFilter = 'all' | 'high_critical' | 'active_only';

interface CellDetailData {
  drugA: string;
  drugB: string;
  severity: 'contraindicated' | 'high' | 'moderate' | 'low' | 'none';
  interaction?: DrugInteraction;
  affectedPatients: {
    patient: PatientDigitalTwinState;
    hasBothMeds: boolean;
  }[];
  isCoPrescribedInCohort: boolean;
}

export const GlobalRiskHeatmap: React.FC<GlobalRiskHeatmapProps> = ({
  patients,
  interactions,
  activePatient,
  onSelectPatient,
  onNavigate
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('drug_matrix');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<CellDetailData | null>(null);

  // Extract all distinct medications active across the cohort
  const cohortMedications = useMemo(() => {
    const medMap = new Map<string, Medication>();
    patients.forEach((p) => {
      p.currentMedications.forEach((m) => {
        const cleanName = m.name.split(' (')[0].trim();
        if (!medMap.has(cleanName)) {
          medMap.set(cleanName, m);
        }
      });
    });

    // Also include candidate drugs that have known interactions with active drugs for complete clinical coverage
    const defaultDrugs = [
      'Lisinopril',
      'Metformin',
      'Atorvastatin',
      'Amlodipine',
      'Rosuvastatin',
      'Losartan',
      'Sacubitril/Valsartan',
      'Carvedilol',
      'Furosemide',
      'Apixaban',
      'Allopurinol',
      'Aspirin',
      'Clopidogrel',
      'Omeprazole',
      'Metoprolol Succinate',
      'Hydroxychloroquine',
      'Spironolactone',
      'Empagliflozin'
    ];

    defaultDrugs.forEach((d) => {
      if (!medMap.has(d)) {
        medMap.set(d, {
          id: `med_${d.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: d,
          category: 'Cardiometabolic / Candidate',
          dosage: 'Standard',
          frequency: 'Daily',
          route: 'Oral',
          metabolismPathway: ['Hepatic / Renal'],
          primaryTargets: ['Target Receptor'],
          halfLifeHours: 12,
          contraindications: [],
          commonAdrs: [],
          mechanismSummary: 'Therapeutic agent'
        });
      }
    });

    return Array.from(medMap.values());
  }, [patients]);

  // Filtered medication list based on search
  const filteredMeds = useMemo(() => {
    if (!searchQuery.trim()) return cohortMedications.slice(0, 14); // Keep top 14 for optimal grid readability
    return cohortMedications.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cohortMedications, searchQuery]);

  // Interaction lookup helper
  const getInteractionBetween = (drugNameA: string, drugNameB: string): DrugInteraction | undefined => {
    if (drugNameA.toLowerCase() === drugNameB.toLowerCase()) return undefined;

    return interactions.find((i) => {
      const match1 =
        i.drugA.toLowerCase().includes(drugNameA.toLowerCase()) ||
        drugNameA.toLowerCase().includes(i.drugA.toLowerCase());
      const match2 =
        i.drugB.toLowerCase().includes(drugNameB.toLowerCase()) ||
        drugNameB.toLowerCase().includes(i.drugB.toLowerCase());

      const match3 =
        i.drugA.toLowerCase().includes(drugNameB.toLowerCase()) ||
        drugNameB.toLowerCase().includes(i.drugA.toLowerCase());
      const match4 =
        i.drugB.toLowerCase().includes(drugNameA.toLowerCase()) ||
        drugNameA.toLowerCase().includes(i.drugB.toLowerCase());

      return (match1 && match2) || (match3 && match4);
    });
  };

  // Find all patients currently taking both drugs
  const getPatientsTakingBoth = (drugNameA: string, drugNameB: string) => {
    return patients.filter((p) => {
      const hasA = p.currentMedications.some((m) =>
        m.name.toLowerCase().includes(drugNameA.toLowerCase()) ||
        drugNameA.toLowerCase().includes(m.name.toLowerCase())
      );
      const hasB = p.currentMedications.some((m) =>
        m.name.toLowerCase().includes(drugNameB.toLowerCase()) ||
        drugNameB.toLowerCase().includes(m.name.toLowerCase())
      );
      return hasA && hasB;
    });
  };

  // Find all patients taking at least one drug
  const getPatientsTakingDrug = (drugName: string) => {
    return patients.filter((p) =>
      p.currentMedications.some((m) =>
        m.name.toLowerCase().includes(drugName.toLowerCase()) ||
        drugName.toLowerCase().includes(m.name.toLowerCase())
      )
    );
  };

  // Cell background color calculator based on severity & co-prescription
  const getCellVisualProps = (
    drugA: string,
    drugB: string
  ): {
    bg: string;
    border: string;
    text: string;
    badgeText?: string;
    severityLabel: string;
    isHotspot: boolean;
    isCoPrescribed: boolean;
  } => {
    if (drugA.toLowerCase() === drugB.toLowerCase()) {
      return {
        bg: 'bg-slate-100/80',
        border: 'border-slate-200',
        text: 'text-slate-400',
        severityLabel: 'Self / Identity',
        isHotspot: false,
        isCoPrescribed: false
      };
    }

    const interaction = getInteractionBetween(drugA, drugB);
    const coPrescribedPatients = getPatientsTakingBoth(drugA, drugB);
    const isCoPrescribed = coPrescribedPatients.length > 0;

    if (!interaction) {
      return {
        bg: isCoPrescribed ? 'bg-emerald-50/90' : 'bg-slate-50/60 hover:bg-slate-100/80',
        border: isCoPrescribed ? 'border-emerald-200' : 'border-slate-150',
        text: isCoPrescribed ? 'text-emerald-700 font-bold' : 'text-slate-400',
        badgeText: isCoPrescribed ? '✓' : '—',
        severityLabel: 'Compatible / Safe',
        isHotspot: false,
        isCoPrescribed
      };
    }

    switch (interaction.severity) {
      case 'contraindicated':
        return {
          bg: isCoPrescribed
            ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-xs animate-pulse'
            : 'bg-rose-500/80 text-white hover:bg-rose-600',
          border: 'border-rose-700',
          text: 'text-white font-bold',
          badgeText: isCoPrescribed ? `🚨 ${coPrescribedPatients.length} Pt` : 'CRIT',
          severityLabel: 'Contraindicated / Critical',
          isHotspot: true,
          isCoPrescribed
        };
      case 'high':
        return {
          bg: isCoPrescribed
            ? 'bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-xs'
            : 'bg-amber-500/80 text-white hover:bg-amber-600',
          border: 'border-amber-600',
          text: 'text-white font-bold',
          badgeText: isCoPrescribed ? `⚠️ ${coPrescribedPatients.length} Pt` : 'HIGH',
          severityLabel: 'High DDI Risk Alert',
          isHotspot: true,
          isCoPrescribed
        };
      case 'moderate':
        return {
          bg: isCoPrescribed
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          border: 'border-blue-300',
          text: isCoPrescribed ? 'text-white font-semibold' : 'text-blue-900 font-medium',
          badgeText: isCoPrescribed ? `MOD (${coPrescribedPatients.length})` : 'MOD',
          severityLabel: 'Moderate Interaction',
          isHotspot: false,
          isCoPrescribed
        };
      default:
        return {
          bg: isCoPrescribed ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-emerald-700',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          badgeText: 'LOW',
          severityLabel: 'Low Interaction',
          isHotspot: false,
          isCoPrescribed
        };
    }
  };

  // Cohort-wide metrics summary
  const heatmapMetrics = useMemo(() => {
    let highRiskCount = 0;
    let contraindicatedCount = 0;
    let activeCoPrescriptionsCount = 0;
    let activeAlertsInCohort = 0;

    cohortMedications.forEach((medA, i) => {
      cohortMedications.slice(i + 1).forEach((medB) => {
        const interaction = getInteractionBetween(medA.name, medB.name);
        const coPrescribed = getPatientsTakingBoth(medA.name, medB.name);

        if (coPrescribed.length > 0) {
          activeCoPrescriptionsCount++;
          if (interaction) {
            activeAlertsInCohort += coPrescribed.length;
          }
        }

        if (interaction?.severity === 'contraindicated') contraindicatedCount++;
        if (interaction?.severity === 'high') highRiskCount++;
      });
    });

    return {
      highRiskCount,
      contraindicatedCount,
      activeCoPrescriptionsCount,
      activeAlertsInCohort,
      evaluatedDrugsCount: cohortMedications.length,
      evaluatedPairsCount: Math.round((cohortMedications.length * (cohortMedications.length - 1)) / 2)
    };
  }, [cohortMedications, interactions, patients]);

  const handleCellClick = (drugA: string, drugB: string) => {
    const interaction = getInteractionBetween(drugA, drugB);
    const coPrescribedPatients = getPatientsTakingBoth(drugA, drugB);

    setSelectedCell({
      drugA,
      drugB,
      severity: interaction?.severity || (drugA === drugB ? 'none' : 'low'),
      interaction,
      affectedPatients: patients.map((p) => ({
        patient: p,
        hasBothMeds: coPrescribedPatients.some((cp) => cp.patientId === p.patientId)
      })),
      isCoPrescribedInCohort: coPrescribedPatients.length > 0
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200 flex items-center space-x-1.5 shadow-xs">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>COHORT RISK SURVEILLANCE</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200">
              {patients.length} Active Profiles • {heatmapMetrics.evaluatedPairsCount} Combinatorial Pairs
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mt-1 flex items-center space-x-2">
            <span>Global Drug-Drug Interaction</span>
            <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-blue-600 bg-clip-text text-transparent">
              Risk Heatmap
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-normal">
            Aggregated cross-patient DDI matrix detecting polypharmacy friction, metabolic CYP450 clashes, and active co-prescription alerts.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('drug_matrix')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                viewMode === 'drug_matrix'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Drug × Drug Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('patient_matrix')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                viewMode === 'patient_matrix'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patient × Regimen Grid</span>
            </button>
          </div>

          {/* Quick Deep Navigation */}
          <button
            onClick={() => onNavigate('interactions')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <span>PharmaGNN Graph</span>
            <ArrowRight className="w-3 h-3 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Cohort Heatmap Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Active Co-Prescriptions</span>
            <span className="text-lg font-bold font-mono text-slate-900">{heatmapMetrics.activeCoPrescriptionsCount} pairs</span>
          </div>
          <Layers className="w-5 h-5 text-blue-600 opacity-80" />
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Active Cohort Alerts</span>
            <span className="text-lg font-bold font-mono text-rose-600">{heatmapMetrics.activeAlertsInCohort} alerts</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-500 opacity-80" />
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">High-Risk DDI Signatures</span>
            <span className="text-lg font-bold font-mono text-amber-600">{heatmapMetrics.highRiskCount} classified</span>
          </div>
          <Flame className="w-5 h-5 text-amber-500 opacity-80" />
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Contraindicated Pairs</span>
            <span className="text-lg font-bold font-mono text-purple-700">{heatmapMetrics.contraindicatedCount} pairs</span>
          </div>
          <AlertOctagon className="w-5 h-5 text-purple-600 opacity-80" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={viewMode === 'drug_matrix' ? "Filter heatmap by drug name or category (e.g. Clopidogrel, ACEi)..." : "Filter medications..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-sans"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-mono text-slate-500 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
              severityFilter === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Matrix
          </button>
          <button
            onClick={() => setSeverityFilter('high_critical')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all flex items-center space-x-1 ${
              severityFilter === 'high_critical'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>High & Crit Only</span>
          </button>
          <button
            onClick={() => setSeverityFilter('active_only')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all flex items-center space-x-1 ${
              severityFilter === 'active_only'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Active Co-Prescribed</span>
          </button>
        </div>
      </div>

      {/* Main Heatmap Visual Grid */}
      {viewMode === 'drug_matrix' ? (
        <div className="space-y-3">
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <div className="min-w-[760px] p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[11px] font-mono font-bold text-slate-500 bg-slate-50/80 rounded-tl-lg sticky left-0 z-20 w-36 border-b border-r border-slate-200">
                      Drug Interaction Grid
                    </th>
                    {filteredMeds.map((med) => (
                      <th
                        key={med.name}
                        className="p-2 text-center text-[10px] font-mono font-bold text-slate-700 bg-slate-50/80 border-b border-slate-200 w-16 tracking-tighter"
                        title={med.name}
                      >
                        <div className="transform -rotate-45 origin-center inline-block whitespace-nowrap h-12 flex items-center justify-center font-bold">
                          {med.name.length > 10 ? med.name.substring(0, 8) + '…' : med.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredMeds.map((rowMed) => (
                    <tr key={rowMed.name} className="hover:bg-slate-50/50 transition-colors">
                      {/* Row Label */}
                      <td className="p-2 text-xs font-bold text-slate-900 bg-slate-50/90 border-r border-slate-200 sticky left-0 z-10 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Pill className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate max-w-[120px]" title={rowMed.name}>
                            {rowMed.name}
                          </span>
                        </div>
                      </td>

                      {/* Matrix Cells */}
                      {filteredMeds.map((colMed) => {
                        const visual = getCellVisualProps(rowMed.name, colMed.name);
                        const isSelected =
                          selectedCell &&
                          ((selectedCell.drugA === rowMed.name && selectedCell.drugB === colMed.name) ||
                            (selectedCell.drugA === colMed.name && selectedCell.drugB === rowMed.name));

                        // Check filter conditions
                        if (severityFilter === 'high_critical' && !visual.isHotspot && rowMed.name !== colMed.name) {
                          return (
                            <td key={colMed.name} className="p-1 text-center bg-slate-50/40 opacity-40">
                              <div className="w-full h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] text-slate-300">
                                ·
                              </div>
                            </td>
                          );
                        }

                        if (severityFilter === 'active_only' && !visual.isCoPrescribed && rowMed.name !== colMed.name) {
                          return (
                            <td key={colMed.name} className="p-1 text-center bg-slate-50/40 opacity-40">
                              <div className="w-full h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] text-slate-300">
                                ·
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={colMed.name} className="p-1 text-center">
                            <button
                              onClick={() => handleCellClick(rowMed.name, colMed.name)}
                              className={`w-full h-8 rounded-lg border text-[10px] font-mono font-bold transition-all flex items-center justify-center relative group cursor-pointer ${
                                visual.bg
                              } ${visual.border} ${visual.text} ${
                                isSelected ? 'ring-2 ring-blue-600 scale-105 z-10 shadow-md' : 'hover:scale-105'
                              }`}
                              title={`${rowMed.name} + ${colMed.name}: ${visual.severityLabel}${
                                visual.isCoPrescribed ? ' (Currently Prescribed in Cohort)' : ''
                              }`}
                            >
                              {visual.badgeText || (visual.isCoPrescribed ? '✓' : '')}

                              {/* Glowing dot for active alert */}
                              {visual.isCoPrescribed && visual.isHotspot && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white animate-ping" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <span className="font-mono font-bold text-slate-500 text-[11px] uppercase">Heatmap Risk Key:</span>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white font-bold text-[8px] flex items-center justify-center">
                  !
                </span>
                <span className="text-slate-700 font-semibold">Contraindicated</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 text-white font-bold text-[8px] flex items-center justify-center">
                  ▲
                </span>
                <span className="text-slate-700 font-semibold">High DDI Alert</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-bold text-[8px] flex items-center justify-center">
                  M
                </span>
                <span className="text-slate-700 font-semibold">Moderate Risk</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px] flex items-center justify-center">
                  ✓
                </span>
                <span className="text-slate-700 font-semibold">Compatible / Safe</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 text-slate-400 text-[8px] flex items-center justify-center">
                  ·
                </span>
                <span className="text-slate-500">Unpaired / Identity</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-purple-700 font-bold">
              Tip: Click any cell to inspect clinical mechanisms & affected patients
            </span>
          </div>
        </div>
      ) : (
        /* Patient × Regimen Grid View */
        <div className="space-y-3">
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500">
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Patient Profile</th>
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Demographics / eGFR</th>
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Active Regimen</th>
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Max DDI Friction</th>
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Active Interactions</th>
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Digital Twin Status</th>
                  <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {patients.map((p) => {
                  const isCurrentActive = p.patientId === activePatient.patientId;
                  const patientMedNames = p.currentMedications.map((m) => m.name);

                  // Calculate patient interactions
                  const patientClashes: DrugInteraction[] = [];
                  for (let i = 0; i < patientMedNames.length; i++) {
                    for (let j = i + 1; j < patientMedNames.length; j++) {
                      const clash = getInteractionBetween(patientMedNames[i], patientMedNames[j]);
                      if (clash) patientClashes.push(clash);
                    }
                  }

                  const hasCritical = patientClashes.some((c) => c.severity === 'contraindicated');
                  const hasHigh = patientClashes.some((c) => c.severity === 'high');
                  const hasModerate = patientClashes.some((c) => c.severity === 'moderate');

                  return (
                    <tr
                      key={p.patientId}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrentActive ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 font-sans">
                            {p.name.split(' (')[0]}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 font-bold">
                            {p.patientId}
                          </span>
                          {isCurrentActive && (
                            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[9px] font-sans font-bold">
                              SELECTED
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-600">
                        {p.demographics.age}yo {p.demographics.gender} •{' '}
                        <span
                          className={`font-bold ${
                            p.organFunction.eGFR < 60 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {p.organFunction.eGFR} mL/min
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.currentMedications.map((m) => (
                            <span
                              key={m.id}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-sans text-slate-700"
                            >
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        {hasCritical ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            Contraindicated
                          </span>
                        ) : hasHigh ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            High Alert
                          </span>
                        ) : hasModerate ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold">
                            Moderate
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            Optimal
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 font-bold">
                        {patientClashes.length > 0 ? (
                          <span className="text-rose-600">
                            {patientClashes.length} DDI Alert{patientClashes.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-600">0 Active Alerts</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="text-[11px] text-slate-700 font-bold">
                          {p.treatmentComplexity} ({p.complexityScore}/100)
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => onSelectPatient && onSelectPatient(p)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                            isCurrentActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isCurrentActive ? 'Active Twin' : 'Inspect Twin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Cell Deep-Dive Flyout Panel */}
      {selectedCell && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F8FAFF] via-white to-blue-50/40 border border-blue-200 space-y-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                  DDI PAIR INSPECTOR
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                    selectedCell.severity === 'contraindicated'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : selectedCell.severity === 'high'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : selectedCell.severity === 'moderate'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {selectedCell.severity.toUpperCase()} RISK
                </span>
                {selectedCell.isCoPrescribedInCohort && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>ACTIVE IN COHORT REGIMEN</span>
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>{selectedCell.drugA}</span>
                <span className="text-slate-400">⟷</span>
                <span>{selectedCell.drugB}</span>
              </h4>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedCell.interaction ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                    Biochemical Mechanism
                  </span>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {selectedCell.interaction.mechanism}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                    Clinical Adverse Effect
                  </span>
                  <p className="text-rose-700 leading-relaxed font-semibold">
                    {selectedCell.interaction.clinicalEffect}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-900 uppercase block">
                  Actionable Clinical Recommendation
                </span>
                <p className="text-purple-900 leading-relaxed font-medium">
                  {selectedCell.interaction.managementRecommendation}
                </p>
              </div>

              {/* Affected Cohort Patients list */}
              <div className="pt-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1.5">
                  Cohort Patient Co-Prescription Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCell.affectedPatients
                    .filter((ap) => ap.hasBothMeds)
                    .map((ap) => (
                      <div
                        key={ap.patient.patientId}
                        className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs flex items-center justify-between space-x-2 shadow-2xs"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="font-bold text-slate-900">{ap.patient.name.split(' (')[0]}</span>
                          <span className="text-slate-500 font-mono">({ap.patient.patientId})</span>
                        </div>
                        <button
                          onClick={() => onSelectPatient && onSelectPatient(ap.patient)}
                          className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-mono font-bold border border-blue-200"
                        >
                          Switch Twin
                        </button>
                      </div>
                    ))}

                  {selectedCell.affectedPatients.filter((ap) => ap.hasBothMeds).length === 0 && (
                    <span className="text-xs text-slate-500 font-mono italic">
                      No active patient in the cohort currently prescribed both agents simultaneously.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onNavigate('interactions')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs border border-blue-200 flex items-center space-x-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Trace in PharmaGNN Graph</span>
                </button>
                <button
                  onClick={() => onNavigate('simulation-lab')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Simulate Alternative in Lab</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <h5 className="text-xs font-bold text-slate-900">No Documented Interaction Risk</h5>
              <p className="text-xs text-slate-500">
                {selectedCell.drugA} and {selectedCell.drugB} operate via distinct metabolic clearance pathways with concordant PK/PD profiles.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
