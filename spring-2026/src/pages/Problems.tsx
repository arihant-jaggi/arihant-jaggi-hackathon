import { useSupabaseList } from "@/hooks/useSupabaseList";
import { Droplets, Waves, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";

type ChallengeRecord = {
  id: string;
  title: string;
  category?: string | null;
  is_main?: boolean | null;
  description?: string | null;
  context?: string | null;
  solution_ideas?: string[] | null;
  focus_areas?: string[] | null;
  icon?: string | null;
};

type ChallengeExampleRecord = {
  id: string;
  challenge_id: string;
  title: string;
  description?: string | null;
  link?: string | null;
  sort_order?: number | null;
};

const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Waves,
  Flame,
};

const getIcon = (name?: string | null) => iconMap[name ?? ""] ?? Droplets;

const Problems = () => {
  const { data: challenges = [] } = useSupabaseList<ChallengeRecord>(["challenges", "problems"], "challenges", (query) =>
    query.order("is_main", { ascending: false }).order("created_at", { ascending: true }),
  );

  const mainChallenge = challenges.find((c) => c.is_main) ?? challenges[0];
  const otherChallenges = mainChallenge ? challenges.filter((c) => c.id !== mainChallenge.id) : challenges;

  const { data: examples = [] } = useSupabaseList<ChallengeExampleRecord>(
    ["challenge_examples", "problems", mainChallenge?.id ?? "none"],
    "challenge_examples",
    (query) => {
      if (!mainChallenge?.id) return query;
      return query
        .eq("challenge_id", mainChallenge.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
    },
  );

  return (
    <PageWrapper>
      <div className="container py-24">
        <SectionHeading
          title="Challenges"
          subtitle="Community-driven challenges addressing real societal needs in Miami. Choose one that inspires you and build a solution."
        />
        {challenges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            The challenge library is still being prepared. Check back soon for more problems to solve.
          </p>
        ) : (
          <div className="space-y-10">
            {mainChallenge && (() => {
              const ChallengeIcon = getIcon(mainChallenge.icon);
              return (
                <div className="relative overflow-hidden rounded-[2.25rem] border border-primary/20 bg-background/35 p-8 shadow-2xl shadow-primary/20 backdrop-blur-xl sm:p-10">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />

                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-mono uppercase tracking-wider text-primary shadow-sm shadow-primary/20">
                        <ChallengeIcon size={16} />
                        Main Challenge
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        {mainChallenge.category ?? "Challenge"}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{mainChallenge.title}</h2>
                    {mainChallenge.description && (
                      <p className="mt-4 max-w-5xl text-sm sm:text-base font-light text-muted-foreground leading-relaxed">
                        {mainChallenge.description}
                      </p>
                    )}

                    {mainChallenge.context && (
                      <div className="mt-7 rounded-3xl border border-primary/10 bg-background/40 p-6 shadow-lg shadow-primary/10 backdrop-blur sm:p-7">
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Context</p>
                        <p className="text-sm font-light text-muted-foreground leading-relaxed">{mainChallenge.context}</p>
                      </div>
                    )}

                    {(mainChallenge.solution_ideas ?? []).length > 0 && (
                      <div className="mt-7">
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Solution Ideas</p>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {mainChallenge.solution_ideas?.map((idea) => (
                            <li
                              key={idea}
                              className="rounded-2xl border border-primary/10 bg-background/40 px-5 py-4 text-sm font-light text-foreground shadow-sm shadow-primary/10 backdrop-blur"
                            >
                              {idea}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-7 flex flex-wrap gap-2">
                      {(mainChallenge.focus_areas ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/15 bg-background/30 px-3 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="rounded-3xl border bg-card/30 p-8 sm:p-10">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold tracking-tight">Examples / Inspiration</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reference ideas to help you shape a strong project direction. These are not requirements—use them as inspiration.
                </p>
              </div>
              {examples.length === 0 ? (
                <p className="text-sm text-muted-foreground">No example items have been added yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {examples.map((example) => (
                    <div key={example.id} className="rounded-2xl border bg-background/60 p-6 transition-all hover:border-primary/30">
                      <p className="text-sm font-semibold">{example.title}</p>
                      {example.description && <p className="mt-2 text-sm font-light text-muted-foreground">{example.description}</p>}
                      {example.link && (
                        <a href={example.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-primary underline underline-offset-4">
                          View reference
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {otherChallenges.length > 0 && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold tracking-tight">More Challenges</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Explore additional problem statements you can choose from.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherChallenges.map((challenge) => {
                    const ChallengeIcon = getIcon(challenge.icon);
                    return (
                      <div key={challenge.id} className="border bg-card p-8 transition-all hover:border-primary/30">
                        <div className="flex items-center gap-3 mb-4">
                          <ChallengeIcon size={24} className="text-primary" />
                          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{challenge.category ?? "Challenge"}</span>
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight">{challenge.title}</h3>
                        <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed">{challenge.description}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {(challenge.focus_areas ?? []).map((tag) => (
                            <span key={tag} className="border px-2 py-1 text-xs font-mono text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Problems;
