import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Download, Plus, Search } from "lucide-react";
import { Button, Field, Input, Kicker, Led, Select } from "@/components/ui";
import { StatTile } from "@/components/ops/StatTile";
import { StatusBadge } from "@/components/ops/StatusBadge";
import { DataTable, type Column } from "@/components/ops/DataTable";
import { EmptyState } from "@/components/ops/EmptyState";
import { Modal } from "@/components/ops/Modal";
import { filterTeams, teamStats, teamsToCsv, useCreateTeam, useOpsEvent, useOpsTracks, useTeams, useUpdateTeam, type TeamFilters } from "@/lib/ops";
import { formatDateTime } from "@/lib/format";
import { TEAM_STATUSES, type TeamStatus, type TeamWithMembers } from "@/lib/types";

const downloadCsv = (teams: TeamWithMembers[]) => {
  const csv = teamsToCsv(teams);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `teams-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const AddTeamModal = ({ eventId, trackOptions, onClose }: { eventId: string; trackOptions: { id: string; title: string }[]; onClose: () => void }) => {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [trackId, setTrackId] = useState("");
  const createTeam = useCreateTeam();

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Team name is required.");
      return;
    }
    try {
      await createTeam.mutateAsync({ event_id: eventId, name: name.trim(), school: school.trim() || null, track_id: trackId || null, status: "approved" });
      toast.success("Team added.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add team.");
    }
  };

  return (
    <Modal title="Add team" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Team name" htmlFor="new-team-name">
          <Input id="new-team-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="School" htmlFor="new-team-school">
          <Input id="new-team-school" value={school} onChange={(e) => setSchool(e.target.value)} />
        </Field>
        <Field label="Track" htmlFor="new-team-track">
          <Select id="new-team-track" value={trackId} onChange={(e) => setTrackId(e.target.value)}>
            <option value="">No track</option>
            {trackOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-xs text-faint">Add members from the team's detail page after creating it. New teams start approved.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createTeam.isPending}>
            {createTeam.isPending ? "Adding…" : "Add team"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const Teams = () => {
  const navigate = useNavigate();
  const { data: event } = useOpsEvent();
  const { data: teams, isLoading, isError, error } = useTeams(event?.id);
  const { data: tracks } = useOpsTracks(event?.id);
  const updateTeam = useUpdateTeam();

  const [filters, setFilters] = useState<TeamFilters>({ q: "", status: "all", track: "all", checkedIn: "all" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<TeamStatus | "">("");

  const trackTitle = useMemo(() => new Map((tracks ?? []).map((t) => [t.id, t.title])), [tracks]);
  const filtered = useMemo(() => filterTeams(teams ?? [], filters), [teams, filters]);
  const stats = useMemo(() => teamStats(teams ?? []), [teams]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const applyBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return;
    try {
      await Promise.all([...selected].map((id) => updateTeam.mutateAsync({ id, status: bulkStatus })));
      toast.success(`Updated ${selected.size} team${selected.size === 1 ? "" : "s"} to ${bulkStatus}.`);
      setSelected(new Set());
      setBulkStatus("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk update failed.");
    }
  };

  const columns: Column<TeamWithMembers>[] = [
    {
      key: "team",
      header: "Team",
      render: (t) => (
        <div>
          <p className="font-medium text-ink">{t.name}</p>
          <p className="font-mono text-xs text-faint">{t.code}</p>
        </div>
      ),
    },
    {
      key: "members",
      header: "Members",
      render: (t) => <span className="tabular-nums">{t.team_members?.length ?? 0}</span>,
    },
    { key: "school", header: "School", render: (t) => t.school || "—" },
    { key: "track", header: "Track", render: (t) => (t.track_id ? trackTitle.get(t.track_id) ?? "—" : "—") },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
    { key: "table", header: "Table", render: (t) => t.table_number || "—" },
    {
      key: "checked_in",
      header: "Checked in",
      render: (t) => (t.checked_in_at ? <Led tone="signal" /> : <Led tone="dim" />),
    },
    { key: "registered", header: "Registered", render: (t) => formatDateTime(t.created_at) },
  ];

  if (isError) {
    return <EmptyState title="Couldn't load teams" hint={error instanceof Error ? error.message : "Unknown error"} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker>Teams</Kicker>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => teams && downloadCsv(teams)} disabled={!teams?.length}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Add team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Total" value={stats.total} />
        <StatTile label="Pending" value={stats.pending} tone="warn" />
        <StatTile label="Approved" value={stats.approved} tone="signal" />
        <StatTile label="Waitlisted" value={stats.waitlisted} tone="pulse" />
        <StatTile label="Hackers" value={stats.hackers} />
        <StatTile label="Checked in" value={stats.checkedIn} tone="signal" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="team-search" className="min-w-[220px] flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input id="team-search" className="pl-9" placeholder="Team, code, school, name, email…" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
          </div>
        </Field>
        <Field label="Status" htmlFor="team-status-filter">
          <Select id="team-status-filter" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as TeamStatus | "all" }))}>
            <option value="all">All</option>
            {TEAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Track" htmlFor="team-track-filter">
          <Select id="team-track-filter" value={filters.track} onChange={(e) => setFilters((f) => ({ ...f, track: e.target.value }))}>
            <option value="all">All</option>
            {(tracks ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Checked in" htmlFor="team-checkin-filter">
          <Select id="team-checkin-filter" value={filters.checkedIn} onChange={(e) => setFilters((f) => ({ ...f, checkedIn: e.target.value as TeamFilters["checkedIn"] }))}>
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line-strong bg-rail px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-dim">{selected.size} selected</span>
          <Select className="!h-9 w-auto" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as TeamStatus | "")}>
            <option value="">Set status…</option>
            {TEAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus || updateTeam.isPending}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="py-12 text-center font-mono text-xs uppercase tracking-[0.14em] text-dim">Loading teams…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No teams match" hint="Try clearing filters or search." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(t) => t.id}
          onRowClick={(t) => navigate(`/ops/teams/${t.id}`)}
          selected={selected}
          onToggleSelect={toggleSelect}
        />
      )}

      {showAdd && event && <AddTeamModal eventId={event.id} trackOptions={tracks ?? []} onClose={() => setShowAdd(false)} />}
    </div>
  );
};

export default Teams;
