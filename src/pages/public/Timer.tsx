import { Link } from "react-router-dom";
import { Mark } from "@/components/Mark";
import { PitchTimer } from "@/components/site/PitchTimer";
import { useEvent, useSchedule } from "@/lib/api";
import { pitchDeadline } from "@/lib/deadline";

/** Full-screen pitch countdown for the projector / LED wall. */
const Timer = () => {
  const { data: event } = useEvent();
  const { data: schedule } = useSchedule();
  if (!event) return null;
  return (
    <div className="grid-ground flex min-h-screen flex-col bg-void px-4 py-6 sm:px-10 sm:py-10">
      <header className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <Mark className="h-10 sm:h-12" />
          <span className="font-display text-xl font-bold text-ink sm:text-2xl">
            Impact Miami <span className="text-signal">{event.edition}</span>
          </span>
        </Link>
        <p className="hidden font-mono text-xs uppercase tracking-kicker text-dim sm:block">youngcodersimpact.com/submit</p>
      </header>
      <main className="flex flex-1 items-center py-8">
        <div className="w-full">
          <PitchTimer variant="full" deadline={pitchDeadline(schedule)} startsAt={event.starts_at} timezone={event.timezone} />
        </div>
      </main>
    </div>
  );
};

export default Timer;
