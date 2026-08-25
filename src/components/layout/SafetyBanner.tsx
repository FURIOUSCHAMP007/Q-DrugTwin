import React from 'react';
import { ShieldAlert, Cpu, Sparkles, Activity } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="bg-[#EEF4FF]/90 border-b border-blue-200/60 backdrop-blur-md px-4 py-1.5 flex items-center justify-between text-xs text-[#0F172A] z-40 relative">
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
        </span>
        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-xs shrink-0">
          <ShieldAlert className="w-3 h-3 text-blue-600" />
          <span className="font-bold tracking-wider uppercase">CLINICAL DECISION PROTOCOL</span>
        </div>
        <p className="truncate text-slate-600 text-xs font-medium">
          Q-DrugTwin is an AI & Quantum simulation decision-support platform. Outputs are predictive candidate scenarios for clinician review.
        </p>
      </div>

      <div className="hidden lg:flex items-center space-x-4 shrink-0 pl-4">
        <div className="flex items-center space-x-2.5 text-slate-500 text-xs font-mono">
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-600 animate-pulse" />
            NVIDIA TensorRT FP16
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-purple-600 font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-600" />
            QAOA QUBO v1.4
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-indigo-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Gemini 3.7 Flash
          </span>
        </div>
      </div>
    </div>
  );
};


