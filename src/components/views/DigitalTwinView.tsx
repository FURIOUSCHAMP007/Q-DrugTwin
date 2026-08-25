import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Shield,
  Zap,
  TrendingUp,
  Dna,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
  Clock,
  FlaskConical
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { RadarChart, RadarDataPoint } from '../common/RadarChart';

interface DigitalTwinViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ patient, onNavigate }) => {
  const [selectedOrgan, setSelectedOrgan] = useState<'renal' | 'hepatic' | 'cardiac' | 'metabolic' | 'vascular'>('renal');
  const [simulatedState, setSimulatedState] = useState<'baseline' | 'with_sglt2i' | 'with_glp1' | 'stressed'>('baseline');

  // Multi-axis radar representation of patient organ system capacity (0-100)
  const radarData: RadarDataPoint[] = [
    {
      axis: 'Renal (eGFR)',
      value: patient.organFunction.renalScore,
      secondaryValue: simulatedState === 'with_sglt2i' ? Math.min(100, patient.organFunction.renalScore + 12) : patient.organFunction.renalScore
    },
    {
      axis: 'Hepatic (ALT/AST)',
      value: patient.organFunction.hepaticScore,
      secondaryValue: patient.organFunction.hepaticScore
    },
    {
      axis: 'Cardiac (LVEF/BNP)',
      value: patient.organFunction.cardiacScore,
      secondaryValue: simulatedState === 'with_sglt2i' ? Math.min(100, patient.organFunction.cardiacScore + 8) : patient.organFunction.cardiacScore
    },
    {
      axis: 'Metabolic (HbA1c)',
      value: patient.organFunction.metabolicScore,
      secondaryValue: simulatedState === 'with_sglt2i' || simulatedState === 'with_glp1' ? Math.min(100, patient.organFunction.metabolicScore + 18) : patient.organFunction.metabolicScore
    },
    {
      axis: 'Vascular (BP)',
      value: patient.organFunction.vascularScore,
      secondaryValue: Math.min(100, patient.organFunction.vascularScore + 6)
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with State Vector Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
              STATE VECTOR P(t)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              LONGITUDINAL DIGITAL TWIN ENGINE
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            {patient.name.split(' (')[0]} — <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Virtual Patient Holograph</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Synchronized dynamic biological state mapping organ capacities, pharmacogenomics, and multi-drug metabolism
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 z-10">
          <button
            onClick={() => onNavigate('simulation-lab')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:scale-[1.02] flex items-center space-x-2"
          >
            <FlaskConical className="w-4 h-4 text-blue-100" />
            <span>Simulate Treatments</span>
          </button>
        </div>
      </div>

      {/* Main Holographic Twin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Hologram & Organ Node Selector */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Multi-Organ Physiological State</span>
            </h3>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Click organ node to inspect
            </span>
          </div>

          {/* Holographic Body System Diagram */}
          <div className="my-6 relative min-h-[300px] flex items-center justify-center">
            {/* Background cyber grid lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-72 h-72 rounded-full border border-blue-200 animate-pulse" />
              <div className="w-56 h-56 rounded-full border border-purple-200" />
            </div>

            {/* Central Virtual Patient Representation */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Head / Neuro */}
              <div className="w-14 h-14 rounded-full bg-[#F8FAFF] border-2 border-blue-500 shadow-sm flex items-center justify-center mb-2">
                <Dna className="w-6 h-6 text-blue-600" />
              </div>

              {/* Torso & Interactive Organ Nodes */}
              <div className="w-34 h-48 rounded-2xl bg-[#F8FAFF] border border-slate-200 p-3 relative flex flex-col items-center justify-between shadow-sm">
                {/* Heart (Cardiac Node) */}
                <button
                  onClick={() => setSelectedOrgan('cardiac')}
                  className={`p-2 rounded-xl transition-all ${
                    selectedOrgan === 'cardiac'
                      ? 'bg-rose-500 text-white scale-110 shadow-md shadow-rose-500/30'
                      : 'bg-white border border-rose-200 text-rose-600 hover:scale-105'
                  }`}
                  title="Cardiac Subsystem (LVEF, BNP, BP)"
                >
                  <Heart className="w-5 h-5 fill-rose-500/20" />
                </button>

                {/* Liver & Pancreas (Hepatic / Metabolic) */}
                <div className="flex items-center justify-between w-full px-1">
                  <button
                    onClick={() => setSelectedOrgan('hepatic')}
                    className={`p-1.5 rounded-lg transition-all text-xs font-mono font-bold ${
                      selectedOrgan === 'hepatic'
                        ? 'bg-amber-500 text-white scale-110 shadow-md shadow-amber-500/30'
                        : 'bg-white border border-amber-200 text-amber-700 hover:scale-105'
                    }`}
                    title="Hepatic (ALT, AST, Bilirubin)"
                  >
                    LIVER
                  </button>

                  <button
                    onClick={() => setSelectedOrgan('metabolic')}
                    className={`p-1.5 rounded-lg transition-all text-xs font-mono font-bold ${
                      selectedOrgan === 'metabolic'
                        ? 'bg-purple-600 text-white scale-110 shadow-md shadow-purple-500/30'
                        : 'bg-white border border-purple-200 text-purple-700 hover:scale-105'
                    }`}
                    title="Metabolic / Endocrine (HbA1c, Glucose)"
                  >
                    METAB
                  </button>
                </div>

                {/* Kidneys (Renal Node) */}
                <button
                  onClick={() => setSelectedOrgan('renal')}
                  className={`p-2 rounded-xl transition-all ${
                    selectedOrgan === 'renal'
                      ? 'bg-blue-600 text-white scale-110 shadow-md shadow-blue-500/30'
                      : 'bg-white border border-blue-200 text-blue-600 hover:scale-105'
                  }`}
                  title="Renal System (eGFR, Creatinine, uACR)"
                >
                  <Droplets className="w-5 h-5 fill-blue-500/20" />
                </button>
              </div>

              <div className="mt-3 flex space-x-6 text-[10px] font-mono text-slate-500">
                <button
                  onClick={() => setSelectedOrgan('vascular')}
                  className={`hover:text-blue-700 ${selectedOrgan === 'vascular' ? 'text-blue-700 font-bold underline' : ''}`}
                >
                  Vascular Bed (BP: {patient.organFunction.systolicBp}/{patient.organFunction.diastolicBp})
                </button>
              </div>
            </div>
          </div>

          {/* Organ Telemetry Inspector Card */}
          <div className="p-4.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
            {selectedOrgan === 'renal' && (
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-[#0F172A] font-mono">
                      RENAL SYSTEM STATE (Score: {patient.organFunction.renalScore}/100)
                    </h4>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                    patient.organFunction.eGFR < 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    eGFR: {patient.organFunction.eGFR} mL/min (CKD Stage {patient.organFunction.eGFR < 45 ? '3b' : patient.organFunction.eGFR < 60 ? '3a' : '2/Normal'})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mt-3 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Creatinine</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.serumCreatinine} mg/dL</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">K+ Potassium</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.labs.potassium?.value ?? 4.8} mEq/L</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">uACR</span>
                    <span className="font-bold text-amber-600 text-sm">{patient.labs.uACR?.value ?? 140} mg/g</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed font-normal">
                  Clinical Note: Moderately reduced filtration requires careful dose calibration for renally cleared medications (e.g. Metformin, DOACs) and hyperkalemia monitoring for dual RAAS agents.
                </p>
              </div>
            )}

            {selectedOrgan === 'hepatic' && (
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-[#0F172A] font-mono">
                      HEPATIC METABOLISM STATE (Score: {patient.organFunction.hepaticScore}/100)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    CYP450 Capacity Preserved
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mt-3 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">ALT (SGPT)</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.alt} U/L</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">AST (SGOT)</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.ast} U/L</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Bilirubin</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.bilirubin} mg/dL</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed font-normal">
                  Clinical Note: Transaminases are within stable baseline reference ranges. Pharmacogenomic CYP diplotypes dictate metabolic biotransformation rates for Statins and Antiplatelets.
                </p>
              </div>
            )}

            {selectedOrgan === 'cardiac' && (
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h4 className="text-xs font-bold text-[#0F172A] font-mono">
                      CARDIAC SYSTEM STATE (Score: {patient.organFunction.cardiacScore}/100)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    LVEF: {patient.organFunction.lvef}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mt-3 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">LVEF</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.lvef}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">BNP / NT-proBNP</span>
                    <span className={`font-bold text-sm ${patient.organFunction.bnp > 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {patient.organFunction.bnp} pg/mL
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Resting BP</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.systolicBp}/{patient.organFunction.diastolicBp}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedOrgan === 'metabolic' && (
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-[#0F172A] font-mono">
                      METABOLIC & GLYCEMIC STATE (Score: {patient.organFunction.metabolicScore}/100)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    HbA1c: {patient.organFunction.hba1c}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-3 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">HbA1c</span>
                    <span className="font-bold text-amber-600 text-sm">{patient.organFunction.hba1c}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Fasting Glucose</span>
                    <span className="font-bold text-[#0F172A] text-sm">{patient.organFunction.fastingGlucose} mg/dL</span>
                  </div>
                </div>
              </div>
            )}

            {selectedOrgan === 'vascular' && (
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                    <h4 className="text-xs font-bold text-[#0F172A] font-mono">
                      VASCULAR RESISTANCE & BLOOD PRESSURE
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    BP: {patient.organFunction.systolicBp}/{patient.organFunction.diastolicBp} mmHg
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-3 font-normal">
                  Systemic arterial tone indicates stage 1-2 hypertension under active management.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Organ Balance Radar & Longitudinal Trajectory */}
        <div className="lg:col-span-5 space-y-6">
          {/* Organ Radar Polygon */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#0F172A] font-mono uppercase tracking-wider">
                Organ System Capacity Matrix
              </h3>
              <span className="text-[10px] font-mono text-blue-700">
                5-Axis Vector
              </span>
            </div>

            <RadarChart
              data={radarData}
              size={260}
              primaryLabel="Baseline Pt"
              secondaryLabel="Simulated SGLT2i + GLP1"
              primaryColor="#2563EB"
              secondaryColor="#7C3AED"
            />
          </div>

          {/* Longitudinal History Transition: P(t-1) -> P(t) -> P(t+1) */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <div className="flex items-center space-x-2 mb-3.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-[#0F172A] font-mono uppercase tracking-wider">
                Longitudinal State Trajectory
              </h3>
            </div>

            <div className="space-y-3">
              {patient.longitudinalHistory.map((h, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
                    idx === patient.longitudinalHistory.length - 1
                      ? 'bg-gradient-to-r from-blue-50/70 to-purple-50/70 border-blue-300 text-blue-900 shadow-xs'
                      : 'bg-[#F8FAFF] border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#0F172A]">{h.stateName}</span>
                    <span className="text-[10px] text-slate-500">{h.timestamp}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span>eGFR: <strong className="text-blue-700">{h.eGFR}</strong></span>
                    <span>HbA1c: <strong className="text-purple-700">{h.hba1c}%</strong></span>
                    <span>BP: <strong className="text-slate-800">{h.systolicBp}</strong></span>
                    <span>Meds: <strong className="text-blue-700">{h.medicationCount}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

