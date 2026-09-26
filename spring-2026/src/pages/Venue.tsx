import { MapPin, Laptop } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { useSupabaseList } from "@/hooks/useSupabaseList";

type VenueRecord = {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  map_url?: string | null;
  map_embed_url?: string | null;
  amenities?: string[] | null;
  parking_details?: string | null;
  what_to_bring?: string | null;
};

const Venue = () => {
  const { data: venues = [] } = useSupabaseList<VenueRecord>(["venues"], "venues", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const venue = venues[0];

  if (!venue) {
    return (
      <PageWrapper>
        <div className="container py-16 sm:py-24">
          <SectionHeading title="Venue" subtitle="Details will appear here once they are added to the database." />
          <p className="text-sm text-muted-foreground text-center">No venue data is available yet.</p>
        </div>
      </PageWrapper>
    );
  }

  const mapSrc = venue.map_embed_url ?? venue.map_url;

  return (
    <PageWrapper>
      <div className="container py-16 sm:py-24">
        <SectionHeading title="Venue" subtitle="Join us in a creative space designed for collaboration." />

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="border bg-card p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <MapPin size={24} className="text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg sm:text-xl font-medium">{venue.name}</h3>
                  {venue.address && (
                    <p className="text-sm font-light text-muted-foreground mt-1">
                      {venue.address.split("\n").map((line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>

              {venue.description && <p className="text-sm font-light text-muted-foreground">{venue.description}</p>}

              {venue.what_to_bring && (
                <div className="mt-6">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">What to Bring</p>
                  <div className="flex items-start gap-2 mt-2">
                    <Laptop size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm font-light text-muted-foreground">{venue.what_to_bring}</p>
                  </div>
                </div>
              )}

              {venue.parking_details && (
                <div className="mt-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Parking</p>
                  <p className="text-sm font-light text-muted-foreground">{venue.parking_details}</p>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              {(venue.amenities ?? []).map((amenity) => (
                <div key={amenity} className="border bg-card p-4 sm:p-5 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-medium">{amenity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border bg-card overflow-hidden">
            {mapSrc ? (
              <iframe
                title="Venue Location"
                src={mapSrc}
                className="w-full h-full min-h-[300px] sm:min-h-[400px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="p-8 text-sm text-muted-foreground">Map is not configured yet.</div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Venue;
