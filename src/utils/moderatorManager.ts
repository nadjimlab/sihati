import { ModeratorUser, ModeratorPermission, AdminSession } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

const MODERATORS_COLLECTION = 'moderators';
const MODERATORS_LOCAL_KEY = 'eloued_health_moderators_v1';
const ADMIN_STORAGE_PASS_KEY = 'eloued_health_admin_password';
const DEFAULT_SUPERADMIN_PASS = 'NADJIM92bejaia';

export const ALL_MODERATOR_PERMISSIONS: { id: ModeratorPermission; label: string; description: string }[] = [
  {
    id: 'can_edit_entities',
    label: 'تعديل بيانات المنشآت',
    description: 'تعديل أسماء وأرقام وعناوين الصيدليات، الأطباء والمستشفيات المسجلة.',
  },
  {
    id: 'can_publish_entities',
    label: 'نشر وتفعيل الطلبات الجديدة',
    description: 'مراجعة وقبول المنشآت الطبية المرسلة من طرف المواطنين والمهنيين ونشرها على الموقع.',
  },
  {
    id: 'can_manage_garde',
    label: 'إدارة وجدولة صيدليات المناوبة',
    description: 'تعديل أيام المناوبة الدورية ونشر التغييرات في جدول الصيدليات المناوبة.',
  },
  {
    id: 'can_add_entities',
    label: 'إضافة منشآت طبية جديدة',
    description: 'إضافة صيدلية، عيادة، مستشفى أو طبيب جديد مباشرة إلى الدليل.',
  },
  {
    id: 'can_delete_entities',
    label: 'حذف المنشآت الطبية',
    description: 'صلاحية حذف المنشآت الطبية غير الصالحة أو المكررة.',
  },
];

