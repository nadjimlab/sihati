import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { HealthEntity } from '../types';
import { HEALTH_DATA } from '../data/mockData';

const ENTITIES_COLLECTION = 'entities';

/**
 * Real-time subscription to all Health Entities in Firestore
 * Automatically seeds the database from HEALTH_DATA if empty.
 */
export function subscribeToHealthEntities(
  onSuccess: (entities: HealthEntity[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, ENTITIES_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed initial health entities to Firestore
        try {
          await syncInitialDataToFirestore();
          // The onSnapshot will re-fire with the new documents
          return;
        } catch (e) {
          console.warn('Initial seeding attempt failed or will retry on next snapshot:', e);
        }
      }

      const entities: HealthEntity[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        entities.push({
          id: docSnap.id,
          name: data.name || '',
          type: data.type || 'صيدلية',
          specialty: data.specialty || undefined,
          commune: data.commune || 'الوادي',
          address: data.address || '',
          phone: data.phone || '',
          secondaryPhone: data.secondaryPhone || undefined,
          garde_days: data.garde_days || undefined,
          garde_dates: data.garde_dates || undefined,
          garde_shift: data.garde_shift || undefined,
          latitude: data.latitude !== undefined ? Number(data.latitude) : undefined,
          longitude: data.longitude !== undefined ? Number(data.longitude) : undefined,
          workingHours: data.workingHours || undefined,
          isEmergency: data.isEmergency || false,
          notes: data.notes || undefined,
          status: data.status || 'approved', // Default legacy or initial to approved
          submittedBy: data.submittedBy || undefined,
          submittedAt: data.submittedAt || undefined,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });
      onSuccess(entities);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, ENTITIES_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Add a new health entity to Firestore
 */
export async function addEntityToFirestore(entity: HealthEntity): Promise<void> {
  const entityId = entity.id || `entity-${Date.now()}`;
  const docRef = doc(db, ENTITIES_COLLECTION, entityId);
  
  const payload: Record<string, any> = {
    name: entity.name,
    type: entity.type,
    commune: entity.commune,
    address: entity.address,
    phone: entity.phone,
    status: entity.status || 'pending', // Default new user submissions to pending
    createdAt: entity.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (entity.specialty) payload.specialty = entity.specialty;
  if (entity.secondaryPhone) payload.secondaryPhone = entity.secondaryPhone;
  if (entity.garde_days && entity.garde_days.length > 0) payload.garde_days = entity.garde_days;
  if (entity.garde_dates && entity.garde_dates.length > 0) payload.garde_dates = entity.garde_dates;
  if (entity.garde_shift) payload.garde_shift = entity.garde_shift;
  if (entity.latitude !== undefined) payload.latitude = Number(entity.latitude);
  if (entity.longitude !== undefined) payload.longitude = Number(entity.longitude);
  if (entity.workingHours) payload.workingHours = entity.workingHours;
  if (entity.isEmergency !== undefined) payload.isEmergency = entity.isEmergency;
  if (entity.notes) payload.notes = entity.notes;
  if (entity.submittedBy) payload.submittedBy = entity.submittedBy;
  if (entity.submittedAt) payload.submittedAt = entity.submittedAt;

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ENTITIES_COLLECTION}/${entityId}`);
  }
}

/**
 * Update an existing health entity in Firestore
 */
export async function updateEntityInFirestore(entity: HealthEntity): Promise<void> {
  const docRef = doc(db, ENTITIES_COLLECTION, entity.id);

  const payload: Record<string, any> = {
    name: entity.name,
    type: entity.type,
    commune: entity.commune,
    address: entity.address,
    phone: entity.phone,
    status: entity.status || 'approved',
    updatedAt: new Date().toISOString(),
  };

  if (entity.specialty !== undefined) payload.specialty = entity.specialty || '';
  if (entity.secondaryPhone !== undefined) payload.secondaryPhone = entity.secondaryPhone || '';
  if (entity.garde_days !== undefined) payload.garde_days = entity.garde_days;
  if (entity.garde_dates !== undefined) payload.garde_dates = entity.garde_dates;
  if (entity.garde_shift !== undefined) payload.garde_shift = entity.garde_shift || '';
  if (entity.latitude !== undefined) payload.latitude = Number(entity.latitude);
  if (entity.longitude !== undefined) payload.longitude = Number(entity.longitude);
  if (entity.workingHours !== undefined) payload.workingHours = entity.workingHours || '';
  if (entity.isEmergency !== undefined) payload.isEmergency = Boolean(entity.isEmergency);
  if (entity.notes !== undefined) payload.notes = entity.notes || '';
  if (entity.submittedBy !== undefined) payload.submittedBy = entity.submittedBy;
  if (entity.submittedAt !== undefined) payload.submittedAt = entity.submittedAt;

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ENTITIES_COLLECTION}/${entity.id}`);
  }
}

/**
 * Approve a pending entity
 */
export async function approveEntityInFirestore(entityId: string): Promise<void> {
  const docRef = doc(db, ENTITIES_COLLECTION, entityId);
  try {
    await updateDoc(docRef, {
      status: 'approved',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ENTITIES_COLLECTION}/${entityId}`);
  }
}

/**
 * Delete a health entity from Firestore
 */
export async function deleteEntityFromFirestore(entityId: string): Promise<void> {
  const docRef = doc(db, ENTITIES_COLLECTION, entityId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ENTITIES_COLLECTION}/${entityId}`);
  }
}

/**
 * Seed initial mock dataset into Firestore if database collection is empty
 */
export async function syncInitialDataToFirestore(customEntities?: HealthEntity[]): Promise<number> {
  const allToSync = customEntities && customEntities.length > 0 ? customEntities : HEALTH_DATA;
  const batch = writeBatch(db);
  let count = 0;

  for (const entity of allToSync) {
    const docRef = doc(db, ENTITIES_COLLECTION, entity.id);
    const payload: Record<string, any> = {
      name: entity.name,
      type: entity.type,
      commune: entity.commune,
      address: entity.address,
      phone: entity.phone,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (entity.specialty) payload.specialty = entity.specialty;
    if (entity.secondaryPhone) payload.secondaryPhone = entity.secondaryPhone;
    if (entity.garde_days && entity.garde_days.length > 0) payload.garde_days = entity.garde_days;
    if (entity.garde_dates && entity.garde_dates.length > 0) payload.garde_dates = entity.garde_dates;
    if (entity.garde_shift) payload.garde_shift = entity.garde_shift;
    if (entity.latitude !== undefined) payload.latitude = Number(entity.latitude);
    if (entity.longitude !== undefined) payload.longitude = Number(entity.longitude);
    if (entity.workingHours) payload.workingHours = entity.workingHours;
    if (entity.isEmergency !== undefined) payload.isEmergency = entity.isEmergency;
    if (entity.notes) payload.notes = entity.notes;

    batch.set(docRef, payload);
    count++;
  }

  try {
    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ENTITIES_COLLECTION);
    return 0;
  }
}

/**
 * Auth Helpers
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function registerAdminWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export function subscribeToAuth(onAuthChange: (user: User | null) => void) {
  return onAuthStateChanged(auth, onAuthChange);
}
