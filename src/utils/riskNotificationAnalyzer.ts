import { PatientDigitalTwinState, DrugInteraction, PatientRiskNotification } from '../types';
import { checkDosageTolerance } from './dosageToleranceChecker';

/**
 * Evaluates a patient's digital twin against active pharmacogenomics, organ indicators,
 * drug-drug interaction pairs, clinical dosing guidelines, and historical tolerance thresholds to generate predictive risk alerts.
 */
export function analyzePatientRiskAlerts(
  patient: PatientDigitalTwinState,
  interactions: DrugInteraction[] = []
): PatientRiskNotification[] {
  const alerts: PatientRiskNotification[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const patientMedNames = patient.currentMedications.map((m) => m.name.toLowerCase());

  // 1. Check Historical Tolerance Thresholds for Current & Proposed Regimens
  if (patient.dosageToleranceThresholds && patient.dosageToleranceThresholds.length > 0) {
    patient.currentMedications.forEach((med) => {
      const toleranceResult = checkDosageTolerance(med, patient.dosageToleranceThresholds);
      if (toleranceResult.isExceeded && toleranceResult.threshold) {
        const threshold = toleranceResult.threshold;
        const isCritical = toleranceResult.percentageExceeded >= 50 || threshold.maxDailyDoseMg === 0;

        alerts.push({
          id: `dose-tolerance-${patient.patientId}-${med.id}`,
          patientId: patient.patientId,
          patientName: patient.name.split(' (')[0],
          type: 'dosage_threshold',
          severity: isCritical ? 'critical' : 'high',
          title: `Historical Dosage Tolerance Exceeded: ${med.name} (${med.dosage} ${med.frequency})`,
          message: `Proposed/Active daily dose of ${toleranceResult.proposedDailyDoseMg} ${threshold.unit}/day exceeds patient's digital twin historical ceiling of ${threshold.maxDailyDoseMg} ${threshold.unit}/day (+${toleranceResult.percentageExceeded}% over threshold).`,
          affectedMedications: [med.name],
          clinicalRationale: `${threshold.sourceReason}. ${threshold.historicalReaction ? `Prior adverse record: "${threshold.historicalReaction}".` : ''}`,
          actionRecommendation: `De-escalate ${med.name} to ≤${threshold.maxDailyDoseMg} ${threshold.unit}/day or substitute with a non-overlapping mechanism.`,
          evidenceSource: threshold.guidelineReference || 'Digital Twin Longitudinal Tolerance Profile',
          timestamp: now,
          dosageDetails: {
            proposedDose: toleranceResult.proposedDailyDoseMg,
            thresholdDose: threshold.maxDailyDoseMg,
            unit: threshold.unit,
            limitingFactor: threshold.limitingFactor,
            percentageExceeded: toleranceResult.percentageExceeded
          }
        });
      }
    });
  }

  // 2. Check Drug-Drug Interaction Overlaps
  interactions.forEach((interaction) => {
    const hasDrugA = patientMedNames.some((n) => n.includes(interaction.drugA.toLowerCase()) || interaction.drugA.toLowerCase().includes(n));
    const hasDrugB = patientMedNames.some((n) => n.includes(interaction.drugB.toLowerCase()) || interaction.drugB.toLowerCase().includes(n));

    if (hasDrugA && hasDrugB) {
      const severityMap: Record<string, 'critical' | 'high' | 'moderate' | 'low'> = {
        contraindicated: 'critical',
        high: 'high',
        moderate: 'moderate',
        low: 'low'
      };

      alerts.push({
        id: `ddi-${patient.patientId}-${interaction.id}`,
        patientId: patient.patientId,
        patientName: patient.name.split(' (')[0],
        type: 'ddi',
        severity: severityMap[interaction.severity] || 'high',
        title: `DDI Alert: ${interaction.drugA} + ${interaction.drugB}`,
        message: interaction.clinicalEffect,
        affectedMedications: [interaction.drugA, interaction.drugB],
        clinicalRationale: interaction.mechanism,
        actionRecommendation: interaction.managementRecommendation,
        evidenceSource: 'PharmaGNN Multi-Hop Graph (KDIGO / CPIC 2025)',
        timestamp: now
      });
    }
  });

  // 2. Renal Impairment & Medication Dose Mismatch (eGFR constraints)
  if (patient.organFunction.eGFR < 45) {
    const metformin = patient.currentMedications.find((m) => m.name.toLowerCase().includes('metformin'));
    if (metformin) {
      const isCritical = patient.organFunction.eGFR < 30;
      alerts.push({
        id: `renal-metformin-${patient.patientId}`,
        patientId: patient.patientId,
        patientName: patient.name.split(' (')[0],
        type: 'renal_dose',
        severity: isCritical ? 'critical' : 'high',
        title: isCritical ? 'Metformin Contraindication (eGFR < 30)' : 'Metformin Renal Dose Adjustment Required',
        message: `Current eGFR is ${patient.organFunction.eGFR} mL/min. Metformin accumulation increases lactic acidosis risk in renal clearance impairment.`,
        affectedMedications: ['Metformin'],
        clinicalRationale: 'Renal excretion accounts for 90% of unchanged Metformin elimination via OCT2 transporters.',
        actionRecommendation: isCritical
          ? 'Discontinue Metformin and substitute with renal-safe SGLT2i or GLP-1 RA.'
          : 'Cap Metformin dosage at maximum 1000 mg/day and monitor renal function every 3 months.',
        evidenceSource: 'ADA / KDIGO 2024 Consensus Guidelines',
        timestamp: now
      });
    }

    const lisinopril = patient.currentMedications.find((m) => m.name.toLowerCase().includes('lisinopril'));
    if (lisinopril && patient.organFunction.eGFR < 30) {
      alerts.push({
        id: `renal-lisinopril-${patient.patientId}`,
        patientId: patient.patientId,
        patientName: patient.name.split(' (')[0],
        type: 'renal_dose',
        severity: 'high',
        title: 'ACEi Renal Hemodynamic Risk in Advanced CKD',
        message: `eGFR ${patient.organFunction.eGFR} mL/min with Lisinopril administration may precipitate acute GFR reduction or severe hyperkalemia.`,
        affectedMedications: ['Lisinopril'],
        clinicalRationale: 'Efferent arteriolar dilation decreases intraglomerular hydrostatic pressure.',
        actionRecommendation: 'Monitor serum creatinine and potassium closely; consider temporary dosage de-escalation if K+ > 5.2 mEq/L.',
        evidenceSource: 'KDIGO 2024 Clinical Practice Guideline',
        timestamp: now
      });
    }
  }

  // 3. Pharmacogenomic Diplotype Alerts (CYP450 metabolism risks)
  patient.genomics?.forEach((genomic) => {
    // CYP2C9 intermediate/poor metabolizer with ARB/Sulfonylurea
    if (genomic.gene === 'CYP2C9' && (genomic.phenotype.includes('Intermediate') || genomic.phenotype.includes('Poor'))) {
      const sulfonylurea = patient.currentMedications.find((m) =>
        ['glipizide', 'glimepiride', 'glyburide'].some((s) => m.name.toLowerCase().includes(s))
      );
      if (sulfonylurea) {
        alerts.push({
          id: `pgx-cyp2c9-${patient.patientId}`,
          patientId: patient.patientId,
          patientName: patient.name.split(' (')[0],
          type: 'genomic',
          severity: 'high',
          title: `CYP2C9 ${genomic.diplotype?.replace(/\*/g, '')}: Severe Hypoglycemia Risk with ${sulfonylurea.name}`,
          message: `Patient is a CYP2C9 ${genomic.phenotype} (${genomic.diplotype?.replace(/\*/g, '')}). Markedly reduced hepatic clearance yields prolonged drug half-life.`,
          affectedMedications: [sulfonylurea.name],
          clinicalRationale: `${genomic.clinicalSignificance}. Substrate clearance diminished by ~50-70%.`,
          actionRecommendation: `Reduce ${sulfonylurea.name} dose by 50% or replace with DPPIV-inhibitor / SGLT2i with non-CYP2C9 metabolic routes.`,
          evidenceSource: 'CPIC Guideline for CYP2C9 & Sulfonylureas (Level A)',
          timestamp: now
        });
      }
    }

    // SLCO1B1 transporter variant with Statins (Myopathy Risk)
    if (genomic.gene === 'SLCO1B1' && (genomic.phenotype.includes('Intermediate') || genomic.phenotype.includes('Decreased') || genomic.phenotype.includes('Poor'))) {
      const statin = patient.currentMedications.find((m) =>
        ['simvastatin', 'atorvastatin', 'rosuvastatin'].some((s) => m.name.toLowerCase().includes(s))
      );
      if (statin) {
        alerts.push({
          id: `pgx-slco1b1-${patient.patientId}`,
          patientId: patient.patientId,
          patientName: patient.name.split(' (')[0],
          type: 'genomic',
          severity: 'moderate',
          title: `SLCO1B1 ${genomic.diplotype?.replace(/\*/g, '')}: Statin-Associated Myopathy Risk`,
          message: `Altered OATP1B1 hepatic uptake transporter increases plasma exposure and risk of myopathy/rhabdomyolysis with ${statin.name}.`,
          affectedMedications: [statin.name],
          clinicalRationale: genomic.clinicalSignificance,
          actionRecommendation: 'Ensure Statin dose does not exceed recommended CPIC thresholds; monitor baseline CK and muscle soreness.',
          evidenceSource: 'CPIC Guideline for Statin-Induced Myopathy',
          timestamp: now
        });
      }
    }

    // CYP2D6 Poor Metabolizer with Beta-Blockers / Antidepressants / Tramadol
    if (genomic.gene === 'CYP2D6' && (genomic.phenotype.includes('Poor') || genomic.phenotype.includes('Ultrarapid'))) {
      const cyp2d6Drug = patient.currentMedications.find((m) =>
        ['metoprolol', 'carvedilol', 'tramadol', 'codeine'].some((s) => m.name.toLowerCase().includes(s))
      );
      if (cyp2d6Drug) {
        alerts.push({
          id: `pgx-cyp2d6-${patient.patientId}`,
          patientId: patient.patientId,
          patientName: patient.name.split(' (')[0],
          type: 'genomic',
          severity: genomic.phenotype.includes('Poor') ? 'high' : 'moderate',
          title: `CYP2D6 ${genomic.phenotype}: Altered Kinetics for ${cyp2d6Drug.name}`,
          message: `Genomic diplotype ${genomic.diplotype?.replace(/\*/g, '')} alters active metabolite bio-availability.`,
          affectedMedications: [cyp2d6Drug.name],
          clinicalRationale: genomic.clinicalSignificance,
          actionRecommendation: 'Consider alternative therapeutic class or dose titration guided by therapeutic drug monitoring.',
          evidenceSource: 'CPIC Pharmacogenomics Knowledgebase',
          timestamp: now
        });
      }
    }
  });

  // 4. Polypharmacy Load & ADR Cumulative Toxicity Alert
  if (patient.currentMedications.length >= 4) {
    const highAdrMeds = patient.currentMedications.filter((m) => (m.adrRiskScore || 0) > 25);
    if (highAdrMeds.length >= 2 || patient.treatmentComplexity === 'CRITICAL' || patient.treatmentComplexity === 'HIGH') {
      alerts.push({
        id: `adr-polypharmacy-${patient.patientId}`,
        patientId: patient.patientId,
        patientName: patient.name.split(' (')[0],
        type: 'adr_toxicity',
        severity: patient.treatmentComplexity === 'CRITICAL' ? 'critical' : 'high',
        title: `High Polypharmacy Cumulative Burden (${patient.currentMedications.length} Concurrent Meds)`,
        message: `Multi-task neural model (ADRNet) predicts elevated aggregate adverse reaction probability (${patient.complexityScore}/100 complexity).`,
        affectedMedications: patient.currentMedications.map((m) => m.name),
        clinicalRationale: 'Synergistic receptor occupancy and competing metabolic pathways compound baseline organ stress.',
        actionRecommendation: 'Run QUBO Quantum Optimizer to simulate deprescribing and discover minimal effective drug sets.',
        evidenceSource: 'Q-DrugTwin Multi-Task ADRNet Predictive Head',
        timestamp: now
      });
    }
  }

  // 5. Glycemic Instability & Lab Trend Risk
  if (patient.organFunction.hba1c >= 8.5) {
    alerts.push({
      id: `glycemic-${patient.patientId}`,
      patientId: patient.patientId,
      patientName: patient.name.split(' (')[0],
      type: 'glycemic_instability',
      severity: 'moderate',
      title: `Suboptimal Glycemic Control (HbA1c ${patient.organFunction.hba1c}%)`,
      message: `Current antidiabetic regimen is failing to achieve guideline target (< 7.0%). Accelerates microvascular and renal progression.`,
      affectedMedications: patient.currentMedications.filter((m) => m.category.toLowerCase().includes('antidiabetic') || m.category.toLowerCase().includes('diabetes')).map((m) => m.name),
      clinicalRationale: 'Persistent hyperglycemia increases glomerular hyperfiltration and oxidative stress.',
      actionRecommendation: 'Simulate addition of cardioprotective SGLT2i (Empagliflozin) or GLP-1 RA in Simulation Lab.',
      evidenceSource: 'ADA 2025 Standards of Medical Care in Diabetes',
      timestamp: now
    });
  }

  return alerts;
}

/**
 * Analyzes an entire cohort of patients and returns aggregated risk notifications
 * sorted by severity (critical -> high -> moderate -> low).
 */
export function analyzeCohortRiskAlerts(
  patients: PatientDigitalTwinState[],
  interactions: DrugInteraction[] = []
): PatientRiskNotification[] {
  const allAlerts = patients.flatMap((p) => analyzePatientRiskAlerts(p, interactions));

  const severityWeight: Record<string, number> = {
    critical: 4,
    high: 3,
    moderate: 2,
    low: 1
  };

  return allAlerts.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
}
