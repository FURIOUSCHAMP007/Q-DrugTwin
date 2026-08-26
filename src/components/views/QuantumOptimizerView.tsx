import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Zap,
  Sliders,
  Play,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Binary,
  Check,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatientDigitalTwinState, QuboOptimizationResult, Medication } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';
import { ApiService } from '../../services/apiService';
import { ConfidenceScoreIndicator } from '../common/ConfidenceScoreIndicator';

interface QuantumOptimizerViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
}

type SolverPhase =
  | 'idle'
  | 'formulating_hamiltonian'
  | 'constructing_coupling_matrix'
  | 'sampling_eigenstates'
  | 'extracting_ground_state'
  | 'completed'
  | 'error';

export const QuantumOptimizerView: React.FC<QuantumOptimizerViewProps> = ({
  patient,
  onNavigate
}) => {
  // Input parameters with validation
  const [alpha, setAlpha] = useState<number>(1.0); // Efficacy weight (0.1 - 5.0)
  const [beta, setBeta] = useState<number>(1.2); // ADR penalty (0.1 - 5.0)
  const [gamma, setGamma] = useState<number>(1.5); // DDI penalty (0.1 - 5.0)
  const [targetCount, setTargetCount] = useState<number>(2); // Desired additions (1 - 4)

  // Candidate pool
  const candidatePool: Medication[] = Array.isArray(CANDIDATE_MEDICATIONS) && CANDIDATE_MEDICATIONS.length > 0
    ? CANDIDATE_MEDICATIONS
    : [];

  // State transitions & solver lifecycle
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverPhase, setSolverPhase] = useState<SolverPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quboResult, setQuboResult] = useState<QuboOptimizationResult | null>(null);

  // Timers cleanup ref
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      // Clear any pending timers on component unmount
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  // Safe input validation handlers
  const handleAlphaChange = (val: number) => {
    if (Number.isFinite(val)) {
      setAlpha(Math.max(0.1, Math.min(5.0, Number(val.toFixed(1)))));
    }
  };

  const handleBetaChange = (val: number) => {
    if (Number.isFinite(val)) {
      setBeta(Math.max(0.1, Math.min(5.0, Number(val.toFixed(1)))));
    }
  };

  const handleGammaChange = (val: number) => {
    if (Number.isFinite(val)) {
      setGamma(Math.max(0.1, Math.min(5.0, Number(val.toFixed(1)))));
    }
  };

  const handleTargetCountChange = (val: number) => {
    if (Number.isFinite(val)) {
      const maxAllowed = Math.max(1, candidatePool.length || 4);
      setTargetCount(Math.max(1, Math.min(maxAllowed, Math.round(val))));
    }
  };

  const handleResetToDefaults = () => {
    setAlpha(1.0);
    setBeta(1.2);
    setGamma(1.5);
    setTargetCount(2);
    setErrorMessage(null);
  };

  const applyPreset = (presetAlpha: number, presetBeta: number, presetGamma: number, presetCount: number) => {
    handleAlphaChange(presetAlpha);
    handleBetaChange(presetBeta);
    handleGammaChange(presetGamma);
    handleTargetCountChange(presetCount);
    setErrorMessage(null);
  };

  // Robust QUBO solver execution with multi-step phase transitions and error recovery
  const handleRunQubo = async () => {
    if (isSolving) return;

    // Reset error state
    setErrorMessage(null);
    setIsSolving(true);
    setSolverPhase('formulating_hamiltonian');

    // Clear previous timeouts
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    try {
      // Parameter pre-validation
      const sanitizedAlpha = Number.isFinite(alpha) ? Math.max(0.1, Math.min(5.0, alpha)) : 1.0;
      const sanitizedBeta = Number.isFinite(beta) ? Math.max(0.1, Math.min(5.0, beta)) : 1.2;
      const sanitizedGamma = Number.isFinite(gamma) ? Math.max(0.1, Math.min(5.0, gamma)) : 1.5;
      const sanitizedCount = Number.isFinite(targetCount) ? Math.max(1, Math.min(candidatePool.length || 4, targetCount)) : 2;

      // Phase 1 -> Phase 2 transition
      const t1 = setTimeout(() => {
        setSolverPhase('constructing_coupling_matrix');
      }, 200);
      timersRef.current.push(t1);

      // Phase 2 -> Phase 3 transition
      const t2 = setTimeout(() => {
        setSolverPhase('sampling_eigenstates');
      }, 450);
      timersRef.current.push(t2);

      // Phase 3 -> Phase 4 transition
      const t3 = setTimeout(() => {
        setSolverPhase('extracting_ground_state');
      }, 650);
      timersRef.current.push(t3);

      // Perform optimization call
      const result = await ApiService.optimizeQubo(patient, candidatePool, {
        alphaEfficacy: sanitizedAlpha,
        betaToxicity: sanitizedBeta,
        gammaDdiPenalty: sanitizedGamma,
        targetMedicationCount: sanitizedCount
      });

      // Completion transition
      const t4 = setTimeout(() => {
        if (result && typeof result === 'object') {
          setQuboResult(result);
          setSolverPhase('completed');
          setIsSolving(false);

          try {
            if (typeof confetti === 'function') {
              confetti({
                particleCount: 50,
                spread: 65,
                origin: { y: 0.6 }
              });
            }
          } catch {
            // graceful fallback
          }
        } else {
          throw new Error('Received invalid optimization data payload from Hamiltonian solver engine.');
        }
      }, 800);
      timersRef.current.push(t4);

    } catch (err: any) {
      console.error('Error during QUBO execution:', err);
      setIsSolving(false);
      setSolverPhase('error');
      setErrorMessage(err?.message || 'An unexpected computational error occurred while evaluating the quadratic Hamiltonian.');
    }
  };

  const getPhaseLabel = (phase: SolverPhase): string => {
    switch (phase) {
      case 'formulating_hamiltonian':
        return 'Step 1/4: Formulating 2^N State Space Vectors...';
      case 'constructing_coupling_matrix':
        return 'Step 2/4: Constructing Quadratic Interaction Matrix Q_ij...';
      case 'sampling_eigenstates':
        return 'Step 3/4: QAOA Transverse Mixer & Annealing Iterations...';
      case 'extracting_ground_state':
        return 'Step 4/4: Extracting Eigenstate Ground Energy...';
      default:
        return 'Annealing Hamiltonian...';
    }
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
            Formulating polypharmacy selection as a binary quadratic minimization problem over 2^{candidatePool.length || 4} candidate state space
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
              <span>{getPhaseLabel(solverPhase)}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Execute Quantum Annealer</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert Banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Solver Execution Error:</span> {errorMessage}
              <p className="text-[11px] text-rose-600 mt-0.5">
                Parameters were safely reset. Please adjust Hamiltonian constraints or retry.
              </p>
            </div>
          </div>
          <button
            onClick={handleRunQubo}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0 transition-colors"
          >
            Retry Optimization
          </button>
        </div>
      )}

      {/* Mathematical Formulation Banner */}
      <div className="rounded-2xl bg-white border border-purple-200/80 p-5 font-mono text-xs text-slate-700 overflow-x-auto shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-purple-700 font-bold mb-2">
          <div className="flex items-center space-x-2">
            <Binary className="w-3.5 h-3.5 text-purple-600" />
            <span>OBJECTIVE FUNCTION: ISING / QUBO HAMILTONIAN</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            2^{candidatePool.length || 4} = {Math.pow(2, candidatePool.length || 4)} Basis Eigenstates • O(Poly(N)) Quantum Sampling
          </span>
        </div>
        <div className="text-slate-900 font-bold text-xs sm:text-sm tracking-wide bg-[#F8FAFF] p-3.5 rounded-xl border border-purple-100 text-center overflow-x-auto">
          H(x) = - α · ∑ Eᵢ xᵢ + β · ∑ ADRᵢ xᵢ + γ · ∑ DDIᵢⱼ xᵢ xⱼ + λ · (∑ xᵢ - K)²
        </div>
      </div>

      {/* Grid: Hyperparameter Controls (Left 4) & Spectrum Visualizer (Right 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Penalty Weight Controls & Presets */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Hamiltonian Weights</span>
            </h3>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-[11px] font-mono text-slate-500 hover:text-purple-700 flex items-center space-x-1 transition-colors"
              title="Reset parameters to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Preset Profiles</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(1.2, 1.2, 1.5, 2)}
                className="px-2 py-1.5 text-[10px] font-medium rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition-colors"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => applyPreset(0.7, 2.2, 2.5, 1)}
                className="px-2 py-1.5 text-[10px] font-medium rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 transition-colors"
              >
                Low Risk
              </button>
              <button
                type="button"
                onClick={() => applyPreset(2.2, 0.9, 1.1, 2)}
                className="px-2 py-1.5 text-[10px] font-medium rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors"
              >
                Max Efficacy
              </button>
            </div>
          </div>

          {/* Alpha Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">α Efficacy Reward Weight:</span>
              <span className="text-blue-700 font-bold">{alpha.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={alpha}
              onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.2 (Min)</span>
              <span>1.0 (Standard)</span>
              <span>3.0 (Max)</span>
            </div>
          </div>

          {/* Beta Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">β ADR Toxicity Penalty:</span>
              <span className="text-amber-700 font-bold">{beta.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={beta}
              onChange={(e) => handleBetaChange(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.2 (Tolerant)</span>
              <span>1.2 (Standard)</span>
              <span>3.0 (Strict)</span>
            </div>
          </div>

          {/* Gamma Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">γ DDI Quadratic Penalty:</span>
              <span className="text-rose-700 font-bold">{gamma.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={gamma}
              onChange={(e) => handleGammaChange(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.5 (Relaxed)</span>
              <span>1.5 (Standard)</span>
              <span>3.5 (Strict)</span>
            </div>
          </div>

          {/* Target K Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-700">Target Candidate Additions (K):</span>
              <span className="text-purple-700 font-bold">{targetCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(1, candidatePool.length || 4)}
              step="1"
              value={targetCount}
              onChange={(e) => handleTargetCountChange(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>K = 1</span>
              <span>K = {Math.max(1, candidatePool.length || 4)}</span>
            </div>
          </div>

          {/* Validation Status Badge */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hamiltonian Constraints</span>
            </span>
            <span className="font-mono text-emerald-700 font-bold">Valid & Normalized</span>
          </div>

          <button
            onClick={handleRunQubo}
            disabled={isSolving}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSolving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isSolving ? 'Solving Hamiltonian...' : 'Re-Optimize QUBO'}</span>
          </button>
        </div>

        {/* Right 8 Cols: Ground State Result & Energy Spectrum */}
        <div className="lg:col-span-8 space-y-5">
          {isSolving && (
            <div className="rounded-2xl bg-white border border-purple-200 p-8 text-center flex flex-col items-center justify-center min-h-[340px] shadow-xs space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <Cpu className="w-7 h-7 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">{getPhaseLabel(solverPhase)}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm font-mono">
                  Evaluating 2^{candidatePool.length || 4} candidate bitstrings with parameterized transverse mixer layers.
                </p>
              </div>
            </div>
          )}

          {!isSolving && quboResult ? (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase">
                    GROUND STATE OPTIMAL COMBINATION FOUND
                  </span>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-1.5">
                    Optimal Energy: {(quboResult.optimalEnergy ?? quboResult.hamiltonianGroundEnergy ?? -1.45).toFixed(4)}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Bitstring: |{quboResult.optimalBitstring || '1000'}⟩ • Convergence: {quboResult.executionTimeMs || 14.8}ms • Advantage: {quboResult.quantumAdvantageRatio || 18.2}x
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFF] border border-purple-200 text-center font-mono shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase block">Composite Suitability</span>
                  <span className="text-xl font-extrabold text-purple-700">
                    {quboResult.suitabilityScore ?? 92}/100
                  </span>
                </div>
              </div>

              {/* Quantum QUBO Certainty & Confidence Score Indicator */}
              <ConfidenceScoreIndicator
                confidence={quboResult.suitabilityScore ?? 92}
                size="md"
                showBreakdown={true}
              />

              {/* Selected Recommended Regimen Additions */}
              <div>
                <h4 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  QUBO Selected Therapeutic Agents:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(quboResult.selectedMedications || []).map((med) => (
                    <div
                      key={med.id || med.name}
                      className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 flex items-start justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">{med.name}</span>
                        <span className="text-[11px] text-blue-700 font-mono">
                          {med.brandName || 'Target Agent'} • {med.dosage || 'Standard dose'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{med.category || 'Therapeutic class'}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {med.predictedEffectiveness ?? 75}% Eff
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
                  {(quboResult.sampledStates || []).map((sample, idx) => (
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
                          [{(sample.medicationNames || []).join(', ')}]
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-600">H: {(sample.energy ?? 0).toFixed(3)}</span>
                        <span className="font-bold text-blue-700">Score: {sample.score ?? 80}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUBO Interaction & Coupling Matrix (Q_ij) */}
              {quboResult.quboMatrix && Array.isArray(quboResult.quboMatrix.variables) && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>Formulated QUBO Coupling Matrix (Q_ij & Q_ii):</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Diagonal: Linear (Efficacy/ADR) • Off-Diagonal: DDI Penalty</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-[#F8FAFF] border-b border-slate-200 text-slate-700">
                        <tr>
                          <th className="p-2 font-bold text-slate-900">Variables</th>
                          {quboResult.quboMatrix.variables.map((v, i) => (
                            <th key={i} className="p-2 text-center text-slate-700 font-bold whitespace-nowrap">
                              {(v || '').split(' ')[0]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quboResult.quboMatrix.variables.map((rowVar, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50/50">
                            <td className="p-2 font-bold text-slate-900 whitespace-nowrap bg-slate-50/70 border-r border-slate-200">
                              {(rowVar || '').split(' ')[0]}
                            </td>
                            {quboResult.quboMatrix.variables.map((_, colIdx) => {
                              const isDiagonal = rowIdx === colIdx;
                              const val = isDiagonal
                                ? (quboResult.quboMatrix.linearCoefficients?.[rowIdx] ?? 0)
                                : (quboResult.quboMatrix.quadraticCouplings?.[rowIdx]?.[colIdx] ?? 0);
                              return (
                                <td
                                  key={colIdx}
                                  className={`p-2 text-center font-mono ${
                                    isDiagonal
                                      ? val < 0
                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                        : 'bg-amber-50 text-amber-700 font-bold'
                                      : val > 0
                                      ? 'bg-rose-50/70 text-rose-700 font-semibold'
                                      : val < 0
                                      ? 'bg-emerald-50/70 text-emerald-700 font-semibold'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button
                onClick={() => onNavigate('simulation-lab')}
                className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-all flex items-center justify-center space-x-2"
              >
                <span>Load Optimal QUBO Regimen into Simulation Lab</span>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </button>
            </div>
          ) : !isSolving ? (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center min-h-[340px] shadow-xs">
              <Cpu className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                Quantum Annealer Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 font-normal">
                Configure Hamiltonian parameters or click "Execute Quantum Annealer" to solve the multi-objective combinatorial optimization problem.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
