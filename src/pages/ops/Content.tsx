import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input, Kicker, Panel, Textarea } from "@/components/ui";
import { EmptyState } from "@/components/ops/EmptyState";
import { cn } from "@/lib/utils";
import {
  useCreateAnnouncement,
  useCreateFaq,
  useCreateScheduleItem,
  useCreateTrack,
  useDeleteAnnouncement,
  useDeleteFaq,
  useDeleteScheduleItem,
  useDeleteTrack,
  useOpsAnnouncements,
  useOpsEvent,
  useOpsFaqs,
  useOpsSchedule,
  useOpsTracks,
  useUpdateAnnouncement,
  useUpdateFaq,
  useUpdateScheduleItem,
  useUpdateTrack,
} from "@/lib/ops";
import { fromLocalInput, toLocalInput } from "@/lib/format";
import type { AnnouncementRow, FaqItemRow, ScheduleItemRow, TrackRow } from "@/lib/types";

type Tab = "tracks" | "schedule" | "faq" | "announcements";
const TABS: { key: Tab; label: string }[] = [
  { key: "tracks", label: "Tracks" },
  { key: "schedule", label: "Schedule" },
  { key: "faq", label: "FAQ" },
  { key: "announcements", label: "Announcements" },
];

const Row = ({ children, onDelete }: { children: ReactNode; onDelete: () => void }) => (
  <div className="flex items-start gap-3 rounded-lg border border-line p-3">
    <div className="min-w-0 flex-1 space-y-2">{children}</div>
    <button
      type="button"
      onClick={onDelete}
      aria-label="Delete"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-faint hover:text-alert"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

const TracksTab = ({ eventId }: { eventId: string }) => {
  const { data: tracks, isLoading } = useOpsTracks(eventId);
  const create = useCreateTrack();
  const update = useUpdateTrack();
  const remove = useDeleteTrack();

  const addTrack = () =>
    create.mutate(
      { event_id: eventId, title: "New track", summary: "", description: "", icon: null, sort_order: (tracks?.length ?? 0) * 10 },
      { onSuccess: () => toast.success("Track added."), onError: (e) => toast.error(e.message) },
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={addTrack}>
          <Plus className="h-3.5 w-3.5" /> Add track
        </Button>
      </div>
      {isLoading ? null : !tracks?.length ? (
        <EmptyState title="No tracks yet" />
      ) : (
        tracks.map((t: TrackRow) => (
          <Row key={t.id} onDelete={() => remove.mutate(t.id, { onSuccess: () => toast.success("Track deleted.") })}>
            <Input defaultValue={t.title} onBlur={(e) => e.target.value !== t.title && update.mutate({ id: t.id, title: e.target.value })} placeholder="Title" />
            <Input defaultValue={t.summary ?? ""} onBlur={(e) => update.mutate({ id: t.id, summary: e.target.value || null })} placeholder="Summary" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Sort</span>
              <Input
                type="number"
                className="h-8 w-20"
                defaultValue={t.sort_order}
                onBlur={(e) => update.mutate({ id: t.id, sort_order: Number(e.target.value) || 0 })}
              />
            </div>
          </Row>
        ))
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

const ScheduleTab = ({ eventId }: { eventId: string }) => {
  const { data: items, isLoading } = useOpsSchedule(eventId);
  const create = useCreateScheduleItem();
  const update = useUpdateScheduleItem();
  const remove = useDeleteScheduleItem();

  const addItem = () =>
    create.mutate(
      { event_id: eventId, starts_at: new Date().toISOString(), ends_at: null, title: "New item", description: "", location: "", sort_order: (items?.length ?? 0) * 10 },
      { onSuccess: () => toast.success("Schedule item added.") },
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={addItem}>
          <Plus className="h-3.5 w-3.5" /> Add item
        </Button>
      </div>
      {isLoading ? null : !items?.length ? (
        <EmptyState title="No schedule items yet" />
      ) : (
        items.map((s: ScheduleItemRow) => (
          <Row key={s.id} onDelete={() => remove.mutate(s.id, { onSuccess: () => toast.success("Deleted.") })}>
            <Input defaultValue={s.title} onBlur={(e) => e.target.value !== s.title && update.mutate({ id: s.id, title: e.target.value })} placeholder="Title" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Starts" htmlFor={`s-start-${s.id}`}>
                <Input id={`s-start-${s.id}`} type="datetime-local" defaultValue={toLocalInput(s.starts_at)} onBlur={(e) => update.mutate({ id: s.id, starts_at: fromLocalInput(e.target.value) ?? s.starts_at })} />
              </Field>
              <Field label="Ends" htmlFor={`s-end-${s.id}`}>
                <Input id={`s-end-${s.id}`} type="datetime-local" defaultValue={toLocalInput(s.ends_at)} onBlur={(e) => update.mutate({ id: s.id, ends_at: fromLocalInput(e.target.value) })} />
              </Field>
            </div>
            <Input defaultValue={s.location ?? ""} onBlur={(e) => update.mutate({ id: s.id, location: e.target.value || null })} placeholder="Location" />
            <Textarea defaultValue={s.description ?? ""} onBlur={(e) => update.mutate({ id: s.id, description: e.target.value || null })} placeholder="Description" />
            <Input defaultValue={s.highlight ?? ""} onBlur={(e) => (e.target.value || null) !== (s.highlight ?? null) && update.mutate({ id: s.id, highlight: e.target.value || null })} placeholder="Note (optional, shown in italics)" />
          </Row>
        ))
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const FaqTab = ({ eventId }: { eventId: string }) => {
  const { data: faqs, isLoading } = useOpsFaqs(eventId);
  const create = useCreateFaq();
  const update = useUpdateFaq();
  const remove = useDeleteFaq();

  const addFaq = () =>
    create.mutate({ event_id: eventId, question: "New question", answer: "", sort_order: (faqs?.length ?? 0) * 10 }, { onSuccess: () => toast.success("FAQ added.") });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={addFaq}>
          <Plus className="h-3.5 w-3.5" /> Add FAQ
        </Button>
      </div>
      {isLoading ? null : !faqs?.length ? (
        <EmptyState title="No FAQs yet" />
      ) : (
        faqs.map((f: FaqItemRow) => (
          <Row key={f.id} onDelete={() => remove.mutate(f.id, { onSuccess: () => toast.success("Deleted.") })}>
            <Input defaultValue={f.question} onBlur={(e) => e.target.value !== f.question && update.mutate({ id: f.id, question: e.target.value })} placeholder="Question" />
            <Textarea defaultValue={f.answer} onBlur={(e) => e.target.value !== f.answer && update.mutate({ id: f.id, answer: e.target.value })} placeholder="Answer" />
          </Row>
        ))
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

const AnnouncementsTab = ({ eventId }: { eventId: string }) => {
  const { data: announcements, isLoading } = useOpsAnnouncements(eventId);
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const remove = useDeleteAnnouncement();

  const addAnnouncement = () =>
    create.mutate({ event_id: eventId, title: "New announcement", body: "", published: false, pinned: false }, { onSuccess: () => toast.success("Announcement added.") });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={addAnnouncement}>
          <Plus className="h-3.5 w-3.5" /> Add announcement
        </Button>
      </div>
      {isLoading ? null : !announcements?.length ? (
        <EmptyState title="No announcements yet" />
      ) : (
        announcements.map((a: AnnouncementRow) => (
          <Row key={a.id} onDelete={() => remove.mutate(a.id, { onSuccess: () => toast.success("Deleted.") })}>
            <Input defaultValue={a.title} onBlur={(e) => e.target.value !== a.title && update.mutate({ id: a.id, title: e.target.value })} placeholder="Title" />
            <Textarea defaultValue={a.body ?? ""} onBlur={(e) => update.mutate({ id: a.id, body: e.target.value || null })} placeholder="Body" />
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" defaultChecked={a.published} onChange={(e) => update.mutate({ id: a.id, published: e.target.checked })} className="h-4 w-4 rounded border-line-strong bg-rail accent-signal" />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" defaultChecked={a.pinned} onChange={(e) => update.mutate({ id: a.id, pinned: e.target.checked })} className="h-4 w-4 rounded border-line-strong bg-rail accent-signal" />
                Pinned
              </label>
            </div>
          </Row>
        ))
      )}
    </div>
  );
};

const Content = () => {
  const { data: event, isLoading, isError } = useOpsEvent();
  const [tab, setTab] = useState<Tab>("tracks");

  if (isLoading) return <p className="py-12 text-center font-mono text-xs uppercase tracking-[0.14em] text-dim">Loading…</p>;
  if (isError || !event) return <EmptyState title="Couldn't load event" />;

  return (
    <div className="max-w-3xl space-y-5">
      <Kicker>Content</Kicker>
      <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-deck p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors",
              tab === t.key ? "bg-rail text-signal" : "text-dim hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Panel className="p-5">
        {tab === "tracks" && <TracksTab eventId={event.id} />}
        {tab === "schedule" && <ScheduleTab eventId={event.id} />}
        {tab === "faq" && <FaqTab eventId={event.id} />}
        {tab === "announcements" && <AnnouncementsTab eventId={event.id} />}
      </Panel>
    </div>
  );
};

export default Content;
