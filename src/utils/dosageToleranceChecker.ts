import { Medication, DosageToleranceThreshold } from '../types';

/**
 * Parses dosage string into daily numeric milligram amount and frequency multiplier.
 * Examples:
 *  - "1000 mg" + "Twice daily" => 2000 mg/day
 *  - "20 mg" + "Once daily" => 20 mg/day
 *  - "24/26 mg" + "Twice daily" => 100 mg/day total active moiety
 *  - "2.5 mcg" + "Once daily" => 0.0025 mg/day
 *  - "2 g" + "Twice daily" => 4000 mg/day
 */
export function parseDailyDoseMg(dosageStr: string, frequencyStr?: string): { dailyDoseMg: number; singleDoseMg: number; unit: string } {
  if (!dosageStr) return { dailyDoseMg: 0, singleDoseMg: 0, unit: 'mg' };

  let singleDoseMg = 0;
  let unit = 'mg';

  const cleanStr = dosageStr.toLowerCase().trim();

  // Multi-component combinations like Sacubitril/Valsartan "24/26 mg"
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split(/[\s/]+/);
    let sum = 0;
    for (const part of parts) {
      const num = parseFloat(part);
      if (!isNaN(num)) {
        sum += num;
      }
    }
    if (sum > 0) {
      singleDoseMg = sum;
    }
  } else if (cleanStr.includes('mcg') || cleanStr.includes('µg')) {
    const match = cleanStr.match(/([\d.]+)\s*(?:mcg|µg)/);
    if (match) {
      singleDoseMg = parseFloat(match[1]) / 1000;
      unit = 'mcg';
    }
  } else if (cleanStr.includes('g') && !cleanStr.includes('mg')) {
    const match = cleanStr.match(/([\d.]+)\s*g/);
    if (match) {
      singleDoseMg = parseFloat(match[1]) * 1000;
      unit = 'g';
    }
  } else {
    const match = cleanStr.match(/([\d.]+)\s*(?:mg)?/);
    if (match) {
      singleDoseMg = parseFloat(match[1]);
      unit = 'mg';
    }
  }

  // Calculate frequency multiplier
  let frequencyMultiplier = 1;
  const freq = (frequencyStr || '').toLowerCase();

  if (freq.includes('twice') || freq.includes('bid') || freq.includes('2 times') || freq.includes('q12h')) {
    frequencyMultiplier = 2;
  } else if (freq.includes('three') || freq.includes('tid') || freq.includes('3 times') || freq.includes('q8h')) {
    frequencyMultiplier = 3;
  } else if (freq.includes('four') || freq.includes('qid') || freq.includes('4 times') || freq.includes('q6h')) {
    frequencyMultiplier = 4;
  } else if (freq.includes('weekly') || freq.includes('every 2 weeks') || freq.includes('qweek')) {
    frequencyMultiplier = freq.includes('every 2 weeks') ? 1 / 14 : 1 / 7;
  } else {
    frequencyMultiplier = 1;
  }

  const dailyDoseMg = singleDoseMg * frequencyMultiplier;
  return { dailyDoseMg, singleDoseMg, unit };
}

/**
 * Checks a proposed or active medication against digital twin historical dosage tolerance thresholds.
 */
export function checkDosageTolerance(
  med: Medication,
  thresholds: DosageToleranceThreshold[] = []
): {
  isExceeded: boolean;
  proposedDailyDoseMg: number;
  maxDailyDoseMg: number;
  percentageExceeded: number;
  threshold: DosageToleranceThreshold | null;
} {
  const { dailyDoseMg } = parseDailyDoseMg(med.dosage, med.frequency);
  const medNameLower = med.name.toLowerCase();

  const matchingThreshold = thresholds.find((t) => {
    const tNameLower = t.medicationName.toLowerCase();
    return medNameLower.includes(tNameLower) || tNameLower.includes(medNameLower);
  });

  if (!matchingThreshold) {
    return {
      isExceeded: false,
      proposedDailyDoseMg: dailyDoseMg,
      maxDailyDoseMg: 0,
      percentageExceeded: 0,
      threshold: null
    };
  }

  const isExceeded = dailyDoseMg > matchingThreshold.maxDailyDoseMg;
  const percentageExceeded = isExceeded
    ? Math.round(((dailyDoseMg - matchingThreshold.maxDailyDoseMg) / matchingThreshold.maxDailyDoseMg) * 100)
    : 0;

  return {
    isExceeded,
    proposedDailyDoseMg: dailyDoseMg,
    maxDailyDoseMg: matchingThreshold.maxDailyDoseMg,
    percentageExceeded,
    threshold: matchingThreshold
  };
}
