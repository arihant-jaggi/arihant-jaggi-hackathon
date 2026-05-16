import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useSupabaseList } from "@/hooks/useSupabaseList";

const Footer = () => {
  const { data: hackathonInfo = [] } = useSupabaseList<{ id: string; name: string }>(
    ["hackathon_info"],
    "hackathon_info",
    (query) => query.order("created_at", { ascending: true }).limit(1),
  );
  const hackathonName = hackathonInfo[0]?.name ?? "Young Coders Miami Impact Hackathon";

  return (
    <footer className="border-t bg-card">
      <div className="container py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight">
              <span className="text-gradient">{hackathonName}</span>
            </h3>
            <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed">
              Building technology solutions for real-world Miami community challenges.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Pages</h4>
            <div className="space-y-2">
              {["/problems", "/schedule", "/venue", "/judges"].map((p) => (
                <Link key={p} to={p} className="block text-sm font-light text-muted-foreground hover:text-primary transition-colors">
                  {p.slice(1).charAt(0).toUpperCase() + p.slice(2)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Participate</h4>
            <div className="space-y-2">
              <Link to="/register" className="block text-sm font-light text-muted-foreground hover:text-primary transition-colors">Register</Link>
              <Link to="/submit" className="block text-sm font-light text-muted-foreground hover:text-primary transition-colors">Submit Project</Link>
              <Link to="/faq" className="block text-sm font-light text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Connect</h4>
            <div className="flex gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors"><Github size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Linkedin size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Mail size={18} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 border-t pt-6 text-center text-xs font-light text-muted-foreground">
          © 2026 The Young Coders Miami Impact Hackathon. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
