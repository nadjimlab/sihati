import { HealthEntity } from '../types';

/**
 * Generates an absolute shareable URL for the app or a specific health entity
 */
export function getShareUrl(entity?: HealthEntity | null): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin || 'https://ais-dev-hahwpemugpczeplhui4myo-686745452743.europe-west2.run.app';
  if (!entity) {
    return origin;
  }
  return `${origin}/?entity=${encodeURIComponent(entity.id)}&type=${encodeURIComponent(entity.type)}`;
}

/**
 * Formats a clean, high-contrast, informative text card for an individual health entity
 * Suitable for WhatsApp messages, Facebook posts, Instagram captions, and Telegram
 */
export function formatEntityShareText(entity: HealthEntity, appUrl: string): string {
  const typeEmoji = entity.type === 'صيدلية' ? '💊' : entity.type === 'طبيب' ? '🩺' : '🏥';
  const typeLabel = entity.type === 'صيدلية' ? 'صيدلية' : entity.type === 'طبيب' ? 'طبيب مختص' : entity.type;

  let text = `🌿 ${typeEmoji} ${entity.name}\n`;
  text += `──────────────────\n`;
  text += `🏢 النوع: ${typeLabel}\n`;

  if (entity.specialty) {
    text += `🩺 التخصص: ${entity.specialty}\n`;
  }

  text += `📍 البلدية: ولاية الوادي - ${entity.commune}\n`;
  text += `📌 العنوان: ${entity.address}\n`;
  text += `📞 الهاتف: ${entity.phone}\n`;

  if (entity.workingHours) {
    text += `🕒 أوقات العمل: ${entity.workingHours}\n`;
  }

  if (entity.type === 'صيدلية' && entity.garde_shift) {
    text += `⏰ فترة المناوبة: ${entity.garde_shift}\n`;
  }

  if (entity.notes) {
    text += `📝 ملاحظات: ${entity.notes}\n`;
  }

  text += `──────────────────\n`;
  text += `🗺️ تصفح الموقع والمسار المباشر عبر دليل الصحة لولاية الوادي:\n${appUrl}\n\n`;
  text += `#ولاية_الوادي #دليل_الصحة_الوادي #أطباء_الوادي #صيدليات_الوادي #صحة_الوادي #ElOued`;

  return text;
}

/**
 * Formats a broadcast message for the entire health directory app
 */
export function formatAppShareText(appUrl: string): string {
  let text = `🌿 منصة دليل الصحة - ولاية الوادي (39) 🇩🇿\n`;
  text += `──────────────────\n`;
  text += `دليلك الطبي المعتمد والشامل للرعاية الصحية في جميع بلديات ولاية الوادي:\n\n`;
  text += `✅ جدول الصيدليات المناوبة (Garde) المحدث يومياً\n`;
  text += `✅ دليل أطباء الاختصاص والعيادات الخاصة وأرقامهم\n`;
  text += `✅ المستشفيات ومصالح الاستعجالات الطبية 24/24 ساعة\n`;
  text += `✅ تحديد الموقع الجغرافي والمسار المباشر عبر الخريطة\n`;
  text += `✅ اتصال هاتفي فوري وإمكانية العمل بدون إنترنت كـ PWA\n\n`;
  text += `──────────────────\n`;
  text += `🔗 تصفح الدليل الطبي الآن مجاناً:\n${appUrl}\n\n`;
  text += `#ولاية_الوادي #دليل_الصحة #أطباء_الوادي #صيدليات_الوادي #صيدلية_المناوبة #ElOued`;

  return text;
}

/**
 * Checks if the browser supports the Web Share API
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Performs a native Web Share (Android / iOS share sheet containing Instagram, WhatsApp, Facebook, etc.)
 */
export async function performNativeShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share(data);
    return true;
  } catch (err: any) {
    // User cancelled share or aborted
    if (err.name !== 'AbortError') {
      console.warn('Native share error:', err);
    }
    return false;
  }
}

/**
 * Opens WhatsApp with prefilled formatted text
 */
export function shareToWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens Facebook Share Dialog
 */
export function shareToFacebook(shareUrl: string, quote?: string): void {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}${
    quote ? `&quote=${encodeURIComponent(quote)}` : ''
  }`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

/**
 * Prepares Instagram sharing:
 * Copies the text/caption to clipboard, then opens Instagram
 */
export async function prepareInstagramShare(captionText: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(captionText);
    }
  } catch (e) {
    console.warn('Clipboard write failed:', e);
  }
  // Open Instagram web or deep link
  window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Opens Telegram share dialog
 */
export function shareToTelegram(shareUrl: string, text: string): void {
  const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens Facebook Messenger share
 */
export function shareToMessenger(shareUrl: string): void {
  const url = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
  // Fallback to web link if scheme fails
  window.open(url, '_blank', 'noopener,noreferrer');
}
