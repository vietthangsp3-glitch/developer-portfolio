import "server-only";

import { sql } from "drizzle-orm";
import { z } from "zod";

import { getDatabase } from "@/server/db";
import { runDatabaseOperation } from "@/server/db/errors";

const rateLimitInputSchema = z.object({
  scope: z.string().trim().min(1).max(80),
  identifierHash: z.string().regex(/^[a-f0-9]{64}$/),
  limit: z.number().int().positive().max(10_000),
  windowMs: z.number().int().min(1_000).max(86_400_000),
  now: z.date().optional(),
});

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  retryAt: Date;
};

export function getRateLimitWindow(now: Date, windowMs: number) {
  const parsedWindowMs = z
    .number()
    .int()
    .min(1_000)
    .max(86_400_000)
    .parse(windowMs);
  const windowStart = new Date(
    Math.floor(now.getTime() / parsedWindowMs) * parsedWindowMs,
  );

  return {
    windowStart,
    retryAt: new Date(windowStart.getTime() + parsedWindowMs),
  };
}

export async function consumeRateLimit(
  input: z.input<typeof rateLimitInputSchema>,
): Promise<RateLimitResult> {
  const value = rateLimitInputSchema.parse(input);
  const now = value.now ?? new Date();
  const { windowStart, retryAt } = getRateLimitWindow(now, value.windowMs);

  return runDatabaseOperation("consumeRateLimit", async () => {
    const result = await getDatabase().execute<{ request_count: number }>(sql`
      insert into rate_limits (
        scope,
        identifier_hash,
        window_start,
        request_count,
        expires_at
      ) values (
        ${value.scope},
        ${value.identifierHash},
        ${windowStart},
        1,
        ${retryAt}
      )
      on conflict (scope, identifier_hash, window_start)
      do update set
        request_count = rate_limits.request_count + 1,
        expires_at = greatest(rate_limits.expires_at, excluded.expires_at)
      where rate_limits.request_count < ${value.limit}
      returning request_count
    `);

    const count = result.rows[0]?.request_count;

    return {
      allowed: count !== undefined,
      count: count ?? value.limit,
      retryAt,
    };
  });
}
