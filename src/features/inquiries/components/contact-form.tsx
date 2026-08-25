"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  initialInquiryActionState,
  type InquiryActionState,
  type InquiryField,
} from "@/features/inquiries/action-state";
import { submitInquiryAction } from "@/features/inquiries/actions/submit-inquiry";

const inputClass =
  "border-border bg-surface text-foreground focus:border-focus min-h-12 w-full rounded-none border px-4 py-3 placeholder:text-muted-foreground/80 aria-invalid:border-danger";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Sending…" : "Send enquiry"}
    </Button>
  );
}

function FieldError({
  field,
  state,
}: {
  field: InquiryField;
  state: InquiryActionState;
}) {
  const errors = state.fieldErrors?.[field];
  if (!errors?.length) return null;
  return (
    <span id={`${field}-error`} className="text-danger mt-2 block text-sm">
      {errors[0]}
    </span>
  );
}

function errorProps(field: InquiryField, state: InquiryActionState) {
  const invalid = Boolean(state.fieldErrors?.[field]?.length);
  return {
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${field}-error` : undefined,
  } as const;
}

export function ContactForm() {
  const [state, formAction] = useActionState(
    submitInquiryAction,
    initialInquiryActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-5"
      aria-describedby="form-note form-status"
      noValidate
    >
      <div
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-x-6 gap-y-9 md:grid-cols-2">
        <label className="block" htmlFor="name">
          <span className="text-label font-mono uppercase">Name</span>
          <input
            id="name"
            className={inputClass}
            name="name"
            autoComplete="name"
            required
            placeholder="Your name"
            {...errorProps("name", state)}
          />
          <FieldError field="name" state={state} />
        </label>
        <label className="block" htmlFor="email">
          <span className="text-label font-mono uppercase">Email</span>
          <input
            id="email"
            className={inputClass}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            {...errorProps("email", state)}
          />
          <FieldError field="email" state={state} />
        </label>
        <label className="block" htmlFor="company">
          <span className="text-label font-mono uppercase">
            Company{" "}
            <span className="text-muted-foreground normal-case">
              (optional)
            </span>
          </span>
          <input
            id="company"
            className={inputClass}
            name="company"
            autoComplete="organization"
            placeholder="Company or studio"
            {...errorProps("company", state)}
          />
          <FieldError field="company" state={state} />
        </label>
        <label className="block" htmlFor="projectType">
          <span className="text-label font-mono uppercase">Project type</span>
          <select
            id="projectType"
            className={inputClass}
            name="projectType"
            defaultValue=""
            required
            {...errorProps("projectType", state)}
          >
            <option value="" disabled>
              Select one
            </option>
            <option>Marketing website</option>
            <option>Web application</option>
            <option>WordPress / publishing</option>
            <option>Interactive experience</option>
            <option>Something else</option>
          </select>
          <FieldError field="projectType" state={state} />
        </label>
        <label className="block md:col-span-2" htmlFor="budget">
          <span className="text-label font-mono uppercase">
            Indicative budget{" "}
            <span className="text-muted-foreground normal-case">
              (optional)
            </span>
          </span>
          <select
            id="budget"
            className={inputClass}
            name="budget"
            defaultValue=""
            {...errorProps("budget", state)}
          >
            <option value="">Not defined yet</option>
            <option>Under $5,000</option>
            <option>$5,000–$10,000</option>
            <option>$10,000–$25,000</option>
            <option>$25,000+</option>
          </select>
          <FieldError field="budget" state={state} />
        </label>
        <label className="block md:col-span-2" htmlFor="message">
          <span className="text-label font-mono uppercase">
            Project details
          </span>
          <textarea
            id="message"
            className={`${inputClass} min-h-40 resize-y`}
            name="message"
            required
            placeholder="What are you making, and what needs to change?"
            {...errorProps("message", state)}
          />
          <FieldError field="message" state={state} />
        </label>
      </div>
      <div className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center">
        <SubmitButton />
        <p
          id="form-note"
          className="text-muted-foreground max-w-[44ch] text-sm"
        >
          Your details are used only to respond to this inquiry.
        </p>
      </div>
      <div
        id="form-status"
        className={`mt-5 min-h-6 border-l-2 pl-4 text-sm ${state.status === "success" ? "border-success text-success" : state.status === "idle" ? "border-transparent" : "border-danger text-danger"}`}
        role={
          state.status === "validation_error" || state.status === "error"
            ? "alert"
            : "status"
        }
        aria-live="polite"
      >
        {state.message}
      </div>
    </form>
  );
}
