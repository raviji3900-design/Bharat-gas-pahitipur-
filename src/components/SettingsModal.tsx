import React, { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Globe,
  Building,
  Calendar,
  Check,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { AppSettings } from '../types';
import { Language, translations } from '../utils/i18n';
import {
  createBackupJson,
  restoreBackupJson,
  resetToDemoData,
  clearAllAppData,
} from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  language: Language;
  onUpdateLanguage: (lang: Language) => void;
  onLockAppNow: () => void;
  onReloadData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  language,
  onUpdateLanguage,
  onLockAppNow,
  onReloadData,
}) => {
  const t = translations[language];

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);
  const [pinCode, setPinCode] = useState(settings.pinCode);
  const [workingDaysMode, setWorkingDaysMode] = useState(settings.workingDaysMode);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      companyName,
      pinEnabled,
      pinCode: pinCode.padEnd(4, '0').slice(0, 4),
      workingDaysMode,
    });
    showStatus(language === 'hi' ? 'सेटिंग्स सेव हो गई!' : 'Settings saved successfully!');
    setTimeout(() => onClose(), 800);
  };

  const handleExportBackup = () => {
    const json = createBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartAttendance_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus(language === 'hi' ? 'बैकअप डाउनलोड हो गया!' : 'Backup exported successfully!');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const res = restoreBackupJson(reader.result);
          if (res.success) {
            onReloadData();
            showStatus(res.message);
          } else {
            alert(res.message);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        language === 'hi'
          ? 'क्या आप 5 डेमो कर्मचारियों के साथ रीसेट करना चाहते हैं?'
          : 'Reset to 5 demo employees with past 30-day attendance?'
      )
    ) {
      resetToDemoData();
      onReloadData();
      showStatus('Reset to demo data completed');
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        language === 'hi'
          ? 'चेतावनी: क्या आप सभी कर्मचारियों और हाजिरी का डेटा हटाना चाहते हैं?'
          : 'Warning: This will permanently erase all employees and attendance data. Continue?'
      )
    ) {
      clearAllAppData();
      onReloadData();
      showStatus('All data cleared');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.settings}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Language Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.languageOption}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateLanguage('en')}
                className={`py-2 px-3 rounded-xl font-bold transition text-xs ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onUpdateLanguage('hi')}
                className={`py-2 px-3 rounded-xl font-bold transition text-xs ${
                  language === 'hi'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.companyDetails}</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Working Days Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.workingDays}</span>
            </label>
            <select
              value={workingDaysMode}
              onChange={(e) => setWorkingDaysMode(e.target.value as typeof workingDaysMode)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="FIXED_26">Fixed 26 Days (Standard Industrial)</option>
              <option value="FIXED_30">Fixed 30 Days (Calendar Month)</option>
              <option value="CALCULATED_WEEKDAYS">Calculate Actual Weekdays (Excluding Sundays)</option>
            </select>
          </div>

          {/* 4-Digit Security PIN */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.securityPin}
                </span>
              </div>
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={(e) => setPinEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t.pinEnabledDesc}
            </p>

            {pinEnabled && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  PIN:
                </span>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-24 px-2 py-1 text-center font-mono font-bold tracking-widest bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={onLockAppNow}
                  className="ml-auto text-[10px] font-bold text-emerald-600 hover:underline"
                >
                  {t.lockApp}
                </button>
              </div>
            )}
          </div>

          {/* Backup & Restore Data */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              {t.backupRestore}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold transition text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold transition text-[11px] cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Demo Data & Reset */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDemo}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetDemoData}</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.clearAllData}</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
