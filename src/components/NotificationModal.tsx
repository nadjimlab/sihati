import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Settings,
  Lock,
  RefreshCw,
  Send,
  Smartphone,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  setGardeNotificationPref,
  isGardeNotificationEnabled,
  sendBrowserNotification
} from '../utils/notificationManager';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateChange?: (enabled: boolean) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onStateChange
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isProcessing, setIsProcessing] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkStatus = () => {
    const current = getNotificationPermission();
    setPermission(current);
    return current;
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setTestSent(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const granted = await requestNotificationPermission();
      const newPerm = getNotificationPermission();
      setPermission(newPerm);

      if (granted) {
        setStatusMessage('✅ تم تفعيل الإشعارات بنجاح!');
        if (onStateChange) onStateChange(true);
        // Trigger welcome notification
        sendBrowserNotification('✅ دليل الصحة - ولاية الوادي', {
          body: 'تم تفعيل التنبيهات بنجاح! سيصلك تنبيه فوري بجدول صيدليات المناوبة.',
        });
      } else if (newPerm === 'denied') {
        setStatusMessage('⚠️ المتصفح يمنع الإشعارات حالياً. يرجى تفعيلها من إعدادات المتصفح أدناه.');
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('حدث خطأ أثناء طلب الإذن. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendTestNotification = () => {
    const success = sendBrowserNotification('🔔 إشعار تجريبي: صيدليات المناوبة', {
      body: 'هذا إشعار تجريبي من دليل الصحة لولاية الوادي. الإشعارات تعمل بشكل ممتاز على جهازك!',
      tag: 'test-notification-' + Date.now(),
    });

    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } else {
      setStatusMessage('تعذر إرسال الإشعار. تأكد من أن جهازك لا يفعّل وضع عدم الإزعاج (Do Not Disturb).');
    }
  };

  const handleDisableNotifications = () => {
    setGardeNotificationPref(false);
    if (onStateChange) onStateChange(false);
    setStatusMessage('تم إيقاف التنبيهات.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';
  const isUnsupported = permission === 'unsupported';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs font-['Tajawal'] dir-rtl">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                تنبيهات صيدليات المناوبة
              </h2>
              <p className="text-xs text-slate-300">إشعارات فورية بجدول المناوبة وتحديثات الطوارئ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium border flex items-start gap-2.5 ${
              statusMessage.startsWith('✅')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              {statusMessage.startsWith('✅') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div>{statusMessage}</div>
            </div>
          )}

          {/* STATE 1: ALREADY GRANTED */}
          {isGranted && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">الإشعارات مفعلة ونشطة</h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    جهازك جاهز لاستقبال تنبيهات الصيدليات المناوبة فور حلول موعد المناوبة المسائية والليلية وعطل نهاية الأسبوع.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSendTestNotification}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>{testSent ? 'تم إرسال الإشعار! 📲' : 'إرسال إشعار تجريبي'}</span>
                </button>

                <button
                  onClick={handleDisableNotifications}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-all"
                >
                  <ToggleLeft className="w-4 h-4 text-slate-500" />
                  <span>تعطيل التنبيهات مؤقتاً</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: DENIED / BLOCKED BY BROWSER (COMMON IN ANDROID CHROME) */}
          {isDenied && (
            <div className="space-y-4">
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>المتصفح يحظر الإشعارات لهذا الموقع حالياً</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  بسبب إعدادات المتصفح، لا يمكن للتطبيق طلب الإذن تلقائياً. يمكنك السماح بها يدوياً في ثوانٍ باتباع الخطوات التالية:
                </p>
              </div>

              {/* Step-by-step Guide */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>طريقة التفعيل في متصفح Chrome (الهاتف):</span>
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700 pr-1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      اضغط على <strong>أيقونة الإعدادات ⚙️ أو القفل 🔒</strong> الموجودة في أعلى المتصفح بجانب اسم الموقع (<span className="text-blue-700 font-mono text-[11px]">sihati-gules.vercel.app</span>).
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      اختر <strong>الأذونات (Permissions)</strong> ثم <strong>الإشعارات (Notifications)</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      غيّر الخيار إلى <strong>السماح (Allow)</strong> أو تفعيل الزر.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <p className="leading-snug">
                      عد إلى هذه الصفحة واضغط على زر <strong>"تحقق من التفعيل الآن"</strong> أدناه.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Denied State */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    const status = checkStatus();
                    if (status === 'granted') {
                      setGardeNotificationPref(true);
                      setStatusMessage('✅ ممتاز! تم السماح بالإشعارات وتفعيلها بنجاح.');
                      if (onStateChange) onStateChange(true);
                    } else {
                      setStatusMessage('⚠️ ما زالت الإشعارات محظورة في المتصفح. تأكد من تفعيل خيار السماح ثم أعد المحاولة.');
                    }
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>تحقق من التفعيل الآن</span>
                </button>

                <button
                  onClick={handleRequestPermission}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  إعادة طلب الإذن
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: DEFAULT (FIRST TIME REQUEST) */}
          {!isGranted && !isDenied && !isUnsupported && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">لماذا تفعل الإشعارات؟</h3>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                  <li>معرفة الصيدليات المناوبة ليلاً وأيام الجمعة والأعياد فوراً.</li>
                  <li>تنبيهات سريعة عند حدوث أي تعديل في جدول المناوبة الولائي.</li>
                  <li>توفير الوقت في الحالات المستعجلة بدون الحاجة للبحث المتكرر.</li>
                </ul>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleRequestPermission}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Bell className="w-5 h-5 text-emerald-200" />
                <span>{isProcessing ? 'جارِ طلب الإذن...' : 'تفعيل الإشعارات الآن'}</span>
              </button>
            </div>
          )}

          {/* STATE 4: UNSUPPORTED */}
          {isUnsupported && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800">
              <p className="font-bold mb-1">المتصفح الحالي لا يدعم إشعارات الويب المباشرة.</p>
              <p>يرجى فتح الموقع عبر متصفح Google Chrome أو تثبيت التطبيق على الشاشة للاستفادة الكاملة من الإشعارات.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>دليل الصحة لولاية الوادي 🇩🇿</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
