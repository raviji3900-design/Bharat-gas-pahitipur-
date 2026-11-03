import React, { useState } from 'react';
import { Lock, Unlock, Delete, AlertCircle } from 'lucide-react';

interface PinLockModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  language: 'en' | 'hi';
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  correctPin,
  onSuccess,
  language,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            setPin('');
            setError(null);
            onSuccess();
          }, 150);
        } else {
          setTimeout(() => {
            setError(
              language === 'hi'
                ? 'गलत पिन। पुनः प्रयास करें।'
                : 'Incorrect PIN. Please try again.'
            );
            if (navigator.vibrate) navigator.vibrate(200);
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        {/* Security Padlock Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          {language === 'hi' ? 'स्मार्ट अटेंडेंस सुरक्षा' : 'Smart Attendance Lock'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {language === 'hi'
            ? 'जारी रखने के लिए 4-अंकीय पिन दर्ज करें'
            : 'Enter 4-digit security PIN to unlock'}
        </p>

        {/* 4 PIN Dots */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mb-4 animate-bounce">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Android Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-white text-xl font-bold transition flex items-center justify-center shadow"
            >
              {digit}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center"
          >
            {language === 'hi' ? 'साफ़' : 'Clear'}
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-white text-xl font-bold transition flex items-center justify-center shadow"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white transition flex items-center justify-center"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-6 text-[11px] text-slate-500">
          {language === 'hi' ? 'डिफ़ॉल्ट पिन: 1234' : 'Default PIN: 1234'}
        </p>
      </div>
    </div>
  );
};
