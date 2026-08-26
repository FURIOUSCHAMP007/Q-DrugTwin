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

export interface PharmacogenomicInsight {
  id: string;
  gene: string;
  diplotype: string;
  phenotype: string;
  medication: string;
  metabolicPathway: string;
  correlationType: 'toxicity_risk' | 'efficacy_failure' | 'altered_clearance' | 'standard';
  riskLevel: 'critical' | 'high' | 'moderate' | 'optimal';
  confidenceScore: number; // 0 - 100 percentage
  evidenceGrade: string; // e.g. "CPIC Level 1A - Definitive Evidence"
  cpicLevel: 'A' | 'B' | 'C' | 'FDA Table';
  aucImpact: string;
  clearanceImpact: string;
  clinicalRecommendation: string;
  biochemicalMechanism: string;
  fdaLabelWarning?: boolean;
  radialMetrics?: {
    pathwayDisruption: number; // 0 - 100
    evidenceStrength: number; // 0 - 100
    kineticConcordance: number; // 0 - 100
  };
}

export interface PharmacogenomicSummary {
  patientId: string;
  patientName: string;
  totalGenesProfiled: number;
  actionableCorrelationsCount: number;
  highestRiskLevel: 'critical' | 'high' | 'moderate' | 'optimal';
  insights: PharmacogenomicInsight[];
  guidelineSource: string;
  lastUpdated: string;
}

export interface GeneticMarker {
  gene: string; // e.g. CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, SLCO1B1, VKORC1, DPYD, TPMT, UGT1A1, HLA-B*57:01
  diplotype: string; // e.g. *1/*4, *2/*2, *1/*17, c.521T>C
  rsId?: string; // e.g. rs3892097, rs1057910, rs4149056
  phenotype: 'Ultra-Rapid Metabolizer' | 'Normal (Extensive) Metabolizer' | 'Intermediate Metabolizer' | 'Poor Metabolizer' | 'Increased Function' | 'Decreased Function' | 'Indeterminate' | string;
  metabolizerCategory: 'ultra-rapid' | 'normal' | 'intermediate' | 'poor' | 'altered' | 'high-risk';
  activityScore?: number; // e.g. 0.0, 0.5, 1.0, 1.5, 2.0
  affectedDrugClasses: string[]; // e.g. ['Beta-Blockers', 'SSRIs', 'Opioids / Codeine', 'Statins']
  impactedEnzymesOrTransporters: string; // e.g. 'Phase I Cytochrome P450 monooxygenase'
  clinicalSummary: string; // e.g. 'Reduced enzyme activity causes decreased prodrug activation and altered systemic clearance.'
  cpicGuidelineLevel?: string; // e.g. 'CPIC Level 1A', 'PharmGKB Level 1A'
  fdaLabelingActionable?: boolean;
  metabolismImpact: 'Impaired Clearance (Toxicity Risk)' | 'Ultra-Rapid Breakdown (Efficacy Failure)' | 'Prodrug Activation Failure' | 'Altered Hepatic Influx' | 'Normal Baseline Metabolism';
}

