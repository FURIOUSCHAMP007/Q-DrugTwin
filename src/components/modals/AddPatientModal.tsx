import React, { useState } from 'react';
import { X, Plus, User, Activity, Dna, Pill, Check } from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (newPatient: PatientDigitalTwinState) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(65);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [eGFR, setEGFR] = useState(55);
  const [hba1c, setHba1c] = useState(8.2);
  const [systolicBp, setSystolicBp] = useState(140);
  const [diastolicBp, setDiastolicBp] = useState(88);
  const [conditionsInput, setConditionsInput] = useState('Type 2 Diabetes, Stage 3a CKD, Hypertension');
  const [complexity, setComplexity] = useState<'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'>('HIGH');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const patientId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedConditions = conditionsInput.split(',').map((c, idx) => ({
      id: `cond_custom_${idx}`,
      name: c.trim(),
      icd10: 'E11.9',
      severity: 'moderate' as const,
      diagnosedDate: '2021-04-12',
      status: 'active' as const
    }));

    const newPatient: PatientDigitalTwinState = {
      patientId,
      name: name || `Synthetic Patient (${patientId})`,
      demographics: {
        age,
        gender,
        ethnicity: 'Diverse / Synthetic',
        weightKg: 82,
        heightCm: 174,
        bmi: 27.1
      },
      conditions: parsedConditions,
      allergies: [],
      currentMedications: [
        {
          id: 'med_metformin_custom',
          name: 'Metformin',
          dosage: '1000mg',
          frequency: 'BID',
          route: 'Oral',
          category: 'Biguanide',
          primaryTargets: ['AMPK Activation'],
          metabolismPathway: ['Renal tubular secretion (OCT2/MATE1)'],
          halfLifeHours: 6.2,
          commonAdrs: ['GI distress'],
          contraindications: ['eGFR < 30 mL/min'],
          mechanismSummary: 'Activates hepatic AMPK to decrease gluconeogenesis and improve insulin sensitivity.'
        },
        {
          id: 'med_lisinopril_custom',
          name: 'Lisinopril',
          dosage: '20mg',
          frequency: 'Daily',
          route: 'Oral',
          category: 'ACE Inhibitor',
          primaryTargets: ['Angiotensin-Converting Enzyme'],
          metabolismPathway: ['Renal clearance (unaltered)'],
          halfLifeHours: 12.0,
          commonAdrs: ['Dry cough', 'Hyperkalemia'],
          contraindications: ['Angioedema'],
          mechanismSummary: 'Competitively inhibits ACE, reducing angiotensin II and aldosterone production.'
        }
      ],
      organFunction: {
        eGFR,
        serumCreatinine: (140 - age) / (eGFR || 50),
        alt: 28,
        ast: 24,
        bilirubin: 0.8,
        lvef: 55,
        bnp: 85,
        hba1c,
        fastingGlucose: 155,
        systolicBp,
        diastolicBp,
        renalScore: Math.min(100, Math.round((eGFR / 90) * 100)),
        hepaticScore: 90,
        cardiacScore: 82,
        metabolicScore: Math.min(100, Math.round((14 - hba1c) * 12)),
        vascularScore: Math.min(100, Math.round((200 - systolicBp) * 1.2))
      },
      genomics: [
        {
          gene: 'CYP2C19',
          diplotype: '1/2',
          phenotype: 'Intermediate Metabolizer',
          clinicalSignificance: 'Standard to moderately reduced clopidogrel biotransformation'
        }
      ],
      genomicProfile: {
        sequencingTechnology: 'Targeted NGS Pharmacogenomics Panel (Illumina NovaSeq 6000)',
        panelVersion: 'PGx-Clinical-Core v4.2',
        sampleDate: new Date().toISOString().split('T')[0],
        labAccreditation: 'CLIA / CAP Accredited',
        dnaExtractionYield: '99.6% Call Rate',
        markers: [
          {
            gene: 'CYP2C19',
            diplotype: '*1/*2',
            rsId: 'rs4244285',
            phenotype: 'Intermediate Metabolizer',
            metabolizerCategory: 'intermediate',
            activityScore: 1.0,
            affectedDrugClasses: ['Antiplatelets (Clopidogrel)', 'Proton Pump Inhibitors', 'SSRIs'],
            impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2C19',
            clinicalSummary: 'Single *2 loss-of-function allele reduces clopidogrel activation by ~30-50%.',
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
            affectedDrugClasses: ['Beta-Blockers', 'SSRIs', 'Opioids'],
            impactedEnzymesOrTransporters: 'Phase I Cytochrome P450 2D6',
            clinicalSummary: 'Normal baseline metabolic clearance of beta-blockers and opioids.',
            cpicGuidelineLevel: 'CPIC Level 1A',
            fdaLabelingActionable: false,
            metabolismImpact: 'Normal Baseline Metabolism'
          },
          {
            gene: 'SLCO1B1',
            diplotype: '*1/*1',
            rsId: 'rs4149056 (wt)',
            phenotype: 'Normal Function Transporter',
            metabolizerCategory: 'normal',
            activityScore: 2.0,
            affectedDrugClasses: ['Statins'],
            impactedEnzymesOrTransporters: 'OATP1B1 Hepatic Transporter',
            clinicalSummary: 'Standard statin hepatic uptake with normal myopathy risk profile.',
            cpicGuidelineLevel: 'CPIC Level 1A',
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
        highRiskDrugsToAvoid: ['High-dose Clopidogrel monotherapy in acute coronary syndrome'],
        doseAdjustmentRecommended: ['Consider alternative P2Y12 inhibitor (Ticagrelor/Prasugrel) if PCI indicated']
      },
      labs: {
        eGFR: { value: eGFR, unit: 'mL/min', flag: eGFR < 60 ? 'low' : 'normal', referenceRange: '> 60' },
        hba1c: { value: hba1c, unit: '%', flag: hba1c > 7 ? 'high' : 'normal', referenceRange: '< 5.7' }
      },
      treatmentComplexity: complexity,
      complexityScore: complexity === 'CRITICAL' ? 88 : complexity === 'HIGH' ? 74 : 52,
      longitudinalHistory: [
        { timestamp: '12 Mos Ago', stateName: 'Intake State', eGFR: eGFR + 4, hba1c: hba1c + 0.6, systolicBp: systolicBp + 8, medicationCount: 2 },
        { timestamp: 'Present', stateName: 'Current Digital Twin State Pt', eGFR, hba1c, systolicBp, medicationCount: 2 }
      ]
    };

    onAddPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl shadow-slate-900/20 space-y-5 text-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-[#0F172A]">Create Custom Patient Digital Twin</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Patient Full Name / Label:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-3 py-2 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Age:</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">eGFR (mL/min):</label>
              <input
                type="number"
                value={eGFR}
                onChange={(e) => setEGFR(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">HbA1c (%):</label>
              <input
                type="number"
                step="0.1"
                value={hba1c}
                onChange={(e) => setHba1c(parseFloat(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Systolic BP:</label>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => setSystolicBp(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Clinical Conditions (comma separated):</label>
            <input
              type="text"
              value={conditionsInput}
              onChange={(e) => setConditionsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Treatment Complexity Category:</label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="CRITICAL">CRITICAL (Score ~88)</option>
              <option value="HIGH">HIGH (Score ~74)</option>
              <option value="MODERATE">MODERATE (Score ~52)</option>
              <option value="LOW">LOW (Score ~30)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Instantiate Digital Twin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
