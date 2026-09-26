import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/ui";

export const StatTile = ({ label, value, tone = "dim", className }: { label: string; value: ReactNode; tone?: "signal" | "pulse" | "warn" | "alert" | "dim"; className?: string }) => {
  const toneClass = {
    signal: "text-signal",
    pulse: "text-pulse",
    warn: "text-warn",
    alert: "text-alert",
    dim: "text-ink",
  }[tone];
  return (
    <Panel className={cn("px-4 py-3", className)}>
      <p className="kicker">{label}</p>
      <p className={cn("mt-1 font-mono text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
    </Panel>
  );
};

export default StatTile;
