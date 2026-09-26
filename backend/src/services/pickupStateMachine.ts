import { recordAuditLog } from './auditLogger';

export type PickupStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'PICKUP_IN_PROGRESS'
  | 'COLLECTED'
  | 'RECOVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PickupStateRecord {
  pickupId: string;
  eventId: string;
  partnerId: string;
  currentStatus: PickupStatus;
  previousStatus?: PickupStatus;
  updatedAt: string;
  updatedBy: string;
  transitionReason?: string;
  version: number;
}

export interface PickupEventAudit {
  pickupId: string;
  from: PickupStatus;
  to: PickupStatus;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

const pickupStateStore = new Map<string, PickupStateRecord>();
const pickupEventsAuditStore: PickupEventAudit[] = [];

// Legal State Transition Matrix
const validTransitions: Record<PickupStatus, PickupStatus[]> = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['PICKUP_IN_PROGRESS', 'CANCELLED'],
  PICKUP_IN_PROGRESS: ['COLLECTED', 'CANCELLED'],
  COLLECTED: ['RECOVERED', 'CANCELLED'],
  RECOVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

export function isValidTransition(from: PickupStatus | null, to: PickupStatus): boolean {
  if (!from) return to === 'PENDING';
  const allowed = validTransitions[from];
  return allowed ? allowed.includes(to) : false;
}

export function transitionPickupStatus(
  pickupId: string,
  targetStatus: PickupStatus,
  userId: string,
  reason?: string
): PickupStateRecord {
  const existing = pickupStateStore.get(pickupId);
  const currentStatus = existing ? existing.currentStatus : null;

  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new Error(
      `Invalid state transition from '${currentStatus || 'NONE'}' to '${targetStatus}'. Allowed target states: [${currentStatus ? (validTransitions[currentStatus] || []).join(', ') : 'PENDING'}]`
    );
  }

  const updatedRecord: PickupStateRecord = {
    pickupId,
    eventId: existing?.eventId || 'evt_sample',
    partnerId: existing?.partnerId || 'partner_sample',
    previousStatus: existing ? existing.currentStatus : undefined,
    currentStatus: targetStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
    transitionReason: reason || 'Status update via state machine',
    version: existing ? existing.version + 1 : 1
  };

  pickupStateStore.set(pickupId, updatedRecord);

  const auditEvent: PickupEventAudit = {
    pickupId,
    from: existing ? existing.currentStatus : 'PENDING',
    to: targetStatus,
    changedBy: userId,
    timestamp: new Date().toISOString(),
    reason: reason || 'Status transition'
  };
  pickupEventsAuditStore.push(auditEvent);

  recordAuditLog({
    actorId: userId,
    actorRole: 'RECOVERY_PARTNER',
    action: `PICKUP_TRANSITION_${targetStatus}`,
    resourceType: 'PICKUP',
    resourceId: pickupId,
    metadata: { from: existing ? existing.currentStatus : null, to: targetStatus, reason }
  });

  return updatedRecord;
}

export function getPickupState(pickupId: string): PickupStateRecord | undefined {
  return pickupStateStore.get(pickupId);
}

export function getPickupAuditTrail(pickupId: string): PickupEventAudit[] {
  return pickupEventsAuditStore.filter(evt => evt.pickupId === pickupId);
}
