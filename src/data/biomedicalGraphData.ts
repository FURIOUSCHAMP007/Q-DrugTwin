export type GraphNodeCategory = 
  | 'drug' 
  | 'enzyme' 
  | 'transporter' 
  | 'target' 
  | 'pathway' 
  | 'adr' 
  | 'pgx';

export type EdgeSeverity = 
  | 'contraindicated' 
  | 'high' 
  | 'moderate' 
  | 'therapeutic' 
  | 'genomic';

export interface BiomedicalNode {
  id: string;
  label: string;
  subLabel: string;
  category: GraphNodeCategory;
  x: number;
  y: number;
  description: string;
  clinicalSignificance: string;
  patientMatch?: boolean; // Matches active patient's current medication or PGx profile
  isCandidate?: boolean;
  biomarkers?: string[];
  halfLife?: string;
  route?: string;
}

export interface BiomedicalEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  label: string;
  mechanism: string;
  severity: EdgeSeverity;
  color: string;
  confidence: number;
  isDdi?: boolean;
  literatureEvidence?: string;
}

export const BIOMEDICAL_GRAPH_NODES: BiomedicalNode[] = [
  // --- DRUGS (Active & Candidates) ---
  {
    id: 'Lisinopril',
    label: 'Lisinopril',
    subLabel: 'ACE Inhibitor · 20mg QD',
    category: 'drug',
    x: 140,
    y: 110,
    description: 'Competitive inhibitor of Angiotensin-Converting Enzyme, suppressing Angiotensin II and Aldosterone cascade.',
    clinicalSignificance: 'First-line nephroprotection and blood pressure reduction; risk of hyperkalemia when combined with MRAs.',
    patientMatch: true,
    halfLife: '12.0 hrs',
    route: 'Oral'
  },
  {
    id: 'Spironolactone',
    label: 'Spironolactone',
    subLabel: 'Mineralocorticoid Antagonist · 25mg QD',
    category: 'drug',
    x: 340,
    y: 80,
    description: 'Steroidal mineralocorticoid receptor antagonist in the renal distal convoluted tubule and collecting duct.',
    clinicalSignificance: 'Reduces cardiac remodeling and proteinuria; retains potassium, creating synergistic hyperkalemia with ACEi/ARBs.',
    patientMatch: true,
    halfLife: '13.8 hrs',
    route: 'Oral'
  },
  {
    id: 'Atorvastatin',
    label: 'Atorvastatin',
    subLabel: 'HMG-CoA Reductase Inhibitor · 20mg QD',
    category: 'drug',
    x: 580,
    y: 110,
    description: 'Potent lipophilic statin metabolized primarily by CYP3A4 and hepatic uptake transporter SLCO1B1 (OATP1B1).',
    clinicalSignificance: 'Lowers LDL-C and stabilizes atherosclerotic plaque; susceptible to CYP3A4 inhibitors increasing plasma AUC.',
    patientMatch: true,
    halfLife: '14.0 hrs',
    route: 'Oral'
  },
  {
    id: 'Amlodipine',
    label: 'Amlodipine',
    subLabel: 'Dihydropyridine CCB · 5mg QD',
    category: 'drug',
    x: 740,
    y: 200,
    description: 'Long-acting L-type calcium channel blocker causing peripheral arterial vasodilation; weak CYP3A4 inhibitor.',
    clinicalSignificance: 'Potent blood pressure reduction; mildly elevates Atorvastatin plasma concentrations through weak CYP3A4 competition.',
    patientMatch: true,
    halfLife: '35.0 hrs',
    route: 'Oral'
  },
  {
    id: 'Clopidogrel',
    label: 'Clopidogrel',
    subLabel: 'P2Y12 Antiplatelet · 75mg QD',
    category: 'drug',
    x: 140,
    y: 350,
    description: 'Thienopyridine prodrug requiring two-step hepatic oxidation by CYP2C19 into its active antiplatelet thiol metabolite.',
    clinicalSignificance: 'Prevents coronary stent thrombosis; bioactivation is blocked by CYP2C19 inhibitors and *2 loss-of-function alleles.',
    patientMatch: false,
    halfLife: '6.0 hrs',
    route: 'Oral'
  },
  {
    id: 'Omeprazole',
    label: 'Omeprazole',
    subLabel: 'Proton Pump Inhibitor · 20mg QD',
    category: 'drug',
    x: 320,
    y: 430,
    description: 'Potent irreversible inhibitor of gastric parietal H+/K+ ATPase; acts as a strong competitive inhibitor of CYP2C19.',
    clinicalSignificance: 'Gastric acid suppression; significantly decreases Clopidogrel active metabolite generation, increasing ischemic recurrence.',
    patientMatch: false,
    halfLife: '1.0 hr',
    route: 'Oral'
  },
  {
    id: 'Metformin',
    label: 'Metformin',
    subLabel: 'Biguanide · 1000mg BID',
    category: 'drug',
    x: 100,
    y: 220,
    description: 'Suppresses hepatic gluconeogenesis via AMPK activation and mitochondrial complex I inhibition; renally cleared via OCT2.',
    clinicalSignificance: 'Core therapy for T2D; accumulates in moderate-to-severe renal impairment (eGFR < 30) triggering lactic acidosis.',
    patientMatch: true,
    halfLife: '6.2 hrs',
    route: 'Oral'
  },
  {
    id: 'SacubitrilValsartan',
    label: 'Sacubitril/Valsartan',
    subLabel: 'ARNI (Entresto) · 49/51mg BID',
    category: 'drug',
    x: 130,
    y: 20,
    description: 'Dual neprilysin inhibitor prodrug (sacubitrilat) and angiotensin II receptor antagonist (valsartan).',
    clinicalSignificance: 'HFrEF guideline-directed therapy; strict 36h washout required from ACE inhibitors to prevent lethal angioedema surge.',
    patientMatch: false,
    halfLife: '11.5 hrs',
    route: 'Oral'
  },
  {
    id: 'Furosemide',
    label: 'Furosemide',
    subLabel: 'Loop Diuretic · 40mg BID',
    category: 'drug',
    x: 270,
    y: 190,
    description: 'Inhibits Na+/K+/2Cl- cotransporter (NKCC2) in thick ascending limb of loop of Henle.',
    clinicalSignificance: 'Potent fluid removal in heart failure/CKD; can cause prerenal azotemia and hypokalemia when combined with SGLT2i/ACEi.',
    patientMatch: false,
    halfLife: '2.0 hrs',
    route: 'Oral'
  },
  {
    id: 'Pantoprazole',
    label: 'Pantoprazole',
    subLabel: 'Safe PPI Alternative · 40mg QD',
    category: 'drug',
    x: 350,
    y: 520,
    description: 'Proton pump inhibitor with low competitive binding affinity for CYP2C19 compared to omeprazole/esomeprazole.',
    clinicalSignificance: 'Recommended safe alternative to Omeprazole when dual antiplatelet therapy (Clopidogrel) is required.',
    isCandidate: true,
    halfLife: '1.5 hrs',
    route: 'Oral'
  },
  {
    id: 'Empagliflozin',
    label: 'Empagliflozin',
    subLabel: 'SGLT2 Inhibitor · 10mg QD',
    category: 'drug',
    x: 480,
    y: 280,
    description: 'Selective renal sodium-glucose cotransporter-2 (SGLT2) inhibitor metabolized via UGT glucuronidation.',
    clinicalSignificance: 'Cardiorenal protection in T2D & CKD; avoids CYP450 interactions and safely complements Lisinopril/Metformin.',
    isCandidate: true,
    halfLife: '12.4 hrs',
    route: 'Oral'
  },
  {
    id: 'Finerenone',
    label: 'Finerenone',
    subLabel: 'Non-steroidal MRA · 10mg QD',
    category: 'drug',
    x: 460,
    y: 20,
    description: 'Non-steroidal, selective mineralocorticoid receptor antagonist with balanced renal/cardiac distribution.',
    clinicalSignificance: 'Provides CKD nephroprotection with significantly lower hyperkalemia incidence than steroidal MRAs like Spironolactone.',
    isCandidate: true,
    halfLife: '3.0 hrs',
    route: 'Oral'
  },

  // --- ENZYMES & TRANSPORTERS ---
  {
    id: 'CYP3A4',
    label: 'CYP3A4',
    subLabel: 'Cytochrome P450 3A4 Isozyme',
    category: 'enzyme',
    x: 630,
    y: 210,
    description: 'Most abundant hepatic and intestinal CYP enzyme responsible for oxidative metabolism of >50% of prescription drugs.',
    clinicalSignificance: 'Critical metabolic junction for Atorvastatin, Amlodipine, and DOACs; subject to competitive inhibition.'
  },
  {
    id: 'CYP2C19',
    label: 'CYP2C19',
    subLabel: 'Cytochrome P450 2C19 Isozyme',
    category: 'enzyme',
    x: 230,
    y: 350,
    description: 'Hepatic monooxygenase enzyme essential for clopidogrel prodrug bioactivation and proton pump inhibitor clearance.',
    clinicalSignificance: 'Pharmacogenomic bottleneck: loss-of-function variants (*2, *3) or Omeprazole inhibition causes antiplatelet resistance.'
  },
  {
    id: 'CYP2C9',
    label: 'CYP2C9',
    subLabel: 'Cytochrome P450 2C9 Isozyme',
    category: 'enzyme',
    x: 470,
    y: 390,
    description: 'Metabolizes narrow therapeutic index drugs including Warfarin, Sulfonylureas (Glipizide), and ARBs (Losartan).',
    clinicalSignificance: '*3 allele carriers experience delayed drug clearance and elevated risk of drug-induced hypoglycemia/bleeding.'
  },
  {
    id: 'Neprilysin',
    label: 'Neprilysin',
    subLabel: 'Neutral Endopeptidase (NEP)',
    category: 'enzyme',
    x: 260,
    y: 20,
    description: 'Membrane-bound metalloprotease that degrades natriuretic peptides, bradykinin, and adrenomedullin.',
    clinicalSignificance: 'Co-inhibition with ACE leads to catastrophic accumulation of bradykinin, precipitating angioedema.'
  },
  {
    id: 'OCT2',
    label: 'OCT2 (SLC22A2)',
    subLabel: 'Organic Cation Transporter 2',
    category: 'transporter',
    x: 60,
    y: 150,
    description: 'Basolateral renal tubular transporter mediating uptake and elimination of cationic drugs like Metformin.',
    clinicalSignificance: 'Renal impairment or OCT2 inhibitors impair metformin clearance, elevating plasma biguanide levels.'
  },
  {
    id: 'SLCO1B1',
    label: 'SLCO1B1 (OATP1B1)',
    subLabel: 'Organic Anion Transporter 1B1',
    category: 'transporter',
    x: 740,
    y: 100,
    description: 'Sinusoidal hepatic uptake transporter mediating active hepatic extraction of statins from portal blood.',
    clinicalSignificance: 'Loss-of-function variants (521T>C, *5) impair hepatic statin clearance, increasing systemic exposure and myopathy risk.'
  },
  {
    id: 'UGT2B7',
    label: 'UGT2B7',
    subLabel: 'UDP-Glucuronosyltransferase 2B7',
    category: 'enzyme',
    x: 580,
    y: 340,
    description: 'Phase II conjugating enzyme responsible for glucuronidation of SGLT2 inhibitors and carboxylic acid drugs.',
    clinicalSignificance: 'Provides alternative non-CYP clearance for Empagliflozin, eliminating CYP3A4/CYP2C19 interaction vulnerability.'
  },

  // --- BIOLOGICAL TARGETS ---
  {
    id: 'ACE_Target',
    label: 'ACE Enzyme',
    subLabel: 'Angiotensin-Converting Enzyme Target',
    category: 'target',
    x: 200,
    y: 110,
    description: 'Endothelial zinc metallopeptidase converting Angiotensin I to vasoactive Angiotensin II.',
    clinicalSignificance: 'Primary target of Lisinopril; reduces systemic vascular resistance and glomerular efferent arteriolar tone.'
  },
  {
    id: 'MR_Target',
    label: 'MR Receptor',
    subLabel: 'Mineralocorticoid Receptor Target',
    category: 'target',
    x: 430,
    y: 80,
    description: 'Nuclear hormone receptor mediating aldosterone binding in distal nephron principal cells.',
    clinicalSignificance: 'Target of Spironolactone and Finerenone; regulates ENaC channel and Na+/K+ ATPase expression.'
  },
  {
    id: 'HMG_Target',
    label: 'HMG-CoA Reductase',
    subLabel: 'Rate-limiting Enzyme in Cholesterogenesis',
    category: 'target',
    x: 690,
    y: 40,
    description: 'Catalyzes the conversion of HMG-CoA to mevalonate in hepatocytes.',
    clinicalSignificance: 'Target of Atorvastatin and Rosuvastatin; upregulates cell-surface LDL receptor recycling.'
  },
  {
    id: 'P2Y12_Target',
    label: 'P2Y12 Receptor',
    subLabel: 'Platelet ADP Gi-Coupled Receptor',
    category: 'target',
    x: 80,
    y: 440,
    description: 'Purinergic G-protein coupled receptor on platelet membranes required for sustained GPIIb/IIIa activation.',
    clinicalSignificance: 'Target of active Clopidogrel thiol metabolite; inhibition prevents platelet aggregation and thrombosis.'
  },
  {
    id: 'SGLT2_Target',
    label: 'SGLT2 Protein',
    subLabel: 'Sodium-Glucose Co-Transporter 2',
    category: 'target',
    x: 480,
    y: 200,
    description: 'High-capacity, low-affinity glucose transporter in the S1 segment of the renal proximal convoluted tubule.',
    clinicalSignificance: 'Target of Empagliflozin; restores tubuloglomerular feedback and reduces hyperfiltration.'
  },

  // --- PHYSIOLOGICAL PATHWAYS ---
  {
    id: 'RAAS_Pathway',
    label: 'RAAS Cascade',
    subLabel: 'Renin-Angiotensin-Aldosterone System',
    category: 'pathway',
    x: 260,
    y: 110,
    description: 'Hormonal cascade regulating blood pressure, intravascular volume, and systemic vascular resistance.',
    clinicalSignificance: 'Dual suppression by ACEi + MRA creates synergistic potassium retention and efferent arteriolar vasodilation.'
  },
  {
    id: 'Platelet_Pathway',
    label: 'Platelet Aggregation',
    subLabel: 'Hemostatic Plug & Clot Formation',
    category: 'pathway',
    x: 180,
    y: 460,
    description: 'Primary hemostasis cascade mediated by thromboxane A2, ADP binding, and fibrinogen cross-linking.',
    clinicalSignificance: 'Essential protection against stent occlusion; compromised when PPIs inhibit CYP2C19 clopidogrel bioactivation.'
  },
  {
    id: 'Renal_Hemodynamics',
    label: 'Renal Hemodynamics',
    subLabel: 'Intraglomerular Filtration & Feedback',
    category: 'pathway',
    x: 390,
    y: 230,
    description: 'Autoregulation of afferent and efferent arteriolar tone maintaining glomerular filtration rate (GFR).',
    clinicalSignificance: 'Crossroads for ACEi, Loop Diuretics, and SGLT2i interactions governing volume status and eGFR.'
  },

  // --- ADVERSE EFFECTS & TOXICITY SIGNALS ---
  {
    id: 'Hyperkalemia_ADR',
    label: 'Hyperkalemia Crisis',
    subLabel: 'Serum K+ > 5.5 mEq/L Risk',
    category: 'adr',
    x: 320,
    y: 150,
    description: 'Impaired renal potassium excretion leading to lethal ventricular arrhythmias and cardiac conduction abnormalities.',
    clinicalSignificance: 'Triggered by concomitant Lisinopril + Spironolactone dual RAAS suppression in CKD Stage 2/3.'
  },
  {
    id: 'Statin_Myopathy_ADR',
    label: 'Statin Myopathy AUC',
    subLabel: 'Elevated Plasma Statin Exposure / Rhabdomyolysis',
    category: 'adr',
    x: 770,
    y: 150,
    description: 'Excessive systemic statin exposure causing skeletal muscle mitochondrial dysfunction and creatine kinase release.',
    clinicalSignificance: 'Result of CYP3A4 competitive inhibition by Amlodipine combined with SLCO1B1 *5 transporter impairment.'
  },
  {
    id: 'Thrombosis_ADR',
    label: 'Antiplatelet Failure',
    subLabel: 'Secondary Stent Thrombosis & Ischemic Recurrence',
    category: 'adr',
    x: 240,
    y: 530,
    description: 'Failure to achieve adequate platelet inhibition due to blocked clopidogrel prodrug bioactivation.',
    clinicalSignificance: 'Direct clinical consequence of Omeprazole + Clopidogrel DDI and/or CYP2C19 *2/*2 poor metabolizer phenotype.'
  },
  {
    id: 'Angioedema_ADR',
    label: 'Angioedema Surge',
    subLabel: 'Life-threatening Oropharyngeal Edema',
    category: 'adr',
    x: 200,
    y: 20,
    description: 'Massive surge in plasma bradykinin concentrations causing severe subcutaneous and submucosal swelling.',
    clinicalSignificance: 'Occurs with zero-washout transition between ACE Inhibitors (Lisinopril) and Neprilysin Inhibitors (Entresto).'
  },
  {
    id: 'Lactic_Acidosis_ADR',
    label: 'Lactic Acidosis Risk',
    subLabel: 'Metformin Accumulation in CKD',
    category: 'adr',
    x: 20,
    y: 260,
    description: 'Shift towards anaerobic metabolism and impaired hepatic lactate clearance due to severe biguanide accumulation.',
    clinicalSignificance: 'High risk when Metformin is administered in eGFR < 30 or intravascular contrast procedures.'
  },

  // --- PHARMACOGENOMIC (PGX) BIOMARKERS ---
  {
    id: 'PGX_CYP2C19',
    label: 'CYP2C19 *2/*2',
    subLabel: 'Poor Metabolizer Diplotype',
    category: 'pgx',
    x: 320,
    y: 320,
    description: 'Homozygous loss-of-function splice site variant (681G>A) eliminating catalytic CYP2C19 enzyme activity.',
    clinicalSignificance: 'Patient has near-zero endogenous clopidogrel activation; requires alternative antiplatelet (Ticagrelor/Prasugrel).'
  },
  {
    id: 'PGX_SLCO1B1',
    label: 'SLCO1B1 *5',
    subLabel: 'Reduced Uptake (521T>C)',
    category: 'pgx',
    x: 820,
    y: 70,
    description: 'Missense variant (c.521T>C) resulting in impaired OATP1B1 transporter expression on the hepatic sinusoidal membrane.',
    clinicalSignificance: 'Elevates baseline systemic statin exposure by 220%, amplifying myopathy risk when combined with CYP3A4 inhibitors.'
  }
];

