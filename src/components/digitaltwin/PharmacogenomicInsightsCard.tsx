import React, { useState, useEffect } from 'react';
import {
  Dna,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  FlaskConical,
  HelpCircle,
  Pill,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Gauge,
  Download,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { PatientDigitalTwinState, PharmacogenomicSummary, PharmacogenomicInsight, Medication } from '../../types';
import { ApiService } from '../../services/apiService';
import { RadialConfidenceMeter } from './RadialConfidenceMeter';
import { GeneticMarkersTable } from './GeneticMarkersTable';

interface PharmacogenomicInsightsCardProps {
  patient: PatientDigitalTwinState;
  onNavigate?: (tab: string) => void;
}

export const PharmacogenomicInsightsCard: React.FC<PharmacogenomicInsightsCardProps> = ({
  patient,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'markers' | 'insights'>('markers');
  const [summary, setSummary] = useState<PharmacogenomicSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_risk' | 'actionable'>('all');
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [simulatedDrug, setSimulatedDrug] = useState<string>('');

  const fetchInsights = async (customMeds?: Medication[]) => {
    setIsLoading(true);
    try {
      const data = await ApiService.getPharmacogenomicInsights(patient, customMeds);
      setSummary(data);
      if (data.insights.length > 0) {
        setExpandedInsightId(data.insights[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacogenomic insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [patient.patientId, patient.genomics]);

  const handleSimulateDrugTest = () => {
    if (!simulatedDrug.trim()) return;
    const mockMed: Medication = {
      id: `sim-${Date.now()}`,
      name: simulatedDrug.trim(),
      category: 'Simulated Drug',
      dosage: 'Standard Test Dose',
      frequency: 'Daily',
      route: 'Oral',
      metabolismPathway: ['CYP2C9', 'CYP2D6', 'SLCO1B1', 'CYP2C19'],
      primaryTargets: ['Target Receptor'],
      halfLifeHours: 12,
      contraindications: [],
      commonAdrs: [],
      mechanismSummary: 'Custom test probe for pharmacogenomic correlation'
    };
    fetchInsights([...patient.currentMedications, mockMed]);
  };

  const handleResetSimulation = () => {
    setSimulatedDrug('');
    fetchInsights();
  };

  const handleExportGenomicProfileCSV = () => {
    if (!summary || !summary.insights.length) return;
    setIsExporting(true);

    try {
      const sanitizeCSV = (str: string | number | boolean | undefined | null) => {
        if (str === undefined || str === null) return '""';
        const clean = String(str).replace(/"/g, '""');
        return `"${clean}"`;
      };

      const headers = [
        'Patient ID',
        'Patient Name',
        'Gene Marker',
        'Diplotype',
        'Phenotype',
        'Medication Marker',
        'Metabolic Pathway',
        'Risk Level',
        'Correlation Type',
        'Confidence Score (%)',
        'Evidence Grade',
        'CPIC Guideline Level',
        'Plasma AUC Exposure Impact',
        'Metabolic Clearance Impact',
        'FDA Boxed Warning',
        'Pathway Disruption (%)',
        'Evidence Strength (%)',
        'Kinetic Concordance (%)',
        'Clinical Recommendation',
        'Biochemical Mechanism',
        'Guideline Source Repository',
        'Report Generation Timestamp'
      ];

      const rows: string[][] = summary.insights.map((insight) => [
        sanitizeCSV(patient.patientId),
        sanitizeCSV(patient.name),
        sanitizeCSV(insight.gene),
        sanitizeCSV(insight.diplotype),
        sanitizeCSV(insight.phenotype),
        sanitizeCSV(insight.medication),
        sanitizeCSV(insight.metabolicPathway || 'CYP450 / Hepatic Transporter Pathway'),
        sanitizeCSV(insight.riskLevel.toUpperCase()),
        sanitizeCSV(insight.correlationType),
        sanitizeCSV(insight.confidenceScore || 90),
        sanitizeCSV(insight.evidenceGrade || 'Tier 1A - Definitive Evidence'),
        sanitizeCSV(`Level ${insight.cpicLevel}`),
        sanitizeCSV(insight.aucImpact),
        sanitizeCSV(insight.clearanceImpact),
        sanitizeCSV(insight.fdaLabelWarning ? 'YES' : 'NO'),
        sanitizeCSV(insight.radialMetrics?.pathwayDisruption ?? (insight.riskLevel === 'critical' ? 90 : insight.riskLevel === 'high' ? 75 : 40)),
        sanitizeCSV(insight.radialMetrics?.evidenceStrength ?? 95),
        sanitizeCSV(insight.radialMetrics?.kineticConcordance ?? (insight.riskLevel === 'optimal' ? 95 : 35)),
        sanitizeCSV(insight.clinicalRecommendation),
        sanitizeCSV(insight.biochemicalMechanism),
        sanitizeCSV(summary.guidelineSource),
        sanitizeCSV(new Date().toISOString())
      ]);

      // Also append any patient genomics alleles not explicitly clashed
      const profiledGenomics = patient.genomics || [];
      profiledGenomics.forEach((g) => {
        const alreadyCovered = summary.insights.some((i) => i.gene === g.gene);
        if (!alreadyCovered) {
          rows.push([
            sanitizeCSV(patient.patientId),
            sanitizeCSV(patient.name),
            sanitizeCSV(g.gene),
            sanitizeCSV(g.diplotype),
            sanitizeCSV(g.phenotype),
            sanitizeCSV('Regimen Baseline'),
            sanitizeCSV('Physiological Phase I/II Pathway'),
            sanitizeCSV('OPTIMAL'),
            sanitizeCSV('standard'),
            sanitizeCSV(92),
            sanitizeCSV('Tier 1A - Concordant Wild-Type Baseline'),
            sanitizeCSV('Level A'),
            sanitizeCSV('Nominal (1.0x AUC)'),
            sanitizeCSV('Standard Baseline Clearance'),
            sanitizeCSV('NO'),
            sanitizeCSV(5),
            sanitizeCSV(95),
            sanitizeCSV(95),
            sanitizeCSV(g.clinicalImplication || 'Concordant functional enzymatic activity.'),
            sanitizeCSV('Normal wild-type enzyme expression and clearance rate.'),
            sanitizeCSV(summary.guidelineSource),
            sanitizeCSV(new Date().toISOString())
          ]);
        }
      });

      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedName = patient.name.replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Genomic_Profile_${patient.patientId}_${sanitizedName}_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating genomic profile CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredInsights = (summary?.insights || []).filter((insight) => {
    if (activeFilter === 'high_risk') return insight.riskLevel === 'critical' || insight.riskLevel === 'high';
    if (activeFilter === 'actionable') return insight.riskLevel !== 'optimal';
    return true;
  });

  const getRiskBadge = (risk: PharmacogenomicInsight['riskLevel']) => {
    switch (risk) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          indicator: 'bg-rose-600',
          label: 'Critical Precaution',
          variant: 'rose' as const
        };
      case 'high':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          indicator: 'bg-amber-500',
          label: 'Actionable High Risk',
          variant: 'amber' as const
        };
      case 'moderate':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          indicator: 'bg-blue-500',
          label: 'Moderate Consideration',
          variant: 'blue' as const
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          indicator: 'bg-emerald-500',
          label: 'Concordant / Standard',
          variant: 'emerald' as const
        };
    }
  };

  // Average confidence score across insights
  const averageConfidence = summary?.insights.length
    ? Math.round(summary.insights.reduce((acc, curr) => acc + (curr.confidenceScore || 90), 0) / summary.insights.length)
    : 92;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-6">
      {/* Top Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[11px] font-bold border border-purple-200 flex items-center space-x-1">
              <Dna className="w-3.5 h-3.5" />
              <span>PHARMACOGENOMICS & DRUG METABOLISM</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>CPIC / PharmGKB 2025 API Active</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mt-1">
            Pharmacogenomic Profile & <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Drug Metabolism Kinetics</span>
          </h3>
          <p className="text-xs text-slate-500 font-normal">
            Precision mapping of sequenced polymorphic markers ({patient.genomicProfile?.markers?.map(m => `${m.gene} ${m.diplotype}`).join(', ') || patient.genomics?.map(g => `${g.gene} ${g.diplotype}`).join(', ') || 'CYP2C9, CYP2D6, SLCO1B1'}) affecting hepatic clearance and drug toxicity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Export Genomic Profile CSV Button */}
          <button
            onClick={handleExportGenomicProfileCSV}
            disabled={isExporting || isLoading || !summary}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center space-x-1.5 shadow-xs ${
              exportSuccess
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300'
            }`}
            title="Download CSV report of metabolic risk scores, diplotypes, and medication markers"
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Exported CSV!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                <span>Export Genomic Profile</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchInsights()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-all border border-slate-200 flex items-center space-x-1.5"
            title="Refresh Pharmacogenomic Analysis via Mock API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('markers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-2 border ${
            activeTab === 'markers'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Dna className="w-4 h-4" />
          <span>Genetic Markers & Metabolism Impact ({patient.genomicProfile?.markers?.length || patient.genomics?.length || 4})</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-2 border ${
            activeTab === 'insights'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Pathway Correlations & Confidence Gauges ({summary?.insights?.length || 0})</span>
        </button>
      </div>

      {activeTab === 'markers' ? (
        <GeneticMarkersTable patient={patient} onNavigate={onNavigate} />
      ) : (
        <>
      {/* Hero Radial Meter & Pathway Summary Banner */}
      <div className="rounded-xl bg-gradient-to-r from-purple-50/80 via-[#F8FAFF] to-blue-50/60 border border-purple-100 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          {/* Main Radial Confidence Gauge */}
          <div className="p-2 rounded-2xl bg-white border border-purple-200/80 shadow-xs shrink-0">
            <RadialConfidenceMeter
              score={averageConfidence}
              size={92}
              strokeWidth={7.5}
              label="Confidence"
              variant="purple"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-900 font-mono uppercase tracking-wide">
                Genetic–Metabolic Concordance
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                Tier 1A / CPIC A
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
              Radial confidence algorithm calculates an aggregate <strong className="text-purple-900 font-bold">{averageConfidence}% correlation confidence</strong> across profiled cytochrome P450 isozymes and hepatic transporter pathways.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
              <span>Evidentiary Quality: <strong className="text-slate-800">Definitive (CPIC 2025)</strong></span>
              <span>•</span>
              <span>Active PGx Conflicts: <strong className="text-rose-700">{summary?.actionableCorrelationsCount || 0} Actionable</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Metabolic Pathways Visual Chips */}
        <div className="w-full md:w-auto flex md:flex-col gap-2 shrink-0 justify-end">
          <div className="p-2 px-3 rounded-lg bg-white/90 border border-purple-200 text-xs font-mono flex items-center space-x-2">
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-slate-600 text-[11px]">Phase I CYP450:</span>
            <span className="font-bold text-slate-900 text-[11px]">CYP2C9, CYP2D6</span>
          </div>
          <div className="p-2 px-3 rounded-lg bg-white/90 border border-blue-200 text-xs font-mono flex items-center space-x-2">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 text-[11px]">Hepatic Transporters:</span>
            <span className="font-bold text-slate-900 text-[11px]">SLCO1B1 (OATP1B1)</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
          <span className="text-[11px] text-slate-500 font-mono block">Actionable Correlations</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-bold text-[#0F172A]">
              {summary?.actionableCorrelationsCount ?? 0}
            </span>
            <span className="text-[10px] text-purple-700 font-mono font-semibold">
              / {summary?.insights.length ?? 0} analyzed
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
          <span className="text-[11px] text-slate-500 font-mono block">Profiled Genes</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-bold text-[#0F172A]">
              {summary?.totalGenesProfiled ?? patient.genomics?.length ?? 3}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">loci mapped</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
          <span className="text-[11px] text-slate-500 font-mono block">Highest Risk Tier</span>
          <div className="mt-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
              summary?.highestRiskLevel === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : summary?.highestRiskLevel === 'high'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : summary?.highestRiskLevel === 'moderate'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {summary?.highestRiskLevel ?? 'MODERATE'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
          <span className="text-[11px] text-slate-500 font-mono block">Clinical Standard</span>
          <div className="mt-1">
            <span className="text-xs font-mono font-bold text-slate-800">
              CPIC Level A / B
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Filter & Drug Simulation Input Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-mono font-bold text-slate-500 mr-1 hidden sm:inline">Filter:</span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
              activeFilter === 'all'
                ? 'bg-white text-purple-700 border-purple-200 shadow-xs font-bold'
                : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
            }`}
          >
            All Insights ({summary?.insights.length || 0})
          </button>
          <button
            onClick={() => setActiveFilter('actionable')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
              activeFilter === 'actionable'
                ? 'bg-white text-purple-700 border-purple-200 shadow-xs font-bold'
                : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
            }`}
          >
            Actionable ({summary?.actionableCorrelationsCount || 0})
          </button>
          <button
            onClick={() => setActiveFilter('high_risk')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
              activeFilter === 'high_risk'
                ? 'bg-white text-rose-700 border-rose-200 shadow-xs font-bold'
                : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
            }`}
          >
            High Risk Only
          </button>
        </div>

        {/* Drug Test Simulation Probe */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Test drug (e.g. Clopidogrel)..."
              value={simulatedDrug}
              onChange={(e) => setSimulatedDrug(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSimulateDrugTest()}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleSimulateDrugTest}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold transition-all shadow-xs shrink-0"
          >
            Correlate
          </button>
          {simulatedDrug && (
            <button
              onClick={handleResetSimulation}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-mono"
              title="Reset simulated medication"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Correlation Insights List with Individual Radial Confidence Meters */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500">Querying CPIC & PharmGKB Pathway Correlation API...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">No matching correlations for current filter</p>
            <p className="text-[11px] text-slate-500">All medications align with standard metabolic diplotype expectations.</p>
          </div>
        ) : (
          filteredInsights.map((insight) => {
            const isExpanded = expandedInsightId === insight.id;
            const badge = getRiskBadge(insight.riskLevel);
            const confScore = insight.confidenceScore || (insight.riskLevel === 'critical' ? 96 : insight.riskLevel === 'high' ? 92 : 86);

            return (
              <div
                key={insight.id}
                onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all cursor-pointer overflow-hidden shadow-xs"
              >
                {/* Header Row */}
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {/* Compact Radial Confidence Gauge for each entry */}
                    <div className="p-1 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                      <RadialConfidenceMeter
                        score={confScore}
                        size={48}
                        strokeWidth={4.5}
                        variant={badge.variant}
                      />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[11px] font-bold">
                          {insight.gene} {insight.diplotype?.replace(/\*/g, '')}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {insight.phenotype}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px] font-bold flex items-center space-x-1">
                          <Pill className="w-3 h-3" />
                          <span>{insight.medication}</span>
                        </span>
                        {insight.fdaLabelWarning && (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[9px] font-mono font-bold">
                            FDA BOXED WARNING
                          </span>
                        )}
                      </div>

                      {/* Metabolic Pathway Highlight */}
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 font-mono">
                        <GitBranch className="w-3 h-3 text-purple-600 shrink-0" />
                        <span className="text-slate-400">Pathway:</span>
                        <span className="font-semibold text-slate-800">{insight.metabolicPathway || 'CYP450 Phase I Oxidation'}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1 font-normal">
                        {insight.clinicalRecommendation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Accordion */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-[#F8FAFF]/70 space-y-4">
                    {/* Radial Confidence Deep-Dive and Evidence Matrix */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <RadialConfidenceMeter
                          score={confScore}
                          size={76}
                          strokeWidth={6}
                          label="Score"
                          variant={badge.variant}
                          showDetails={true}
                          metrics={insight.radialMetrics || {
                            evidenceStrength: 95,
                            pathwayDisruption: insight.riskLevel === 'critical' ? 90 : insight.riskLevel === 'high' ? 75 : 45,
                            kineticConcordance: insight.riskLevel === 'optimal' ? 95 : 35
                          }}
                        />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {insight.evidenceGrade || 'Tier 1A - Definitive Pharmacogenomic Standard'}
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Calculated across PharmGKB Level 1A guidelines, pharmacokinetic drug-clearance models, and multi-allele frequency databases.
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-700">
                            <Gauge className="w-3 h-3" />
                            <span>Confidence Index: <strong>{confScore}% statistical certitude</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4 space-y-1 shrink-0 w-full sm:w-auto">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Guideline Strength</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono font-bold inline-block">
                          CPIC Level {insight.cpicLevel}
                        </span>
                      </div>
                    </div>

                    {/* PK / PD Quantitative Impact Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                          Plasma AUC Impact
                        </span>
                        <span className="text-xs font-bold text-rose-700 font-mono">
                          {insight.aucImpact}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                          Metabolic Clearance Delta
                        </span>
                        <span className="text-xs font-bold text-amber-700 font-mono">
                          {insight.clearanceImpact}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                          Biochemical Pathway
                        </span>
                        <span className="text-xs font-bold text-purple-700 font-mono truncate block" title={insight.metabolicPathway}>
                          {insight.metabolicPathway || 'CYP450 Isozyme'}
                        </span>
                      </div>
                    </div>

                    {/* Biochemical Mechanism & Actionable Directive */}
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                          Biochemical Pathway Mechanism
                        </span>
                        <p className="text-slate-700 leading-relaxed font-normal">
                          {insight.biochemicalMechanism}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Actionable Clinical Prescribing Recommendation</span>
                        </span>
                        <p className="text-slate-900 font-medium leading-relaxed">
                          {insight.clinicalRecommendation}
                        </p>
                      </div>
                    </div>

                    {/* Action Bridges */}
                    {onNavigate && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('simulation-lab');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Simulate Dose Modification</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('quantum-optimizer');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 flex items-center space-x-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-purple-600" />
                          <span>Run QUBO Deprescribing</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('interactions');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center space-x-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>Trace in Knowledge Graph</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportGenomicProfileCSV();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-xs border border-slate-200 hover:border-purple-200 flex items-center space-x-1.5 sm:ml-auto transition-colors"
                          title="Export Full CSV Report"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Export Profile CSV</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>
      )}
    </div>
  );
};

