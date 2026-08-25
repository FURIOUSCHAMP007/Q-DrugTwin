import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { PatientDigitalTwinState, Medication } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';

interface MedicationWorkspaceViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
  onSelectCandidateForSimulation: (candidate: Medication) => void;
}

export const MedicationWorkspaceView: React.FC<MedicationWorkspaceViewProps> = ({
  patient,
  onNavigate,
  onSelectCandidateForSimulation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
            <span>Medication & <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Pharmacogenomics</span> Workspace</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Review active multi-drug regimen, CYP450 metabolic kinetics, and candidate therapeutic options for {patient.name.split(' (')[0]}
          </p>
        </div>

        <button
          onClick={() => onNavigate('simulation-lab')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.01] flex items-center space-x-2 self-start sm:self-auto"
        >
          <FlaskConical className="w-4 h-4" />
          <span>Launch Simulation Lab</span>
        </button>
      </div>

      {/* Pharmacogenomics Profile Card */}
      <div className="rounded-2xl bg-white border border-purple-200/80 p-5 lg:p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-3.5">
          <Dna className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-[#0F172A]">
            Pharmacogenomic (PGx) Biomarker Diplotypes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono text-xs">
          {patient.genomics.map((g, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFF] border border-purple-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-700">{g.gene}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                  {g.diplotype}
                </span>
              </div>
              <p className="text-xs font-bold text-[#0F172A] mt-1.5">{g.phenotype}</p>
              <p className="text-[11px] text-slate-600 font-sans mt-1 leading-relaxed">
                {g.clinicalSignificance}
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
                <th className="pb-3 font-semibold">Modeled Suitability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {patient.currentMedications.map((med) => (
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
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {med.suitabilityScore ?? 85}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Therapies Catalog */}
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

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
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
    </div>
  );
};

