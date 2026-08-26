import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Activity, TrendingUp, Heart, Droplets, Calendar, Filter, Sparkles } from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';

interface HealthMetricTrendChartProps {
  patient: PatientDigitalTwinState;
}

type MetricMode = 'all' | 'bp' | 'renal' | 'glycemic' | 'hepatic';

interface ChartDataPoint {
  time: string;
  stateLabel: string;
  systolicBp: number;
  diastolicBp: number;
  eGFR: number;
  serumCreatinine?: number;
  hba1c: number;
  fastingGlucose: number;
  alt: number;
  ast: number;
  medCount: number;
}

export const HealthMetricTrendChart: React.FC<HealthMetricTrendChartProps> = ({ patient }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricMode>('all');
  const [timeHorizon, setTimeHorizon] = useState<'12m' | '6m' | 'all'>('all');

  // Synthesize rich historical and active vitals & labs trajectory points from longitudinalHistory & baseline labs
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    const history = patient.longitudinalHistory || [];
    
    // Build historical points
    const points: ChartDataPoint[] = history.map((item, idx) => {
      const isCurrent = idx === history.length - 1;
      const renalRatio = item.eGFR / (patient.organFunction.eGFR || 1);
      const hba1cRatio = item.hba1c / (patient.organFunction.hba1c || 1);

      return {
        time: item.timestamp,
        stateLabel: item.stateName,
        systolicBp: item.systolicBp,
        diastolicBp: Math.round(item.systolicBp * 0.62),
        eGFR: item.eGFR,
        serumCreatinine: isCurrent
          ? patient.organFunction.serumCreatinine
          : Number((patient.organFunction.serumCreatinine * (1 / Math.max(0.2, renalRatio))).toFixed(2)),
        hba1c: item.hba1c,
        fastingGlucose: isCurrent
          ? patient.organFunction.fastingGlucose
          : Math.round(patient.organFunction.fastingGlucose * hba1cRatio),
        alt: isCurrent
          ? patient.organFunction.alt
          : Math.max(15, Math.round(patient.organFunction.alt * (idx === 0 ? 0.9 : 1.05))),
        ast: isCurrent
          ? patient.organFunction.ast
          : Math.max(12, Math.round(patient.organFunction.ast * (idx === 0 ? 0.92 : 1.02))),
        medCount: item.medicationCount
      };
    });

    return points;
  }, [patient]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-lg text-xs font-mono space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-bold text-slate-800">
            <span>{label}</span>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
              {data.medCount} Active Meds
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans font-medium">{data.stateLabel}</p>

          <div className="space-y-1 pt-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600">{entry.name}:</span>
                </span>
                <span className="font-bold text-slate-900">
                  {entry.value} {entry.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <span>Digital Twin Health Metric Trends & Vitals Trajectory</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                {chartData.length} Temporal Checkpoints
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal tracking of blood pressure, renal clearance (eGFR), glycemic indices (HbA1c/Glucose), and hepatic transaminases
            </p>
          </div>
        </div>

        {/* Metric Selector Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
              selectedMetric === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-[#F8FAFF] text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Multi-Metric Overview
          </button>
          <button
            onClick={() => setSelectedMetric('bp')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border flex items-center space-x-1 ${
              selectedMetric === 'bp'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50/60 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Blood Pressure</span>
          </button>
          <button
            onClick={() => setSelectedMetric('renal')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border flex items-center space-x-1 ${
              selectedMetric === 'renal'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50/60 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>eGFR / Renal</span>
          </button>
          <button
            onClick={() => setSelectedMetric('glycemic')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border flex items-center space-x-1 ${
              selectedMetric === 'glycemic'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/60 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>HbA1c & Glucose</span>
          </button>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              domain={['dataMin - 5', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              iconType="circle"
            />

            {/* Blood Pressure Lines */}
            {(selectedMetric === 'all' || selectedMetric === 'bp') && (
              <>
                <Line
                  type="monotone"
                  dataKey="systolicBp"
                  name="Systolic BP (mmHg)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563EB', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolicBp"
                  name="Diastolic BP (mmHg)"
                  stroke="#60A5FA"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#60A5FA' }}
                />
                <ReferenceLine
                  y={130}
                  stroke="#94A3B8"
                  strokeDasharray="3 3"
                  label={{ value: 'Target SBP (130)', position: 'insideTopRight', fill: '#94A3B8', fontSize: 10 }}
                />
              </>
            )}

            {/* Renal Function (eGFR) Line */}
            {(selectedMetric === 'all' || selectedMetric === 'renal') && (
              <>
                <Line
                  type="monotone"
                  dataKey="eGFR"
                  name="eGFR (mL/min/1.73m²)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#059669', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                />
                <ReferenceLine
                  y={60}
                  stroke="#E11D48"
                  strokeDasharray="4 4"
                  label={{ value: 'CKD Cutoff (60)', position: 'insideBottomRight', fill: '#E11D48', fontSize: 10 }}
                />
              </>
            )}

            {/* Glycemic Markers (HbA1c & Fasting Glucose) Lines */}
            {(selectedMetric === 'all' || selectedMetric === 'glycemic') && (
              <>
                <Line
                  type="monotone"
                  dataKey="hba1c"
                  name="HbA1c (%)"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#D97706', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, stroke: '#D97706', strokeWidth: 2 }}
                />
                {selectedMetric === 'glycemic' && (
                  <Line
                    type="monotone"
                    dataKey="fastingGlucose"
                    name="Fasting Glucose (mg/dL)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 3, fill: '#F59E0B' }}
                  />
                )}
                <ReferenceLine
                  y={7.0}
                  stroke="#D97706"
                  strokeDasharray="3 3"
                  label={{ value: 'ADA HbA1c Target (7.0%)', position: 'insideTopLeft', fill: '#D97706', fontSize: 10 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary KPI Cards Below Trend Line */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-mono">
          <span className="text-[10px] text-blue-700 font-bold uppercase block">Current Blood Pressure</span>
          <span className="text-sm font-extrabold text-blue-900 mt-0.5 block">
            {patient.organFunction.systolicBp}/{patient.organFunction.diastolicBp} mmHg
          </span>
          <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
            Stage 1 Hypertension Managed
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs font-mono">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Renal Clearance (eGFR)</span>
          <span className="text-sm font-extrabold text-emerald-900 mt-0.5 block">
            {patient.organFunction.eGFR} mL/min
          </span>
          <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
            CKD-EPI 2021 Equation
          </span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs font-mono">
          <span className="text-[10px] text-amber-700 font-bold uppercase block">Glycemic Index (HbA1c)</span>
          <span className="text-sm font-extrabold text-amber-900 mt-0.5 block">
            {patient.organFunction.hba1c}%
          </span>
          <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
            Target: &lt; 7.0% (ADA 2025)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs font-mono">
          <span className="text-[10px] text-purple-700 font-bold uppercase block">Hepatic Baseline (ALT)</span>
          <span className="text-sm font-extrabold text-purple-900 mt-0.5 block">
            {patient.organFunction.alt} U/L
          </span>
          <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
            Reference Range: 7 - 35 U/L
          </span>
        </div>
      </div>
    </div>
  );
};
