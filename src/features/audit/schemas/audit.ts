import { z } from "zod";

import { plainTextSchema } from "@/lib/validation";

const forbiddenMetadataKey =
  /password|secret|token|message|raw.?ip|ip.?address/i;

export const auditMetadataSchema = z
  .record(
    z.string().max(80),
    z.union([
      z.string().max(500),
      z.number().finite(),
      z.boolean(),
      z.null(),
      z
        .array(z.union([z.string().max(200), z.number().finite(), z.boolean()]))
        .max(20),
    ]),
  )
  .superRefine((value, context) => {
    for (const key of Object.keys(value)) {
      if (forbiddenMetadataKey.test(key)) {
        context.addIssue({
          code: "custom",
          message: `Audit metadata key "${key}" is not allowed.`,
          path: [key],
        });
      }
    }
  });

export const auditEventSchema = z.object({
  actorUserId: z.string().uuid().nullable().optional(),
  action: plainTextSchema(120),
  entityType: plainTextSchema(80),
  entityId: z.string().uuid().nullable().optional(),
  metadata: auditMetadataSchema.default({}),
});

export type AuditMetadata = z.infer<typeof auditMetadataSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
