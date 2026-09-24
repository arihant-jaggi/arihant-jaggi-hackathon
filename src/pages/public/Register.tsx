import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Field, Input, Panel, Select, SectionTitle, Textarea } from "@/components/ui";
import { EventFacts } from "@/components/site/EventFacts";
import { useEvent, useRegisterTeam, useTracks } from "@/lib/api";
import { isBackendConfigured } from "@/lib/supabase";
import type { ExperienceLevel, RegisterMemberInput } from "@/lib/types";

const GRADES = ["6", "7", "8", "9", "10", "11", "12", "Other"];
const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type MemberDraft = RegisterMemberInput & { key: string };

const emptyMember = (captain: boolean): MemberDraft => ({
  key: crypto.randomUUID(),
  full_name: "",
  email: "",
  grade: "",
  phone: "",
  tshirt_size: "",
  dietary_notes: "",
  guardian_name: "",
  guardian_email: "",
  guardian_phone: "",
  is_captain: captain,
});

const memberSchema = z.object({
  full_name: z.string().trim().min(1, "Required"),
  email: z.string().trim().email("Enter a valid email"),
  grade: z.string().trim().min(1, "Required"),
  phone: z.string().optional(),
  tshirt_size: z.string().trim().min(1, "Required"),
  dietary_notes: z.string().optional(),
  guardian_name: z.string().trim().min(1, "Required"),
  guardian_email: z.string().trim().email("Enter a valid email"),
  guardian_phone: z.string().optional(),
  is_captain: z.boolean(),
});

