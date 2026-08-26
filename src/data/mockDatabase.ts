import { PatientDigitalTwinState, Medication, DrugInteraction, AiModelMetric } from '../types';

export const INITIAL_PATIENTS: PatientDigitalTwinState[] = [
  {
    patientId: 'PT-001',
    name: 'Eleanor Vance (Synthetic Cohort)',
    demographics: {
      age: 62,
      gender: 'Female',
      weightKg: 78,
      heightCm: 165,
      bmi: 28.6,
      ethnicity: 'Caucasian'
    },
    conditions: [
      { id: 'c1', name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', severity: 'moderate', diagnosedDate: '2019-03-12', status: 'active' },
      { id: 'c2', name: 'Essential Hypertension', icd10: 'I10', severity: 'moderate', diagnosedDate: '2017-08-20', status: 'managed' },
      { id: 'c3', name: 'Early Diabetic Nephropathy (CKD Stage 2)', icd10: 'N18.2', severity: 'mild', diagnosedDate: '2022-11-04', status: 'active' }
    ],
    allergies: [
      { substance: 'Sulfa Drugs', reactionType: 'Maculopapular Rash', severity: 'moderate' }
    ],
    labs: {
      hba1c: { name: 'HbA1c', value: 8.4, unit: '%', referenceRange: '< 5.7%', status: 'elevated', trend: 'increasing' },
      eGFR: { name: 'eGFR (CKD-EPI)', value: 58, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'low', trend: 'decreasing' },
      serumCreatinine: { name: 'Serum Creatinine', value: 1.42, unit: 'mg/dL', referenceRange: '0.6 - 1.1', status: 'elevated', trend: 'increasing' },
      fastingGlucose: { name: 'Fasting Blood Glucose', value: 164, unit: 'mg/dL', referenceRange: '70 - 99', status: 'elevated', trend: 'increasing' },
      potassium: { name: 'Serum Potassium (K+)', value: 4.8, unit: 'mEq/L', referenceRange: '3.5 - 5.0', status: 'normal', trend: 'stable' },
      alt: { name: 'ALT (SGPT)', value: 29, unit: 'U/L', referenceRange: '7 - 35', status: 'normal', trend: 'stable' },
      ast: { name: 'AST (SGOT)', value: 24, unit: 'U/L', referenceRange: '8 - 33', status: 'normal', trend: 'stable' },
      uACR: { name: 'Urine Albumin/Creatinine Ratio', value: 185, unit: 'mg/g', referenceRange: '< 30', status: 'elevated', trend: 'increasing' }
    },
    organFunction: {
      renalScore: 64,
      eGFR: 58,
      serumCreatinine: 1.42,
      hepaticScore: 92,
      alt: 29,
      ast: 24,
      bilirubin: 0.7,
      cardiacScore: 78,
      lvef: 58,
      bnp: 65,
      metabolicScore: 61,
      hba1c: 8.4,
      fastingGlucose: 164,
      vascularScore: 72,
      systolicBp: 142,
      diastolicBp: 88
    },
    genomics: [
      { gene: 'CYP2C9', phenotype: 'Intermediate Metabolizer', diplotype: '1/3', clinicalSignificance: 'Reduced clearance of Sulfonylureas and ARBs' },
      { gene: 'CYP2D6', phenotype: 'Normal Metabolizer', diplotype: '1/1', clinicalSignificance: 'Standard clearance for beta-blockers' },
      { gene: 'SLCO1B1', phenotype: 'Intermediate Function', diplotype: '1/5', clinicalSignificance: 'Increased risk of Statin-induced myopathy with high-dose Simvastatin' }
    ],
    genomicProfile: {
      sequencingTechnology: 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq 6000)',
      panelVersion: 'PGx-Clinical-Core v4.2',
      sampleDate: '2024-11-14',
      labAccreditation: 'CLIA / CAP Accredited',
      dnaExtractionYield: '99.8% Call Rate',
      markers: [
        {
          gene: 'CYP2C9',
          diplotype: '*1/*3',
          rsId: 'rs1057910',
          phenotype: 'Intermediate Metabolizer',
          metabolizerCategory: 'intermediate',
          activityScore: 1.0,
          affectedDrugClasses: ['Sulfonylureas (Glipizide/Glimepiride)', 'ARBs (Losartan)', 'NSAIDs', 'Warfarin'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C9 Monooxygenase',
          clinicalSummary: 'Variant allele *3 has ~5% activity of wildtype *1. Results in 50% reduced hepatic clearance of sulfonylureas and prolonged active drug exposure.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Impaired Clearance (Toxicity Risk)'
        },
        {
          gene: 'CYP2D6',
          diplotype: '*1/*1',
          rsId: 'rs3892097 (wt)',
          phenotype: 'Normal (Extensive) Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Beta-Blockers (Metoprolol/Carvedilol)', 'Codeine / Tramadol', 'SSRIs'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2D6 Monooxygenase',
          clinicalSummary: 'Wild-type homozygous alleles ensure expected pharmacokinetics and standard metabolic clearance rates.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        },
        {
          gene: 'SLCO1B1',
          diplotype: '*1/*5',
          rsId: 'rs4149056 (c.521T>C)',
          phenotype: 'Decreased Function (Intermediate Transporter)',
          metabolizerCategory: 'intermediate',
          activityScore: 1.0,
          affectedDrugClasses: ['Statins (Simvastatin, Atorvastatin, Rosuvastatin)'],
          impactedEnzymesOrTransporters: 'Organic Anion-Transporting Polypeptide 1B1 (OATP1B1)',
          clinicalSummary: 'Single *5 loss-of-function allele reduces hepatic statin influx, increasing systemic statin AUC by 2-fold and elevating myopathy risk.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Altered Hepatic Influx'
        },
        {
          gene: 'CYP2C19',
          diplotype: '*1/*1',
          rsId: 'rs4244285 (wt)',
          phenotype: 'Normal Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Proton Pump Inhibitors (Omeprazole)', 'Clopidogrel', 'Citalopram'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C19',
          clinicalSummary: 'Normal bioactivation of clopidogrel to active thiol metabolite; expected elimination of PPIs.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        },
        {
          gene: 'VKORC1',
          diplotype: '-1639G>A (G/A)',
          rsId: 'rs9923231',
          phenotype: 'Intermediate Warfarin Sensitivity',
          metabolizerCategory: 'altered',
          affectedDrugClasses: ['Vitamin K Antagonists (Warfarin)'],
          impactedEnzymesOrTransporters: 'Vitamin K Epoxide Reductase Complex Subunit 1',
          clinicalSummary: 'Heterozygous G/A promoter polymorphism lowers target enzyme expression, requiring ~25% lower Warfarin dose.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Altered Hepatic Influx'
        }
      ],
      primaryMetabolizerSummary: {
        poorMetabolizersCount: 0,
        intermediateCount: 2,
        ultraRapidCount: 0,
        normalCount: 2
      },
      highRiskDrugsToAvoid: ['High-Dose Simvastatin (80mg)', 'High-Dose Glimepiride'],
      doseAdjustmentRecommended: ['Atorvastatin (cap at 20-40mg)', 'Glipizide (initiate at 50% dose)']
    },
    currentMedications: [
      {
        id: 'med_metformin',
        name: 'Metformin',
        brandName: 'Glucophage',
        category: 'Biguanide Antidiabetic',
        dosage: '1000 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['Renal excretion (90% unchanged)', 'OCT2 transporter'],
        primaryTargets: ['AMPK activation', 'Mitochondrial complex I'],
        halfLifeHours: 6.2,
        contraindications: ['Severe renal impairment (eGFR < 30)', 'Acute metabolic acidosis'],
        commonAdrs: ['GI distress', 'Nausea', 'Rare lactic acidosis in renal hypoperfusion'],
        predictedEffectiveness: 76,
        adrRiskScore: 22,
        interactionRiskScore: 18,
        suitabilityScore: 82,
        mechanismSummary: 'Decreases hepatic glucose production and improves insulin sensitivity.'
      },
      {
        id: 'med_lisinopril',
        name: 'Lisinopril',
        brandName: 'Prinivil / Zestril',
        category: 'ACE Inhibitor',
        dosage: '20 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['Renal excretion (100% unchanged)'],
        primaryTargets: ['Angiotensin-Converting Enzyme (ACE)'],
        halfLifeHours: 12.0,
        contraindications: ['History of angioedema', 'Concomitant aliskiren in diabetes'],
        commonAdrs: ['Dry cough', 'Hyperkalemia', 'Hypotension', 'Acute kidney injury in bilateral RAS'],
        predictedEffectiveness: 84,
        adrRiskScore: 19,
        interactionRiskScore: 24,
        suitabilityScore: 86,
        mechanismSummary: 'Inhibits ACE, reducing angiotensin II and aldosterone production, lowering blood pressure and protecting renal glomeruli.'
      },
      {
        id: 'med_atorvastatin',
        name: 'Atorvastatin',
        brandName: 'Lipitor',
        category: 'HMG-CoA Reductase Inhibitor',
        dosage: '20 mg',
        frequency: 'Once daily (evening)',
        route: 'Oral',
        metabolismPathway: ['CYP3A4', 'OATP1B1 (SLCO1B1)'],
        primaryTargets: ['HMG-CoA Reductase'],
        halfLifeHours: 14.0,
        contraindications: ['Active liver disease', 'Unexplained persistent transaminase elevations'],
        commonAdrs: ['Myalgia', 'Elevated transaminases', 'GI upset'],
        predictedEffectiveness: 88,
        adrRiskScore: 14,
        interactionRiskScore: 28,
        suitabilityScore: 89,
        mechanismSummary: 'Inhibits rate-limiting step in cholesterol biosynthesis, upregulating LDL receptors.'
      },
      {
        id: 'med_amlodipine',
        name: 'Amlodipine',
        brandName: 'Norvasc',
        category: 'Dihydropyridine Calcium Channel Blocker',
        dosage: '5 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP3A4 hepatic oxidation'],
        primaryTargets: ['L-type Calcium Channels (CACNA1C)'],
        halfLifeHours: 35.0,
        contraindications: ['Severe hypotension', 'Cardiogenic shock'],
        commonAdrs: ['Peripheral edema', 'Flushing', 'Dizziness'],
        predictedEffectiveness: 80,
        adrRiskScore: 16,
        interactionRiskScore: 20,
        suitabilityScore: 84,
        mechanismSummary: 'Relaxes vascular smooth muscle causing peripheral arterial vasodilation.'
      }
    ],
    dosageToleranceThresholds: [
      {
        medicationName: 'Metformin',
        maxDailyDoseMg: 1000,
        unit: 'mg',
        sourceReason: 'Renal Clearance Limit (eGFR: 58 mL/min)',
        limitingFactor: 'renal_clearance',
        historicalReaction: 'GI cramping and elevated blood lactate at 2000mg/day in 2023',
        guidelineReference: 'ADA / KDIGO 2024 CKD Dosing: Max 1000mg daily if eGFR 45-59 mL/min'
      },
      {
        medicationName: 'Atorvastatin',
        maxDailyDoseMg: 40,
        unit: 'mg',
        sourceReason: 'SLCO1B1 *1/*5 Intermediate Transporter',
        limitingFactor: 'pharmacogenomic_variant',
        historicalReaction: 'Bilateral thigh myalgia with CPK elevation at 80mg/day',
        guidelineReference: 'CPIC Guideline for Statins and SLCO1B1 Genotype'
      },
      {
        medicationName: 'Glipizide',
        maxDailyDoseMg: 5,
        unit: 'mg',
        sourceReason: 'CYP2C9 *1/*3 Intermediate Metabolizer (50% clearance)',
        limitingFactor: 'pharmacogenomic_variant',
        historicalReaction: 'Nocturnal hypoglycemic episode (glucose 52 mg/dL) at 10mg/day',
        guidelineReference: 'CPIC Level 1A: 50% dose reduction recommended for CYP2C9 intermediate metabolizers'
      },
      {
        medicationName: 'Spironolactone',
        maxDailyDoseMg: 25,
        unit: 'mg',
        sourceReason: 'Hyperkalemia vulnerability with baseline K+ 4.8 mEq/L and eGFR 58',
        limitingFactor: 'renal_clearance',
        historicalReaction: 'Potassium spike to 5.4 mEq/L during dual RAAS escalation',
        guidelineReference: 'AHA/ACC HF & CKD Potassium Monitoring Threshold'
      }
    ],
    treatmentComplexity: 'HIGH',
    complexityScore: 78,
    longitudinalHistory: [
      { timestamp: '6 Months Ago', stateName: 'Baseline Intake', eGFR: 64, hba1c: 7.6, systolicBp: 148, medicationCount: 3 },
      { timestamp: '3 Months Ago', stateName: 'Medication Titration', eGFR: 61, hba1c: 8.0, systolicBp: 144, medicationCount: 4 },
      { timestamp: 'Current State', stateName: 'Evaluation State (Pt)', eGFR: 58, hba1c: 8.4, systolicBp: 142, medicationCount: 4 }
    ]
  },
  {
    patientId: 'PT-002',
    name: 'Marcus Chen (Synthetic Cohort)',
    demographics: {
      age: 48,
      gender: 'Male',
      weightKg: 91,
      heightCm: 178,
      bmi: 28.7,
      ethnicity: 'East Asian'
    },
    conditions: [
      { id: 'c2_1', name: 'Metabolic Syndrome with Prediabetes', icd10: 'E88.81', severity: 'moderate', diagnosedDate: '2023-01-15', status: 'active' },
      { id: 'c2_2', name: 'Mixed Dyslipidemia', icd10: 'E78.2', severity: 'moderate', diagnosedDate: '2021-06-10', status: 'managed' },
      { id: 'c2_3', name: 'Stage 1 Hypertension', icd10: 'I10', severity: 'mild', diagnosedDate: '2022-09-01', status: 'managed' }
    ],
    allergies: [
      { substance: 'Penicillin', reactionType: 'Anaphylactoid / Urticaria', severity: 'severe' }
    ],
    labs: {
      hba1c: { name: 'HbA1c', value: 6.2, unit: '%', referenceRange: '< 5.7%', status: 'elevated', trend: 'stable' },
      eGFR: { name: 'eGFR (CKD-EPI)', value: 88, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'normal', trend: 'stable' },
      serumCreatinine: { name: 'Serum Creatinine', value: 1.05, unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'normal', trend: 'stable' },
      triglycerides: { name: 'Triglycerides', value: 245, unit: 'mg/dL', referenceRange: '< 150', status: 'elevated', trend: 'increasing' },
      ldl: { name: 'LDL Cholesterol', value: 154, unit: 'mg/dL', referenceRange: '< 100', status: 'elevated', trend: 'increasing' },
      alt: { name: 'ALT (SGPT)', value: 44, unit: 'U/L', referenceRange: '7 - 35', status: 'elevated', trend: 'increasing' },
      ast: { name: 'AST (SGOT)', value: 38, unit: 'U/L', referenceRange: '8 - 33', status: 'elevated', trend: 'stable' }
    },
    organFunction: {
      renalScore: 88,
      eGFR: 88,
      serumCreatinine: 1.05,
      hepaticScore: 74,
      alt: 44,
      ast: 38,
      bilirubin: 0.9,
      cardiacScore: 85,
      lvef: 62,
      bnp: 28,
      metabolicScore: 71,
      hba1c: 6.2,
      fastingGlucose: 118,
      vascularScore: 80,
      systolicBp: 134,
      diastolicBp: 84
    },
    genomics: [
      { gene: 'CYP2C19', phenotype: 'Poor Metabolizer', diplotype: '2/2', clinicalSignificance: 'Markedly reduced bioactivation of Clopidogrel, reduced clearance of PPIs' },
      { gene: 'CYP3A4', phenotype: 'Normal Metabolizer', diplotype: '1/1', clinicalSignificance: 'Standard metabolic kinetics' }
    ],
    genomicProfile: {
      sequencingTechnology: 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq 6000)',
      panelVersion: 'PGx-Clinical-Core v4.2',
      sampleDate: '2024-10-02',
      labAccreditation: 'CLIA / CAP Accredited',
      dnaExtractionYield: '99.5% Call Rate',
      markers: [
        {
          gene: 'CYP2C19',
          diplotype: '*2/*2',
          rsId: 'rs4244285 (c.681G>A)',
          phenotype: 'Poor Metabolizer (Homozygous Loss-of-Function)',
          metabolizerCategory: 'poor',
          activityScore: 0.0,
          affectedDrugClasses: ['Antiplatelets (Clopidogrel)', 'Proton Pump Inhibitors (Omeprazole, Pantoprazole)', 'Antidepressants (Citalopram, Sertraline)'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C19 Monooxygenase',
          clinicalSummary: 'Complete lack of functional CYP2C19 enzyme. Clopidogrel cannot be bioactivated into active metabolite (80% reduction in antiplatelet effect); high risk of stent thrombosis. High PPI exposure.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Prodrug Activation Failure'
        },
        {
          gene: 'CYP3A4',
          diplotype: '*1/*1',
          rsId: 'rs2740574 (wt)',
          phenotype: 'Normal Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Statins (Atorvastatin, Lovastatin)', 'Calcium Channel Blockers (Amlodipine)', 'DOACs'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 3A4',
          clinicalSummary: 'Standard oxidative clearance for major CYP3A4 substrate medications.',
          cpicGuidelineLevel: 'CPIC Level 1B',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        },
        {
          gene: 'SLCO1B1',
          diplotype: '*1/*1',
          rsId: 'rs4149056 (T/T wt)',
          phenotype: 'Normal Function Transporter',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Statins (Rosuvastatin, Pravastatin, Pitavastatin)'],
          impactedEnzymesOrTransporters: 'Organic Anion-Transporting Polypeptide 1B1',
          clinicalSummary: 'Normal hepatic statin uptake; standard risk of statin-induced myopathy.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        }
      ],
      primaryMetabolizerSummary: {
        poorMetabolizersCount: 1,
        intermediateCount: 0,
        ultraRapidCount: 0,
        normalCount: 2
      },
      highRiskDrugsToAvoid: ['Clopidogrel (Plavix) - Resistance Risk', 'Standard Dose Voriconazole'],
      doseAdjustmentRecommended: ['Omeprazole (reduce dose by 50%)', 'Prasugrel/Ticagrelor preferred over Clopidogrel']
    },
    currentMedications: [
      {
        id: 'med_rosuvastatin',
        name: 'Rosuvastatin',
        brandName: 'Crestor',
        category: 'HMG-CoA Reductase Inhibitor',
        dosage: '10 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP2C9 (minor 10%)', 'Biliary/Renal excretion'],
        primaryTargets: ['HMG-CoA Reductase'],
        halfLifeHours: 19.0,
        contraindications: ['Active liver disease', 'Severe renal impairment'],
        commonAdrs: ['Myalgia', 'Headache', 'Elevated hepatic enzymes'],
        predictedEffectiveness: 87,
        adrRiskScore: 12,
        interactionRiskScore: 14,
        suitabilityScore: 91,
        mechanismSummary: 'Potent hydrophilic statin lowering hepatic LDL-C synthesis.'
      },
      {
        id: 'med_losartan',
        name: 'Losartan',
        brandName: 'Cozaar',
        category: 'Angiotensin II Receptor Blocker (ARB)',
        dosage: '50 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP2C9', 'CYP3A4 to active E-3174 metabolite'],
        primaryTargets: ['AT1 Receptor'],
        halfLifeHours: 2.0,
        contraindications: ['Concurrent aliskiren in diabetics', 'Pregnancy'],
        commonAdrs: ['Dizziness', 'Hyperkalemia', 'Hypotension'],
        predictedEffectiveness: 82,
        adrRiskScore: 10,
        interactionRiskScore: 16,
        suitabilityScore: 88,
        mechanismSummary: 'Selective antagonist of angiotensin II AT1 receptors causing vasodilation.'
      },
      {
        id: 'med_omega3',
        name: 'Icosapent Ethyl',
        brandName: 'Vascepa',
        category: 'Lipid Regulating Agent',
        dosage: '2 g',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['Beta-oxidation'],
        primaryTargets: ['Triglyceride synthesis inhibition'],
        halfLifeHours: 89.0,
        contraindications: ['Severe fish hypersensitivity'],
        commonAdrs: ['Atrial fibrillation signal (rare)', 'Bleeding risk with anticoagulants'],
        predictedEffectiveness: 79,
        adrRiskScore: 8,
        interactionRiskScore: 11,
        suitabilityScore: 92,
        mechanismSummary: 'High-purity EPA reducing hepatic VLDL production.'
      }
    ],
    treatmentComplexity: 'MODERATE',
    complexityScore: 54,
    longitudinalHistory: [
      { timestamp: '6 Months Ago', stateName: 'Initial Screening', eGFR: 92, hba1c: 5.9, systolicBp: 138, medicationCount: 2 },
      { timestamp: '3 Months Ago', stateName: 'Lipid Therapy Addition', eGFR: 90, hba1c: 6.0, systolicBp: 136, medicationCount: 3 },
      { timestamp: 'Current State', stateName: 'Evaluation State (Pt)', eGFR: 88, hba1c: 6.2, systolicBp: 134, medicationCount: 3 }
    ]
  },
  {
    patientId: 'PT-003',
    name: 'Harold Jenkins (Synthetic Cohort)',
    demographics: {
      age: 71,
      gender: 'Male',
      weightKg: 84,
      heightCm: 172,
      bmi: 28.4,
      ethnicity: 'African American'
    },
    conditions: [
      { id: 'c3_1', name: 'Heart Failure with Reduced Ejection Fraction (HFrEF - NYHA III)', icd10: 'I50.22', severity: 'severe', diagnosedDate: '2020-04-18', status: 'active' },
      { id: 'c3_2', name: 'Chronic Kidney Disease (Stage 3b)', icd10: 'N18.32', severity: 'severe', diagnosedDate: '2021-02-11', status: 'active' },
      { id: 'c3_3', name: 'Atrial Fibrillation (Paroxysmal)', icd10: 'I48.0', severity: 'moderate', diagnosedDate: '2019-10-05', status: 'active' },
      { id: 'c3_4', name: 'Gout', icd10: 'M10.9', severity: 'moderate', diagnosedDate: '2018-07-22', status: 'managed' }
    ],
    allergies: [
      { substance: 'NSAIDs (Ibuprofen / Naproxen)', reactionType: 'Acute Kidney Injury / Fluid Retention', severity: 'severe' },
      { substance: 'Aspirin', reactionType: 'Bronchospasm', severity: 'moderate' }
    ],
    labs: {
      eGFR: { name: 'eGFR (CKD-EPI)', value: 36, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'critical', trend: 'decreasing' },
      serumCreatinine: { name: 'Serum Creatinine', value: 2.15, unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'critical', trend: 'increasing' },
      bnp: { name: 'NT-proBNP', value: 1480, unit: 'pg/mL', referenceRange: '< 125', status: 'critical', trend: 'elevated' },
      potassium: { name: 'Serum Potassium (K+)', value: 5.1, unit: 'mEq/L', referenceRange: '3.5 - 5.0', status: 'elevated', trend: 'increasing' },
      uricAcid: { name: 'Serum Uric Acid', value: 8.9, unit: 'mg/dL', referenceRange: '3.5 - 7.2', status: 'elevated', trend: 'stable' },
      inr: { name: 'INR', value: 2.4, unit: 'ratio', referenceRange: '2.0 - 3.0', status: 'normal', trend: 'stable' }
    },
    organFunction: {
      renalScore: 42,
      eGFR: 36,
      serumCreatinine: 2.15,
      hepaticScore: 82,
      alt: 22,
      ast: 26,
      bilirubin: 1.1,
      cardiacScore: 46,
      lvef: 34,
      bnp: 1480,
      metabolicScore: 68,
      hba1c: 6.4,
      fastingGlucose: 110,
      vascularScore: 58,
      systolicBp: 118,
      diastolicBp: 74
    },
    genomics: [
      { gene: 'VKORC1', phenotype: 'High Warfarin Sensitivity', diplotype: '-1639G>A', clinicalSignificance: 'Lower initial and maintenance Warfarin dosing requirement' },
      { gene: 'CYP2C9', phenotype: 'Poor Metabolizer', diplotype: '3/3', clinicalSignificance: 'Extremely prolonged half-life of S-warfarin; high bleeding vulnerability' }
    ],
    genomicProfile: {
      sequencingTechnology: 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq 6000)',
      panelVersion: 'PGx-Clinical-Core v4.2',
      sampleDate: '2024-09-18',
      labAccreditation: 'CLIA / CAP Accredited',
      dnaExtractionYield: '99.9% Call Rate',
      markers: [
        {
          gene: 'CYP2C9',
          diplotype: '*3/*3',
          rsId: 'rs1057910 (c.1075A>C)',
          phenotype: 'Poor Metabolizer (Homozygous Variant)',
          metabolizerCategory: 'poor',
          activityScore: 0.0,
          affectedDrugClasses: ['Warfarin', 'Sulfonylureas (Glimepiride/Glipizide)', 'ARBs (Losartan)', 'NSAIDs (Celecoxib)'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C9 Monooxygenase',
          clinicalSummary: 'Near-zero CYP2C9 enzyme activity. S-warfarin clearance reduced by ~90%, creating extreme bleeding risk. Losartan active metabolite conversion impaired; sulfonylurea clearance severely blunted.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Impaired Clearance (Toxicity Risk)'
        },
        {
          gene: 'VKORC1',
          diplotype: '-1639G>A (A/A)',
          rsId: 'rs9923231',
          phenotype: 'High Warfarin Sensitivity (Homozygous A/A)',
          metabolizerCategory: 'high-risk',
          affectedDrugClasses: ['Vitamin K Antagonists (Warfarin)'],
          impactedEnzymesOrTransporters: 'Vitamin K Epoxide Reductase Complex Subunit 1',
          clinicalSummary: 'Homozygous A/A genotype results in low target enzyme expression. Synergizes with CYP2C9 *3/*3 to require >70% dose reduction for Warfarin (or DOAC preference).',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Impaired Clearance (Toxicity Risk)'
        },
        {
          gene: 'CYP2D6',
          diplotype: '*1/*4',
          rsId: 'rs3892097 (1846G>A)',
          phenotype: 'Intermediate Metabolizer',
          metabolizerCategory: 'intermediate',
          activityScore: 1.0,
          affectedDrugClasses: ['Beta-Blockers (Carvedilol, Metoprolol)', 'Antiarrhythmics', 'Opioids'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2D6',
          clinicalSummary: 'One null allele (*4) causes ~50% reduced clearance of carvedilol and metoprolol; monitor heart rate for excessive bradycardia.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Impaired Clearance (Toxicity Risk)'
        },
        {
          gene: 'HLA-B',
          diplotype: '*58:01 (Negative)',
          rsId: 'HLA-B*58:01',
          phenotype: 'Low Risk of Allopurinol SCAR / DRESS',
          metabolizerCategory: 'normal',
          affectedDrugClasses: ['Allopurinol'],
          impactedEnzymesOrTransporters: 'Major Histocompatibility Complex Class I Antigen',
          clinicalSummary: 'Negative for HLA-B*58:01 allele; standard risk profile for allopurinol-induced severe cutaneous adverse reactions.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Normal Baseline Metabolism'
        }
      ],
      primaryMetabolizerSummary: {
        poorMetabolizersCount: 1,
        intermediateCount: 1,
        ultraRapidCount: 0,
        normalCount: 2
      },
      highRiskDrugsToAvoid: ['Warfarin (Coumadin) - Extreme Bleeding Risk', 'High-Dose Sulfonylureas'],
      doseAdjustmentRecommended: ['Carvedilol (titrate carefully)', 'Apixaban/DOAC preferred over Warfarin']
    },
    currentMedications: [
      {
        id: 'med_sacubitril_valsartan',
        name: 'Sacubitril/Valsartan',
        brandName: 'Entresto',
        category: 'ARNI (Angiotensin Receptor-Neprilysin Inhibitor)',
        dosage: '24/26 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['Sacubitril via esterases', 'Valsartan minimal CYP'],
        primaryTargets: ['Neprilysin', 'AT1 Receptor'],
        halfLifeHours: 11.5,
        contraindications: ['Concurrent ACE inhibitors (must maintain 36hr washout)', 'History of angioedema'],
        commonAdrs: ['Hypotension', 'Hyperkalemia', 'Worsening renal function'],
        predictedEffectiveness: 89,
        adrRiskScore: 32,
        interactionRiskScore: 38,
        suitabilityScore: 78,
        mechanismSummary: 'Dual neprilysin inhibition increases vasoactive peptides while blocking AT1 vasoconstriction.'
      },
      {
        id: 'med_carvedilol',
        name: 'Carvedilol',
        brandName: 'Coreg',
        category: 'Non-selective Beta-Blocker / Alpha-1 Blocker',
        dosage: '12.5 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['CYP2D6', 'CYP2C9'],
        primaryTargets: ['Beta-1', 'Beta-2', 'Alpha-1 Adrenergic Receptors'],
        halfLifeHours: 7.0,
        contraindications: ['Severe bradycardia', 'Decompensated acute heart failure', 'Severe asthma'],
        commonAdrs: ['Bradycardia', 'Orthostatic hypotension', 'Fatigue'],
        predictedEffectiveness: 85,
        adrRiskScore: 24,
        interactionRiskScore: 29,
        suitabilityScore: 82,
        mechanismSummary: 'Reduces sympathetic tone, myocardial oxygen demand, and afterload.'
      },
      {
        id: 'med_furosemide',
        name: 'Furosemide',
        brandName: 'Lasix',
        category: 'Loop Diuretic',
        dosage: '40 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['Renal tubular secretion (65%)', 'Hepatic glucuronidation'],
        primaryTargets: ['Na-K-2Cl symporter (NKCC2) in Henle Loop'],
        halfLifeHours: 2.0,
        contraindications: ['Anuria', 'Severe electrolyte depletion'],
        commonAdrs: ['Hypokalemia', 'Prerenal azotemia', 'Hyperuricemia (triggers gout)', 'Ototoxicity'],
        predictedEffectiveness: 91,
        adrRiskScore: 28,
        interactionRiskScore: 34,
        suitabilityScore: 84,
        mechanismSummary: 'Inhibits sodium and chloride reabsorption in ascending loop of Henle, promoting diuresis.'
      },
      {
        id: 'med_apixaban',
        name: 'Apixaban',
        brandName: 'Eliquis',
        category: 'Direct Oral Anticoagulant (DOAC)',
        dosage: '2.5 mg (renally adjusted)',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['CYP3A4', 'Renal excretion (27%)', 'Biliary/Intestinal'],
        primaryTargets: ['Factor Xa'],
        halfLifeHours: 12.0,
        contraindications: ['Active pathological bleeding', 'Severe hepatic disease'],
        commonAdrs: ['Major bleeding', 'Hematuria', 'GI hemorrhage'],
        predictedEffectiveness: 88,
        adrRiskScore: 26,
        interactionRiskScore: 31,
        suitabilityScore: 86,
        mechanismSummary: 'Directly and reversibly inhibits free and clot-bound Factor Xa.'
      },
      {
        id: 'med_allopurinol',
        name: 'Allopurinol',
        brandName: 'Zyloprim',
        category: 'Xanthine Oxidase Inhibitor',
        dosage: '100 mg (renally adjusted)',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['Oxidized to active oxypurinol; renal excretion'],
        primaryTargets: ['Xanthine Oxidase'],
        halfLifeHours: 15.0,
        contraindications: ['HLA-B 5801 positivity (high risk SCAR/DRESS)'],
        commonAdrs: ['Maculopapular rash', 'Hepatotoxicity', 'Hypersensitivity syndrome'],
        predictedEffectiveness: 78,
        adrRiskScore: 19,
        interactionRiskScore: 22,
        suitabilityScore: 80,
        mechanismSummary: 'Inhibits xanthine oxidase, decreasing uric acid synthesis.'
      }
    ],
    dosageToleranceThresholds: [
      {
        medicationName: 'Allopurinol',
        maxDailyDoseMg: 100,
        unit: 'mg',
        sourceReason: 'Severe CKD 3b (eGFR: 36 mL/min)',
        limitingFactor: 'renal_clearance',
        historicalReaction: 'Serum oxypurinol accumulation with transaminitis at 200mg/day',
        guidelineReference: 'ACR Gout Guidelines: Initial dose 50-100mg/day in CKD stage ≥3'
      },
      {
        medicationName: 'Carvedilol',
        maxDailyDoseMg: 25,
        unit: 'mg',
        sourceReason: 'CYP2D6 *1/*4 Intermediate Metabolizer + Baseline HR 58 bpm',
        limitingFactor: 'cardiac_conduction',
        historicalReaction: 'Symptomatic bradycardia (HR 44 bpm, dizziness) at 25mg BID',
        guidelineReference: 'CPIC Guideline for Beta-Blockers and CYP2D6'
      },
      {
        medicationName: 'Sacubitril/Valsartan',
        maxDailyDoseMg: 100,
        unit: 'mg',
        sourceReason: 'Borderline baseline BP (118/74 mmHg) and eGFR 36 mL/min',
        limitingFactor: 'renal_clearance',
        historicalReaction: 'Orthostatic hypotension (standing SBP 88 mmHg) when attempting 49/51 mg BID titration',
        guidelineReference: 'ACC/AHA HF Guidelines: Renal and BP titration ceilings'
      },
      {
        medicationName: 'Spironolactone',
        maxDailyDoseMg: 12.5,
        unit: 'mg',
        sourceReason: 'Severe hyperkalemia vulnerability (baseline K+ 5.1 mEq/L, eGFR 36)',
        limitingFactor: 'renal_clearance',
        historicalReaction: 'Serum potassium elevated to 5.8 mEq/L requiring emergency kayexalate',
        guidelineReference: 'KDIGO 2024: MRA caution when eGFR < 45 or K+ > 5.0'
      }
    ],
    treatmentComplexity: 'CRITICAL',
    complexityScore: 92,
    longitudinalHistory: [
      { timestamp: '6 Months Ago', stateName: 'Post-Decompensation Discharge', eGFR: 42, hba1c: 6.2, systolicBp: 126, medicationCount: 4 },
      { timestamp: '3 Months Ago', stateName: 'Dose Optimization Stage', eGFR: 39, hba1c: 6.3, systolicBp: 122, medicationCount: 5 },
      { timestamp: 'Current State', stateName: 'Evaluation State (Pt)', eGFR: 36, hba1c: 6.4, systolicBp: 118, medicationCount: 5 }
    ]
  },
  {
    patientId: 'PT-004',
    name: 'Sophia Martinez (Synthetic Cohort)',
    demographics: {
      age: 55,
      gender: 'Female',
      weightKg: 69,
      heightCm: 162,
      bmi: 26.3,
      ethnicity: 'Hispanic'
    },
    conditions: [
      { id: 'c4_1', name: 'Moderate COPD (GOLD Group B)', icd10: 'J44.9', severity: 'moderate', diagnosedDate: '2021-05-14', status: 'active' },
      { id: 'c4_2', name: 'Hypertension', icd10: 'I10', severity: 'mild', diagnosedDate: '2020-10-19', status: 'managed' },
      { id: 'c4_3', name: 'Osteopenia', icd10: 'M85.80', severity: 'mild', diagnosedDate: '2023-03-08', status: 'managed' }
    ],
    allergies: [],
    labs: {
      fev1: { name: 'FEV1 / FVC Ratio', value: 0.62, unit: 'ratio', referenceRange: '> 0.70', status: 'low', trend: 'stable' },
      eGFR: { name: 'eGFR (CKD-EPI)', value: 84, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'normal', trend: 'stable' },
      potassium: { name: 'Serum Potassium (K+)', value: 4.2, unit: 'mEq/L', referenceRange: '3.5 - 5.0', status: 'normal', trend: 'stable' },
      calcium: { name: 'Serum Calcium', value: 9.2, unit: 'mg/dL', referenceRange: '8.5 - 10.2', status: 'normal', trend: 'stable' }
    },
    organFunction: {
      renalScore: 84,
      eGFR: 84,
      serumCreatinine: 0.92,
      hepaticScore: 90,
      alt: 21,
      ast: 19,
      bilirubin: 0.6,
      cardiacScore: 78,
      lvef: 60,
      bnp: 45,
      metabolicScore: 82,
      hba1c: 5.5,
      fastingGlucose: 94,
      vascularScore: 76,
      systolicBp: 132,
      diastolicBp: 82
    },
    genomics: [
      { gene: 'ADRB2', phenotype: 'Arg16Gly Polymorphism', diplotype: 'Gly16Gly', clinicalSignificance: 'Potential down-regulation of beta-2 agonist bronchodilator response over time' }
    ],
    genomicProfile: {
      sequencingTechnology: 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq 6000)',
      panelVersion: 'PGx-Clinical-Core v4.2',
      sampleDate: '2024-08-10',
      labAccreditation: 'CLIA / CAP Accredited',
      dnaExtractionYield: '99.4% Call Rate',
      markers: [
        {
          gene: 'CYP2C9',
          diplotype: '*1/*1',
          rsId: 'rs1057910 (wt)',
          phenotype: 'Normal Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['ARBs (Losartan)', 'NSAIDs', 'Warfarin'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C9',
          clinicalSummary: 'Normal bioactivation of losartan into its active carboxylic acid metabolite (E-3174).',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        },
        {
          gene: 'ADRB2',
          diplotype: 'Gly16Gly (c.46A>G)',
          rsId: 'rs1042713',
          phenotype: 'Altered Beta-2 Receptor Downregulation',
          metabolizerCategory: 'altered',
          affectedDrugClasses: ['Short/Long-Acting Beta-2 Agonists (Albuterol, Formoterol, Salmeterol)'],
          impactedEnzymesOrTransporters: 'Beta-2 Adrenergic Receptor (ADRB2)',
          clinicalSummary: 'Homozygous Gly16 variant associated with accelerated receptor tachyphylaxis and reduced bronchoprotective response under chronic SABA use. Anticholinergics (LAMAs like Tiotropium) preferred.',
          cpicGuidelineLevel: 'CPIC Level 1B',
          fdaLabelingActionable: true,
          metabolismImpact: 'Altered Hepatic Influx'
        },
        {
          gene: 'CYP2D6',
          diplotype: '*1/*2',
          rsId: 'rs3892097 / rs16947',
          phenotype: 'Normal (Extensive) Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Antitussives (Dextromethorphan)', 'Antidepressants', 'Beta-Blockers'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2D6',
          clinicalSummary: 'Normal drug elimination kinetics across CYP2D6 substrates.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        }
      ],
      primaryMetabolizerSummary: {
        poorMetabolizersCount: 0,
        intermediateCount: 0,
        ultraRapidCount: 0,
        normalCount: 2
      },
      highRiskDrugsToAvoid: ['High-frequency SABA monotherapy (prefer LAMA/LABA combo)'],
      doseAdjustmentRecommended: ['Tiotropium first-line bronchodilator confirmed']
    },
    currentMedications: [
      {
        id: 'med_tiotropium',
        name: 'Tiotropium Bromide',
        brandName: 'Spiriva Respimat',
        category: 'LAMA (Long-Acting Muscarinic Antagonist)',
        dosage: '2.5 mcg (2 puffs)',
        frequency: 'Once daily',
        route: 'Inhalation',
        metabolismPathway: ['Non-enzymatic ester cleavage', 'CYP2D6 / CYP3A4 minor'],
        primaryTargets: ['Muscarinic M3 Receptors'],
        halfLifeHours: 25.0,
        contraindications: ['Hypersensitivity to atropine derivatives', 'Severe narrow-angle glaucoma'],
        commonAdrs: ['Dry mouth', 'Urinary retention', 'Constipation'],
        predictedEffectiveness: 86,
        adrRiskScore: 11,
        interactionRiskScore: 9,
        suitabilityScore: 93,
        mechanismSummary: 'Inhibits M3 receptors on airway smooth muscle, leading to sustained bronchodilation.'
      },
      {
        id: 'med_losartan_s',
        name: 'Losartan',
        brandName: 'Cozaar',
        category: 'ARB',
        dosage: '50 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP2C9', 'CYP3A4'],
        primaryTargets: ['AT1 Receptor'],
        halfLifeHours: 2.0,
        contraindications: ['Pregnancy'],
        commonAdrs: ['Dizziness', 'Hypotension'],
        predictedEffectiveness: 83,
        adrRiskScore: 10,
        interactionRiskScore: 12,
        suitabilityScore: 90,
        mechanismSummary: 'Blocks angiotensin II receptors.'
      }
    ],
    treatmentComplexity: 'MODERATE',
    complexityScore: 48,
    longitudinalHistory: [
      { timestamp: '6 Months Ago', stateName: 'COPD Exacerbation', eGFR: 86, hba1c: 5.4, systolicBp: 136, medicationCount: 2 },
      { timestamp: 'Current State', stateName: 'Stable Maintenance', eGFR: 84, hba1c: 5.5, systolicBp: 132, medicationCount: 2 }
    ]
  },
  {
    patientId: 'PT-005',
    name: 'Devin Thorne (Synthetic Cohort)',
    demographics: {
      age: 64,
      gender: 'Male',
      weightKg: 86,
      heightCm: 175,
      bmi: 28.1,
      ethnicity: 'Caucasian'
    },
    conditions: [
      { id: 'c5_1', name: 'Coronary Artery Disease (s/p DES to LAD 2023)', icd10: 'I25.10', severity: 'severe', diagnosedDate: '2023-02-10', status: 'managed' },
      { id: 'c5_2', name: 'Hypertension', icd10: 'I10', severity: 'moderate', diagnosedDate: '2015-04-12', status: 'managed' },
      { id: 'c5_3', name: 'Gastroesophageal Reflux Disease (GERD)', icd10: 'K21.9', severity: 'mild', diagnosedDate: '2019-08-01', status: 'managed' }
    ],
    allergies: [],
    labs: {
      eGFR: { name: 'eGFR (CKD-EPI)', value: 74, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'normal', trend: 'stable' },
      ldl: { name: 'LDL Cholesterol', value: 68, unit: 'mg/dL', referenceRange: '< 70 (Very High Risk)', status: 'normal', trend: 'decreasing' },
      platelets: { name: 'Platelet Count', value: 220, unit: 'x10^3/uL', referenceRange: '150 - 450', status: 'normal', trend: 'stable' }
    },
    organFunction: {
      renalScore: 78,
      eGFR: 74,
      serumCreatinine: 1.15,
      hepaticScore: 86,
      alt: 28,
      ast: 24,
      bilirubin: 0.8,
      cardiacScore: 70,
      lvef: 52,
      bnp: 110,
      metabolicScore: 80,
      hba1c: 5.7,
      fastingGlucose: 102,
      vascularScore: 68,
      systolicBp: 128,
      diastolicBp: 78
    },
    genomics: [
      { gene: 'CYP2C19', phenotype: 'Loss of Function (2/17 Intermediate)', diplotype: '2/17', clinicalSignificance: 'Caution with Omeprazole + Clopidogrel co-administration due to competitive CYP2C19 inhibition' }
    ],
    genomicProfile: {
      sequencingTechnology: 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq 6000)',
      panelVersion: 'PGx-Clinical-Core v4.2',
      sampleDate: '2024-10-25',
      labAccreditation: 'CLIA / CAP Accredited',
      dnaExtractionYield: '99.7% Call Rate',
      markers: [
        {
          gene: 'CYP2C19',
          diplotype: '*2/*17',
          rsId: 'rs4244285 (*2) / rs12248560 (*17)',
          phenotype: 'Intermediate Metabolizer (*2 Loss + *17 Gain)',
          metabolizerCategory: 'intermediate',
          activityScore: 1.0,
          affectedDrugClasses: ['Antiplatelets (Clopidogrel)', 'Proton Pump Inhibitors (Omeprazole)', 'SSRIs (Escitalopram)'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C19 Monooxygenase',
          clinicalSummary: 'Compound heterozygote (*2 non-functional, *17 increased transcription). Produces intermediate clopidogrel activation and competitive vulnerability when combined with strong CYP2C19 substrate PPIs like omeprazole.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: true,
          metabolismImpact: 'Impaired Clearance (Toxicity Risk)'
        },
        {
          gene: 'CYP2D6',
          diplotype: '*1/*1',
          rsId: 'rs3892097 (wt)',
          phenotype: 'Normal (Extensive) Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Beta-Blockers (Metoprolol Succinate)', 'Antiarrhythmics', 'Analgesics'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2D6',
          clinicalSummary: 'Standard metoprolol elimination rate with predicted normal steady-state plasma concentrations.',
          cpicGuidelineLevel: 'CPIC Level 1A',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        },
        {
          gene: 'CYP3A4',
          diplotype: '*1/*1',
          rsId: 'rs2740574 (wt)',
          phenotype: 'Normal Metabolizer',
          metabolizerCategory: 'normal',
          activityScore: 2.0,
          affectedDrugClasses: ['Statins', 'Antiplatelet secondary pathways', 'CCBs'],
          impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 3A4',
          clinicalSummary: 'Standard substrate transformation kinetics.',
          cpicGuidelineLevel: 'CPIC Level 1B',
          fdaLabelingActionable: false,
          metabolismImpact: 'Normal Baseline Metabolism'
        }
      ],
      primaryMetabolizerSummary: {
        poorMetabolizersCount: 0,
        intermediateCount: 1,
        ultraRapidCount: 0,
        normalCount: 2
      },
      highRiskDrugsToAvoid: ['Omeprazole co-administered with Clopidogrel (switch to Pantoprazole or H2RA)'],
      doseAdjustmentRecommended: ['Monitor platelet aggregation if continuing Omeprazole']
    },
    currentMedications: [
      {
        id: 'med_aspirin',
        name: 'Aspirin',
        brandName: 'Bayer',
        category: 'Antiplatelet',
        dosage: '81 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['Hepatic esterases and conjugation'],
        primaryTargets: ['COX-1 irreversible inhibition'],
        halfLifeHours: 0.5,
        contraindications: ['Active peptic ulcer disease', 'Severe bleeding diathesis'],
        commonAdrs: ['GI bleeding', 'Dyspepsia', 'Bruising'],
        predictedEffectiveness: 88,
        adrRiskScore: 16,
        interactionRiskScore: 24,
        suitabilityScore: 87,
        mechanismSummary: 'Irreversibly acetylates COX-1, preventing thromboxane A2 formation.'
      },
      {
        id: 'med_clopidogrel',
        name: 'Clopidogrel',
        brandName: 'Plavix',
        category: 'P2Y12 Antiplatelet',
        dosage: '75 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP2C19 bioactivation', 'CYP3A4'],
        primaryTargets: ['P2Y12 ADP Platelet Receptor'],
        halfLifeHours: 6.0,
        contraindications: ['Active pathological bleeding'],
        commonAdrs: ['Bleeding', 'Purpura', 'Epistaxis'],
        predictedEffectiveness: 84,
        adrRiskScore: 19,
        interactionRiskScore: 35,
        suitabilityScore: 81,
        mechanismSummary: 'Thienopyridine prodrug selectively inhibiting ADP binding to P2Y12 receptor.'
      },
      {
        id: 'med_omeprazole',
        name: 'Omeprazole',
        brandName: 'Prilosec',
        category: 'Proton Pump Inhibitor (PPI)',
        dosage: '20 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP2C19 competitive inhibitor', 'CYP3A4'],
        primaryTargets: ['H+/K+ ATPase gastric parietal cell pump'],
        halfLifeHours: 1.0,
        contraindications: ['Concomitant rilpivirine'],
        commonAdrs: ['Hypomagnesemia', 'Reduced B12 absorption', 'Risk of C. diff colitis'],
        predictedEffectiveness: 92,
        adrRiskScore: 14,
        interactionRiskScore: 42,
        suitabilityScore: 74,
        mechanismSummary: 'Suppresses gastric basal and stimulated acid secretion.'
      },
      {
        id: 'med_metoprolol_succinate',
        name: 'Metoprolol Succinate',
        brandName: 'Toprol XL',
        category: 'Cardioselective Beta-Blocker',
        dosage: '50 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['CYP2D6 hepatic oxidation (80%)'],
        primaryTargets: ['Beta-1 Adrenergic Receptors'],
        halfLifeHours: 7.0,
        contraindications: ['2nd or 3rd degree AV block', 'Severe sinus bradycardia'],
        commonAdrs: ['Bradycardia', 'Fatigue', 'Dizziness'],
        predictedEffectiveness: 89,
        adrRiskScore: 15,
        interactionRiskScore: 18,
        suitabilityScore: 88,
        mechanismSummary: 'Competitively blocks beta-1 adrenergic receptors, reducing myocardial workload.'
      }
    ],
    dosageToleranceThresholds: [
      {
        medicationName: 'Metoprolol Succinate',
        maxDailyDoseMg: 50,
        unit: 'mg',
        sourceReason: 'Resting Heart Rate (56 bpm) & Post-DES Stent Maintenance',
        limitingFactor: 'cardiac_conduction',
        historicalReaction: 'Excessive sinus bradycardia (HR 46 bpm) at 100mg/day',
        guidelineReference: 'ACC/AHA Secondary Prevention CAD Guidelines'
      },
      {
        medicationName: 'Clopidogrel',
        maxDailyDoseMg: 75,
        unit: 'mg',
        sourceReason: 'CYP2C19 *2/*17 Intermediate Bioactivation',
        limitingFactor: 'pharmacogenomic_variant',
        historicalReaction: 'Platelet inhibition variability; do not escalate dose without genotype-guided P2Y12 switch',
        guidelineReference: 'CPIC Guideline for Clopidogrel and CYP2C19'
      }
    ],
    treatmentComplexity: 'HIGH',
    complexityScore: 74,
    longitudinalHistory: [
      { timestamp: '1 Year Ago', stateName: 'Post-PCI Stent Placement', eGFR: 78, hba1c: 5.6, systolicBp: 134, medicationCount: 4 },
      { timestamp: 'Current State', stateName: 'Evaluation State (Pt)', eGFR: 74, hba1c: 5.7, systolicBp: 128, medicationCount: 4 }
    ]
  },
  {
    patientId: 'PT-006',
    name: 'Amina Al-Mansoor (Synthetic Cohort)',
    demographics: {
      age: 39,
      gender: 'Female',
      weightKg: 62,
      heightCm: 168,
      bmi: 22.0,
      ethnicity: 'Middle Eastern'
    },
    conditions: [
      { id: 'c6_1', name: 'Rheumatoid Arthritis (Seropositive)', icd10: 'M05.79', severity: 'moderate', diagnosedDate: '2021-08-14', status: 'active' },
      { id: 'c6_2', name: 'Drug-Induced Hepatic Transaminitis (Historical)', icd10: 'K71.8', severity: 'mild', diagnosedDate: '2022-04-10', status: 'managed' }
    ],
    allergies: [
      { substance: 'Methotrexate', reactionType: 'Hepatotoxicity (Grade 3 ALT elevation)', severity: 'severe' }
    ],
    labs: {
      crp: { name: 'C-Reactive Protein (CRP)', value: 18.4, unit: 'mg/L', referenceRange: '< 3.0', status: 'elevated', trend: 'increasing' },
      esr: { name: 'Erythrocyte Sedimentation Rate', value: 42, unit: 'mm/hr', referenceRange: '< 20', status: 'elevated', trend: 'increasing' },
      alt: { name: 'ALT (SGPT)', value: 34, unit: 'U/L', referenceRange: '7 - 35', status: 'normal', trend: 'stable' },
      ast: { name: 'AST (SGOT)', value: 28, unit: 'U/L', referenceRange: '8 - 33', status: 'normal', trend: 'stable' },
      eGFR: { name: 'eGFR (CKD-EPI)', value: 98, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'normal', trend: 'stable' }
    },
    organFunction: {
      renalScore: 96,
      eGFR: 98,
      serumCreatinine: 0.78,
      hepaticScore: 78,
      alt: 34,
      ast: 28,
      bilirubin: 0.6,
      cardiacScore: 92,
      lvef: 64,
      bnp: 20,
      metabolicScore: 90,
      hba1c: 5.1,
      fastingGlucose: 88,
      vascularScore: 90,
      systolicBp: 116,
      diastolicBp: 72
    },
    genomics: [
      { gene: 'TPMT', phenotype: 'Normal Metabolizer', diplotype: '1/1', clinicalSignificance: 'Normal clearance for thiopurines' },
      { gene: 'HLA-DRB1', phenotype: 'Shared Epitope Carrier', diplotype: '04:01', clinicalSignificance: 'Correlated with aggressive erosive RA phenotype' }
    ],
    currentMedications: [
      {
        id: 'med_hydroxychloroquine',
        name: 'Hydroxychloroquine',
        brandName: 'Plaquenil',
        category: 'Conventional Synthetic DMARD',
        dosage: '200 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        metabolismPathway: ['CYP2D6', 'CYP3A4', 'Renal excretion (50%)'],
        primaryTargets: ['Endosomal TLR7/9 inhibition', 'Lysosomal pH elevation'],
        halfLifeHours: 960.0,
        contraindications: ['Pre-existing retinal maculopathy'],
        commonAdrs: ['Retinal toxicity (long-term)', 'QT prolongation (rare)', 'Nausea'],
        predictedEffectiveness: 72,
        adrRiskScore: 12,
        interactionRiskScore: 16,
        suitabilityScore: 89,
        mechanismSummary: 'Raises lysosomal pH in antigen presenting cells, dampening autoimmune response.'
      },
      {
        id: 'med_folic_acid',
        name: 'Folic Acid',
        brandName: 'Folvite',
        category: 'Vitamin Supplement',
        dosage: '1 mg',
        frequency: 'Once daily',
        route: 'Oral',
        metabolismPathway: ['Hepatic reduction via DHFR'],
        primaryTargets: ['Folate receptors'],
        halfLifeHours: 3.0,
        contraindications: ['Undiagnosed megaloblastic anemia (masks B12 deficiency)'],
        commonAdrs: ['Rare gastrointestinal upset'],
        predictedEffectiveness: 95,
        adrRiskScore: 2,
        interactionRiskScore: 3,
        suitabilityScore: 98,
        mechanismSummary: 'Essential co-factor for nucleotide synthesis and cellular metabolism.'
      }
    ],
    dosageToleranceThresholds: [
      {
        medicationName: 'Hydroxychloroquine',
        maxDailyDoseMg: 400,
        unit: 'mg',
        sourceReason: 'Weight-based Retinal Toxicity Ceiling (62 kg body weight)',
        limitingFactor: 'adverse_event_history',
        historicalReaction: 'Retinal pigmentary alterations avoided by capping at ≤5 mg/kg/day (<310-400 mg daily)',
        guidelineReference: 'American Academy of Ophthalmology (AAO) Retinopathy Screening Guidelines'
      },
      {
        medicationName: 'Methotrexate',
        maxDailyDoseMg: 0,
        unit: 'mg',
        sourceReason: 'Prior Grade 3 Transaminitis / Hepatotoxicity',
        limitingFactor: 'hepatic_metabolism',
        historicalReaction: 'Severe ALT rise to 185 U/L in 2022 upon escalating to 15mg weekly',
        guidelineReference: 'ACR Rheumatoid Arthritis Absolute Contraindication after severe DILI'
      }
    ],
    treatmentComplexity: 'MODERATE',
    complexityScore: 58,
    longitudinalHistory: [
      { timestamp: '6 Months Ago', stateName: 'Flare & Methotrexate Cessation', eGFR: 100, hba1c: 5.0, systolicBp: 118, medicationCount: 3 },
      { timestamp: 'Current State', stateName: 'Evaluation State (Pt)', eGFR: 98, hba1c: 5.1, systolicBp: 116, medicationCount: 2 }
    ]
  }
];

