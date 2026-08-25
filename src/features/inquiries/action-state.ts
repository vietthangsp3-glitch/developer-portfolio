export type InquiryField =
  "name" | "email" | "company" | "projectType" | "budget" | "message";

export type InquiryActionState = {
  status: "idle" | "success" | "validation_error" | "error" | "rate_limited";
  message: string;
  fieldErrors?: Partial<Record<InquiryField, string[]>>;
};

export const initialInquiryActionState: InquiryActionState = {
  status: "idle",
  message: "",
};
