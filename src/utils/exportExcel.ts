import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord, SalarySummaryItem } from '../types';

export function exportMonthlyAttendanceExcel({
  companyName,
  monthName,
  year,
  employees,
  records,
  workingDays,
}: {
  companyName: string;
  monthName: string;
  year: number;
  employees: Employee[];
  records: AttendanceRecord[];
  workingDays: number;
}): void {
  // Construct rows
  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Designation',
    'Mobile Number',
    'Monthly Salary (INR)',
    'Present Days',
    'Absent Days',
    'Leave Days',
    'Half Days',
    'Effective Days',
    'Attendance %',
  ];

  const dataRows = employees.map((emp) => {
    const empRecords = records.filter((r) => r.employeeId === emp.id);
    const present = empRecords.filter((r) => r.status === 'PRESENT').length;
    const absent = empRecords.filter((r) => r.status === 'ABSENT').length;
    const leave = empRecords.filter((r) => r.status === 'LEAVE').length;
    const halfDay = empRecords.filter((r) => r.status === 'HALF_DAY').length;
    const effective = present + halfDay * 0.5 + leave;
    const rate = workingDays > 0 ? Math.min(100, Math.round((effective / workingDays) * 100)) : 0;

    return [
      emp.id,
      emp.name,
      emp.department,
      emp.designation,
      emp.mobile,
      emp.monthlySalary,
      present,
      absent,
      leave,
      halfDay,
      effective,
      `${rate}%`,
    ];
  });

  const titleRows = [
    [companyName],
    [`Monthly Attendance Report - ${monthName} ${year}`],
    [`Generated: ${new Date().toLocaleString()} | Standard Working Days: ${workingDays}`],
    [], // empty line
  ];

  const fullSheetData = [...titleRows, headers, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Summary');

  XLSX.writeFile(workbook, `Attendance_${monthName}_${year}.xlsx`);
}

export function exportPayrollExcel({
  companyName,
  monthName,
  year,
  items,
}: {
  companyName: string;
  monthName: string;
  year: number;
  items: SalarySummaryItem[];
}): void {
  const headers = [
    'Emp ID',
    'Employee Name',
    'Department',
    'Monthly Base (INR)',
    'Working Days',
    'Present',
    'Absent',
    'Leaves',
    'Half Days',
    'Effective Days',
    'Per Day Rate (INR)',
    'Absent Deduction (INR)',
    'Net Payable (INR)',
    'Payment Status',
  ];

  const rows = items.map((item) => [
    item.employee.id,
    item.employee.name,
    item.employee.department,
    item.employee.monthlySalary,
    item.totalWorkingDays,
    item.presentDays,
    item.absentDays,
    item.leaveDays,
    item.halfDays,
    item.effectiveDays,
    Math.round(item.perDayRate),
    Math.round(item.deductions),
    Math.round(item.calculatedSalary),
    item.status,
  ]);

  const titleRows = [
    [companyName],
    [`Payroll & Salary Register - ${monthName} ${year}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
  ];

  const sheetData = [...titleRows, headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Register');

  XLSX.writeFile(workbook, `Payroll_${monthName}_${year}.xlsx`);
}
