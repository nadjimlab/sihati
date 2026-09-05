import { HealthEntity } from '../types';
import { HEALTH_DATA } from '../data/mockData';

export const STORAGE_VERSION = 'v5';
export const ALL_ENTITIES_STORAGE_KEY = `eloued_health_all_entities_${STORAGE_VERSION}`;
export const CUSTOM_ENTITIES_STORAGE_KEY = `eloued_health_custom_entities_${STORAGE_VERSION}`;
export const STORAGE_METADATA_KEY = `eloued_health_meta_${STORAGE_VERSION}`;

// Legacy keys to purge automatically on cleanup
const LEGACY_STORAGE_KEYS = [
  'eloued_health_custom_entities_v4',
  'eloued_health_all_entities_v4',
  'eloued_health_meta_v4',
  'eloued_health_custom_entities_v3',
  'eloued_health_all_entities_v3',
  'eloued_health_meta_v3',
  'eloued_health_custom_entities_v2',
  'eloued_health_all_entities_v2',
  'eloued_health_meta_v2',
  'eloued_health_custom_entities_v1',
  'eloued_health_all_entities_v1',
  'eloued_health_custom_entities',
  'eloued_health_all_entities',
  'eloued_health_temp_cache',
  'eloued_health_search_history',
];

export interface StorageMetadata {
  version: string;
  lastUpdated: string;
  lastCleaned: string;
  entityCount: number;
  customEntityCount: number;
  sizeInBytes: number;
}

/**
 * Calculates the approximate size in bytes of a string in localStorage
 */
function getByteSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Calculates current total localStorage usage in bytes and item count
 */
