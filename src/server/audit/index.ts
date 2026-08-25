import "server-only";

import type { AuditEvent } from "@/features/audit/schemas/audit";
import { auditEventSchema } from "@/features/audit/schemas/audit";
import { getDatabase } from "@/server/db";
import { auditLogs } from "@/server/db/schema";

export async function recordAuditEvent(input: AuditEvent) {
  const event = auditEventSchema.parse(input);

  await getDatabase().insert(auditLogs).values(event);
}

export async function recordAuditEventBestEffort(input: AuditEvent) {
  try {
    await recordAuditEvent(input);
  } catch (error) {
    console.error("Audit event could not be recorded", {
      action: input.action,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
  }
}
