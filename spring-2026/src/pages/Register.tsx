import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { toast } from "sonner";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import { formatCountdown, formatFriendlyDate, getWindowStatus, parseDateField } from "@/lib/hackathonStatus";

const getInitialFormState = () => ({
  name: "",
  email: "",
  phone: "",
  organization: "",
  teamName: "",
  teamSize: "1",
  skills: [] as string[],
  problem: "",
  agree: false,
  memberEmails: [] as string[],
});

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { data: skillRecords = [] } = useSupabaseList<{ id: string; name: string }>(["skills"], "skills", (query) =>
    query.order("name", { ascending: true }),
  );
  const { data: challengeOptions = [] } = useSupabaseList<{ id: string; slug: string; title: string }>(
    ["challenges", "register"],
    "challenges",
    (query) => query.order("created_at", { ascending: true }),
  );
  const { data: hackathonInfo = [] } = useSupabaseList<{
    id: string;
    start_date?: string | null;
    end_date?: string | null;
    registration_start_date?: string | null;
    registration_end_date?: string | null;
  }>(["hackathon_info", "register"], "hackathon_info", (query) => query.order("created_at", { ascending: false }).limit(1));

  const registrationStart = parseDateField(hackathonInfo[0]?.registration_start_date ?? hackathonInfo[0]?.start_date);
  const registrationEnd = parseDateField(hackathonInfo[0]?.registration_end_date ?? hackathonInfo[0]?.end_date);
  const registrationWindow = getWindowStatus(registrationStart, registrationEnd);
  const isRegistrationOpen = registrationWindow.status === "open";
  const registrationCountdown =
    registrationWindow.status === "upcoming" && registrationWindow.start
      ? formatCountdown(registrationWindow.start)
      : null;
  const registrationMessage = (() => {
    switch (registrationWindow.status) {
      case "missing":
        return "Registration dates will be shared here soon. Check back later or reach out to the team if you have questions.";
      case "upcoming":
        return `Registration opens ${formatFriendlyDate(registrationWindow.start)}.`;
      case "closed":
        return `Registration closed on ${formatFriendlyDate(registrationWindow.end)}.`;
      default:
        return null;
    }
  })();

  const update = (field: string, value: string | boolean | string[]) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "teamSize") {
        const extraMembers = Math.max(0, parseInt(value as string, 10) - 1);
        next.memberEmails = Array.from({ length: extraMembers }, (_, i) => f.memberEmails[i] || "");
      }
      return next;
    });
  };

  const updateMemberEmail = (index: number, value: string) => {
    setForm((f) => {
      const emails = [...f.memberEmails];
      emails[index] = value;
      return { ...f, memberEmails: emails };
    });
  };

  const toggleSkill = (s: string) => {
    update("skills", form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isRegistrationOpen) {
      toast.error("Registration is not open at the moment.");
      setIsSubmitting(false);
      return;
    }

    setFormError(null);
    if (!form.name.trim() || !form.email.trim() || !form.agree) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const extraMemberCount = Math.max(0, parseInt(form.teamSize, 10) - 1);
    if (extraMemberCount > 0 && form.memberEmails.slice(0, extraMemberCount).some((email) => !email.trim())) {
      toast.error("Please provide every team member email for the selected team size.");
      return;
    }

    const normalizedEmails = [
      form.email.trim().toLowerCase(),
      ...form.memberEmails.slice(0, extraMemberCount).map((email) => email.trim().toLowerCase()),
    ];

    const hasDuplicateEmail = normalizedEmails.some(
      (email, index) => email && normalizedEmails.indexOf(email) !== index,
    );
    if (hasDuplicateEmail) {
      toast.error("Each registration email must be unique across the leader and team members.");
      return;
    }

    setIsSubmitting(true);
    const memberEmails = form.memberEmails.slice(0, extraMemberCount).map((email) => email.trim());
    const leaderEmail = form.email.trim().toLowerCase();
    try {
    const { error: lookupError, data: exists } = await supabase
      .from("registrations")
      .select("id", { count: "exact" })
      .eq("leader_email", leaderEmail)
      .limit(1);

    if (lookupError) {
      throw lookupError;
    }

    if ((exists?.length ?? 0) > 0) {
      setFormError("That leader email is already registered.");
      setIsSubmitting(false);
      return;
    }

      const { error } = await supabase.from("registrations").insert({
        leader_name: form.name.trim(),
        leader_email: leaderEmail,
        leader_phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        team_name: form.teamName.trim() || null,
        team_size: parseInt(form.teamSize, 10),
        skills: form.skills,
        problem_interest: form.problem || null,
        additional_member_emails: memberEmails,
        agree_rules: form.agree,
      });

      if (error) {
        throw error;
      }

      toast.success("Registration submitted successfully!");
      setFormError(null);
      setForm(getInitialFormState());
      navigate("/thank-you");
    } catch (submissionError) {
      console.error("Registration failed", submissionError);
      toast.error("We couldn’t submit your registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extraMemberCount = Math.max(0, parseInt(form.teamSize, 10) - 1);

  return (
    <PageWrapper>
      <div className="container max-w-2xl py-16 sm:py-24">
        <SectionHeading title="Register" subtitle="Join the Young Coders Miami Impact Hackathon and build technology for community impact." />
        {registrationMessage && (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 font-light text-sm ${
              registrationWindow.status === "closed"
                ? "border-destructive text-destructive"
                : registrationWindow.status === "upcoming"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            <p>{registrationMessage}</p>
            {registrationCountdown && (
              <p className="mt-1 text-lg font-light text-primary">
                Registration starts in <span className="font-semibold text-primary">{registrationCountdown}</span>
              </p>
            )}
          </div>
        )}
        {formError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={!isRegistrationOpen} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email (Team Leader) *</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Phone</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">School / Organization</label>
                <input value={form.organization} onChange={(e) => update("organization", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Team Name</label>
                <input value={form.teamName} onChange={(e) => update("teamName", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Team Size</label>
                <select value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {extraMemberCount > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Team Member Emails ({extraMemberCount} member{extraMemberCount > 1 ? "s" : ""})
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: extraMemberCount }, (_, i) => (
                    <div key={i}>
                      <span className="text-xs text-muted-foreground font-light">Member {i + 2}</span>
                      <input
                        type="email"
                        placeholder={`member${i + 2}@email.com`}
                        value={form.memberEmails[i] || ""}
                        onChange={(e) => updateMemberEmail(i, e.target.value)}
                        className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Skills</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {skillRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Skills are coming soon. Once they appear in the database, pick the skills your team brings.
                  </p>
                ) : (
                  skillRecords.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.name)}
                      className={`border px-3 py-1.5 text-xs font-light transition-colors ${
                        form.skills.includes(skill.name)
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Problem Interest</label>
              <select value={form.problem} onChange={(e) => update("problem", e.target.value)} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors">
                <option value="">{challengeOptions.length ? "Select a challenge..." : "Challenges will populate once the admin seeds them."}</option>
                {challengeOptions.map((challenge) => (
                  <option key={challenge.slug} value={challenge.slug}>
                    {challenge.title}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} className="mt-1 accent-primary" />
              <span className="text-sm font-light text-muted-foreground">
                I agree to the hackathon rules and code of conduct. *
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting || !isRegistrationOpen}
            className="w-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Registering..." : "Register Now"}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Register;
