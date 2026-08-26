import {
  MedicationScheduleReminder,
  DoseDdiConflict,
  PatientDigitalTwinState
} from '../types';
import { KNOWN_DRUG_INTERACTIONS } from '../data/mockDatabase';

interface DdiRule {
  drugAKeywords: string[];
  drugBKeywords: string[];
  severity: 'contraindicated' | 'high' | 'moderate' | 'low';
  conflictType: 'co_administration_timing' | 'same_day_kinetic_overlap' | 'regimen_contraindication' | 'chelation_absorption' | 'additive_toxicity';
  title: string;
  mechanism: string;
  clinicalEffect: string;
  managementRecommendation: string;
  evidenceConfidence: number;
  pathwayOverlap: string[];
  suggestedAction: 'separate_times' | 'dose_reduction' | 'substitute_agent' | 'monitor_labs' | 'hold_dose';
  minSeparationMinutes: number; // e.g. 120 or 240 mins
  suggestedTimeOffsetHours: number;
}

// Comprehensive Clinical Pharmacology Interaction Rules Catalog
const EXTENDED_DDI_RULES: DdiRule[] = [
  {
    drugAKeywords: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'benazepril'],
    drugBKeywords: ['spironolactone', 'eplerenone', 'triamterene', 'amiloride', 'potassium'],
    severity: 'high',
    conflictType: 'co_administration_timing',
    title: 'Dual RAAS / Aldosterone Blockade Hyperkalemia Spike',
    mechanism: 'Additive inhibition of distal tubular potassium excretion via combined ACE inhibition and mineralocorticoid receptor blockade',
    clinicalEffect: 'Severe hyperkalemia (K+ > 5.5 mEq/L) triggering ventricular arrhythmias, muscle paralysis, and acute prerenal azotemia',
    managementRecommendation: 'Separate administration by at least 3-4 hours; mandate weekly serum potassium and creatinine monitoring; hold if K+ > 5.2 mEq/L.',
    evidenceConfidence: 0.96,
    pathwayOverlap: ['Renal potassium clearance', 'Renin-Angiotensin-Aldosterone System (RAAS)'],
    suggestedAction: 'separate_times',
    minSeparationMinutes: 180,
    suggestedTimeOffsetHours: 4
  },
  {
    drugAKeywords: ['sacubitril', 'entresto', 'valsartan'],
    drugBKeywords: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'ace inhibitor'],
    severity: 'contraindicated',
    conflictType: 'regimen_contraindication',
    title: 'Absolute Contraindication: ARNI + ACE Inhibitor (Angioedema Risk)',
    mechanism: 'Dual inhibition of neprilysin and angiotensin-converting enzyme prevents degradation of vasoactive bradykinin and substance P',
    clinicalEffect: 'Life-threatening oropharyngeal and laryngeal angioedema with acute airway obstruction',
    managementRecommendation: 'Strictly prohibited: Stop ACE inhibitor immediately. Enforce a minimum mandatory 36-hour washout period before any Entresto dose.',
    evidenceConfidence: 0.99,
    pathwayOverlap: ['Bradykinin degradation cascade', 'Renin-Angiotensin System'],
    suggestedAction: 'hold_dose',
    minSeparationMinutes: 2160, // 36 hours
    suggestedTimeOffsetHours: 36
  },
  {
    drugAKeywords: ['clopidogrel', 'plavix'],
    drugBKeywords: ['omeprazole', 'esomeprazole', 'prilosec', 'nexium'],
    severity: 'high',
    conflictType: 'co_administration_timing',
    title: 'CYP2C19 Bioactivation Inhibition (Antiplatelet Efficacy Failure)',
    mechanism: 'Omeprazole irreversibly and competitively inhibits CYP2C19, blocking the two-step bioactivation of clopidogrel prodrug into active thiol metabolite',
    clinicalEffect: 'Loss of platelet P2Y12 receptor inhibition, leading to high risk of subacute stent thrombosis and secondary ischemic stroke',
    managementRecommendation: 'Separate dosing by 12 hours or switch PPI to Pantoprazole (minimal CYP2C19 affinity) or Famotidine (H2 blocker).',
    evidenceConfidence: 0.95,
    pathwayOverlap: ['CYP2C19 hepatic bioactivation'],
    suggestedAction: 'substitute_agent',
    minSeparationMinutes: 360,
    suggestedTimeOffsetHours: 8
  },
  {
    drugAKeywords: ['atorvastatin', 'simvastatin', 'lovastatin'],
    drugBKeywords: ['amlodipine', 'clarithromycin', 'ketoconazole', 'diltiazem', 'verapamil', 'grapefruit'],
    severity: 'moderate',
    conflictType: 'same_day_kinetic_overlap',
    title: 'CYP3A4 / OATP1B1 Clearance Competition (Statin AUC Surge)',
    mechanism: 'Competitive inhibition of CYP3A4-mediated oxidation and OATP1B1 hepatic influx elevates systemic statin plasma concentration',
    clinicalEffect: 'Increased statin AUC by 1.8-fold, precipitating myopathy, severe bilateral proximal myalgia, and rhabdomyolysis',
    managementRecommendation: 'Cap Atorvastatin at 20 mg/day; stagger dosing times (e.g. Amlodipine in morning, Atorvastatin at bedtime); or substitute Rosuvastatin.',
    evidenceConfidence: 0.91,
    pathwayOverlap: ['CYP3A4 oxidation', 'SLCO1B1/OATP1B1 transport'],
    suggestedAction: 'separate_times',
    minSeparationMinutes: 240,
    suggestedTimeOffsetHours: 6
  },
  {
    drugAKeywords: ['furosemide', 'torsemide', 'bumetanide', 'lasix'],
    drugBKeywords: ['empagliflozin', 'dapagliflozin', 'canagliflozin', 'jardiance', 'farxiga'],
    severity: 'moderate',
    conflictType: 'co_administration_timing',
    title: 'Synergistic Osmotic Diuresis & Acute Volume Depletion',
    mechanism: 'Combined loop Henle sodium-potassium-chloride inhibition and proximal tubular glucose-sodium cotransport inhibition',
    clinicalEffect: 'Accelerated intravascular volume contraction, orthostatic hypotension, dizziness, and transient eGFR drop > 25%',
    managementRecommendation: 'Stagger morning administration by 2 to 3 hours; ensure adequate hydration; consider a 25-50% loop diuretic dose reduction upon SGLT2i initiation.',
    evidenceConfidence: 0.89,
    pathwayOverlap: ['Renal tubular hemodynamics', 'Intravascular volume regulation'],
    suggestedAction: 'separate_times',
    minSeparationMinutes: 120,
    suggestedTimeOffsetHours: 3
  },
  {
    drugAKeywords: ['carvedilol', 'metoprolol', 'atenolol', 'bisoprolol'],
    drugBKeywords: ['diltiazem', 'verapamil', 'digoxin', 'clonidine'],
    severity: 'high',
    conflictType: 'co_administration_timing',
    title: 'Additive Negative Chronotropic & Dromotropic AV Block',
    mechanism: 'Dual suppression of SA node automaticity and AV node conduction velocity via beta-1 and L-type calcium channel blockade',
    clinicalEffect: 'Profound sinus bradycardia (HR < 45 bpm), syncope, high-grade AV block, and acute cardiac output collapse',
    managementRecommendation: 'Avoid simultaneous administration; separate dosing by 4+ hours; continuously monitor resting heart rate and PR interval on ECG.',
    evidenceConfidence: 0.94,
    pathwayOverlap: ['AV nodal electrophysiology', 'Cardiac conduction cascade'],
    suggestedAction: 'separate_times',
    minSeparationMinutes: 240,
    suggestedTimeOffsetHours: 4
  },
  {
    drugAKeywords: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'levothyroxine', 'synthroid'],
    drugBKeywords: ['calcium', 'magnesium', 'iron', 'ferrous', 'cyanocobalamin', 'multivitamin', 'antacid'],
    severity: 'high',
    conflictType: 'chelation_absorption',
    title: 'Multivalent Cation Chelation (Gastrointestinal Bioavailability Collapse)',
    mechanism: 'Polyvalent metal ions (Ca2+, Mg2+, Fe2+, Al3+) form insoluble coordination chelates with drug molecules in the stomach and duodenum',
    clinicalEffect: 'Oral gastrointestinal absorption reduced by 70% to 90%, causing clinical treatment failure and subtherapeutic antibiotic/hormone levels',
    managementRecommendation: 'Administer antibiotic or thyroid hormone at least 2 hours before or 4 to 6 hours after any multivalent cation supplement.',
    evidenceConfidence: 0.97,
    pathwayOverlap: ['Gastrointestinal chelation & mucosal influx'],
    suggestedAction: 'separate_times',
    minSeparationMinutes: 240,
    suggestedTimeOffsetHours: 4
  },
  {
    drugAKeywords: ['warfarin', 'coumadin'],
    drugBKeywords: ['amiodarone', 'fluconazole', 'metronidazole', 'aspirin', 'ibuprofen', 'naproxen'],
    severity: 'contraindicated',
    conflictType: 'additive_toxicity',
    title: 'Severe Pharmacokinetic/Pharmacodynamic Bleeding Escalation',
    mechanism: 'Profound CYP2C9 inhibition blocking S-warfarin clearance combined with platelet cyclooxygenase inhibition',
    clinicalEffect: 'Major gastrointestinal hemorrhage, retroperitoneal hematoma, and intracranial bleeding (INR > 4.5)',
    managementRecommendation: 'Contraindicated concurrent routine use. If required, reduce warfarin dose by 50% and perform daily INR monitoring; prefer DOAC (Apixaban).',
    evidenceConfidence: 0.98,
    pathwayOverlap: ['CYP2C9 clearance', 'Platelet aggregation & clotting cascade'],
    suggestedAction: 'substitute_agent',
    minSeparationMinutes: 720,
    suggestedTimeOffsetHours: 12
  }
];