export const CANDIDATE_MEDICATIONS: Medication[] = [
  {
    id: 'cand_empagliflozin',
    name: 'Empagliflozin',
    brandName: 'Jardiance',
    category: 'SGLT2 Inhibitor',
    dosage: '10 mg',
    frequency: 'Once daily',
    route: 'Oral',
    metabolismPathway: ['UGT2B7', 'UGT1A3', 'UGT1A8 glucuronidation'],
    primaryTargets: ['SGLT2 (Sodium-Glucose Co-transporter 2) in proximal tubule'],
    halfLifeHours: 12.4,
    contraindications: ['Dialysis / End-stage renal disease (eGFR < 20 for initiation)', 'History of euglycemic DKA'],
    commonAdrs: ['Genital mycotic infections', 'Volume depletion / orthostasis', 'Urinary tract infection', 'Rare euglycemic DKA'],
    predictedEffectiveness: 89,
    adrRiskScore: 15,
    interactionRiskScore: 12,
    suitabilityScore: 92,
    mechanismSummary: 'Inhibits SGLT2 in renal proximal convoluted tubules, reducing glucose reabsorption and providing nephro/cardioprotection.'
  },
  {
    id: 'cand_semaglutide',
    name: 'Semaglutide',
    brandName: 'Ozempic / Rybelsus',
    category: 'GLP-1 Receptor Agonist',
    dosage: '0.5 mg',
    frequency: 'Once weekly subcutaneous (or 7mg daily oral)',
    route: 'Subcutaneous / Oral',
    metabolismPathway: ['Proteolytic cleavage of peptide backbone', 'Beta-oxidation of fatty acid sidechain'],
    primaryTargets: ['GLP-1 (Glucagon-Like Peptide-1) Receptors'],
    halfLifeHours: 168.0,
    contraindications: ['Personal or family history of Medullary Thyroid Carcinoma (MTC)', 'Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)'],
    commonAdrs: ['Nausea', 'Vomiting', 'Diarrhea', 'Delayed gastric emptying', 'Rare pancreatitis'],
    predictedEffectiveness: 93,
    adrRiskScore: 19,
    interactionRiskScore: 14,
    suitabilityScore: 94,
    mechanismSummary: 'Potentiates glucose-dependent insulin secretion, suppresses glucagon, delays gastric emptying, and reduces cardiovascular events.'
  },
  {
    id: 'cand_spironolactone',
    name: 'Spironolactone',
    brandName: 'Aldactone',
    category: 'Mineralocorticoid Receptor Antagonist (MRA)',
    dosage: '25 mg',
    frequency: 'Once daily',
    route: 'Oral',
    metabolismPathway: ['Hepatic conversion to canrenone and 7-alpha-thiomethylspironolactone'],
    primaryTargets: ['Mineralocorticoid (Aldosterone) Receptors'],
    halfLifeHours: 13.8,
    contraindications: ['Serum potassium > 5.0 mEq/L', 'Severe renal impairment (eGFR < 30)', 'Addison disease'],
    commonAdrs: ['Hyperkalemia', 'Gynecomastia / Breast tenderness', 'Acute kidney injury in volume depletion'],
    predictedEffectiveness: 84,
    adrRiskScore: 31,
    interactionRiskScore: 36,
    suitabilityScore: 71,
    mechanismSummary: 'Competitive aldosterone antagonist in distal renal tubules promoting sodium excretion and potassium retention.'
  },
  {
    id: 'cand_finerenone',
    name: 'Finerenone',
    brandName: 'Kerendia',
    category: 'Non-Steroidal Selective MRA',
    dosage: '10 mg',
    frequency: 'Once daily',
    route: 'Oral',
    metabolismPathway: ['CYP3A4 (90%)', 'CYP2C8 (10%)'],
    primaryTargets: ['Non-steroidal Mineralocorticoid Receptors'],
    halfLifeHours: 2.5,
    contraindications: ['Strong CYP3A4 inhibitors', 'Adrenal insufficiency', 'Serum K+ > 5.0 mEq/L'],
    commonAdrs: ['Hyperkalemia', 'Hypotension', 'Hyponatremia'],
    predictedEffectiveness: 87,
    adrRiskScore: 21,
    interactionRiskScore: 26,
    suitabilityScore: 88,
    mechanismSummary: 'Selectively blocks mineralocorticoid receptor overactivation, halting renal fibrosis and progression of CKD in T2D.'
  },
  {
    id: 'cand_glipizide',
    name: 'Glipizide',
    brandName: 'Glucotrol XL',
    category: 'Second-Generation Sulfonylurea',
    dosage: '5 mg',
    frequency: 'Once daily with breakfast',
    route: 'Oral',
    metabolismPathway: ['CYP2C9 hepatic metabolism (90%)'],
    primaryTargets: ['SUR1 (Sulfonylurea Receptor 1) on Pancreatic Beta Cells'],
    halfLifeHours: 4.0,
    contraindications: ['Severe sulfa allergy', 'Type 1 diabetes', 'Diabetic ketoacidosis'],
    commonAdrs: ['Hypoglycemia', 'Weight gain', 'Elevated cardiovascular risk in high-risk subsets'],
    predictedEffectiveness: 75,
    adrRiskScore: 29,
    interactionRiskScore: 28,
    suitabilityScore: 66,
    mechanismSummary: 'Stimulates insulin release from pancreatic beta cells by closing ATP-sensitive potassium channels.'
  },
  {
    id: 'cand_dapagliflozin',
    name: 'Dapagliflozin',
    brandName: 'Farxiga',
    category: 'SGLT2 Inhibitor',
    dosage: '10 mg',
    frequency: 'Once daily',
    route: 'Oral',
    metabolismPathway: ['UGT1A9 glucuronidation (primary)'],
    primaryTargets: ['SGLT2 (Renal proximal tubule)'],
    halfLifeHours: 12.9,
    contraindications: ['Hypersensitivity', 'End-stage renal disease on dialysis'],
    commonAdrs: ['Mycotic genital infections', 'Mild osmotic diuresis', 'Ketoacidosis risk in prolonged fasting'],
    predictedEffectiveness: 88,
    adrRiskScore: 14,
    interactionRiskScore: 11,
    suitabilityScore: 91,
    mechanismSummary: 'Reduces renal glucose reabsorption, lowering intraglomerular pressure and reducing heart failure hospitalizations.'
  },
  {
    id: 'cand_adifur',
    name: 'Adalimumab',
    brandName: 'Humira',
    category: 'Anti-TNF Alpha Monoclonal Antibody',
    dosage: '40 mg',
    frequency: 'Every 2 weeks subcutaneous',
    route: 'Subcutaneous',
    metabolismPathway: ['Reticuloendothelial system clearance / pinocytosis'],
    primaryTargets: ['Tumor Necrosis Factor Alpha (TNF-α)'],
    halfLifeHours: 336.0, // 14 days
    contraindications: ['Active tuberculosis or severe untreated opportunistic infection', 'Moderate-to-severe HF (NYHA III/IV)'],
    commonAdrs: ['Injection site reactions', 'Infection risk', 'Reactivation of latent HBV/TB', 'Cytopenias'],
    predictedEffectiveness: 86,
    adrRiskScore: 22,
    interactionRiskScore: 15,
    suitabilityScore: 87,
    mechanismSummary: 'Recombinant human IgG1 monoclonal antibody neutralizing soluble and transmembrane TNF-alpha.'
  },
  {
    id: 'cand_pantoprazole',
    name: 'Pantoprazole',
    brandName: 'Protonix',
    category: 'Proton Pump Inhibitor (PPI)',
    dosage: '40 mg',
    frequency: 'Once daily',
    route: 'Oral',
    metabolismPathway: ['CYP2C19 (minor inhibitor compared to Omeprazole)', 'CYP3A4'],
    primaryTargets: ['H+/K+ ATPase gastric proton pump'],
    halfLifeHours: 1.5,
    contraindications: ['Hypersensitivity to substituted benzimidazoles'],
    commonAdrs: ['Diarrhea', 'Headache', 'Low magnesium with prolonged multi-year use'],
    predictedEffectiveness: 91,
    adrRiskScore: 10,
    interactionRiskScore: 12,
    suitabilityScore: 93,
    mechanismSummary: 'Suppresses gastric acid with minimal competitive inhibition of CYP2C19 relative to other PPIs.'
  }
];

