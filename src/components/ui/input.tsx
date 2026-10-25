import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "flex h-11 w-full rounded border border-rule-strong bg-night px-3 text-[15px] text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus-visible:border-cream focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-ball";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldClass,
          "file:mr-3 file:rounded file:border-0 file:bg-night-3 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink",
          type === "file" && "h-auto py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/** Label + control + optional hint/error, wired with htmlFor/aria. */
function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-[#ff8a90]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Input, Field };
