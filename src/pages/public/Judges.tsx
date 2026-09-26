import { Mail, UserRound } from "lucide-react";
import { Badge, Kicker, Led, Panel } from "@/components/ui";
import { useEvent } from "@/lib/api";
import { DEFAULT_EVENT } from "@/lib/defaults";

const SLOTS = [
  { role: "Judge", count: 3 },
  { role: "Mentor", count: 3 },
];

/** Judges & mentors: "coming soon" until the panel is announced. */
const Judges = () => {
  const { data: event } = useEvent();
  const email = event?.contact_email ?? DEFAULT_EVENT.contact_email;

  return (
    <main className="container py-16 sm:py-24">
      <div className="max-w-2xl space-y-5">
        <Kicker>Judges &amp; mentors</Kicker>
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl">
          The panel is <span className="text-signal">loading</span>
          <span className="animate-blink text-signal">_</span>
        </h1>
        <p className="text-lg text-dim">
          We're lining up engineers, founders, and civic leaders to judge projects and mentor teams on the day. Announcements are coming soon.
        </p>
        <Badge tone="warn">
          <Led tone="warn" className="h-1.5 w-1.5" /> Coming soon
        </Badge>
      </div>

      <div className="mt-14 space-y-10">
        {SLOTS.map(({ role, count }) => (
          <section key={role}>
            <p className="kicker mb-4">{role}s</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: count }, (_, i) => (
                <Panel key={i} className="brackets flex items-center gap-4 p-5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-dashed border-line-strong text-faint">
                    <UserRound className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="h-3 w-32 rounded bg-rail" />
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                      {role} · TBA
                    </p>
                  </div>
                </Panel>
              ))}
            </div>
          </section>
        ))}
      </div>

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