export const KNOWN_DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    id: 'ddi_1',
    drugA: 'Lisinopril',
    drugB: 'Spironolactone',
    severity: 'high',
    mechanism: 'Additive potassium retention via dual aldosterone suppression',
    clinicalEffect: 'Severe hyperkalemia (K+ > 5.5 mEq/L) triggering cardiac arrhythmias and acute renal decompensation',
    managementRecommendation: 'If co-administered, mandatory baseline and 1-week serum potassium & creatinine monitoring. Consider non-steroidal MRA or potassium binder.',
    evidenceConfidence: 0.96,
    pathwayOverlap: ['Renal potassium clearance', 'Renin-Angiotensin-Aldosterone System (RAAS)']
  },
  {
    id: 'ddi_2',
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'high',
    mechanism: 'Competitive CYP2C19 enzyme inhibition blocking prodrug bioactivation',
    clinicalEffect: 'Reduced generation of active clopidogrel thiol metabolite, increasing risk of stent thrombosis and secondary ischemic events by ~30%',
    managementRecommendation: 'Switch Omeprazole to Pantoprazole (significantly less CYP2C19 inhibitory affinity) or Famotidine (H2 blocker).',
    evidenceConfidence: 0.94,
    pathwayOverlap: ['CYP2C19 hepatic biotransformation']
  },
  {
    id: 'ddi_3',
    drugA: 'Metformin',
    drugB: 'Iodinated Radiocontrast / Severe CKD',
    severity: 'high',
    mechanism: 'Renal clearance reduction leading to systemic biguanide accumulation',
    clinicalEffect: 'Severe metabolic lactic acidosis due to anaerobic cellular respiration shift',
    managementRecommendation: 'Withhold Metformin 48 hours prior to intravascular contrast procedures and in patients with eGFR < 30 mL/min.',
    evidenceConfidence: 0.98,
    pathwayOverlap: ['OCT2 transporter', 'Renal tubular excretion']
  },
  {
    id: 'ddi_4',
    drugA: 'Atorvastatin',
    drugB: 'CYP3A4 Inhibitors (e.g., Clarithromycin, Ketoconazole, Amlodipine high dose)',
    severity: 'moderate',
    mechanism: 'Decreased first-pass and hepatic clearance of Atorvastatin via CYP3A4 pathway',
    clinicalEffect: 'Elevated plasma statin AUC, increasing myotoxicity, myalgia, and risk of rhabdomyolysis',
    managementRecommendation: 'Limit Atorvastatin to 20mg daily when combined with Amlodipine, or switch to Rosuvastatin / Pravastatin (non-CYP3A4 metabolized).',
    evidenceConfidence: 0.91,
    pathwayOverlap: ['CYP3A4 oxidation', 'SLCO1B1 transport']
  },
  {
    id: 'ddi_5',
    drugA: 'Sacubitril/Valsartan',
    drugB: 'Lisinopril / ACE Inhibitors',
    severity: 'contraindicated',
    mechanism: 'Simultaneous inhibition of neprilysin and ACE bradykinin degradation',
    clinicalEffect: 'Dramatic surge in bradykinin levels triggering life-threatening oropharyngeal angioedema',
    managementRecommendation: 'Strict contraindication: requires a minimum 36-hour washout period when transitioning from an ACEi to Entresto.',
    evidenceConfidence: 0.99,
    pathwayOverlap: ['Bradykinin metabolic cascade', 'Renin-Angiotensin System']
  },
  {
    id: 'ddi_6',
    drugA: 'Furosemide',
    drugB: 'Lisinopril / SGLT2i',
    severity: 'moderate',
    mechanism: 'Synergistic natriuresis and intravascular volume contraction',
    clinicalEffect: 'Prerenal azotemia, orthostatic hypotension, and transient eGFR dip',
    managementRecommendation: 'Monitor volume status. Consider temporary 25-50% loop diuretic dose reduction upon SGLT2i or ACEi initiation.',
    evidenceConfidence: 0.89,
    pathwayOverlap: ['Renal hemodynamics', 'Intravascular volume regulation']
  }
];

