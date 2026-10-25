import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, Megaphone, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { Badge, ButtonLink, GradientText, IconTile, Kicker, Led, Panel, SectionTitle } from "@/components/ui";
import { Countdown } from "@/components/site/Countdown";
import { EventFacts } from "@/components/site/EventFacts";
import { HeroDisplay } from "@/components/site/HeroDisplay";
import { ScheduleTimeline } from "@/components/site/ScheduleTimeline";
import { PastHackathons } from "@/components/site/PastHackathons";
import { PitchTimer, useNow } from "@/components/site/PitchTimer";
import { TracksSection } from "@/components/site/TracksSection";
import { useAnnouncements, useEvent, useFaqs, useSchedule, useTracks } from "@/lib/api";
import { isEventDay, pitchDeadline } from "@/lib/deadline";
import { formatDateTime, formatEventDate, formatTimeRange, registrationLabel } from "@/lib/format";
import { PARTNERS } from "@/lib/partners";
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
  const { data: tracks, released: tracksReleased } = useTracks();
  const { data: schedule } = useSchedule();
  const { data: faqs } = useFaqs();
  const { data: announcements } = useAnnouncements();
  const now = useNow(60_000);

  if (!event) return null;
  const eventDay = isEventDay(event.starts_at, event.ends_at, now);

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
      {/* ------------------------------------------------- Event-day pitch timer */}
      {eventDay && (
        <section className="container pt-8 sm:pt-10">
          <PitchTimer deadline={pitchDeadline(schedule)} startsAt={event.starts_at} timezone={event.timezone} />
        </section>
      )}

      {/* ---------------------------------------------------------------- Hero */}
      <section className="container pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <Kicker className="mb-8">Young Coders Initiative presents</Kicker>
            <h1 className="font-display text-[15vw] font-extrabold leading-[0.9] tracking-[-0.03em] text-ink sm:text-7xl md:text-8xl">
              Impact
              <br />
              Miami <GradientText>{event.edition}</GradientText>
            </h1>
            <div className="mt-5 flex items-center gap-5">
              <span className="font-display text-3xl font-medium tracking-[-0.02em] text-ink sm:text-4xl">Hackathon</span>
              <span aria-hidden className="h-0.5 flex-1 bg-gradient-to-r from-signal via-pulse/60 to-transparent" />
            </div>
            <p className="mt-6 max-w-xl text-lg text-dim sm:text-xl">{event.tagline}</p>
            {event.prize_summary && (
              <Link to="/#prizes" className="mt-5 inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/[0.08] px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-signal transition-colors hover:bg-signal/15">
                <Trophy className="h-3.5 w-3.5" />
                {event.prize_summary}
              </Link>
            )}

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

            {!eventDay && <Countdown target={event.starts_at} className="mt-12" />}
          </div>

          <HeroDisplay event={event} />
        </div>
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
          <WhyCard icon={<Zap className="h-5 w-5" />} title="One day" body={`Everything happens ${formatEventDate(event.starts_at, event.timezone)}. Doors open in the morning, projects ship by evening.`} />
        </div>
      </section>

      {/* ------------------------------------------------------------ Tracks */}
      <TracksSection tracks={tracks ?? []} released={tracksReleased} />

      {/* ----------------------------------------------------------- Schedule */}
      <section id="schedule" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle
          kicker="Schedule"
          title="Run of show"
          lede={`${formatEventDate(event.starts_at, event.timezone)} · ${formatTimeRange(event.starts_at, event.ends_at, event.timezone)}`}
        />
        {schedule && schedule.length > 0 && <ScheduleTimeline items={schedule} timezone={event.timezone} />}
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
        <Panel glow className="mt-10 flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <IconTile solid className="h-16 w-16">
            <Trophy className="h-7 w-7" />
          </IconTile>
          <div>
            <p className="kicker text-dim">Cash prize pool</p>
            <p className="mt-1.5 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              <GradientText>{event.prize_summary}</GradientText>
            </p>
            {event.prize_detail && <p className="mt-2 text-lg text-dim">{event.prize_detail}</p>}
          </div>
        </Panel>
      </section>

      {/* ------------------------------------------------------------ Partners */}
      <section id="partners" className="container scroll-mt-20 py-16 sm:py-24">
        <SectionTitle kicker="Partners" title="Backed by great partners" lede="Impact Miami 2.0 is made possible by the organizations behind it." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex items-center gap-6 rounded-2xl p-6 sm:p-8",
                p.isNew ? "signal-border shadow-glow" : "border border-line bg-deck",
              )}
            >
              <span className={cn("grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl p-2 sm:h-28 sm:w-28", p.tile)}>
                <img src={p.logo} alt={p.name} className="h-full w-full object-contain" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={p.isNew ? "signal" : "dim"}>Partner</Badge>
                  {p.isNew && (
                    <Badge tone="signal">
                      <Led pulse className="h-1.5 w-1.5" /> New
                    </Badge>
                  )}
                </div>
                <p className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-3xl">{p.name}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-deck p-5 sm:p-6">
          <img src="/yci-transparent.png" alt="Young Coders Initiative" className="h-12 w-auto object-contain" />
          <div>
            <p className="kicker">Presented by</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">Young Coders Initiative</p>
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

      {/* ------------------------------------------------------ Past hackathons */}
      <PastHackathons event={event} />

      {/* ------------------------------------------------------------- Final CTA */}
      <section className="container pb-24 pt-4 sm:pb-32">
        <div className={cn("signal-border brackets rounded-2xl px-8 py-14 text-center sm:py-20")}>
          <Users className="mx-auto h-8 w-8 text-signal" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
            {status === "open" ? "Grab your team and register." : status === "waitlist" ? "Spots are full. Join the waitlist." : "Registration status:"}{" "}
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
