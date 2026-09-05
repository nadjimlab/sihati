/**
 * Notification Manager for Pharmacy Shift & On-Duty Alerts
 */

const NOTIFICATION_PREF_KEY = 'sihati_eloued_garde_notifications_enabled';
const LAST_NOTIFIED_PHARMACIES_KEY = 'sihati_eloued_last_notified_garde_ids';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function isGardeNotificationEnabled(): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    return localStorage.getItem(NOTIFICATION_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setGardeNotificationPref(enabled: boolean): void {
  try {
    localStorage.setItem(NOTIFICATION_PREF_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn('Could not save notification preference:', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setGardeNotificationPref(true);
      return true;
    } else {
      setGardeNotificationPref(false);
      return false;
    }
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // If Service Worker is registered, prefer showing via SW for full PWA support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          dir: 'rtl',
          lang: 'ar',
          ...options,
        });
      });
      return true;
    }

    // Fallback to standard Notification API
    new Notification(title, {
      icon: '/icon.svg',
      badge: '/icon.svg',
      dir: 'rtl',
      lang: 'ar',
      ...options,
    });
    return true;
  } catch (e) {
    console.warn('Could not trigger notification:', e);
    return false;
  }
}

/**
 * Checks if today's on-duty pharmacies changed compared to the last cached snapshot.
 * If changed and user enabled notifications, sends a browser notification.
 */
export function checkAndNotifyGardeChanges(currentOnDutyPharmacies: Array<{ id: string; name: string; commune: string }>): void {
  if (!isGardeNotificationEnabled()) return;
  if (!currentOnDutyPharmacies || currentOnDutyPharmacies.length === 0) return;

  const currentIds = currentOnDutyPharmacies.map(p => p.id).sort().join(',');

  try {
    const lastNotifiedIds = localStorage.getItem(LAST_NOTIFIED_PHARMACIES_KEY);

    // If first time recording, just store snapshot without spamming
    if (!lastNotifiedIds) {
      localStorage.setItem(LAST_NOTIFIED_PHARMACIES_KEY, currentIds);
      return;
    }

    // If IDs list changed
    if (lastNotifiedIds !== currentIds) {
      localStorage.setItem(LAST_NOTIFIED_PHARMACIES_KEY, currentIds);

      const count = currentOnDutyPharmacies.length;
      const firstPharmacy = currentOnDutyPharmacies[0];
      const title = `🚨 تحديث قائمة صيدليات المناوبة اليوم (${count} صيدليات)`;
      const body = count === 1
        ? `صيدلية ${firstPharmacy.name} (${firstPharmacy.commune}) مناوبة الآن.`
        : `تم تحديث جدول المناوبة لولاية الوادي: ${firstPharmacy.name} و ${count - 1} صيدليات أخرى متاحة الآن.`;

      sendBrowserNotification(title, {
        body,
        tag: 'garde-update-alert',
      });
    }
  } catch (e) {
    console.warn('Error in checkAndNotifyGardeChanges:', e);
  }
}
