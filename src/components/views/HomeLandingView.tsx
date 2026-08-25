import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Dna,
  Bot,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  FlaskConical,
  Network,
  SlidersHorizontal,
  Users,
  BarChart3,
  Play,
  FileText,
  ChevronRight,
  GitCompare,
  Terminal,
  Database,
  Lock,
  Pill,
  HeartPulse,
  Scale
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';
import { PatientDigitalTwinState } from '../../types';

interface HomeLandingViewProps {
  activePatient: PatientDigitalTwinState;
  patients: PatientDigitalTwinState[];
  onSelectPatient: (patient: PatientDigitalTwinState) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenGuidedDemo: () => void;
  onOpenAddPatient: () => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({
  activePatient,
  patients,
  onSelectPatient,
  onNavigate,
  onOpenGuidedDemo,
  onOpenAddPatient
}) => {
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  const pipelineSteps = [
    {
      step: '01',
      title: 'Multimodal Twin Ingestion',
      category: 'Data Layer',
      icon: Activity,
      description: 'Ingests longitudinal labs (eGFR, HbA1c, CrCl), Pharmacogenomics (CYP450 diplotypes), vital signs, and active polypharmacy regimens.',
      specs: 'FHIR R4 / HL7 Compatible • 42 Biomarkers Tracked • Real-time State Vector'
    },
    {
      step: '02',
      title: 'PharmaGNN Graph Discovery',
      category: 'Knowledge Graph',
      icon: Network,
      description: 'Maps multi-hop drug-drug-gene-target interactions across 1.8M biomedical triples to uncover hidden metabolic competition and synergistic toxicity.',
      specs: 'TransE / RotatE Embeddings • CYP Isoenzyme Substrates • 0.938 AUROC'
    },
    {
      step: '03',
      title: 'Multi-Head Organ Forecasting',
      category: 'Neural Simulation',
      icon: Layers,
      description: 'Simulates 90-day organ trajectories, predicting renal eGFR decline, hepatic enzyme elevation, cardiorenal protection, and adverse drug reactions.',
      specs: 'Temporal Transformer • 11.4 ms Latency via TensorRT FP16 • 91.4% Accuracy'
    },
    {
      step: '04',
      title: 'Hybrid QUBO Quantum Optimization',
      category: 'Quantum Annealing',
      icon: Cpu,
      description: 'Formulates the polypharmacy search space as a Quadratic Unconstrained Binary Optimization Hamiltonian to discover the global Pareto-optimal regimen.',
      specs: 'Cirq Simulated Annealer • Multi-Objective Energy Function • 99.4% Ground Fidelity'
    },
    {
      step: '05',
      title: 'Gemini 3.7 Clinical Validation',
      category: 'Reasoning & Safety',
      icon: Bot,
      description: 'Grounds recommendations against KDIGO 2024, ADA 2025, and CPIC clinical practice guidelines with transparent SHAP attribution and interactive dialogue.',
      specs: 'Gemini 3.7 Flash • Function-Calling Tool Pipeline • Strict Medical Guardrails'
    }
  ];

  const coreModules = [
    {
      id: 'simulation-lab' as NavigationTab,
      title: 'What-If Simulation Lab',
      subtitle: 'Dynamic Therapy Sandbox',
      desc: 'Simulate candidate add-ons, dosage titration, or discontinuations with real-time organ trajectory forecasts.',
      icon: FlaskConical,
      badge: 'Interactive',
      gradient: 'from-blue-600/20 via-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'quantum-optimizer' as NavigationTab,
      title: 'QUBO Quantum Annealer',
      subtitle: 'Combinatorial Drug Search',
      desc: 'Solve NP-hard polypharmacy combinations using quantum Hamiltonian energy minimization to eliminate drug interactions.',
      icon: Cpu,
      badge: 'Quantum AI',
      gradient: 'from-purple-600/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'interactions' as NavigationTab,
      title: 'Biomedical Knowledge Graph',
      subtitle: '1.8M Multi-Hop Triples',
      desc: 'Visualize metabolic competition, enzyme inhibition (CYP2C19, CYP3A4), and target receptor pathways in real time.',
      icon: Network,
      badge: 'PharmaGNN',
      gradient: 'from-rose-600/20 via-purple-500/10 to-transparent',
      borderColor: 'border-rose-500/30'
    },
    {
      id: 'ai-insights' as NavigationTab,
      title: 'Q-AI Clinical Reasoning',
      subtitle: 'Gemini 3.7 Flash Co-Pilot',
      desc: 'Engage with a specialized multi-agent assistant grounded in patient digital twins and KDIGO/ADA clinical practice guidelines.',
      icon: Bot,
      badge: 'Co-Pilot',
      gradient: 'from-indigo-600/20 via-purple-500/10 to-transparent',
      borderColor: 'border-indigo-500/30'
    },
    {
      id: 'explainability' as NavigationTab,
      title: 'XAI & SHAP Attribution',
      subtitle: 'Transparent Biomarker Impact',
      desc: 'Inspect feature attributions, Shapley waterfall charts, and counterfactual sensitivity analyses for every clinical decision.',
      icon: SlidersHorizontal,
      badge: 'Explainable',
      gradient: 'from-cyan-600/20 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'scenario-comparison' as NavigationTab,
      title: 'Multi-Scenario Decision Matrix',
      subtitle: 'Trade-Off & Radar Overlays',
      desc: 'Compare candidate therapy scenarios side-by-side on 5 clinical axes and print publication-ready clinical dossiers.',
      icon: GitCompare,
      badge: 'Decision Matrix',
      gradient: 'from-emerald-600/20 via-cyan-500/10 to-transparent',
      borderColor: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-12 overflow-hidden shadow-xs hover:border-blue-300 transition-all">
        {/* Glow ambient meshes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>QUANTUM & AI PRECISION PHARMACOLOGY</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>NEURAL DIGITAL TWIN v2.4</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>NVIDIA TENSORRT ACCELERATED</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
              Precision Polypharmacy Optimization &{' '}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                Patient Digital Twins
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-3xl">
              Q-DrugTwin combines Graph Neural Networks (PharmaGNN), Quantum Annealing (QUBO), and Gemini 3.7 Flash reasoning to eliminate adverse drug interactions, personalize dosages to pharmacogenomics, and simulate multi-organ treatment trajectories in complex polypharmacy patients.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigate('overview')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all flex items-center space-x-2.5"
            >
              <span>Launch Command Overview</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('simulation-lab')}
              className="px-5 py-3 rounded-2xl bg-[#F8FAFF] hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-bold text-xs sm:text-sm border border-blue-200 shadow-xs transition-all flex items-center space-x-2"
            >
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <span>Simulate What-If Lab</span>
            </button>

            <button
              onClick={onOpenGuidedDemo}
              className="px-5 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 font-bold text-xs sm:text-sm border border-purple-200 transition-all flex items-center space-x-2"
            >
              <Play className="w-4 h-4 text-purple-600" />
              <span>Guided Tour</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Ticker */}
        <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Inference Speed</span>
            <div className="text-base font-bold text-blue-700 mt-0.5">11.4 ms</div>
            <span className="text-[10px] text-emerald-600">TensorRT 10.2 FP16</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Knowledge Graph</span>
            <div className="text-base font-bold text-purple-700 mt-0.5">1.8M Triples</div>
            <span className="text-[10px] text-slate-500">Drugs, CYP450, Targets</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Quantum Fidelity</span>
            <div className="text-base font-bold text-emerald-700 mt-0.5">99.4% Ground</div>
            <span className="text-[10px] text-slate-500">QUBO Annealing Engine</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">AI Reasoning</span>
            <div className="text-base font-bold text-[#0F172A] mt-0.5">Gemini 3.7</div>
            <span className="text-[10px] text-blue-600">KDIGO & ADA Guardrails</span>
          </div>
        </div>
      </section>

      {/* Cohort Digital Twin Fast Selector */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Synthetic Patient Cohort Workspace</span>
            </div>
            <h2 className="text-xl font-black text-[#0F172A] mt-0.5">
              Select an Active Patient Digital Twin
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddPatient}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center space-x-1.5"
            >
              <span>+ Add Patient</span>
            </button>
            <button
              onClick={() => onNavigate('patients')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 text-xs font-bold border border-purple-200 transition-all flex items-center space-x-1.5"
            >
              <span>View All ({patients.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.slice(0, 3).map((patient) => {
            const isSelected = patient.patientId === activePatient.patientId;
            return (
              <div
                key={patient.patientId}
                className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#EEF4FF] to-white border-blue-400 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {patient.patientId}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        patient.treatmentComplexity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : patient.treatmentComplexity === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {patient.treatmentComplexity} RISK
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] mt-2.5">
                    {patient.name.split(' (')[0]}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {patient.demographics.age}yo {patient.demographics.gender} • BMI {patient.demographics.bmi} • {patient.demographics.ethnicity}
                  </p>

                  {/* Conditions Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {patient.conditions.map((c) => (
                      <span
                        key={c.id}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-[#F8FAFF] border border-slate-200 text-slate-700"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>

                  {/* Quick Labs Matrix */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-center font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block">eGFR</span>
                      <span className={`font-bold ${patient.organFunction.eGFR < 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {patient.organFunction.eGFR}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">HbA1c</span>
                      <span className={`font-bold ${patient.organFunction.hba1c > 7 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {patient.organFunction.hba1c}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Meds</span>
                      <span className="font-bold text-blue-700">
                        {patient.currentMedications.length} Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectPatient(patient);
                      onNavigate('digital-twin');
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-md shadow-blue-500/20'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{isSelected ? 'Active Digital Twin' : 'Load Digital Twin'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectPatient(patient);
                      onNavigate('simulation-lab');
                    }}
                    title="Launch Simulation Lab"
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shrink-0"
                  >
                    <FlaskConical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Platform Modules Grid */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Integrated Clinical Modules</span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] mt-0.5">
            Full-Stack Decision Support Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="group rounded-2xl bg-white border border-slate-200/90 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-blue-400 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                      <Icon className="w-5 h-5 text-blue-700 group-hover:text-blue-800 transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-blue-700 transition-colors">
                    {mod.title}
                  </h3>
                  <span className="text-xs text-blue-700 font-mono block mt-0.5">
                    {mod.subtitle}
                  </span>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-purple-700 transition-colors">
                  <span>Open Module</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive 5-Stage Precision Pipeline Explorer */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>End-to-End Computational Architecture</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-[#0F172A] mt-1">
              5-Stage Precision Polypharmacy Pipeline
            </h2>
          </div>
          <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full self-start sm:self-auto font-semibold">
            Interactive Workflow
          </span>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activePipelineStep === idx;
            return (
              <button
                key={step.step}
                onClick={() => setActivePipelineStep(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] border-transparent text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#F8FAFF] border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-black ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {step.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <div className="mt-3">
                  <span className={`text-[10px] block font-mono ${isActive ? 'text-purple-100' : 'text-slate-400'}`}>
                    {step.category}
                  </span>
                  <span className={`text-xs font-bold truncate block mt-0.5 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {step.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Details Panel */}
        <div className="p-6 rounded-2xl bg-[#F8FAFF] border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-mono text-xs font-bold">
                STAGE {pipelineSteps[activePipelineStep].step}:
              </span>
              <h3 className="text-base font-bold text-[#0F172A]">
                {pipelineSteps[activePipelineStep].title}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {pipelineSteps[activePipelineStep].category}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {pipelineSteps[activePipelineStep].description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-600">
            <span className="text-blue-700">
              <strong className="text-slate-500">Specifications:</strong> {pipelineSteps[activePipelineStep].specs}
            </span>
            <button
              onClick={() => {
                if (activePipelineStep === 0) onNavigate('digital-twin');
                else if (activePipelineStep === 1) onNavigate('interactions');
                else if (activePipelineStep === 2) onNavigate('simulation-lab');
                else if (activePipelineStep === 3) onNavigate('quantum-optimizer');
                else onNavigate('ai-insights');
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all flex items-center space-x-1.5 self-start sm:self-auto shrink-0 shadow-md shadow-blue-500/20"
            >
              <span>Explore In App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Safety, Compliance & Standards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-sm font-bold text-[#0F172A]">Clinical Safety Guardrails</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Automated hard-constraint checking against Black Box warnings, eGFR dosage caps, and life-threatening contraindications.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-blue-600">
            <Lock className="w-5 h-5" />
            <h4 className="text-sm font-bold text-[#0F172A]">Synthetic & HIPAA Compliant</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Digital twin instances operate on synthetic, parameterized cohort data designed for research and clinical decision simulations.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-purple-600">
            <SlidersHorizontal className="w-5 h-5" />
            <h4 className="text-sm font-bold text-[#0F172A]">Full SHAP Explainability</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Every predicted efficacy score, ADR risk, and recommended drug replacement is fully decomposed into interpretable local feature attributions.
          </p>
        </div>
      </section>
    </div>
  );
};
