import React from 'react';
import {
  GitCompare,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { RadarChart, RadarDataPoint } from '../common/RadarChart';

interface ScenarioComparisonViewProps {
  patient: PatientDigitalTwinState;
  onNavigate: (tab: any) => void;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  patient,
  onNavigate
}) => {
  const scenarios = [
    {
      id: 'base',
      title: 'Current Regimen (Baseline)',
      drugs: patient.currentMedications.map((m) => m.name).join(', '),
      efficacy: 74,
      adrRisk: 22,
      ddiRisk: 'Low',
      renalDelta: 0,
      cardiacDelta: 0,
      metabolicDelta: 0,
      score: 76,
      rank: 4,
      badge: 'Current'
    },
    {
      id: 'scen_a',
      title: 'Scenario A: + Empagliflozin 10mg',
      drugs: `${patient.currentMedications.map((m) => m.name).join(', ')} + Empagliflozin`,
      efficacy: 89,
      adrRisk: 16,
      ddiRisk: 'Low (11%)',
      renalDelta: +4.2,
      cardiacDelta: +8.5,
      metabolicDelta: +14.2,
      score: 92,
      rank: 1,
      badge: 'TOP RANKED'
    },
    {
      id: 'scen_b',
      title: 'Scenario B: + Semaglutide 0.5mg',
      drugs: `${patient.currentMedications.map((m) => m.name).join(', ')} + Semaglutide`,
      efficacy: 92,
      adrRisk: 21,
      ddiRisk: 'Moderate (19%)',
      renalDelta: +2.1,
      cardiacDelta: +9.8,
      metabolicDelta: +18.4,
      score: 88,
      rank: 2,
      badge: 'Strong Alternative'
    },
    {
      id: 'scen_c',
      title: 'Scenario C: + Spironolactone 25mg',
      drugs: `${patient.currentMedications.map((m) => m.name).join(', ')} + Spironolactone`,
      efficacy: 82,
      adrRisk: 34,
      ddiRisk: 'High (Dual RAAS)',
      renalDelta: -1.8,
      cardiacDelta: +7.2,
      metabolicDelta: +1.0,
      score: 68,
      rank: 3,
      badge: 'Caution: K+ Monitor'
    }
  ];

  const radarData: RadarDataPoint[] = [
    { axis: 'Efficacy', value: 89, secondaryValue: 74 },
    { axis: 'ADR Safety', value: 84, secondaryValue: 78 },
    { axis: 'DDI Margin', value: 89, secondaryValue: 80 },
    { axis: 'Renal Gain', value: 82, secondaryValue: 58 },
    { axis: 'Metabolic Control', value: 86, secondaryValue: 68 }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200 flex items-center space-x-1">
              <GitCompare className="w-3.5 h-3.5" />
              <span>MULTI-SCENARIO DECISION MATRIX</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Comparative Treatment Outcomes for <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">{patient.name.split(' (')[0]}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Side-by-side trade-off analysis across efficacy, adverse risk, DDI burden, and organ trajectory
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.01] flex items-center space-x-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Clinical Dossier</span>
          </button>
        </div>
      </div>

      {/* Comparison Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((scen) => {
          const isTop = scen.rank === 1;
          return (
            <div
              key={scen.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all shadow-xs ${
                isTop
                  ? 'bg-gradient-to-b from-blue-50/50 via-white to-purple-50/30 border-blue-400 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      isTop
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {scen.badge}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-blue-700">
                    Rank #{scen.rank}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#0F172A]">{scen.title}</h3>
                <p className="text-[11px] text-slate-600 font-mono mt-1 line-clamp-2">
                  {scen.drugs}
                </p>

                {/* Metrics */}
                <div className="mt-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                    <span className="text-slate-600">Predicted Efficacy:</span>
                    <span className="text-emerald-700 font-bold">{scen.efficacy}%</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                    <span className="text-slate-600">ADR Risk:</span>
                    <span className={`font-bold ${scen.adrRisk > 25 ? 'text-rose-700' : 'text-slate-800'}`}>
                      {scen.adrRisk}%
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                    <span className="text-slate-600">DDI Burden:</span>
                    <span className="text-blue-700 font-semibold">{scen.ddiRisk}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                    <span className="text-slate-600">Renal eGFR Delta:</span>
                    <span className={`font-bold ${scen.renalDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {scen.renalDelta >= 0 ? '+' : ''}{scen.renalDelta} mL/min
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Composite Score</span>
                <span className="text-xl font-extrabold font-mono text-blue-700">
                  {scen.score}/100
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar Overlay Comparison */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Multi-Objective Trade-Off Overlay (Top Rank vs Baseline)
          </h3>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
            5-Axis Performance Profile
          </span>
        </div>

        <div className="flex justify-center">
          <RadarChart
            data={radarData}
            size={280}
            primaryLabel="Scenario A: + Empagliflozin"
            secondaryLabel="Baseline Regimen"
            primaryColor="#2563EB"
            secondaryColor="#7C3AED"
          />
        </div>
      </div>
    </div>
  );
};

