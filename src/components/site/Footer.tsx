import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useEvent } from "@/lib/api";
import { ARCHIVE_URL } from "@/lib/supabase";
import { DEFAULT_EVENT } from "@/lib/defaults";

export const Footer = () => {
  const { data: event } = useEvent();
  const contactEmail = event?.contact_email ?? DEFAULT_EVENT.contact_email;

  return (
    <footer className="border-t border-line">
      <div className="container flex flex-col gap-10 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm text-dim">A one-day youth hackathon building tech for Miami communities.</p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="block font-mono text-sm text-dim underline decoration-line-strong underline-offset-4 hover:text-signal">
                {contactEmail}
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <img src="/yci.png" alt="Young Coders Initiative" className="h-10 w-auto object-contain" />
            <div className="flex items-center gap-2 text-sm text-dim">
              <span>In partnership with</span>
              <img src="/bigred.png" alt="Big Red Education" className="h-8 w-auto rounded object-contain" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Young Coders Initiative</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={ARCHIVE_URL} target="_blank" rel="noreferrer" className="hover:text-signal">
              Spring 2026 archive &#8599;
            </a>
            <Link to="/ops" className="hover:text-dim">
              Operators
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