const Register = () => {
  const { data: event } = useEvent();
  const { data: tracks } = useTracks();
  const register = useRegisterTeam();

  const minSize = event?.min_team_size ?? 1;
  const maxSize = event?.max_team_size ?? 4;

  const [teamName, setTeamName] = useState("");
  const [school, setSchool] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel | "">("");
  const [trackId, setTrackId] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>(() => [emptyMember(true)]);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ team_code: string; team_status: string } | null>(null);

  const updateMember = (key: string, patch: Partial<MemberDraft>) =>
    setMembers((prev) => prev.map((m) => (m.key === key ? { ...m, ...patch } : m)));

  const setCaptain = (key: string) => setMembers((prev) => prev.map((m) => ({ ...m, is_captain: m.key === key })));

  const addMember = () => {
    if (members.length >= maxSize) return;
    setMembers((prev) => [...prev, emptyMember(false)]);
  };

  const removeMember = (key: string) => {
    setMembers((prev) => {
      if (prev.length <= minSize) return prev;
      const next = prev.filter((m) => m.key !== key);
      if (!next.some((m) => m.is_captain) && next.length > 0) next[0].is_captain = true;
      return next;
    });
  };

  const teamSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, "Give your team a name"),
          members: z.array(memberSchema).min(minSize, `Add at least ${minSize} member${minSize === 1 ? "" : "s"}`).max(maxSize, `A team can have at most ${maxSize} members`),
        })
        .superRefine((val, ctx) => {
          const captains = val.members.filter((m) => m.is_captain).length;
          if (captains !== 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pick exactly one team captain", path: ["members"] });
          const emails = val.members.map((m) => m.email.trim().toLowerCase());
          if (new Set(emails).size !== emails.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Each teammate needs a different email", path: ["members"] });
        }),
    [minSize, maxSize],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    if (!agree) {
      setFormError("Please agree to the terms to continue.");
      return;
    }

    const parsed = teamSchema.safeParse({ name: teamName, members });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      let topError: string | null = null;
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "members" && issue.path.length === 1) {
          topError = issue.message;
        } else if (issue.path[0] === "members" && typeof issue.path[1] === "number") {
          fieldErrors[`${issue.path[1]}.${issue.path[2]}`] = issue.message;
        } else if (issue.path[0] === "name") {
          topError = issue.message;
        }
      }
      setErrors(fieldErrors);
      setFormError(topError ?? "Check the highlighted fields.");
      return;
    }

    register.mutate(
      {
        team: {
          name: teamName.trim(),
          school: school.trim() || undefined,
          experience_level: experience || undefined,
          track_id: trackId || undefined,
          project_idea: projectIdea.trim() || undefined,
        },
        members: members.map(({ key, ...m }) => ({
          ...m,
          full_name: m.full_name.trim(),
          email: m.email.trim(),
          phone: m.phone?.trim() || undefined,
          dietary_notes: m.dietary_notes?.trim() || undefined,
          guardian_name: m.guardian_name.trim(),
          guardian_email: m.guardian_email.trim(),
          guardian_phone: m.guardian_phone?.trim() || undefined,
        })),
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
      },
    );
  };

  if (!event) return null;

  // -------------------------------------------------------------- Success
  if (result) {
    return (
      <main className="container flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-24 text-center">
        <Panel glow className="brackets w-full p-8 sm:p-12">
          <CheckCircle2 className="mx-auto h-10 w-10 text-signal" />
          <p className="kicker mt-5 justify-center text-dim">Team registered</p>
          <p className="mt-3 font-mono text-4xl font-bold tracking-[0.08em] text-ink">{result.team_code}</p>
          <div className="mt-3 flex justify-center">
            <Badge tone={result.team_status === "waitlisted" ? "warn" : "signal"}>{result.team_status}</Badge>
          </div>
          <p className="mt-6 text-sm text-dim">
            {result.team_status === "waitlisted"
              ? "You're on the waitlist — we'll email your captain if a spot opens up."
              : "Save this code. We'll follow up by email with next steps before the event."}
          </p>
          <Link to="/" className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.16em] text-signal hover:underline">
            Back to home
          </Link>
        </Panel>
      </main>
    );
  }

  // ------------------------------------------------------- Not open states
  if (!isBackendConfigured || event.registration_status === "coming_soon" || event.registration_status === "closed") {
    const closed = event.registration_status === "closed";
    return (
      <main className="container max-w-xl py-24">
        <SectionTitle kicker="Register" title={closed ? "Registration is closed" : "Registration is coming soon"} />
        <Panel className="mt-8 p-8">
          <p className="text-dim">
            {closed
              ? "Registration for this event has closed. Check back for the next Impact Miami hackathon."
              : "The registration form isn't live yet. Check back soon, or watch this page — the button up top will go green when it opens."}
          </p>
          <EventFacts event={event} className="mt-8" />
        </Panel>
      </main>
    );
  }

  const waitlist = event.registration_status === "waitlist";

  return (
    <main className="container max-w-3xl py-16 sm:py-24">
      <SectionTitle kicker="Register" title="Register your team" lede={`Between ${minSize} and ${maxSize} members. One teammate submits for the whole team.`} />

      {waitlist && (
        <Panel className="mt-8 border-warn/40 p-5">
          <p className="text-sm text-ink">Team spots are full. New registrations join the waitlist — we'll reach out if room opens up.</p>
        </Panel>
      )}

      <form onSubmit={onSubmit} className="mt-10 space-y-12" noValidate>
        <section className="space-y-5">
          <h2 className="font-display text-xl font-bold text-ink">Team</h2>
          <Field label="Team name" htmlFor="team-name">
            <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required autoComplete="off" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="School" htmlFor="team-school" hint="Optional">
              <Input id="team-school" value={school} onChange={(e) => setSchool(e.target.value)} />
            </Field>
            <Field label="Experience level" htmlFor="team-experience" hint="Optional">
              <Select id="team-experience" value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel | "")}>
                <option value="">Select one</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </Field>
          </div>
          {tracks && tracks.length > 0 && (
            <Field label="Challenge track" htmlFor="team-track" hint="Optional">
              <Select id="team-track" value={trackId} onChange={(e) => setTrackId(e.target.value)}>
                <option value="">No preference</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Project idea" htmlFor="team-idea" hint="Optional — a sentence or two is plenty">
            <Textarea id="team-idea" value={projectIdea} onChange={(e) => setProjectIdea(e.target.value)} />
          </Field>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-ink">Team members</h2>
            <span className="font-mono text-xs text-faint">
              {members.length} / {maxSize}
            </span>
          </div>

          <div className="space-y-6">
            {members.map((member, i) => (
              <Panel key={member.key} className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-display text-lg font-bold text-ink">Member {i + 1}</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
                      <input
                        type="radio"
                        name="captain"
                        checked={member.is_captain}
                        onChange={() => setCaptain(member.key)}
                        className="h-4 w-4 accent-signal"
                      />
                      Captain
                    </label>
                    {members.length > minSize && (
                      <button type="button" onClick={() => removeMember(member.key)} aria-label={`Remove member ${i + 1}`} className="text-faint hover:text-alert">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" htmlFor={`${member.key}-name`} error={errors[`${i}.full_name`]}>
                    <Input id={`${member.key}-name`} value={member.full_name} onChange={(e) => updateMember(member.key, { full_name: e.target.value })} required />
                  </Field>
                  <Field label="Email" htmlFor={`${member.key}-email`} error={errors[`${i}.email`]}>
                    <Input id={`${member.key}-email`} type="email" value={member.email} onChange={(e) => updateMember(member.key, { email: e.target.value })} required />
                  </Field>
                  <Field label="Grade" htmlFor={`${member.key}-grade`} error={errors[`${i}.grade`]}>
                    <Select id={`${member.key}-grade`} value={member.grade} onChange={(e) => updateMember(member.key, { grade: e.target.value })} required>
                      <option value="">Select</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g === "Other" ? "Other" : `Grade ${g}`}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Phone" htmlFor={`${member.key}-phone`} hint="Optional">
                    <Input id={`${member.key}-phone`} type="tel" value={member.phone} onChange={(e) => updateMember(member.key, { phone: e.target.value })} />
                  </Field>
                  <Field label="T-shirt size" htmlFor={`${member.key}-shirt`} error={errors[`${i}.tshirt_size`]}>
                    <Select id={`${member.key}-shirt`} value={member.tshirt_size} onChange={(e) => updateMember(member.key, { tshirt_size: e.target.value })} required>
                      <option value="">Select</option>
                      {TSHIRT_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Dietary notes" htmlFor={`${member.key}-diet`} hint="Optional">
                    <Input id={`${member.key}-diet`} value={member.dietary_notes} onChange={(e) => updateMember(member.key, { dietary_notes: e.target.value })} />
                  </Field>
                </div>

                <div className="border-t border-line pt-5">
                  <p className="kicker mb-4 text-dim">Parent / guardian &mdash; required for students under 18</p>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Guardian name" htmlFor={`${member.key}-gname`} error={errors[`${i}.guardian_name`]}>
                      <Input id={`${member.key}-gname`} value={member.guardian_name} onChange={(e) => updateMember(member.key, { guardian_name: e.target.value })} required />
                    </Field>
                    <Field label="Guardian email" htmlFor={`${member.key}-gemail`} error={errors[`${i}.guardian_email`]}>
                      <Input id={`${member.key}-gemail`} type="email" value={member.guardian_email} onChange={(e) => updateMember(member.key, { guardian_email: e.target.value })} required />
                    </Field>
                    <Field label="Guardian phone" htmlFor={`${member.key}-gphone`} hint="Optional">
                      <Input id={`${member.key}-gphone`} type="tel" value={member.guardian_phone} onChange={(e) => updateMember(member.key, { guardian_phone: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </Panel>
            ))}
          </div>

          {members.length < maxSize && (
            <Button type="button" variant="outline" onClick={addMember}>
              <Plus className="h-4 w-4" />
              Add teammate
            </Button>
          )}
        </section>

        <section className="space-y-5">
          <label className="flex items-start gap-3 text-sm text-dim">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-signal" required />
            <span>
              I confirm this information is accurate, and agree to the event&apos;s code of conduct and photo/video release on behalf of every teammate listed above.
            </span>
          </label>

          {formError && <p className="text-sm text-alert">{formError}</p>}

          <Button type="submit" size="lg" disabled={register.isPending} className="w-full sm:w-auto">
            {register.isPending ? "Submitting…" : "Submit registration"}
          </Button>
        </section>
      </form>
    </main>
  );
};

export default Register;
