import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { useSupabaseList } from "@/hooks/useSupabaseList";

type CriterionRecord = {
  id: string;
  title: string;
  points: number;
  what_to_assess: string;
  sort_order?: number | null;
};

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const JudgingCriteria = () => {
  const { data: criteria = [] } = useSupabaseList<CriterionRecord>(["judging_criteria"], "judging_criteria", (query) =>
    query.order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
  );

  return (
    <PageWrapper>
      <div className="container py-16 sm:py-24">
        <SectionHeading
          title="Judging Criteria"
          subtitle="How projects will be evaluated. Build for impact, clarity, and real-world viability."
        />

        {criteria.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Criteria are being finalized. Please check back soon.
          </p>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-2">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="overflow-hidden rounded-3xl border bg-card/60">
                  <div className="grid md:grid-cols-[220px_1fr]">
                    <div className="border-b md:border-b-0 md:border-r bg-muted/30 p-6">
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Criteria</p>
                      <h3 className="mt-2 text-lg font-semibold leading-snug">{criterion.title}</h3>
                      <div className="mt-4 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
                        {criterion.points} pts
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">What to Assess</p>
                      <ul className="mt-3 space-y-2">
                        {splitLines(criterion.what_to_assess).map((line) => (
                          <li key={line} className="text-sm font-light text-muted-foreground leading-relaxed">
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border bg-card/40 p-6 sm:p-8">
              <div className="mb-5">
                <h3 className="text-xl font-semibold tracking-tight">Scoring Table</h3>
                <p className="mt-1 text-sm text-muted-foreground">Points allocation across all criteria.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Criteria</th>
                      <th className="py-3 pr-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((criterion) => (
                      <tr key={criterion.id} className="border-b last:border-b-0">
                        <td className="py-3 pr-4">{criterion.title}</td>
                        <td className="py-3 pr-4 font-mono text-muted-foreground">{criterion.points}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-4 pr-4 font-semibold">Total</td>
                      <td className="py-4 pr-4 font-mono font-semibold">
                        {criteria.reduce((sum, c) => sum + (c.points ?? 0), 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default JudgingCriteria;

