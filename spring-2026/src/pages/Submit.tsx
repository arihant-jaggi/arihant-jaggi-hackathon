import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import { formatCountdown, formatFriendlyDate, getWindowStatus, parseDateField } from "@/lib/hackathonStatus";

type ChallengeRecord = {
  id: string;
  slug: string;
  title: string;
};

const Submit = () => {
  const [form, setForm] = useState({
    teamName: "",
    projectTitle: "",
    problem: "",
    description: "",
    github: "",
    demo: "",
    presentation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: challenges = [] } = useSupabaseList<ChallengeRecord>(["challenges", "submit"], "challenges", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const { data: hackathonInfo = [] } = useSupabaseList<{
    id: string;
    submission_start_date?: string | null;
    submission_end_date?: string | null;
  }>(["hackathon_info", "submit"], "hackathon_info", (query) => query.order("created_at", { ascending: false }).limit(1));
  const submissionStart = parseDateField(hackathonInfo[0]?.submission_start_date);
  const submissionEnd = parseDateField(hackathonInfo[0]?.submission_end_date);
  const submissionWindow = getWindowStatus(submissionStart, submissionEnd);
  const isSubmissionOpen = submissionWindow.status === "open";
  const submissionCountdown =
    submissionWindow.status === "upcoming" && submissionWindow.start ? formatCountdown(submissionWindow.start) : null;
  const submissionMessage = (() => {
    switch (submissionWindow.status) {
      case "missing":
        return "Submission dates are coming soon—check back later for the project window.";
      case "upcoming":
        return `Submissions open ${formatFriendlyDate(submissionWindow.start)}.`;
      case "closed":
        return `Submissions closed on ${formatFriendlyDate(submissionWindow.end)}.`;
      default:
        return null;
    }
  })();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmissionOpen) {
      toast.error("Project submissions are not open right now.");
      return;
    }
    if (!form.teamName || !form.projectTitle || !form.problem || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("project_submissions").insert({
      team_name: form.teamName.trim(),
      project_title: form.projectTitle.trim(),
      problem_slug: form.problem,
      summary: form.description.trim(),
      github: form.github.trim() || null,
      demo: form.demo.trim() || null,
      presentation_link: form.presentation.trim() || null,
    });

    if (error) {
      console.error("Submission failed", error);
      toast.error("We couldn’t submit your project. Please try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Project submitted successfully! Good luck!");
    setForm({ teamName: "", projectTitle: "", problem: "", description: "", github: "", demo: "", presentation: "" });
    setIsSubmitting(false);
  };

  return (
    <PageWrapper>
      <div className="container max-w-2xl py-24">
        <SectionHeading title="Submit Project" subtitle="Upload your hackathon project for judging." />
        {submissionMessage && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-light ${
              submissionWindow.status === "closed"
                ? "border-destructive text-destructive"
                : submissionWindow.status === "upcoming"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            <p>{submissionMessage}</p>
            {submissionCountdown && (
              <p className="mt-1 text-lg font-light text-primary">
                Submission opens in <span className="font-semibold text-primary">{submissionCountdown}</span>
              </p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={!isSubmissionOpen} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Team Name *</label>
                <input value={form.teamName} onChange={(e) => update("teamName", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Project Title *</label>
                <input value={form.projectTitle} onChange={(e) => update("projectTitle", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Problem Statement *</label>
              <select value={form.problem} onChange={(e) => update("problem", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors">
                <option value="">{challenges.length ? "Select a challenge..." : "Challenges will appear once they are added to the database."}</option>
                {challenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.slug}>
                    {challenge.title}
                  </option>
                ))}
              </select>
              {challenges.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  We’ll unlock problem selection as soon as the organizers configure the challenge rows.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description *</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors resize-none" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">GitHub Link</label>
                <input value={form.github} onChange={(e) => update("github", e.target.value)} placeholder="https://github.com/..." className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Demo Link</label>
                <input value={form.demo} onChange={(e) => update("demo", e.target.value)} placeholder="https://..." className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50" />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Presentation link</label>
              <input
                value={form.presentation}
                onChange={(e) => update("presentation", e.target.value)}
                placeholder="https://drive.google.com/your-public-presentation"
                className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Share a publicly accessible presentation drive link instead of uploading a file.
              </p>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting || !isSubmissionOpen}
            className="w-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Submit;
