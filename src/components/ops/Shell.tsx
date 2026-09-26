import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Led } from "@/components/ui";
import { Logo } from "@/components/Logo";
import type { EventRow } from "@/lib/types";
import { registrationLabel } from "@/lib/format";

const NAV = [
  { to: "/ops/teams", label: "Teams" },
  { to: "/ops/check-in", label: "Check-in" },
  { to: "/ops/event", label: "Event" },
  { to: "/ops/content", label: "Content" },
  { to: "/ops/operators", label: "Operators" },
];

const REG_TONE: Record<string, "signal" | "pulse" | "warn" | "dim"> = {
  open: "signal",
  waitlist: "pulse",
  coming_soon: "warn",
  closed: "dim",
};

const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
  <>
    {NAV.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center rounded-lg px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors",
            isActive ? "bg-rail text-signal" : "text-dim hover:bg-rail hover:text-ink",
          )
        }
      >
        {item.label}
      </NavLink>
    ))}
  </>
);

/** Console shell: left rail nav (desktop) / top menu (mobile), top status bar, content outlet. */
export const Shell = ({ event, operatorEmail, onSignOut, children }: { event: EventRow | undefined; operatorEmail: string; onSignOut: () => void; children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-void">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-deck/95 px-4 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line-strong text-dim hover:text-ink lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Logo className="shrink-0" />
          <span className="hidden truncate font-mono text-[11px] uppercase tracking-[0.18em] text-dim sm:inline">
            <span className="text-faint">ops</span>
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {event && (
            <span className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim sm:inline-flex">
              <Led tone={REG_TONE[event.registration_status] ?? "dim"} pulse={event.registration_status === "open"} />
              {registrationLabel[event.registration_status]}
            </span>
          )}
          <span className="hidden max-w-[200px] truncate font-mono text-[11px] text-faint md:inline">{operatorEmail}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong text-dim transition-colors hover:border-alert/50 hover:text-alert"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="border-b border-line bg-deck px-3 py-2 lg:hidden" aria-label="Console navigation">
          <div className="flex flex-col gap-1">
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </div>
        </nav>
      )}

      <div className="mx-auto flex max-w-[1400px]">
        <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 flex-col gap-1 border-r border-line bg-deck p-3 lg:flex" aria-label="Console navigation">
          <NavLinks />
        </nav>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Shell;
