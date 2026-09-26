import { ArrowRight, ArrowUpRight, CalendarPlus, Megaphone, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { Badge, ButtonLink, GradientText, IconTile, Kicker, Panel, SectionTitle } from "@/components/ui";
import { Countdown } from "@/components/site/Countdown";
import { EventFacts } from "@/components/site/EventFacts";
import { useAnnouncements, useEvent, useFaqs, useSchedule, useTracks } from "@/lib/api";
import { formatDateTime, formatEventDate, formatTimeRange, registrationLabel } from "@/lib/format";
import { ARCHIVE_URL } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/** Google Calendar "render" template URL built from the event's start/end times. */
const googleCalendarUrl = (title: string, details: string, location: string, startIso: string | null, endIso: string | null) => {
  if (!startIso || !endIso) return null;
  const fmt = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(startIso)}/${fmt(endIso)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const Home = () => {
  const { data: event } = useEvent();
  const { data: tracks } = useTracks();
  const { data: schedule } = useSchedule();
  const { data: faqs } = useFaqs();
  const { data: announcements } = useAnnouncements();

  if (!event) return null;

  const status = event.registration_status;
  const calendarUrl = googleCalendarUrl(
    `${event.name} ${event.edition ?? ""}`.trim(),
    event.description ?? "",
    [event.venue_name, event.venue_address].filter(Boolean).join(", "),
    event.starts_at,
    event.ends_at,
  );

  return (
    <main>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="container pb-16 pt-14 sm:pb-24 sm:pt-20">
        <Kicker>Young Coders Initiative presents</Kicker>
        <h1 className="mt-6 font-display text-[15vw] font-extrabold leading-[0.9] tracking-[-0.03em] text-ink sm:text-7xl md:text-8xl">
          Impact
          <br />
          Miami <GradientText>{event.edition}</GradientText>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-dim sm:text-xl">{event.tagline}</p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <ButtonLink to="/register" size="lg">
            {status === "open" ? "Register your team" : status === "waitlist" ? "Join the waitlist" : "Registration coming soon"}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          {calendarUrl && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 items-center gap-2 rounded-xl border border-line-strong px-6 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:border-signal hover:text-signal"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to calendar
            </a>
          )}
        </div>

        <Countdown target={event.starts_at} className="mt-12" />
      </section>

      {/* ---------------------------------------------------------- Event facts */}
      <section className="container pb-16 sm:pb-24">
        <EventFacts event={event} />
      </section>

      {/* ------------------------------------------------------------- About */}
      <section id="about" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle kicker="About" title="Build for Miami, in a day." lede={event.description} />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <WhyCard icon={<Sparkles className="h-5 w-5" />} title="Build for Miami" body="Student teams design, build, and pitch projects that make a real difference for local communities." />
          <WhyCard icon={<Trophy className="h-5 w-5" />} title="Cash prizes & awards" body={`${event.prize_summary ?? "Prize pool"} ${event.prize_detail ?? ""}`.trim()} />
          <WhyCard icon={<Zap className="h-5 w-5" />} title="One day" body={`Everything happens ${formatEventDate(event.starts_at, event.timezone)} — doors open in the morning, projects ship by evening.`} />
        </div>
      </section>

      {/* ------------------------------------------------------------ Tracks */}
      <section id="tracks" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle kicker="Tracks" title="Challenge tracks" />
        <div className="mt-10">
          {tracks && tracks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.map((t) => (
                <Panel key={t.id} className="p-6">
                  <h3 className="font-display text-xl font-bold text-ink">{t.title}</h3>
                  {t.summary && <p className="mt-2 text-sm text-dim">{t.summary}</p>}
                </Panel>
              ))}
            </div>
          ) : (
            <Panel className="brackets p-8 text-center sm:p-12">
              <p className="font-mono text-sm text-dim">Challenge tracks drop closer to the event.</p>
            </Panel>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------- Schedule */}
      <section id="schedule" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle kicker="Schedule" title="Run of show" />
        {schedule && schedule.length > 0 && (
          <ol className="mt-10 divide-y divide-line border-y border-line">
            {schedule.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-8">
                <span className="shrink-0 font-mono text-sm tabular-nums text-signal sm:w-48">{formatTimeRange(item.starts_at, item.ends_at, event.timezone)}</span>
                <div>
                  <p className="font-display text-lg font-bold text-ink">{item.title}</p>
                  {item.description && <p className="mt-1 text-sm text-dim">{item.description}</p>}
                  {item.location && <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-faint">{item.location}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ------------------------------------------------------- Announcements */}
      {announcements && announcements.length > 0 && (
        <section className="container py-16 sm:py-24">
          <SectionTitle kicker="Announcements" title="Latest updates" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {announcements.map((a) => (
              <Panel key={a.id} className="p-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-pulse" />
                  {a.pinned && <Badge tone="pulse">Pinned</Badge>}
                  <span className="ml-auto font-mono text-xs text-faint">{formatDateTime(a.created_at, event.timezone)}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{a.title}</h3>
                {a.body && <p className="mt-2 text-sm text-dim">{a.body}</p>}
              </Panel>
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------- Prizes */}
      <section id="prizes" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle kicker="Prizes" title="What's on the line" />
        <Panel glow className="mt-10 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:p-10">
          <IconTile solid className="h-14 w-14">
            <Trophy className="h-6 w-6" />
          </IconTile>
          <div>
            <p className="kicker text-dim">Prizes</p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-ink sm:text-3xl">{event.prize_summary}</p>
            {event.prize_detail && <p className="mt-1 text-dim">{event.prize_detail}</p>}
          </div>
        </Panel>
      </section>

      {/* ------------------------------------------------------------ Partners */}
      <section className="container py-16 sm:py-24">
        <SectionTitle kicker="Partners" title="Presented with" />
        <div className="mt-10 flex flex-wrap items-center gap-10">
          <img src="/yci.png" alt="Young Coders Initiative" className="h-14 w-auto object-contain" />
          <span aria-hidden className="h-10 w-px bg-line" />
          <div className="flex items-center gap-3">
            <img src="/bigred.png" alt="Big Red Education" className="h-12 w-auto rounded object-contain" />
            <span className="text-sm text-dim">{event.partner_name}</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ FAQ */}
      <section id="faq" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle kicker="FAQ" title="Questions, answered" />
        <div className="mt-10 divide-y divide-line border-y border-line">
          {(faqs ?? []).map((f) => (
            <details key={f.id} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-ink marker:content-none">
                {f.question}
                <span aria-hidden className="shrink-0 font-mono text-signal transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-dim">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Archive */}
      <section className="container py-16 sm:py-24">
        <Panel className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="kicker text-dim">Looking back</p>
            <p className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">Curious about the last hackathon?</p>
          </div>
          <a href={ARCHIVE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.14em] text-signal hover:underline">
            See Spring 2026
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Panel>
      </section>

      {/* ------------------------------------------------------------- Final CTA */}
      <section className="container pb-24 pt-4 sm:pb-32">
        <div className={cn("signal-border brackets rounded-2xl px-8 py-14 text-center sm:py-20")}>
          <Users className="mx-auto h-8 w-8 text-signal" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
            {status === "open" ? "Grab your team and register." : status === "waitlist" ? "Spots are full — join the waitlist." : "Registration status:"}{" "}
            {status !== "open" && status !== "waitlist" && <GradientText>{registrationLabel[status]}</GradientText>}
          </h2>
          <div className="mt-8">
            <ButtonLink to="/register" size="lg">
              {status === "open" ? "Register your team" : status === "waitlist" ? "Join the waitlist" : "Get notified"}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
};

const WhyCard = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <Panel className="p-6">
    <IconTile>{icon}</IconTile>
    <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
    <p className="mt-1.5 text-sm text-dim">{body}</p>
  </Panel>
);

export default Home;
