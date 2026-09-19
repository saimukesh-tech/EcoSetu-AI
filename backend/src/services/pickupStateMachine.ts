export type PickupStatus =
  | 'PENDING'
  | 'MATCHED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'PICKUP_IN_PROGRESS'
  | 'COLLECTED'
  | 'RECOVERED'
  | 'COMPLETED'
  | 'CANCELLED';

const VALID_TRANSITIONS: Record<PickupStatus, PickupStatus[]> = {
  PENDING: ['MATCHED', 'ACCEPTED', 'CANCELLED'],
  MATCHED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['PICKUP_IN_PROGRESS', 'CANCELLED'],
  PICKUP_IN_PROGRESS: ['COLLECTED', 'CANCELLED'],
  COLLECTED: ['RECOVERED'],
  RECOVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

export function isValidStatusTransition(currentStatus: PickupStatus, newStatus: PickupStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

export function validateStatusTransition(currentStatus: PickupStatus, newStatus: PickupStatus): void {
  if (!isValidStatusTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${(VALID_TRANSITIONS[currentStatus] || []).join(', ')}]`);
  }
}
