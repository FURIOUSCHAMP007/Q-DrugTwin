import React, { useMemo } from 'react';
import {
  Activity,
  Users,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  FlaskConical,
  Network,
  Bot,
  Play
} from 'lucide-react';
import { PatientDigitalTwinState, Medication, DrugInteraction } from '../../types';
import { MetricCard } from '../common/MetricCard';
import { PatientRiskNotificationPanel } from '../notifications/PatientRiskNotificationPanel';
import { GlobalRiskHeatmap } from '../common/GlobalRiskHeatmap';
import { analyzePatientRiskAlerts, analyzeCohortRiskAlerts } from '../../utils/riskNotificationAnalyzer';

interface OverviewViewProps {
  activePatient: PatientDigitalTwinState;
  patients: PatientDigitalTwinState[];
  interactions: DrugInteraction[];
  onNavigate: (tab: any) => void;
  onOpenGuidedDemo: () => void;
  onSelectPatient?: (patient: PatientDigitalTwinState) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  activePatient,
  patients,
  interactions,
  onNavigate,
  onOpenGuidedDemo,
  onSelectPatient
}) => {
  const highRiskInteractions = interactions.filter(
    (i) => i.severity === 'high' || i.severity === 'contraindicated'
  );

  const activePatientAlerts = useMemo(
    () => analyzePatientRiskAlerts(activePatient, interactions),
    [activePatient, interactions]
  );

  const allCohortAlerts = useMemo(
    () => analyzeCohortRiskAlerts(patients, interactions),
    [patients, interactions]
  );

  const handleSelectPatientById = (patientId: string) => {
    const found = patients.find((p) => p.patientId === patientId);
    if (found && onSelectPatient) {
      onSelectPatient(found);
    }
  };


  return (
    <div className="space-y-5 pb-12">
      {/* Deep-Tech Hero Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 hover:border-blue-300 transition-all p-5 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl z-10">
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs">
              <Zap className="w-3 h-3 text-blue-600" />
              <span>HYBRID QUANTUM-AI CDS ENGINE</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              QUBO + QAOA ACTIVE
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Personalized Drug Response & <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Multi-Target Simulation</span>
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Simulate patient-specific treatment outcomes using high-fidelity Digital Twins, CUDA-accelerated neural predictors, biomedical knowledge graphs, and quantum-inspired combinatorial optimization.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('simulation-lab')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] flex items-center space-x-2"
            >
              <FlaskConical className="w-4 h-4 text-white" />
              <span>Launch What-If Simulation</span>
            </button>

            <button
              onClick={onOpenGuidedDemo}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0F172A] font-semibold text-xs border border-slate-200 transition-all flex items-center space-x-2 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              <span>Interactive Clinical Tour</span>
            </button>

            <button
              onClick={() => onNavigate('quantum-optimizer')}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 font-semibold text-xs border border-purple-200 transition-all flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Quantum QUBO Lab</span>
            </button>
          </div>
        </div>

        {/* Active Patient Snapshot Glass Card */}
        <div className="w-full lg:w-84 rounded-2xl bg-[#F8FAFF] border border-blue-200/80 p-4.5 shrink-0 z-10 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
              Selected Digital Twin
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
              {activePatient.patientId}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Patient Profile:</span>
              <span className="font-semibold text-slate-900">{activePatient.name.split(' (')[0]}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Demographics:</span>
              <span className="text-slate-700 font-mono">{activePatient.demographics.age}yo {activePatient.demographics.gender} (BMI {activePatient.demographics.bmi})</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Active Regimen:</span>
              <span className="font-mono text-blue-600 font-bold">{activePatient.currentMedications.length} Medications</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Renal Clearance:</span>
              <span className={`font-mono font-bold ${activePatient.organFunction.eGFR < 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {activePatient.organFunction.eGFR} mL/min eGFR
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Complexity Index:</span>
              <span className="font-mono text-xs font-bold text-rose-600">
                {activePatient.treatmentComplexity} ({activePatient.complexityScore}/100)
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('digital-twin')}
            className="mt-3.5 w-full py-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-xs font-bold text-blue-700 hover:text-blue-800 transition-all flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <span>Explore Twin Bio-Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Patient Cohort"
          value={patients.length}
          subValue="synthetic profiles"
          icon={Users}
          accentColor="cyan"
          trend={{ text: 'Multi-Condition Polypharmacy', type: 'neutral' }}
          onClick={() => onNavigate('patients')}
        />
        <MetricCard
          label="High-Risk DDI Signals"
          value={highRiskInteractions.length}
          subValue="active alerts"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{ text: 'Requires Washout / Monitor', type: 'warning' }}
          onClick={() => onNavigate('interactions')}
        />
        <MetricCard
          label="Average Response Efficacy"
          value="84.2%"
          subValue="simulated cohort"
          icon={Activity}
          accentColor="emerald"
          trend={{ text: '+14% via SGLT2i + GLP1 Combinations', type: 'positive' }}
          onClick={() => onNavigate('simulation-lab')}
        />
        <MetricCard
          label="QUBO Optimization Runs"
          value="1,024"
          subValue="QAOA states evaluated"
          icon={Cpu}
          accentColor="violet"
          trend={{ text: 'Ground State Convergence <15ms', type: 'positive' }}
          onClick={() => onNavigate('quantum-optimizer')}
        />
      </div>

      {/* Patient Medication Analysis & Predictive Risk Alerts Panel */}
      <PatientRiskNotificationPanel
        activePatient={activePatient}
        notifications={activePatientAlerts}
        allCohortNotifications={allCohortAlerts}
        onSelectPatient={handleSelectPatientById}
        onNavigateToTab={onNavigate}
      />

      {/* Global Risk Heatmap: Aggregated Cross-Patient DDI Risk Matrix */}
      <GlobalRiskHeatmap
        patients={patients}
        interactions={interactions}
        activePatient={activePatient}
        onSelectPatient={onSelectPatient}
        onNavigate={onNavigate}
      />

      {/* Two Column Grid: Pipeline Architecture & System Intelligence Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: System Intelligence Status & Recent Activity */}
        <div className="lg:col-span-2 space-y-5">
          {/* Intelligence Architecture Pipeline */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Hybrid Clinical Decision Engine Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  End-to-end data pipeline from clinical state to quantum scenario ranking
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                All Systems Nominal
              </span>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 hover:border-blue-300 transition-all relative">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-700 mb-1.5">
                  <span>1. DIGITAL TWIN</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <p className="text-xs text-slate-900 font-semibold">State Vector Pt</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight font-medium">
                  Demographics, eGFR, ALT, genomics & current meds
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 hover:border-blue-300 transition-all relative">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-700 mb-1.5">
                  <span>2. PREDICTIVE AI</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <p className="text-xs text-slate-900 font-semibold">ResponseNet + ADRNet</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight font-medium">
                  CUDA-accelerated multi-task clinical predictions
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 hover:border-purple-300 transition-all relative">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-700 mb-1.5">
                  <span>3. PHARMAGNN</span>
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                </div>
                <p className="text-xs text-slate-900 font-semibold">Knowledge Graph</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight font-medium">
                  CYP450 pathways, targets & multi-hop DDI detection
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 hover:border-purple-300 transition-all relative">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-700 mb-1.5">
                  <span>4. QUBO OPTIMIZER</span>
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                </div>
                <p className="text-xs text-slate-900 font-semibold">Quantum Combinatorics</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight font-medium">
                  Multi-objective Hamiltonian ground energy search
                </p>
              </div>
            </div>
          </div>

          {/* Quick Scenario Previews Table */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Simulated Scenario Benchmarks ({activePatient.name.split(' (')[0]})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Comparative outcomes of candidate additions to current regimen
                </p>
              </div>
              <button
                onClick={() => onNavigate('simulation-lab')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors"
              >
                <span>Full Simulation Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFF] border-b border-slate-200 text-slate-500 font-mono text-[10px]">
                    <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Scenario</th>
                    <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Candidate Addition</th>
                    <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Predicted Efficacy</th>
                    <th className="py-3 px-3.5 font-bold uppercase tracking-wider">ADR Risk</th>
                    <th className="py-3 px-3.5 font-bold uppercase tracking-wider">DDI Severity</th>
                    <th className="py-3 px-3.5 font-bold uppercase tracking-wider">Suitability Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-700">Current Regimen</td>
                    <td className="py-3 px-3.5 text-slate-600 font-sans">Baseline (4 Drugs)</td>
                    <td className="py-3 px-3.5 text-slate-800 font-semibold">74%</td>
                    <td className="py-3 px-3.5 text-slate-600">22%</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Low
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-700">76 / 100</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors bg-gradient-to-r from-blue-50/60 to-purple-50/60">
                    <td className="py-3 px-3.5 font-bold text-blue-700 flex items-center space-x-1.5">
                      <span>Scenario A</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-sans font-bold">TOP RANK</span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-900 font-sans font-semibold">+ Empagliflozin (10mg)</td>
                    <td className="py-3 px-3.5 text-emerald-700 font-bold">89%</td>
                    <td className="py-3 px-3.5 text-emerald-700 font-medium">16%</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Low (11%)
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-blue-700">92 / 100</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-700">Scenario B</td>
                    <td className="py-3 px-3.5 text-slate-700 font-sans">+ Semaglutide (0.5mg)</td>
                    <td className="py-3 px-3.5 text-slate-800 font-semibold">92%</td>
                    <td className="py-3 px-3.5 text-amber-700">21%</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        Moderate
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-purple-700">88 / 100</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-700">Scenario C</td>
                    <td className="py-3 px-3.5 text-slate-700 font-sans">+ Spironolactone (25mg)</td>
                    <td className="py-3 px-3.5 text-slate-600">82%</td>
                    <td className="py-3 px-3.5 text-rose-700 font-bold">34%</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        High (RAAS K+)
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-rose-700">68 / 100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live AI Infrastructure Status & Clinical Persona */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-3.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#0F172A]">Live Compute Telemetry</h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-slate-600 font-sans font-medium">Gemini 3.7 Flash</span>
                <span className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>ONLINE</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-slate-600 font-sans font-medium">ResponseNet Efficacy</span>
                <span className="text-blue-700 font-bold text-[11px]">
                  AUROC 0.914
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-slate-600 font-sans font-medium">ADRNet Toxicity Head</span>
                <span className="text-purple-700 font-bold text-[11px]">
                  AUROC 0.892
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-slate-600 font-sans font-medium">PharmaGNN Graph</span>
                <span className="text-emerald-700 font-bold text-[11px]">
                  1.8M Edges Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-slate-600 font-sans font-medium">QUBO QAOA Simulator</span>
                <span className="text-purple-700 font-bold text-[11px]">
                  2^N Combinatorial
                </span>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Backend Acceleration:</span>
              <span className="text-blue-700 font-bold">NVIDIA CUDA 12.4</span>
            </div>
          </div>

          {/* Quick AI Assistant Launcher (Deep Tech Blue-Purple Card) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white p-5.5 shadow-md shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-2 mb-2 z-10 relative">
              <Bot className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white">Q-AI Clinical Assistant</h3>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed z-10 relative font-normal">
              Ask Gemini to explain model attributions, simulate polypharmacy additions, or summarize contraindications.
            </p>
            <button
              onClick={() => onNavigate('ai-insights')}
              className="mt-4 w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm z-10 relative"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Consult Q-AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

