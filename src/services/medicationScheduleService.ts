import { MedicationScheduleReminder, DoseAdherenceRecord, PatientDigitalTwinState } from '../types';

const SCHEDULES_STORAGE_KEY = 'quantum_rx_medication_schedules';

// Initial default realistic clinical schedules tailored to each mock patient
const DEFAULT_SCHEDULES: Record<string, MedicationScheduleReminder[]> = {
  // Eleanor Vance (P-88219) - Type 2 Diabetes, HTN, Dyslipidemia, Stage 3a CKD
  'P-88219': [
    {
      id: 'sched-ev-1',
      patientId: 'P-88219',
      medicationId: 'med-metformin-1000',
      medicationName: 'Metformin HCl',
      dosage: '500 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['08:00', '19:30'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take with morning and evening meals to minimize gastrointestinal symptoms',
      specialPrecautions: 'Monitor eGFR every 3 months. Do not exceed 1000 mg/day max clearance cap.',
      notificationChannels: ['in_app', 'sms'],
      priority: 'high_adherence_risk',
      refillReminderEnabled: true,
      refillDaysNotice: 5,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#3B82F6', // Blue
      adherenceHistory: [
        { date: '2026-08-23', time: '08:00', status: 'taken', loggedAt: '2026-08-23T08:12:00Z' },
        { date: '2026-08-23', time: '19:30', status: 'taken', loggedAt: '2026-08-23T19:40:00Z' },
        { date: '2026-08-24', time: '08:00', status: 'taken', loggedAt: '2026-08-24T08:05:00Z' },
        { date: '2026-08-24', time: '19:30', status: 'taken', loggedAt: '2026-08-24T19:35:00Z' },
        { date: '2026-08-25', time: '08:00', status: 'taken', loggedAt: '2026-08-25T08:02:00Z' }
      ]
    },
    {
      id: 'sched-ev-2',
      patientId: 'P-88219',
      medicationId: 'med-atorvastatin-20',
      medicationName: 'Atorvastatin Calcium',
      dosage: '20 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['21:00'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take once daily at bedtime with or without food',
      specialPrecautions: 'Report any unexplained muscle ache or dark urine (SLCO1B1 *1/*5 variant).',
      notificationChannels: ['in_app', 'sms'],
      priority: 'standard',
      refillReminderEnabled: true,
      refillDaysNotice: 7,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#8B5CF6', // Purple
      adherenceHistory: [
        { date: '2026-08-23', time: '21:00', status: 'taken', loggedAt: '2026-08-23T21:10:00Z' },
        { date: '2026-08-24', time: '21:00', status: 'taken', loggedAt: '2026-08-24T21:15:00Z' }
      ]
    },
    {
      id: 'sched-ev-3',
      patientId: 'P-88219',
      medicationId: 'med-lisinopril-10',
      medicationName: 'Lisinopril',
      dosage: '10 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['08:30'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take every morning. Check blood pressure before dosing.',
      specialPrecautions: 'Hold dose and notify clinic if systolic BP < 105 mmHg or dizziness occurs.',
      notificationChannels: ['in_app', 'ehr_alert'],
      priority: 'standard',
      refillReminderEnabled: true,
      refillDaysNotice: 5,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#10B981', // Emerald
      adherenceHistory: [
        { date: '2026-08-23', time: '08:30', status: 'taken', loggedAt: '2026-08-23T08:30:00Z' },
        { date: '2026-08-24', time: '08:30', status: 'taken', loggedAt: '2026-08-24T08:35:00Z' },
        { date: '2026-08-25', time: '08:30', status: 'taken', loggedAt: '2026-08-25T08:31:00Z' }
      ]
    },
    {
      id: 'sched-ev-4',
      patientId: 'P-88219',
      medicationId: 'med-b12-weekly',
      medicationName: 'Cyanocobalamin (Vitamin B12)',
      dosage: '1000 mcg',
      route: 'Oral (Sublingual)',
      frequencyType: 'weekly',
      timesOfDay: ['09:00'],
      daysOfWeek: ['Sun'],
      startDate: '2026-08-01',
      administrationInstruction: 'Place sublingually every Sunday morning; let dissolve completely',
      specialPrecautions: 'Metformin-induced malabsorption prophylaxis',
      notificationChannels: ['in_app', 'sms'],
      priority: 'standard',
      refillReminderEnabled: false,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#F59E0B', // Amber
      adherenceHistory: [
        { date: '2026-08-16', time: '09:00', status: 'taken', loggedAt: '2026-08-16T09:05:00Z' },
        { date: '2026-08-23', time: '09:00', status: 'taken', loggedAt: '2026-08-23T09:15:00Z' }
      ]
    },
    {
      id: 'sched-ev-5',
      patientId: 'P-88219',
      medicationId: 'med-semaglutide-monthly-titration',
      medicationName: 'GLP-1 RA Clinical Assessment & Refill',
      dosage: 'Monthly Check',
      route: 'Clinical Review',
      frequencyType: 'monthly',
      timesOfDay: ['10:00'],
      dayOfMonth: 1,
      startDate: '2026-08-01',
      administrationInstruction: 'Monthly titration review and glycemic tolerance monitoring reminder',
      specialPrecautions: 'Check fasting glucose and renal panel before stepping up dosage',
      notificationChannels: ['in_app', 'ehr_alert', 'email'],
      priority: 'critical_titration',
      refillReminderEnabled: true,
      refillDaysNotice: 3,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#EC4899', // Pink
      adherenceHistory: [
        { date: '2026-08-01', time: '10:00', status: 'taken', loggedAt: '2026-08-01T10:00:00Z' }
      ]
    }
  ],

  // Arthur Pendelton (P-99042) - HFrEF, Atrial Fibrillation, Gout, Stage 3b CKD
  'P-99042': [
    {
      id: 'sched-ap-1',
      patientId: 'P-99042',
      medicationId: 'med-sacubitril-valsartan',
      medicationName: 'Sacubitril/Valsartan',
      dosage: '24/26 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['08:00', '20:00'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take twice daily exactly 12 hours apart. Maintain consistent hydration.',
      specialPrecautions: 'Monitor sitting/standing BP. Do not take with ACE inhibitor.',
      notificationChannels: ['in_app', 'sms', 'ehr_alert'],
      priority: 'critical_titration',
      refillReminderEnabled: true,
      refillDaysNotice: 5,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#EF4444', // Red
      adherenceHistory: [
        { date: '2026-08-24', time: '08:00', status: 'taken', loggedAt: '2026-08-24T08:01:00Z' },
        { date: '2026-08-24', time: '20:00', status: 'taken', loggedAt: '2026-08-24T20:05:00Z' },
        { date: '2026-08-25', time: '08:00', status: 'taken', loggedAt: '2026-08-25T08:03:00Z' }
      ]
    },
    {
      id: 'sched-ap-2',
      patientId: 'P-99042',
      medicationId: 'med-carvedilol',
      medicationName: 'Carvedilol',
      dosage: '6.25 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['08:30', '20:30'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take with meals to slow absorption rate and minimize orthostatic risk',
      specialPrecautions: 'Check pulse before taking. Hold if resting HR < 55 bpm.',
      notificationChannels: ['in_app', 'sms'],
      priority: 'high_adherence_risk',
      refillReminderEnabled: true,
      refillDaysNotice: 7,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#3B82F6',
      adherenceHistory: [
        { date: '2026-08-24', time: '08:30', status: 'taken', loggedAt: '2026-08-24T08:35:00Z' },
        { date: '2026-08-24', time: '20:30', status: 'taken', loggedAt: '2026-08-24T20:30:00Z' },
        { date: '2026-08-25', time: '08:30', status: 'taken', loggedAt: '2026-08-25T08:32:00Z' }
      ]
    },
    {
      id: 'sched-ap-3',
      patientId: 'P-99042',
      medicationId: 'med-allopurinol',
      medicationName: 'Allopurinol',
      dosage: '100 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['13:00'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take after lunch with plenty of water (at least 200ml)',
      specialPrecautions: 'Renally adjusted for CKD stage 3b. Report skin rash immediately.',
      notificationChannels: ['in_app'],
      priority: 'standard',
      refillReminderEnabled: true,
      refillDaysNotice: 5,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#059669',
      adherenceHistory: [
        { date: '2026-08-24', time: '13:00', status: 'taken', loggedAt: '2026-08-24T13:05:00Z' }
      ]
    },
    {
      id: 'sched-ap-4',
      patientId: 'P-99042',
      medicationId: 'med-apixaban',
      medicationName: 'Apixaban',
      dosage: '2.5 mg',
      route: 'Oral (Tablet)',
      frequencyType: 'daily',
      timesOfDay: ['09:00', '21:00'],
      startDate: '2026-08-01',
      administrationInstruction: 'Take twice daily with or without food. Strict 12-hour adherence required.',
      specialPrecautions: 'Non-valvular Afib stroke prevention. Dose reduced for Age 72 + Cr 1.9 mg/dL.',
      notificationChannels: ['in_app', 'sms', 'ehr_alert'],
      priority: 'high_adherence_risk',
      refillReminderEnabled: true,
      refillDaysNotice: 5,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#D97706',
      adherenceHistory: [
        { date: '2026-08-24', time: '09:00', status: 'taken', loggedAt: '2026-08-24T09:02:00Z' },
        { date: '2026-08-24', time: '21:00', status: 'taken', loggedAt: '2026-08-24T21:00:00Z' },
        { date: '2026-08-25', time: '09:00', status: 'taken', loggedAt: '2026-08-25T09:05:00Z' }
      ]
    },
    {
      id: 'sched-ap-5',
      patientId: 'P-99042',
      medicationId: 'med-spironolactone-weekly-check',
      medicationName: 'Potassium & Renal Panel Lab Reminder',
      dosage: 'Serum K+ Check',
      route: 'Outpatient Lab',
      frequencyType: 'weekly',
      timesOfDay: ['08:00'],
      daysOfWeek: ['Mon'],
      startDate: '2026-08-01',
      administrationInstruction: 'Fasting morning blood draw for serum potassium and serum creatinine',
      specialPrecautions: 'Dual RAAS / MRA hyperkalemia surveillance',
      notificationChannels: ['in_app', 'sms', 'ehr_alert'],
      priority: 'critical_titration',
      refillReminderEnabled: false,
      status: 'active',
      createdAt: '2026-08-01T08:00:00Z',
      colorTag: '#6366F1',
      adherenceHistory: [
        { date: '2026-08-17', time: '08:00', status: 'taken', loggedAt: '2026-08-17T08:15:00Z' },
        { date: '2026-08-24', time: '08:00', status: 'taken', loggedAt: '2026-08-24T08:20:00Z' }
      ]
    }
  ]
};