export function getStorageStats(): { totalBytes: number; formattedSize: string; keyCount: number } {
  let totalBytes = 0;
  let keyCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keyCount++;
        const val = localStorage.getItem(key) || '';
        totalBytes += getByteSize(key) + getByteSize(val);
      }
    }
  } catch (e) {
    console.warn('Could not read full localStorage stats:', e);
  }

  const formattedSize = totalBytes > 1024 * 1024
    ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalBytes / 1024).toFixed(1)} KB`;

  return { totalBytes, formattedSize, keyCount };
}

/**
 * Auto-cleanup mechanism for stale, legacy, and corrupted data in localStorage
 * Preserves user's pending custom submissions while purging stale or redundant caches.
 */
export function cleanStaleStorage(): { purgedKeys: string[]; bytesFreed: number } {
  const purgedKeys: string[] = [];
  let bytesFreed = 0;

  try {
    // 1. Purge known obsolete legacy storage keys from previous versions
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const existing = localStorage.getItem(legacyKey);
      if (existing !== null) {
        bytesFreed += getByteSize(legacyKey) + getByteSize(existing);
        localStorage.removeItem(legacyKey);
        purgedKeys.push(legacyKey);
      }
    }

    // 2. Scan and remove any stray temporary or corrupted keys matching app namespace
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('eloued_health_temp_') || key.startsWith('temp_search_') || key.startsWith('osm_cache_')) {
        const val = localStorage.getItem(key) || '';
        bytesFreed += getByteSize(key) + getByteSize(val);
        localStorage.removeItem(key);
        purgedKeys.push(key);
      }

      // Check if current stored entities are corrupted JSON
      if (key === ALL_ENTITIES_STORAGE_KEY || key === CUSTOM_ENTITIES_STORAGE_KEY) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            JSON.parse(val);
          }
        } catch {
          // Corrupted JSON, purge safely
          localStorage.removeItem(key);
          purgedKeys.push(`${key} (corrupted)`);
        }
      }
    }

    // 3. Update storage maintenance timestamp
    updateStorageMetadata();
  } catch (err) {
    console.warn('Storage cleanup encountered a non-fatal error:', err);
  }

  if (purgedKeys.length > 0) {
    console.info(`[StorageManager] Cleaned up ${purgedKeys.length} stale items (~${(bytesFreed / 1024).toFixed(1)} KB freed).`);
  }

  return { purgedKeys, bytesFreed };
}

/**
 * Retrieves cached entities safely from localStorage
 */
export function loadCachedEntities(): HealthEntity[] {
  // First run cleanup to ensure no stale/corrupted entries
  cleanStaleStorage();

  try {
    const fullSaved = localStorage.getItem(ALL_ENTITIES_STORAGE_KEY);
    if (fullSaved) {
      const parsed: HealthEntity[] = JSON.parse(fullSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    const customSaved = localStorage.getItem(CUSTOM_ENTITIES_STORAGE_KEY);
    if (customSaved) {
      const parsedCustom: HealthEntity[] = JSON.parse(customSaved);
      if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
        return [...parsedCustom, ...HEALTH_DATA];
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached entities, falling back to default data:', err);
  }

  return HEALTH_DATA;
}

/**
 * Saves entities to localStorage with compression and safe fallback if storage is tight
 */
export function saveCachedEntities(entities: HealthEntity[]): boolean {
  if (!entities || !Array.isArray(entities)) return false;

  try {
    const serializedAll = JSON.stringify(entities);
    localStorage.setItem(ALL_ENTITIES_STORAGE_KEY, serializedAll);

    const customOnly = entities.filter(e => e.id.startsWith('custom-') || e.status === 'pending');
    if (customOnly.length > 0) {
      localStorage.setItem(CUSTOM_ENTITIES_STORAGE_KEY, JSON.stringify(customOnly));
    } else {
      localStorage.removeItem(CUSTOM_ENTITIES_STORAGE_KEY);
    }

    updateStorageMetadata(entities.length, customOnly.length);
    return true;
  } catch (err) {
    // If QuotaExceededError, clean up stale keys and retry with custom entities only
    console.warn('LocalStorage save failed, executing emergency cleanup:', err);
    cleanStaleStorage();

    try {
      const customOnly = entities.filter(e => e.id.startsWith('custom-') || e.status === 'pending');
      localStorage.setItem(CUSTOM_ENTITIES_STORAGE_KEY, JSON.stringify(customOnly));
      return true;
    } catch (retryErr) {
      console.error('Fatal LocalStorage save failure after cleanup:', retryErr);
      return false;
    }
  }
}

/**
 * Updates the storage metadata entry
 */
function updateStorageMetadata(entityCount = 0, customCount = 0): void {
  try {
    const { totalBytes } = getStorageStats();
    const meta: StorageMetadata = {
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString(),
      lastCleaned: new Date().toISOString(),
      entityCount,
      customEntityCount: customCount,
      sizeInBytes: totalBytes,
    };
    localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(meta));
  } catch {
    // Ignore metadata write error if storage is strictly constrained
  }
}

/**
 * Sets up a lightweight background maintenance loop for localStorage
 * Runs cleanup on start, periodically every 30 minutes, and when browser tab regains focus
 */
export function initStorageLifecycle(onBackgroundRefresh?: () => void): () => void {
  // 1. Initial cleanup on boot
  cleanStaleStorage();

  // 2. Periodic background maintenance every 30 minutes (1800000 ms)
  const intervalId = setInterval(() => {
    cleanStaleStorage();
    if (onBackgroundRefresh) {
      onBackgroundRefresh();
    }
  }, 30 * 60 * 1000);

  // 3. Tab visibility check - perform light check when user returns to the tab
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      try {
        const metaStr = localStorage.getItem(STORAGE_METADATA_KEY);
        if (metaStr) {
          const meta: StorageMetadata = JSON.parse(metaStr);
          const lastCleaned = new Date(meta.lastCleaned).getTime();
          const now = Date.now();
          // If more than 6 hours since last clean, do a pass
          if (now - lastCleaned > 6 * 60 * 60 * 1000) {
            cleanStaleStorage();
          }
        }
      } catch {
        cleanStaleStorage();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup teardown function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Resets local cached entities and purges storage back to initial baseline
 */
export function resetStorageToDefaults(): void {
  try {
    localStorage.removeItem(ALL_ENTITIES_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_ENTITIES_STORAGE_KEY);
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    updateStorageMetadata(HEALTH_DATA.length, 0);
  } catch (e) {
    console.warn('Error resetting localStorage to defaults:', e);
  }
}

