import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Activity,
  Layers,
  Cpu,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  Plus,
  Trash2,
  TrendingUp,
  ShieldCheck,
  Gauge,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PatientDigitalTwinState, Medication, ScenarioSimulationResult } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';
import { ApiService } from '../../services/apiService';
import { checkDosageTolerance } from '../../utils/dosageToleranceChecker';
import { RadarChart, RadarDataPoint } from '../common/RadarChart';
import { ConfidenceGauge } from '../common/ConfidenceGauge';
import { ConfidenceScoreIndicator } from '../common/ConfidenceScoreIndicator';
import { QuantumExecutionHistory } from '../simulation/QuantumExecutionHistory';

interface SimulationLabViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
  initialCandidate?: Medication | null;
}

export const SimulationLabView: React.FC<SimulationLabViewProps> = ({
  patient,
  onNavigate,
  initialCandidate
}) => {
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    initialCandidate ? [initialCandidate.id] : ['cand_empagliflozin']
  );
  const [scenarioName, setScenarioName] = useState('Scenario A: Cardiorenal Optimization');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<ScenarioSimulationResult | null>(null);
  const [historicalScenarios, setHistoricalScenarios] = useState<ScenarioSimulationResult[]>([]);

  const toggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter((item) => item !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationStep(1);

    const candidates = CANDIDATE_MEDICATIONS.filter((m) =>
      selectedCandidateIds.includes(m.id)
    );

    // Simulate multi-stage pipeline animation
    setTimeout(() => setSimulationStep(2), 350);
    setTimeout(() => setSimulationStep(3), 700);
    setTimeout(() => setSimulationStep(4), 1050);

    setTimeout(async () => {
      const result = await ApiService.simulateScenario(
        patient,
        candidates,
        scenarioName || 'Custom Simulated Scenario'
      );

      setActiveResult(result);
      setHistoricalScenarios((prev) => [result, ...prev.slice(0, 4)]);
      setIsSimulating(false);
      setSimulationStep(0);

      // Trigger celebratory confetti if score > 85
      if (result.overallSuitabilityScore >= 85) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }, 1400);
  };

  const handleApplyCandidatesFromQuantum = (candidateIds: string[], customScenarioName?: string) => {
    setSelectedCandidateIds(candidateIds);
    if (customScenarioName) {
      setScenarioName(customScenarioName);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Radar representation for the active simulated scenario
  const radarData: RadarDataPoint[] = activeResult
    ? [
        { axis: 'Efficacy', value: activeResult.predictedResponse, secondaryValue: 72 },
        { axis: 'ADR Safety', value: 100 - activeResult.adrRisk, secondaryValue: 75 },
        { axis: 'DDI Margin', value: 100 - activeResult.interactionRiskScore, secondaryValue: 80 },
        { axis: 'Renal Support', value: Math.min(100, patient.organFunction.renalScore + activeResult.organImpactForecast.renalDelta * 2), secondaryValue: patient.organFunction.renalScore },
        { axis: 'Metabolic Gain', value: Math.min(100, patient.organFunction.metabolicScore + activeResult.organImpactForecast.metabolicDelta * 1.5), secondaryValue: patient.organFunction.metabolicScore }
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200 flex items-center space-x-1">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>WHAT-IF TREATMENT SIMULATION ENGINE</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Simulate Candidate Regimens for <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">{patient.name.split(' (')[0]}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Test multi-agent therapeutic combinations against current patient biology without prescribing
          </p>
        </div>

        <button
          onClick={() => onNavigate('quantum-optimizer')}
          className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto z-10"
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>Launch QUBO Combinatorial Search</span>
        </button>
      </div>

      {/* Main Simulation Builder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Candidate Selection & Constraints */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Scenario Configuration</span>
              </h3>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                {selectedCandidateIds.length} Selected
              </span>
            </div>

            {/* Scenario Name Input */}
            <div className="mb-4">
              <label className="text-[11px] font-mono text-slate-500 uppercase font-semibold block mb-1.5">
                Scenario Identifier / Hypothesis:
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>

            {/* Candidate Selector Checklist */}
            <div>
              <label className="text-[11px] font-mono text-slate-500 uppercase font-semibold block mb-2">
                Select Candidate Agents to Introduce:
              </label>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {CANDIDATE_MEDICATIONS.map((cand) => {
                  const isChecked = selectedCandidateIds.includes(cand.id);
                  const toleranceCheck = checkDosageTolerance(cand, patient.dosageToleranceThresholds);
                  return (
                    <div
                      key={cand.id}
                      onClick={() => toggleCandidate(cand.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        toleranceCheck.isExceeded
                          ? isChecked
                            ? 'bg-rose-50/90 border-rose-300 text-rose-900 shadow-xs'
                            : 'bg-rose-50/30 border-rose-200 text-slate-700 hover:border-rose-300'
                          : isChecked
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs'
                          : 'bg-[#F8FAFF] border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? toleranceCheck.isExceeded
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="text-xs font-bold text-[#0F172A] block truncate">
                              {cand.name} ({cand.dosage})
                            </span>
                            {toleranceCheck.isExceeded && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-mono font-bold shrink-0">
                                Dose Limit
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate block">
                            {toleranceCheck.isExceeded
                              ? `Historical cap: ${toleranceCheck.threshold?.maxDailyDoseMg}mg/d (${toleranceCheck.threshold?.limitingFactor.replace('_', ' ')})`
                              : cand.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-emerald-700 font-semibold shrink-0 ml-2">
                        {cand.predictedEffectiveness}% Eff
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating || selectedCandidateIds.length === 0}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:scale-[1.01] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Computing Multi-Stage Inference...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute What-If Treatment Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Current Patient Baseline Anchor */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4.5 font-mono text-xs text-slate-600 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
              Active Baseline Regimen Anchor ({patient.currentMedications.length} Drugs):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {patient.currentMedications.map((m) => (
                <span key={m.id} className="px-2 py-0.5 rounded-lg bg-[#F8FAFF] border border-slate-200 text-slate-700 text-[11px]">
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Simulation Telemetry & Active Results */}
        <div className="lg:col-span-7 space-y-5">
          {/* Animated Pipeline Telemetry Banner when running */}
          {isSimulating && (
            <div className="rounded-2xl bg-white border border-blue-300 p-5 space-y-3 font-mono text-xs shadow-md">
              <div className="flex items-center space-x-2 text-blue-700 font-bold">
                <Activity className="w-4 h-4 animate-spin text-blue-600" />
                <span>NVIDIA CUDA Pipeline Executing Multi-Head Model...</span>
              </div>
              <div className="space-y-1.5 pl-6 text-slate-600">
                <div className={simulationStep >= 1 ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                  {simulationStep >= 1 ? '✓' : '○'} Vectorizing patient state P(t) [eGFR: {patient.organFunction.eGFR}, HbA1c: {patient.organFunction.hba1c}%]
                </div>
                <div className={simulationStep >= 2 ? 'text-purple-700 font-bold' : 'text-slate-400'}>
                  {simulationStep >= 2 ? '✓' : '○'} Running ResponseNet Efficacy Head (AUROC 0.914)
                </div>
                <div className={simulationStep >= 3 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                  {simulationStep >= 3 ? '✓' : '○'} Traversing PharmaGNN Knowledge Graph for DDI Link Conflicts
                </div>
                <div className={simulationStep >= 4 ? 'text-purple-700 font-bold' : 'text-slate-400'}>
                  {simulationStep >= 4 ? '✓' : '○'} Simulating QAOA QUBO ground-state Hamiltonian convergence
                </div>
              </div>
            </div>
          )}

          {/* Active Simulation Results Display */}
          {activeResult ? (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold uppercase">
                    SIMULATED SCENARIO EVALUATION
                  </span>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-1.5">
                    {activeResult.scenarioName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Introduces: {activeResult.candidateMedications.map((c) => c.name).join(', ') || 'No Additions'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center space-x-3">
                  <ConfidenceGauge
                    score={activeResult.overallSuitabilityScore}
                    size={90}
                    label="Suitability"
                    colorScheme={activeResult.overallSuitabilityScore >= 80 ? 'cyan' : 'amber'}
                    showUncertainty={false}
                  />
                </div>
              </div>

              {/* Top 3 Core Predictions */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Predicted Efficacy</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {activeResult.predictedResponse}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">ADR Risk</span>
                  <span className={`text-xl font-extrabold ${activeResult.adrRisk > 25 ? 'text-amber-700' : 'text-slate-800'}`}>
                    {activeResult.adrRisk}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">DDI Burden</span>
                  <span className={`text-xl font-extrabold uppercase ${
                    activeResult.interactionRisk === 'critical' || activeResult.interactionRisk === 'high'
                      ? 'text-rose-700'
                      : activeResult.interactionRisk === 'moderate'
                      ? 'text-amber-700'
                      : 'text-blue-700'
                  }`}>
                    {activeResult.interactionRisk}
                  </span>
                </div>
              </div>

              {/* Simulation Prediction Confidence Score Indicator */}
              <ConfidenceScoreIndicator
                confidence={activeResult.overallSuitabilityScore}
                size="md"
                showBreakdown={true}
              />

              {/* Multi-Axis Radar & Organ Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <RadarChart
                    data={radarData}
                    size={220}
                    primaryLabel="Simulated Scenario"
                    secondaryLabel="Baseline Regimen"
                    primaryColor="#2563EB"
                    secondaryColor="#7C3AED"
                  />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <h4 className="text-[#0F172A] font-bold uppercase text-[11px] tracking-wider">
                    Organ Subsystem Impact Forecast:
                  </h4>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">Renal Trajectory (eGFR):</span>
                    <span className={`font-bold ${activeResult.organImpactForecast.renalDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {activeResult.organImpactForecast.renalDelta >= 0 ? '+' : ''}{activeResult.organImpactForecast.renalDelta.toFixed(1)} mL/min
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">Cardiovascular Protection:</span>
                    <span className="font-bold text-blue-700">
                      +{activeResult.organImpactForecast.cardiacDelta.toFixed(1)}% Index
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">Metabolic Glycemic Drop:</span>
                    <span className="font-bold text-emerald-700">
                      +{activeResult.organImpactForecast.metabolicDelta.toFixed(1)}% Control
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected Drug Interactions Alerts */}
              {activeResult.detectedInteractions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Potential Drug Interaction Alert ({activeResult.detectedInteractions.length} Identified)</span>
                  </div>
                  {activeResult.detectedInteractions.map((ddi) => (
                    <div key={ddi.id} className="text-xs text-slate-700 pl-6 space-y-0.5">
                      <p className="font-semibold text-rose-800">
                        {ddi.drugA} ↔ {ddi.drugB} ({ddi.severity.toUpperCase()})
                      </p>
                      <p className="text-[11px] text-slate-600">{ddi.clinicalEffect}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Historical Tolerance Threshold Violations in Simulated Candidates */}
              {activeResult.candidateMedications.some((m) => checkDosageTolerance(m, patient.dosageToleranceThresholds).isExceeded) && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold font-mono">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Predictive Warning: Proposed Candidate Exceeds Historical Tolerance Ceiling</span>
                  </div>
                  {activeResult.candidateMedications.map((m) => {
                    const check = checkDosageTolerance(m, patient.dosageToleranceThresholds);
                    if (!check.isExceeded || !check.threshold) return null;
                    return (
                      <div key={m.id} className="text-xs text-slate-800 pl-6 space-y-1 bg-white/80 p-2.5 rounded-lg border border-rose-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900">
                            {m.name} ({m.dosage} {m.frequency})
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                            +{check.percentageExceeded}% Over Safe Ceiling
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans">
                          <strong>Limiting Rationale:</strong> {check.threshold.sourceReason}. Max daily ceiling: {check.threshold.maxDailyDoseMg} {check.threshold.unit}/day (Proposed: {check.proposedDailyDoseMg} {check.threshold.unit}/day).
                        </p>
                        {check.threshold.historicalReaction && (
                          <p className="text-[11px] text-rose-700 italic font-sans">
                            Historical Patient Record: "{check.threshold.historicalReaction}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explainable AI Attribution Summary */}
              <div className="p-4.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <h4 className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Key XAI Biomarker Attributions:
                </h4>
                <div className="space-y-2 text-xs">
                  {activeResult.keyAttributions.map((attr, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className={attr.impact === 'positive' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {attr.impact === 'positive' ? '↑' : '↓'}
                      </span>
                      <div>
                        <strong className="text-slate-800">{attr.factor}:</strong>{' '}
                        <span className="text-slate-600 font-normal">{attr.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onNavigate('scenario-comparison')}
                  className="text-xs font-mono text-blue-700 hover:text-blue-800 flex items-center space-x-1.5 transition-colors font-bold"
                >
                  <span>Compare with other candidate scenarios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center min-h-[360px] shadow-xs">
              <FlaskConical className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                Simulation Chamber Idle
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 font-normal">
                Select one or more candidate medications from the panel on the left and click "Execute What-If Treatment Simulation".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quantum Execution History Component */}
      <QuantumExecutionHistory
        patient={patient}
        onApplyCandidatesToSimulation={handleApplyCandidatesFromQuantum}
        onNavigateToOptimizer={() => onNavigate('quantum-optimizer')}
      />
    </div>
  );
};

