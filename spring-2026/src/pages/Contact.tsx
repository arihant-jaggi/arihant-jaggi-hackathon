import { useState } from "react";
import { Mail, MapPin, Twitter, Linkedin, Instagram } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { toast } from "sonner";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import { supabase } from "@/lib/supabase";

type ContactDetail = {
  id: string;
  label: string;
  email?: string | null;
  phone?: string | null;
  platform?: string | null;
  url?: string | null;
  details?: string | null;
};

const platformIcons: Record<string, LucideIcon> = {
  email: Mail,
  location: MapPin,
  social: Mail,
};

const socialIcon = (label: string): LucideIcon => {
  switch (label.toLowerCase()) {
    case "instagram":
      return Instagram;
    case "linkedin":
      return Linkedin;
    case "twitter":
      return Twitter;
    default:
      return Mail;
  }
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: details = [] } = useSupabaseList<ContactDetail>(["contact_details"], "contact_details", (query) =>
    query.order("created_at", { ascending: true }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });

    if (error) {
      console.error("Contact submission failed", error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const generalContacts = details.filter((detail) => detail.platform !== "social");
  const socialContacts = details.filter((detail) => detail.platform === "social");

  return (
    <PageWrapper>
      <div className="container py-16 sm:py-24">
        <SectionHeading title="Contact Us" subtitle="Have a question? We'd love to hear from you." />
        <div className="grid gap-12 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="space-y-6">
            {generalContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Contact details are being configured. Please check back soon.</p>
            ) : (
              generalContacts.map((contact) => {
                const Icon = platformIcons[contact.platform ?? "email"] ?? Mail;
                const value = contact.email ?? contact.phone ?? contact.details;
                return (
                  <div key={contact.id} className="flex items-start gap-4">
                    <Icon size={18} className="text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{contact.label}</p>
                      {value && <p className="text-sm font-light text-muted-foreground">{value}</p>}
                      {contact.url && (
                        <a href={contact.url} target="_blank" rel="noreferrer" className="text-xs text-primary">
                          Open link
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {socialContacts.length > 0 ? (
              <div className="pt-4">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Follow Us</p>
                <div className="flex gap-4 text-muted-foreground">
                  {socialContacts.map((social) => {
                    const Icon = socialIcon(social.label);
                    return (
                      <a key={social.id} href={social.url ?? "#"} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                        <Icon size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : socialContacts.length === 0 && generalContacts.length === 0 ? null : (
              <p className="text-xs text-muted-foreground">Social channels will appear here soon.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="mt-1 w-full border bg-card px-4 py-3 text-sm font-light text-foreground outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;