export interface PatientGenomicProfile {
  sequencingTechnology: string; // e.g. 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq)'
  panelVersion: string; // e.g. 'PGx-Clinical-Core v4.2'
  sampleDate: string;
  labAccreditation: string; // e.g. 'CLIA / CAP Accredited'
  dnaExtractionYield?: string; // e.g. '99.4% Call Rate'
  markers: GeneticMarker[];
  primaryMetabolizerSummary: {
    poorMetabolizersCount: number;
    intermediateCount: number;
    ultraRapidCount: number;
    normalCount: number;
  };
  highRiskDrugsToAvoid: string[];
  doseAdjustmentRecommended: string[];
  contraindicatedAlleles?: string[];
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

export interface DosageToleranceThreshold {
  medicationName: string;
  maxDailyDoseMg: number;
  unit: string;
  route?: string;
  sourceReason: string;
  limitingFactor: 'renal_clearance' | 'hepatic_metabolism' | 'pharmacogenomic_variant' | 'adverse_event_history' | 'frailty_elderly' | 'cardiac_conduction';
  historicalReaction?: string;
  guidelineReference?: string;
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
  genomicProfile?: PatientGenomicProfile;
  currentMedications: Medication[];
  dosageToleranceThresholds?: DosageToleranceThreshold[];
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
  optimalEnergy: number;
  optimalBitstring: string;
  suitabilityScore: number;
  quantumAdvantageRatio: number;
  selectedMedications: Medication[];
  sampledStates: {
    state: string; // e.g. "|1010⟩"
    medicationNames: string[];
    energy: number;
    score: number;
    amplitude?: number;
  }[];
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

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface DdiLiteratureCitation {
  title: string;
  uri: string;
  snippet?: string;
  sourceType?: 'journal' | 'guideline' | 'fda' | 'trial' | 'database';
  journal?: string;
  year?: string;
}

export interface DdiClinicalLiteratureResult {
  drugA: string;
  drugB: string;
  severity: string;
  summary: string;
  pharmacokineticMechanism: string;
  clinicalRisks: string;
  managementGuidance: string;
  landmarkTrialsAndEvidence: string;
  sources: DdiLiteratureCitation[];
  searchQueries: string[];
  evidenceLevel: string;
  model: string;
  timestamp: string;
}

export interface SearchGroundedResult {
  response: string;
  sources: GroundingSource[];
  searchQueries: string[];
  model: string;
}

export interface AudioTranscriptionResult {
  transcript: string;
  confidence?: number;
  durationSeconds?: number;
}

export interface PatientRiskNotification {
  id: string;
  patientId: string;
  patientName: string;
  type: 'ddi' | 'renal_dose' | 'adr_toxicity' | 'genomic' | 'contraindication' | 'glycemic_instability' | 'dosage_threshold';
  severity: 'critical' | 'high' | 'moderate' | 'low';
  title: string;
  message: string;
  affectedMedications: string[];
  clinicalRationale: string;
  actionRecommendation: string;
  evidenceSource: string;
  timestamp: string;
  dismissed?: boolean;
  acknowledged?: boolean;
  dosageDetails?: {
    proposedDose: number;
    thresholdDose: number;
    unit: string;
    limitingFactor: string;
    percentageExceeded: number;
  };
}

export interface VoiceConversationState {
  isRecording: boolean;
  isPlaying: boolean;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  transcript: string;
  lastResponseText: string;
}

export interface ClinicianAiFeedback {
  id: string;
  patientId: string;
  messageId?: string;
  predictionSnippet?: string;
  rating: 'accurate' | 'inaccurate';
  inaccuracyCategory?: 'dosage_error' | 'missed_contraindication' | 'interaction_hallucination' | 'guideline_discrepancy' | 'genomic_mismatch' | 'other';
  severity?: 'low' | 'medium' | 'critical';
  clinicianNotes?: string;
  flaggedForReview: boolean;
  reviewStatus: 'queued' | 'under_review' | 'resolved';
  timestamp: string;
  submittedBy?: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  title: string;
  content: string;
  author: string;
  authorRole?: string;
  category: 'general' | 'pharmacotherapy' | 'adverse_reaction' | 'genomic_consult' | 'lab_followup';
  priority: 'routine' | 'urgent' | 'critical';
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export type ScheduleFrequencyType = 'daily' | 'weekly' | 'monthly';

export interface DoseAdherenceRecord {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'taken' | 'missed' | 'skipped';
  loggedAt: string;
  notes?: string;
}

export interface MedicationScheduleReminder {
  id: string;
  patientId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequencyType: ScheduleFrequencyType;
  timesOfDay: string[]; // e.g. ['08:00', '20:00']
  daysOfWeek?: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[]; // for weekly
  dayOfMonth?: number; // 1-31 for monthly
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  administrationInstruction?: string; // e.g. 'Take with morning meal'
  specialPrecautions?: string; // e.g. 'Check blood pressure first; do not crush'
  notificationChannels: ('in_app' | 'sms' | 'email' | 'ehr_alert')[];
  priority: 'standard' | 'high_adherence_risk' | 'critical_titration';
  refillReminderEnabled?: boolean;
  refillDaysNotice?: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  colorTag?: string;
  adherenceHistory?: DoseAdherenceRecord[];
}

export interface DoseDdiConflict {
  id: string;
  patientId: string;
  drugA: string;
  drugB: string;
  scheduleAId: string;
  scheduleBId?: string;
  dosageA?: string;
  dosageB?: string;
  timeA: string;
  timeB?: string;
  date: string; // YYYY-MM-DD
  timeDeltaMinutes: number; // e.g. 0 min, 30 min
  severity: 'contraindicated' | 'high' | 'moderate' | 'low';
  title: string;
  conflictType: 'co_administration_timing' | 'same_day_kinetic_overlap' | 'regimen_contraindication' | 'chelation_absorption' | 'additive_toxicity';
  mechanism: string;
  clinicalEffect: string;
  managementRecommendation: string;
  evidenceConfidence: number;
  pathwayOverlap: string[];
  suggestedAction: 'separate_times' | 'dose_reduction' | 'substitute_agent' | 'monitor_labs' | 'hold_dose';
  suggestedTimeOffsetHours?: number;
  isAcknowledged?: boolean;
  overrideJustification?: string;
  timestamp: string;
}



