import React, { useState } from 'react';
import {
  Dna,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  GitBranch,
  Info,
  Search,
  Filter,
  Sparkles,
  Zap,
  Activity,
  Layers,
  FileSpreadsheet,
  Check,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PatientDigitalTwinState, GeneticMarker, PatientGenomicProfile } from '../../types';

interface GeneticMarkersTableProps {
  patient: PatientDigitalTwinState;
  onNavigate?: (tab: string) => void;
}

export const GeneticMarkersTable: React.FC<GeneticMarkersTableProps> = ({
  patient,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'altered' | 'poor' | 'intermediate' | 'normal'>('all');
  const [selectedMarkerGene, setSelectedMarkerGene] = useState<string | null>(null);

  const profile: PatientGenomicProfile | undefined = patient.genomicProfile;

  // Fallback markers if profile is not populated
  const markers: GeneticMarker[] = profile?.markers || (patient.genomics || []).map((g) => ({
    gene: g.gene,
    diplotype: g.diplotype,
    phenotype: g.phenotype,
    metabolizerCategory: g.phenotype.toLowerCase().includes('poor')
      ? 'poor'
      : g.phenotype.toLowerCase().includes('intermediate')
      ? 'intermediate'
      : 'normal',
    affectedDrugClasses: ['Substrate medications'],
    impactedEnzymesOrTransporters: 'Cytochrome P450 Isozyme',
    clinicalSummary: g.clinicalSignificance,
    metabolismImpact: g.phenotype.toLowerCase().includes('poor')
      ? 'Impaired Clearance (Toxicity Risk)'
      : g.phenotype.toLowerCase().includes('intermediate')
      ? 'Altered Hepatic Influx'
      : 'Normal Baseline Metabolism',
    cpicGuidelineLevel: 'CPIC Level 1A',
    fdaLabelingActionable: true
  }));

  const filteredMarkers = markers.filter((m) => {
    const matchesSearch =
      m.gene.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phenotype.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.diplotype.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.affectedDrugClasses.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.clinicalSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'poor' && m.metabolizerCategory === 'poor') ||
      (statusFilter === 'intermediate' && m.metabolizerCategory === 'intermediate') ||
      (statusFilter === 'altered' && (m.metabolizerCategory === 'poor' || m.metabolizerCategory === 'intermediate' || m.metabolizerCategory === 'altered' || m.metabolizerCategory === 'high-risk')) ||
      (statusFilter === 'normal' && m.metabolizerCategory === 'normal');

    return matchesSearch && matchesStatus;
  });

  const getMetabolizerBadge = (cat: GeneticMarker['metabolizerCategory'], phenotype: string) => {
    switch (cat) {
      case 'poor':
      case 'high-risk':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          dot: 'bg-rose-600',
          label: phenotype || 'Poor Metabolizer'
        };
      case 'intermediate':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-500',
          label: phenotype || 'Intermediate Metabolizer'
        };
      case 'ultra-rapid':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
          dot: 'bg-purple-600',
          label: phenotype || 'Ultra-Rapid Metabolizer'
        };
      case 'altered':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          dot: 'bg-blue-500',
          label: phenotype || 'Altered Function'
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500',
          label: phenotype || 'Normal Metabolizer'
        };
    }
  };

  const getImpactBadge = (impact: GeneticMarker['metabolismImpact']) => {
    if (impact.includes('Toxicity') || impact.includes('Impaired')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (impact.includes('Activation Failure') || impact.includes('Prodrug')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (impact.includes('Hepatic') || impact.includes('Altered')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (impact.includes('Ultra-Rapid')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-5">
      {/* Header with Sequencing Quality Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200 flex items-center space-x-1">
              <Dna className="w-3.5 h-3.5" />
              <span>GENOMIC PROFILE & METABOLIC MARKERS</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-semibold border border-purple-200">
              {profile?.panelVersion || 'PGx-Clinical-Core v4.2'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200">
              {profile?.labAccreditation || 'CLIA / CAP Certified'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mt-1.5">
            Genetic Markers Influencing <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Drug Metabolism & Elimination</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Next-generation sequencing panel quantifying polymorphic alleles, CYP450 enzyme expression, and hepatic drug transport kinetics.
          </p>
        </div>

        {/* Quality metadata chips */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Sample Date</span>
            <span className="text-xs font-mono font-bold text-slate-800">{profile?.sampleDate || '2024-11-14'}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Call Rate</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{profile?.dnaExtractionYield || '99.8%'}</span>
          </div>
        </div>
      </div>

      {/* High-Risk Clinical Alerts Banner if Any */}
      {(profile?.highRiskDrugsToAvoid?.length || profile?.doseAdjustmentRecommended?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
          {profile?.highRiskDrugsToAvoid && profile.highRiskDrugsToAvoid.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>High-Risk Medications to Avoid (Genetic Contraindication)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.highRiskDrugsToAvoid.map((drug, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-100/90 text-rose-800 text-[11px] font-mono font-semibold border border-rose-200">
                    {drug}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile?.doseAdjustmentRecommended && profile.doseAdjustmentRecommended.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Recommended PGx Dosage Adjustments</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.doseAdjustmentRecommended.map((rec, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-100/80 text-amber-900 text-[11px] font-mono font-semibold border border-amber-200">
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search marker, gene, drug class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">Status:</span>
          {(['all', 'altered', 'poor', 'intermediate', 'normal'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all border ${
                statusFilter === filter
                  ? 'bg-white text-blue-700 border-blue-300 shadow-xs font-bold'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-white/60'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Genetic Markers Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMarkers.map((marker) => {
          const isSelected = selectedMarkerGene === marker.gene;
          const badge = getMetabolizerBadge(marker.metabolizerCategory, marker.phenotype);
          const impactBadgeClass = getImpactBadge(marker.metabolismImpact);

          return (
            <div
              key={marker.gene}
              onClick={() => setSelectedMarkerGene(isSelected ? null : marker.gene)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Top Row: Gene + Diplotype + Phenotype Tag */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-[#0F172A] font-mono">
                      {marker.gene}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-bold">
                      {marker.diplotype}
                    </span>
                    {marker.rsId && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {marker.rsId}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <span className="text-xs font-bold text-slate-800">
                      {marker.phenotype}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  {marker.activityScore !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      Activity Score: {marker.activityScore.toFixed(1)}
                    </span>
                  )}
                  {marker.cpicGuidelineLevel && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {marker.cpicGuidelineLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Metabolism Impact Indicator */}
              <div className="mt-3">
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border font-bold inline-block ${impactBadgeClass}`}>
                  ⚡ Impact: {marker.metabolismImpact}
                </span>
              </div>

              {/* Impacted Enzyme / Transporter */}
              <div className="mt-2.5 text-[11px] text-slate-600 font-mono flex items-center space-x-1.5">
                <GitBranch className="w-3 h-3 text-purple-600 shrink-0" />
                <span className="text-slate-400">Enzyme/Transporter:</span>
                <span className="font-semibold text-slate-800 truncate">{marker.impactedEnzymesOrTransporters}</span>
              </div>

              {/* Affected Drug Classes */}
              <div className="mt-2.5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                  Affected Therapeutic Classes:
                </span>
                <div className="flex flex-wrap gap-1">
                  {marker.affectedDrugClasses.map((dc, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-[#F8FAFF] border border-slate-200 text-slate-700">
                      {dc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Mechanism & Summary */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-sans">
                <p>{marker.clinicalSummary}</p>
              </div>

              {marker.fdaLabelingActionable && (
                <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] font-mono text-rose-700 font-bold">
                  <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>FDA PGx Labeling Precaution Active</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