// Pre-compiled combined rules catalog to avoid rebuilding on every call
const COMPILED_RULES: DdiRule[] = (() => {
  const allRules: DdiRule[] = [...EXTENDED_DDI_RULES];
  const severityMap: Record<string, 'contraindicated' | 'high' | 'moderate' | 'low'> = {
    contraindicated: 'contraindicated',
    high: 'high',
    moderate: 'moderate',
    low: 'low'
  };

  KNOWN_DRUG_INTERACTIONS.forEach((kdi) => {
    const exists = allRules.some((r) =>
      r.drugAKeywords.some((k) => kdi.drugA.toLowerCase().includes(k)) &&
      r.drugBKeywords.some((k) => kdi.drugB.toLowerCase().includes(k))
    );

    if (!exists) {
      allRules.push({
        drugAKeywords: [kdi.drugA.toLowerCase().split(' ')[0]],
        drugBKeywords: [kdi.drugB.toLowerCase().split(' ')[0]],
        severity: severityMap[kdi.severity] || 'high',
        conflictType: kdi.severity === 'contraindicated' ? 'regimen_contraindication' : 'co_administration_timing',
        title: `DDI Warning: ${kdi.drugA} + ${kdi.drugB}`,
        mechanism: kdi.mechanism,
        clinicalEffect: kdi.clinicalEffect,
        managementRecommendation: kdi.managementRecommendation,
        evidenceConfidence: kdi.evidenceConfidence,
        pathwayOverlap: kdi.pathwayOverlap,
        suggestedAction: kdi.severity === 'contraindicated' ? 'hold_dose' : 'separate_times',
        minSeparationMinutes: 180,
        suggestedTimeOffsetHours: 4
      });
    }
  });

  return allRules;
})();

