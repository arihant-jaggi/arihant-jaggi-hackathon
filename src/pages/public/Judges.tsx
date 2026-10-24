import { Linkedin, Mail, UserRound } from "lucide-react";
import { Badge, Kicker, Led, Panel } from "@/components/ui";
import { useEvent } from "@/lib/api";
import { DEFAULT_EVENT } from "@/lib/defaults";
import { JUDGE_SEATS, JUDGES } from "@/lib/judges";

const MENTOR_SEATS = 3;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const TbaCard = ({ role }: { role: string }) => (
  <Panel className="brackets flex items-center gap-4 p-5">
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-dashed border-line-strong text-faint">
      <UserRound className="h-6 w-6" />
    </span>
    <div className="min-w-0">
      <div className="h-3 w-32 rounded bg-rail" />
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{role} · Announcing soon</p>
    </div>
  </Panel>
);

/** Judges & mentors: confirmed judges, plus open seats until announced. */
const Judges = () => {
  const { data: event } = useEvent();
  const email = event?.contact_email ?? DEFAULT_EVENT.contact_email;

  return (
    <main className="container py-16 sm:py-24">
      <div className="max-w-2xl space-y-5">
        <Kicker>Judges &amp; mentors</Kicker>
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl">
          Meet the <span className="text-signal">panel</span>
          <span className="animate-blink text-signal">_</span>
        </h1>
        <p className="text-lg text-dim">
          Meet the panel judging projects at Impact Miami 2.0. Our mentors are being announced as they're confirmed.
        </p>
        <Badge tone="signal">
          <Led pulse className="h-1.5 w-1.5" /> {JUDGES.length >= JUDGE_SEATS ? "Judging panel confirmed" : `${JUDGES.length} of ${JUDGE_SEATS} judges confirmed`}
        </Badge>
      </div>

      <section className="mt-14">
        <p className="kicker mb-4">Judges</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JUDGES.map((j) => (
            <article key={j.name} className="signal-border flex flex-col rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-signal-diag font-display text-lg font-extrabold text-void">
                  {initials(j.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold leading-tight text-ink">{j.name}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-signal">{j.title ?? "Judge"}</p>
                </div>
                {j.linkedin && (
                  <a href={j.linkedin} target="_blank" rel="noreferrer" aria-label={`${j.name} on LinkedIn`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-dim hover:border-signal hover:text-signal">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
              {j.bio && <p className="mt-4 text-sm leading-relaxed text-dim">{j.bio}</p>}
            </article>
          ))}
          {Array.from({ length: Math.max(0, JUDGE_SEATS - JUDGES.length) }, (_, i) => (
            <TbaCard key={i} role="Judge" />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="kicker mb-4">Mentors</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: MENTOR_SEATS }, (_, i) => (
            <TbaCard key={i} role="Mentor" />
          ))}
        </div>
      </section>

      {email && (
        <Panel glow className="mt-14 flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center">
          <div>
            <p className="kicker">Want to help?</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-ink">Judge or mentor at Impact Miami 2.0</p>
          </div>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("Judging / mentoring at Impact Miami 2.0")}`}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-signal px-5 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-void hover:shadow-glow"
          >
            <Mail className="h-4 w-4" /> Get in touch
          </a>
        </Panel>
      )}
    </main>
  );
};

export default Judges;
