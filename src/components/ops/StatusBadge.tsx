import { Badge } from "@/components/ui";
import type { TeamStatus } from "@/lib/types";

const TONE: Record<TeamStatus, "signal" | "pulse" | "warn" | "alert" | "dim"> = {
  approved: "signal",
  waitlisted: "pulse",
  pending: "warn",
  rejected: "alert",
  withdrawn: "dim",
};

export const StatusBadge = ({ status }: { status: TeamStatus }) => <Badge tone={TONE[status]}>{status}</Badge>;

export default StatusBadge;