// Fast LRU Cache for Conflict Analysis
const conflictCache = new Map<string, DoseDdiConflict[]>();
const MAX_CONFLICT_CACHE_SIZE = 80;

// Helper: Convert time "HH:mm" to total minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Helper: Convert minutes back to "HH:mm" string
export function minutesToTimeString(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Fast check if two drug names match a DDI rule
function matchesDdiRule(
  normA: string,
  normB: string,
  rule: DdiRule
): boolean {
  const aMatchesRuleA = rule.drugAKeywords.some((k) => normA.includes(k));
  const bMatchesRuleB = rule.drugBKeywords.some((k) => normB.includes(k));

  if (aMatchesRuleA && bMatchesRuleB) return true;

  const aMatchesRuleB = rule.drugBKeywords.some((k) => normA.includes(k));
  const bMatchesRuleA = rule.drugAKeywords.some((k) => normB.includes(k));

  return aMatchesRuleB && bMatchesRuleA;
}

// Helper to test if a schedule is active on a specific date string (YYYY-MM-DD)
export function isScheduleOnDate(
  schedule: MedicationScheduleReminder,
  dateStr: string
): boolean {
  if (schedule.status !== 'active') return false;
  if (dateStr < schedule.startDate) return false;
  if (schedule.endDate && dateStr > schedule.endDate) return false;

  if (schedule.frequencyType === 'daily') return true;

  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
  const dateObj = new Date(y, m - 1, d);

  if (schedule.frequencyType === 'weekly') {
    const dayMap: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ];
    const dayCode = dayMap[dateObj.getDay()];
    return !!schedule.daysOfWeek && schedule.daysOfWeek.includes(dayCode);
  }

  if (schedule.frequencyType === 'monthly') {
    return schedule.dayOfMonth === d;
  }

  return false;
}

