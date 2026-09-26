import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Droplets,
  Flame,
  Waves,
  ArrowRight,
  Zap,
  Globe,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";

type SiteDetail = {
  id: string;
  label: string;
  value: string;
  icon: string | null;
};

type SiteHighlight = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
};

type ChallengeRecord = {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  focus_areas?: string[] | null;
  icon?: string | null;
};

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  Calendar,
  Clock,
  Users,
  Droplets,
  Flame,
  Waves,
  Zap,
  Globe,
  GraduationCap,
};

const getIcon = (name?: string | null) => iconMap[name ?? ""] ?? MapPin;

const Index = () => {
  const { data: details = [] } = useSupabaseList<SiteDetail>(["site_details"], "site_details", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const { data: highlights = [] } = useSupabaseList<SiteHighlight>(["site_highlights"], "site_highlights", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const { data: challenges = [] } = useSupabaseList<ChallengeRecord>(["challenges", "index"], "challenges", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const { data: hackathonInfo = [] } = useSupabaseList<{ id: string; name: string; subtitle?: string | null }>(
    ["hackathon_info"],
    "hackathon_info",
    (query) => query.order("created_at", { ascending: true }),
  );
  const currentHackathon = hackathonInfo[0];
  const hackathonName = currentHackathon?.name ?? "Young Coders Miami Impact Hackathon";
  const hackathonSubtitle = currentHackathon?.subtitle ?? "Build for Miami. Solve real problems.";
  const featuredChallenges = challenges.slice(0, 3);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-5" />
        <div className="container relative pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_32rem]">
            <div className="space-y-6 text-left">
              <p className="font-mono text-sm sm:text-base font-light tracking-[0.45em] text-primary uppercase mb-4">
                {hackathonName}
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-[7rem] lg:text-[8rem] font-light tracking-tight leading-[0.98] max-w-3xl text-left">
                <span className="block text-left">
                  Build for <span className="text-gradient font-semibold">Miami.</span>
                </span>
                <span className="block text-left">
                  Solve Real Problems.
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-3xl text-lg sm:text-xl font-light text-muted-foreground leading-relaxed">
                {hackathonSubtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link to="/register" className="bg-primary px-6 sm:px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Register Now
                </Link>
                <Link to="/problems" className="border border-border px-6 sm:px-8 py-3 text-sm font-light text-foreground transition-colors hover:bg-secondary">
                  View Challenges
                </Link>
              </div>

              {/* Mobile/Tablet Sponsor + Prize (desktop version lives in the right column) */}
              <a
                href="https://detectinspections.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Detect sponsor website"
                className="md:hidden block w-full max-w-none border bg-secondary/30 p-6 sm:p-7 hover:bg-secondary/40 transition-colors"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
                  <div className="leading-tight">
                    <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Funded & sponsored by</p>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Detect</p>
                    <p className="mt-4 text-sm font-mono uppercase tracking-wider text-muted-foreground">Prize Pool</p>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">$1,500 + Detect merch</p>
                  </div>
                  <img
                    src="/detect_os_logo.jpeg"
                    alt="Detect logo"
                    className="h-28 sm:h-32 w-auto"
                    loading="lazy"
                  />
                </div>
              </a>
            </div>
            <div className="hidden w-full md:flex md:flex-col md:gap-4 md:mt-10 lg:mt-16">
              <div className="rounded-[32px] border border-primary/20 bg-gradient-to-br from-blue-200/60 via-purple-200/60 to-transparent p-8 shadow-2xl shadow-primary/30">
                <img src="/logo.png" alt="Young Coders Miami logo" className="h-64 lg:h-80 w-auto mx-auto" />
              </div>
              <a
                href="https://detectinspections.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Detect sponsor website"
                className="w-full rounded-[20px] border border-primary/10 bg-background/80 p-6 shadow-lg shadow-primary/10 transition-colors hover:bg-background/90"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
                  <div className="leading-tight">
                    <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Funded & sponsored by</p>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">Detect</p>
                    <p className="mt-4 text-sm font-mono uppercase tracking-wider text-muted-foreground">Prize Pool</p>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">$1,500 + Detect merch</p>
                  </div>
                  <img
                    src="/detect_os_logo.jpeg"
                    alt="Detect logo"
                    className="h-48 lg:h-56 w-auto"
                    loading="lazy"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t">
        <div className="container py-16 sm:py-24">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <SectionHeading title="What is this Hackathon?" />
              <p className="text-sm sm:text-base font-light text-muted-foreground leading-relaxed">
                The Young Coders Miami Impact Hackathon is a community-driven event
                focused on "Tech for Good." We bring together young developers, designers,
                and civic enthusiasts to tackle pressing challenges facing Miami — from
                water pollution to extreme heat.
              </p>
              <p className="mt-4 text-sm sm:text-base font-light text-muted-foreground leading-relaxed">
                Whether you're a student or a young professional, this is your chance
                to create technology that makes a tangible difference in people's lives.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.length === 0 ? (
                <div className="border bg-card p-5 sm:p-6 text-sm text-muted-foreground">
                  Event logistics are on their way. Check back soon for venue, date, and team size info.
                </div>
              ) : (
                details.map((detail) => {
                  const DetailIcon = getIcon(detail.icon);
                  return (
                    <div key={detail.id} className="border bg-card p-5 sm:p-6 transition-colors hover:border-primary/30">
                      <DetailIcon size={20} className="text-primary mb-3" />
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{detail.label}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{detail.value}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Problems */}
      <section className="border-t bg-secondary/30">
        <div className="container py-16 sm:py-24">
          <SectionHeading title="Featured Challenges" subtitle="Real-world Miami problems waiting for your innovative solutions." />
          {featuredChallenges.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredChallenges.map((challenge) => {
                const ChallengeIcon = getIcon(challenge.icon);
                return (
                  <div key={challenge.id} className="border bg-card p-6 sm:p-8 transition-all hover:border-primary/30 group">
                    <ChallengeIcon size={28} className="text-primary mb-5" />
                    <h3 className="text-lg sm:text-xl font-medium tracking-tight">{challenge.title}</h3>
                    <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed">
                      {challenge.tagline ?? challenge.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(challenge.focus_areas ?? []).map((tag) => (
                        <span key={tag} className="border px-2 py-1 text-xs font-mono text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Challenges will be published here as soon as the organizers post them.</p>
          )}
          <div className="mt-10 text-center">
            <Link to="/problems" className="inline-flex items-center gap-2 text-sm font-light text-primary hover:underline">
              View all challenges <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Participate */}
      <section className="border-t">
        <div className="container py-16 sm:py-24">
          <SectionHeading title="Why Participate?" />
            {highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                We will share why participating matters once the schedule and panel are finalized.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((highlight) => {
                  const HighlightIcon = getIcon(highlight.icon);
                  return (
                    <div key={highlight.id} className="border bg-card p-6 sm:p-8 transition-colors hover:border-primary/30">
                      <HighlightIcon size={24} className="text-primary mb-4" />
                      <h3 className="text-lg font-medium">{highlight.title}</h3>
                      <p className="mt-2 text-sm font-light text-muted-foreground leading-relaxed">{highlight.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-hero-gradient">
        <div className="container py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-primary-foreground md:text-5xl">
            Ready to make an impact?
          </h2>
          <p className="mt-4 text-sm sm:text-base font-light text-primary-foreground/80">
            One day. Three challenges. Infinite possibilities.
          </p>
          <Link to="/register" className="mt-8 inline-block border-2 border-primary-foreground px-8 sm:px-10 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10">
            Register Now
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Index;
