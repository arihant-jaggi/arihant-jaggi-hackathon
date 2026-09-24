import type { ReactNode } from "react";
import { Panel } from "@/components/ui";

export const EmptyState = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <Panel className="flex flex-col items-center gap-3 px-6 py-16 text-center">
    <p className="font-display text-lg font-semibold text-ink">{title}</p>
    {hint && <p className="max-w-sm text-sm text-dim">{hint}</p>}
    {action}
  </Panel>
);

export default EmptyState;
