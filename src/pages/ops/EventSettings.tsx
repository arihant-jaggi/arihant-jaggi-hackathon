import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Kicker, Led, Panel, Textarea } from "@/components/ui";
import { EmptyState } from "@/components/ops/EmptyState";
import { useOpsEvent, useUpdateEvent } from "@/lib/ops";
import { fromLocalInput, registrationLabel, toLocalInput } from "@/lib/format";
import { REGISTRATION_STATUSES, type EventRow, type RegistrationStatus } from "@/lib/types";

const REG_TONE: Record<RegistrationStatus, "warn" | "signal" | "pulse" | "dim"> = {
  coming_soon: "warn",
  open: "signal",
  waitlist: "pulse",
  closed: "dim",
};

type FormState = {
  name: string;
  edition: string;
  tagline: string;
  description: string;
  starts_at: string;
  ends_at: string;
  venue_name: string;
  venue_detail: string;
  venue_address: string;
  venue_map_url: string;
  partner_name: string;
  prize_summary: string;
  prize_detail: string;
  contact_email: string;
  registration_status: RegistrationStatus;
  registration_opens_at: string;
  registration_closes_at: string;
  min_team_size: string;
  max_team_size: string;
  max_teams: string;
};

const toForm = (e: EventRow): FormState => ({
  name: e.name,
  edition: e.edition ?? "",
  tagline: e.tagline ?? "",
  description: e.description ?? "",
  starts_at: toLocalInput(e.starts_at),
  ends_at: toLocalInput(e.ends_at),
  venue_name: e.venue_name ?? "",
  venue_detail: e.venue_detail ?? "",
  venue_address: e.venue_address ?? "",
  venue_map_url: e.venue_map_url ?? "",
  partner_name: e.partner_name ?? "",
  prize_summary: e.prize_summary ?? "",
  prize_detail: e.prize_detail ?? "",
  contact_email: e.contact_email ?? "",
  registration_status: e.registration_status,
  registration_opens_at: toLocalInput(e.registration_opens_at),
  registration_closes_at: toLocalInput(e.registration_closes_at),
  min_team_size: String(e.min_team_size),
  max_team_size: String(e.max_team_size),
  max_teams: e.max_teams === null ? "" : String(e.max_teams),
});

