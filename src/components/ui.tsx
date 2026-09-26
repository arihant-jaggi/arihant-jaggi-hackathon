import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Buttons. "signal" = gradient fill (the flyer's Registration tile),
// "outline" = hairline, "ghost" = text only.
// ---------------------------------------------------------------------------

type Variant = "signal" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.16em] transition-[background,color,border-color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";
const buttonVariants: Record<Variant, string> = {
  signal: "bg-signal text-void hover:shadow-glow",
  outline: "border border-line-strong bg-transparent text-ink hover:border-signal hover:text-signal",
  ghost: "text-dim hover:text-ink",
  danger: "border border-alert/50 text-alert hover:bg-alert/10",
};
const buttonSizes: Record<Size, string> = {
  sm: "h-9 px-3 rounded-md",
  md: "h-11 px-5 rounded-lg",
  lg: "h-14 px-7 rounded-xl text-[13px]",
};

export const buttonClass = (variant: Variant = "signal", size: Size = "md", className?: string) =>
  cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  ({ variant = "signal", size = "md", className, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
  ),
);
Button.displayName = "Button";

export const ButtonLink = ({ variant = "signal", size = "md", className, ...props }: LinkProps & { variant?: Variant; size?: Size }) => (
  <Link className={buttonClass(variant, size, className)} {...props} />
);

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Spaced mono label with the flyer's leading rule: "—— YOUNG CODERS…". */
export const Kicker = ({ children, rule = true, className }: { children: ReactNode; rule?: boolean; className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    {rule && <span aria-hidden className="h-px w-10 bg-signal" />}
    <span className="kicker text-signal">{children}</span>
  </div>
);

export const SectionTitle = ({ kicker, title, lede, className }: { kicker?: string; title: ReactNode; lede?: ReactNode; className?: string }) => (
  <div className={cn("max-w-2xl space-y-4", className)}>
    {kicker && <Kicker>{kicker}</Kicker>}
    <h2 className="font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-ink sm:text-5xl">{title}</h2>
    {lede && <p className="text-base text-dim sm:text-lg">{lede}</p>}
  </div>
);

export const GradientText = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("text-signal", className)}>{children}</span>
);

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export const Panel = ({ className, glow, ...props }: HTMLAttributes<HTMLDivElement> & { glow?: boolean }) => (
  <div className={cn("rounded-2xl border border-line bg-deck", glow && "signal-border", className)} {...props} />
);

/** Icon chip — the rounded green tiles next to DATE / TIME / LOCATION. */
export const IconTile = ({ children, solid, className }: { children: ReactNode; solid?: boolean; className?: string }) => (
  <span
    className={cn(
      "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
      solid ? "bg-signal-diag text-void" : "border border-signal/30 bg-signal/[0.07] text-signal",
      className,
    )}
  >
    {children}
  </span>
);

/** Status LED dot. */
export const Led = ({ tone = "signal", pulse, className }: { tone?: "signal" | "pulse" | "warn" | "alert" | "dim"; pulse?: boolean; className?: string }) => {
  const color = { signal: "bg-signal", pulse: "bg-pulse", warn: "bg-warn", alert: "bg-alert", dim: "bg-faint" }[tone];
  return (
    <span aria-hidden className={cn("relative inline-flex h-2 w-2", className)}>
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", color)} />}
      <span className={cn("relative h-2 w-2 rounded-full", color)} />
    </span>
  );
};

export const Badge = ({ children, tone = "dim", className }: { children: ReactNode; tone?: "signal" | "pulse" | "warn" | "alert" | "dim"; className?: string }) => {
  const tones = {
    signal: "border-signal/40 text-signal bg-signal/[0.08]",
    pulse: "border-pulse/40 text-pulse bg-pulse/[0.08]",
    warn: "border-warn/40 text-warn bg-warn/[0.08]",
    alert: "border-alert/40 text-alert bg-alert/[0.08]",
    dim: "border-line-strong text-dim bg-rail",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]", tones[tone], className)}>
      {children}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

const fieldBase =
  "w-full rounded-lg border border-line bg-rail px-3.5 text-[15px] text-ink placeholder:text-faint transition-colors focus:border-pulse focus:outline-none focus-visible:outline-none disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[96px] py-2.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(fieldBase, "h-11 appearance-none pr-8", className)} {...props} />
));
Select.displayName = "Select";

export const FieldLabel = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-dim", className)} {...props} />
);

export const Field = ({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode; className?: string }) => (
  <div className={className}>
    <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
    {children}
    {error ? <p className="mt-1.5 text-sm text-alert">{error}</p> : hint ? <p className="mt-1.5 text-sm text-faint">{hint}</p> : null}
  </div>
);
