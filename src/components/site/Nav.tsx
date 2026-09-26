import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";
import { useEvent } from "@/lib/api";
import { registrationLabel } from "@/lib/format";

const SECTIONS = [
  { href: "/#about", label: "About" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/#prizes", label: "Prizes" },
  { href: "/#faq", label: "FAQ" },
  { href: "/judges", label: "Judges" },
];

export const Nav = () => {
  const { data: event } = useEvent();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const status = event?.registration_status ?? "coming_soon";
  const registerLabel = status === "open" ? "Register" : status === "waitlist" ? "Join waitlist" : registrationLabel[status] ?? "Register";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {SECTIONS.map((s) => (
            <Link key={s.href} to={s.href} className="font-mono text-[12px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-ink">
              {s.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <ButtonLink to="/register" size="sm">
            {registerLabel}
          </ButtonLink>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-void px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <Link key={s.href} to={s.href} className="rounded-lg px-3 py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-dim hover:bg-rail hover:text-ink">
                {s.label}
              </Link>
            ))}
          </nav>
          <ButtonLink to="/register" className="mt-4 w-full">
            {registerLabel}
          </ButtonLink>
        </div>
      )}
    </header>
  );
};
