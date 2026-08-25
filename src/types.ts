export type RiskCategory = 'low' | 'moderate' | 'high' | 'critical';

export interface DemographicData {
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  ethnicity?: string;
}

export interface OrganFunctionState {
  renalScore: number; // 0-100 (100 = optimal)
  eGFR: number; // mL/min/1.73m²
  serumCreatinine: number; // mg/dL
  hepaticScore: number; // 0-100
  alt: number; // U/L
  ast: number; // U/L
  bilirubin: number; // mg/dL
  cardiacScore: number; // 0-100
  lvef: number; // %
  bnp: number; // pg/mL
  metabolicScore: number; // 0-100
  hba1c: number; // %
  fastingGlucose: number; // mg/dL
  vascularScore: number; // 0-100
  systolicBp: number;
  diastolicBp: number;
}

export interface LabIndicator {
  name?: string;
  value: number;
  unit: string;
  referenceRange: string;
  status?: 'normal' | 'low' | 'elevated' | 'critical' | string;
  trend?: 'stable' | 'increasing' | 'decreasing' | 'elevated' | 'low' | string;
  flag?: 'normal' | 'low' | 'high' | 'critical' | string;
}

export interface PharmacogenomicProfile {
  gene: string;
  phenotype: string;
  diplotype: string;
  clinicalSignificance: string;
}

export interface Medication {
  id: string;
  name: string;
  brandName?: string;
  category: string;
  dosage: string;
  frequency: string;
  route: string;
  metabolismPathway: string[];
  primaryTargets: string[];
  halfLifeHours: number;
  contraindications: string[];
  commonAdrs: string[];
  predictedEffectiveness?: number; // 0-100%
  adrRiskScore?: number; // 0-100%
  interactionRiskScore?: number; // 0-100%
  suitabilityScore?: number; // 0-100
  mechanismSummary: string;
}

export interface PatientCondition {
  id: string;
  name: string;
  icd10: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate: string;
  status: 'active' | 'managed' | 'uncontrolled';
}

export interface PatientAllergy {
  substance: string;
  reactionType: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface PatientDigitalTwinState {
  patientId: string;
  name: string;
  demographics: DemographicData;
  conditions: PatientCondition[];
  allergies: PatientAllergy[];
  labs: Record<string, LabIndicator>;
  organFunction: OrganFunctionState;
  genomics: PharmacogenomicProfile[];
  currentMedications: Medication[];
  treatmentComplexity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  complexityScore: number; // 0-100
  longitudinalHistory: {
    timestamp: string;
    stateName: string;
    eGFR: number;
    hba1c: number;
    systolicBp: number;
    medicationCount: number;
  }[];
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'low' | 'moderate' | 'high' | 'contraindicated';
  mechanism: string;
  clinicalEffect: string;
  managementRecommendation: string;
  evidenceConfidence: number; // 0-1
  pathwayOverlap: string[];
}

export interface ScenarioSimulationResult {
  scenarioId: string;
  scenarioName: string;
  candidateMedications: Medication[];
  currentMedications: Medication[];
  predictedResponse: number; // 0-100%
  adrRisk: number; // 0-100%
  interactionRisk: 'low' | 'moderate' | 'high' | 'critical';
  interactionRiskScore: number; // 0-100
  overallSuitabilityScore: number; // 0-100
  constraintCompliance: number; // 0-100%
  confidenceScore: number; // 0-100%
  uncertaintyMargin: number; // ±%
  organImpactForecast: {
    renalDelta: number; // negative = worsening, positive = improvement
    hepaticDelta: number;
    cardiacDelta: number;
    metabolicDelta: number;
  };
  keyAttributions: {
    factor: string;
    impact: 'positive' | 'negative';
    weight: number; // 0-1
    description: string;
  }[];
  detectedInteractions: DrugInteraction[];
  isTopRanked?: boolean;
}

export interface QuboOptimizationResult {
  optimizationMethod: 'hybrid' | 'quantum_simulated' | 'classical_annealing';
  bestScenarioId: string;
  rankedScenarios: {
    scenarioId: string;
    name: string;
    drugsIncluded: string[];
    benefitScore: number;
    adrPenalty: number;
    interactionPenalty: number;
    constraintPenalty: number;
    energyObjective: number; // QUBO Hamiltonian energy (lower is better or inverted)
    overallScore: number;
    quantumProbabilityAmplitude: number;
  }[];
  quboMatrix: {
    variables: string[];
    linearCoefficients: number[];
    quadraticCouplings: number[][]; // N x N interaction matrix
  };
  executionTimeMs: number;
  quantumAnnealingIterations: number;
  hamiltonianGroundEnergy: number;
  constraintsSatisfied: boolean;
  notes: string;
}

export interface AiModelMetric {
  id: string;
  name: string;
  type: 'ML/XGBoost' | 'Deep Learning' | 'GNN' | 'Temporal Transformer' | 'LLM' | 'Hybrid QUBO';
  purpose: string;
  backend: 'NVIDIA CUDA / PyTorch' | 'NVIDIA RAPIDS / cuGraph' | 'Google AI' | 'Cirq Hybrid Simulator';
  auroc: number;
  f1Score: number;
  precision: number;
  recall: number;
  calibrationEce: number;
  inferenceLatencyMs: number;
  status: 'READY' | 'ONLINE' | 'ACTIVE' | 'EXPERIMENTAL';
  version: string;
  trainingSamples: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolPipeline?: {
    step: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    detail?: string;
  }[];
  structuredData?: any;
}
