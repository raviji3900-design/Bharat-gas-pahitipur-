import React, { useState, useEffect } from 'react';
import {
  Shield,
  Settings,
  Moon,
  Sun,
  Lock,
  Download,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  AppSettings,
  AttendanceStatus,
} from './types';
import {
  loadEmployees,
  saveEmployees,
  loadAttendance,
  saveAttendance,
  loadSettings,
  saveSettings,
  loadSalaryPaymentStatus,
  saveSalaryPaymentStatus,
  formatDateKey,
} from './utils/storage';
import { translations, Language } from './utils/i18n';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { EmployeesView } from './components/EmployeesView';
import { ReportsView } from './components/ReportsView';
import { SalaryView } from './components/SalaryView';
import { AndroidApkView } from './components/AndroidApkView';
import { PinLockModal } from './components/PinLockModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [paymentStatus, setPaymentStatus] = useState<Record<string, 'PENDING' | 'PAID'>>({});
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(new Date()));
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(true);

  // Initialize data on mount
  useEffect(() => {
    const loadedEmps = loadEmployees();
    const loadedAtt = loadAttendance();
    const loadedSett = loadSettings();
    const loadedPay = loadSalaryPaymentStatus();

    setEmployees(loadedEmps);
    setAttendance(loadedAtt);
    setSettings(loadedSett);
    setPaymentStatus(loadedPay);
    setIsDeviceFrame(loadedSett.isDeviceFrameActive);

    // Initial PIN lock if enabled
    if (loadedSett.pinEnabled) {
      setIsLocked(true);
    }
  }, []);

  // Update dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = translations[settings.language];

  // Refresh data from storage (e.g. after backup restore or reset)
  const reloadData = () => {
    setEmployees(loadEmployees());
    setAttendance(loadAttendance());
    const sett = loadSettings();
    setSettings(sett);
    setPaymentStatus(loadSalaryPaymentStatus());
  };

  // Mark attendance for single employee
  const handleMarkAttendance = (
    employeeId: string,
    date: string,
    status: AttendanceStatus
  ) => {
    const recordId = `${employeeId}_${date}`;
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timestamp = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;

    setAttendance((prev) => {
      const filtered = prev.filter((r) => !(r.employeeId === employeeId && r.date === date));
      const newRecord: AttendanceRecord = {
        id: recordId,
        employeeId,
        date,
        status,
        timestamp,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newRecord, ...filtered];
      saveAttendance(updated);
      return updated;
    });
  };

  // Mark all active employees as Present
  const handleMarkAllPresent = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timestamp = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;

    setAttendance((prev) => {
      const active = employees.filter((e) => e.isActive);
      const activeIds = new Set(active.map((e) => e.id));

      // Keep records that are not for this date or not from active employees
      const otherRecords = prev.filter(
        (r) => !(r.date === selectedDate && activeIds.has(r.employeeId))
      );

      const newRecords: AttendanceRecord[] = active.map((emp) => ({
        id: `${emp.id}_${selectedDate}`,
        employeeId: emp.id,
        date: selectedDate,
        status: 'PRESENT',
        timestamp,
        updatedAt: new Date().toISOString(),
      }));

      const combined = [...newRecords, ...otherRecords];
      saveAttendance(combined);
      return combined;
    });
  };

  // Clear all records for a date
  const handleClearDateAttendance = (date: string) => {
    setAttendance((prev) => {
      const filtered = prev.filter((r) => r.date !== date);
      saveAttendance(filtered);
      return filtered;
    });
  };

  // Employee Add / Update / Delete
  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => {
      const updated = [...prev, emp];
      saveEmployees(updated);
      return updated;
    });
  };

  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => {
      const updated = prev.map((e) => (e.id === emp.id ? emp : e));
      saveEmployees(updated);
      return updated;
    });
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees((prev) => {
      const updated = prev.filter((e) => e.id !== empId);
      saveEmployees(updated);
      return updated;
    });
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Toggle Language quickly
  const toggleLanguage = () => {
    const nextLang = settings.language === 'en' ? 'hi' : 'en';
    const updated: AppSettings = { ...settings, language: nextLang };
    setSettings(updated);
    saveSettings(updated);
  };

  // Payment status update
  const handleUpdatePaymentStatus = (statusMap: Record<string, 'PENDING' | 'PAID'>) => {
    setPaymentStatus(statusMap);
    saveSalaryPaymentStatus(statusMap);
  };

  // Request PIN authorization for sensitive actions
  const requirePinAuth = (onSuccess: () => void) => {
    if (settings.pinEnabled) {
      setPendingAuthAction(() => onSuccess);
      setIsLocked(true);
    } else {
      onSuccess();
    }
  };

  const handlePinSuccess = () => {
    setIsLocked(false);
    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  return (
    <AndroidFrame
      appName="Smart Attendance Pro"
      isActive={isDeviceFrame}
      onToggleActive={() => {
        setIsDeviceFrame((prev) => {
          const next = !prev;
          const updated = { ...settings, isDeviceFrameActive: next };
          setSettings(updated);
          saveSettings(updated);
          return next;
        });
      }}
    >
      {/* Native App Top AppBar */}
      <header className="bg-emerald-700 text-white px-3.5 py-2.5 flex items-center justify-between shadow-md z-20 shrink-0">
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-sm">
            <span className="text-white">SA</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight leading-tight">
              {t.appName}
            </h1>
            <p className="text-[10px] text-emerald-100 font-medium leading-none">
              v1.0 • Android
            </p>
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-1">
          {/* Language Toggle Badge */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-[11px] font-black tracking-wide text-white border border-emerald-600/60 shadow-xs transition active:scale-95"
            title="Toggle English / हिन्दी"
          >
            {settings.language === 'en' ? 'हिन्दी' : 'EN'}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="w-7 h-7 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-white flex items-center justify-center transition active:scale-95"
            title="Toggle Dark / Light Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Lock Button (if PIN enabled) */}
          {settings.pinEnabled && (
            <button
              onClick={() => setIsLocked(true)}
              className="w-7 h-7 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-white flex items-center justify-center transition active:scale-95"
              title="Lock App with PIN"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-200" />
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-7 h-7 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-white flex items-center justify-center transition active:scale-95"
            title="Open Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Tab Views Container */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50 dark:bg-slate-900">
        {currentTab === 'dashboard' && (
          <DashboardView
            employees={employees}
            attendance={attendance}
            settings={settings}
            language={settings.language}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onMarkAllPresent={handleMarkAllPresent}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceView
            employees={employees}
            attendance={attendance}
            onMarkAttendance={handleMarkAttendance}
            onClearDateAttendance={handleClearDateAttendance}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            settings={settings}
            language={settings.language}
            onRequirePinAuth={requirePinAuth}
          />
        )}

        {currentTab === 'employees' && (
          <EmployeesView
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            language={settings.language}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            employees={employees}
            attendance={attendance}
            settings={settings}
            language={settings.language}
          />
        )}

        {currentTab === 'salary' && (
          <SalaryView
            employees={employees}
            attendance={attendance}
            settings={settings}
            language={settings.language}
            paymentStatusMap={paymentStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        )}

        {currentTab === 'apk' && (
          <AndroidApkView language={settings.language} />
        )}
      </main>

      {/* Android Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        language={settings.language}
      />

      {/* PIN Lock Screen Modal */}
      <PinLockModal
        isOpen={isLocked}
        correctPin={settings.pinCode}
        onSuccess={handlePinSuccess}
        language={settings.language}
      />

      {/* Settings & Security Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        language={settings.language}
        onUpdateLanguage={(lang) => {
          const updated = { ...settings, language: lang };
          setSettings(updated);
          saveSettings(updated);
        }}
        onLockAppNow={() => {
          setIsSettingsOpen(false);
          setIsLocked(true);
        }}
        onReloadData={reloadData}
      />
    </AndroidFrame>
  );
}
