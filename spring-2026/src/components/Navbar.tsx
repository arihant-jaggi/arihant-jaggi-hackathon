import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import { getWindowStatus, parseDateField, formatFriendlyDate } from "@/lib/hackathonStatus";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: hackathonInfo = [] } = useSupabaseList<{
    id: string;
    name: string;
    start_date?: string | null;
    end_date?: string | null;
    registration_start_date?: string | null;
    registration_end_date?: string | null;
    submission_start_date?: string | null;
    submission_end_date?: string | null;
  }>(
    ["hackathon_info"],
    "hackathon_info",
    (query) => query.order("created_at", { ascending: false }).limit(1),
  );
  const hackathonName = hackathonInfo[0]?.name ?? "Young Coders Miami Impact Hackathon";
  const registrationStart = parseDateField(hackathonInfo[0]?.registration_start_date ?? hackathonInfo[0]?.start_date);
  const registrationEnd = parseDateField(hackathonInfo[0]?.registration_end_date ?? hackathonInfo[0]?.end_date);
  const submissionStart = parseDateField(hackathonInfo[0]?.submission_start_date ?? hackathonInfo[0]?.start_date);
  const submissionEnd = parseDateField(hackathonInfo[0]?.submission_end_date ?? hackathonInfo[0]?.end_date);
  const registrationWindow = getWindowStatus(registrationStart, registrationEnd);
  const submissionWindow = getWindowStatus(submissionStart, submissionEnd);
  const showRegisterCTA = registrationWindow.status !== "missing" && registrationWindow.status !== "closed";
  const showSubmitCTA = submissionWindow.status !== "missing" && submissionWindow.status !== "closed";
  const registerLabel = registrationWindow.status === "upcoming" ? "Register (opens soon)" : "Register";
  const registerTitle =
    registrationWindow.status === "upcoming"
      ? `Opens ${formatFriendlyDate(registrationWindow.start)}`
      : registrationWindow.status === "closed"
      ? "Registration closed"
      : "Register now";
  const submitLabel = submissionWindow.status === "upcoming" ? "Submit (opens soon)" : "Submit";
  const submitTitle =
    submissionWindow.status === "upcoming"
      ? `Opens ${formatFriendlyDate(submissionWindow.start)}`
      : submissionWindow.status === "closed"
      ? "Submission closed"
      : "Submit your project";
  const staticLinks = [
    { to: "/", label: "Home" },
    { to: "/problems", label: "Challenges" },
    { to: "/schedule", label: "Schedule" },
    { to: "/venue", label: "Venue" },
    { to: "/judges", label: "Judges" },
    { to: "/judging-criteria", label: "Judging Criteria" },
  ];
  const navLinks = [
    ...staticLinks,
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
    { to: "/admin", label: "Admin" },
  ] as { to: string; label: string }[];

  return (
    // top-9 offsets the navbar below the fixed 36px ArchiveBanner (see App.tsx).
    <nav className="fixed top-9 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-lg sm:text-xl font-semibold tracking-tight">
          <span className="text-gradient">{hackathonName}</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 text-sm font-light tracking-wide transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          {showSubmitCTA && (
            <Link
              to="/submit"
              title={submitTitle}
              className="ml-2 rounded-full border border-primary/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/80"
            >
              {submitLabel}
            </Link>
          )}
          {showRegisterCTA && (
            <Link
              to="/register"
              title={registerTitle}
              className="ml-2 bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {registerLabel}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
          {open && (
            <div className="md:hidden border-t bg-background px-6 pb-6 pt-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm font-light tracking-wide ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {showSubmitCTA && (
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-full border border-primary/60 px-5 py-2 text-center text-sm font-medium text-foreground"
            >
              {submitLabel}
            </Link>
          )}
          {showRegisterCTA && (
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-3 block bg-primary px-5 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              {registerLabel}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
