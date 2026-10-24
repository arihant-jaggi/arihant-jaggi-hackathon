import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Github, Globe, Presentation } from "lucide-react";
import { Button, Field, Input, Panel, SectionTitle, Select, Textarea } from "@/components/ui";
import { useEvent, useSubmitProject, useTracks } from "@/lib/api";
import { isBackendConfigured } from "@/lib/supabase";
import { DESCRIPTION_MAX, validateSubmission } from "@/lib/submissions";
import type { SubmitProjectInput } from "@/lib/types";

const EMPTY: SubmitProjectInput = { team_name: "", project_title: "", description: "", track_id: "", track_title: "", github_url: "", demo_url: "", slides_url: "" };

const LINKS = [
  { key: "github_url", label: "GitHub repo", icon: Github, placeholder: "https://github.com/your-team/project" },
  { key: "demo_url", label: "Live demo", icon: Globe, placeholder: "https://your-project.vercel.app" },
  { key: "slides_url", label: "Google Slides", icon: Presentation, placeholder: "https://docs.google.com/presentation/..." },
] as const;

const Submit = () => {
  const { data: event } = useEvent();
  const { data: tracks } = useTracks();
  const submit = useSubmitProject();
  const [form, setForm] = useState<SubmitProjectInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<SubmitProjectInput | null>(null);

  const hasTracks = !!tracks && tracks.length > 0;
  const set = (patch: Partial<SubmitProjectInput>) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const found = validateSubmission(form, hasTracks);
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError(found.links ?? "Check the highlighted fields.");
      return;
    }
    const trim = (v?: string) => v?.trim() || undefined;
    const payload: SubmitProjectInput = {
      team_name: form.team_name.trim(),
      project_title: form.project_title.trim(),
      description: form.description.trim(),
      track_id: trim(form.track_id),
      track_title: hasTracks ? tracks!.find((t) => t.id === form.track_id)?.title : trim(form.track_title),
      github_url: trim(form.github_url),
      demo_url: trim(form.demo_url),
      slides_url: trim(form.slides_url),
    };
    submit.mutate(payload, {
      onSuccess: () => {
        setDone(payload);
        window.scrollTo(0, 0);
      },
      onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
    });
  };

  if (!event) return null;

  if (done) {
    return (
      <main className="container flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-24 text-center">
        <Panel glow className="brackets w-full p-8 sm:p-12">
          <CheckCircle2 className="mx-auto h-10 w-10 text-signal" />
          <p className="kicker mt-5 justify-center text-dim">Project submitted</p>
          <p className="mt-3 font-display text-3xl font-bold text-ink">{done.project_title}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-dim">{done.team_name}</p>
          <p className="mt-6 text-sm text-dim">You're in. Need to fix a link? Submit again with the same team name. Your latest submission is the one judges see.</p>
          <div className="mt-8 flex justify-center gap-6">
            <button type="button" onClick={() => { setForm(done); setDone(null); }} className="font-mono text-xs uppercase tracking-[0.16em] text-signal hover:underline">
              Edit and resubmit
            </button>
            <Link to="/" className="font-mono text-xs uppercase tracking-[0.16em] text-dim hover:text-ink">
              Back to home
            </Link>
          </div>
        </Panel>
      </main>
    );
  }

  if (!isBackendConfigured || !event.submissions_open) {
    return (
      <main className="container max-w-xl py-24">
        <SectionTitle kicker="Submit" title="Submissions aren't open yet" />
        <Panel className="mt-8 p-8">
          <p className="text-dim">
            Project submissions open on event day. When they do, one teammate submits your project title, a short description, your track, and links to your GitHub, live demo, or slides.
          </p>
        </Panel>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl py-16 sm:py-24">
      <SectionTitle kicker="Submit" title="Submit your project" lede="One teammate submits for the whole team. No code upload needed, just links. You can resubmit any time before submissions close." />

      <form onSubmit={onSubmit} className="mt-10 space-y-10" noValidate>
        <section className="space-y-5">
          <h2 className="font-display text-xl font-bold text-ink">Project</h2>
          <Field label="Team name" htmlFor="sub-team" error={errors.team_name} hint="Use the same name you registered with.">
            <Input id="sub-team" value={form.team_name} onChange={(e) => set({ team_name: e.target.value })} maxLength={120} autoComplete="off" />
          </Field>
          <Field label="Project title" htmlFor="sub-title" error={errors.project_title}>
            <Input id="sub-title" value={form.project_title} onChange={(e) => set({ project_title: e.target.value })} maxLength={160} />
          </Field>
          <Field label="Short description" htmlFor="sub-desc" error={errors.description} hint={`What it does and who it helps. ${form.description.length} / ${DESCRIPTION_MAX}`}>
            <Textarea id="sub-desc" rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} maxLength={DESCRIPTION_MAX} />
          </Field>
          {hasTracks ? (
            <Field label="Track" htmlFor="sub-track" error={errors.track_id}>
              <Select id="sub-track" value={form.track_id} onChange={(e) => set({ track_id: e.target.value })}>
                <option value="">Select your track</option>
                {tracks!.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Track" htmlFor="sub-track-text" hint="Optional">
              <Input id="sub-track-text" value={form.track_title} onChange={(e) => set({ track_title: e.target.value })} maxLength={120} />
            </Field>
          )}
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Links</h2>
            <p className={errors.links ? "mt-1 text-sm text-alert" : "mt-1 text-sm text-dim"}>Add at least one. Make sure each link is shared so anyone can view it.</p>
          </div>
          {LINKS.map(({ key, label, icon: Icon, placeholder }) => (
            <Field key={key} label={label} htmlFor={`sub-${key}`} error={errors[key]}>
              <div className="relative">
                <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input id={`sub-${key}`} type="url" inputMode="url" className="pl-9" placeholder={placeholder} value={form[key]} onChange={(e) => set({ [key]: e.target.value })} />
              </div>
            </Field>
          ))}
        </section>

        <section className="space-y-4">
          {formError && <p className="text-sm text-alert">{formError}</p>}
          <Button type="submit" size="lg" disabled={submit.isPending} className="w-full sm:w-auto">
            {submit.isPending ? "Submitting…" : "Submit project"}
          </Button>
        </section>
      </form>
    </main>
  );
};

export default Submit;