export const BIOMEDICAL_GRAPH_EDGES: BiomedicalEdge[] = [
  // --- DUAL RAAS & HYPERKALEMIA CASCADE ---
  {
    id: 'e1',
    from: 'Lisinopril',
    to: 'ACE_Target',
    type: 'binds_target',
    label: 'Potent ACE Inhibition',
    mechanism: 'Directly binds zinc ion in active catalytic cleft of ACE, halting Ang I to Ang II conversion.',
    severity: 'therapeutic',
    color: '#2563EB',
    confidence: 0.99
  },
  {
    id: 'e2',
    from: 'ACE_Target',
    to: 'RAAS_Pathway',
    type: 'modulates_pathway',
    label: 'Blocks Ang II Synthesis',
    mechanism: 'Downregulates Ang II-mediated vasoconstriction and aldosterone synthesis.',
    severity: 'therapeutic',
    color: '#2563EB',
    confidence: 0.98
  },
  {
    id: 'e3',
    from: 'Spironolactone',
    to: 'MR_Target',
    type: 'binds_target',
    label: 'Competitive MR Blockade',
    mechanism: 'Competitively blocks aldosterone binding to nuclear mineralocorticoid receptors.',
    severity: 'therapeutic',
    color: '#7C3AED',
    confidence: 0.99
  },
  {
    id: 'e4',
    from: 'MR_Target',
    to: 'RAAS_Pathway',
    type: 'modulates_pathway',
    label: 'Suppresses Aldosterone Effect',
    mechanism: 'Inhibits ENaC sodium channel insertion, retaining potassium in cortical collecting tubule.',
    severity: 'therapeutic',
    color: '#7C3AED',
    confidence: 0.97
  },
  {
    id: 'e5',
    from: 'RAAS_Pathway',
    to: 'Hyperkalemia_ADR',
    type: 'triggers_adr',
    label: 'Synergistic K+ Accumulation',
    mechanism: 'Dual blockade of Ang II and Aldosterone halts renal K+ excretion, driving serum K+ > 5.5 mEq/L.',
    severity: 'high',
    color: '#E11D48',
    confidence: 0.96,
    isDdi: true,
    literatureEvidence: 'Class I AHA/ACC contraindication warning for combined high-dose ACEi + steroidal MRA in eGFR < 60.'
  },
  {
    id: 'e6',
    from: 'Finerenone',
    to: 'MR_Target',
    type: 'binds_target',
    label: 'Non-steroidal MR Antagonism',
    mechanism: 'Bulky non-steroidal antagonist preventing cofactor recruitment without steep K+ retention.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.95
  },
  {
    id: 'e7',
    from: 'Finerenone',
    to: 'Hyperkalemia_ADR',
    type: 'alleviates',
    label: 'Attenuates K+ Spikes vs Spironolactone',
    mechanism: 'Shorter half-life and balanced cardiac/renal distribution reduces hyperkalemia incidence by ~60%.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.94
  },

  // --- STATIN METABOLISM, CYP3A4 & MYOPATHY CASCADE ---
  {
    id: 'e8',
    from: 'Atorvastatin',
    to: 'HMG_Target',
    type: 'binds_target',
    label: 'HMG-CoA Reductase Inhibition',
    mechanism: 'Occupies catalytic site of HMG-CoA reductase, preventing mevalonate synthesis.',
    severity: 'therapeutic',
    color: '#2563EB',
    confidence: 0.99
  },
  {
    id: 'e9',
    from: 'Atorvastatin',
    to: 'CYP3A4',
    type: 'metabolized_by',
    label: 'Phase I CYP3A4 Oxidation',
    mechanism: 'Metabolized via CYP3A4 into ortho- and para-hydroxylated active metabolites (70% AUC).',
    severity: 'therapeutic',
    color: '#0891B2',
    confidence: 0.97
  },
  {
    id: 'e10',
    from: 'Amlodipine',
    to: 'CYP3A4',
    type: 'inhibits',
    label: 'Competitive CYP3A4 Inhibition',
    mechanism: 'Weak-to-moderate competitive substrate/inhibitor of CYP3A4 active site.',
    severity: 'moderate',
    color: '#D97706',
    confidence: 0.91,
    isDdi: true,
    literatureEvidence: 'Co-administration increases Atorvastatin AUC by 18-35% in clinical pharmacokinetic trials.'
  },
  {
    id: 'e11',
    from: 'CYP3A4',
    to: 'Statin_Myopathy_ADR',
    type: 'triggers_adr',
    label: 'Elevates Systemic Statin AUC',
    mechanism: 'Reduced CYP3A4 clearance shifts statin into systemic circulation, damaging skeletal muscle.',
    severity: 'moderate',
    color: '#D97706',
    confidence: 0.92
  },
  {
    id: 'e12',
    from: 'Atorvastatin',
    to: 'SLCO1B1',
    type: 'metabolized_by',
    label: 'Hepatic Sinusoidal Uptake',
    mechanism: 'Requires OATP1B1 transporter for active extraction from portal blood into hepatocytes.',
    severity: 'therapeutic',
    color: '#0891B2',
    confidence: 0.96
  },
  {
    id: 'e13',
    from: 'PGX_SLCO1B1',
    to: 'SLCO1B1',
    type: 'genomic_attenuation',
    label: '521T>C Reduced Transport Rate',
    mechanism: 'Altered protein trafficking impairs statin sinusoidal influx, doubling plasma AUC.',
    severity: 'genomic',
    color: '#7C3AED',
    confidence: 0.98
  },
  {
    id: 'e14',
    from: 'SLCO1B1',
    to: 'Statin_Myopathy_ADR',
    type: 'triggers_adr',
    label: 'Synergistic Myotoxicity Trigger',
    mechanism: 'Impaired transporter + CYP3A4 inhibition produces >3x cumulative statin systemic exposure.',
    severity: 'high',
    color: '#E11D48',
    confidence: 0.95,
    isDdi: true
  },

  // --- CLOPIDOGREL BIOACTIVATION, CYP2C19 & OMEPRAZOLE BOTTLENECK ---
  {
    id: 'e15',
    from: 'Clopidogrel',
    to: 'CYP2C19',
    type: 'bioactivates',
    label: 'Prodrug 2-Step Oxidation',
    mechanism: 'Requires CYP2C19 to form 2-oxo-clopidogrel intermediate and active thiol metabolite.',
    severity: 'therapeutic',
    color: '#2563EB',
    confidence: 0.98
  },
  {
    id: 'e16',
    from: 'Omeprazole',
    to: 'CYP2C19',
    type: 'inhibits',
    label: 'Potent Competitive Inhibition',
    mechanism: 'Binds with high affinity (Ki = 2-6 µM) to CYP2C19 heme pocket, competitively blocking clopidogrel.',
    severity: 'high',
    color: '#E11D48',
    confidence: 0.97,
    isDdi: true,
    literatureEvidence: 'FDA Boxed Warning: Omeprazole significantly reduces active clopidogrel metabolite and antiplatelet effect.'
  },
  {
    id: 'e17',
    from: 'PGX_CYP2C19',
    to: 'CYP2C19',
    type: 'genomic_attenuation',
    label: 'Loss-of-Function *2/*2 Null Allele',
    mechanism: 'Alternative splicing eliminates functional enzyme, creating baseline clopidogrel resistance.',
    severity: 'genomic',
    color: '#7C3AED',
    confidence: 0.99
  },
  {
    id: 'e18',
    from: 'CYP2C19',
    to: 'P2Y12_Target',
    type: 'binds_target',
    label: 'Active Thiol Binds P2Y12',
    mechanism: 'Generates active metabolite forming irreversible disulfide bridge with P2Y12 Cys17/Cys270.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.96
  },
  {
    id: 'e19',
    from: 'P2Y12_Target',
    to: 'Platelet_Pathway',
    type: 'modulates_pathway',
    label: 'Inhibits Platelet Aggregation',
    mechanism: 'Suppresses Gi-mediated adenylyl cyclase inhibition, preventing GPIIb/IIIa receptor activation.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.97
  },
  {
    id: 'e20',
    from: 'Omeprazole',
    to: 'Thrombosis_ADR',
    type: 'triggers_adr',
    label: 'Secondary Stent Thrombosis Risk',
    mechanism: 'Suppresses active metabolite generation by ~45%, causing uninhibited platelet cross-linking.',
    severity: 'high',
    color: '#E11D48',
    confidence: 0.96,
    isDdi: true
  },
  {
    id: 'e21',
    from: 'Pantoprazole',
    to: 'CYP2C19',
    type: 'safe_alt',
    label: 'Minimal CYP2C19 Affinity',
    mechanism: 'Primary clearance via sulfotransferase bypasses CYP2C19, preserving clopidogrel bioactivation.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.95
  },
  {
    id: 'e22',
    from: 'Pantoprazole',
    to: 'Thrombosis_ADR',
    type: 'alleviates',
    label: 'Restores Antiplatelet Protection',
    mechanism: 'Eliminates competitive enzymatic blockade, maintaining normal platelet inhibition.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.96
  },

  // --- SACUBITRIL/VALSARTAN & LISINOPRIL ANGIOEDEMA CONTRAINDICATION ---
  {
    id: 'e23',
    from: 'SacubitrilValsartan',
    to: 'Neprilysin',
    type: 'binds_target',
    label: 'Neprilysin Inhibition (Sacubitrilat)',
    mechanism: 'Directly inhibits neprilysin metalloprotease, elevating vasoactive natriuretic peptides & bradykinin.',
    severity: 'therapeutic',
    color: '#2563EB',
    confidence: 0.99
  },
  {
    id: 'e24',
    from: 'Lisinopril',
    to: 'Angioedema_ADR',
    type: 'triggers_adr',
    label: 'Dual Bradykinin Surge Trigger',
    mechanism: 'Simultaneous ACE + Neprilysin blockade prevents bradykinin degradation through both pathways.',
    severity: 'contraindicated',
    color: '#E11D48',
    confidence: 0.99,
    isDdi: true,
    literatureEvidence: 'Absolute Contraindication (PARADIGM-HF): Minimum 36-hour washout mandatory to prevent life-threatening angioedema.'
  },
  {
    id: 'e25',
    from: 'Neprilysin',
    to: 'Angioedema_ADR',
    type: 'triggers_adr',
    label: 'Bradykinin Accumulation Cascade',
    mechanism: 'Halts secondary enzymatic clearance of bradykinin and substance P.',
    severity: 'contraindicated',
    color: '#E11D48',
    confidence: 0.98
  },

  // --- METFORMIN, OCT2, & RENAL LACTIC ACIDOSIS ---
  {
    id: 'e26',
    from: 'Metformin',
    to: 'OCT2',
    type: 'metabolized_by',
    label: 'OCT2 Basolateral Renal Clearance',
    mechanism: 'Translocated across proximal tubular membrane via OCT2 into urine (90% unchanged).',
    severity: 'therapeutic',
    color: '#0891B2',
    confidence: 0.97
  },
  {
    id: 'e27',
    from: 'OCT2',
    to: 'Lactic_Acidosis_ADR',
    type: 'triggers_adr',
    label: 'Biguanide Accumulation in Low eGFR',
    mechanism: 'Declining GFR impairs OCT2 excretion rate, triggering cellular anaerobic glycolysis shift.',
    severity: 'high',
    color: '#E11D48',
    confidence: 0.98
  },

  // --- EMPAGLIFOZIN & RENAL HEMODYNAMICS ---
  {
    id: 'e28',
    from: 'Empagliflozin',
    to: 'SGLT2_Target',
    type: 'binds_target',
    label: 'Selective SGLT2 Blockade',
    mechanism: 'Inhibits high-capacity apical glucose/sodium cotransporter in proximal tubule.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.99
  },
  {
    id: 'e29',
    from: 'SGLT2_Target',
    to: 'Renal_Hemodynamics',
    type: 'modulates_pathway',
    label: 'Restores Tubuloglomerular Feedback',
    mechanism: 'Increases distal macula densa sodium delivery, constricting afferent arteriole and reducing hyperfiltration.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.97
  },
  {
    id: 'e30',
    from: 'Empagliflozin',
    to: 'UGT2B7',
    type: 'metabolized_by',
    label: 'Phase II UGT Glucuronidation',
    mechanism: 'Direct hepatic/renal glucuronidation avoiding CYP450 polypharmacy interaction bottlenecks.',
    severity: 'therapeutic',
    color: '#059669',
    confidence: 0.98
  },
  {
    id: 'e31',
    from: 'Furosemide',
    to: 'Renal_Hemodynamics',
    type: 'modulates_pathway',
    label: 'Loop Natriuresis & Volume Reduction',
    mechanism: 'Inhibits NKCC2, promoting water and sodium excretion while contracting intravascular volume.',
    severity: 'therapeutic',
    color: '#7C3AED',
    confidence: 0.96
  },
  {
    id: 'e32',
    from: 'Lisinopril',
    to: 'Renal_Hemodynamics',
    type: 'modulates_pathway',
    label: 'Efferent Arteriolar Vasodilation',
    mechanism: 'Reduces Ang II tone on efferent arteriole, reducing intraglomerular pressure.',
    severity: 'therapeutic',
    color: '#2563EB',
    confidence: 0.97
  },
  {
    id: 'e33',
    from: 'Renal_Hemodynamics',
    to: 'Hyperkalemia_ADR',
    type: 'triggers_adr',
    label: 'Volume Depletion K+ Concentration',
    mechanism: 'Excessive volume contraction by loop diuretic combined with RAAS blockade concentrates serum K+.',
    severity: 'moderate',
    color: '#D97706',
    confidence: 0.91,
    isDdi: true
  }
];

