import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Employee, AttendanceRecord, AppSettings, AttendanceStatus } from '../types';
import { Language, translations } from '../utils/i18n';
import { exportMonthlyAttendancePdf } from '../utils/exportPdf';
import { exportMonthlyAttendanceExcel } from '../utils/exportExcel';

interface ReportsViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  language: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  attendance,
  settings,
  language,
}) => {
  const t = translations[language];

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-11
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesHi = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  const currentMonthName = language === 'hi' ? monthNamesHi[selectedMonth] : monthNames[selectedMonth];
  const monthStrKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Filter records for this month
  const monthRecords = attendance.filter((r) => r.date.startsWith(monthStrKey));

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Calculate working days (excluding Sundays)
  let calendarWorkingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(selectedYear, selectedMonth, day);
    if (d.getDay() !== 0) { // Not Sunday
      calendarWorkingDays++;
    }
  }

  const effectiveWorkingDays =
    settings.workingDaysMode === 'FIXED_26'
      ? 26
      : settings.workingDaysMode === 'FIXED_30'
      ? 30
      : calendarWorkingDays;

  // Company totals
  const totalPresents = monthRecords.filter((r) => r.status === 'PRESENT').length;
  const totalAbsents = monthRecords.filter((r) => r.status === 'ABSENT').length;
  const totalLeaves = monthRecords.filter((r) => r.status === 'LEAVE').length;
  const totalHalfDays = monthRecords.filter((r) => r.status === 'HALF_DAY').length;

  const handleDownloadPdf = () => {
    exportMonthlyAttendancePdf({
      companyName: settings.companyName,
      monthName: currentMonthName,
      year: selectedYear,
      employees,
      records: monthRecords,
      workingDays: effectiveWorkingDays,
    });
  };

  const handleDownloadExcel = () => {
    exportMonthlyAttendanceExcel({
      companyName: settings.companyName,
      monthName: currentMonthName,
      year: selectedYear,
      employees,
      records: monthRecords,
      workingDays: effectiveWorkingDays,
    });
  };

  const selectedEmp = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <div className="flex-1 p-3.5 space-y-4">
      {/* Title & Month Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t.attendanceReports}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentMonthName} {selectedYear}
          </p>
        </div>

        {/* Month Selector dropdowns */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>
                {language === 'hi' ? monthNamesHi[idx] : name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {[2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownloadPdf}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition"
        >
          <FileText className="w-4 h-4" />
          <span>{t.downloadPdf}</span>
        </button>

        <button
          onClick={handleDownloadExcel}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{t.downloadExcel}</span>
        </button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {currentMonthName} {selectedYear} {language === 'hi' ? 'सारांश' : 'Summary'}
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {t.totalWorkingDays}: {effectiveWorkingDays}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl">
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
              {totalPresents}
            </span>
            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              {t.statusPresent}
            </p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
            <span className="text-base font-black text-rose-700 dark:text-rose-400">
              {totalAbsents}
            </span>
            <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300">
              {t.statusAbsent}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl">
            <span className="text-base font-black text-amber-700 dark:text-amber-400">
              {totalLeaves}
            </span>
            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
              {t.statusLeave}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl">
            <span className="text-base font-black text-blue-700 dark:text-blue-400">
              {totalHalfDays}
            </span>
            <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300">
              {t.statusHalfDay}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Employee Attendance Breakdown */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {t.employeeSummary} ({employees.length})
        </h2>

        <div className="space-y-2">
          {employees.map((emp) => {
            const empRecords = monthRecords.filter((r) => r.employeeId === emp.id);
            const present = empRecords.filter((r) => r.status === 'PRESENT').length;
            const absent = empRecords.filter((r) => r.status === 'ABSENT').length;
            const leave = empRecords.filter((r) => r.status === 'LEAVE').length;
            const halfDay = empRecords.filter((r) => r.status === 'HALF_DAY').length;
            const effective = present + halfDay * 0.5 + leave;
            const rate = effectiveWorkingDays > 0 ? Math.min(100, Math.round((effective / effectiveWorkingDays) * 100)) : 0;
            const isExpanded = selectedEmployeeId === emp.id;

            return (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden transition"
              >
                {/* Employee Row Header */}
                <div
                  onClick={() => setSelectedEmployeeId(isExpanded ? null : emp.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.photo}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {emp.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {emp.designation} • {emp.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {rate}%
                      </span>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {present}P / {absent}A / {leave}L
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-90 text-emerald-500' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Calendar Grid */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 space-y-3 bg-slate-50/50 dark:bg-slate-850">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold">{t.individualReport}:</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        P: Present | A: Absent | L: Leave | H: Half
                      </span>
                    </div>

                    {/* Day-by-day badges for the month */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-[9px] font-bold text-slate-400">
                          {d}
                        </div>
                      ))}

                      {/* Padding before first day of month */}
                      {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-7" />
                      ))}

                      {/* Days 1..N */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${monthStrKey}-${String(dayNum).padStart(2, '0')}`;
                        const dayDate = new Date(selectedYear, selectedMonth, dayNum);
                        const isSunday = dayDate.getDay() === 0;

                        const rec = empRecords.find((r) => r.date === dateStr);
                        const status = rec?.status;

                        let bgClass = 'bg-slate-100 dark:bg-slate-700 text-slate-400';
                        let label = dayNum.toString();

                        if (status === 'PRESENT') {
                          bgClass = 'bg-emerald-600 text-white font-bold';
                          label = 'P';
                        } else if (status === 'ABSENT') {
                          bgClass = 'bg-rose-600 text-white font-bold';
                          label = 'A';
                        } else if (status === 'LEAVE') {
                          bgClass = 'bg-amber-500 text-white font-bold';
                          label = 'L';
                        } else if (status === 'HALF_DAY') {
                          bgClass = 'bg-blue-600 text-white font-bold';
                          label = 'H';
                        } else if (isSunday) {
                          bgClass = 'bg-slate-200 dark:bg-slate-800 text-slate-400 text-[8px]';
                          label = 'Sun';
                        }

                        return (
                          <div
                            key={dayNum}
                            className={`h-7 rounded-lg flex flex-col items-center justify-center text-[10px] shadow-2xs ${bgClass}`}
                            title={`${dateStr}: ${status || (isSunday ? 'Sunday' : 'Not marked')}`}
                          >
                            <span>{label}</span>
                            <span className="text-[7px] opacity-75">{dayNum}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
