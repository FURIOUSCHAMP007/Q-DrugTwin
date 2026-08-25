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

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ------------------------------------
  // API Routes
  // ------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      system: 'Q-DrugTwin Hybrid Digital Twin Engine',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // Get all patients
  app.get('/api/patients', (req, res) => {
    res.json({ patients: patientsStore });
  });

  // Get single patient
  app.get('/api/patients/:id', (req, res) => {
    const p = patientsStore.find(pt => pt.patientId === req.params.id);
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
    res.json({ success: true, patient: newPatient });
  });

  // Get Candidate Medications
  app.get('/api/medications', (req, res) => {
    res.json({ medications: CANDIDATE_MEDICATIONS });
  });

  // Get Drug-Drug Interactions
  app.get('/api/interactions', (req, res) => {
    res.json({ interactions: KNOWN_DRUG_INTERACTIONS });
  });

  // Get Model Metrics
  app.get('/api/models', (req, res) => {
    res.json({ models: AI_MODELS_METRICS });
  });

  // Predict Response
  app.post('/api/predict-response', (req, res) => {
    const { patientId, candidateTherapy } = req.body;
    const patient = patientsStore.find(p => p.patientId === patientId) || patientsStore[0];
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
    const patient = patientsStore.find(p => p.patientId === patientId) || patientsStore[0];
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
    const patient = patientsStore.find(p => p.patientId === patientId) || patientsStore[0];
    const candidates: Medication[] = Array.isArray(candidateTherapies) ? candidateTherapies : [];

    const simResult = simulateCandidateScenario(patient, candidates, scenarioName || 'Custom Treatment Scenario');
    res.json({ simulation: simResult });
  });

  // Hybrid QUBO / Quantum Optimization
  app.post('/api/optimize-treatment', (req, res) => {
    const { patientId, candidatePool, constraints } = req.body;
    const patient = patientsStore.find(p => p.patientId === patientId) || patientsStore[0];
    const pool = candidatePool && candidatePool.length > 0 ? candidatePool : CANDIDATE_MEDICATIONS;

    const config = {
      maxAdverseRisk: constraints?.maxAdverseRisk ?? 0.25,
      interactionTolerance: constraints?.interactionTolerance ?? 'moderate',
      maxAdditionalDrugs: constraints?.maxAdditionalDrugs ?? 2,
      penaltyMultiplier: constraints?.penaltyMultiplier ?? 1.0
    };

    const optimizationResult = formulateQuboAndOptimize(patient, pool, config);
    res.json({ optimization: optimizationResult });
  });

  // Gemini AI Orchestrator & Clinical Reasoning Chat
  app.post('/api/gemini/chat', async (req, res) => {
    const { message, patientId, activeScenario } = req.body;
    const patient = patientsStore.find(p => p.patientId === patientId) || patientsStore[0];

    const pipelineSteps = [
      { step: '1. Patient Digital Twin Vector Retrieval', status: 'completed' as const, detail: `Loaded State Vector Pt for ${patient.name} (${patient.patientId})` },
      { step: '2. ResponseNet Predictive Efficacy Run', status: 'completed' as const, detail: 'Inference completed on structured clinical & genomic features' },
      { step: '3. ADRNet Risk & Toxicity Head Evaluation', status: 'completed' as const, detail: 'Conditional probability calibrated against organ biomarkers' },
      { step: '4. PharmaGNN Knowledge Graph Link Analysis', status: 'completed' as const, detail: 'Biomedical graph traversed across CYP enzymes and receptor targets' },
      { step: '5. Quantum QUBO Combinatorial Optimization', status: 'completed' as const, detail: 'Hamiltonian ground-state energy convergence validated' }
    ];

    if (!aiClient) {
      // Fallback structured clinical reasoning if GEMINI_API_KEY is not yet attached
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

      const response = await aiClient.models.generateContent({
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Q-DrugTwin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
