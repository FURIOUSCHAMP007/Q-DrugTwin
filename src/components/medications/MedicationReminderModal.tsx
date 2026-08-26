import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Pill,
  Bell,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Mail,
  FileText
} from 'lucide-react';
import { PatientDigitalTwinState, MedicationScheduleReminder, ScheduleFrequencyType, Medication } from '../../types';
import { CANDIDATE_MEDICATIONS } from '../../data/mockDatabase';

interface MedicationReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: MedicationScheduleReminder) => void;
  patient: PatientDigitalTwinState;
  initialSchedule?: MedicationScheduleReminder | null;
}

const PRESET_INSTRUCTIONS = [
  'Take with morning meal to minimize gastrointestinal upset',
  'Take on an empty stomach 30-60 minutes before breakfast',
  'Take at bedtime with or without food',
  'Take with a full glass of water (≥200ml)',
  'Check blood pressure and resting pulse prior to dose',
  'Strict 12-hour interval adherence required',
  'Dissolve sublingually; do not chew or swallow whole'
];

const PRESET_TIMES = [
  { label: 'Morning (Breakfast)', time: '08:00' },
  { label: 'Midday (Lunch)', time: '12:30' },
  { label: 'Evening (Dinner)', time: '19:00' },
  { label: 'Bedtime', time: '21:30' }
];

const DAYS_OF_WEEK: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

const COLOR_OPTIONS = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Indigo', hex: '#6366F1' }
];

