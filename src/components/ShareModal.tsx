import React, { useState, useMemo } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  Smartphone,
  HeartPulse,
  Pill,
  Stethoscope,
  Building2,
  MapPin,
  Phone,
  Link2
} from 'lucide-react';
import { HealthEntity } from '../types';
import {
  getShareUrl,
  formatEntityShareText,
  formatAppShareText,
  canNativeShare,
  performNativeShare,
  shareToWhatsApp,
  shareToFacebook,
  prepareInstagramShare,
  shareToTelegram
} from '../utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity?: HealthEntity | null;
  isAppShare?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  entity = null,
  isAppShare = false,
}) => {
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [instagramFeedback, setInstagramFeedback] = useState<boolean>(false);

  const shareUrl = useMemo(() => getShareUrl(entity), [entity]);

  const shareText = useMemo(() => {
    if (entity) {
      return formatEntityShareText(entity, shareUrl);
    }
    return formatAppShareText(shareUrl);
  }, [entity, shareUrl]);

  const shareTitle = useMemo(() => {
    if (entity) {
      return `${entity.name} - دليل الصحة لولاية الوادي`;
    }
    return 'دليل الصحة - ولاية الوادي (39) 🇩🇿';
  }, [entity]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.warn('Copy text error:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Copy link error:', err);
    }
  };

  const handleWhatsApp = () => {
    shareToWhatsApp(shareText);
  };

  const handleFacebook = () => {
    shareToFacebook(shareUrl, shareText);
  };

  const handleInstagram = async () => {
    setInstagramFeedback(true);
    await prepareInstagramShare(shareText);
    setTimeout(() => setInstagramFeedback(false), 4000);
  };

  const handleTelegram = () => {
    shareToTelegram(shareUrl, shareText);
  };

  const handleNativeShare = async () => {
    await performNativeShare({
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    });
  };

  const hasNativeShare = canNativeShare();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-['Tajawal',sans-serif]">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs shrink-0">
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {entity ? 'نشر ومشاركة المرفق الصحي' : 'نشر ومشاركة دليل الصحة'}
                </h2>
                <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                  ولاية الوادي
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium line-clamp-1 mt-0.5">
                {entity ? entity.name : 'شارك التطبيق مع أهلك وأصدقائك في الوادي'}
              </p>
            </div>
          </div>

          <button
            id="close-share-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95 shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 grow">

          {/* Item Quick Overview Banner */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              {entity ? (
                entity.type === 'صيدلية' ? <Pill className="w-5 h-5 text-emerald-600" /> :
                entity.type === 'طبيب' ? <Stethoscope className="w-5 h-5 text-blue-600" /> :
                <Building2 className="w-5 h-5 text-slate-700" />
              ) : (
                <HeartPulse className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="min-w-0 grow">
              <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                {entity ? entity.name : 'دليل الصحة لولاية الوادي 39'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {entity
                  ? `${entity.type}${entity.specialty ? ` • ${entity.specialty}` : ''} • بلدية ${entity.commune}`
                  : 'دليلك للبحث عن الصيدليات المناوبة والأطباء والاستعجالات بولاية الوادي'}
              </p>
              {entity?.phone && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-mono font-bold">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{entity.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Platforms Row: WhatsApp, Facebook, Instagram, Telegram */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
              انشر مباشرة في التطبيقات المفضلة
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

              {/* 1. WhatsApp Button */}
              <button
                id="share-whatsapp-btn"
                onClick={handleWhatsApp}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4.5 h-4.5 text-white stroke-[2.2]" />
                  </div>
                  <div className="text-right">
                    <span className="block leading-tight">واتساب (WhatsApp)</span>
                    <span className="text-[10px] text-emerald-100 font-medium block">إرسال للمحادثات والمجموعات</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 2. Facebook Button */}
              <button
                id="share-facebook-btn"
                onClick={handleFacebook}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Facebook className="w-4.5 h-4.5 text-white stroke-[2.2]" />
                  </div>
                  <div className="text-right">
                    <span className="block leading-tight">فيسبوك (Facebook)</span>
                    <span className="text-[10px] text-blue-100 font-medium block">مشاركة على الحساب أو المجموعات</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* 3. Instagram Button */}
              <button
                id="share-instagram-btn"
                onClick={handleInstagram}
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-98 group relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Instagram className="w-4.5 h-4.5 text-white stroke-[2.2]" />
                  </div>
                  <div className="text-right">
                    <span className="block leading-tight">إنستغرام (Instagram)</span>
                    <span className="text-[10px] text-pink-100 font-medium block">نسخ المنشور وفتح التطبيق</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                </div>
              </button>

              {/* 4. Telegram Button */}
              <button
                id="share-telegram-btn"
                onClick={handleTelegram}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#229ED9] hover:bg-[#1f8ec3] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Send className="w-4.5 h-4.5 text-white stroke-[2.2]" />
                  </div>
                  <div className="text-right">
                    <span className="block leading-tight">تيليغرام (Telegram)</span>
                    <span className="text-[10px] text-cyan-100 font-medium block">نشر في القنوات والمجموعات</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>

            {/* Instagram Feedback Toast Guidance */}
            {instagramFeedback && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl text-pink-900 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Check className="w-4 h-4 text-pink-600 shrink-0" />
                <span>تم نسخ نص المنشور بنجاح! جاري فتح إنستغرام لتقوم بلصقه مباشرة في الستوري أو الرسائل.</span>
              </div>
            )}
          </div>

          {/* Native Share button (Mobile Device Share Sheet) */}
          {hasNativeShare && (
            <button
              id="native-device-share-btn"
              onClick={handleNativeShare}
              className="w-full p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-between border border-slate-300/80 transition-all active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs text-slate-700">
                  <Smartphone className="w-4.5 h-4.5 text-slate-700" />
                </div>
                <div className="text-right">
                  <span className="block font-extrabold text-slate-900">مشاركة عبر نافذة الهاتف لجميع التطبيقات</span>
                  <span className="text-[10px] text-slate-500 block">Snapchat, Messenger, Stories, SMS وغيرها</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-black">
                جميع التطبيقات
              </span>
            </button>
          )}

          {/* Copy actions row: Copy formatted text + Copy URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              id="copy-formatted-text-btn"
              onClick={handleCopyText}
              className={`p-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                copiedText
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ نص البطاقة كاملاً!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ نص المنشور كاملاً</span>
                </>
              )}
            </button>

            <button
              id="copy-share-link-btn"
              onClick={handleCopyLink}
              className={`p-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ الرابط المباشر!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-slate-500" />
                  <span>نسخ الرابط المباشر</span>
                </>
              )}
            </button>
          </div>

          {/* Text Message Live Preview */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-black text-slate-500 px-1">
              <span>معاينة النص الجاهز للنشر:</span>
              <span className="text-[11px] text-slate-400 font-mono">جاهز للصق والمشاركة</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 text-right text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans select-all max-h-40 overflow-y-auto">
              {shareText}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            دليل الصحة بولاية الوادي • خدمة مجانية للجميع
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
