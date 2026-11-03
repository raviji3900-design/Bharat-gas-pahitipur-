import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, AttendanceRecord, SalarySummaryItem } from '../types';

export function exportMonthlyAttendancePdf({
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
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top emerald header bar
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Attendance Summary Report - ${monthName} ${year}`, 14, 19);

  // Meta stats box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 32);
  doc.text(`Total Employees: ${employees.length}  |  Standard Working Days: ${workingDays}`, 14, 38);

  // Table Data preparation
  const tableData = employees.map((emp) => {
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
      emp.designation,
      present.toString(),
      absent.toString(),
      leave.toString(),
      halfDay.toString(),
      `${rate}%`,
    ];
  });

  autoTable(doc, {
    startY: 44,
    head: [['ID', 'Employee Name', 'Designation', 'Present', 'Absent', 'Leave', 'Half Day', 'Rate %']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { halign: 'left', cellWidth: 42 },
      2: { halign: 'left', cellWidth: 36 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 20 },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Footer / Signature Section
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 160;
  
  if (finalY < 240) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signatory: ________________________', 14, finalY + 25);
    doc.text('HR / Manager Signature: ______________________', 120, finalY + 25);
    doc.text('Generated via Smart Attendance Pro Android App', 14, 285);
  }

  doc.save(`Attendance_Report_${monthName}_${year}.pdf`);
}

export function exportSalarySlipPdf({
  companyName,
  monthName,
  year,
  item,
}: {
  companyName: string;
  monthName: string;
  year: number;
  item: SalarySummaryItem;
}): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  // Emerald header
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, 148, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 10, 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`OFFICIAL SALARY SLIP - ${monthName.toUpperCase()} ${year}`, 10, 16);

  // Employee details card
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Employee Details`, 10, 28);

  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${item.employee.name}`, 10, 34);
  doc.text(`ID: ${item.employee.id}`, 10, 40);
  doc.text(`Designation: ${item.employee.designation}`, 80, 34);
  doc.text(`Department: ${item.employee.department}`, 80, 40);

  // Attendance & Days
  doc.setFont('helvetica', 'bold');
  doc.text(`Attendance Breakdown`, 10, 50);

  autoTable(doc, {
    startY: 53,
    head: [['Working Days', 'Present', 'Absent', 'Leave', 'Half Day', 'Effective Pay Days']],
    body: [
      [
        item.totalWorkingDays.toString(),
        item.presentDays.toString(),
        item.absentDays.toString(),
        item.leaveDays.toString(),
        item.halfDays.toString(),
        item.effectiveDays.toString(),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], halign: 'center', fontSize: 7 },
    bodyStyles: { halign: 'center', fontSize: 8 },
  });

  const salaryY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 75;

  // Earnings & Deductions Table
  autoTable(doc, {
    startY: salaryY + 6,
    head: [['Earnings & Components', 'Amount (INR)', 'Deductions & Losses', 'Amount (INR)']],
    body: [
      ['Base Monthly Salary', `Rs. ${item.employee.monthlySalary.toLocaleString()}`, 'Absent Loss of Pay', `Rs. ${Math.round(item.deductions).toLocaleString()}`],
      ['Per Day Rate', `Rs. ${Math.round(item.perDayRate).toLocaleString()}`, 'Other Deductions', `Rs. 0`],
      ['Total Calculated Pay', `Rs. ${Math.round(item.calculatedSalary).toLocaleString()}`, 'Payment Status', item.status],
    ],
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
  });

  const netY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 130;

  // Net Payable highlight
  doc.setFillColor(240, 253, 244);
  doc.rect(10, netY + 4, 128, 14, 'F');
  doc.setDrawColor(5, 150, 105);
  doc.rect(10, netY + 4, 128, 14, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`NET PAYABLE SALARY: Rs. ${Math.round(item.calculatedSalary).toLocaleString()}`, 14, netY + 13);

  // Signatures
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Signature', 14, 195);
  doc.text('Authorized Signatory', 95, 195);

  doc.save(`Payslip_${item.employee.name.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`);
}
