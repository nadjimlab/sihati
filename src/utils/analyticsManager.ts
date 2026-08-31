import { ActiveTab, SiteAnalytics, VisitEvent } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const VISITOR_ID_KEY = 'eloued_health_visitor_id';
const VISITOR_FIRST_SEEN_KEY = 'eloued_health_visitor_first_seen';
const LAST_VISIT_SESSION_KEY = 'eloued_health_last_session_visit';
const ANALYTICS_LOCAL_STORAGE_KEY = 'eloued_health_site_analytics_v1';

const ANALYTICS_DOC_PATH = 'analytics/site_stats';

function getOrCreateVisitorId(): { visitorId: string; isNew: boolean } {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  let isNew = false;
  if (!visitorId) {
    visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    localStorage.setItem(VISITOR_FIRST_SEEN_KEY, new Date().toISOString());
    isNew = true;
  }
  return { visitorId, isNew };
}

function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  const ua = navigator.userAgent || '';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'متصفح آخر';
}

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultAnalytics(): SiteAnalytics {
  const today = getTodayKey();
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    dailyVisits: { [today]: 0 },
    tabVisits: {
      home: 0,
      garde: 0,
      doctors: 0,
      pharmacies: 0,
      hospitals: 0,
      map: 0,
      admin: 0,
    },
    deviceStats: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    recentVisits: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function getLocalAnalytics(): SiteAnalytics {
  try {
    const raw = localStorage.getItem(ANALYTICS_LOCAL_STORAGE_KEY);
    if (!raw) return getDefaultAnalytics();
    const parsed = JSON.parse(raw);
    const today = getTodayKey();
    return {
      ...getDefaultAnalytics(),
      ...parsed,
      todayVisits: parsed.dailyVisits?.[today] || 0,
    };
  } catch {
    return getDefaultAnalytics();
  }
}

export function saveLocalAnalytics(data: SiteAnalytics): void {
  try {
    localStorage.setItem(ANALYTICS_LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save analytics locally:', e);
  }
}

// In-memory debounce to avoid duplicate tracking in the same seconds
let lastTrackedTab = '';
let lastTrackedTime = 0;

/**
 * Record a visit to a specific tab/page
 */
export async function recordSiteVisit(tab: ActiveTab | string): Promise<void> {
  const now = Date.now();
  if (lastTrackedTab === tab && now - lastTrackedTime < 3000) {
    return; // Ignore duplicate immediate calls
  }
  lastTrackedTab = tab;
  lastTrackedTime = now;

  const { visitorId, isNew } = getOrCreateVisitorId();
  const device = detectDevice();
  const browser = detectBrowser();
  const today = getTodayKey();
  const timestamp = new Date().toISOString();

  const visitEvent: VisitEvent = {
    id: `visit_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    date: today,
    tab,
    device,
    browser,
    visitorId,
    isNewVisitor: isNew,
  };

  // 1. Update local analytics state
  const current = getLocalAnalytics();
  const updatedDaily = { ...(current.dailyVisits || {}) };
  updatedDaily[today] = (updatedDaily[today] || 0) + 1;

  const updatedTabs = { ...(current.tabVisits || {}) };
  updatedTabs[tab] = (updatedTabs[tab] || 0) + 1;

  const updatedDevices = {
    mobile: (current.deviceStats?.mobile || 0) + (device === 'mobile' ? 1 : 0),
    desktop: (current.deviceStats?.desktop || 0) + (device === 'desktop' ? 1 : 0),
    tablet: (current.deviceStats?.tablet || 0) + (device === 'tablet' ? 1 : 0),
  };

  const updatedRecent = [visitEvent, ...(current.recentVisits || [])].slice(0, 30);

  const updatedAnalytics: SiteAnalytics = {
    totalVisits: (current.totalVisits || 0) + 1,
    uniqueVisitors: (current.uniqueVisitors || 0) + (isNew ? 1 : 0),
    todayVisits: updatedDaily[today] || 1,
    dailyVisits: updatedDaily,
    tabVisits: updatedTabs,
    deviceStats: updatedDevices,
    recentVisits: updatedRecent,
    lastUpdated: timestamp,
  };

  saveLocalAnalytics(updatedAnalytics);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, 'analytics', 'site_stats');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const remoteData = snap.data() as any;
      const remoteDaily = remoteData.dailyVisits || {};
      remoteDaily[today] = (remoteDaily[today] || 0) + 1;

      const remoteTabs = remoteData.tabVisits || {};
      remoteTabs[tab] = (remoteTabs[tab] || 0) + 1;

      const remoteDevices = remoteData.deviceStats || { mobile: 0, desktop: 0, tablet: 0 };
      remoteDevices[device] = (remoteDevices[device] || 0) + 1;

      const remoteRecent = [visitEvent, ...(remoteData.recentVisits || [])].slice(0, 35);

      await setDoc(docRef, {
        totalVisits: (remoteData.totalVisits || 0) + 1,
        uniqueVisitors: (remoteData.uniqueVisitors || 0) + (isNew ? 1 : 0),
        todayVisits: remoteDaily[today] || 1,
        dailyVisits: remoteDaily,
        tabVisits: remoteTabs,
        deviceStats: remoteDevices,
        recentVisits: remoteRecent,
        lastUpdated: timestamp,
      }, { merge: true });
    } else {
      await setDoc(docRef, updatedAnalytics);
    }
  } catch (err) {
    // Firestore might be offline or permissions not yet configured; local state remains safe.
    console.debug('Firestore analytics record sync:', err);
  }
}

/**
 * Subscribe to real-time analytics updates from Firestore with fallback to LocalStorage
 */
export function subscribeToAnalytics(
  onUpdate: (analytics: SiteAnalytics) => void,
  onError?: (error: any) => void
): () => void {
  // Fire immediately with local data
  onUpdate(getLocalAnalytics());

  try {
    const docRef = doc(db, 'analytics', 'site_stats');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteAnalytics;
          const today = getTodayKey();
          const merged: SiteAnalytics = {
            ...getDefaultAnalytics(),
            ...data,
            todayVisits: data.dailyVisits?.[today] || 0,
          };
          saveLocalAnalytics(merged);
          onUpdate(merged);
        } else {
          // Initialize remote document if not present
          const initial = getLocalAnalytics();
          setDoc(docRef, initial).catch(console.warn);
        }
      },
      (err) => {
        console.warn('Analytics snapshot subscription note:', err);
        if (onError) onError(err);
      }
    );
  } catch (e) {
    console.warn('subscribeToAnalytics error:', e);
    return () => {};
  }
}

/**
 * Reset analytics stats (Admin action)
 */
export async function resetAnalyticsInCloud(): Promise<void> {
  const fresh = getDefaultAnalytics();
  saveLocalAnalytics(fresh);
  try {
    const docRef = doc(db, 'analytics', 'site_stats');
    await setDoc(docRef, fresh);
  } catch (err) {
    console.warn('Failed to reset analytics in cloud:', err);
  }
}
