import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Sliders,
  Play,
  CheckCircle,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatientDigitalTwinState, QuboOptimizationResult } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';
import { ApiService } from '../../services/apiService';

interface QuantumOptimizerViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
}

export const QuantumOptimizerView: React.FC<QuantumOptimizerViewProps> = ({
  patient,
  onNavigate
}) => {
  const [alpha, setAlpha] = useState(1.0); // Efficacy weight
  const [beta, setBeta] = useState(1.2); // ADR penalty
  const [gamma, setGamma] = useState(1.5); // DDI penalty
  const [targetCount, setTargetCount] = useState(2); // Desired additions
  const [isSolving, setIsSolving] = useState(false);
  const [quboResult, setQuboResult] = useState<QuboOptimizationResult | null>(null);

  const handleRunQubo = async () => {
    setIsSolving(true);
    const result = await ApiService.optimizeQubo(patient, CANDIDATE_MEDICATIONS, {
      alphaEfficacy: alpha,
      betaToxicity: beta,
      gammaDdiPenalty: gamma,
      targetMedicationCount: targetCount
    });

    setTimeout(() => {
      setQuboResult(result);
      setIsSolving(false);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 }
      });
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-xs font-bold border border-purple-200 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>QUBO / QAOA QUANTUM COMBINATORIAL OPTIMIZATION LAB</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Quadratic Multi-Objective <span className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">Hamiltonian Solver</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Formulating polypharmacy selection as a binary quadratic minimization problem over 2^N candidate state space
          </p>
        </div>

        <button
          onClick={handleRunQubo}
          disabled={isSolving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 hover:scale-[1.01] flex items-center space-x-2 shrink-0 self-start sm:self-auto disabled:opacity-50 z-10"
        >
          {isSolving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Annealing Hamiltonian...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Execute Quantum Annealer</span>
            </>
          )}
        </button>
      </div>

      {/* Mathematical Formulation Banner */}
      <div className="rounded-2xl bg-white border border-purple-200/80 p-5 font-mono text-xs text-slate-700 overflow-x-auto shadow-xs">
        <div className="flex items-center justify-between text-purple-700 font-bold mb-2">
          <span>OBJECTIVE FUNCTION: ISING / QUBO HAMILTONIAN</span>
          <span className="text-[10px] text-slate-500 font-medium">O(2^N) → O(Poly(N)) via Quantum Sampling</span>
        </div>
        <div className="text-slate-900 font-bold text-sm tracking-wide bg-[#F8FAFF] p-3.5 rounded-xl border border-purple-100 text-center">
          H(x) = - α · ∑ Eᵢ xᵢ + β · ∑ ADRᵢ xᵢ + γ · ∑ DDIᵢⱼ xᵢ xⱼ + λ · (∑ xᵢ - K)²
        </div>
      </div>

      {/* Grid: Hyperparameter Controls (Left 4) & Spectrum Visualizer (Right 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Penalty Weight Controls */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Hamiltonian Weights</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500 font-medium">Lagrange Multipliers</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">α Efficacy Reward Weight:</span>
              <span className="text-blue-700 font-bold">{alpha.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">β ADR Toxicity Penalty:</span>
              <span className="text-amber-700 font-bold">{beta.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">γ DDI Quadratic Penalty:</span>
              <span className="text-rose-700 font-bold">{gamma.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">Target Candidate Additions (K):</span>
              <span className="text-purple-700 font-bold">{targetCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          <button
            onClick={handleRunQubo}
            disabled={isSolving}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Re-Optimize QUBO</span>
          </button>
        </div>

        {/* Right 8 Cols: Ground State Result & Energy Spectrum */}
        <div className="lg:col-span-8 space-y-5">
          {quboResult ? (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase">
                    GROUND STATE OPTIMAL COMBINATION FOUND
                  </span>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-1.5">
                    Optimal Energy: {quboResult.optimalEnergy.toFixed(4)}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Bitstring: |{quboResult.optimalBitstring}⟩ • Convergence: {quboResult.executionTimeMs}ms • Advantage: {quboResult.quantumAdvantageRatio}x
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-purple-200 text-center font-mono shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase block">Composite Suitability</span>
                  <span className="text-xl font-extrabold text-purple-700">
                    {quboResult.suitabilityScore}/100
                  </span>
                </div>
              </div>

              {/* Selected Recommended Regimen Additions */}
              <div>
                <h4 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  QUBO Selected Therapeutic Agents:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quboResult.selectedMedications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 flex items-start justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">{med.name}</span>
                        <span className="text-[11px] text-blue-700 font-mono">
                          {med.brandName} • {med.dosage}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{med.category}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {med.predictedEffectiveness}% Eff
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantum Energy State Distribution Spectrum */}
              <div>
                <h4 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Energy Eigenstate Distribution (Top Low-Energy States):
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {quboResult.sampledStates.map((sample, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        idx === 0
                          ? 'bg-purple-50 border-purple-300 text-purple-900 font-medium'
                          : 'bg-[#F8FAFF] border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-900">{sample.state}</span>
                        <span className="text-[11px] text-slate-500 font-sans">
                          [{sample.medicationNames.join(', ')}]
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-600">H: {sample.energy.toFixed(3)}</span>
                        <span className="font-bold text-blue-700">Score: {sample.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate('simulation-lab')}
                className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-all flex items-center justify-center space-x-2"
              >
                <span>Load Optimal QUBO Regimen into Simulation Lab</span>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center min-h-[340px] shadow-xs">
              <Cpu className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                Quantum Annealer Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 font-normal">
                Configure Hamiltonian parameters or click "Execute Quantum Annealer" to solve the multi-objective combinatorial optimization problem.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

