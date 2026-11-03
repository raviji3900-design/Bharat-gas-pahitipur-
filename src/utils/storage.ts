import { Employee, AttendanceRecord, AppSettings, AttendanceStatus } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'smart_attendance_employees_v1',
  ATTENDANCE: 'smart_attendance_records_v1',
  SETTINGS: 'smart_attendance_settings_v1',
  SALARY_STATUS: 'smart_attendance_salary_status_v1',
};

// 8 Curated Colorful Material Avatars (SVG Data URLs)
export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  pinEnabled: false,
  pinCode: '1234',
  companyName: 'Smart Enterprises Pvt. Ltd.',
  workingDaysMode: 'FIXED_26',
  fixedWorkingDays: 26,
  currency: '₹',
  themeMode: 'light',
  isDeviceFrameActive: true,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Rajesh Sharma',
    mobile: '+91 98234 11223',
    photo: PRESET_AVATARS[1],
    designation: 'Senior Accountant',
    department: 'Finance & Accounts',
    monthlySalary: 32000,
    joiningDate: '2023-01-15',
    isActive: true,
  },
  {
    id: 'EMP-002',
    name: 'Pooja Verma',
    mobile: '+91 97123 44556',
    photo: PRESET_AVATARS[0],
    designation: 'Operations Lead',
    department: 'Operations',
    monthlySalary: 35000,
    joiningDate: '2023-03-01',
    isActive: true,
  },
  {
    id: 'EMP-003',
    name: 'Amit Patel',
    mobile: '+91 98765 88990',
    photo: PRESET_AVATARS[3],
    designation: 'Warehouse Manager',
    department: 'Logistics',
    monthlySalary: 28000,
    joiningDate: '2023-06-10',
    isActive: true,
  },
  {
    id: 'EMP-004',
    name: 'Sunita Mehra',
    mobile: '+91 94112 33445',
    photo: PRESET_AVATARS[2],
    designation: 'HR Coordinator',
    department: 'Human Resources',
    monthlySalary: 30000,
    joiningDate: '2023-08-20',
    isActive: true,
  },
  {
    id: 'EMP-005',
    name: 'Vikram Singh',
    mobile: '+91 99881 22334',
    photo: PRESET_AVATARS[5],
    designation: 'Sales Executive',
    department: 'Sales',
    monthlySalary: 26000,
    joiningDate: '2024-02-01',
    isActive: true,
  },
];

// Helper to format Date to YYYY-MM-DD local string
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate sample attendance records for the past 30 days
export function generateInitialAttendance(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  // Past 28 days
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const dateStr = formatDateKey(d);

    if (dayOfWeek === 0) {
      // Sunday - skip or leave empty
      continue;
    }

    employees.forEach((emp, empIdx) => {
      // Create realistic attendance pattern
      let status: AttendanceStatus = 'PRESENT';
      const rand = (i + empIdx * 7) % 20;

      if (rand === 3) {
        status = 'ABSENT';
      } else if (rand === 7) {
        status = 'LEAVE';
      } else if (rand === 12) {
        status = 'HALF_DAY';
      }

      records.push({
        id: `${emp.id}_${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        status,
        timestamp: '09:' + String(15 + (empIdx * 4) % 40).padStart(2, '0') + ' AM',
      });
    });
  }

  return records;
}

// Storage operations
export function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load employees', e);
    return INITIAL_EMPLOYEES;
  }
}

export function saveEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (e) {
    console.error('Failed to save employees', e);
  }
}

export function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      const initial = generateInitialAttendance(INITIAL_EMPLOYEES);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load attendance', e);
    return [];
  }
}

export function saveAttendance(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendance', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadSalaryPaymentStatus(): Record<string, 'PENDING' | 'PAID'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALARY_STATUS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveSalaryPaymentStatus(statusMap: Record<string, 'PENDING' | 'PAID'>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALARY_STATUS, JSON.stringify(statusMap));
  } catch (e) {
    console.error('Failed to save salary status', e);
  }
}

// Backup & Restore
export function createBackupJson(): string {
  const backup = {
    appName: 'Smart Attendance Pro',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    employees: loadEmployees(),
    attendance: loadAttendance(),
    settings: loadSettings(),
    salaryStatus: loadSalaryPaymentStatus(),
  };
  return JSON.stringify(backup, null, 2);
}

export function restoreBackupJson(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed.employees) || !Array.isArray(parsed.attendance)) {
      return { success: false, message: 'Invalid backup file structure.' };
    }
    // Limit to max 10 employees
    const employees = parsed.employees.slice(0, 10);
    saveEmployees(employees);
    saveAttendance(parsed.attendance);
    if (parsed.settings) {
      saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    }
    if (parsed.salaryStatus) {
      saveSalaryPaymentStatus(parsed.salaryStatus);
    }
    return { success: true, message: 'Backup restored successfully!' };
  } catch (e) {
    return { success: false, message: 'Failed to parse backup file.' };
  }
}

export function resetToDemoData(): void {
  saveEmployees(INITIAL_EMPLOYEES);
  saveAttendance(generateInitialAttendance(INITIAL_EMPLOYEES));
  saveSettings(DEFAULT_SETTINGS);
  saveSalaryPaymentStatus({});
}

export function clearAllAppData(): void {
  saveEmployees([]);
  saveAttendance([]);
  saveSalaryPaymentStatus({});
}
