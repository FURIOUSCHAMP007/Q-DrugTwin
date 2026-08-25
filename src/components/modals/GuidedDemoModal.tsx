import React, { useState } from 'react';
import {
  X,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Activity,
  Cpu,
  FlaskConical,
  Network,
  Bot,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  activePatient: PatientDigitalTwinState;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  activePatient
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: 'Welcome to Q-DrugTwin (SIH Demo Walkthrough)',
      tab: 'overview',
      icon: Zap,
      description:
        'Q-DrugTwin is an AI-powered hybrid digital twin platform for personalized drug response simulation and polypharmacy optimization. It combines dynamic biological state vectors, deep learning, biomedical knowledge graphs, and quantum QUBO solvers to prevent adverse drug events and maximize therapeutic response.',
      highlight: 'Hybrid Classical-Quantum Precision Medicine Architecture'
    },
    {
      title: 'Step 1: Inspect the Patient Digital Twin State P(t)',
      tab: 'digital-twin',
      icon: Activity,
      description:
        `Review the holographic representation of ${activePatient.name.split(' (')[0]} (ID: ${activePatient.patientId}). The digital twin parameterizes renal function (eGFR ${activePatient.organFunction.eGFR} mL/min), hepatic transaminases, cardiac LVEF (${activePatient.organFunction.lvef}%), metabolic HbA1c (${activePatient.organFunction.hba1c}%), and pharmacogenomic diplotypes into a synchronized vector.`,
      highlight: 'Continuous Multi-Organ State Vector P(t)'
    },
    {
      title: 'Step 2: Review Active Regimen & PGx Biomarkers',
      tab: 'medications',
      icon: Layers,
      description:
        'Examine the patient’s active polypharmacy regimen alongside pharmacogenomic variations like CYP2C19 (Poor Metabolizer for Clopidogrel) and CYP2C9 diplotypes that influence hepatic clearance rates and drug exposure.',
      highlight: 'Target Receptors & Cytochrome P450 Kinetics'
    },
    {
      title: 'Step 3: What-If Treatment Simulation Chamber',
      tab: 'simulation-lab',
      icon: FlaskConical,
      description:
        'Run predictive What-If treatment simulations introducing candidate agents like SGLT2 inhibitors (Empagliflozin) or GLP-1 RAs (Semaglutide). The NVIDIA-accelerated ResponseNet and ADRNet models estimate response efficacy, organ trajectories, and adverse probability.',
      highlight: 'Virtual Drug Trial in Silico'
    },
    {
      title: 'Step 4: Biomedical Knowledge Graph (PharmaGNN)',
      tab: 'interactions',
      icon: Network,
      description:
        'Traverse the 1.8M-edge biomedical graph to discover hidden multi-hop drug-drug interactions, enzymatic competition (e.g. Omeprazole inhibiting CYP2C19 bioactivation of Clopidogrel), and synergistic adverse pathways like dual RAAS hyperkalemia.',
      highlight: 'Multi-Hop Graph Link Prediction'
    },
    {
      title: 'Step 5: Quantum QUBO Combinatorial Optimization',
      tab: 'quantum-optimizer',
      icon: Cpu,
      description:
        'Solve the combinatorial challenge of polypharmacy selection over 2^N candidate regimes. The Ising Hamiltonian rewards clinical efficacy while penalizing toxicity, drug interactions, and polypharmacy pill burden to yield the global ground state.',
      highlight: 'Ising / QAOA Quantum Combinatorial Search'
    },
    {
      title: 'Step 6: Q-AI Clinical Reasoning Assistant (Gemini 3.7)',
      tab: 'ai-insights',
      icon: Bot,
      description:
        'Consult Gemini 3.7 Flash equipped with native tool-calling capabilities. The clinical assistant inspects the digital twin, navigates guideline databases (KDIGO, ADA, ACC/AHA), and explains pharmacological reasoning with full transparency.',
      highlight: 'Autonomous Tool-Calling Multi-Agent Orchestration'
    }
  ];

  const step = demoSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onNavigateTab(demoSteps[next].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onNavigateTab(demoSteps[prev].tab);
    }
  };

  const handleJump = (idx: number) => {
    setCurrentStep(idx);
    onNavigateTab(demoSteps[idx].tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-2xl shadow-slate-900/20 space-y-6 text-[#0F172A]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-purple-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <StepIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Step {currentStep + 1} of {demoSteps.length}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">SIH 2026 DEMO TOUR</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#0F172A] mt-1">{step.title}</h3>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-3 rounded-xl bg-[#EEF4FF] border border-blue-200/80 text-xs font-mono text-blue-800 font-semibold flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Core Concept: {step.highlight}</span>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed font-sans">{step.description}</p>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center space-x-2 py-2">
          {demoSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleJump(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep ? 'w-8 bg-gradient-to-r from-[#2563EB] to-[#7C3AED]' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-2 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-purple-500/30 flex items-center space-x-2"
          >
            <span>{currentStep === demoSteps.length - 1 ? 'Finish Guided Tour' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
