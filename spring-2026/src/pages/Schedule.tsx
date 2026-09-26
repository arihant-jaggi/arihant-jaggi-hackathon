import { useMemo } from "react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { useSupabaseList } from "@/hooks/useSupabaseList";

type ScheduleEvent = {
  id: string;
  title: string;
  description?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location?: string | null;
  highlight?: string | null;
};

const formatTime = (value?: string | null) => {
  if (!value) return "TBD";
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const Schedule = () => {
  const { data: schedule = [] } = useSupabaseList<ScheduleEvent>(["event_schedule"], "event_schedule", (query) =>
    query.order("start_at", { ascending: true }),
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, { day: string; events: ScheduleEvent[] }>();
    schedule.forEach((event) => {
      const dayLabel = event.start_at
        ? new Date(event.start_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
        : "Schedule";
      if (!groups.has(dayLabel)) {
        groups.set(dayLabel, { day: dayLabel, events: [] });
      }
      groups.get(dayLabel)?.events.push(event);
    });
    return Array.from(groups.values());
  }, [schedule]);

  return (
    <PageWrapper>
      <div className="container py-16 sm:py-24">
        <SectionHeading title="Event Schedule" subtitle="A full day of innovation, collaboration, and impact." />
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Event details are being created; the schedule will appear here soon.</p>
        ) : (
          <div className="space-y-16">
            {grouped.map((day) => (
              <div key={day.day}>
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight">{day.day}</h3>
                </div>
                <div className="space-y-0">
                  {day.events.map((event) => (
                    <div key={event.id} className="relative grid grid-cols-[110px_1fr] gap-4 border-l-2 border-primary/20 py-4 pl-4 hover:border-primary transition-colors sm:grid-cols-[140px_1fr] sm:gap-6">
                      <div className="absolute left-[-7px] top-6 h-3 w-3 rounded-full border border-primary bg-background" />
                      <div className="font-mono text-xs sm:text-sm text-primary whitespace-nowrap">
                        <div>{formatTime(event.start_at)}</div>
                        <div className="text-muted-foreground">
                          {event.end_at ? formatTime(event.end_at) : "—"}
                        </div>
                      </div>
                      <div className="border-b pb-4">
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        {event.description && (
                          <p className="text-xs sm:text-sm font-light text-muted-foreground">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-xs sm:text-xs font-mono text-muted-foreground mt-1">{event.location}</p>
                        )}
                        {event.highlight && (
                          <p className="text-xs sm:text-sm font-light text-muted-foreground mt-1 italic">{event.highlight}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Schedule;
