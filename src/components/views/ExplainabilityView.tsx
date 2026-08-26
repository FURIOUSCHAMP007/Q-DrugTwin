import React, { useState } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  BarChart2,
  CheckCircle2,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { ConfidenceScoreIndicator } from '../common/ConfidenceScoreIndicator';

interface ExplainabilityViewProps {
  patient: PatientDigitalTwinState;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ patient }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('eGFR');

  // Synthetic SHAP feature attributions for patient's drug response prediction
  const shapFeatures = [
    { name: `Baseline eGFR (${patient.organFunction.eGFR} mL/min)`, value: '+0.28', impact: 'positive', description: 'Supports SGLT2i renoprotective efficacy signal' },
    { name: `Elevated HbA1c (${patient.organFunction.hba1c}%)`, value: '+0.24', impact: 'positive', description: 'Large potential therapeutic window for glycemic drop' },
    { name: 'CYP2C19 *2/*2 (Poor Metabolizer)', value: '-0.19', impact: 'negative', description: 'Impaired prodrug bioactivation for Clopidogrel' },
    { name: 'Concurrent ACEi (Lisinopril)', value: '-0.14', impact: 'negative', description: 'Increases hyperkalemia risk when adding MRA' },
    { name: `Age ${patient.demographics.age} & Multimorbidity`, value: '+0.09', impact: 'positive', description: 'Cardiometabolic benefit profile matches landmark GLP1/SGLT2 trials' },
    { name: 'Preserved Organ Stability', value: '+0.06', impact: 'positive', description: 'Stable myocardium with favorable hemodynamic reserve' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200 flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>EXPLAINABLE AI (XAI) & SHAP ATTRIBUTION STUDIO</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Biomarker Importance & <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Model Interpretability</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Transparent Shapley additive explanations (SHAP), uncertainty quantification, and counterfactual sensitivity for {patient.name.split(' (')[0]}
          </p>
        </div>
      </div>

      {/* Main Grid: SHAP Waterfall (Left 7) & Counterfactual What-If (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: SHAP Feature Attribution Waterfall */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Local SHAP Value Attribution (Efficacy Head)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Base Model Value: E[f(x)] = 0.54 → Final Model Output: f(x) = 0.89
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
              TreeSHAP / KernelSHAP
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {shapFeatures.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200 hover:border-blue-300 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0F172A]">{f.name}</span>
                  <span
                    className={`font-extrabold text-xs ${
                      f.impact === 'positive' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    SHAP: {f.value}
                  </span>
                </div>

                {/* Visual Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex my-2">
                  {f.impact === 'positive' ? (
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full"
                      style={{ width: `${parseFloat(f.value) * 200}%` }}
                    />
                  ) : (
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                      style={{ width: `${Math.abs(parseFloat(f.value)) * 200}%` }}
                    />
                  )}
                </div>

                <p className="text-[11px] text-slate-600 font-sans">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Counterfactual Sensitivity & Confidence Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Calibrated Confidence Score Indicator Card */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Model Prediction Confidence Calibration</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates model epistemic and aleatoric certainty against patient's digital twin parameters:
            </p>
            <ConfidenceScoreIndicator
              confidence={{
                overallScore: 93,
                tier: 'High Certainty',
                uncertaintyMargin: 2.5,
                clinicalRecommendationStrength: 'Strong (Grade A)',
                dimensions: [
                  {
                    name: 'SHAP Feature Convergence',
                    score: 95,
                    weight: 35,
                    description: 'Consistent top feature directions across tree and kernel estimators',
                    evidenceSource: 'KernelSHAP Engine'
                  },
                  {
                    name: 'Empirical Coverage (Conformal)',
                    score: 94,
                    weight: 30,
                    description: '95% empirical prediction interval coverage on multicenter test split',
                    evidenceSource: 'Conformal Prediction'
                  },
                  {
                    name: 'Pharmacological Plausibility',
                    score: 91,
                    weight: 20,
                    description: 'Biological concordance with known kidney/heart receptors',
                    evidenceSource: 'Biomedical Graph'
                  },
                  {
                    name: 'Sample Neighborhood Density',
                    score: 92,
                    weight: 15,
                    description: 'High local patient density in latent embedding manifold',
                    evidenceSource: 't-SNE Latent Space'
                  }
                ],
                modelCalibrationNotice: 'Calibrated with Brier score 0.084 on multicenter CKD & T2D cohorts.',
                sampleSizeGrounding: 'Validated on 12,400+ clinical patient trajectories.'
              }}
              size="lg"
              showBreakdown={true}
            />
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Counterfactual Sensitivity Engine</span>
            </h3>
            <p className="text-xs text-slate-600">
              Simulate hypothetical physiological shifts to observe model decision boundary transitions:
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-blue-700 font-bold block mb-1">
                  What if eGFR deteriorated from {patient.organFunction.eGFR} to 35 mL/min?
                </span>
                <p className="text-slate-700 font-sans text-xs leading-relaxed">
                  Model shifts Empagliflozin suitability from <strong className="text-slate-900">92/100</strong> down to <strong className="text-slate-900">74/100</strong> due to reduced glycemic excretion, while retaining cardiorenal protection signal. Metformin receives a mandatory dose reduction warning.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-purple-700 font-bold block mb-1">
                  What if CYP2C19 was switched to *1/*1 (Normal)?
                </span>
                <p className="text-slate-700 font-sans text-xs leading-relaxed">
                  Clopidogrel efficacy jumps by <strong className="text-slate-900">+38%</strong>, reducing stent thrombosis risk without requiring Ticagrelor switch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
