import { useState, type ReactNode } from "react";
import { cn } from "@/components/ui/utils";
import { championIconUrl } from "@/lib/ddragon";

/**
 * The handful of surfaces every dashboard tab is built from.
 *
 * Each tab used to spell out its own hex values and paddings, which is how the
 * old screens drifted apart. Keeping them here means the dark palette is
 * defined once (see the `--color-vp-*` tokens in `styles/theme.css`) and a tab
 * file reads as structure rather than styling.
 */

/** The scroll column every tab lives in: one max width, one gutter. */
export function PageContainer({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--vp-dash-max)] px-5 pb-16 pt-5 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A titled band above a group of panels. */
export function PageHeading({
  title,
  meta,
  actions,
  className,
}: Readonly<{
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 pb-5",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-bold leading-tight text-vp-ink">
          {title}
        </h1>
        {meta ? <p className="mt-1 text-[13px] text-vp-dim">{meta}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/** The base surface: one step up from the canvas, hairline edge, no shadow. */
export function Panel({
  children,
  className,
  padded = true,
}: Readonly<{
  children: ReactNode;
  className?: string;
  padded?: boolean;
}>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-vp-line bg-vp-surface",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Panel caption. Small caps carry hierarchy so the panel needs no chrome. */
export function PanelHeader({
  title,
  hint,
  actions,
  className,
}: Readonly<{
  title: ReactNode;
  hint?: ReactNode;
  actions?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 pb-4", className)}
    >
      <div className="min-w-0">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
          {title}
        </h2>
        {hint ? <p className="mt-1 text-[13px] text-vp-faint">{hint}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

/** A single figure with its caption. Numbers are tabular so columns line up. */
export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  className,
}: Readonly<{
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "gold" | "win" | "loss";
  className?: string;
}>) {
  const valueTone = {
    default: "text-vp-ink",
    gold: "text-vp-gold",
    win: "text-vp-win",
    loss: "text-vp-loss",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-lg border border-vp-line bg-vp-raised px-4 py-3",
        className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-vp-faint">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[22px] font-bold leading-none tabular-nums",
          valueTone,
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-[12px] text-vp-dim">{sub}</p> : null}
    </div>
  );
}

/** Shown when a tab has nothing to draw yet, never a bare blank column. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: Readonly<{
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed border-vp-line-strong bg-vp-surface/60 px-6 py-10",
        className,
      )}
    >
      <p className="text-[15px] font-medium text-vp-ink">{title}</p>
      {body ? (
        <p className="max-w-prose text-[13px] leading-relaxed text-vp-dim">
          {body}
        </p>
      ) : null}
      {action}
    </div>
  );
}

/** A failed request. Loud enough to notice, quiet enough not to alarm. */
export function ErrorNote({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <p
      className={cn(
        "rounded-lg border border-vp-loss/40 bg-vp-loss/10 px-4 py-3 text-[13px] text-vp-loss",
        className,
      )}
      role="alert"
    >
      {children}
    </p>
  );
}

/**
 * Champion portrait from Data Dragon. That's a third-party CDN, so the initial
 * stands in whenever it is blocked, offline, or slow. An empty square in a
 * table row reads as a bug rather than a missing image.
 */
export function ChampionIcon({
  name,
  size = 28,
  className,
}: Readonly<{ name: string; size?: number; className?: string }>) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded border border-vp-line bg-vp-raised",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="text-[11px] font-semibold uppercase text-vp-faint">
        {name.slice(0, 2)}
      </span>
      {failed ? null : (
        <img
          src={championIconUrl(name)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}

/** The dashboard's one button, in three weights. */
export function Button({
  children,
  variant = "ghost",
  className,
  ...props
}: Readonly<
  {
    children: ReactNode;
    variant?: "primary" | "ghost" | "quiet";
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>) {
  const variants = {
    primary:
      "bg-vp-gold text-black hover:bg-[#eec684] border-transparent font-semibold",
    ghost:
      "border-vp-line-strong text-vp-ink hover:border-vp-gold/50 hover:text-vp-gold",
    quiet:
      "border-transparent text-vp-dim hover:bg-vp-raised hover:text-vp-ink",
  }[variant];

  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
