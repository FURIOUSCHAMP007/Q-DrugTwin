import React from 'react';
import {
  Activity,
  Cpu,
  Bot,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Network,
  Users,
  Play,
  ChevronRight,
  GitCompare,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';
import { PatientDigitalTwinState } from '../../types';
import { QuantumUsageOverviewSection } from '../home/QuantumUsageOverviewSection';

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
  const quickActions = [
    {
      id: 'simulation-lab' as NavigationTab,
      title: 'What-If Simulation Lab',
      desc: 'Simulate new candidate medications, dosage changes, and 90-day multi-organ trajectory forecasts.',
      icon: FlaskConical,
      tag: 'Interactive Sandbox',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: 'quantum-optimizer' as NavigationTab,
      title: 'QUBO Quantum Annealer',
      desc: 'Formulate and optimize multi-drug combinations to eliminate toxic interactions and maximize efficacy.',
      icon: Cpu,
      tag: 'Quantum Optimization',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      id: 'interactions' as NavigationTab,
      title: 'Biomedical Knowledge Graph',
      desc: 'Explore 1.8M multi-hop relationships between active medications, CYP enzymes, and disease targets.',
      icon: Network,
      tag: 'PharmaGNN',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    },
    {
      id: 'ai-insights' as NavigationTab,
      title: 'Q-AI Clinical Reasoning',
      desc: 'Consult with Gemini 3.7 Flash, Live Voice API, and real-time KDIGO/ADA search grounding.',
      icon: Bot,
      tag: 'Gemini Co-Pilot',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Clean Welcome Hero */}
      <section className="relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>HYBRID AI & QUANTUM DIGITAL TWIN</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-mono text-xs font-semibold border border-purple-200">
              Gemini 3.7 Flash Ready
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Personalized Polypharmacy &{' '}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              Digital Twin Simulation
            </span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
            Simulate patient-specific drug responses, detect metabolic interactions, and optimize multi-drug regimens with Graph Neural Networks, QUBO quantum annealing, and clinical guidelines.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('simulation-lab')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Launch Simulation Lab</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenGuidedDemo}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs sm:text-sm border border-purple-200 transition-all flex items-center space-x-2"
            >
              <Play className="w-4 h-4 text-purple-600" />
              <span>10-Step Guided Tour</span>
            </button>

            <button
              onClick={() => onNavigate('overview')}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-all"
            >
              <span>Command Center</span>
            </button>
          </div>
        </div>

        {/* Quick Status Stats */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Active Twin</span>
            <div className="text-sm font-bold text-blue-700 mt-0.5">{activePatient.patientId}</div>
            <span className="text-[10px] text-slate-500 truncate block">{activePatient.name.split(' (')[0]}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Organ Function</span>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">eGFR {activePatient.organFunction.eGFR}</div>
            <span className="text-[10px] text-slate-500">HbA1c {activePatient.organFunction.hba1c}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Active Regimen</span>
            <div className="text-sm font-bold text-purple-700 mt-0.5">{activePatient.currentMedications.length} Drugs</div>
            <span className="text-[10px] text-slate-500">Complexity: {activePatient.treatmentComplexity}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">AI & Optimization</span>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">Gemini + QUBO</div>
            <span className="text-[10px] text-blue-600">KDIGO & ADA Guardrails</span>
          </div>
        </div>
      </section>

      {/* Quantum Computing Usage & Architecture Deep-Dive */}
      <QuantumUsageOverviewSection onNavigate={onNavigate} />

      {/* Core Tools Quick Access */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Clinical Decision Modules
          </h2>
          <p className="text-xs text-slate-500">
            Direct access to core simulation, quantum optimization, and AI reasoning workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group rounded-2xl bg-white border border-slate-200/90 p-5 transition-all duration-200 hover:border-blue-400 cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${action.bg} border ${action.border} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      {action.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-blue-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-purple-700 transition-colors">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Simple Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Clinical Decision Support & Simulation Prototype — For Qualified Healthcare Professional Review Only.
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-500 shrink-0">
          <span>KDIGO 2024</span>
          <span>•</span>
          <span>ADA 2025</span>
          <span>•</span>
          <span>CPIC Guidelines</span>
        </div>
      </div>
    </div>
  );
};
