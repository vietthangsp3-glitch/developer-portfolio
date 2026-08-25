import "server-only";

import { randomUUID } from "node:crypto";

export class DatabaseOperationError extends Error {
  readonly errorId: string;

  constructor(errorId: string) {
    super("The requested data operation could not be completed.");
    this.name = "DatabaseOperationError";
    this.errorId = errorId;
  }
}

export async function runDatabaseOperation<T>(
  operation: string,
  callback: () => Promise<T>,
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    const errorId = randomUUID();

    console.error("Database operation failed", {
      errorId,
      operation,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });

    throw new DatabaseOperationError(errorId);
  }
}
