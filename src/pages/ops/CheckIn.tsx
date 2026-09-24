import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, Kicker, Led, Panel } from "@/components/ui";
import { StatusBadge } from "@/components/ops/StatusBadge";
import { StatTile } from "@/components/ops/StatTile";
import { EmptyState } from "@/components/ops/EmptyState";
import { useCheckInMember, useCheckInTeam, useOpsEvent, useTeams } from "@/lib/ops";
import type { TeamWithMembers } from "@/lib/types";

const matches = (team: TeamWithMembers, q: string) => {
  if (!q) return true;
  const haystack = [team.name, team.code, ...(team.team_members ?? []).flatMap((m) => [m.full_name, m.email])].join(" ").toLowerCase();
  return haystack.includes(q);
};

const TeamCard = ({ team }: { team: TeamWithMembers }) => {
  const checkInTeam = useCheckInTeam();
  const checkInMember = useCheckInMember();
  const members = team.team_members ?? [];
  const allIn = members.length > 0 && members.every((m) => !!m.checked_in_at);

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{team.name}</p>
          <p className="font-mono text-xs text-faint">
            {team.code} · {team.table_number ? `Table ${team.table_number}` : "No table"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={team.status} />
          <Button
            size="sm"
            variant={allIn ? "outline" : "signal"}
            onClick={() => checkInTeam.mutate({ id: team.id, checkedIn: !allIn })}
          >
            {allIn ? "Undo check-in" : "Check in all"}
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {members.map((m) => (
          <label key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
            <span className="min-w-0 truncate text-sm text-ink">
              {m.full_name} {m.is_captain && <span className="text-xs text-signal">captain</span>}
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <Led tone={m.checked_in_at ? "signal" : "dim"} />
              <input
                type="checkbox"
                checked={!!m.checked_in_at}
                onChange={(e) => checkInMember.mutate({ id: m.id, team_id: team.id, checkedIn: e.target.checked })}
                className="h-5 w-5 rounded border-line-strong bg-rail accent-signal"
                aria-label={`Check in ${m.full_name}`}
              />
            </span>
          </label>
        ))}
        {members.length === 0 && <p className="text-sm text-faint">No members on this team.</p>}
      </div>
    </Panel>
  );
};

const CheckIn = () => {
  const { data: event } = useOpsEvent();
  const { data: teams, isLoading, isError } = useTeams(event?.id);
  const [q, setQ] = useState("");
  const [approvedOnly, setApprovedOnly] = useState(true);

  const base = useMemo(() => (teams ?? []).filter((t) => !approvedOnly || t.status === "approved"), [teams, approvedOnly]);
  const results = useMemo(() => base.filter((t) => matches(t, q.trim().toLowerCase())), [base, q]);

  const counters = useMemo(() => {
    const allMembers = base.flatMap((t) => t.team_members ?? []);
    return { teams: base.length, hackers: allMembers.length, checkedIn: allMembers.filter((m) => !!m.checked_in_at).length };
  }, [base]);

  if (isError) return <EmptyState title="Couldn't load teams" />;

  return (
    <div className="space-y-5">
      <Kicker>Check-in</Kicker>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Teams" value={counters.teams} />
        <StatTile label="Hackers" value={counters.hackers} />
        <StatTile label="Checked in" value={counters.checkedIn} tone="signal" />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
        <Input
          className="h-14 pl-11 text-lg"
          placeholder="Search team code, name, or member…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-dim">
        <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} className="h-4 w-4 rounded border-line-strong bg-rail accent-signal" />
        Approved teams only
      </label>

      {isLoading ? (
        <p className="py-12 text-center font-mono text-xs uppercase tracking-[0.14em] text-dim">Loading…</p>
      ) : results.length === 0 ? (
        <EmptyState title="No matching teams" hint={q ? "Try a different search." : "No teams to show yet."} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckIn;
