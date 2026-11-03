import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Maximize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggleActive: () => void;
  appName: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isActive,
  onToggleActive,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // If frame is toggled off or on very small physical mobile screen, render full viewport
  if (!isActive) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Quick floating toggle back to Android Frame */}
        <div className="fixed top-3 right-3 z-50 hidden sm:block">
          <button
            onClick={onToggleActive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 text-white backdrop-blur text-xs font-medium shadow-lg hover:bg-slate-900 transition"
            title="Switch to Android Device Mockup Frame"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Frame</span>
          </button>
        </div>
        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none">
      {/* Top Banner for Desktop users explaining Android Frame mode */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between px-2 mb-2 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Android Native Simulation (Pixel 9 Pro)</span>
        </div>
        <button
          onClick={onToggleActive}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition"
        >
          <Maximize2 className="w-3 h-3 text-emerald-300" />
          <span>Expand Fullscreen</span>
        </button>
      </div>

      {/* Android Device Body */}
      <div className="w-full sm:w-[420px] h-screen sm:h-[880px] bg-slate-950 sm:rounded-[48px] sm:ring-8 sm:ring-slate-800/80 shadow-2xl relative flex flex-col overflow-hidden sm:border-[5px] sm:border-slate-700">
        
        {/* Android Top Bezel / Status Bar */}
        <div className="bg-emerald-700 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-xs font-semibold z-30 shrink-0">
          <span className="tracking-tight">{currentTime}</span>

          {/* Camera Punch Hole */}
          <div className="hidden sm:block w-3.5 h-3.5 rounded-full bg-black ring-2 ring-emerald-800/40"></div>

          {/* Status Icons */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <Battery className="w-4 h-4 fill-white" />
            </div>
          </div>
        </div>

        {/* Android Screen Body Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col relative">
          {children}
        </div>

        {/* Android Bottom Navigation Pill */}
        <div className="bg-white dark:bg-slate-900 pt-1 pb-1.5 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
