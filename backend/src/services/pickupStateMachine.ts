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

export function isValidTransition(from: PickupStatus, to: PickupStatus): boolean {
  const allowed = validTransitions[from];
  return allowed ? allowed.includes(to) : false;
}

export function transitionPickupStatus(
  pickupId: string,
  targetStatus: PickupStatus,
  userId: string,
  reason?: string
): PickupStateRecord {
  const current = pickupStateStore.get(pickupId) || {
    pickupId,
    eventId: 'evt_sample_123',
    partnerId: 'partner_vjw_01',
    currentStatus: 'PENDING',
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
    version: 1
  };

  if (!isValidTransition(current.currentStatus, targetStatus)) {
    throw new Error(
      `Invalid state transition from '${current.currentStatus}' to '${targetStatus}'. Allowed target states: [${(validTransitions[current.currentStatus] || []).join(', ')}]`
    );
  }

  const previousStatus = current.currentStatus;
  const updatedRecord: PickupStateRecord = {
    ...current,
    previousStatus,
    currentStatus: targetStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
    transitionReason: reason || 'Status update via state machine',
    version: current.version + 1
  };

  pickupStateStore.set(pickupId, updatedRecord);

  // Write immutable event audit entry to pickup_events collection
  const auditEvent: PickupEventAudit = {
    pickupId,
    from: previousStatus,
    to: targetStatus,
    changedBy: userId,
    timestamp: new Date().toISOString(),
    reason: reason || 'Status transition'
  };
  pickupEventsAuditStore.push(auditEvent);

  // Record in global security audit log
  recordAuditLog({
    actorId: userId,
    actorRole: 'RECOVERY_PARTNER',
    action: `PICKUP_TRANSITION_${targetStatus}`,
    resourceType: 'PICKUP',
    resourceId: pickupId,
    metadata: { from: previousStatus, to: targetStatus, reason }
  });

  return updatedRecord;
}

export function getPickupState(pickupId: string): PickupStateRecord | undefined {
  return pickupStateStore.get(pickupId);
}

export function getPickupAuditTrail(pickupId: string): PickupEventAudit[] {
  return pickupEventsAuditStore.filter(evt => evt.pickupId === pickupId);
}
