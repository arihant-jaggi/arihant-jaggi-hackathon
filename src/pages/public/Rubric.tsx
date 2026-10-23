import { CheckCircle2, Scale, Trophy, UserX } from "lucide-react";
import { Badge, Kicker, Panel } from "@/components/ui";
import { BANDS, RUBRIC, RUBRIC_TOTAL, bandRange } from "@/lib/rubric";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

// Segment shades for the weight bar: strongest for the heaviest criterion.
const shade = (points: number) =>
  points >= 25 ? "bg-signal" : points >= 15 ? "bg-pulse/80" : points >= 10 ? "bg-pulse/50" : "bg-pulse/30";

const RULES = [
  { icon: CheckCircle2, title: "Entry check", body: "Your project must answer the prompt of the track you picked. It's pass/fail, with no points either way." },
  { icon: Scale, title: "Same rubric, every track", body: "No track is worth more than another. Every team is scored on the same seven criteria." },
  { icon: Trophy, title: "Ties", body: "Broken by the higher Innovation score, then Sustainability, then a judges' vote." },
  { icon: UserX, title: "Fair judging", body: "Every judge scores every team they see. Judges who know a team skip it, and the final score averages all judges." },
];

/** Public judging rubric: how the 100 raw points are earned. */
const Rubric = () => (
  <main className="container py-16 sm:py-24">
    <div className="max-w-2xl space-y-5">
      <Kicker>Judging rubric</Kicker>
      <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl">
        How projects are <span className="text-signal">scored</span>
      </h1>
      <p className="text-lg text-dim">
        Every project is scored out of {RUBRIC_TOTAL} raw points on the same seven criteria, whatever track you pick. We reward original ideas that could really last: an AI
        agent that takes action for Miami, works in the demo, is safe, and is pitched clearly.
      </p>
    </div>

    {/* Weight bar */}
    <section className="mt-12" aria-label="How the 100 points are split">
      <div className="flex h-4 overflow-hidden rounded-full border border-line">
        {RUBRIC.map((c) => (
          <span key={c.name} className={cn("h-full border-r border-void last:border-r-0", shade(c.points))} style={{ width: `${c.points}%` }} title={`${c.name}: ${c.points}`} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
        {RUBRIC.map((c, i) => (
          <span key={c.name} className="inline-flex items-center gap-2">
            <span aria-hidden className={cn("h-2 w-2 rounded-full", shade(c.points))} />
            {pad(i + 1)} {c.name} <span className="text-ink">{c.points}</span>
          </span>
        ))}
      </div>
    </section>

    {/* Criteria */}
    <section className="mt-12 grid gap-4 md:grid-cols-2">
      {RUBRIC.map((c, i) => {
        const top = i === 0;
        return (
          <article key={c.name} className={cn("flex flex-col rounded-2xl p-6 sm:p-7", top ? "signal-border shadow-glow md:col-span-2" : "border border-line bg-deck")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Criterion {pad(i + 1)}</span>
                <h2 className={cn("mt-2 font-display font-extrabold leading-tight tracking-[-0.02em] text-ink", top ? "text-3xl" : "text-2xl")}>{c.name}</h2>
              </div>
              <div className="shrink-0 text-right">
                <p className={cn("font-display font-extrabold tracking-[-0.03em]", top ? "text-5xl" : "text-4xl")}>
                  <span className={top ? "text-signal" : "text-ink"}>{c.points}</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">points</p>
              </div>
            </div>
            {top && (
              <Badge tone="signal" className="mt-3 self-start">
                Heaviest weight
              </Badge>
            )}
            <p className="mt-4 text-[15px] leading-relaxed text-dim">{c.lookFor}</p>
            <dl className="mt-auto grid grid-cols-4 gap-2 border-t border-line pt-4">
              {BANDS.map((b) => (
                <div key={b.name}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{b.name}</dt>
                  <dd className="mt-1 font-mono text-sm tabular-nums text-ink">{bandRange(c.points, b)}</dd>
                </div>
              ))}
            </dl>
          </article>
        );
      })}
    </section>

    {/* Rules */}
    <section className="mt-14">
      <p className="kicker mb-4">Fair play</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {RULES.map(({ icon: Icon, title, body }) => (
          <Panel key={title} className="flex items-start gap-4 p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-signal" aria-hidden />
            <div>
              <p className="font-display text-base font-bold text-ink">{title}</p>
              <p className="mt-1 text-sm text-dim">{body}</p>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  </main>
);

export default Rubric;
