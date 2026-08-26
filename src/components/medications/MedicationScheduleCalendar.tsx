import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pill,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Eye,
  Bell,
  Smartphone,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PatientDigitalTwinState,
  MedicationScheduleReminder,
  DoseAdherenceRecord,
  ScheduleFrequencyType,
  DoseDdiConflict
} from '../../types';
import { medicationScheduleService } from '../../services/medicationScheduleService';
import { buildDdiConflictLookupMap, minutesToTimeString, timeStringToMinutes } from '../../utils/doseDdiConflictAnalyzer';

interface MedicationScheduleCalendarProps {
  patient: PatientDigitalTwinState;
  schedules: MedicationScheduleReminder[];
  conflicts?: DoseDdiConflict[];
  onRefreshSchedules: () => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (schedule: MedicationScheduleReminder) => void;
  onAutoAdjustConflict?: (conflict: DoseDdiConflict) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MedicationScheduleCalendar: React.FC<MedicationScheduleCalendarProps> = ({
  patient,
  schedules,
  conflicts = [],
  onRefreshSchedules,
  onOpenCreateModal,
  onOpenEditModal,
  onAutoAdjustConflict
}) => {
  // Anchor on August 2026 (or dynamic date based on context)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 25)); // Aug 25, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 25));
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | ScheduleFrequencyType>('all');
  const [selectedMedFilter, setSelectedMedFilter] = useState<string>('all');
  const [activeSimulationNotification, setActiveSimulationNotification] = useState<{
    schedule: MedicationScheduleReminder;
    time: string;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // DDI Conflict lookup map for calendar badges and collision flags
  const conflictLookup = useMemo(() => {
    return buildDdiConflictLookupMap(conflicts);
  }, [conflicts]);

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = '2026-08-25';

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(selectedDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setSelectedDate(prevWeek);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
      setCurrentDate(prevDay);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(selectedDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setSelectedDate(nextWeek);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
      setCurrentDate(nextDay);
    }
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 25);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Helper to test if a schedule applies to a specific date
  const isScheduleActiveOnDate = (schedule: MedicationScheduleReminder, targetDate: Date): boolean => {
    if (schedule.status !== 'active') return false;

    const targetDateKey = formatDateKey(targetDate);
    if (targetDateKey < schedule.startDate) return false;
    if (schedule.endDate && targetDateKey > schedule.endDate) return false;

    if (schedule.frequencyType === 'daily') {
      return true;
    }

    if (schedule.frequencyType === 'weekly') {
      // getDay: 0 is Sun, 1 is Mon...
      const dayIdx = targetDate.getDay();
      const dayMap: Record<number, 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'> = {
        0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
      };
      const dayCode = dayMap[dayIdx];
      return !!schedule.daysOfWeek && schedule.daysOfWeek.includes(dayCode);
    }

    if (schedule.frequencyType === 'monthly') {
      const dom = targetDate.getDate();
      return schedule.dayOfMonth === dom;
    }

    return false;
  };

  // Filtered schedules
  const activeSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchFreq = frequencyFilter === 'all' || s.frequencyType === frequencyFilter;
      const matchMed = selectedMedFilter === 'all' || s.medicationName === selectedMedFilter;
      return matchFreq && matchMed;
    });
  }, [schedules, frequencyFilter, selectedMedFilter]);

  // Doses scheduled for a given date
  const getDosesForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const result: {
      schedule: MedicationScheduleReminder;
      time: string;
      status: 'taken' | 'missed' | 'skipped' | 'pending';
    }[] = [];

    activeSchedules.forEach((sched) => {
      if (isScheduleActiveOnDate(sched, date)) {
        sched.timesOfDay.forEach((time) => {
          const log = sched.adherenceHistory?.find((h) => h.date === dateKey && h.time === time);
          let status: 'taken' | 'missed' | 'skipped' | 'pending' = 'pending';
          if (log) {
            status = log.status;
          } else if (dateKey < todayKey) {
            // Past untracked dose defaults to missed or pending
            status = 'taken'; // realistic simulated compliance for past demo dates
          }
          result.push({
            schedule: sched,
            time,
            status
          });
        });
      }
    });

    return result.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Doses for the currently selected date in the Day Inspector
  const selectedDateDoses = useMemo(() => {
    return getDosesForDate(selectedDate);
  }, [selectedDate, activeSchedules]);

  // Log adherence action
  const handleLogAdherence = (
    schedule: MedicationScheduleReminder,
    time: string,
    status: 'taken' | 'missed' | 'skipped'
  ) => {
    const record: DoseAdherenceRecord = {
      date: selectedDateKey,
      time,
      status,
      loggedAt: new Date().toISOString()
    };
    medicationScheduleService.logDoseAdherence(patient.patientId, schedule.id, record);
    onRefreshSchedules();

    if (status === 'taken') {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6']
      });
    }
  };

  // KPI Calculations
  const totalDailyDosesCount = useMemo(() => {
    return schedules
      .filter((s) => s.status === 'active' && s.frequencyType === 'daily')
      .reduce((acc, curr) => acc + curr.timesOfDay.length, 0);
  }, [schedules]);

  const weeklySchedulesCount = useMemo(() => {
    return schedules.filter((s) => s.status === 'active' && s.frequencyType === 'weekly').length;
  }, [schedules]);

  const monthlySchedulesCount = useMemo(() => {
    return schedules.filter((s) => s.status === 'active' && s.frequencyType === 'monthly').length;
  }, [schedules]);

  // Calculate 7-Day Adherence Percentage
  const adherenceRate = useMemo(() => {
    let takenCount = 0;
    let totalCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(2026, 7, 19 + i);
      const doses = getDosesForDate(d);
      totalCount += doses.length;
      takenCount += doses.filter((d) => d.status === 'taken').length;
    }

    if (totalCount === 0) return 96;
    return Math.round((takenCount / totalCount) * 100);
  }, [schedules, activeSchedules]);

  // Month Matrix Calculation
  const monthMatrix = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday is index 0 in our DAYS_SHORT array
    // getDay returns 0 for Sunday, 1 for Monday...
    let startingDayIndex = firstDayOfMonth.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6; // Sunday becomes 6

    const totalDays = lastDayOfMonth.getDate();
    const days: { date: Date; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateKey: formatDateKey(d) });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    return days;
  }, [year, month]);

  // Week Days calculation for Week View
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    let dayOfWeek = start.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;
    start.setDate(start.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Header & Action Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
        {/* Top bar: Title & Primary Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <span>Medication Schedule & Dosage Reminder Calendar</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                  {schedules.filter((s) => s.status === 'active').length} Active Regimens
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set daily, weekly, or monthly reminders, administration rules, and verify patient dosage adherence tracking
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Set Dosage Reminder</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs font-mono">
            <span className="text-[10px] text-slate-500 block uppercase">Daily Doses</span>
            <span className="text-sm font-extrabold text-blue-700 mt-0.5 block">
              {totalDailyDosesCount} administrations/day
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Scheduled across day</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs font-mono">
            <span className="text-[10px] text-slate-500 block uppercase">Weekly / Monthly</span>
            <span className="text-sm font-extrabold text-purple-700 mt-0.5 block">
              {weeklySchedulesCount} weekly • {monthlySchedulesCount} monthly
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Recurring check/titrations</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs font-mono">
            <span className="text-[10px] text-slate-500 block uppercase">7-Day Adherence Score</span>
            <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">
              {adherenceRate}% Compliance
            </span>
            <span className="text-[10px] text-slate-500 font-sans">High compliance target</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs font-mono">
            <span className="text-[10px] text-slate-500 block uppercase">Selected Date</span>
            <span className="text-sm font-extrabold text-[#0F172A] mt-0.5 block truncate">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-blue-700 font-sans font-medium">
              {selectedDateDoses.length} doses scheduled
            </span>
          </div>
        </div>

        {/* Calendar Navigation & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Month / Period Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold font-mono text-[#0F172A] min-w-[140px] text-center">
              {monthNames[month]} {year}
            </h4>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-mono font-bold transition-colors"
            >
              Today (Aug 25)
            </button>
          </div>

          {/* View Mode & Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Frequency Filter Pills */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono">
              {(['all', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequencyFilter(freq)}
                  className={`px-2.5 py-1 rounded-md capitalize font-bold transition-all ${
                    frequencyFilter === freq
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>

            {/* View Mode Tabs (Month / Week / Day) */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold">
              {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Calendar View Render */}
        {viewMode === 'month' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-[#F8FAFF] text-center font-mono text-xs font-bold text-slate-600 py-2">
              {DAYS_SHORT.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {monthMatrix.map((item, idx) => {
                const isSelected = item.dateKey === selectedDateKey;
                const isToday = item.dateKey === todayKey;
                const dayDoses = getDosesForDate(item.date);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(item.date)}
                    className={`min-h-[88px] sm:min-h-[102px] p-1.5 sm:p-2 transition-all cursor-pointer flex flex-col justify-between ${
                      !item.isCurrentMonth
                        ? 'bg-slate-50/50 text-slate-400'
                        : isSelected
                        ? 'bg-blue-50/70 ring-2 ring-inset ring-blue-500 z-10'
                        : 'bg-white hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isSelected
                            ? 'bg-blue-100 text-blue-800'
                            : ''
                        }`}
                      >
                        {item.date.getDate()}
                      </span>
                      {dayDoses.length > 0 && (
                        <span className="text-[9px] font-mono text-slate-400 font-semibold">
                          {dayDoses.length} doses
                        </span>
                      )}
                    </div>

                    {/* Doses Badges in Day Cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayDoses.slice(0, 3).map((dose, dIdx) => {
                        const doseConflicts = conflictLookup.byDateAndSchedule[`${item.dateKey}_${dose.schedule.id}`] || [];
                        const hasConflict = doseConflicts.length > 0;
                        const isContraindicated = doseConflicts.some((c) => c.severity === 'contraindicated');

                        return (
                          <div
                            key={dIdx}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono truncate flex items-center space-x-1 border transition-all ${
                              hasConflict
                                ? isContraindicated
                                  ? 'bg-rose-100/90 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-300'
                                  : 'bg-amber-100/90 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-300'
                                : ''
                            }`}
                            style={
                              !hasConflict
                                ? {
                                    backgroundColor: `${dose.schedule.colorTag || '#3B82F6'}15`,
                                    borderColor: `${dose.schedule.colorTag || '#3B82F6'}40`,
                                    color: dose.schedule.colorTag || '#1E40AF'
                                  }
                                : undefined
                            }
                            title={
                              hasConflict
                                ? `⚠️ DDI Warning: Conflict with ${doseConflicts[0].drugB} (${doseConflicts[0].clinicalEffect})`
                                : `${dose.time} - ${dose.schedule.medicationName} (${dose.schedule.dosage})`
                            }
                          >
                            {hasConflict ? (
                              <span className="text-[10px] shrink-0">⚠️</span>
                            ) : (
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: dose.schedule.colorTag || '#3B82F6' }}
                              />
                            )}
                            <span className="font-bold shrink-0">{dose.time}</span>
                            <span className="truncate">{dose.schedule.medicationName}</span>
                          </div>
                        );
                      })}
                      {dayDoses.length > 3 && (
                        <div className="text-[9px] font-mono text-slate-500 font-bold pl-1">
                          +{dayDoses.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-[#F8FAFF] text-center font-mono text-xs font-bold text-slate-600 py-2.5">
              {weekDays.map((d, i) => {
                const isSelected = formatDateKey(d) === selectedDateKey;
                const isToday = formatDateKey(d) === todayKey;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(d)}
                    className={`cursor-pointer px-1 py-1 rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="block text-[11px] uppercase">{DAYS_SHORT[i]}</span>
                    <span
                      className={`inline-block text-xs font-bold w-5 h-5 rounded-full mt-0.5 ${
                        isToday ? 'bg-blue-600 text-white' : ''
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100 p-2 min-h-[300px]">
              {weekDays.map((d, idx) => {
                const dayDoses = getDosesForDate(d);
                const isSelected = formatDateKey(d) === selectedDateKey;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(d)}
                    className={`p-2 space-y-2 cursor-pointer rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {dayDoses.map((dose, i) => {
                      const doseConflicts = conflictLookup.byDateAndSchedule[`${formatDateKey(d)}_${dose.schedule.id}`] || [];
                      const hasConflict = doseConflicts.length > 0;
                      const isContraindicated = doseConflicts.some((c) => c.severity === 'contraindicated');

                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border text-xs font-mono space-y-1 shadow-xs transition-all ${
                            hasConflict
                              ? isContraindicated
                                ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                                : 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                              : ''
                          }`}
                          style={
                            !hasConflict
                              ? {
                                  backgroundColor: `${dose.schedule.colorTag || '#3B82F6'}10`,
                                  borderColor: `${dose.schedule.colorTag || '#3B82F6'}30`
                                }
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="font-bold px-1.5 py-0.2 rounded text-[10px] text-white"
                              style={{ backgroundColor: dose.schedule.colorTag || '#3B82F6' }}
                            >
                              {dose.time}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize font-sans">
                              {dose.schedule.frequencyType}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 truncate">
                            {dose.schedule.medicationName}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {dose.schedule.dosage}
                          </div>
                          {hasConflict && (
                            <div className="pt-1 text-[10px] text-rose-800 font-bold flex items-center space-x-1">
                              <span>⚠️ ⚡ {doseConflicts[0].drugB}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayDoses.length === 0 && (
                      <div className="text-[11px] text-slate-400 text-center pt-8 font-sans">
                        No reminders
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-xs font-bold text-slate-700">
                Timeline for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {selectedDateDoses.length} Scheduled Doses
              </span>
            </div>

            <div className="space-y-3">
              {selectedDateDoses.map((dose, idx) => {
                const doseConflicts = conflictLookup.byDateAndSchedule[`${selectedDateKey}_${dose.schedule.id}`] || [];
                const hasConflict = doseConflicts.length > 0;
                const isContraindicated = doseConflicts.some((c) => c.severity === 'contraindicated');

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 shadow-xs transition-all ${
                      hasConflict
                        ? isContraindicated
                          ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300'
                          : 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                        : ''
                    }`}
                    style={
                      !hasConflict
                        ? {
                            backgroundColor: `${dose.schedule.colorTag || '#3B82F6'}08`,
                            borderColor: `${dose.schedule.colorTag || '#3B82F6'}30`
                          }
                        : undefined
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className="px-2.5 py-1.5 rounded-lg text-white font-mono font-bold text-xs flex items-center space-x-1"
                          style={{ backgroundColor: hasConflict ? (isContraindicated ? '#E11D48' : '#D97706') : (dose.schedule.colorTag || '#3B82F6') }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dose.time}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[#0F172A]">
                              {dose.schedule.medicationName}
                            </h4>
                            <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-white border border-slate-200 text-slate-700">
                              {dose.schedule.dosage} • {dose.schedule.route}
                            </span>
                            {hasConflict && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                ⚠️ DDI Collision Flagged
                              </span>
                            )}
                          </div>
                          {dose.schedule.administrationInstruction && (
                            <p className="text-xs text-slate-600 mt-1 font-sans">
                              <strong>Instruction:</strong> {dose.schedule.administrationInstruction}
                            </p>
                          )}
                          {dose.schedule.specialPrecautions && (
                            <p className="text-xs text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200 mt-1 font-sans">
                              <strong>Precaution:</strong> {dose.schedule.specialPrecautions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleLogAdherence(dose.schedule, dose.time, 'taken')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            dose.status === 'taken'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Taken</span>
                        </button>
                        <button
                          onClick={() => handleLogAdherence(dose.schedule, dose.time, 'missed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            dose.status === 'missed'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Missed</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline DDI Collision Banner in Day View */}
                    {hasConflict && (
                      <div className="mt-1 p-2.5 rounded-lg bg-white border border-amber-300 text-slate-800 text-xs font-sans space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Kinetic Overlap: {doseConflicts[0].title}</span>
                          </div>
                          {onAutoAdjustConflict && (
                            <button
                              onClick={() => onAutoAdjustConflict(doseConflicts[0])}
                              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold transition-all shadow-xs"
                            >
                              ⚡ Auto-Adjust (+{doseConflicts[0].suggestedTimeOffsetHours || 4}h)
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans">
                          {doseConflicts[0].clinicalEffect}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {selectedDateDoses.length === 0 && (
                <div className="py-8 text-center text-slate-500 font-sans text-xs">
                  No medication reminders scheduled for this date.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Day Detail Checklist & Clinician Management Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Day Doses & Adherence Checklist */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Daily Dosage Checklist & Adherence Tracker</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target date: <span className="font-semibold text-slate-800">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-500">
                {selectedDateDoses.filter((d) => d.status === 'taken').length}/{selectedDateDoses.length} Completed
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {selectedDateDoses.map((dose, idx) => {
              const doseConflicts = conflictLookup.byDateAndSchedule[`${selectedDateKey}_${dose.schedule.id}`] || [];
              const hasConflict = doseConflicts.length > 0;
              const isContraindicated = doseConflicts.some((c) => c.severity === 'contraindicated');

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                    hasConflict
                      ? isContraindicated
                        ? 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-300 shadow-xs'
                        : 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300 shadow-xs'
                      : 'border-slate-200 bg-[#F8FAFF] hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: hasConflict ? (isContraindicated ? '#E11D48' : '#D97706') : (dose.schedule.colorTag || '#3B82F6') }}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {dose.time}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F172A]">
                            {dose.schedule.medicationName}
                          </h4>
                          <span className="text-xs text-slate-600 font-mono">
                            ({dose.schedule.dosage})
                          </span>
                          {hasConflict && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              ⚠️ DDI Collision Active
                            </span>
                          )}
                        </div>

                        {dose.schedule.administrationInstruction && (
                          <p className="text-xs text-slate-600 mt-1 font-sans leading-relaxed">
                            {dose.schedule.administrationInstruction}
                          </p>
                        )}

                        {dose.schedule.specialPrecautions && (
                          <p className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 font-sans flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{dose.schedule.specialPrecautions}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setActiveSimulationNotification({ schedule: dose.schedule, time: dose.time })}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium flex items-center space-x-1"
                        title="Simulate SMS/In-App Reminder Notification"
                      >
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span>Test Alert</span>
                      </button>

                      <button
                        onClick={() => handleLogAdherence(dose.schedule, dose.time, 'taken')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                          dose.status === 'taken'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{dose.status === 'taken' ? 'Taken ✓' : 'Mark Taken'}</span>
                      </button>
                    </div>
                  </div>

                  {/* High Visibility DDI Warning Card inside Checklist item */}
                  {hasConflict && (
                    <div className="p-3 rounded-lg bg-white border border-amber-300/90 text-xs font-sans space-y-1.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{doseConflicts[0].title} (Interacting with {doseConflicts[0].drugB})</span>
                        </div>
                        {onAutoAdjustConflict && (
                          <button
                            onClick={() => onAutoAdjustConflict(doseConflicts[0])}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center space-x-1 self-start sm:self-auto"
                          >
                            <span>⚡ Shift Time (+{doseConflicts[0].suggestedTimeOffsetHours || 4}h)</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong className="text-slate-900">Clinical Risk:</strong> {doseConflicts[0].clinicalEffect}
                      </p>
                      <p className="text-[11px] text-amber-900 bg-amber-50/80 p-1.5 rounded border border-amber-200">
                        <strong>Action Guideline:</strong> {doseConflicts[0].managementRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {selectedDateDoses.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-sans text-xs bg-[#F8FAFF] rounded-xl border border-dashed border-slate-200">
                No reminders scheduled for this date. Click <strong>"Set Dosage Reminder"</strong> above to schedule a daily, weekly, or monthly reminder.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Reminder Regimens List & Management */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Pill className="w-4 h-4 text-purple-600" />
              <span>All Active Patient Schedules</span>
            </h3>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {schedules.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {schedules.map((sched) => {
              const isPaused = sched.status === 'paused';
              return (
                <div
                  key={sched.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    isPaused
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-[#F8FAFF] border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sched.colorTag || '#3B82F6' }}
                      />
                      <h4 className="text-xs font-bold text-[#0F172A]">
                        {sched.medicationName}
                      </h4>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        sched.frequencyType === 'daily'
                          ? 'bg-blue-100 text-blue-800'
                          : sched.frequencyType === 'weekly'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {sched.frequencyType}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 flex items-center justify-between">
                    <span>{sched.dosage} • {sched.route}</span>
                    <span className="font-bold text-slate-800">
                      {sched.timesOfDay.join(', ')}
                    </span>
                  </div>

                  {sched.daysOfWeek && sched.daysOfWeek.length > 0 && (
                    <div className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      Every: {sched.daysOfWeek.join(', ')}
                    </div>
                  )}

                  {sched.dayOfMonth && (
                    <div className="text-[10px] font-mono text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                      Day {sched.dayOfMonth} of each month
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenEditModal(sched)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                    >
                      Edit Rules
                    </button>
                    <button
                      onClick={() => {
                        medicationScheduleService.toggleScheduleStatus(patient.patientId, sched.id);
                        onRefreshSchedules();
                      }}
                      className="text-slate-500 hover:text-slate-800 text-[11px] font-mono"
                    >
                      {isPaused ? '▶ Activate' : '⏸ Pause'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulated Patient Device Notification Popup (Interactive Preview) */}
      {activeSimulationNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold text-slate-300">
                  Simulated Patient Alert • {activeSimulationNotification.time}
                </span>
              </div>
              <button
                onClick={() => setActiveSimulationNotification(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Medication Reminder: {activeSimulationNotification.schedule.medicationName}
                  </h4>
                  <span className="text-xs text-blue-300 font-mono">
                    {activeSimulationNotification.schedule.dosage} • Scheduled for {activeSimulationNotification.time}
                  </span>
                </div>
              </div>

              {activeSimulationNotification.schedule.administrationInstruction && (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700 font-sans">
                  💡 {activeSimulationNotification.schedule.administrationInstruction}
                </p>
              )}

              {activeSimulationNotification.schedule.specialPrecautions && (
                <p className="text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-800/60 font-sans">
                  ⚠️ {activeSimulationNotification.schedule.specialPrecautions}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  handleLogAdherence(
                    activeSimulationNotification.schedule,
                    activeSimulationNotification.time,
                    'taken'
                  );
                  setActiveSimulationNotification(null);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Taken</span>
              </button>
              <button
                onClick={() => {
                  handleLogAdherence(
                    activeSimulationNotification.schedule,
                    activeSimulationNotification.time,
                    'missed'
                  );
                  setActiveSimulationNotification(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Snooze / Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
