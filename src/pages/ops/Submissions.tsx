import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, ExternalLink, Github, Globe, Lock, Presentation, Trash2, Unlock } from "lucide-react";
import { Badge, Button, Kicker, Led, Panel } from "@/components/ui";
import { EmptyState } from "@/components/ops/EmptyState";
import { useDeleteSubmission, useOpsEvent, useSubmissions, useUpdateEvent } from "@/lib/ops";
import { latestPerTeam, submissionsToCsv } from "@/lib/submissions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventRow, SubmissionRow } from "@/lib/types";

const downloadCsv = (rows: SubmissionRow[]) => {
  const blob = new Blob([submissionsToCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const SubmissionToggle = ({ event }: { event: EventRow }) => {
  const updateEvent = useUpdateEvent();
  const open = !!event.submissions_open;
  const flip = () => {
    const msg = open ? "Close submissions? Teams will no longer be able to submit or resubmit." : "Open submissions? Teams can submit from youngcodersimpact.com/submit right away.";
    if (!window.confirm(msg)) return;
    updateEvent.mutate(
      { id: event.id, submissions_open: !open },
      { onSuccess: () => toast.success(open ? "Submissions closed." : "Submissions are open."), onError: (e) => toast.error(e.message) },
    );
  };
  return (
    <Panel className={cn("flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between", open && "signal-border")}>
      <div>
        <div className="flex items-center gap-2">
          <Led tone={open ? "signal" : "warn"} pulse />
          <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-ink">{open ? "Submissions are open" : "Submissions are closed"}</p>
        </div>
        <p className="mt-2 max-w-xl text-sm text-dim">
          {open ? "Teams can submit and resubmit at /submit. Close it when building ends (3:30 PM)." : "The /submit page tells teams submissions aren't open yet."}
        </p>
      </div>
      <Button variant={open ? "danger" : "signal"} size={open ? "md" : "lg"} onClick={flip} disabled={updateEvent.isPending}>
        {open ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />} {open ? "Close submissions" : "Open submissions"}
      </Button>
    </Panel>
  );
};

const LinkChip = ({ href, icon: Icon, label }: { href: string | null; icon: typeof Github; label: string }) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-dim hover:border-signal hover:text-signal">
      <Icon className="h-3.5 w-3.5" /> {label} <ExternalLink className="h-3 w-3" />
    </a>
  ) : null;

const Submissions = () => {
  const { data: event, isLoading, isError } = useOpsEvent();
  const { data: rows, isLoading: loadingRows } = useSubmissions(typeof event?.submissions_open === "boolean" ? event.id : undefined);
  const remove = useDeleteSubmission();
  const [showAll, setShowAll] = useState(false);
  const latest = useMemo(() => latestPerTeam(rows ?? []), [rows]);
  const shown = showAll ? (rows ?? []) : latest;

  if (isLoading) return <p className="font-mono text-xs uppercase tracking-kicker text-dim">Loading…</p>;
  if (isError || !event) return <p className="text-sm text-alert">Couldn't load the event.</p>;

  if (typeof event.submissions_open !== "boolean") {
    return (
      <div className="max-w-3xl space-y-4">
        <Kicker>Submissions</Kicker>
        <Panel className="p-6">
          <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-warn">One-time setup needed</p>
          <p className="mt-2 text-sm text-dim">
            Run <code className="text-ink">supabase/migrations/20261024000000_submissions.sql</code> in the Supabase SQL Editor, then refresh this page.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <Kicker>Submissions</Kicker>
        <p className="text-sm text-dim">Projects teams submitted at /submit. Only operators can see these. If a team resubmits, the newest one is shown.</p>
      </div>
      <SubmissionToggle event={event} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge tone="signal">{latest.length} team{latest.length === 1 ? "" : "s"}</Badge>
          {rows && rows.length > latest.length && (
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-signal" />
              Show earlier versions ({rows.length - latest.length})
            </label>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(latest)} disabled={!latest.length}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {loadingRows ? null : !shown.length ? (
        <EmptyState title="No submissions yet" />
      ) : (
        <div className="space-y-3">
          {shown.map((s) => (
            <Panel key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-ink">{s.project_title}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
                    {s.team_name}
                    {s.track_title ? ` · ${s.track_title}` : ""} · {formatDateTime(s.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete submission"
                  onClick={() => window.confirm(`Delete "${s.project_title}" from ${s.team_name}?`) && remove.mutate(s.id, { onSuccess: () => toast.success("Deleted.") })}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-faint hover:text-alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-dim">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <LinkChip href={s.github_url} icon={Github} label="GitHub" />
                <LinkChip href={s.demo_url} icon={Globe} label="Demo" />
                <LinkChip href={s.slides_url} icon={Presentation} label="Slides" />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