const EventSettings = () => {
  const { data: event, isLoading, isError } = useOpsEvent();
  const updateEvent = useUpdateEvent();
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (event) setForm(toForm(event));
  }, [event]);

  const set = <K extends keyof FormState>(key: K) => (e: { target: { value: string } }) => setForm((f) => (f ? { ...f, [key]: e.target.value } : f));

  const save = async () => {
    if (!event || !form) return;
    const minSize = Number(form.min_team_size) || 1;
    const maxSize = Number(form.max_team_size) || minSize;
    if (minSize > maxSize) {
      toast.error("Min team size can't exceed max team size.");
      return;
    }
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        name: form.name.trim(),
        edition: form.edition.trim() || null,
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        starts_at: fromLocalInput(form.starts_at),
        ends_at: fromLocalInput(form.ends_at),
        venue_name: form.venue_name.trim() || null,
        venue_detail: form.venue_detail.trim() || null,
        venue_address: form.venue_address.trim() || null,
        venue_map_url: form.venue_map_url.trim() || null,
        partner_name: form.partner_name.trim() || null,
        prize_summary: form.prize_summary.trim() || null,
        prize_detail: form.prize_detail.trim() || null,
        contact_email: form.contact_email.trim() || null,
        registration_status: form.registration_status,
        registration_opens_at: fromLocalInput(form.registration_opens_at),
        registration_closes_at: fromLocalInput(form.registration_closes_at),
        min_team_size: minSize,
        max_team_size: maxSize,
        max_teams: form.max_teams.trim() === "" ? null : Number(form.max_teams),
      });
      toast.success("Event saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save event.");
    }
  };

  if (isLoading || !form) return <p className="py-12 text-center font-mono text-xs uppercase tracking-[0.14em] text-dim">Loading…</p>;
  if (isError || !event) return <EmptyState title="Couldn't load event" />;

  return (
    <div className="max-w-3xl space-y-6">
      <Kicker>Event settings</Kicker>

      <Panel className="p-5">
        <p className="kicker mb-3">Registration status</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {REGISTRATION_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setForm((f) => (f ? { ...f, registration_status: status } : f))}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors ${
                form.registration_status === status ? "border-signal bg-signal/[0.08] text-signal" : "border-line-strong text-dim hover:border-line-strong hover:text-ink"
              }`}
            >
              <Led tone={REG_TONE[status]} pulse={status === "open"} />
              {registrationLabel[status]}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Registration opens" htmlFor="reg-open">
            <Input id="reg-open" type="datetime-local" value={form.registration_opens_at} onChange={set("registration_opens_at")} />
          </Field>
          <Field label="Registration closes" htmlFor="reg-close">
            <Input id="reg-close" type="datetime-local" value={form.registration_closes_at} onChange={set("registration_closes_at")} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="kicker mb-3">Basics</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="ev-name">
            <Input id="ev-name" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Edition" htmlFor="ev-edition">
            <Input id="ev-edition" value={form.edition} onChange={set("edition")} />
          </Field>
          <Field label="Tagline" htmlFor="ev-tagline" className="sm:col-span-2">
            <Input id="ev-tagline" value={form.tagline} onChange={set("tagline")} />
          </Field>
          <Field label="Description" htmlFor="ev-desc" className="sm:col-span-2">
            <Textarea id="ev-desc" value={form.description} onChange={set("description")} />
          </Field>
          <Field label="Starts" htmlFor="ev-starts">
            <Input id="ev-starts" type="datetime-local" value={form.starts_at} onChange={set("starts_at")} />
          </Field>
          <Field label="Ends" htmlFor="ev-ends">
            <Input id="ev-ends" type="datetime-local" value={form.ends_at} onChange={set("ends_at")} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="kicker mb-3">Venue &amp; partner</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Venue name" htmlFor="ev-venue">
            <Input id="ev-venue" value={form.venue_name} onChange={set("venue_name")} />
          </Field>
          <Field label="Venue detail" htmlFor="ev-venue-detail">
            <Input id="ev-venue-detail" value={form.venue_detail} onChange={set("venue_detail")} />
          </Field>
          <Field label="Address" htmlFor="ev-address" className="sm:col-span-2">
            <Input id="ev-address" value={form.venue_address} onChange={set("venue_address")} />
          </Field>
          <Field label="Map URL" htmlFor="ev-map" className="sm:col-span-2">
            <Input id="ev-map" value={form.venue_map_url} onChange={set("venue_map_url")} />
          </Field>
          <Field label="Partner" htmlFor="ev-partner">
            <Input id="ev-partner" value={form.partner_name} onChange={set("partner_name")} />
          </Field>
          <Field label="Contact email" htmlFor="ev-contact">
            <Input id="ev-contact" type="email" value={form.contact_email} onChange={set("contact_email")} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="kicker mb-3">Prizes</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Summary" htmlFor="ev-prize-sum">
            <Input id="ev-prize-sum" value={form.prize_summary} onChange={set("prize_summary")} />
          </Field>
          <Field label="Detail" htmlFor="ev-prize-detail">
            <Input id="ev-prize-detail" value={form.prize_detail} onChange={set("prize_detail")} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="kicker mb-3">Team size</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Min team size" htmlFor="ev-min">
            <Input id="ev-min" type="number" min={1} value={form.min_team_size} onChange={set("min_team_size")} />
          </Field>
          <Field label="Max team size" htmlFor="ev-max">
            <Input id="ev-max" type="number" min={1} value={form.max_team_size} onChange={set("max_team_size")} />
          </Field>
          <Field label="Max teams" htmlFor="ev-max-teams" hint="Blank = unlimited">
            <Input id="ev-max-teams" type="number" min={1} value={form.max_teams} onChange={set("max_teams")} />
          </Field>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={save} disabled={updateEvent.isPending}>
          {updateEvent.isPending ? "Saving…" : "Save event"}
        </Button>
      </div>
    </div>
  );
};

export default EventSettings;
