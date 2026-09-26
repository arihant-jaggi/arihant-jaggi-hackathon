import { ArrowUpRight } from "lucide-react";
import { Mark } from "@/components/Mark";
import { Badge, Led, Panel, SectionTitle } from "@/components/ui";
import { formatShortDate } from "@/lib/format";
import { ARCHIVE_URL } from "@/lib/supabase";
import type { EventRow } from "@/lib/types";

// Facts from the archived Spring 2026 site (spring-2026/).
const SPRING_2026 = [
  { label: "Date", value: "Sunday, May 17, 2026" },
  { label: "Venue", value: "The Cushman School, Innovation Center" },
  { label: "Sponsor", value: "Detect" },
  { label: "Prize pool", value: "$1,500 + Detect merch" },
];

/** "Past hackathons": a two-stop timeline, Spring 2026 then this event. */
export const PastHackathons = ({ event }: { event: EventRow }) => (
  <section id="past" className="container scroll-mt-20 py-16 sm:py-24">
    <SectionTitle
      kicker="Past hackathons"
      title="Where it started"
      lede="Impact Miami is a series. Here's every edition so far, and where to relive the last one."
    />

    <ol className="relative mt-10 space-y-6">
      <span aria-hidden className="absolute bottom-8 left-[7px] top-8 w-px bg-gradient-to-b from-line-strong to-signal" />

      {/* Spring 2026 */}
      <li className="relative pl-8">
        <span aria-hidden className="absolute left-0 top-8 h-[15px] w-[15px] rounded-full border border-line-strong bg-void" />
        <Panel className="overflow-hidden">
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-white p-2">
              <img src="/past/spring-2026-logo.png" alt="Young Coders Impact Miami, Spring 2026 logo" className="h-full w-full object-contain" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>01 · Spring 2026</Badge>
                <Badge>Archived</Badge>
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">Young Coders Impact Miami</h3>
              <p className="mt-1 text-dim">Build for Miami. Solve real problems.</p>
              <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {SPRING_2026.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{f.label}</dt>
                    <dd className="mt-0.5 text-sm text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <a
              href={ARCHIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg border border-line-strong px-5 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:border-signal hover:text-signal md:self-center"
            >
              Visit the Spring 2026 site
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Panel>
      </li>

      {/* This event */}
      <li className="relative pl-8">
        <span aria-hidden className="absolute left-0 top-7 grid h-[15px] w-[15px] place-items-center rounded-full border border-signal bg-void shadow-glow">
          <span className="h-[5px] w-[5px] rounded-full bg-signal" />
        </span>
        <div className="signal-border flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:p-8">
          <Mark title="" className="h-14" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="signal">02 · Fall 2026</Badge>
              <Badge tone="signal">
                <Led pulse className="h-1.5 w-1.5" /> You are here
              </Badge>
            </div>
            <h3 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">
              {event.name} <span className="text-signal">{event.edition}</span>
            </h3>
            <p className="mt-1 text-dim">
              {formatShortDate(event.starts_at, event.timezone)}, 2026 · {event.venue_name}
              {event.venue_detail ? `, ${event.venue_detail}` : ""}
            </p>
          </div>
        </div>
      </li>
    </ol>
  </section>
);
