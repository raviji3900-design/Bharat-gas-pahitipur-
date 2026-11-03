import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BarChart3,
  CircleDollarSign,
  Smartphone,
} from 'lucide-react';
import { Language, translations } from '../utils/i18n';

export type TabType = 'dashboard' | 'attendance' | 'employees' | 'reports' | 'salary' | 'apk';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
}) => {
  const t = translations[language];

  const items: NavItem[] = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'attendance', label: t.navAttendance, icon: CalendarCheck },
    { id: 'employees', label: t.navEmployees, icon: Users },
    { id: 'reports', label: t.navReports, icon: BarChart3 },
    { id: 'salary', label: t.navSalary, icon: CircleDollarSign },
    { id: 'apk', label: 'APK', icon: Smartphone, highlight: true },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-1 py-1 z-30 shrink-0">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 relative group transition-colors"
            >
              {/* Android M3 pill background for active state */}
              <div
                className={`w-12 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.highlight && !isActive && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium truncate max-w-[58px] ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
