import { Calendar, Clock, MapPin } from "lucide-react";
import type { EventRow } from "@/lib/types";
import { formatEventDate, formatTimeRange } from "@/lib/format";
import { IconTile } from "@/components/ui";
import { cn } from "@/lib/utils";

/** DATE / TIME / LOCATION hairline rows, straight off the flyer. */
export const EventFacts = ({ event, className }: { event: EventRow; className?: string }) => (
  <div className={cn("divide-y divide-line border-y border-line", className)}>
    <Row icon={<Calendar className="h-5 w-5" />} label="Date">
      <span className="font-display text-lg font-bold text-ink sm:text-xl">{formatEventDate(event.starts_at, event.timezone)}</span>
    </Row>
    <Row icon={<Clock className="h-5 w-5" />} label="Time">
      <span className="font-display text-lg font-bold text-ink sm:text-xl">{formatTimeRange(event.starts_at, event.ends_at, event.timezone)}</span>
    </Row>
    <Row icon={<MapPin className="h-5 w-5" />} label="Location">
      <span className="font-display text-lg font-bold text-ink sm:text-xl">
        {event.venue_name}
        {event.venue_detail ? `, ${event.venue_detail}` : ""}
      </span>
      {event.venue_address && (
        <>
          <br />
          {event.venue_map_url ? (
            <a href={event.venue_map_url} target="_blank" rel="noreferrer" className="text-sm text-dim underline decoration-line-strong underline-offset-4 hover:text-signal">
              {event.venue_address}
            </a>
          ) : (
            <span className="text-sm text-dim">{event.venue_address}</span>
          )}
        </>
      )}
    </Row>
  </div>
);

const Row = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4 py-5">
    <IconTile>{icon}</IconTile>
    <div className="pt-1">
      <p className="kicker mb-1 text-dim">{label}</p>
      {children}
    </div>
  </div>
);
