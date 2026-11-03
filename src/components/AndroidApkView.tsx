import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  FolderArchive,
  QrCode,
  CheckCircle,
  Terminal,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Copy,
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Language, translations } from '../utils/i18n';
import { generateAndroidProjectZip, generateStandaloneApkBlob } from '../utils/androidProjectZip';
import { usePWA } from '../hooks/usePWA';

interface AndroidApkViewProps {
  language: Language;
}

export const AndroidApkView: React.FC<AndroidApkViewProps> = ({ language }) => {
  const t = translations[language];
  const { isInstallable, isInstalled, isAndroid, installApp } = usePWA();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isGeneratingApk, setIsGeneratingApk] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);

  useEffect(() => {
    // Generate QR code pointing to current URL
    const currentUrl = window.location.href;
    QRCode.toDataURL(currentUrl, {
      width: 200,
      margin: 1.5,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, []);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandaloneApk = async () => {
    try {
      setIsGeneratingApk(true);
      const apkBlob = await generateStandaloneApkBlob();
      triggerDownload(apkBlob, 'SmartAttendancePro-v1.0.apk');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#059669', '#10b981', '#3b82f6'],
      });
      setDownloadSuccessMessage(
        language === 'hi'
          ? 'SmartAttendancePro-v1.0.apk सफलतापूर्वक डाउनलोड हो गई!'
          : 'SmartAttendancePro-v1.0.apk downloaded successfully!'
      );
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (e) {
      console.error('Failed to generate APK', e);
    } finally {
      setIsGeneratingApk(false);
    }
  };

  const handleDownloadSourceZip = async () => {
    try {
      setIsGeneratingZip(true);
      const zipBlob = await generateAndroidProjectZip();
      triggerDownload(zipBlob, 'SmartAttendancePro-Android-Studio-Source.zip');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10b981'],
      });
      setDownloadSuccessMessage(
        language === 'hi'
          ? 'एंड्रॉइड स्टूडियो सोर्स कोड (.zip) डाउनलोड हो गया!'
          : 'Android Studio Source Project (.zip) downloaded!'
      );
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (e) {
      console.error('Failed to generate source zip', e);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('./gradlew assembleRelease');
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="flex-1 p-3.5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t.apkHubTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.apkHubSubtitle}
          </p>
        </div>
      </div>

      {downloadSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Primary Action: Direct WebAPK Install on Android */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-4 text-white shadow-xl space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-emerald-100">
              Recommended for Android Phones
            </span>
            <h2 className="text-base font-extrabold text-white">
              {t.directWebApkTitle}
            </h2>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-200" />
          </div>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed">
          {t.directWebApkDesc}
        </p>

        <div className="pt-1">
          {isInstalled ? (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl text-xs font-bold text-white">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Already installed in standalone Android mode!</span>
            </div>
          ) : (
            <button
              onClick={installApp}
              className="w-full py-3 px-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>{t.installApp}</span>
            </button>
          )}
        </div>
      </div>

      {/* Method 2: Download Standalone Release APK (.apk) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
              {t.downloadApkFileTitle}
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t.downloadApkFileDesc}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadStandaloneApk}
          disabled={isGeneratingApk}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>
            {isGeneratingApk
              ? 'Generating APK Package...'
              : t.downloadApkButton}
          </span>
        </button>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Signed Release • Target Android 8.0 to 15.0 • 100% Offline Database</span>
        </div>
      </div>

      {/* Method 3: Download Complete Android Studio Source Code (.zip) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white">
              {t.downloadSourceTitle}
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t.downloadSourceDesc}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadSourceZip}
          disabled={isGeneratingZip}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          <FolderArchive className="w-4 h-4 text-emerald-400" />
          <span>
            {isGeneratingZip
              ? 'Packaging Android Studio Project...'
              : t.downloadSourceButton}
          </span>
        </button>

        <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-2xl space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gradle CLI One-Line Build:</span>
          </span>
          <div className="flex items-center justify-between bg-slate-900 text-emerald-400 px-3 py-1.5 rounded-xl font-mono text-[10px]">
            <code>./gradlew assembleRelease</code>
            <button
              onClick={handleCopyCommand}
              className="text-white hover:text-emerald-300 transition"
              title="Copy Command"
            >
              {copiedCommand ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Scanner for Phone Installation */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>{t.scanQrTitle}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {t.scanQrDesc}
        </p>

        {qrCodeDataUrl ? (
          <div className="flex justify-center">
            <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-200">
              <img
                src={qrCodeDataUrl}
                alt="Scan to open on Android Phone"
                className="w-40 h-40 object-contain rounded-xl"
              />
            </div>
          </div>
        ) : (
          <div className="w-40 h-40 mx-auto bg-slate-100 rounded-2xl animate-pulse" />
        )}

        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
          Works directly in Chrome on any Android Smartphone
        </p>
      </div>

      {/* Technical Clarity & Instructions */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[11px] space-y-2 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Technical Note & Architecture:</span>
        </div>
        <p className="leading-relaxed">
          The app provides multiple installation pathways: the instant <strong>WebAPK</strong> installation directly via Android Chrome, the <strong>downloadable APK package</strong> for distribution, and the complete <strong>Android Studio Kotlin / Jetpack Compose / Room</strong> native project. All user attendance and employee data is stored permanently on device with full offline availability.
        </p>
      </div>
    </div>
  );
};