export interface PrebuiltPathScenario {
  id: string;
  name: string;
  sourceId: string;
  targetId: string;
  riskBadge: string;
  severity: EdgeSeverity;
  description: string;
  clinicalSolution: string;
}

export const PREBUILT_PATH_SCENARIOS: PrebuiltPathScenario[] = [
  {
    id: 'p1',
    name: 'Omeprazole → Clopidogrel Antiplatelet Failure',
    sourceId: 'Omeprazole',
    targetId: 'Thrombosis_ADR',
    riskBadge: 'HIGH ISCHEMIC RISK',
    severity: 'high',
    description: 'Omeprazole competitively binds CYP2C19, blocking Clopidogrel bioactivation into active thiol metabolite, triggering stent thrombosis risk.',
    clinicalSolution: 'Substitute Omeprazole with Pantoprazole (low CYP2C19 binding) or switch to non-CYP2C19 antiplatelet (Ticagrelor).'
  },
  {
    id: 'p2',
    name: 'Lisinopril + Spironolactone → Hyperkalemia Crisis',
    sourceId: 'Lisinopril',
    targetId: 'Hyperkalemia_ADR',
    riskBadge: 'HIGH ARRHYTHMIA RISK',
    severity: 'high',
    description: 'Dual suppression of Ang II and Aldosterone halts renal potassium excretion, raising K+ > 5.5 mEq/L in CKD Stage 2/3.',
    clinicalSolution: 'Replace Spironolactone with non-steroidal MRA Finerenone or titrate dose with frequent serum potassium telemetry.'
  },
  {
    id: 'p3',
    name: 'Atorvastatin + Amlodipine + SLCO1B1 → Statin Myopathy',
    sourceId: 'Amlodipine',
    targetId: 'Statin_Myopathy_ADR',
    riskBadge: 'MODERATE TOXICITY',
    severity: 'moderate',
    description: 'Amlodipine CYP3A4 competition combined with SLCO1B1 *5 reduced hepatic uptake produces elevated systemic statin AUC.',
    clinicalSolution: 'Cap Atorvastatin at 20mg QD or substitute with Rosuvastatin / Pravastatin (non-CYP3A4 metabolized).'
  },
  {
    id: 'p4',
    name: 'Lisinopril + Sacubitril/Valsartan → Lethal Angioedema',
    sourceId: 'SacubitrilValsartan',
    targetId: 'Angioedema_ADR',
    riskBadge: 'CONTRAINDICATED',
    severity: 'contraindicated',
    description: 'Simultaneous inhibition of ACE and Neprilysin produces catastrophic accumulation of bradykinin and substance P.',
    clinicalSolution: 'Enforce strict 36-hour washout period when transitioning patient between ACE inhibitor and Entresto.'
  },
  {
    id: 'p5',
    name: 'Empagliflozin SGLT2i Renal Integration',
    sourceId: 'Empagliflozin',
    targetId: 'Renal_Hemodynamics',
    riskBadge: 'CARDIOPROTECTIVE FLOW',
    severity: 'therapeutic',
    description: 'Empagliflozin clears safely via UGT2B7 glucuronidation, restoring tubuloglomerular feedback without CYP450 competition.',
    clinicalSolution: 'Optimal candidate add-on for Eleanor Vance to slow CKD progression and optimize glycemic control.'
  }
];
