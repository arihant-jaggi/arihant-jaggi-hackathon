import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, Plus, Trash2 } from "lucide-react";
import { ButtonLink, Button, Field, Input, Kicker, Led, Panel, Select, Textarea } from "@/components/ui";
import { StatusBadge } from "@/components/ops/StatusBadge";
import { EmptyState } from "@/components/ops/EmptyState";
import { Modal } from "@/components/ops/Modal";
import {
  useAddMember,
  useCheckInMember,
  useCheckInTeam,
  useDeleteMember,
  useDeleteTeam,
  useOpsEvent,
  useOpsTracks,
  useTeam,
  useUpdateMember,
  useUpdateTeam,
} from "@/lib/ops";
import { formatDateTime } from "@/lib/format";
import { TEAM_STATUSES, type TeamMemberRow, type TeamStatus } from "@/lib/types";

const emptyMember = { full_name: "", email: "", phone: "", grade: "", school: "", is_captain: false, tshirt_size: "", dietary_notes: "", guardian_name: "", guardian_email: "", guardian_phone: "" };

const MemberModal = ({ teamId, eventId, member, onClose }: { teamId: string; eventId: string; member?: TeamMemberRow; onClose: () => void }) => {
  const [form, setForm] = useState(
    member
      ? {
          full_name: member.full_name,
          email: member.email,
          phone: member.phone ?? "",
          grade: member.grade ?? "",
          school: member.school ?? "",
          is_captain: member.is_captain,
          tshirt_size: member.tshirt_size ?? "",
          dietary_notes: member.dietary_notes ?? "",
          guardian_name: member.guardian_name ?? "",
          guardian_email: member.guardian_email ?? "",
          guardian_phone: member.guardian_phone ?? "",
        }
      : emptyMember,
  );
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      grade: form.grade.trim() || null,
      school: form.school.trim() || null,
      is_captain: form.is_captain,
      tshirt_size: form.tshirt_size.trim() || null,
      dietary_notes: form.dietary_notes.trim() || null,
      guardian_name: form.guardian_name.trim() || null,
      guardian_email: form.guardian_email.trim() || null,
      guardian_phone: form.guardian_phone.trim() || null,
    };
    try {
      if (member) {
        await updateMember.mutateAsync({ id: member.id, team_id: teamId, ...payload });
        toast.success("Member updated.");
      } else {
        await addMember.mutateAsync({ team_id: teamId, event_id: eventId, ...payload });
        toast.success("Member added.");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save member.");
    }
  };

  const busy = addMember.isPending || updateMember.isPending;

  return (
    <Modal title={member ? "Edit member" : "Add member"} onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="m-name">
          <Input id="m-name" value={form.full_name} onChange={set("full_name")} autoFocus />
        </Field>
        <Field label="Email" htmlFor="m-email">
          <Input id="m-email" type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Phone" htmlFor="m-phone">
          <Input id="m-phone" value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="Grade" htmlFor="m-grade">
          <Input id="m-grade" value={form.grade} onChange={set("grade")} />
        </Field>
        <Field label="School" htmlFor="m-school">
          <Input id="m-school" value={form.school} onChange={set("school")} />
        </Field>
        <Field label="T-shirt size" htmlFor="m-shirt">
          <Input id="m-shirt" value={form.tshirt_size} onChange={set("tshirt_size")} />
        </Field>
        <Field label="Guardian name" htmlFor="m-guardian-name">
          <Input id="m-guardian-name" value={form.guardian_name} onChange={set("guardian_name")} />
        </Field>
        <Field label="Guardian email" htmlFor="m-guardian-email">
          <Input id="m-guardian-email" type="email" value={form.guardian_email} onChange={set("guardian_email")} />
        </Field>
        <Field label="Guardian phone" htmlFor="m-guardian-phone">
          <Input id="m-guardian-phone" value={form.guardian_phone} onChange={set("guardian_phone")} />
        </Field>
        <Field label="Dietary notes" htmlFor="m-dietary" className="sm:col-span-2">
          <Textarea id="m-dietary" value={form.dietary_notes} onChange={set("dietary_notes")} />
        </Field>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={form.is_captain} onChange={(e) => setForm((f) => ({ ...f, is_captain: e.target.checked }))} className="h-4 w-4 rounded border-line-strong bg-rail accent-signal" />
          <span className="text-sm text-ink">Team captain</span>
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
};

