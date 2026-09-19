import {
  doc, setDoc, getDoc, updateDoc, collection,
  addDoc, query, where, getDocs, orderBy,
  serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Event, PickupRequest, WastePrediction, ImpactRecord, Notification } from '../types';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
  const ref = doc(db, 'users', profile.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function setUserRole(uid: string, role: 'ORGANIZER' | 'RECOVERY_PARTNER'): Promise<void> {
  if (!db || !uid || uid.startsWith('demo')) return;
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, { role, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('setUserRole Firestore warning:', e);
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'events'), {
    ...event,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getEventsByOrganizer(organizerUid: string): Promise<Event[]> {
  const q = query(
    collection(db, 'events'),
    where('organizerUid', '==', organizerUid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, 'events', eventId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Event : null;
}

export async function updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId), { ...data, updatedAt: serverTimestamp() });
}

// ─── Waste Predictions ────────────────────────────────────────────────────────

export async function saveWastePrediction(prediction: Omit<WastePrediction, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'waste_predictions'), {
    ...prediction,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPredictionsByUser(uid: string): Promise<WastePrediction[]> {
  const q = query(
    collection(db, 'waste_predictions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WastePrediction));
}

// ─── Recovery Partners ────────────────────────────────────────────────────────

export async function getRecoveryPartners(): Promise<any[]> {
  const snap = await getDocs(collection(db, 'recovery_partners'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function upsertRecoveryPartner(uid: string, data: any): Promise<void> {
  await setDoc(doc(db, 'recovery_partners', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ─── Pickup Requests ──────────────────────────────────────────────────────────

export async function createPickupRequest(req: Omit<PickupRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'pickup_requests'), {
    ...req,
    status: 'PENDING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // status history
  await addDoc(collection(db, 'pickup_status_history'), {
    pickupRequestId: ref.id,
    status: 'PENDING',
    changedAt: serverTimestamp(),
    changedBy: req.organizerUid,
  });
  return ref.id;
}

export async function getPickupRequestsByOrganizer(uid: string): Promise<PickupRequest[]> {
  const q = query(
    collection(db, 'pickup_requests'),
    where('organizerUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PickupRequest));
}

export async function getPickupRequestsByPartner(uid: string): Promise<PickupRequest[]> {
  const q = query(
    collection(db, 'pickup_requests'),
    where('partnerUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PickupRequest));
}

export async function updatePickupStatus(requestId: string, status: string, changedBy: string): Promise<void> {
  await updateDoc(doc(db, 'pickup_requests', requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'pickup_status_history'), {
    pickupRequestId: requestId,
    status,
    changedAt: serverTimestamp(),
    changedBy,
  });
}

// ─── Impact Records ───────────────────────────────────────────────────────────

export async function saveImpactRecord(record: Omit<ImpactRecord, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'impact_records'), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

export async function getImpactByUser(uid: string): Promise<ImpactRecord[]> {
  const q = query(
    collection(db, 'impact_records'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ImpactRecord));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(uid: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

// ─── Chat Sessions ────────────────────────────────────────────────────────────

export async function createChatSession(uid: string): Promise<string> {
  const ref = await addDoc(collection(db, 'chat_sessions'), {
    uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveChatMessage(sessionId: string, message: { role: string; content: string; uid: string }): Promise<void> {
  await addDoc(collection(db, 'chat_messages'), {
    ...message,
    sessionId,
    createdAt: serverTimestamp(),
  });
}
