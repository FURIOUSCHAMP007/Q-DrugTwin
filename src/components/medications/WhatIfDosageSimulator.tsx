import React, { useState, useMemo } from 'react';
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FlaskConical,
  Scale
} from 'lucide-react';
import { PatientDigitalTwinState, Medication, DosageToleranceThreshold } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';

export interface SimulatedDosageState {
  medicationId: string;
  name: string;
  brandName?: string;
  category: string;
  baseDoseMg: number;
  currentDoseMg: number;
  minDoseMg: number;
  maxDoseMg: number;
  stepMg: number;
  unit: string;
  frequency: string;
  isCandidate?: boolean;
  activeToleranceLimit?: DosageToleranceThreshold;
  metabolismPathway: string[];
  primaryTargets: string[];
}

export interface DynamicDdiWarning {
  id: string;
  drugA: string;
  doseA: number;
  drugB: string;
  doseB: number;
  severity: 'safe' | 'low' | 'moderate' | 'high' | 'contraindicated';
  title: string;
  mechanism: string;
  clinicalImpact: string;
  doseDependentThresholdNote: string;
  recommendation: string;
}

interface WhatIfDosageSimulatorProps {
  patient: PatientDigitalTwinState;
  onNavigateToSimulation?: (candidateMed?: Medication) => void;
}

// Parse standard dosage string into numeric mg
export function parseDoseMg(dosageStr: string): { doseMg: number; unit: string; min: number; max: number; step: number } {
  if (!dosageStr) return { doseMg: 10, unit: 'mg', min: 0, max: 80, step: 5 };
  
  const clean = dosageStr.toLowerCase().trim();
  const match = clean.match(/([\d.]+)\s*(mg|mcg|g|u|units)?/);
  
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2] || 'mg';
    
    // Auto-configure appropriate min/max/step based on standard clinical dose brackets
    if (val <= 5) {
      return { doseMg: val, unit, min: 0, max: Math.max(20, val * 4), step: val <= 2 ? 0.5 : 1 };
    } else if (val <= 25) {
      return { doseMg: val, unit, min: 0, max: Math.max(100, val * 4), step: val <= 10 ? 2.5 : 5 };
    } else if (val <= 100) {
      return { doseMg: val, unit, min: 0, max: Math.max(300, val * 3), step: 10 };
    } else {
      return { doseMg: val, unit, min: 0, max: Math.max(2550, val * 2.5), step: 250 };
    }
  }
  
  return { doseMg: 20, unit: 'mg', min: 0, max: 100, step: 5 };
}

