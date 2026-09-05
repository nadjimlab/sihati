import React from 'react';
import {
  X,
  Smartphone,
  PlusSquare,
  Share2,
  MoreVertical,
  Compass,
  CheckCircle2,
  HeartPulse,
  Download,
  ArrowRight
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs font-['Tajawal'] dir-rtl">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
              <img src="/icon.svg" alt="دليل الصحة" className="w-full h-full rounded-xl object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">تثبيت التطبيق على الشاشة</h2>
              <p className="text-xs text-blue-100">دليل الصحة - ولاية الوادي</p>
            </div>
          </div>

          <button
            id="close-pwa-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/icon.svg" alt="أيقونة التطبيق" className="w-full h-full rounded-lg object-contain" />
            </div>
            <div className="text-xs text-blue-900">
              <p className="font-bold">أيقونة رسمية على شاشة هاتفك</p>
              <p className="text-blue-700 mt-0.5">ستظهر أيقونة التطبيق الزرقاء الرسمية على شاشة هاتفك الرئيسية كأي تطبيق أصلي مثبت.</p>
            </div>
          </div>

          {/* If Native Browser Install Prompt is Available (Chrome / Android / Edge) */}
          {deferredPrompt && (
            <div className="space-y-3">
              <button
                id="native-install-prompt-btn"
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                <span>تثبيت التطبيق الآن بنقرة واحدة</span>
              </button>
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-slate-400 text-xs">أو اتبع الخطوات اليدوية</span>
                <div className="grow border-t border-slate-200"></div>
              </div>
            </div>
          )}

          {/* Manual Instructions based on platform */}
          {isIOS ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>خطوات التثبيت على أجهزة iPhone / iPad (متصفح Safari):</span>
              </p>

              <ol className="space-y-2.5 list-decimal list-inside pr-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>اضغط على زر المشاركة <Share2 className="w-4 h-4 inline-block text-blue-600 mx-1 align-text-bottom" /> في شريط سفلي للمتصفح.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>مرر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية"</strong> (<PlusSquare className="w-4 h-4 inline-block text-blue-600 mx-1 align-text-bottom" /> Add to Home Screen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>اضغط على <strong>"إضافة" (Add)</strong> في الزاوية العلوية ليظهر التطبيق في شاشتك.</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>طريقة التثبيت السريعة على أجهزة Android و Chrome:</span>
              </p>

              <ol className="space-y-2.5 pr-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>اضغط على قائمة خيارات المتصفح <MoreVertical className="w-4 h-4 inline-block text-slate-700 mx-1 align-text-bottom" /> (النقاط الثلاث بالأعلى).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong> (Install App / Add to Home Screen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>أكد التثبيت لفتح التطبيق بشاشة كاملة وسرعة فائقة.</span>
                </li>
              </ol>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-100/70 p-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>تصفح سريع بدون انتظار</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100/70 p-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>أيقونة خاصة على الشاشة</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