class MedicationScheduleService {
  private getAllSchedules(): Record<string, MedicationScheduleReminder[]> {
    try {
      const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse medication schedules from storage, using defaults', e);
    }
    return DEFAULT_SCHEDULES;
  }

  private saveAllSchedules(allSchedules: Record<string, MedicationScheduleReminder[]>): void {
    try {
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(allSchedules));
    } catch (e) {
      console.error('Failed to save medication schedules to storage', e);
    }
  }

  public getPatientSchedules(patientId: string, fallbackPatient?: PatientDigitalTwinState): MedicationScheduleReminder[] {
    const all = this.getAllSchedules();
    if (all[patientId] && all[patientId].length > 0) {
      return all[patientId];
    }

    if (DEFAULT_SCHEDULES[patientId]) {
      return DEFAULT_SCHEDULES[patientId];
    }

    // Auto-generate from patient current medications if not found
    if (fallbackPatient) {
      const generated = this.generateDefaultSchedulesForPatient(fallbackPatient);
      all[patientId] = generated;
      this.saveAllSchedules(all);
      return generated;
    }

    return [];
  }

  public saveSchedule(schedule: MedicationScheduleReminder): void {
    const all = this.getAllSchedules();
    const patientSchedules = all[schedule.patientId] || [];
    
    const existingIndex = patientSchedules.findIndex((s) => s.id === schedule.id);
    if (existingIndex >= 0) {
      patientSchedules[existingIndex] = {
        ...schedule,
        adherenceHistory: schedule.adherenceHistory || patientSchedules[existingIndex].adherenceHistory || []
      };
    } else {
      patientSchedules.push({
        ...schedule,
        createdAt: schedule.createdAt || new Date().toISOString()
      });
    }

    all[schedule.patientId] = patientSchedules;
    this.saveAllSchedules(all);
  }

  public deleteSchedule(patientId: string, scheduleId: string): void {
    const all = this.getAllSchedules();
    if (all[patientId]) {
      all[patientId] = all[patientId].filter((s) => s.id !== scheduleId);
      this.saveAllSchedules(all);
    }
  }

  public toggleScheduleStatus(patientId: string, scheduleId: string): MedicationScheduleReminder | null {
    const all = this.getAllSchedules();
    if (all[patientId]) {
      const schedule = all[patientId].find((s) => s.id === scheduleId);
      if (schedule) {
        schedule.status = schedule.status === 'active' ? 'paused' : 'active';
        this.saveAllSchedules(all);
        return schedule;
      }
    }
    return null;
  }

  public logDoseAdherence(
    patientId: string,
    scheduleId: string,
    record: DoseAdherenceRecord
  ): void {
    const all = this.getAllSchedules();
    if (all[patientId]) {
      const schedule = all[patientId].find((s) => s.id === scheduleId);
      if (schedule) {
        if (!schedule.adherenceHistory) {
          schedule.adherenceHistory = [];
        }
        // Remove prior entry for same date and time if any
        schedule.adherenceHistory = schedule.adherenceHistory.filter(
          (h) => !(h.date === record.date && h.time === record.time)
        );
        schedule.adherenceHistory.push(record);
        this.saveAllSchedules(all);
      }
    }
  }

  public generateDefaultSchedulesForPatient(patient: PatientDigitalTwinState): MedicationScheduleReminder[] {
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
    const nowStr = '2026-08-01';

    return patient.currentMedications.map((med, idx) => {
      const freqLower = med.frequency.toLowerCase();
      let frequencyType: 'daily' | 'weekly' | 'monthly' = 'daily';
      let timesOfDay: string[] = ['08:00'];
      let daysOfWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] | undefined;
      let dayOfMonth: number | undefined;

      if (freqLower.includes('twice') || freqLower.includes('bid')) {
        timesOfDay = ['08:00', '20:00'];
      } else if (freqLower.includes('three') || freqLower.includes('tid')) {
        timesOfDay = ['08:00', '13:00', '20:00'];
      } else if (freqLower.includes('weekly')) {
        frequencyType = 'weekly';
        timesOfDay = ['09:00'];
        daysOfWeek = ['Mon'];
      } else if (freqLower.includes('monthly')) {
        frequencyType = 'monthly';
        timesOfDay = ['09:00'];
        dayOfMonth = 1;
      } else if (freqLower.includes('bedtime') || freqLower.includes('night') || freqLower.includes('evening')) {
        timesOfDay = ['21:00'];
      }

      return {
        id: `sched-${patient.patientId}-${med.id}`,
        patientId: patient.patientId,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        route: med.route || 'Oral',
        frequencyType,
        timesOfDay,
        daysOfWeek,
        dayOfMonth,
        startDate: nowStr,
        administrationInstruction: `Take ${med.dosage} ${med.frequency} as directed.`,
        specialPrecautions: med.mechanismSummary ? `Target: ${med.mechanismSummary.slice(0, 80)}...` : undefined,
        notificationChannels: ['in_app', 'sms'],
        priority: 'standard',
        refillReminderEnabled: true,
        refillDaysNotice: 5,
        status: 'active',
        createdAt: '2026-08-01T08:00:00Z',
        colorTag: colors[idx % colors.length],
        adherenceHistory: [
          { date: '2026-08-24', time: timesOfDay[0], status: 'taken', loggedAt: '2026-08-24T08:05:00Z' },
          { date: '2026-08-25', time: timesOfDay[0], status: 'taken', loggedAt: '2026-08-25T08:05:00Z' }
        ]
      };
    });
  }
}

export const medicationScheduleService = new MedicationScheduleService();
