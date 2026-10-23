import type { ReactNode } from "react";
import { toast } from "sonner";
import { EyeOff, Lock, Plus, Rocket, Trash2 } from "lucide-react";
import { Button, Input, Led, Panel, Textarea } from "@/components/ui";
import { CopyButton } from "@/components/ops/CopyButton";
import { EmptyState } from "@/components/ops/EmptyState";
import { formatDateTime } from "@/lib/format";
import { useCreateTrack, useDeleteTrack, useOpsTracks, useUpdateEvent, useUpdateTrack } from "@/lib/ops";
import type { EventRow, TrackRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** supabase/migrations/20261013000000_prompt_release.sql. No prompt text. */
export const PROMPT_LOCK_SQL = `alter table public.events add column if not exists prompts_released boolean not null default false;
alter table public.events add column if not exists prompts_released_at timestamptz;
drop policy if exists tracks_public_read on public.tracks;
create policy tracks_public_read on public.tracks for select using (
  public.is_operator()
  or exists (select 1 from public.events e where e.id = tracks.event_id and e.prompts_released)
);`;

/** The lock migration has run when the events row carries the column. */
export const promptLockReady = (event: EventRow) => typeof event.prompts_released === "boolean";

const Row = ({ children, onDelete }: { children: ReactNode; onDelete: () => void }) => (
  <div className="flex items-start gap-3 rounded-lg border border-line p-3">
    <div className="min-w-0 flex-1 space-y-2">{children}</div>
    <button type="button" onClick={onDelete} aria-label="Delete track" className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-faint hover:text-alert">
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

/** Release / hide control, with setup guidance when something is missing. */
export const PromptRelease = ({ event, trackCount }: { event: EventRow; trackCount: number }) => {
  const updateEvent = useUpdateEvent();
  const ready = promptLockReady(event);
  const released = !!event.prompts_released;

  if (!ready) {
    return (
      <Panel className="space-y-4 border-warn/40 p-5">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-warn" />
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-warn">One-time setup needed</p>
        </div>
        <p className="text-sm text-dim">
          Before adding prompts, lock them so the public can't read them early. In Supabase, open <b className="text-ink">SQL Editor</b>, paste this, and
          click <b className="text-ink">Run</b>. Then reload this page.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-line bg-void p-3 font-mono text-[12px] leading-relaxed text-dim">{PROMPT_LOCK_SQL}</pre>
        <CopyButton value={PROMPT_LOCK_SQL} label="Copy SQL" />
      </Panel>
    );
  }

  const setReleased = (next: boolean) => {
    const message = next
      ? `Release all ${trackCount} prompt${trackCount === 1 ? "" : "s"} now? They appear on the public site immediately and teams can pick them when registering.`
      : "Hide the prompts again? They disappear from the public site immediately.";
    if (!window.confirm(message)) return;
    updateEvent.mutate(
      { id: event.id, prompts_released: next, prompts_released_at: next ? new Date().toISOString() : null },
      {
        onSuccess: () => toast.success(next ? "Prompts released. They're live on the site." : "Prompts hidden."),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <Panel className={cn("flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between", released && "signal-border")}>
      <div>
        <div className="flex items-center gap-2">
          <Led tone={released ? "signal" : "warn"} pulse />
          <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-ink">{released ? "Prompts are live" : "Prompts are hidden"}</p>
        </div>
        <p className="mt-2 max-w-xl text-sm text-dim">
          {released
            ? `Released ${formatDateTime(event.prompts_released_at)}. Everyone can see the tracks on the homepage and pick one when registering.`
            : trackCount === 0
              ? "Add your tracks below first. Only operators can see them until you release."
              : `${trackCount} track${trackCount === 1 ? " is" : "s are"} ready. Only operators can see them. The homepage shows a locked teaser until you release.`}
        </p>
      </div>
      {released ? (
        <Button variant="danger" onClick={() => setReleased(false)} disabled={updateEvent.isPending}>
          <EyeOff className="h-4 w-4" /> Hide prompts
        </Button>
      ) : (
        <Button size="lg" onClick={() => setReleased(true)} disabled={updateEvent.isPending || trackCount === 0}>
          <Rocket className="h-4 w-4" /> Release prompts
        </Button>
      )}
    </Panel>
  );
};

/** Release control plus the track (prompt) list. */
export const TracksEditor = ({ event }: { event: EventRow }) => {
  const { data: tracks, isLoading } = useOpsTracks(event.id);
  const create = useCreateTrack();
  const update = useUpdateTrack();
  const remove = useDeleteTrack();
  const ready = promptLockReady(event);

  const addTrack = () =>
    create.mutate(
      { event_id: event.id, title: "New track", summary: "", description: "", icon: null, sort_order: ((tracks?.length ?? 0) + 1) * 10 },
      { onSuccess: () => toast.success("Track added."), onError: (e) => toast.error(e.message) },
    );

  return (
    <div className="space-y-3">
      <PromptRelease event={event} trackCount={tracks?.length ?? 0} />
      <div className="flex items-center justify-between pt-2">
        <p className="kicker">Tracks</p>
        <Button size="sm" variant="outline" onClick={addTrack} disabled={!ready} title={ready ? undefined : "Finish the one-time setup first"}>
          <Plus className="h-3.5 w-3.5" /> Add track
        </Button>
      </div>
      {isLoading ? null : !tracks?.length ? (
        <EmptyState title="No tracks yet" />
      ) : (
        tracks.map((t: TrackRow) => (
          <Row key={t.id} onDelete={() => window.confirm(`Delete "${t.title}"?`) && remove.mutate(t.id, { onSuccess: () => toast.success("Track deleted.") })}>
            <Input defaultValue={t.title} onBlur={(e) => e.target.value !== t.title && update.mutate({ id: t.id, title: e.target.value })} placeholder="Title" />
            <Textarea defaultValue={t.summary ?? ""} onBlur={(e) => update.mutate({ id: t.id, summary: e.target.value || null })} placeholder="Prompt text shown on the site" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Order</span>
              <Input type="number" className="h-8 w-20" defaultValue={t.sort_order} onBlur={(e) => update.mutate({ id: t.id, sort_order: Number(e.target.value) || 0 })} />
            </div>
          </Row>
        ))
      )}
    </div>
  );
};
