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

const auditLogsStore: AuditLogEvent[] = [];

export function recordAuditLog(event: Omit<AuditLogEvent, 'timestamp'>): AuditLogEvent {
  const auditEntry: AuditLogEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };

  auditLogsStore.push(auditEntry);

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