/**
 * Main automated analyzer for detecting upcoming scheduled dose conflicts with active DDIs
 */
export function analyzeScheduleDdiConflicts(
  patient: PatientDigitalTwinState,
  schedules: MedicationScheduleReminder[],
  targetDateStr: string = '2026-08-25',
  daysWindow: number = 7
): DoseDdiConflict[] {
  // Build Cache Key
  const schedKey = schedules.map(s => `${s.id}:${s.status}:${s.dosage}:${s.timesOfDay.join(',')}`).join('|');
  const cacheKey = `${patient.patientId}:${targetDateStr}:${daysWindow}:${schedKey}`;

  if (conflictCache.has(cacheKey)) {
    return conflictCache.get(cacheKey)!;
  }

  const detectedConflicts: DoseDdiConflict[] = [];
  const processedKeys = new Set<string>();
  const activeSchedules = schedules.filter((s) => s.status === 'active');
  const now = new Date().toISOString();

  // Generate next N days date keys
  const [startY, startM, startD] = targetDateStr.split('-').map((n) => parseInt(n, 10));
  const dateKeys: string[] = new Array(daysWindow);
  for (let i = 0; i < daysWindow; i++) {
    const d = new Date(startY, startM - 1, startD + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    dateKeys[i] = `${yStr}-${mStr}-${dStr}`;
  }

  // Pre-normalize names for faster comparisons
  const normalizedScheduleNames = activeSchedules.map(s => s.medicationName.toLowerCase());

  // Evaluate all pairs of schedules across dates in the observation window
  for (let i = 0; i < activeSchedules.length; i++) {
    for (let j = i + 1; j < activeSchedules.length; j++) {
      const schedA = activeSchedules[i];
      const schedB = activeSchedules[j];
      const normA = normalizedScheduleNames[i];
      const normB = normalizedScheduleNames[j];

      // Find matching DDI rule between schedA and schedB
      const matchingRule = COMPILED_RULES.find((rule) =>
        matchesDdiRule(normA, normB, rule)
      );

      if (!matchingRule) continue;

      // Check dates where both schedules occur
      for (const dateKey of dateKeys) {
        const isAOnDate = isScheduleOnDate(schedA, dateKey);
        const isBOnDate = isScheduleOnDate(schedB, dateKey);

        if (!isAOnDate || !isBOnDate) continue;

        // Check dosage times on that date
        for (const timeA of schedA.timesOfDay) {
          for (const timeB of schedB.timesOfDay) {
            const minsA = timeStringToMinutes(timeA);
            const minsB = timeStringToMinutes(timeB);
            const deltaMins = Math.abs(minsA - minsB);

            const isTimeCollision = deltaMins <= matchingRule.minSeparationMinutes;
            const isRegimenConflict = matchingRule.severity === 'contraindicated' || matchingRule.conflictType === 'regimen_contraindication';

            if (isTimeCollision || isRegimenConflict) {
              const dedupeKey = `${patient.patientId}-${schedA.id}-${schedB.id}-${dateKey}-${timeA}-${timeB}`;
              if (processedKeys.has(dedupeKey)) continue;
              processedKeys.add(dedupeKey);

              detectedConflicts.push({
                id: `ddi-conflict-${dedupeKey}`,
                patientId: patient.patientId,
                drugA: schedA.medicationName,
                drugB: schedB.medicationName,
                scheduleAId: schedA.id,
                scheduleBId: schedB.id,
                dosageA: schedA.dosage,
                dosageB: schedB.dosage,
                timeA,
                timeB,
                date: dateKey,
                timeDeltaMinutes: deltaMins,
                severity: matchingRule.severity,
                title: matchingRule.title,
                conflictType: matchingRule.conflictType,
                mechanism: matchingRule.mechanism,
                clinicalEffect: matchingRule.clinicalEffect,
                managementRecommendation: matchingRule.managementRecommendation,
                evidenceConfidence: matchingRule.evidenceConfidence,
                pathwayOverlap: matchingRule.pathwayOverlap,
                suggestedAction: matchingRule.suggestedAction,
                suggestedTimeOffsetHours: matchingRule.suggestedTimeOffsetHours,
                timestamp: now
              });
            }
          }
        }
      }
    }
  }

  // Also check if any scheduled medication conflicts with patient's baseline medications
  activeSchedules.forEach((sched, schedIdx) => {
    const normSchedName = normalizedScheduleNames[schedIdx];

    patient.currentMedications.forEach((med) => {
      const normMedName = med.name.toLowerCase();
      if (normalizedScheduleNames.includes(normMedName)) {
        return;
      }

      const matchingRule = COMPILED_RULES.find((rule) =>
        matchesDdiRule(normSchedName, normMedName, rule)
      );

      if (matchingRule) {
        for (const dateKey of dateKeys) {
          if (!isScheduleOnDate(sched, dateKey)) continue;

          for (const timeA of sched.timesOfDay) {
            const dedupeKey = `${patient.patientId}-${sched.id}-${med.id}-${dateKey}-${timeA}`;
            if (processedKeys.has(dedupeKey)) continue;
            processedKeys.add(dedupeKey);

            detectedConflicts.push({
              id: `ddi-conflict-baseline-${dedupeKey}`,
              patientId: patient.patientId,
              drugA: sched.medicationName,
              drugB: med.name,
              scheduleAId: sched.id,
              dosageA: sched.dosage,
              dosageB: med.dosage,
              timeA,
              timeB: 'Baseline Continuous',
              date: dateKey,
              timeDeltaMinutes: 0,
              severity: matchingRule.severity,
              title: `${matchingRule.title} (with Baseline ${med.name})`,
              conflictType: matchingRule.conflictType,
              mechanism: matchingRule.mechanism,
              clinicalEffect: matchingRule.clinicalEffect,
              managementRecommendation: matchingRule.managementRecommendation,
              evidenceConfidence: matchingRule.evidenceConfidence,
              pathwayOverlap: matchingRule.pathwayOverlap,
              suggestedAction: matchingRule.suggestedAction,
              suggestedTimeOffsetHours: matchingRule.suggestedTimeOffsetHours,
              timestamp: now
            });
          }
        }
      }
    });
  });

  const sortedConflicts = detectedConflicts.sort((a, b) => {
    const severityOrder = { contraindicated: 0, high: 1, moderate: 2, low: 3 };
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.timeA.localeCompare(b.timeA);
  });

  // Store in cache
  if (conflictCache.size >= MAX_CONFLICT_CACHE_SIZE) {
    const firstKey = conflictCache.keys().next().value;
    if (firstKey) conflictCache.delete(firstKey);
  }
  conflictCache.set(cacheKey, sortedConflicts);

  return sortedConflicts;
}

/**
 * Calculates quick lookup map for fast UI badge lookups on calendar items
 */
export function buildDdiConflictLookupMap(conflicts: DoseDdiConflict[]): {
  byScheduleId: Record<string, DoseDdiConflict[]>;
  byDateAndSchedule: Record<string, DoseDdiConflict[]>;
  byDateAndTime: Record<string, DoseDdiConflict[]>;
} {
  const byScheduleId: Record<string, DoseDdiConflict[]> = {};
  const byDateAndSchedule: Record<string, DoseDdiConflict[]> = {};
  const byDateAndTime: Record<string, DoseDdiConflict[]> = {};

  conflicts.forEach((c) => {
    if (!byScheduleId[c.scheduleAId]) byScheduleId[c.scheduleAId] = [];
    byScheduleId[c.scheduleAId].push(c);

    if (c.scheduleBId) {
      if (!byScheduleId[c.scheduleBId]) byScheduleId[c.scheduleBId] = [];
      byScheduleId[c.scheduleBId].push(c);
    }

    const dateSchedAKey = `${c.date}_${c.scheduleAId}`;
    if (!byDateAndSchedule[dateSchedAKey]) byDateAndSchedule[dateSchedAKey] = [];
    byDateAndSchedule[dateSchedAKey].push(c);

    if (c.scheduleBId) {
      const dateSchedBKey = `${c.date}_${c.scheduleBId}`;
      if (!byDateAndSchedule[dateSchedBKey]) byDateAndSchedule[dateSchedBKey] = [];
      byDateAndSchedule[dateSchedBKey].push(c);
    }

    const dateTimeAKey = `${c.date}_${c.timeA}`;
    if (!byDateAndTime[dateTimeAKey]) byDateAndTime[dateTimeAKey] = [];
    byDateAndTime[dateTimeAKey].push(c);

    if (c.timeB && c.timeB !== 'Baseline Continuous') {
      const dateTimeBKey = `${c.date}_${c.timeB}`;
      if (!byDateAndTime[dateTimeBKey]) byDateAndTime[dateTimeBKey] = [];
      byDateAndTime[dateTimeBKey].push(c);
    }
  });

  return { byScheduleId, byDateAndSchedule, byDateAndTime };
}
