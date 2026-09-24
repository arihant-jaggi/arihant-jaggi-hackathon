import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { ARCHIVE_URL } from "@/lib/supabase";

const NotFound = () => (
  <main className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
    <p className="kicker text-alert">Err 404</p>
    <h1 className="mt-6 font-display text-5xl font-extrabold tracking-[-0.03em] text-ink sm:text-6xl">
      Route not found<span className="text-signal animate-blink">_</span>
    </h1>
    <p className="mt-4 max-w-md text-dim">That page doesn&apos;t exist, or it moved. Check the URL, or head back home.</p>
    <div className="mt-8">
      <ButtonLink to="/" size="lg">
        Back to home
      </ButtonLink>
    </div>
    <p className="mt-10 font-mono text-sm text-faint">
      Looking for the Spring 2026 hackathon?{" "}
      <a href={ARCHIVE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-dim underline decoration-line-strong underline-offset-4 hover:text-signal">
        Visit the archive
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </p>
  </main>
);

export default NotFound;
