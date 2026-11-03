import React, { useState } from 'react';
import {
  CircleDollarSign,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  CheckCircle,
  Clock,
  TrendingDown,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import { Employee, AttendanceRecord, AppSettings, SalarySummaryItem } from '../types';
import { Language, translations } from '../utils/i18n';
import { exportPayrollExcel } from '../utils/exportExcel';
import { exportSalarySlipPdf } from '../utils/exportPdf';
import { saveSalaryPaymentStatus } from '../utils/storage';

interface SalaryViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  language: Language;
  paymentStatusMap: Record<string, 'PENDING' | 'PAID'>;
  onUpdatePaymentStatus: (statusMap: Record<string, 'PENDING' | 'PAID'>) => void;
}

export const SalaryView: React.FC<SalaryViewProps> = ({
  employees,
  attendance,
  settings,
  language,
  paymentStatusMap,
  onUpdatePaymentStatus,
}) => {
  const t = translations[language];

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());

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

  const monthRecords = attendance.filter((r) => r.date.startsWith(monthStrKey));

  // Calculate working days in month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  let calendarWorkingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(selectedYear, selectedMonth, d).getDay() !== 0) {
      calendarWorkingDays++;
    }
  }

  const effectiveWorkingDays =
    settings.workingDaysMode === 'FIXED_26'
      ? 26
      : settings.workingDaysMode === 'FIXED_30'
      ? 30
      : calendarWorkingDays;

  // Build salary items
  const salaryItems: SalarySummaryItem[] = employees.map((emp) => {
    const empRecords = monthRecords.filter((r) => r.employeeId === emp.id);
    const presentDays = empRecords.filter((r) => r.status === 'PRESENT').length;
    const absentDays = empRecords.filter((r) => r.status === 'ABSENT').length;
    const leaveDays = empRecords.filter((r) => r.status === 'LEAVE').length;
    const halfDays = empRecords.filter((r) => r.status === 'HALF_DAY').length;

    // Standard formula: Present + Half Day * 0.5 + Leave (Paid leave)
    const effectiveDays = presentDays + halfDays * 0.5 + leaveDays;
    const perDayRate = effectiveWorkingDays > 0 ? emp.monthlySalary / effectiveWorkingDays : 0;
    const calculatedSalary = Math.min(emp.monthlySalary, Math.round(effectiveDays * perDayRate));
    const deductions = Math.max(0, emp.monthlySalary - calculatedSalary);

    const statusKey = `${emp.id}_${monthStrKey}`;
    const status = paymentStatusMap[statusKey] || 'PENDING';

    return {
      employee: emp,
      totalDaysInMonth: daysInMonth,
      totalWorkingDays: effectiveWorkingDays,
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      effectiveDays,
      perDayRate,
      calculatedSalary,
      deductions,
      status,
    };
  });

  const totalPayroll = salaryItems.reduce((acc, item) => acc + item.calculatedSalary, 0);

  const togglePaymentStatus = (empId: string) => {
    const key = `${empId}_${monthStrKey}`;
    const nextStatus: 'PENDING' | 'PAID' = paymentStatusMap[key] === 'PAID' ? 'PENDING' : 'PAID';
    const updated: Record<string, 'PENDING' | 'PAID'> = { ...paymentStatusMap, [key]: nextStatus };
    onUpdatePaymentStatus(updated);
  };

  const handleExportExcel = () => {
    exportPayrollExcel({
      companyName: settings.companyName,
      monthName: currentMonthName,
      year: selectedYear,
      items: salaryItems,
    });
  };

  const handleDownloadPayslip = (item: SalarySummaryItem) => {
    exportSalarySlipPdf({
      companyName: settings.companyName,
      monthName: currentMonthName,
      year: selectedYear,
      item,
    });
  };

  return (
    <div className="flex-1 p-3.5 space-y-4">
      {/* Title & Month Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t.salaryManagement}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentMonthName} {selectedYear}
          </p>
        </div>

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

      {/* Payroll Total Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-emerald-100">
              {t.totalPayrollAmount}
            </span>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-emerald-800 text-[11px] font-bold shadow-sm hover:bg-emerald-50 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.downloadPayrollExcel}</span>
          </button>
        </div>

        <div>
          <div className="text-2xl font-black">
            ₹{totalPayroll.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-100/90 mt-0.5">
            Calculated across {employees.length} employees based on {effectiveWorkingDays} working days.
          </p>
        </div>
      </div>

      {/* Employee Salary Cards */}
      <div className="space-y-3">
        {salaryItems.map((item) => (
          <div
            key={item.employee.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.employee.photo}
                  alt={item.employee.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.employee.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {item.employee.designation} • {item.employee.id}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                    Base: ₹{item.employee.monthlySalary.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Status Toggle */}
              <button
                onClick={() => togglePaymentStatus(item.employee.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                  item.status === 'PAID'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {item.status === 'PAID' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{t.markAsPaid}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{t.markAsPending}</span>
                  </>
                )}
              </button>
            </div>

            {/* Attendance Days Pill row */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-slate-750 p-2 rounded-xl text-center text-xs">
              <div>
                <span className="text-[9px] text-slate-400 font-medium">Present</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {item.presentDays} d
                </p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-medium">Absent</span>
                <p className="font-bold text-rose-600 dark:text-rose-400">
                  {item.absentDays} d
                </p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-medium">Leaves</span>
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  {item.leaveDays} d
                </p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-medium">Pay Days</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {item.effectiveDays} d
                </p>
              </div>
            </div>

            {/* Salary Calculation & Payslip Action */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
              <div>
                <span className="text-[10px] text-slate-400">{t.calculatedSalary}:</span>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  ₹{item.calculatedSalary.toLocaleString()}
                  {item.deductions > 0 && (
                    <span className="text-[10px] text-rose-500 font-normal ml-1">
                      (-₹{Math.round(item.deductions).toLocaleString()} LOP)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDownloadPayslip(item)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 text-xs font-bold transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Payslip</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
