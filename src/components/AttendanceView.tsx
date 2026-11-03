import React, { useState } from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee, AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import { Language, translations } from '../utils/i18n';
import { formatDateKey } from '../utils/storage';

interface AttendanceViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onMarkAttendance: (employeeId: string, date: string, status: AttendanceStatus) => void;
  onClearDateAttendance: (date: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  settings: AppSettings;
  language: Language;
  onRequirePinAuth: (onSuccess: () => void) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  employees,
  attendance,
  onMarkAttendance,
  onClearDateAttendance,
  selectedDate,
  onSelectDate,
  settings,
  language,
  onRequirePinAuth,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | AttendanceStatus>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeEmployees = employees.filter((e) => e.isActive);
  const todayRecords = attendance.filter((r) => r.date === selectedDate);

  // Trigger quick toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Change date by offset in days
  const handleDateOffset = (offsetDays: number) => {
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    cur.setDate(cur.getDate() + offsetDays);
    onSelectDate(formatDateKey(cur));
  };

  // Date formatted display
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDateString = dateObj.toLocaleDateString(
    language === 'hi' ? 'hi-IN' : 'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const isToday = selectedDate === formatDateKey(new Date());

  // Filter employees
  const filteredEmployees = activeEmployees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    const rec = todayRecords.find((r) => r.employeeId === emp.id);

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return !rec;
    return rec?.status === statusFilter;
  });

  const handleMark = (employee: Employee, status: AttendanceStatus) => {
    // Check if modifying a past date when PIN protection is enabled
    if (!isToday && settings.pinEnabled) {
      onRequirePinAuth(() => {
        executeMark(employee, status);
      });
    } else {
      executeMark(employee, status);
    }
  };

  const executeMark = (employee: Employee, status: AttendanceStatus) => {
    onMarkAttendance(employee.id, selectedDate, status);
    if (navigator.vibrate) navigator.vibrate(50);

    const statusName =
      status === 'PRESENT'
        ? t.statusPresent
        : status === 'ABSENT'
        ? t.statusAbsent
        : status === 'LEAVE'
        ? t.statusLeave
        : t.statusHalfDay;

    showToast(`${employee.name}: ${statusName}`);
  };

  const handleMarkAllPresent = () => {
    activeEmployees.forEach((emp) => {
      onMarkAttendance(emp.id, selectedDate, 'PRESENT');
    });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#059669', '#10b981'],
    });
    showToast(t.allMarkedPresentSuccess);
  };

  const handleClearDate = () => {
    if (window.confirm(t.confirmClear)) {
      if (!isToday && settings.pinEnabled) {
        onRequirePinAuth(() => {
          onClearDateAttendance(selectedDate);
          showToast('Attendance cleared');
        });
      } else {
        onClearDateAttendance(selectedDate);
        showToast('Attendance cleared');
      }
    }
  };

  return (
    <div className="flex-1 p-3.5 space-y-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-emerald-500/30 flex items-center gap-1.5 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Date Navigator Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <button
          onClick={() => handleDateOffset(-1)}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formattedDateString}
            </span>
            {isToday && (
              <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full">
                {t.today}
              </span>
            )}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-transparent border-none cursor-pointer focus:outline-none"
          />
        </div>

        <button
          onClick={() => handleDateOffset(1)}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Batch Actions & Date Info */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleMarkAllPresent}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.quickMarkPresent}</span>
        </button>

        <button
          onClick={handleClearDate}
          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium transition flex items-center gap-1"
          title="Clear all records for this date"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.clearAttendance}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs scrollbar-none">
        {[
          { id: 'ALL', label: t.filterAll },
          { id: 'PENDING', label: t.filterPending },
          { id: 'PRESENT', label: t.statusPresent },
          { id: 'ABSENT', label: t.statusAbsent },
          { id: 'LEAVE', label: t.statusLeave },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id as typeof statusFilter)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
              statusFilter === f.id
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Attendance List */}
      <div className="space-y-2.5">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            {t.noEmployeesFound}
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const record = todayRecords.find((r) => r.employeeId === emp.id);
            const currentStatus = record?.status;

            return (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2.5 hover:border-emerald-500/40 transition"
              >
                {/* Employee Row Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={emp.photo}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {emp.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {emp.id}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {emp.designation} • {emp.department}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp & Status Badge */}
                  <div className="text-right">
                    {record ? (
                      <div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                              : currentStatus === 'ABSENT'
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                              : currentStatus === 'LEAVE'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {currentStatus === 'PRESENT'
                            ? t.statusPresent
                            : currentStatus === 'ABSENT'
                            ? t.statusAbsent
                            : currentStatus === 'LEAVE'
                            ? t.statusLeave
                            : t.statusHalfDay}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{record.timestamp}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full font-medium">
                        {t.statusUnmarked}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Tactile Android Quick Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  {/* Present Button */}
                  <button
                    onClick={() => handleMark(emp, 'PRESENT')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      currentStatus === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500'
                        : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.statusPresent}</span>
                  </button>

                  {/* Absent Button */}
                  <button
                    onClick={() => handleMark(emp, 'ABSENT')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      currentStatus === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500'
                        : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{t.statusAbsent}</span>
                  </button>

                  {/* Leave Button */}
                  <button
                    onClick={() => handleMark(emp, 'LEAVE')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      currentStatus === 'LEAVE'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                        : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.statusLeave}</span>
                  </button>

                  {/* Half Day Button */}
                  <button
                    onClick={() => handleMark(emp, 'HALF_DAY')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 ${
                      currentStatus === 'HALF_DAY'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500'
                        : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.statusHalfDay}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
