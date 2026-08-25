import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Activity,
  Pill,
  HeartPulse,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Dna
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';

interface PatientsViewProps {
  patients: PatientDigitalTwinState[];
  activePatient: PatientDigitalTwinState;
  onSelectPatient: (p: PatientDigitalTwinState) => void;
  onNavigate: (tab: any) => void;
  onOpenAddPatient: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  onNavigate,
  onOpenAddPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.conditions.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.currentMedications.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRisk =
      riskFilter === 'all' || p.treatmentComplexity.toLowerCase() === riskFilter.toLowerCase();

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] flex items-center space-x-2.5 tracking-tight">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Synthetic Patient <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Cohort Workspace</span></span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Dynamic digital twins parameterized with longitudinal clinical labs, pharmacogenomics, and active polypharmacy
          </p>
        </div>

        <button
          onClick={onOpenAddPatient}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:scale-[1.01] flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, condition, medication..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold shrink-0">
            Complexity:
          </span>
          {['all', 'critical', 'high', 'moderate'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRiskFilter(filter)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold uppercase transition-all shrink-0 ${
                riskFilter === filter
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-xs'
                  : 'bg-[#F8FAFF] text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((p) => {
          const isSelected = p.patientId === activePatient.patientId;
          return (
            <div
              key={p.patientId}
              className={`relative rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'bg-gradient-to-b from-[#EEF4FF] to-white border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-blue-300'
              }`}
            >
              {/* Header with ID and Complexity Tag */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                        {p.patientId}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ACTIVE TWIN</span>
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-[#0F172A] truncate">
                      {p.name.split(' (')[0]}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.demographics.age}yo {p.demographics.gender} • BMI {p.demographics.bmi} • {p.demographics.ethnicity}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      p.treatmentComplexity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : p.treatmentComplexity === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {p.treatmentComplexity} ({p.complexityScore})
                  </span>
                </div>

                {/* Conditions Badges */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
                    Active Clinical Conditions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.conditions.map((c) => (
                      <span
                        key={c.id}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-[#F8FAFF] border border-slate-200 text-slate-700"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Labs Metric Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">eGFR</span>
                    <span className={`text-xs font-bold ${p.organFunction.eGFR < 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {p.organFunction.eGFR}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">HbA1c</span>
                    <span className={`text-xs font-bold ${p.organFunction.hba1c > 7 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {p.organFunction.hba1c}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Meds</span>
                    <span className="text-xs font-bold text-blue-700">
                      {p.currentMedications.length}
                    </span>
                  </div>
                </div>

                {/* Genomics Preview */}
                {p.genomics.length > 0 && (
                  <div className="mt-3 flex items-center space-x-2 text-[11px] text-slate-600">
                    <Dna className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">
                      {p.genomics.map((g) => `${g.gene} ${g.phenotype}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPatient(p)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                    isSelected
                      ? 'bg-blue-100 text-blue-800 border border-blue-300 cursor-default font-bold'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Currently Selected' : 'Load Digital Twin'}</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPatient(p);
                    onNavigate('digital-twin');
                  }}
                  title="Open Full Digital Twin View"
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