const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { data: team, isLoading, isError } = useTeam(teamId);
  const { data: event } = useOpsEvent();
  const { data: tracks } = useOpsTracks(event?.id);
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const checkInTeam = useCheckInTeam();
  const checkInMember = useCheckInMember();
  const deleteMember = useDeleteMember();

  const [editing, setEditing] = useState<TeamMemberRow | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <p className="py-12 text-center font-mono text-xs uppercase tracking-[0.14em] text-dim">Loading team…</p>;
  if (isError || !team) return <EmptyState title="Team not found" action={<ButtonLink to="/ops/teams" variant="outline">Back to teams</ButtonLink>} />;

  const saveField = async (patch: Partial<typeof team>) => {
    try {
      await updateTeam.mutateAsync({ id: team.id, ...patch });
      toast.success("Saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save.");
    }
  };

  const setStatus = (status: TeamStatus) => saveField({ status });

  const removeTeam = async () => {
    try {
      await deleteTeam.mutateAsync(team.id);
      toast.success("Team deleted.");
      navigate("/ops/teams");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete team.");
    }
  };

  const members = team.team_members ?? [];
  const allEmails = members.map((m) => m.email).join(",");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ButtonLink to="/ops/teams" variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Teams
          </ButtonLink>
          <Kicker rule={false}>{team.code}</Kicker>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete team
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Panel className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-semibold text-ink">{team.name}</h1>
              <StatusBadge status={team.status} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant={team.status === "approved" ? "signal" : "outline"} onClick={() => setStatus("approved")}>
                Approve
              </Button>
              <Button size="sm" variant={team.status === "waitlisted" ? "signal" : "outline"} onClick={() => setStatus("waitlisted")}>
                Waitlist
              </Button>
              <Button size="sm" variant="danger" onClick={() => setStatus("rejected")}>
                Reject
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Team name" htmlFor="t-name">
                <Input id="t-name" defaultValue={team.name} onBlur={(e) => e.target.value !== team.name && saveField({ name: e.target.value })} />
              </Field>
              <Field label="School" htmlFor="t-school">
                <Input id="t-school" defaultValue={team.school ?? ""} onBlur={(e) => saveField({ school: e.target.value || null })} />
              </Field>
              <Field label="Track" htmlFor="t-track">
                <Select id="t-track" defaultValue={team.track_id ?? ""} onChange={(e) => saveField({ track_id: e.target.value || null })}>
                  <option value="">No track</option>
                  {(tracks ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" htmlFor="t-status">
                <Select id="t-status" value={team.status} onChange={(e) => setStatus(e.target.value as TeamStatus)}>
                  {TEAM_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Table number" htmlFor="t-table">
                <Input id="t-table" defaultValue={team.table_number ?? ""} onBlur={(e) => saveField({ table_number: e.target.value || null })} />
              </Field>
              <Field label="Project idea" htmlFor="t-idea" hint="Set at registration.">
                <Input id="t-idea" value={team.project_idea ?? "-"} readOnly disabled />
              </Field>
              <Field label="Private notes" htmlFor="t-notes" className="sm:col-span-2">
                <Textarea id="t-notes" defaultValue={team.notes ?? ""} onBlur={(e) => saveField({ notes: e.target.value || null })} />
              </Field>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink">Members ({members.length})</h2>
              <div className="flex gap-2">
                {allEmails && (
                  <a href={`mailto:?bcc=${encodeURIComponent(allEmails)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 font-mono text-[12px] uppercase tracking-[0.14em] text-dim hover:border-signal hover:text-signal">
                    <Mail className="h-3.5 w-3.5" /> Email all
                  </a>
                )}
                <Button size="sm" onClick={() => setEditing("new")}>
                  <Plus className="h-3.5 w-3.5" /> Add member
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {members.length === 0 && <p className="text-sm text-faint">No members yet.</p>}
              {members.map((m) => (
                <div key={m.id} className="rounded-lg border border-line p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {m.full_name} {m.is_captain && <span className="ml-1 text-xs text-signal">captain</span>}
                      </p>
                      <p className="text-sm text-dim">{m.email}</p>
                      {m.phone && <p className="text-xs text-faint">{m.phone}</p>}
                      {(m.guardian_name || m.guardian_email || m.guardian_phone) && (
                        <p className="mt-1 text-xs text-faint">
                          Guardian: {[m.guardian_name, m.guardian_email, m.guardian_phone].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
                        <Led tone={m.checked_in_at ? "signal" : "dim"} />
                        <input
                          type="checkbox"
                          checked={!!m.checked_in_at}
                          onChange={(e) => checkInMember.mutate({ id: m.id, team_id: team.id, checkedIn: e.target.checked })}
                          className="h-4 w-4 rounded border-line-strong bg-rail accent-signal"
                          aria-label={`Check in ${m.full_name}`}
                        />
                        {m.checked_in_at ? formatDateTime(m.checked_in_at) : "Not checked in"}
                      </label>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm(`Remove ${m.full_name} from this team?`)) deleteMember.mutate({ id: m.id, team_id: team.id });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-alert" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-5">
            <p className="kicker mb-3">Check-in</p>
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink">Whole team checked in</span>
              <input
                type="checkbox"
                checked={!!team.checked_in_at}
                onChange={(e) => checkInTeam.mutate({ id: team.id, checkedIn: e.target.checked })}
                className="h-5 w-5 rounded border-line-strong bg-rail accent-signal"
                aria-label="Check in whole team"
              />
            </label>
            {team.checked_in_at && <p className="mt-2 text-xs text-faint">{formatDateTime(team.checked_in_at)}</p>}
          </Panel>
          <Panel className="p-5">
            <p className="kicker mb-3">Registered</p>
            <p className="text-sm text-ink">{formatDateTime(team.created_at)}</p>
            <p className="mt-3 kicker mb-1">Last updated</p>
            <p className="text-sm text-ink">{formatDateTime(team.updated_at)}</p>
          </Panel>
        </div>
      </div>

      {editing && event && (
        <MemberModal teamId={team.id} eventId={event.id} member={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />
      )}

      {confirmDelete && (
        <Modal title="Delete team" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-dim">
            Delete <span className="text-ink">{team.name}</span> and all {members.length} member{members.length === 1 ? "" : "s"}? This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={removeTeam} disabled={deleteTeam.isPending}>
              {deleteTeam.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeamDetail;
