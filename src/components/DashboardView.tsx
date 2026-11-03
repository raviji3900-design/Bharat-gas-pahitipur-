import React from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee, AttendanceRecord, AppSettings } from '../types';
import { Language, translations } from '../utils/i18n';
import { formatDateKey } from '../utils/storage';
import { TabType } from './BottomNav';

interface DashboardViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  language: Language;
  onNavigateTab: (tab: TabType) => void;
  onMarkAllPresent: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  attendance,
  settings,
  language,
  onNavigateTab,
  onMarkAllPresent,
  selectedDate,
  onSelectDate,
}) => {
  const t = translations[language];
  const activeEmployees = employees.filter((e) => e.isActive);

  // Today's records
  const todayRecords = attendance.filter((r) => r.date === selectedDate);
  const presentCount = todayRecords.filter((r) => r.status === 'PRESENT').length;
  const absentCount = todayRecords.filter((r) => r.status === 'ABSENT').length;
  const leaveCount = todayRecords.filter((r) => r.status === 'LEAVE').length;
  const halfDayCount = todayRecords.filter((r) => r.status === 'HALF_DAY').length;
  const markedCount = todayRecords.length;
  const unmarkedCount = Math.max(0, activeEmployees.length - markedCount);

  // Monthly stats
  const currentMonthStr = selectedDate.substring(0, 7); // YYYY-MM
  const monthRecords = attendance.filter((r) => r.date.startsWith(currentMonthStr));
  const monthPresents = monthRecords.filter((r) => r.status === 'PRESENT').length;
  const monthHalfDays = monthRecords.filter((r) => r.status === 'HALF_DAY').length;
  const monthLeaves = monthRecords.filter((r) => r.status === 'LEAVE').length;
  const monthEffective = monthPresents + monthHalfDays * 0.5 + monthLeaves;
  const totalSlotsPossible = activeEmployees.length * settings.fixedWorkingDays;
  const monthlyRate =
    totalSlotsPossible > 0
      ? Math.min(100, Math.round((monthEffective / totalSlotsPossible) * 100))
      : 0;

  const handleQuickMarkAll = () => {
    onMarkAllPresent();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
    });
  };

  const isToday = selectedDate === formatDateKey(new Date());

  return (
    <div className="flex-1 p-4 space-y-4">
      {/* Top Welcome / Date bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {settings.companyName}
          </span>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
            {t.todayOverview}
          </h1>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* APK Banner Quick Card */}
      <div
        onClick={() => onNavigateTab('apk')}
        className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-2xl p-3.5 text-white shadow-lg cursor-pointer hover:shadow-emerald-900/20 transition flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold bg-white text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                APK v1.0
              </span>
              <span className="text-xs font-semibold text-emerald-100">
                {t.androidReady}
              </span>
            </div>
            <p className="text-xs text-white/90 font-medium mt-0.5">
              {t.downloadApk} & Source Code
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold bg-white/10 px-2.5 py-1.5 rounded-xl">
          <span>Get</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Employees */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
              {activeEmployees.length}/10 Max
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeEmployees.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t.totalEmployees}
          </p>
        </div>

        {/* Present Today */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 shadow-sm hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
              {activeEmployees.length > 0
                ? Math.round((presentCount / activeEmployees.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {presentCount}
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            {t.presentToday}
          </p>
        </div>

        {/* Absent Today */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200/70 dark:border-rose-800/50 shadow-sm hover:border-rose-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
              {activeEmployees.length > 0
                ? Math.round((absentCount / activeEmployees.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
            {absentCount}
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
            {t.absentToday}
          </p>
        </div>

        {/* On Leave Today */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-800/50 shadow-sm hover:border-amber-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              {leaveCount + halfDayCount}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
            {leaveCount}
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            {t.onLeaveToday} {halfDayCount > 0 && `(+${halfDayCount} Half)`}
          </p>
        </div>
      </div>

      {/* Monthly Attendance Progress Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              {t.monthlyPercentage}
            </span>
          </div>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {monthlyRate}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${monthlyRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {monthPresents} {t.statusPresent} | {monthLeaves} {t.statusLeave}
          </span>
          <button
            onClick={() => onNavigateTab('reports')}
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>{t.viewAllRecords}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* One-Click Quick Action Banner */}
      {unmarkedCount > 0 && isToday && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{unmarkedCount} Pending Today</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Record attendance in 1 click
            </p>
          </div>
          <button
            onClick={handleQuickMarkAll}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.quickMarkPresent}</span>
          </button>
        </div>
      )}

      {/* Active Employees Quick List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {t.employeeManagement} ({activeEmployees.length}/10)
          </h2>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t.navAttendance}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-56 overflow-y-auto">
          {activeEmployees.slice(0, 5).map((emp) => {
            const todayRec = todayRecords.find((r) => r.employeeId === emp.id);

            return (
              <div
                key={emp.id}
                onClick={() => onNavigateTab('attendance')}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer rounded-lg px-1 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={emp.photo}
                    alt={emp.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                      {emp.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {emp.designation} • {emp.id}
                    </p>
                  </div>
                </div>

                <div>
                  {todayRec ? (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        todayRec.status === 'PRESENT'
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : todayRec.status === 'ABSENT'
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                          : todayRec.status === 'LEAVE'
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {todayRec.status === 'PRESENT'
                        ? t.statusPresent
                        : todayRec.status === 'ABSENT'
                        ? t.statusAbsent
                        : todayRec.status === 'LEAVE'
                        ? t.statusLeave
                        : t.statusHalfDay}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {t.statusUnmarked}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