export const MedicationReminderModal: React.FC<MedicationReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patient,
  initialSchedule
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [customMedName, setCustomMedName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [route, setRoute] = useState<string>('Oral (Tablet)');
  const [frequencyType, setFrequencyType] = useState<ScheduleFrequencyType>('daily');
  const [timesOfDay, setTimesOfDay] = useState<string[]>(['08:00']);
  const [daysOfWeek, setDaysOfWeek] = useState<('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[]>(['Mon']);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('2026-08-25');
  const [endDate, setEndDate] = useState<string>('');
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [instruction, setInstruction] = useState<string>('');
  const [specialPrecautions, setSpecialPrecautions] = useState<string>('');
  const [channels, setChannels] = useState<('in_app' | 'sms' | 'email' | 'ehr_alert')[]>(['in_app', 'sms']);
  const [priority, setPriority] = useState<'standard' | 'high_adherence_risk' | 'critical_titration'>('standard');
  const [refillReminderEnabled, setRefillReminderEnabled] = useState<boolean>(true);
  const [refillDaysNotice, setRefillDaysNotice] = useState<number>(5);
  const [colorTag, setColorTag] = useState<string>('#3B82F6');
  const [customTimeInput, setCustomTimeInput] = useState<string>('12:00');

  // Available medications combining patient's current regimen and candidate medications catalog
  const availableMedications: { id: string; name: string; dosage: string; isCurrent: boolean }[] = [
    ...patient.currentMedications.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      isCurrent: true
    })),
    ...CANDIDATE_MEDICATIONS.filter(
      (c) => !patient.currentMedications.some((m) => m.name.toLowerCase() === c.name.toLowerCase())
    ).map((c) => ({
      id: c.id,
      name: `${c.name} (${c.brandName || 'Candidate'})`,
      dosage: c.dosage,
      isCurrent: false
    }))
  ];

  useEffect(() => {
    if (initialSchedule) {
      setSelectedMedId(initialSchedule.medicationId);
      setCustomMedName(initialSchedule.medicationName);
      setDosage(initialSchedule.dosage);
      setRoute(initialSchedule.route || 'Oral (Tablet)');
      setFrequencyType(initialSchedule.frequencyType);
      setTimesOfDay(initialSchedule.timesOfDay || ['08:00']);
      setDaysOfWeek(initialSchedule.daysOfWeek || ['Mon']);
      setDayOfMonth(initialSchedule.dayOfMonth || 1);
      setStartDate(initialSchedule.startDate || '2026-08-25');
      setEndDate(initialSchedule.endDate || '');
      setHasEndDate(!!initialSchedule.endDate);
      setInstruction(initialSchedule.administrationInstruction || '');
      setSpecialPrecautions(initialSchedule.specialPrecautions || '');
      setChannels(initialSchedule.notificationChannels || ['in_app', 'sms']);
      setPriority(initialSchedule.priority || 'standard');
      setRefillReminderEnabled(initialSchedule.refillReminderEnabled ?? true);
      setRefillDaysNotice(initialSchedule.refillDaysNotice || 5);
      setColorTag(initialSchedule.colorTag || '#3B82F6');
    } else {
      // Default to first active medication if available
      if (patient.currentMedications.length > 0) {
        const firstMed = patient.currentMedications[0];
        setSelectedMedId(firstMed.id);
        setCustomMedName(firstMed.name);
        setDosage(firstMed.dosage);
      }
      setFrequencyType('daily');
      setTimesOfDay(['08:00']);
      setDaysOfWeek(['Mon']);
      setDayOfMonth(1);
      setStartDate('2026-08-25');
      setEndDate('');
      setHasEndDate(false);
      setInstruction(PRESET_INSTRUCTIONS[0]);
      setChannels(['in_app', 'sms']);
      setPriority('standard');
      setRefillReminderEnabled(true);
      setRefillDaysNotice(5);
      setColorTag(COLOR_OPTIONS[0].hex);
    }
  }, [initialSchedule, isOpen, patient]);

  if (!isOpen) return null;

  const handleMedicationChange = (id: string) => {
    setSelectedMedId(id);
    if (id === 'custom') {
      setCustomMedName('');
      setDosage('');
    } else {
      const match = availableMedications.find((m) => m.id === id);
      if (match) {
        setCustomMedName(match.name.split(' (')[0]);
        setDosage(match.dosage);
      }
    }
  };

  const handleAddTime = (time: string) => {
    if (!timesOfDay.includes(time)) {
      setTimesOfDay([...timesOfDay, time].sort());
    }
  };

  const handleRemoveTime = (time: string) => {
    if (timesOfDay.length > 1) {
      setTimesOfDay(timesOfDay.filter((t) => t !== time));
    }
  };

  const toggleDayOfWeek = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun') => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const toggleChannel = (ch: 'in_app' | 'sms' | 'email' | 'ehr_alert') => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== ch));
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedName.trim() || !dosage.trim()) return;

    const scheduleToSave: MedicationScheduleReminder = {
      id: initialSchedule?.id || `sched-${patient.patientId}-${Date.now()}`,
      patientId: patient.patientId,
      medicationId: selectedMedId === 'custom' ? `custom-${Date.now()}` : selectedMedId,
      medicationName: customMedName.trim(),
      dosage: dosage.trim(),
      route: route.trim(),
      frequencyType,
      timesOfDay,
      daysOfWeek: frequencyType === 'weekly' ? daysOfWeek : undefined,
      dayOfMonth: frequencyType === 'monthly' ? dayOfMonth : undefined,
      startDate,
      endDate: hasEndDate && endDate ? endDate : undefined,
      administrationInstruction: instruction.trim() || undefined,
      specialPrecautions: specialPrecautions.trim() || undefined,
      notificationChannels: channels,
      priority,
      refillReminderEnabled,
      refillDaysNotice,
      status: initialSchedule?.status || 'active',
      createdAt: initialSchedule?.createdAt || new Date().toISOString(),
      colorTag,
      adherenceHistory: initialSchedule?.adherenceHistory || []
    };

    onSave(scheduleToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {initialSchedule ? 'Edit Medication Dosage Schedule & Reminder' : 'Set New Medication Dosage Reminder'}
              </h3>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-800">{patient.name.split(' (')[0]}</span> (ID: {patient.patientId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Medication Selection & Details */}
          <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#0F172A] uppercase">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>1. Medication & Formulation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Medication
                </label>
                <select
                  value={selectedMedId}
                  onChange={(e) => handleMedicationChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <optgroup label="Active Current Regimen">
                    {availableMedications.filter((m) => m.isCurrent).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dosage})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Candidate Therapies">
                    {availableMedications.filter((m) => !m.isCurrent).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dosage})
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">+ Add Custom Drug / Lab Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="e.g. Metformin HCl"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dosage Strength
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500 mg or 24/26 mg"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Administration Route
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Oral (Tablet)">Oral (Tablet)</option>
                  <option value="Oral (Capsule)">Oral (Capsule)</option>
                  <option value="Oral (Liquid)">Oral (Liquid)</option>
                  <option value="Oral (Sublingual)">Oral (Sublingual)</option>
                  <option value="Subcutaneous (Injection)">Subcutaneous (Injection)</option>
                  <option value="Inhalation">Inhalation</option>
                  <option value="Transdermal (Patch)">Transdermal (Patch)</option>
                  <option value="Clinical Review / Lab">Clinical Review / Lab</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Frequency & Reminder Interval Schedule */}
          <div className="space-y-3.5 p-4 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#0F172A] uppercase">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>2. Frequency & Calendar Timing</span>
              </div>

              {/* Frequency Type Tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 text-xs font-mono">
                {(['daily', 'weekly', 'monthly'] as ScheduleFrequencyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFrequencyType(type)}
                    className={`px-3 py-1 rounded-md capitalize font-bold transition-all ${
                      frequencyType === type
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Timing Selection */}
            {frequencyType === 'daily' && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-slate-700">
                  Dosage Times of Day ({timesOfDay.length} times/day)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {timesOfDay.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-mono font-bold flex items-center space-x-1.5 border border-blue-200"
                    >
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{t}</span>
                      {timesOfDay.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(t)}
                          className="text-blue-600 hover:text-rose-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {/* Preset Quick Add Buttons */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Quick Add Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TIMES.map((preset) => (
                      <button
                        key={preset.time}
                        type="button"
                        onClick={() => handleAddTime(preset.time)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-xs font-mono hover:border-blue-300 transition-colors"
                      >
                        + {preset.label} ({preset.time})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Time Input */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="time"
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTime(customTimeInput)}
                    className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Add Custom Time
                  </button>
                </div>
              </div>
            )}

            {/* Weekly Day of Week Selection */}
            {frequencyType === 'weekly' && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-slate-700">
                  Select Days of Week
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = daysOfWeek.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayOfWeek(day)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <label className="text-xs text-slate-600 font-medium">Time of Dose:</label>
                  <input
                    type="time"
                    value={timesOfDay[0] || '09:00'}
                    onChange={(e) => setTimesOfDay([e.target.value])}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Monthly Day of Month Selection */}
            {frequencyType === 'monthly' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Day of the Month (Recurring Monthly Reminder)
                  </label>
                  <div className="flex items-center space-x-3">
                    <select
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Day {d} of every month
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-slate-600 font-medium">Time:</label>
                      <input
                        type="time"
                        value={timesOfDay[0] || '09:00'}
                        onChange={(e) => setTimesOfDay([e.target.value])}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dates Horizon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
                    End Date (Optional)
                  </label>
                  <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEndDate}
                      onChange={(e) => setHasEndDate(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Set cutoff</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={!hasEndDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                    hasEndDate
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Instructions & Special Precautions */}
          <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#0F172A] uppercase">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>3. Administration Instructions & Patient Precautions</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Patient Administration Guidance
              </label>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. Take with morning meal to avoid stomach upset"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_INSTRUCTIONS.slice(0, 3).map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInstruction(p)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-emerald-50 border border-slate-200 text-slate-600 hover:text-emerald-800 transition-colors truncate max-w-[280px]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Clinical Precautions & Toxicity Warnings
              </label>
              <input
                type="text"
                value={specialPrecautions}
                onChange={(e) => setSpecialPrecautions(e.target.value)}
                placeholder="e.g. Hold dose if systolic BP < 105; monitor renal function"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 4: Notification Channels, Priority & Color Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFF] border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 font-mono uppercase">
                Reminder Channels
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'in_app', label: 'EHR / In-App Notification', icon: Bell },
                  { id: 'sms', label: 'Patient Mobile SMS Reminder', icon: Smartphone },
                  { id: 'ehr_alert', label: 'Clinical Care Team Flag', icon: AlertTriangle },
                  { id: 'email', label: 'Email Digest', icon: Mail }
                ].map((item) => {
                  const isChecked = channels.includes(item.id as any);
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.id}
                      className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChannel(item.id as any)}
                        className="rounded text-blue-600"
                      />
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Adherence Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-medium"
                >
                  <option value="standard">Standard Maintenance</option>
                  <option value="high_adherence_risk">High Adherence Risk (Missed Dose Alert)</option>
                  <option value="critical_titration">Critical Titration / Narrow Index</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Calendar Color Tag
                </label>
                <div className="flex items-center space-x-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColorTag(c.hex)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        colorTag === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{initialSchedule ? 'Update Schedule & Reminders' : 'Save & Activate Reminder Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
