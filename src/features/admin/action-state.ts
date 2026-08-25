export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
};

export function validationActionState(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): AdminActionState {
  return {
    status: "error",
    message,
    fieldErrors: fieldErrors
      ? Object.fromEntries(
          Object.entries(fieldErrors).filter(
            (entry): entry is [string, string[]] => Boolean(entry[1]),
          ),
        )
      : undefined,
  };
}
