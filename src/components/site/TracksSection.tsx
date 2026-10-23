import { Link } from "react-router-dom";
import { Bot, Lock, Medal, Route } from "lucide-react";
import { Badge, Led, SectionTitle } from "@/components/ui";
import type { TrackRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEASER_SLOTS = 3;
const pad = (n: number) => String(n).padStart(2, "0");

const RULES = [
  { icon: Route, title: "Pick one track", body: "Every team chooses a single track to build for." },
  { icon: Bot, title: "Build an AI agent", body: "Not just an app. An agent that takes action for real people." },
  { icon: Medal, title: "One rubric", body: "Every track is scored on the same rubric. Most points wins." },
];

/**
 * Challenge tracks. Before release: an agentic AI teaser with locked,
 * redacted cards that reveal nothing. After release: the track prompts.
 */
export const TracksSection = ({ tracks, released }: { tracks: TrackRow[]; released: boolean }) => {
  const live = released && tracks.length > 0;
  return (
    <section id="tracks" className="container scroll-mt-20 py-16 sm:py-24">
      <SectionTitle
        kicker="Challenge tracks · Agentic AI"
        title={live ? "Pick your track" : "Three tracks. One agent."}
        lede={
          live
            ? "Choose one prompt, then build an AI agent that answers it."
            : "This year every team builds an AI agent. The three prompts stay locked until we release them, so start sharpening your skills now."
        }
      />

      {!live && (
        <Badge tone="warn" className="mt-6">
          <Led tone="warn" pulse className="h-1.5 w-1.5" /> Prompts locked · Dropping soon
        </Badge>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {live
          ? tracks.map((t, i) => (
              <article key={t.id} className="signal-border flex flex-col rounded-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Track {pad(i + 1)}</span>
                  <Bot className="h-5 w-5 text-pulse" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-[-0.02em] text-ink">{t.title}</h3>
                {t.summary && <p className="mt-3 text-[15px] leading-relaxed text-dim">{t.summary}</p>}
                {t.description && <p className="mt-3 text-sm leading-relaxed text-dim">{t.description}</p>}
              </article>
            ))
          : Array.from({ length: TEASER_SLOTS }, (_, i) => (
              <article key={i} aria-label={`Track ${pad(i + 1)}, locked`} className="brackets relative overflow-hidden rounded-2xl border border-line bg-deck p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Track {pad(i + 1)}</span>
                  <Lock className="h-4 w-4 text-faint" aria-hidden />
                </div>
                <p className="mt-4 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">
                  Agents for <span className="rounded bg-line-strong px-2 text-transparent select-none" aria-hidden>██████</span>
                </p>
                <div aria-hidden className="mt-4 space-y-2">
                  {[92, 100, 74, 58].map((w, j) => (
                    <div key={j} className={cn("h-2.5 rounded bg-rail", j === 3 && "opacity-60")} style={{ width: `${w}%` }} />
                  ))}
                </div>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">[ Classified until release ]</p>
              </article>
            ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {RULES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3 rounded-2xl border border-line p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-signal" aria-hidden />
            <div>
              <p className="font-display text-base font-bold text-ink">{title}</p>
              <p className="mt-1 text-sm text-dim">{body}</p>
              {title === "One rubric" && (
                <Link to="/rubric" className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:underline">
                  See the rubric →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
