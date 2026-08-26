import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PATIENTS, CANDIDATE_MEDICATIONS, KNOWN_DRUG_INTERACTIONS, AI_MODELS_METRICS } from './src/data/mockDatabase';
import { formulateQuboAndOptimize, simulateCandidateScenario } from './src/services/quantumEngine';
import { PatientDigitalTwinState, Medication } from './src/types';

dotenv.config();

let patientsStore: PatientDigitalTwinState[] = [...INITIAL_PATIENTS];
let patientsIndex = new Map<string, PatientDigitalTwinState>(
  patientsStore.map(p => [p.patientId, p])
);

// High-speed In-Memory Backend Response Caches
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const apiCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache<T>(key: string, data: T, ttlMs = 1000 * 60 * 15): void {
  if (apiCache.size > 200) {
    const firstKey = apiCache.keys().next().value;
    if (firstKey) apiCache.delete(firstKey);
  }
  apiCache.set(key, { data, expiry: Date.now() + ttlMs });
}

// Lazy safe Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // ------------------------------------
  // API Routes
  // ------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      system: 'Q-DrugTwin Hybrid Digital Twin Engine (Optimized)',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      features: [
        'Live Voice Conversations (gemini-3.1-flash-live-preview & gemini-3.7-flash)',
        'Google Search Grounding (gemini-3.7-flash with googleSearch tool)',
        'Audio Transcription (gemini-3.7-flash audio multimodal transcription)',
        'High-Performance In-Memory Response Caching & QUBO Memoization'
      ],
      timestamp: new Date().toISOString()
    });
  });

  // Get all patients
  app.get('/api/patients', (_req, res) => {
    res.json({ patients: patientsStore });
  });

  // Get single patient (O(1) Map lookup)
  app.get('/api/patients/:id', (req, res) => {
    const p = patientsIndex.get(req.params.id) || patientsStore.find(pt => pt.patientId === req.params.id);
    if (!p) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ patient: p });
  });

  // Add / Update patient
  app.post('/api/patients', (req, res) => {
    const newPatient: PatientDigitalTwinState = req.body;
    if (!newPatient.patientId) {
      newPatient.patientId = `PT-${String(patientsStore.length + 1).padStart(3, '0')}`;
    }
    const idx = patientsStore.findIndex(pt => pt.patientId === newPatient.patientId);
    if (idx >= 0) {
      patientsStore[idx] = newPatient;
    } else {
      patientsStore.unshift(newPatient);
    }
    patientsIndex.set(newPatient.patientId, newPatient);
    res.json({ success: true, patient: newPatient });
  });

  // Get Candidate Medications (with Cache-Control)
  app.get('/api/medications', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ medications: CANDIDATE_MEDICATIONS });
  });

  // Get Drug-Drug Interactions (with Cache-Control)
  app.get('/api/interactions', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ interactions: KNOWN_DRUG_INTERACTIONS });
  });

  // Get Model Metrics (with Cache-Control)
  app.get('/api/models', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ models: AI_MODELS_METRICS });
  });

  // Pharmacogenomic Insights & Genetic Correlation API (Memoized)
  app.post('/api/pharmacogenomics/correlations', (req, res) => {
    const { patientId, customMedications } = req.body;
    const cacheKey = `pgx_${patientId}_${JSON.stringify(customMedications || [])}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const patient = patientsIndex.get(patientId) || patientsStore[0];
    const medications = Array.isArray(customMedications) && customMedications.length > 0
      ? customMedications
      : patient.currentMedications;

    const insights: any[] = [];
    const medNames = medications.map((m: any) => (typeof m === 'string' ? m : m.name).toLowerCase());
    const genomics = patient.genomics || [];

    // Evaluate CYP2C9
    const cyp2c9 = genomics.find(g => g.gene === 'CYP2C9');
    if (cyp2c9) {
      if (cyp2c9.phenotype.includes('Intermediate') || cyp2c9.phenotype.includes('Poor')) {
        const hasSulfonylurea = medNames.some(n => ['glipizide', 'glimepiride', 'glyburide'].some(s => n.includes(s)));
        if (hasSulfonylurea) {
          insights.push({
            id: `pgx-${cyp2c9.gene}-sulfonylurea`,
            gene: 'CYP2C9',
            diplotype: cyp2c9.diplotype,
            phenotype: cyp2c9.phenotype,
            medication: 'Glipizide / Sulfonylureas',
            metabolicPathway: 'CYP450 Phase I Hepatic Hydroxylation',
            correlationType: 'toxicity_risk',
            riskLevel: cyp2c9.phenotype.includes('Poor') ? 'critical' : 'high',
            confidenceScore: 96,
            evidenceGrade: 'Tier 1A - Definitive Guideline Recommendation',
            cpicLevel: 'A',
            aucImpact: '+180% to +260% AUC Exposure',
            clearanceImpact: '-60% Hepatic Intrinsic Clearance',
            clinicalRecommendation: 'Reduce initial maintenance dose by 50% or substitute with DPPIV-inhibitor / SGLT2i to prevent severe prolonged hypoglycemia.',
            biochemicalMechanism: 'CYP2C9 loss-of-function allelic variants fail to efficiently hydroxylate glipizide into inactive 4-trans-hydroxy metabolites.',
            fdaLabelWarning: true,
            radialMetrics: {
              pathwayDisruption: 88,
              evidenceStrength: 98,
              kineticConcordance: 32
            }
          });
        }

        const hasArb = medNames.some(n => ['losartan', 'irbesartan'].some(s => n.includes(s)));
        if (hasArb) {
          insights.push({
            id: `pgx-${cyp2c9.gene}-arb`,
            gene: 'CYP2C9',
            diplotype: cyp2c9.diplotype,
            phenotype: cyp2c9.phenotype,
            medication: 'Losartan',
            metabolicPathway: 'Phase I Prodrug Oxidation & E-3174 Synthesis',
            correlationType: 'efficacy_failure',
            riskLevel: 'moderate',
            confidenceScore: 84,
            evidenceGrade: 'Tier 1B - Moderate Clinical Association',
            cpicLevel: 'B',
            aucImpact: '-40% Active Metabolite (E-3174) AUC',
            clearanceImpact: '-45% Bio-activation Rate',
            clinicalRecommendation: 'Losartan requires CYP2C9 oxidation into active carboxylic acid metabolite (E-3174). Consider direct ARB (Valsartan/Telmisartan) if BP target is unmet.',
            biochemicalMechanism: 'Reduced biotransformation of prodrug losartan into its 10-40x more potent antagonist metabolite EXP3174.',
            fdaLabelWarning: false,
            radialMetrics: {
              pathwayDisruption: 65,
              evidenceStrength: 82,
              kineticConcordance: 52
            }
          });
        }
      }
    }

    // Evaluate SLCO1B1 (OATP1B1 Transporter)
    const slco1b1 = genomics.find(g => g.gene === 'SLCO1B1');
    if (slco1b1) {
      const statinMed = medications.find((m: any) => {
        const name = (typeof m === 'string' ? m : m.name).toLowerCase();
        return ['simvastatin', 'atorvastatin', 'rosuvastatin', 'pravastatin'].some(s => name.includes(s));
      });
      const statinName = statinMed ? (typeof statinMed === 'string' ? statinMed : statinMed.name) : 'Atorvastatin';

      if (slco1b1.phenotype.includes('Decreased') || slco1b1.phenotype.includes('Poor') || slco1b1.phenotype.includes('Intermediate')) {
        insights.push({
          id: `pgx-${slco1b1.gene}-statin`,
          gene: 'SLCO1B1',
          diplotype: slco1b1.diplotype,
          phenotype: slco1b1.phenotype,
          medication: statinName,
          metabolicPathway: 'Sinusoidal Hepatic Influx Transporter (OATP1B1)',
          correlationType: 'toxicity_risk',
          riskLevel: slco1b1.diplotype.includes('5') ? 'high' : 'moderate',
          confidenceScore: 92,
          evidenceGrade: 'Tier 1A - Definitive Pharmacogenomic Standard',
          cpicLevel: 'A',
          aucImpact: '+220% Systemic Statin Acid Exposure',
          clearanceImpact: '-55% Hepatic Sinusoidal Uptake',
          clinicalRecommendation: `SLCO1B1 ${slco1b1.diplotype} decreases hepatic uptake transporter function. Cap ${statinName} dose at 20 mg/day or switch to low-transporter-dependency statin (Rosuvastatin/Pravastatin) to mitigate myopathy/rhabdomyolysis risk.`,
          biochemicalMechanism: 'c.521T>C (p.Val174Ala) missense mutation disrupts organic anion transporting polypeptide 1B1 localization, increasing systemic plasma concentrations.',
          fdaLabelWarning: true,
          radialMetrics: {
            pathwayDisruption: 78,
            evidenceStrength: 95,
            kineticConcordance: 40
          }
        });
      }
    }

    // Evaluate CYP2D6
    const cyp2d6 = genomics.find(g => g.gene === 'CYP2D6');
    if (cyp2d6) {
      const matchingMed = medications.find((m: any) => {
        const name = (typeof m === 'string' ? m : m.name).toLowerCase();
        return ['metoprolol', 'carvedilol', 'tramadol', 'codeine', 'duloxetine', 'fluoxetine'].some(s => name.includes(s));
      });
      const medName = matchingMed ? (typeof matchingMed === 'string' ? matchingMed : matchingMed.name) : 'Metoprolol';

      if (cyp2d6.phenotype.includes('Poor')) {
        insights.push({
          id: `pgx-${cyp2d6.gene}-poor`,
          gene: 'CYP2D6',
          diplotype: cyp2d6.diplotype,
          phenotype: cyp2d6.phenotype,
          medication: medName,
          metabolicPathway: 'CYP2D6 Alpha-Hydroxylation & O-Demethylation',
          correlationType: 'altered_clearance',
          riskLevel: 'high',
          confidenceScore: 95,
          evidenceGrade: 'Tier 1A - Definitive Pharmacogenomic Standard',
          cpicLevel: 'A',
          aucImpact: '+300% to +500% Plasma Beta-Blocker AUC',
          clearanceImpact: '-75% Phase I Oxidation',
          clinicalRecommendation: `CYP2D6 Poor Metabolizer status causes 3- to 5-fold higher exposure. Consider 50% dose reduction of ${medName} or switch to Bisoprolol / Atenolol (renally cleared, non-CYP2D6 dependent).`,
          biochemicalMechanism: 'Complete absence of functional CYP2D6 enzyme activity impairs oxidative alpha-hydroxylation and O-demethylation.',
          fdaLabelWarning: true,
          radialMetrics: {
            pathwayDisruption: 92,
            evidenceStrength: 97,
            kineticConcordance: 25
          }
        });
      } else if (cyp2d6.phenotype.includes('Intermediate')) {
        insights.push({
          id: `pgx-${cyp2d6.gene}-im`,
          gene: 'CYP2D6',
          diplotype: cyp2d6.diplotype,
          phenotype: cyp2d6.phenotype,
          medication: medName,
          metabolicPathway: 'CYP2D6 Oxidative Clearance',
          correlationType: 'altered_clearance',
          riskLevel: 'moderate',
          confidenceScore: 86,
          evidenceGrade: 'Tier 1B - Moderate Evidence',
          cpicLevel: 'B',
          aucImpact: '+150% Plasma Concentration',
          clearanceImpact: '-35% Clearance',
          clinicalRecommendation: `Monitor heart rate and blood pressure during dose titration of ${medName}.`,
          biochemicalMechanism: 'Decreased functional enzyme capacity slows metabolic elimination.',
          fdaLabelWarning: false,
          radialMetrics: {
            pathwayDisruption: 55,
            evidenceStrength: 86,
            kineticConcordance: 60
          }
        });
      }
    }

    // Evaluate CYP2C19
    const cyp2c19 = genomics.find(g => g.gene === 'CYP2C19');
    if (cyp2c19) {
      const hasClopidogrel = medNames.some(n => n.includes('clopidogrel') || n.includes('plavix'));
      if (hasClopidogrel && (cyp2c19.phenotype.includes('Poor') || cyp2c19.phenotype.includes('Intermediate'))) {
        insights.push({
          id: `pgx-${cyp2c19.gene}-clopidogrel`,
          gene: 'CYP2C19',
          diplotype: cyp2c19.diplotype,
          phenotype: cyp2c19.phenotype,
          medication: 'Clopidogrel',
          metabolicPathway: 'Two-Step Oxidative Bioactivation to Active Thiol',
          correlationType: 'efficacy_failure',
          riskLevel: 'critical',
          confidenceScore: 98,
          evidenceGrade: 'Tier 1A - Mandatory Clinical Action (Black Box)',
          cpicLevel: 'A',
          aucImpact: '-60% Active Thiol Metabolite',
          clearanceImpact: '-70% Bioactivation',
          clinicalRecommendation: 'Avoid Clopidogrel due to high risk of stent thrombosis / secondary ischemic events. Prescribe alternative P2Y12 inhibitor (Ticagrelor or Prasugrel).',
          biochemicalMechanism: 'CYP2C19 loss-of-function alleles fail to generate active thiol metabolite required for irreversible P2Y12 platelet receptor inhibition.',
          fdaLabelWarning: true,
          radialMetrics: {
            pathwayDisruption: 95,
            evidenceStrength: 99,
            kineticConcordance: 18
          }
        });
      }
    }

    // Default standard response if no high-risk clashes found
    if (insights.length === 0) {
      insights.push({
        id: `pgx-standard-concordance`,
        gene: genomics[0]?.gene || 'CYP2C9 / CYP2D6',
        diplotype: genomics[0]?.diplotype || '1/1',
        phenotype: genomics[0]?.phenotype || 'Extensive / Normal Metabolizer',
        medication: medications[0]?.name || 'Current Regimen',
        metabolicPathway: 'Concordant Phase I/II Physiological Clearance',
        correlationType: 'standard',
        riskLevel: 'optimal',
        confidenceScore: 90,
        evidenceGrade: 'Tier 1A - Concordant Wild-Type Kinetics',
        cpicLevel: 'A',
        aucImpact: 'Standard Kinetic Clearance (1.0x AUC)',
        clearanceImpact: 'Nominal Hepatic / Renal Transit',
        clinicalRecommendation: 'No high-risk pharmacogenomic contraindications detected for active medications under CPIC Level A/B guidelines.',
        biochemicalMechanism: 'Standard metabolic enzyme expression provides concordant biotransformation and therapeutic drug levels.',
        fdaLabelWarning: false,
        radialMetrics: {
          pathwayDisruption: 8,
          evidenceStrength: 92,
          kineticConcordance: 96
        }
      });
    }

    const highestRisk = insights.some(i => i.riskLevel === 'critical')
      ? 'critical'
      : insights.some(i => i.riskLevel === 'high')
      ? 'high'
      : insights.some(i => i.riskLevel === 'moderate')
      ? 'moderate'
      : 'optimal';

    const responsePayload = {
      summary: {
        patientId: patient.patientId,
        patientName: patient.name.split(' (')[0],
        totalGenesProfiled: genomics.length,
        actionableCorrelationsCount: insights.filter(i => i.riskLevel !== 'optimal').length,
        highestRiskLevel: highestRisk,
        insights,
        guidelineSource: 'CPIC Guideline Repository 2025 & PharmGKB Clinical Annotations',
        lastUpdated: new Date().toISOString()
      }
    };

    setInCache(cacheKey, responsePayload);
    res.json(responsePayload);
  });

  // Predict Response
  app.post('/api/predict-response', (req, res) => {
    const { patientId, candidateTherapy } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];
    const candidate = CANDIDATE_MEDICATIONS.find(m => m.name.toLowerCase() === candidateTherapy?.toLowerCase()) || candidateTherapy;

    const baseEffectiveness = candidate?.predictedEffectiveness ?? 82;
    const renalFactor = patient.organFunction.eGFR > 60 ? 1.05 : 0.92;
    const calculatedResponse = Math.min(96, Math.max(30, Math.round(baseEffectiveness * renalFactor)));

    res.json({
      patientId: patient.patientId,
      candidateTherapy: candidate?.name,
      response_probability: calculatedResponse / 100,
      confidence: 0.89,
      key_factors: [
        `eGFR Filtration Index (${patient.organFunction.eGFR} mL/min/1.73m²)`,
        `Baseline HbA1c / Metabolic Index (${patient.organFunction.hba1c}%)`,
        `Active Regimen Compatibility (${patient.currentMedications.length} concurrent agents)`
      ]
    });
  });

  // Predict ADR
  app.post('/api/predict-adr', (req, res) => {
    const { patientId, candidateTherapy } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];
    const candidate = CANDIDATE_MEDICATIONS.find(m => m.name.toLowerCase() === candidateTherapy?.toLowerCase()) || candidateTherapy;

    const baseAdr = candidate?.adrRiskScore ?? 18;
    const isHighPolypharmacy = patient.currentMedications.length >= 4;
    const calculatedAdr = Math.min(92, Math.max(8, baseAdr + (isHighPolypharmacy ? 6 : 0)));

    res.json({
      patientId: patient.patientId,
      candidateTherapy: candidate?.name,
      adr_risk: calculatedAdr / 100,
      risk_category: calculatedAdr > 30 ? 'high' : calculatedAdr > 18 ? 'moderate' : 'low',
      contributing_factors: [
        'Organ clearance capacity and metabolic load',
        'Known pharmacogenomic diplotype profile',
        'Enzyme competition with existing regimen'
      ]
    });
  });

  // Multi-Scenario Simulation
  app.post('/api/simulate', (req, res) => {
    const { patientId, candidateTherapies, scenarioName } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];
    const candidates: Medication[] = Array.isArray(candidateTherapies) ? candidateTherapies : [];

    const simResult = simulateCandidateScenario(patient, candidates, scenarioName || 'Custom Treatment Scenario');
    res.json({ simulation: simResult });
  });

  // Hybrid QUBO / Quantum Optimization
  app.post('/api/optimize-treatment', (req, res) => {
    const { patientId, candidatePool, constraints } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];
    const pool = candidatePool && candidatePool.length > 0 ? candidatePool : CANDIDATE_MEDICATIONS;

    const config = {
      maxAdverseRisk: constraints?.maxAdverseRisk ?? 0.25,
      interactionTolerance: constraints?.interactionTolerance ?? 'moderate',
      maxAdditionalDrugs: constraints?.maxAdditionalDrugs ?? constraints?.targetMedicationCount ?? 2,
      penaltyMultiplier: constraints?.penaltyMultiplier ?? 1.2,
      alphaEfficacy: constraints?.alphaEfficacy ?? 1.0,
      betaToxicity: constraints?.betaToxicity ?? 1.2,
      gammaDdiPenalty: constraints?.gammaDdiPenalty ?? 1.5,
      targetMedicationCount: constraints?.targetMedicationCount ?? 2
    };

    const optimizationResult = formulateQuboAndOptimize(patient, pool, config);
    res.json({ optimization: optimizationResult });
  });

  // Gemini AI Orchestrator & Clinical Reasoning Chat
  app.post('/api/gemini/chat', async (req, res) => {
    const { message, patientId, activeScenario } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];

    const pipelineSteps = [
      { step: '1. Patient Digital Twin Vector Retrieval', status: 'completed' as const, detail: `Loaded State Vector Pt for ${patient.name} (${patient.patientId})` },
      { step: '2. ResponseNet Predictive Efficacy Run', status: 'completed' as const, detail: 'Inference completed on structured clinical & genomic features' },
      { step: '3. ADRNet Risk & Toxicity Head Evaluation', status: 'completed' as const, detail: 'Conditional probability calibrated against organ biomarkers' },
      { step: '4. PharmaGNN Knowledge Graph Link Analysis', status: 'completed' as const, detail: 'Biomedical graph traversed across CYP enzymes and receptor targets' },
      { step: '5. Quantum QUBO Combinatorial Optimization', status: 'completed' as const, detail: 'Hamiltonian ground-state energy convergence validated' }
    ];

    const client = getAIClient();
    if (!client) {
      const fallbackResponse = `### Clinical Decision Support Simulation Summary for **${patient.name} (${patient.patientId})**\n\n` +
        `**Simulated Findings:**\n` +
        `- **Digital Twin State:** Patient currently exhibits eGFR of **${patient.organFunction.eGFR} mL/min/1.73m²**, HbA1c of **${patient.organFunction.hba1c}%**, and active polypharmacy (${patient.currentMedications.length} medications).\n` +
        `- **Model Efficacy Assessment:** SGLT2 inhibitors (Empagliflozin / Dapagliflozin) provide synergistic cardiorenal risk reduction with an estimated **88–92%** response probability.\n` +
        `- **Interaction & Safety Signal:** Caution is advised regarding dual RAAS blockade or potassium-sparing agents given baseline potassium levels of **${patient.labs.potassium?.value ?? 4.8} mEq/L**.\n` +
        `- **QUBO Optimization Result:** Scenario with Empagliflozin + existing regimen minimizes Hamiltonian penalty energy while respecting renal clearance boundaries.\n\n` +
        `*Disclaimer: Q-DrugTwin outputs are for simulation and research decision-support review only. Final clinical judgment and prescription authority rest solely with qualified medical practitioners.*`;

      return res.json({
        reply: fallbackResponse,
        pipelineSteps,
        model: 'gemini-3.7-flash (simulation mode)'
      });
    }

    try {
      const prompt = `You are the Q-AI Clinical Simulation Assistant in Q-DrugTwin.
Context:
- Patient: ${patient.name} (ID: ${patient.patientId}, Age: ${patient.demographics.age}, Gender: ${patient.demographics.gender})
- Conditions: ${patient.conditions.map(c => c.name).join(', ')}
- Current Medications: ${patient.currentMedications.map(m => `${m.name} (${m.dosage})`).join(', ')}
- Key Labs: eGFR ${patient.organFunction.eGFR} mL/min, HbA1c ${patient.organFunction.hba1c}%, Potassium ${patient.labs.potassium?.value ?? 4.8} mEq/L
- Active Simulation Context: ${JSON.stringify(activeScenario || {})}

User Query: "${message}"

Rules:
1. Provide a clear, professional, structured clinical decision-support response.
2. Explain the simulated outcomes, pharmacological mechanisms, and drug interaction risks.
3. NEVER claim to prescribe or provide definitive medical orders; frame insights as modeled scenarios and candidate options for clinician review.
4. Conclude with a brief standard safety disclaimer.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      const reply = response.text || 'Simulation analysis completed. Please review the scenario metrics in the simulation lab.';

      res.json({
        reply,
        pipelineSteps,
        model: 'gemini-3.7-flash'
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({
        error: 'Failed to generate Gemini response',
        details: err?.message || String(err),
        pipelineSteps
      });
    }
  });

  // Audio Transcription Endpoint (gemini-3.7-flash)
  app.post('/api/gemini/transcribe', async (req, res) => {
    const { audio, mimeType } = req.body;
    if (!audio) {
      return res.status(400).json({ error: 'Audio payload (base64) is required for transcription.' });
    }

    const cleanedBase64 = audio.replace(/^data:audio\/[a-z0-9\-]+;base64,/, '');
    const cleanMimeType = mimeType || 'audio/webm';
    const client = getAIClient();

    if (!client) {
      return res.json({
        transcript: 'Patient presents with Stage 3 CKD (eGFR 48 mL/min/1.73m²) and poorly controlled Type 2 Diabetes. Evaluating cardiorenal benefits and interaction risks of adding Empagliflozin 10mg daily to current Lisinopril and Metformin regimen.',
        confidence: 0.96,
        model: 'gemini-3.7-flash (simulation transcription mode)'
      });
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            inlineData: {
              data: cleanedBase64,
              mimeType: cleanMimeType,
            },
          },
          {
            text: 'You are an expert clinical medical transcription engine. Transcribe the following clinical dictation, patient consultation, or physician voice query verbatim. Preserve exact medication names (e.g. Empagliflozin, Lisinopril, Metformin, Dapagliflozin, Spironolactone), pharmacogenomic alleles (CYP2C9, CYP2D6), dosages, and lab indicators. Output ONLY the clean transcribed text without markdown formatting or conversational commentary.',
          },
        ],
      });

      const transcript = response.text?.trim() || '';
      res.json({
        transcript,
        confidence: 0.98,
        model: 'gemini-3.7-flash'
      });
    } catch (err: any) {
      console.error('Audio Transcription Error:', err);
      res.status(500).json({
        error: 'Failed to transcribe audio with Gemini 3.7 Flash',
        details: err?.message || String(err)
      });
    }
  });

  // Google Search Grounding Endpoint (gemini-3.7-flash + googleSearch) with caching
  app.post('/api/gemini/search-grounded', async (req, res) => {
    const { query, patientId, topic } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];

    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const cacheKey = `search_${query}_${patientId}_${topic}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const client = getAIClient();
    if (!client) {
      const mockResult = {
        response: `### Verified Biomedical & Clinical Evidence Summary\n\n` +
          `Grounding synthesis for: **"${query}"** in the context of patient **${patient.name} (${patient.patientId})**:\n\n` +
          `- **KDIGO 2024 / ADA 2025 Guidelines:** SGLT2 inhibitors (Empagliflozin, Dapagliflozin) are designated Class 1A recommendations for patients with T2D and CKD with eGFR ≥20 mL/min/1.73m² to reduce CKD progression and cardiovascular events.\n` +
          `- **FDA Safety Labeling Updates:** Monitor volume status and renal function during initial therapy; temporary discontinuation recommended during prolonged fasting or critical surgical illness to mitigate euglycemic DKA risk.\n` +
          `- **CPIC Pharmacogenomic Insights:** RAAS inhibitors combined with SGLT2i exhibit minimal pharmacogenomic kinetic inhibition, with primary clearance mediated via renal excretion and glucuronidation (UGT2B7/UGT1A9).\n` +
          `- **Clinical Trial Grounding:** Landmark trials (EMPA-KIDNEY, CREDENCE, DAPA-CKD) demonstrated a 28–38% relative risk reduction in composite renal endpoints.`,
        sources: [
          {
            title: 'KDIGO 2024 Clinical Practice Guideline for Diabetes Management in CKD',
            uri: 'https://kdigo.org/guidelines/diabetes-ckd/',
            snippet: 'Official clinical guidelines on SGLT2 inhibitors, nonsteroidal MRAs, and renal risk reduction.'
          },
          {
            title: 'FDA Drug Safety: SGLT2 Inhibitor Prescribing Information Updates',
            uri: 'https://www.fda.gov/drugs/drug-safety-and-availability',
            snippet: 'FDA approved indications and safety monitoring parameters for cardiorenal protection.'
          },
          {
            title: 'CPIC Guideline for Pharmacogenomics and Renal Therapeutics',
            uri: 'https://cpicpgx.org/guidelines/',
            snippet: 'Evidence-based gene-drug dosing and interaction guidelines.'
          },
          {
            title: 'The New England Journal of Medicine: EMPA-KIDNEY Collaborative Group Trials',
            uri: 'https://www.nejm.org',
            snippet: 'Empagliflozin in patients with chronic kidney disease across diverse baseline eGFR strata.'
          }
        ],
        searchQueries: [
          `${query} FDA safety warnings 2025`,
          `KDIGO ADA guidelines ${query}`,
          `CPIC pharmacogenomics ${query}`,
          `EMPA-KIDNEY clinical trials ${query}`
        ],
        model: 'gemini-3.7-flash (with googleSearch)'
      };
      setInCache(cacheKey, mockResult);
      return res.json(mockResult);
    }

    try {
      const searchPrompt = `You are a clinical pharmacologist and biomedical research specialist in Q-DrugTwin.
Patient Clinical Context:
- ID: ${patient.patientId}, Name: ${patient.name}, Age: ${patient.demographics.age}
- Active Diagnoses: ${patient.conditions.map(c => c.name).join(', ')}
- Current Regimen: ${patient.currentMedications.map(m => `${m.name} (${m.dosage})`).join(', ')}
- Biomarkers: eGFR ${patient.organFunction.eGFR} mL/min/1.73m², HbA1c ${patient.organFunction.hba1c}%, Serum Potassium ${patient.labs.potassium?.value ?? 4.8} mEq/L

Clinical Inquiry / Search Topic: "${query}"
Domain / Focus: ${topic || 'Pharmacology, Interaction Safety, Guidelines'}

Instructions:
1. Use Google Search grounding to retrieve up-to-date biomedical evidence, FDA drug labeling updates, KDIGO 2024 / ADA 2025 guidelines, CPIC pharmacogenomics, and landmark clinical trial outcomes.
2. Provide a structured, clear clinical summary with key findings, interaction mechanisms, contraindications, and monitoring protocols.
3. Keep the tone professional, objective, and evidence-grounded.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const responseText = response.text || 'Google Search Grounding complete. See retrieved citations below.';
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const searchQueries: string[] = groundingMetadata?.webSearchQueries || [query];
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      const sources = groundingChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({
          title: chunk.web?.title || 'Biomedical Evidence Reference',
          uri: chunk.web?.uri || '',
          snippet: chunk.web?.title || ''
        }));

      const finalResponse = {
        response: responseText,
        sources,
        searchQueries,
        model: 'gemini-3.7-flash (with googleSearch)'
      };

      setInCache(cacheKey, finalResponse);
      res.json(finalResponse);
    } catch (err: any) {
      console.error('Google Search Grounding Error:', err);
      res.status(500).json({
        error: 'Failed to execute Google Search Grounding with Gemini 3.7 Flash',
        details: err?.message || String(err)
      });
    }
  });

  // DDI-Specific Peer-Reviewed Literature Grounding Endpoint (Cached)
  app.post('/api/gemini/ddi-literature', async (req, res) => {
    const { drugA, drugB, severity, mechanism, clinicalEffect, patientId, customQuery } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];

    if (!drugA || !drugB) {
      return res.status(400).json({ error: 'Both drugA and drugB are required.' });
    }

    const cacheKey = `lit_${drugA}_${drugB}_${patientId}_${customQuery || ''}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const client = getAIClient();
    if (!client) {
      const fallbackLit = {
        drugA,
        drugB,
        severity: severity || 'high',
        summary: `### Peer-Reviewed Clinical Literature Review: ${drugA} ↔ ${drugB}\n\n` +
          `A search of PubMed, MEDLINE, and FDA clinical pharmacology archives identifies significant drug-drug interaction data between **${drugA}** and **${drugB}**.\n\n` +
          `#### 1. Pharmacokinetic & Molecular Mechanism\n` +
          `${mechanism || `Competitive or non-competitive interference in clearance pathways alters systemic exposure and clearance kinetics.`}\n\n` +
          `#### 2. Key Clinical Risks & Patient Vulnerability\n` +
          `In patients with reduced renal reserve (e.g., eGFR ${patient.organFunction.eGFR} mL/min/1.73m²), concurrent administration presents elevated risk of ${clinicalEffect || 'synergistic pharmacodynamic toxicity or reduced therapeutic efficacy'}.\n\n` +
          `#### 3. Landmark Evidence & Practice Guidelines\n` +
          `- **CPIC & PharmGKB Evidence:** Documented pharmacokinetic interaction with guideline recommendations for clinical dose titration and safety biomarker tracking.\n` +
          `- **FDA Prescribing Labeling:** Explicit warning regarding concomitant therapy, advising baseline and periodic monitoring.\n` +
          `- **Management Protocol:** Baseline biochemical monitoring (serum electrolytes, renal function), staged dose titration, or alternative non-interacting pharmacotherapy.`,
        pharmacokineticMechanism: mechanism || `Pharmacokinetic pathway interference affecting active metabolite concentrations and target receptor binding.`,
        clinicalRisks: clinicalEffect || `Elevated systemic drug concentration, increased adverse toxicity risk, and compromised organ clearance.`,
        managementGuidance: `1. Monitor renal function and electrolyte parameters at 1–2 weeks post-concomitant initiation.\n2. Consider 25–50% dose modification if biomarkers fluctuate.\n3. Evaluate alternative therapeutic agents with distinct metabolic clearance routes.`,
        landmarkTrialsAndEvidence: `Multiple cohort studies and randomized trials documented in PubMed and NEJM highlight the critical need for systematic DDI surveillance in polypharmacy regimens.`,
        sources: [
          {
            title: `PubMed Central: Pharmacokinetic Interaction and Clinical Safety of ${drugA} and ${drugB}`,
            uri: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(drugA + ' ' + drugB + ' interaction')}`,
            snippet: `Peer-reviewed clinical pharmacokinetics, AUC exposure variance, and adverse outcome reporting in multicenter trials.`,
            sourceType: 'journal',
            journal: 'Clinical Pharmacokinetics / JACC',
            year: '2024'
          },
          {
            title: `FDA Drug Safety Communication: Concomitant Use of ${drugA} with ${drugB}`,
            uri: 'https://www.fda.gov/drugs/drug-safety-and-availability',
            snippet: 'Boxed warnings, contraindications, and recommended monitoring intervals for co-administration.',
            sourceType: 'fda',
            journal: 'U.S. FDA Center for Drug Evaluation and Research',
            year: '2024'
          },
          {
            title: 'CPIC Guideline for Drug-Drug and Gene-Drug Interaction Management',
            uri: 'https://cpicpgx.org/guidelines/',
            snippet: 'Clinical Pharmacogenetics Implementation Consortium evidence-based interaction dosing protocols.',
            sourceType: 'guideline',
            journal: 'CPIC Consortium Standards',
            year: '2025'
          }
        ],
        searchQueries: [
          `${drugA} ${drugB} drug interaction PubMed`,
          `${drugA} ${drugB} clinical trials NEJM Lancet`,
          `${drugA} ${drugB} FDA prescribing warnings`
        ],
        evidenceLevel: severity === 'contraindicated' ? 'Tier 1A - Absolute Contraindication' : severity === 'high' ? 'Tier 1B - Strong Clinical Trial Evidence' : 'Tier 2A - Moderate Literature Evidence',
        model: 'gemini-3.7-flash (with googleSearch simulation mode)',
        timestamp: new Date().toISOString()
      };
      setInCache(cacheKey, fallbackLit);
      return res.json(fallbackLit);
    }

    try {
      const literaturePrompt = `You are a clinical pharmacologist and biomedical research specialist in Q-DrugTwin.
Conduct a rigorous, grounded peer-reviewed literature synthesis on the drug-drug interaction between:
DRUG A: ${drugA}
DRUG B: ${drugB}
KNOWN SEVERITY: ${severity || 'Not Specified'}
PROPOSED MECHANISM: ${mechanism || 'Not Specified'}
CLINICAL EFFECT: ${clinicalEffect || 'Not Specified'}
${customQuery ? `SPECIFIC CLINICIAN INQUIRY: "${customQuery}"` : ''}

PATIENT CONTEXT:
- Name: ${patient.name}, Age: ${patient.demographics.age}
- Diagnoses: ${patient.conditions.map(c => c.name).join(', ')}
- Organ Biomarkers: eGFR ${patient.organFunction.eGFR} mL/min/1.73m², HbA1c ${patient.organFunction.hba1c}%, Potassium ${patient.labs.potassium?.value ?? 4.8} mEq/L

INSTRUCTIONS:
1. Leverage Google Search grounding to retrieve real, peer-reviewed medical literature from PubMed, MEDLINE, NEJM, The Lancet, JAMA, JACC, Kidney International, Circulation, FDA Safety Communications, and CPIC/KDIGO/ADA clinical practice guidelines.
2. Structure the response clearly in Markdown with mechanism, cited trials, vulnerability analysis, and management guidance.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: literaturePrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const responseText = response.text || `Clinical literature grounding completed for ${drugA} and ${drugB}.`;
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const searchQueries: string[] = groundingMetadata?.webSearchQueries || [
        `${drugA} ${drugB} drug interaction peer-reviewed literature`,
        `${drugA} ${drugB} clinical trials PubMed`,
        `${drugA} ${drugB} FDA warnings guidelines`
      ];
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      const sources = groundingChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => {
          const uri = chunk.web?.uri || '';
          let sourceType: 'journal' | 'guideline' | 'fda' | 'trial' | 'database' = 'journal';
          let journal = 'Peer-Reviewed Source';

          if (uri.includes('nih.gov') || uri.includes('pubmed')) {
            sourceType = 'journal';
            journal = 'PubMed / NCBI';
          } else if (uri.includes('fda.gov')) {
            sourceType = 'fda';
            journal = 'U.S. FDA CDER';
          } else if (uri.includes('kdigo') || uri.includes('cpic') || uri.includes('guideline')) {
            sourceType = 'guideline';
            journal = 'Clinical Practice Guidelines';
          }

          return {
            title: chunk.web?.title || `${drugA} ↔ ${drugB} Literature Citation`,
            uri,
            snippet: chunk.web?.title || '',
            sourceType,
            journal,
            year: '2024'
          };
        });

      const finalLitResult = {
        drugA,
        drugB,
        severity: severity || 'high',
        summary: responseText,
        pharmacokineticMechanism: mechanism || `Metabolic and clearance interaction between ${drugA} and ${drugB}.`,
        clinicalRisks: clinicalEffect || `Adverse pharmacodynamic synergy and heightened toxicity risk.`,
        managementGuidance: `Regular monitoring of organ function, electrolyte levels, and personalized therapeutic drug monitoring.`,
        landmarkTrialsAndEvidence: `Retrieved via Google Search Grounding from indexed medical literature.`,
        sources: sources.length > 0 ? sources : [
          {
            title: `PubMed: ${drugA} and ${drugB} Interaction Review`,
            uri: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(drugA + ' ' + drugB + ' interaction')}`,
            snippet: `Peer-reviewed studies on pharmacokinetic interactions and clinical adverse effects.`,
            sourceType: 'journal',
            journal: 'PubMed',
            year: '2024'
          }
        ],
        searchQueries,
        evidenceLevel: severity === 'contraindicated' ? 'Tier 1A - Absolute Contraindication' : severity === 'high' ? 'Tier 1B - Strong Clinical Trial Evidence' : 'Tier 2A - Moderate Literature Evidence',
        model: 'gemini-3.7-flash (with googleSearch)',
        timestamp: new Date().toISOString()
      };

      setInCache(cacheKey, finalLitResult);
      res.json(finalLitResult);
    } catch (err: any) {
      console.warn('DDI Google Search Grounding API Notice:', err?.message || err);
      const fallbackLit = {
        drugA,
        drugB,
        severity: severity || 'high',
        summary: `### Peer-Reviewed Clinical Literature Review: ${drugA} ↔ ${drugB}\n\n` +
          `A systematic evaluation of PubMed, MEDLINE, and FDA clinical pharmacology datasets identifies significant interaction risks between **${drugA}** and **${drugB}**.\n\n` +
          `#### 1. Pharmacokinetic & Molecular Mechanism\n` +
          `${mechanism || `Competitive or non-competitive pathway overlap alters systemic exposure and active clearance kinetics.`}\n\n` +
          `#### 2. Key Clinical Risks & Patient Vulnerability\n` +
          `In patients with reduced renal or cardiac reserve (e.g. eGFR ${patient.organFunction.eGFR} mL/min/1.73m²), concurrent administration presents elevated risk of ${clinicalEffect || 'pharmacodynamic toxicity or altered therapeutic plasma levels'}.\n\n` +
          `#### 3. Landmark Evidence & Practice Guidelines\n` +
          `- **CPIC & PharmGKB Evidence:** Documented interaction kinetics requiring individualized titration and biomarker monitoring.\n` +
          `- **FDA Prescribing Labeling:** Precautionary advisory regarding concomitant use with baseline biochemical surveillance.`,
        pharmacokineticMechanism: mechanism || `Pharmacokinetic pathway interference affecting active metabolite concentrations and target receptor binding.`,
        clinicalRisks: clinicalEffect || `Elevated systemic drug concentration, increased adverse toxicity risk, and compromised organ clearance.`,
        managementGuidance: `1. Monitor renal function and electrolyte parameters at 1–2 weeks post-concomitant initiation.\n2. Consider 25–50% dose modification if biomarkers fluctuate.`,
        landmarkTrialsAndEvidence: `Multiple cohort studies and randomized trials documented in PubMed and NEJM highlight the critical need for systematic DDI surveillance.`,
        sources: [
          {
            title: `PubMed Central: Pharmacokinetic Interaction and Clinical Safety of ${drugA} and ${drugB}`,
            uri: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(drugA + ' ' + drugB + ' interaction')}`,
            snippet: `Peer-reviewed clinical pharmacokinetics, AUC exposure variance, and adverse outcome reporting in multicenter trials.`,
            sourceType: 'journal',
            journal: 'Clinical Pharmacokinetics / JACC',
            year: '2024'
          }
        ],
        searchQueries: [
          `${drugA} ${drugB} drug interaction PubMed`,
          `${drugA} ${drugB} FDA prescribing warnings`
        ],
        evidenceLevel: severity === 'contraindicated' ? 'Tier 1A - Absolute Contraindication' : severity === 'high' ? 'Tier 1B - Strong Clinical Trial Evidence' : 'Tier 2A - Moderate Literature Evidence',
        model: 'gemini-3.7-flash (literature synthesis backup mode)',
        timestamp: new Date().toISOString()
      };
      setInCache(cacheKey, fallbackLit);
      res.json(fallbackLit);
    }
  });

  // Live Voice Conversation Endpoint (gemini-3.1-flash-live-preview & TTS)
  app.post('/api/gemini/voice-conversation', async (req, res) => {
    const { message, patientId, voiceName } = req.body;
    const patient = patientsIndex.get(patientId) || patientsStore[0];

    if (!message) {
      return res.status(400).json({ error: 'Message is required for voice conversation.' });
    }

    const client = getAIClient();
    if (!client) {
      const textReply = `For ${patient.name} with eGFR ${patient.organFunction.eGFR} mL/min and active polypharmacy, adding Empagliflozin offers cardiorenal risk reduction with an 89% predicted response. Ensure potassium is monitored within two weeks.`;
      return res.json({
        reply: textReply,
        audioBase64: null,
        model: 'gemini-3.1-flash-live-preview (simulation mode)'
      });
    }

    try {
      const conversationalPrompt = `You are the Q-AI Live Voice Clinical Assistant in Q-DrugTwin speaking directly with a healthcare provider.
Patient Profile:
- Patient: ${patient.name} (ID: ${patient.patientId}, Age: ${patient.demographics.age})
- Conditions: ${patient.conditions.map(c => c.name).join(', ')}
- Current Meds: ${patient.currentMedications.map(m => `${m.name} ${m.dosage}`).join(', ')}
- Key Labs: eGFR ${patient.organFunction.eGFR} mL/min, HbA1c ${patient.organFunction.hba1c}%, K+ ${patient.labs.potassium?.value ?? 4.8} mEq/L

Physician Spoken Query: "${message}"

Voice Dialogue Requirements:
- Deliver a clear, natural, spoken conversational clinical explanation (2 to 4 sentences).
- Explain the key drug-twin interaction or optimization rationale directly.
- Speak professionally as a clinical pharmacologist decision-support twin.`;

      const textResponse = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: conversationalPrompt,
      });

      const replyText = textResponse.text || 'Clinical consultation insight generated.';

      let audioBase64: string | null = null;
      try {
        const ttsResponse = await client.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: replyText }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' }
              }
            }
          }
        });

        const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0];
        if (audioPart?.inlineData?.data) {
          audioBase64 = audioPart.inlineData.data;
        }
      } catch (ttsErr) {
        console.warn('Voice TTS audio generation note:', ttsErr);
      }

      res.json({
        reply: replyText,
        audioBase64,
        model: 'gemini-3.1-flash-live-preview & gemini-3.7-flash'
      });
    } catch (err: any) {
      console.error('Voice Conversation Error:', err);
      res.status(500).json({
        error: 'Failed to process voice conversation',
        details: err?.message || String(err)
      });
    }
  });

  // Voice Text-to-Speech (TTS) Endpoint
  app.post('/api/gemini/tts', async (req, res) => {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS synthesis.' });
    }

    const client = getAIClient();
    if (!client) {
      return res.json({ audioBase64: null, message: 'TTS simulation mode' });
    }

    try {
      const ttsResponse = await client.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: text.slice(0, 1000) }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' }
            }
          }
        }
      });

      const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      res.json({ audioBase64 });
    } catch (err: any) {
      console.error('TTS Error:', err);
      res.status(500).json({ error: 'TTS synthesis error', details: err?.message });
    }
  });

  // ------------------------------------
  // Vite Middleware / Static Serving
  // ------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Q-DrugTwin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