export function getLocalModerators(): ModeratorUser[] {
  try {
    const raw = localStorage.getItem(MODERATORS_LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalModerators(moderators: ModeratorUser[]): void {
  try {
    localStorage.setItem(MODERATORS_LOCAL_KEY, JSON.stringify(moderators));
  } catch (e) {
    console.warn('Failed to save moderators locally:', e);
  }
}

/**
 * Subscribe to real-time moderators list
 */
export function subscribeToModerators(
  onUpdate: (moderators: ModeratorUser[]) => void,
  onError?: (error: any) => void
): () => void {
  // Return local cache immediately
  onUpdate(getLocalModerators());

  try {
    const colRef = collection(db, MODERATORS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const mods: ModeratorUser[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          mods.push({
            id: docSnap.id,
            name: d.name || '',
            username: d.username || '',
            password: d.password || '',
            email: d.email || undefined,
            phone: d.phone || undefined,
            permissions: d.permissions || ['can_edit_entities', 'can_publish_entities'],
            status: d.status || 'active',
            createdAt: d.createdAt || new Date().toISOString(),
            lastLoginAt: d.lastLoginAt || undefined,
            notes: d.notes || undefined,
          });
        });

        if (mods.length > 0) {
          saveLocalModerators(mods);
          onUpdate(mods);
        } else {
          // If Firestore is empty, use local
          onUpdate(getLocalModerators());
        }
      },
      (err) => {
        console.warn('Moderators snapshot error (fallback to local):', err);
        if (onError) onError(err);
      }
    );
  } catch (e) {
    console.warn('subscribeToModerators error:', e);
    return () => {};
  }
}

/**
 * Add a new Moderator
 */
export async function addModerator(mod: ModeratorUser): Promise<void> {
  const local = getLocalModerators();
  const updated = [mod, ...local.filter(m => m.id !== mod.id)];
  saveLocalModerators(updated);

  try {
    const docRef = doc(db, MODERATORS_COLLECTION, mod.id);
    await setDoc(docRef, {
      name: mod.name,
      username: mod.username.toLowerCase().trim(),
      password: mod.password || '',
      email: mod.email || '',
      phone: mod.phone || '',
      permissions: mod.permissions,
      status: mod.status,
      createdAt: mod.createdAt,
      notes: mod.notes || '',
    });
  } catch (err) {
    console.warn('Firestore moderator add note:', err);
  }
}

/**
 * Update an existing Moderator
 */
export async function updateModerator(mod: ModeratorUser): Promise<void> {
  const local = getLocalModerators();
  const updated = local.map(m => m.id === mod.id ? mod : m);
  saveLocalModerators(updated);

  try {
    const docRef = doc(db, MODERATORS_COLLECTION, mod.id);
    await setDoc(docRef, {
      name: mod.name,
      username: mod.username.toLowerCase().trim(),
      password: mod.password || '',
      email: mod.email || '',
      phone: mod.phone || '',
      permissions: mod.permissions,
      status: mod.status,
      createdAt: mod.createdAt,
      lastLoginAt: mod.lastLoginAt || new Date().toISOString(),
      notes: mod.notes || '',
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore moderator update note:', err);
  }
}

/**
 * Delete a Moderator
 */
export async function deleteModerator(modId: string): Promise<void> {
  const local = getLocalModerators();
  const updated = local.filter(m => m.id !== modId);
  saveLocalModerators(updated);

  try {
    const docRef = doc(db, MODERATORS_COLLECTION, modId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore moderator delete note:', err);
  }
}

const ADMIN_SESSION_STORAGE_KEY = 'eloued_health_admin_session_v1';

export function getStoredAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to save admin session:', e);
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear admin session:', e);
  }
}

/**
 * Authenticate either as Super Admin (Master Password) OR as a Moderator (Username/Password or PIN)
 * Note: Case-insensitive comparison is enabled for maximum convenience.
 */
export function authenticateAdminCredentials(
  identifierOrPass: string, 
  optionalPassword?: string
): AdminSession {
  const storedSuperPass = (localStorage.getItem(ADMIN_STORAGE_PASS_KEY) || DEFAULT_SUPERADMIN_PASS).trim().toLowerCase();
  const input = identifierOrPass.trim().toLowerCase();
  const optPass = optionalPassword ? optionalPassword.trim().toLowerCase() : '';

  // 1. Check if matches Super Admin Master Password (case-insensitive)
  if (input === storedSuperPass || (optPass && optPass === storedSuperPass)) {
    const session: AdminSession = {
      isAuthenticated: true,
      isSuperAdmin: true,
      name: 'المدير العام',
      role: 'super_admin',
      permissions: [
        'can_edit_entities',
        'can_publish_entities',
        'can_manage_garde',
        'can_add_entities',
        'can_delete_entities',
      ],
    };
    saveAdminSession(session);
    return session;
  }

  // 2. Check if matches a Moderator (case-insensitive for username, password, pin, and email)
  const mods = getLocalModerators();
  
  const matchedMod = mods.find(m => {
    if (m.status === 'suspended') return false;
    
    const modUsername = (m.username || '').trim().toLowerCase();
    const modEmail = (m.email || '').trim().toLowerCase();
    const modPass = (m.password || '').trim().toLowerCase();

    // Matched by username and password
    if (optPass) {
      const matchUser = modUsername === input || (modEmail && modEmail === input);
      return matchUser && modPass === optPass;
    }
    
    // Matched by direct password/PIN alone or username
    return modPass === input || modUsername === input;
  });

  if (matchedMod) {
    // Record login timestamp
    updateModerator({
      ...matchedMod,
      lastLoginAt: new Date().toISOString(),
    }).catch(console.warn);

    const session: AdminSession = {
      isAuthenticated: true,
      isSuperAdmin: false,
      moderator: matchedMod,
      name: matchedMod.name,
      role: 'moderator',
      permissions: matchedMod.permissions,
    };
    saveAdminSession(session);
    return session;
  }

  return {
    isAuthenticated: false,
    isSuperAdmin: false,
  };
}
