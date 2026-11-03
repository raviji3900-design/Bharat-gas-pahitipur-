export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY';

export interface Employee {
  id: string;              // e.g. "EMP-001"
  name: string;
  mobile: string;
  photo: string;           // Base64 or avatar URL
  designation: string;     // e.g. "Accountant", "Store Manager"
  department: string;      // e.g. "Operations", "Sales", "Accounts"
  monthlySalary: number;   // e.g. 25000
  joiningDate: string;     // YYYY-MM-DD
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;              // `${employeeId}_${date}`
  employeeId: string;
  date: string;            // YYYY-MM-DD
  status: AttendanceStatus;
  timestamp: string;       // e.g. "09:30 AM"
  note?: string;
  updatedAt?: string;
}

export interface AppSettings {
  language: 'en' | 'hi';
  pinEnabled: boolean;
  pinCode: string;
  companyName: string;
  workingDaysMode: 'CALCULATED_WEEKDAYS' | 'FIXED_26' | 'FIXED_30';
  fixedWorkingDays: number;
  currency: string;
  themeMode: 'light' | 'dark' | 'system';
  isDeviceFrameActive: boolean;
}

export interface SalarySummaryItem {
  employee: Employee;
  totalDaysInMonth: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  effectiveDays: number;
  perDayRate: number;
  calculatedSalary: number;
  deductions: number;
  status: 'PENDING' | 'PAID';
}