export const AI_MODELS_METRICS: AiModelMetric[] = [
  {
    id: 'm1',
    name: 'ResponseNet-v3.4 (NVIDIA RAPIDS/XGBoost)',
    type: 'ML/XGBoost',
    purpose: 'Predicts personalized therapeutic efficacy based on structured clinical & genomic features',
    backend: 'NVIDIA CUDA / PyTorch',
    auroc: 0.914,
    f1Score: 0.868,
    precision: 0.882,
    recall: 0.855,
    calibrationEce: 0.038,
    inferenceLatencyMs: 4.2,
    status: 'READY',
    version: 'v3.4.1-cuda12',
    trainingSamples: '142,500 patient cohort records'
  },
  {
    id: 'm2',
    name: 'ADRNet-Ensemble (Deep Multi-Task Head)',
    type: 'Deep Learning',
    purpose: 'Estimates conditional probability of adverse drug reactions across organ systems',
    backend: 'NVIDIA CUDA / PyTorch',
    auroc: 0.892,
    f1Score: 0.841,
    precision: 0.856,
    recall: 0.828,
    calibrationEce: 0.042,
    inferenceLatencyMs: 6.8,
    status: 'READY',
    version: 'v2.8.0-torch2.3',
    trainingSamples: '210,000 adverse reaction event pairs'
  },
  {
    id: 'm3',
    name: 'PharmaGNN-Hetero (Heterogeneous Graph Attention)',
    type: 'GNN',
    purpose: 'Discovers multi-hop Drug-Target-Enzyme-Disease interaction risks via Link Prediction',
    backend: 'NVIDIA RAPIDS / cuGraph',
    auroc: 0.938,
    f1Score: 0.902,
    precision: 0.918,
    recall: 0.887,
    calibrationEce: 0.029,
    inferenceLatencyMs: 11.4,
    status: 'ACTIVE',
    version: 'v4.1.0-cugraph',
    trainingSamples: '1.8M biomedical graph edges / 34k nodes'
  },
  {
    id: 'm4',
    name: 'TemporalTwin-Transformer',
    type: 'Temporal Transformer',
    purpose: 'Models longitudinal clinical trajectory and simulates future physiological state transitions Pt -> Pt+1',
    backend: 'NVIDIA CUDA / PyTorch',
    auroc: 0.885,
    f1Score: 0.835,
    precision: 0.849,
    recall: 0.822,
    calibrationEce: 0.046,
    inferenceLatencyMs: 14.1,
    status: 'READY',
    version: 'v2.1.2-temporal',
    trainingSamples: '68,000 multi-visit longitudinal trajectories'
  },
  {
    id: 'm5',
    name: 'Gemini 3.7 Flash Clinical Reasoning Orchestrator',
    type: 'LLM',
    purpose: 'Multi-modal tool invocation, conversational clinical translation, and XAI synthesis',
    backend: 'Google AI',
    auroc: 0.962,
    f1Score: 0.948,
    precision: 0.955,
    recall: 0.942,
    calibrationEce: 0.021,
    inferenceLatencyMs: 320.0,
    status: 'ONLINE',
    version: 'gemini-3.7-flash',
    trainingSamples: 'Multi-modal medical & pharmacological corpus'
  },
  {
    id: 'm6',
    name: 'Q-Optimizer (Hybrid QUBO & QAOA Simulator)',
    type: 'Hybrid QUBO',
    purpose: 'Solves constrained multi-objective combinatorial treatment selection in polynomial time',
    backend: 'Cirq Hybrid Simulator',
    auroc: 0.945,
    f1Score: 0.926,
    precision: 0.938,
    recall: 0.915,
    calibrationEce: 0.018,
    inferenceLatencyMs: 18.6,
    status: 'EXPERIMENTAL',
    version: 'v1.4-qubo-qaoa',
    trainingSamples: 'Combinatorial state space of 2^N therapy permutations'
  }
];