export const WhatIfDosageSimulator: React.FC<WhatIfDosageSimulatorProps> = ({
  patient,
  onNavigateToSimulation
}) => {
  // Initialize simulated dosages from patient active medications
  const initialSimulatedDoses = useMemo<SimulatedDosageState[]>(() => {
    return patient.currentMedications.map((med) => {
      const parsed = parseDoseMg(med.dosage);
      const tolerance = patient.dosageToleranceThresholds?.find(
        (t) => t.medicationName.toLowerCase() === med.name.toLowerCase() ||
               med.name.toLowerCase().includes(t.medicationName.toLowerCase())
      );
      
      return {
        medicationId: med.id,
        name: med.name,
        brandName: med.brandName,
        category: med.category,
        baseDoseMg: parsed.doseMg,
        currentDoseMg: parsed.doseMg,
        minDoseMg: 0,
        maxDoseMg: Math.max(parsed.max, tolerance?.maxDailyDoseMg ? tolerance.maxDailyDoseMg * 1.5 : 0),
        stepMg: parsed.step,
        unit: parsed.unit,
        frequency: med.frequency,
        isCandidate: false,
        activeToleranceLimit: tolerance,
        metabolismPathway: med.metabolismPathway,
        primaryTargets: med.primaryTargets
      };
    });
  }, [patient]);

  const [simulatedDoses, setSimulatedDoses] = useState<SimulatedDosageState[]>(initialSimulatedDoses);
  const [selectedCandidateToAdd, setSelectedCandidateToAdd] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'changed' | 'high_risk'>('all');

  // Reset when patient changes
  React.useEffect(() => {
    setSimulatedDoses(initialSimulatedDoses);
  }, [initialSimulatedDoses]);

  // Handle individual dosage change
  const handleDoseChange = (medicationId: string, newDose: number) => {
    setSimulatedDoses((prev) =>
      prev.map((item) => (item.medicationId === medicationId ? { ...item, currentDoseMg: newDose } : item))
    );
  };

  // Add candidate drug to what-if simulation
  const handleAddCandidate = () => {
    if (!selectedCandidateToAdd) return;
    const cand = CANDIDATE_MEDICATIONS.find((c) => c.id === selectedCandidateToAdd);
    if (!cand) return;

    if (simulatedDoses.some((d) => d.medicationId === cand.id)) {
      return; // already added
    }

    const parsed = parseDoseMg(cand.dosage);
    const tolerance = patient.dosageToleranceThresholds?.find(
      (t) => t.medicationName.toLowerCase() === cand.name.toLowerCase() ||
             cand.name.toLowerCase().includes(t.medicationName.toLowerCase())
    );

    const newSimMed: SimulatedDosageState = {
      medicationId: cand.id,
      name: cand.name,
      brandName: cand.brandName,
      category: cand.category,
      baseDoseMg: 0, // initially 0 or default
      currentDoseMg: parsed.doseMg,
      minDoseMg: 0,
      maxDoseMg: parsed.max,
      stepMg: parsed.step,
      unit: parsed.unit,
      frequency: cand.frequency,
      isCandidate: true,
      activeToleranceLimit: tolerance,
      metabolismPathway: cand.metabolismPathway,
      primaryTargets: cand.primaryTargets
    };

    setSimulatedDoses((prev) => [...prev, newSimMed]);
    setSelectedCandidateToAdd('');
  };

  // Remove added candidate drug
  const handleRemoveCandidate = (medicationId: string) => {
    setSimulatedDoses((prev) => prev.filter((item) => item.medicationId !== medicationId));
  };

  // Reset all to baseline
  const handleResetToBaseline = () => {
    setSimulatedDoses(initialSimulatedDoses);
  };

  // Preset Scenario: Renal-Adjusted Reduction (-50% on renally cleared agents)
  const handleApplyRenalAdjustPreset = () => {
    setSimulatedDoses((prev) =>
      prev.map((item) => {
        const isRenal = item.metabolismPathway.some((p) => p.toLowerCase().includes('renal')) ||
                        item.name.toLowerCase().includes('metformin') ||
                        item.name.toLowerCase().includes('lisinopril') ||
                        item.name.toLowerCase().includes('empagliflozin');
        if (isRenal) {
          const reduced = Math.max(item.minDoseMg, Math.round((item.baseDoseMg * 0.5) / item.stepMg) * item.stepMg);
          return { ...item, currentDoseMg: reduced };
        }
        return item;
      })
    );
  };

  // Preset Scenario: Guideline Maximum GDMT Titration
  const handleApplyMaxGdmtPreset = () => {
    setSimulatedDoses((prev) =>
      prev.map((item) => {
        const targetMax = item.activeToleranceLimit
          ? item.activeToleranceLimit.maxDailyDoseMg
          : item.baseDoseMg * 1.5;
        const bounded = Math.min(item.maxDoseMg, Math.round(targetMax / item.stepMg) * item.stepMg);
        return { ...item, currentDoseMg: bounded };
      })
    );
  };

  // Preset Scenario: Deprescribe / Hold High Risk Agents
  const handleApplyDeprescribePreset = () => {
    setSimulatedDoses((prev) =>
      prev.map((item) => {
        if (item.activeToleranceLimit && item.currentDoseMg > item.activeToleranceLimit.maxDailyDoseMg) {
          return { ...item, currentDoseMg: item.activeToleranceLimit.maxDailyDoseMg };
        }
        return item;
      })
    );
  };

  // Real-Time Dose-Dependent DDI Analysis Engine
  const analysisResult = useMemo(() => {
    const warnings: DynamicDdiWarning[] = [];
    const activeMeds = simulatedDoses.filter((d) => d.currentDoseMg > 0);

    // Helpers to find active dose
    const getDose = (nameSubstr: string) => {
      const found = activeMeds.find((m) => m.name.toLowerCase().includes(nameSubstr.toLowerCase()));
      return found ? found.currentDoseMg : 0;
    };

    const lisinoprilDose = getDose('lisinopril');
    const spironolactoneDose = getDose('spironolactone');
    const atorvastatinDose = getDose('atorvastatin');
    const amlodipineDose = getDose('amlodipine');
    const metforminDose = getDose('metformin');
    const empagliflozinDose = getDose('empagliflozin') || getDose('dapagliflozin');
    const furosemideDose = getDose('furosemide');
    const glipizideDose = getDose('glipizide');
    const carvedilolDose = getDose('carvedilol');
    const diltiazemDose = getDose('diltiazem');
    const clopidogrelDose = getDose('clopidogrel');
    const omeprazoleDose = getDose('omeprazole');

    // 1. Lisinopril + Spironolactone (Dual RAAS Hyperkalemia)
    if (lisinoprilDose > 0 && spironolactoneDose > 0) {
      const combinedBurden = (lisinoprilDose / 20) * 1.2 + (spironolactoneDose / 25) * 1.5;
      let severity: DynamicDdiWarning['severity'] = 'low';
      let note = 'Low dose combination; serum K+ monitoring recommended.';

      if (combinedBurden >= 3.0 || spironolactoneDose >= 50 || (lisinoprilDose >= 40 && spironolactoneDose >= 25)) {
        severity = 'contraindicated';
        note = `CRITICAL SPIKE: High combined exposure (Lisinopril ${lisinoprilDose}mg + Spironolactone ${spironolactoneDose}mg). Severe hyperkalemia (K+ > 5.8 mEq/L) hazard.`;
      } else if (combinedBurden >= 2.0 || spironolactoneDose >= 25 || lisinoprilDose >= 20) {
        severity = 'high';
        note = `HIGH WARNING: Lisinopril ${lisinoprilDose}mg with Spironolactone ${spironolactoneDose}mg exceeds safe concurrent baseline in CKD.`;
      } else {
        severity = 'moderate';
        note = `MODERATE: Low-dose titration (${lisinoprilDose}mg + ${spironolactoneDose}mg) acceptable with bi-weekly renal panel.`;
      }

      warnings.push({
        id: 'ddi-raas-hyperk',
        drugA: 'Lisinopril',
        doseA: lisinoprilDose,
        drugB: 'Spironolactone',
        doseB: spironolactoneDose,
        severity,
        title: 'Dual RAAS / Aldosterone Blockade Hyperkalemia Spike',
        mechanism: 'Additive distal tubular potassium retention via dual ACE inhibition and mineralocorticoid receptor blockade.',
        clinicalImpact: severity === 'contraindicated' || severity === 'high'
          ? 'High probability of life-threatening ventricular arrhythmia and sudden cardiac arrest.'
          : 'Elevated risk of asymptomatic hyperkalemia (K+ 5.2 - 5.5 mEq/L).',
        doseDependentThresholdNote: note,
        recommendation: severity === 'contraindicated'
          ? 'Reduce Spironolactone to ≤12.5mg daily or replace with non-steroidal MRA (Finerenone).'
          : 'Maintain 4-hour administration spacing and mandate weekly potassium monitoring.'
      });
    }

    // 2. Atorvastatin + Amlodipine (CYP3A4 / SLCO1B1 Clearance Competition)
    if (atorvastatinDose > 0 && amlodipineDose > 0) {
      const pgxVariant = patient.genomics.some((g) => g.gene === 'SLCO1B1' && g.phenotype.toLowerCase().includes('decreased'));
      let severity: DynamicDdiWarning['severity'] = 'low';
      let note = `Atorvastatin ${atorvastatinDose}mg + Amlodipine ${amlodipineDose}mg.`;

      if (atorvastatinDose >= 40 || (atorvastatinDose >= 20 && amlodipineDose >= 10 && pgxVariant)) {
        severity = 'high';
        note = `HIGH EXPOSURE: Atorvastatin ${atorvastatinDose}mg + Amlodipine ${amlodipineDose}mg + SLCO1B1 variant amplifies statin AUC by 2.4-fold.`;
      } else if (atorvastatinDose >= 20 || amlodipineDose >= 10) {
        severity = 'moderate';
        note = `MODERATE RISK: Moderate statin AUC elevation (~1.6x). Myalgia surveillance required.`;
      } else {
        severity = 'low';
        note = `LOW RISK: Low-dose combination (${atorvastatinDose}mg + ${amlodipineDose}mg) remains within safe hepatic clearance threshold.`;
      }

      warnings.push({
        id: 'ddi-statin-cyp3a4',
        drugA: 'Atorvastatin',
        doseA: atorvastatinDose,
        drugB: 'Amlodipine',
        doseB: amlodipineDose,
        severity,
        title: 'CYP3A4 / SLCO1B1 Statin Exposure & Myopathy Risk',
        mechanism: 'Amlodipine weakly inhibits CYP3A4-mediated oxidation of Atorvastatin, elevating circulating active acid metabolites.',
        clinicalImpact: severity === 'high'
          ? 'Severe bilateral proximal myalgia, CK elevation > 5x ULN, and rhabdomyolysis hazard.'
          : 'Mild transient muscle fatigue or cramping.',
        doseDependentThresholdNote: note,
        recommendation: severity === 'high'
          ? 'Cap Atorvastatin at ≤20mg daily or switch to Rosuvastatin (CYP2C9/non-CYP3A4 pathway).'
          : 'Administer Amlodipine in morning and Atorvastatin at bedtime.'
      });
    }

    // 3. Metformin Renal Overload (eGFR-Dependent)
    if (metforminDose > 0) {
      const egfr = patient.organFunction.eGFR;
      let severity: DynamicDdiWarning['severity'] = 'safe';
      let note = `Metformin ${metforminDose}mg at eGFR ${egfr} mL/min.`;

      if (egfr < 30 && metforminDose > 0) {
        severity = 'contraindicated';
        note = `CONTRAINDICATED: Metformin strictly prohibited at eGFR < 30 mL/min (Fatal Lactic Acidosis risk).`;
      } else if (egfr < 45 && metforminDose > 500) {
        severity = 'high';
        note = `HIGH RISK: Metformin ${metforminDose}mg exceeds KDIGO maximum of 500mg daily for eGFR ${egfr} mL/min.`;
      } else if (egfr < 60 && metforminDose > 1000) {
        severity = 'moderate';
        note = `MODERATE RISK: Metformin ${metforminDose}mg exceeds recommended 1000mg ceiling for CKD Stage 3a.`;
      } else {
        severity = 'safe';
        note = `WITHIN GUIDELINE: Metformin ${metforminDose}mg is concordant with renal filtration parameters.`;
      }

      if (severity !== 'safe') {
        warnings.push({
          id: 'ddi-metformin-renal',
          drugA: 'Metformin',
          doseA: metforminDose,
          drugB: 'Renal Clearance Matrix',
          doseB: egfr,
          severity,
          title: 'Renal Clearance Exceedance (Metformin Lactic Acidosis Hazard)',
          mechanism: 'Diminished glomerular filtration impairs unchanged metformin tubular excretion, triggering mitochondrial pyruvate-lactate shift.',
          clinicalImpact: severity === 'high' || severity === 'contraindicated'
            ? 'Metformin-Associated Lactic Acidosis (MALA) with arterial pH < 7.25 and shock.'
            : 'Subacute nausea, malaise, and mild hyperlactatemia.',
          doseDependentThresholdNote: note,
          recommendation: egfr < 45 ? 'Reduce to 500mg daily or discontinue in favor of SGLT2i/GLP-1 RA.' : 'Limit total daily dosage to ≤1000mg.'
        });
      }
    }

    // 4. Empagliflozin / SGLT2i + Furosemide (Synergistic Volume Depletion)
    if (empagliflozinDose > 0 && furosemideDose > 0) {
      let severity: DynamicDdiWarning['severity'] = 'low';
      let note = `Empagliflozin ${empagliflozinDose}mg + Furosemide ${furosemideDose}mg.`;

      if (empagliflozinDose >= 25 && furosemideDose >= 40) {
        severity = 'high';
        note = `HIGH WARNING: Aggressive dual diuresis (${empagliflozinDose}mg + ${furosemideDose}mg) creates acute intravascular depletion.`;
      } else if (empagliflozinDose >= 10 && furosemideDose >= 20) {
        severity = 'moderate';
        note = `MODERATE WARNING: Synergistic natriuresis and osmotic glucosuria. Orthostatic hypotension risk.`;
      }

      warnings.push({
        id: 'ddi-sglt2-loop',
        drugA: 'SGLT2 Inhibitor',
        doseA: empagliflozinDose,
        drugB: 'Furosemide',
        doseB: furosemideDose,
        severity,
        title: 'Synergistic Osmotic Diuresis & Prerenal Dehydration',
        mechanism: 'Concurrent proximal tubule glucose-sodium blockage and loop of Henle Na-K-2Cl symporter inhibition.',
        clinicalImpact: 'Prerenal eGFR drop >20%, symptomatic orthostasis, syncope, and hemoconcentration.',
        doseDependentThresholdNote: note,
        recommendation: 'Reduce Furosemide dose by 25-50% when initiating or titrating SGLT2 inhibitor.'
      });
    }

    // 5. Glipizide Overdose / CYP2C9 Accumulation
    if (glipizideDose > 0) {
      const isCyp2c9Variant = patient.genomics.some((g) => g.gene === 'CYP2C9' && !g.phenotype.toLowerCase().includes('normal'));
      let severity: DynamicDdiWarning['severity'] = 'low';
      let note = `Glipizide ${glipizideDose}mg.`;

      if (glipizideDose >= 10 && isCyp2c9Variant) {
        severity = 'high';
        note = `HIGH HAZARD: Glipizide ${glipizideDose}mg in CYP2C9 Intermediate/Poor Metabolizer. Severe prolonged hypoglycemia hazard.`;
      } else if (glipizideDose > 5 && isCyp2c9Variant) {
        severity = 'moderate';
        note = `MODERATE: Exceeds CPIC 5mg safe threshold for impaired CYP2C9 clearance.`;
      }

      if (severity !== 'low') {
        warnings.push({
          id: 'ddi-glipizide-pgx',
          drugA: 'Glipizide',
          doseA: glipizideDose,
          drugB: 'CYP2C9 Genetic Clearance',
          doseB: glipizideDose,
          severity,
          title: 'CYP2C9 Variant Impaired Clearance & Prolonged Hypoglycemia',
          mechanism: 'Reduced CYP2C9 hydroxylase activity prolongs sulfonylurea terminal half-life by 300%.',
          clinicalImpact: 'Refractory nocturnal hypoglycemia (glucose < 50 mg/dL), neuroglycopenia, and fall risk.',
          doseDependentThresholdNote: note,
          recommendation: 'Cap Glipizide at ≤2.5-5mg daily or transition to renal/metabolic safe DPP4i/SGLT2i.'
        });
      }
    }

    // Compute Aggregate Risk Score (0-100)
    let aggregateHazardScore = 12; // baseline safe floor
    warnings.forEach((w) => {
      if (w.severity === 'contraindicated') aggregateHazardScore += 45;
      else if (w.severity === 'high') aggregateHazardScore += 28;
      else if (w.severity === 'moderate') aggregateHazardScore += 14;
      else if (w.severity === 'low') aggregateHazardScore += 6;
    });

    // Penalize doses exceeding patient tolerance thresholds
    simulatedDoses.forEach((d) => {
      if (d.activeToleranceLimit && d.currentDoseMg > d.activeToleranceLimit.maxDailyDoseMg) {
        aggregateHazardScore += 18;
      }
    });

    const finalHazardScore = Math.min(100, Math.max(8, aggregateHazardScore));

    // Determine Overall DDI Warning Level
    let overallLevel: 'CLEAR / SAFE' | 'LOW HAZARD' | 'MODERATE HAZARD' | 'HIGH HAZARD' | 'CRITICAL CONTRAINDICATION' = 'CLEAR / SAFE';
    let levelColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    let levelBarColor = 'bg-emerald-500';

    if (finalHazardScore >= 80 || warnings.some((w) => w.severity === 'contraindicated')) {
      overallLevel = 'CRITICAL CONTRAINDICATION';
      levelColor = 'text-rose-800 bg-rose-50 border-rose-300';
      levelBarColor = 'bg-rose-600';
    } else if (finalHazardScore >= 55 || warnings.some((w) => w.severity === 'high')) {
      overallLevel = 'HIGH HAZARD';
      levelColor = 'text-amber-800 bg-amber-50 border-amber-300';
      levelBarColor = 'bg-amber-500';
    } else if (finalHazardScore >= 32 || warnings.some((w) => w.severity === 'moderate')) {
      overallLevel = 'MODERATE HAZARD';
      levelColor = 'text-blue-800 bg-blue-50 border-blue-300';
      levelBarColor = 'bg-blue-500';
    } else if (finalHazardScore >= 18) {
      overallLevel = 'LOW HAZARD';
      levelColor = 'text-teal-800 bg-teal-50 border-teal-300';
      levelBarColor = 'bg-teal-500';
    }

    // Physiological organ strain projections
    const totalMedsCount = activeMeds.length;
    const renalStrain = Math.min(100, Math.round(30 + (lisinoprilDose / 40) * 20 + (spironolactoneDose / 50) * 25 + (metforminDose / 2000) * 20));
    const hepaticStrain = Math.min(100, Math.round(20 + (atorvastatinDose / 80) * 35 + (amlodipineDose / 10) * 20));
    const therapeuticEfficacy = Math.min(96, Math.max(45, Math.round(55 + (activeMeds.reduce((acc, m) => acc + (m.currentDoseMg > 0 ? 8 : 0), 0)) - (finalHazardScore * 0.25))));

    return {
      warnings,
      finalHazardScore,
      overallLevel,
      levelColor,
      levelBarColor,
      renalStrain,
      hepaticStrain,
      therapeuticEfficacy,
      activeMedsCount: totalMedsCount
    };
  }, [simulatedDoses, patient]);

  // Filtered view of medication sliders
  const filteredMeds = useMemo(() => {
    return simulatedDoses.filter((med) => {
      if (activeFilter === 'changed') {
        return med.currentDoseMg !== med.baseDoseMg;
      }
      if (activeFilter === 'high_risk') {
        return med.activeToleranceLimit || med.isCandidate;
      }
      return true;
    });
  }, [simulatedDoses, activeFilter]);

  return (
    <div id="whatif-dosage-simulator" className="space-y-6">
      {/* Header & Quick Action Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-5 lg:p-6 shadow-md border border-slate-700/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
                <Sliders className="w-3 h-3" />
                <span>Interactive What-If Titration Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-mono font-bold">
                Real-Time DDI Recalibration
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-white mt-1.5 tracking-tight flex items-center space-x-2">
              <span>What-If Dosage & DDI</span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dynamic Simulator
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically manipulate medication dosages, test dose-escalation thresholds, and observe instant pharmacokinetic shifts in drug-drug interaction warning severity for {patient.name.split(' (')[0]}.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetToBaseline}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
              title="Reset all dosages to active patient prescription baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
            <button
              onClick={handleApplyRenalAdjustPreset}
              className="px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600 text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
              title="Reduce renally-cleared medications by 50% for CKD protection"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>-50% Renal Adjust</span>
            </button>
            <button
              onClick={handleApplyDeprescribePreset}
              className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-600 text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
              title="Cap doses at genetic and clinical tolerance limits"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Cap at PGx Limit</span>
            </button>
          </div>
        </div>

        {/* Live Dynamic Interaction Level Status Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main DDI Warning Level Gauge */}
          <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/90 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Immediate DDI Warning Level</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${analysisResult.levelColor}`}>
                {analysisResult.overallLevel}
              </span>
            </div>

            {/* Dynamic Hazard Meter Bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300">Hazard Index</span>
                <span className="text-white font-bold">{analysisResult.finalHazardScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${analysisResult.levelBarColor}`}
                  style={{ width: `${analysisResult.finalHazardScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Safe (0-15)</span>
                <span>Moderate (35-55)</span>
                <span>Critical (&gt;80)</span>
              </div>
            </div>
          </div>

          {/* Predicted Efficacy */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/90 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Predicted Efficacy</span>
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {analysisResult.therapeuticEfficacy}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Therapeutic Response</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${analysisResult.therapeuticEfficacy}%` }}
              />
            </div>
          </div>

          {/* Active Collisions Count */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/90 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Active Conflicts</span>
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-purple-300">
                {analysisResult.warnings.length}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Kinetic Overlaps</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-sans truncate">
              {analysisResult.warnings.length === 0
                ? 'All dose combinations safe'
                : `${analysisResult.warnings.filter((w) => w.severity === 'high' || w.severity === 'contraindicated').length} require dose reduction`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 7 Cols Sliders, Right 5 Cols Live Impact & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Medication Dosage Sliders */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Regimen ({simulatedDoses.length})
              </button>
              <button
                onClick={() => setActiveFilter('changed')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeFilter === 'changed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Modified ({simulatedDoses.filter((d) => d.currentDoseMg !== d.baseDoseMg).length})
              </button>
              <button
                onClick={() => setActiveFilter('high_risk')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeFilter === 'high_risk'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                PGx / Renal Limited
              </button>
            </div>

            {/* Add Candidate Dropdown */}
            <div className="flex items-center space-x-1.5">
              <select
                value={selectedCandidateToAdd}
                onChange={(e) => setSelectedCandidateToAdd(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-[#F8FAFF] border border-slate-200 text-slate-800 font-sans focus:outline-none focus:border-blue-500"
              >
                <option value="">+ Add Candidate Drug...</option>
                {CANDIDATE_MEDICATIONS.filter(
                  (c) => !simulatedDoses.some((d) => d.medicationId === c.id)
                ).map((cand) => (
                  <option key={cand.id} value={cand.id}>
                    {cand.name} ({cand.dosage})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddCandidate}
                disabled={!selectedCandidateToAdd}
                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 disabled:opacity-40 transition-colors"
                title="Add candidate drug to simulation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of Dosage Sliders */}
          <div className="space-y-3.5">
            {filteredMeds.map((med) => {
              const isModified = med.currentDoseMg !== med.baseDoseMg;
              const isHeld = med.currentDoseMg === 0;
              const exceedsTolerance =
                med.activeToleranceLimit && med.currentDoseMg > med.activeToleranceLimit.maxDailyDoseMg;
              const ratio = med.baseDoseMg > 0 ? (med.currentDoseMg / med.baseDoseMg) * 100 : 100;

              return (
                <div
                  key={med.medicationId}
                  className={`p-4 rounded-2xl bg-white border transition-all shadow-xs ${
                    exceedsTolerance
                      ? 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/20'
                      : isHeld
                      ? 'border-slate-300 bg-slate-50/80 opacity-75'
                      : isModified
                      ? 'border-blue-300 ring-1 ring-blue-100'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Slider Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-[#0F172A]">
                          {med.name}
                        </span>
                        {med.brandName && (
                          <span className="text-xs text-blue-700 font-sans">
                            ({med.brandName})
                          </span>
                        )}
                        {med.isCandidate && (
                          <span className="px-2 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold">
                            Candidate Add-On
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        {med.category} • Baseline: {med.baseDoseMg > 0 ? `${med.baseDoseMg} ${med.unit} (${med.frequency})` : 'None (0 mg)'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Current Value Pill */}
                      <div className="text-right">
                        <div className="flex items-baseline space-x-1 justify-end">
                          <span
                            className={`text-base font-extrabold font-mono ${
                              isHeld
                                ? 'text-rose-600 line-through'
                                : exceedsTolerance
                                ? 'text-rose-700'
                                : isModified
                                ? 'text-blue-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {med.currentDoseMg} {med.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">/day</span>
                        </div>
                        {isModified && (
                          <span
                            className={`text-[9px] font-mono font-bold block ${
                              isHeld
                                ? 'text-rose-600 font-extrabold'
                                : ratio > 100
                                ? 'text-amber-700'
                                : 'text-blue-700'
                            }`}
                          >
                            {isHeld ? 'HELD / DISCONTINUED' : `${Math.round(ratio)}% of baseline`}
                          </span>
                        )}
                      </div>

                      {med.isCandidate && (
                        <button
                          onClick={() => handleRemoveCandidate(med.medicationId)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove candidate from what-if simulation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Range Slider Control */}
                  <div className="mt-3.5 space-y-2">
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min={med.minDoseMg}
                        max={med.maxDoseMg}
                        step={med.stepMg}
                        value={med.currentDoseMg}
                        onChange={(e) => handleDoseChange(med.medicationId, parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Step Milestones / Limits */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleDoseChange(med.medicationId, 0)}
                        className="hover:text-rose-600 font-semibold transition-colors"
                      >
                        0 (Hold)
                      </button>
                      {med.baseDoseMg > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDoseChange(med.medicationId, med.baseDoseMg)}
                          className="hover:text-blue-600 transition-colors"
                        >
                          Baseline ({med.baseDoseMg})
                        </button>
                      )}
                      <span>Max ({med.maxDoseMg} {med.unit})</span>
                    </div>
                  </div>

                  {/* PGx / Renal Tolerance Warning Badge */}
                  {med.activeToleranceLimit && (
                    <div
                      className={`mt-2.5 p-2 rounded-xl text-[11px] font-sans flex items-start space-x-2 ${
                        exceedsTolerance
                          ? 'bg-rose-50 text-rose-900 border border-rose-200 font-medium'
                          : 'bg-purple-50 text-purple-900 border border-purple-200'
                      }`}
                    >
                      <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${exceedsTolerance ? 'text-rose-600' : 'text-purple-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            {med.activeToleranceLimit.sourceReason}
                          </span>
                          <span className="font-mono font-bold text-[10px]">
                            Cap: {med.activeToleranceLimit.maxDailyDoseMg} {med.activeToleranceLimit.unit}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-normal">
                          {med.activeToleranceLimit.guidelineReference || med.activeToleranceLimit.historicalReaction}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Live Dynamic Interaction Breakdown & Action Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dynamic DDI Alert Feed */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-[#0F172A]">
                  Dynamic Interaction Feed ({analysisResult.warnings.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live Recalibrated</span>
            </div>

            {analysisResult.warnings.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Zero High-Risk DDI Collisions</h4>
                <p className="text-[11px] text-emerald-700 font-sans">
                  The currently simulated dosage combination does not exceed clinical kinetic collision thresholds.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {analysisResult.warnings.map((warn) => {
                  const isCritical = warn.severity === 'contraindicated';
                  const isHigh = warn.severity === 'high';
                  const isMod = warn.severity === 'moderate';

                  return (
                    <div
                      key={warn.id}
                      className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                        isCritical
                          ? 'bg-rose-50/80 border-rose-300 text-rose-900'
                          : isHigh
                          ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                          : 'bg-blue-50/80 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center space-x-1.5 font-bold text-xs">
                          {isCritical ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : isHigh ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span>{warn.title}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase ${
                            isCritical
                              ? 'bg-rose-200 text-rose-900'
                              : isHigh
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-blue-200 text-blue-900'
                          }`}
                        >
                          {warn.severity}
                        </span>
                      </div>

                      {/* Dynamic Dose Trigger Note */}
                      <div className="p-2 rounded-lg bg-white/90 border border-slate-200/80 text-[11px] font-mono text-slate-800">
                        {warn.doseDependentThresholdNote}
                      </div>

                      <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                        <strong>Clinical Impact:</strong> {warn.clinicalImpact}
                      </p>

                      <div className="pt-1.5 border-t border-slate-200/60 text-[10px] font-sans text-slate-600">
                        <strong className="text-slate-900">Guideline Action:</strong> {warn.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Organ Function & Physiological Tolerance Impact */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0F172A] flex items-center space-x-2">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Simulated Organ Clearance Burden</span>
            </h3>

            <div className="space-y-2.5 text-xs font-sans">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-600">Renal Clearance Load:</span>
                  <span className="font-bold text-slate-900">{analysisResult.renalStrain}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      analysisResult.renalStrain > 75
                        ? 'bg-rose-500'
                        : analysisResult.renalStrain > 50
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${analysisResult.renalStrain}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-600">Hepatic CYP450 Competition:</span>
                  <span className="font-bold text-slate-900">{analysisResult.hepaticStrain}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      analysisResult.hepaticStrain > 75
                        ? 'bg-rose-500'
                        : analysisResult.hepaticStrain > 50
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${analysisResult.hepaticStrain}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Transition to Simulation Lab Button */}
            {onNavigateToSimulation && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => onNavigateToSimulation()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Run Quantum QUBO on This Regimen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
