import React from 'react';
import {
  BarChart3,
  Cpu,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Server,
  ShieldCheck
} from 'lucide-react';
import { AI_MODELS_METRICS } from '../../data/mockDatabase';
import { MetricCard } from '../common/MetricCard';

export const ModelPerformanceView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>NVIDIA ACCELERATED AI & QUANTUM ENGINE REGISTRY</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Machine Learning Validation & <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Hardware Telemetry</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Empirical benchmark metrics, cross-validation AUROC curves, and tensor acceleration performance
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
          <span className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center space-x-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>NVIDIA TensorRT 10.2 ONLINE</span>
          </span>
        </div>
      </div>

      {/* Top 4 Hardware & Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Inference Mean Latency"
          value="11.4 ms"
          subValue="end-to-end"
          icon={Cpu}
          accentColor="blue"
          trend={{ text: '14.2x Faster via TensorRT FP16', type: 'positive' }}
        />
        <MetricCard
          label="Multi-Task AUROC"
          value="0.914"
          subValue="ResponseNet"
          icon={Activity}
          accentColor="purple"
          trend={{ text: 'Validated on 142.5k EHR Cohort', type: 'positive' }}
        />
        <MetricCard
          label="PharmaGNN Link AUC"
          value="0.938"
          subValue="DDI Graph Engine"
          icon={Layers}
          accentColor="purple"
          trend={{ text: '1.8M Biomedical Triples', type: 'positive' }}
        />
        <MetricCard
          label="GPU Memory Footprint"
          value="6.4 GB"
          subValue="/ 24.0 GB VRAM"
          icon={Server}
          accentColor="blue"
          trend={{ text: 'Tensor Core Load 42%', type: 'neutral' }}
        />
      </div>

      {/* Model Registry Performance Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>AI Model Architecture & Validation Benchmark Registry</span>
          </h3>
          <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
            {AI_MODELS_METRICS.length} Registered Production Heads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-semibold">Model Name & Head</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">AUROC</th>
                <th className="pb-3 font-semibold">F1 Score</th>
                <th className="pb-3 font-semibold">Latency</th>
                <th className="pb-3 font-semibold">Training Corpus</th>
                <th className="pb-3 font-semibold">Backend Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {AI_MODELS_METRICS.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-[#0F172A] font-sans">
                    <div>{mod.name}</div>
                    <span className="text-[10px] text-blue-700 font-mono">{mod.purpose}</span>
                  </td>
                  <td className="py-3.5 text-slate-700 font-sans">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px]">
                      {mod.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-emerald-700 font-bold">
                    {mod.auroc ? mod.auroc.toFixed(3) : 'N/A'}
                  </td>
                  <td className="py-3.5 text-blue-700 font-bold">
                    {mod.f1Score ? mod.f1Score.toFixed(3) : 'N/A'}
                  </td>
                  <td className="py-3.5 text-slate-700">
                    {mod.inferenceLatencyMs} ms
                  </td>
                  <td className="py-3.5 text-slate-600 font-sans max-w-[180px] truncate">
                    {mod.trainingSamples}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFF] border border-slate-200 text-slate-700 text-[10px]">
                      {mod.backend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

