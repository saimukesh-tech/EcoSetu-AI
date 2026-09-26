export interface AuditLogEvent {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipHash?: string;
  metadata?: Record<string, any>;
}

const auditLogsStore: AuditLogEvent[] = [
  {
    actorId: 'demo_admin_789',
    actorRole: 'ADMIN',
    action: 'VERIFY_PARTNER',
    resourceType: 'RECOVERY_PARTNER',
    resourceId: 'partner_vjw_01',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    metadata: { status: 'VERIFIED', orgName: 'Vijayawada EcoRecycle Unit' }
  },
  {
    actorId: 'demo_organizer_123',
    actorRole: 'ORGANIZER',
    action: 'CREATE_PICKUP',
    resourceType: 'PICKUP',
    resourceId: 'pkp_demo_101',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    metadata: { totalKg: 438, partnerId: 'partner_vjw_01' }
  },
  {
    actorId: 'demo_partner_456',
    actorRole: 'RECOVERY_PARTNER',
    action: 'PICKUP_TRANSITION_ACCEPTED',
    resourceType: 'PICKUP',
    resourceId: 'pkp_demo_101',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    metadata: { from: 'PENDING', to: 'ACCEPTED' }
  }
];

export function recordAuditLog(event: Omit<AuditLogEvent, 'timestamp'>): AuditLogEvent {
  const auditEntry: AuditLogEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };

  auditLogsStore.unshift(auditEntry);

  console.log(JSON.stringify({
    type: 'AUDIT_LOG',
    ...auditEntry
  }));

  return auditEntry;
}

export function getAuditLogs(filter?: { resourceId?: string; actorId?: string }): AuditLogEvent[] {
  let logs = [...auditLogsStore];
  if (filter?.resourceId) {
    logs = logs.filter(l => l.resourceId === filter.resourceId);
  }
  if (filter?.actorId) {
    logs = logs.filter(l => l.actorId === filter.actorId);
  }
  return logs;
}
