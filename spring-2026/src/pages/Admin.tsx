import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import {
  Droplets,
  Flame,
  Waves,
  Zap,
  Globe,
  Shield,
  type LucideIcon,
} from "lucide-react";

const sections = [
  { key: "info", label: "Hackathon Info" },
  { key: "challenges", label: "Manage Challenges" },
  { key: "examples", label: "Challenge Examples" },
  { key: "judging_criteria", label: "Judging Criteria" },
  { key: "schedule", label: "Event Schedule" },
  { key: "venues", label: "Venue Details" },
  { key: "faqs", label: "FAQ" },
  { key: "contacts", label: "Contact Details" },
  { key: "perks", label: "Perks & Highlights" },
  { key: "site_details", label: "Site Details" },
  { key: "contact_submissions", label: "Contact Submissions" },
  { key: "environments", label: "Environment Tracks" },
  { key: "judges", label: "Judges & Mentors" },
  { key: "skills", label: "Skills" },
  { key: "registrations", label: "Registration Entries" },
  { key: "submissions", label: "Submission Entries" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

type ChallengeForm = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  context: string;
  solutionIdeas: string;
  focusAreas: string;
  category: string;
  icon: string;
  isMain: boolean;
};

type ChallengeExampleForm = {
  id: string;
  challenge_id: string;
  title: string;
  description: string;
  link: string;
  sort_order: string;
};

type JudgingCriterionForm = {
  id: string;
  title: string;
  points: string;
  what_to_assess: string;
  sort_order: string;
};

type ScheduleForm = {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  location: string;
  highlight: string;
};

type VenueForm = {
  id: string;
  name: string;
  address: string;
  description: string;
  map_url: string;
  map_embed_url: string;
  amenities: string;
  parking_details: string;
  what_to_bring: string;
};

type FaqForm = { id: string; question: string; answer: string };
type ContactForm = { id: string; label: string; email: string; phone: string; platform: string; url: string; details: string };
type PerkForm = { id: string; title: string; description: string; icon: string };
type RegistrationRecord = {
  id: string;
  leader_name: string;
  leader_email: string;
  leader_phone?: string | null;
  organization?: string | null;
  team_name?: string | null;
  team_size: number;
  skills: string[] | null;
  problem_interest?: string | null;
  additional_member_emails: string[] | null;
  agree_rules: boolean;
  created_at: string;
};

type SubmissionRecord = {
  id: string;
  team_name?: string | null;
  project_title: string;
  problem_slug?: string | null;
  summary?: string | null;
  github?: string | null;
  demo?: string | null;
  created_at: string;
};

const initialChallenge: ChallengeForm = {
  id: "",
  title: "",
  slug: "",
  tagline: "",
  description: "",
  context: "",
  solutionIdeas: "",
  focusAreas: "",
  category: "",
  icon: "",
  isMain: false,
};

const initialChallengeExample: ChallengeExampleForm = {
  id: "",
  challenge_id: "",
  title: "",
  description: "",
  link: "",
  sort_order: "0",
};

const initialJudgingCriterion: JudgingCriterionForm = {
  id: "",
  title: "",
  points: "0",
  what_to_assess: "",
  sort_order: "0",
};

const initialSchedule: ScheduleForm = {
  id: "",
  title: "",
  description: "",
  start_at: "",
  end_at: "",
  location: "",
  highlight: "",
};

const initialVenue: VenueForm = {
  id: "",
  name: "",
  address: "",
  description: "",
  map_url: "",
  map_embed_url: "",
  amenities: "",
  parking_details: "",
  what_to_bring: "",
};

const initialFaq: FaqForm = { id: "", question: "", answer: "" };
const initialContact: ContactForm = { id: "", label: "", email: "", phone: "", platform: "", url: "", details: "" };
const initialPerk: PerkForm = { id: "", title: "", description: "", icon: "" };
const initialSiteDetail: SiteDetailForm = { id: "", label: "", value: "", icon: "" };
const initialContactSubmission: ContactSubmissionForm = { id: "", name: "", email: "", subject: "", message: "" };
const initialEnvironment: EnvironmentForm = { id: "", name: "", summary: "", description: "", tags: "", resources: "" };
const initialJudge: JudgeForm = { id: "", name: "", title: "", role: "", description: "", type: "" };

const iconOptions = ["Droplets", "Flame", "Waves", "Zap", "Globe", "Shield"] as const;
const iconMap: Record<(typeof iconOptions)[number], LucideIcon> = {
  Droplets,
  Flame,
  Waves,
  Zap,
  Globe,
  Shield,
};

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [section, setSection] = useState<SectionKey>("info");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const {
    data: hackathonInfo = [],
    refetch: refetchHackathonInfo,
  } = useSupabaseList<{
    id: string;
    name: string;
    subtitle?: string | null;
    description?: string | null;
    location?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    submission_start_date?: string | null;
    submission_end_date?: string | null;
  }>(["hackathon_info"], "hackathon_info", (query) => query.order("created_at", { ascending: true }).limit(1));

  const {
    data: challenges = [],
    refetch: refetchChallenges,
  } = useSupabaseList<{
    id: string;
    title: string;
    slug: string;
    is_main?: boolean | null;
    tagline?: string | null;
    description?: string | null;
    context?: string | null;
    solution_ideas?: string[] | null;
    focus_areas?: string[] | null;
    category?: string | null;
    icon?: string | null;
  }>(["challenges", "admin"], "challenges", (query) => query.order("created_at", { ascending: true }));

  const [exampleChallengeId, setExampleChallengeId] = useState<string>("");
  const {
    data: challengeExamples = [],
    refetch: refetchChallengeExamples,
  } = useSupabaseList<{
    id: string;
    challenge_id: string;
    title: string;
    description?: string | null;
    link?: string | null;
    sort_order?: number | null;
  }>(["challenge_examples", "admin", exampleChallengeId], "challenge_examples", (query) => {
    const scoped = exampleChallengeId ? query.eq("challenge_id", exampleChallengeId) : query;
    return scoped.order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  });

  const {
    data: judgingCriteria = [],
    refetch: refetchJudgingCriteria,
  } = useSupabaseList<{
    id: string;
    title: string;
    points: number;
    what_to_assess: string;
    sort_order?: number | null;
  }>(["judging_criteria", "admin"], "judging_criteria", (query) =>
    query.order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
  );

  const {
    data: schedule = [],
    refetch: refetchSchedule,
  } = useSupabaseList<{
    id: string;
    title: string;
    description?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    location?: string | null;
    highlight?: string | null;
  }>(["event_schedule", "admin"], "event_schedule", (query) => query.order("start_at", { ascending: true }));

  const {
    data: venues = [],
    refetch: refetchVenues,
  } = useSupabaseList<{
    id: string;
    name: string;
    address?: string | null;
    description?: string | null;
    map_url?: string | null;
    map_embed_url?: string | null;
    amenities?: string[] | null;
    parking_details?: string | null;
    what_to_bring?: string | null;
  }>(["venues", "admin"], "venues", (query) => query.order("created_at", { ascending: true }));

  const {
    data: faqs = [],
    refetch: refetchFaqs,
  } = useSupabaseList<{ id: string; question: string; answer: string }>(["faqs", "admin"], "faqs", (query) => query.order("created_at", { ascending: true }));

  const {
    data: contacts = [],
    refetch: refetchContacts,
  } = useSupabaseList<{
    id: string;
    label: string;
    email?: string | null;
    phone?: string | null;
    platform?: string | null;
    url?: string | null;
    details?: string | null;
  }>(["contact_details", "admin"], "contact_details", (query) => query.order("created_at", { ascending: true }));

  const {
    data: perks = [],
    refetch: refetchPerks,
  } = useSupabaseList<{ id: string; title: string; description: string; icon?: string | null }>(
    ["site_highlights", "admin"],
    "site_highlights",
    (query) => query.order("created_at", { ascending: true }),
  );
  const {
    data: registrations = [],
    refetch: refetchRegistrations,
  } = useSupabaseList<RegistrationRecord>(["registrations", "admin"], "registrations", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const {
    data: submissions = [],
    refetch: refetchSubmissions,
  } = useSupabaseList<SubmissionRecord>(["project_submissions", "admin"], "project_submissions", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const {
    data: contactSubmissions = [],
    refetch: refetchContactSubmissions,
  } = useSupabaseList<ContactSubmissionRecord>(["contact_submissions", "admin"], "contact_submissions", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const {
    data: environments = [],
    refetch: refetchEnvironments,
  } = useSupabaseList<EnvironmentRecord>(["environments", "admin"], "environments", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const {
    data: judges = [],
    refetch: refetchJudges,
  } = useSupabaseList<JudgeRecord>(["judges_mentors", "admin"], "judges_mentors", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const {
    data: siteDetails = [],
    refetch: refetchSiteDetails,
  } = useSupabaseList<SiteDetailRecord>(["site_details", "admin"], "site_details", (query) =>
    query.order("created_at", { ascending: true }),
  );
  const {
    data: skills = [],
    refetch: refetchSkills,
  } = useSupabaseList<SkillRecord>(["skills", "admin"], "skills", (query) => query.order("created_at", { ascending: true }));

  const [infoForm, setInfoForm] = useState({
    name: "",
    subtitle: "",
    description: "",
    location: "",
    registration_start_date: "",
    registration_end_date: "",
    submission_start_date: "",
    submission_end_date: "",
  });
  const [challengeForm, setChallengeForm] = useState(initialChallenge);
  const [editingChallengeId, setEditingChallengeId] = useState("");
  const [challengeExampleForm, setChallengeExampleForm] = useState(initialChallengeExample);
  const [editingChallengeExampleId, setEditingChallengeExampleId] = useState("");
  const [judgingCriterionForm, setJudgingCriterionForm] = useState(initialJudgingCriterion);
  const [editingJudgingCriterionId, setEditingJudgingCriterionId] = useState("");
  const [scheduleForm, setScheduleForm] = useState(initialSchedule);
  const [editingScheduleId, setEditingScheduleId] = useState("");
  const [venueForm, setVenueForm] = useState(initialVenue);
  const [editingVenueId, setEditingVenueId] = useState("");
  const [faqForm, setFaqForm] = useState(initialFaq);
  const [editingFaqId, setEditingFaqId] = useState("");
  const [contactForm, setContactForm] = useState(initialContact);
  const [editingContactId, setEditingContactId] = useState("");
  const [perkForm, setPerkForm] = useState(initialPerk);
  const [editingPerkId, setEditingPerkId] = useState("");
  const [siteDetailForm, setSiteDetailForm] = useState(initialSiteDetail);
  const [editingSiteDetailId, setEditingSiteDetailId] = useState("");
  const [contactSubmissionForm, setContactSubmissionForm] = useState(initialContactSubmission);
  const [editingContactSubmissionId, setEditingContactSubmissionId] = useState("");
  const [environmentForm, setEnvironmentForm] = useState(initialEnvironment);
  const [editingEnvironmentId, setEditingEnvironmentId] = useState("");
  const [judgeForm, setJudgeForm] = useState(initialJudge);
  const [editingJudgeId, setEditingJudgeId] = useState("");
  const [skillName, setSkillName] = useState("");

  const infoFormRef = useRef<HTMLDivElement | null>(null);
  const challengeFormRef = useRef<HTMLDivElement | null>(null);
  const scheduleFormRef = useRef<HTMLDivElement | null>(null);
  const venueFormRef = useRef<HTMLDivElement | null>(null);
  const faqFormRef = useRef<HTMLDivElement | null>(null);
  const contactFormRef = useRef<HTMLDivElement | null>(null);
  const perkFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, sesh) => setSession(sesh));
    return () => data?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (hackathonInfo[0]) {
      setInfoForm({
        name: hackathonInfo[0].name,
        subtitle: hackathonInfo[0].subtitle ?? "",
        description: hackathonInfo[0].description ?? "",
        location: hackathonInfo[0].location ?? "",
        registration_start_date: hackathonInfo[0].start_date ?? "",
        registration_end_date: hackathonInfo[0].end_date ?? "",
        submission_start_date: hackathonInfo[0].submission_start_date ?? "",
        submission_end_date: hackathonInfo[0].submission_end_date ?? "",
      });
    }
  }, [hackathonInfo]);

  useEffect(() => {
    if (editingChallengeId && !challenges.find((c) => c.id === editingChallengeId)) {
      setEditingChallengeId("");
      setChallengeForm(initialChallenge);
    }
  }, [editingChallengeId, challenges]);

  useEffect(() => {
    if (editingChallengeId) {
      challengeFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingChallengeId]);

  useEffect(() => {
    if (editingScheduleId) {
      scheduleFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingScheduleId]);

  useEffect(() => {
    if (editingVenueId) {
      venueFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingVenueId]);

  useEffect(() => {
    if (editingFaqId) {
      faqFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingFaqId]);

  useEffect(() => {
    if (editingContactId) {
      contactFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingContactId]);

  useEffect(() => {
    if (editingPerkId) {
      perkFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingPerkId]);

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error("Email and password are required.");
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setAuthLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const saveHackathonInfo = async () => {
    const payload = {
      name: infoForm.name.trim(),
      subtitle: infoForm.subtitle.trim() || null,
      description: infoForm.description.trim() || null,
      location: infoForm.location.trim() || null,
      start_date: infoForm.registration_start_date || null,
      end_date: infoForm.registration_end_date || null,
      submission_start_date: infoForm.submission_start_date || null,
      submission_end_date: infoForm.submission_end_date || null,
    };
    if (!payload.name) {
      toast.error("Name is required for hackathon info.");
      return;
    }
    if (hackathonInfo[0]) {
      const { error } = await supabase.from("hackathon_info").update(payload).eq("id", hackathonInfo[0].id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("hackathon_info").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success("Hackathon details saved.");
    refetchHackathonInfo();
  };

  const removeHackathonInfo = async () => {
    if (!hackathonInfo[0]) return;
    await supabase.from("hackathon_info").delete().eq("id", hackathonInfo[0].id);
    toast.success("Removed hackathon info.");
    refetchHackathonInfo();
    setInfoForm({
      name: "",
      subtitle: "",
      description: "",
      location: "",
      registration_start_date: "",
      registration_end_date: "",
      submission_start_date: "",
      submission_end_date: "",
    });
  };

  const unsetOtherMainChallenges = async (keepId: string) => {
    const { error } = await supabase
      .from("challenges")
      .update({ is_main: false })
      .eq("is_main", true)
      .neq("id", keepId);
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const setMainChallenge = async (id: string, makeMain: boolean) => {
    if (makeMain) {
      await unsetOtherMainChallenges(id);
    }
    const { error } = await supabase.from("challenges").update({ is_main: makeMain }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(makeMain ? "Marked as main challenge." : "Removed main highlight.");
    refetchChallenges();
  };

  const saveChallenge = async () => {
    if (!challengeForm.title || !challengeForm.slug) {
      toast.error("Title and slug are required.");
      return;
    }
    const payload = {
      title: challengeForm.title.trim(),
      slug: challengeForm.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      tagline: challengeForm.tagline.trim() || null,
      description: challengeForm.description.trim() || null,
      context: challengeForm.context.trim() || null,
      solution_ideas: challengeForm.solutionIdeas.split(",").map((ry) => ry.trim()).filter(Boolean),
      focus_areas: challengeForm.focusAreas.split(",").map((ry) => ry.trim()).filter(Boolean),
      category: challengeForm.category.trim() || null,
      icon: challengeForm.icon.trim() || null,
      is_main: challengeForm.isMain,
    };

    if (editingChallengeId) {
      if (challengeForm.isMain) {
        await unsetOtherMainChallenges(editingChallengeId);
      }
      const { error } = await supabase.from("challenges").update(payload).eq("id", editingChallengeId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Challenge updated.");
    } else {
      const { data, error } = await supabase.from("challenges").insert(payload).select("id").single();
      if (error || !data?.id) {
        toast.error(error.message);
        return;
      }
      if (challengeForm.isMain) {
        await unsetOtherMainChallenges(data.id);
      }
      toast.success("Challenge added.");
    }

    setChallengeForm(initialChallenge);
    setEditingChallengeId("");
    refetchChallenges();
  };

  const deleteChallenge = async (id: string) => {
    await supabase.from("challenges").delete().eq("id", id);
    toast.success("Challenge removed.");
    refetchChallenges();
  };

  const saveChallengeExample = async () => {
    if (!challengeExampleForm.challenge_id) {
      toast.error("Select a challenge first.");
      return;
    }
    if (!challengeExampleForm.title.trim()) {
      toast.error("Example title is required.");
      return;
    }
    const payload = {
      challenge_id: challengeExampleForm.challenge_id,
      title: challengeExampleForm.title.trim(),
      description: challengeExampleForm.description.trim() || null,
      link: challengeExampleForm.link.trim() || null,
      sort_order: Number.isFinite(Number(challengeExampleForm.sort_order)) ? Number(challengeExampleForm.sort_order) : 0,
    };

    if (editingChallengeExampleId) {
      const { error } = await supabase.from("challenge_examples").update(payload).eq("id", editingChallengeExampleId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Example updated.");
    } else {
      const { error } = await supabase.from("challenge_examples").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Example added.");
    }
    setChallengeExampleForm((prev) => ({ ...initialChallengeExample, challenge_id: prev.challenge_id }));
    setEditingChallengeExampleId("");
    refetchChallengeExamples();
  };

  const deleteChallengeExample = async (id: string) => {
    await supabase.from("challenge_examples").delete().eq("id", id);
    toast.success("Example removed.");
    refetchChallengeExamples();
  };

  const saveJudgingCriterion = async () => {
    if (!judgingCriterionForm.title.trim()) {
      toast.error("Criterion title is required.");
      return;
    }
    if (!judgingCriterionForm.what_to_assess.trim()) {
      toast.error("What to assess is required.");
      return;
    }
    const payload = {
      title: judgingCriterionForm.title.trim(),
      points: Number.isFinite(Number(judgingCriterionForm.points)) ? Number(judgingCriterionForm.points) : 0,
      what_to_assess: judgingCriterionForm.what_to_assess.trim(),
      sort_order: Number.isFinite(Number(judgingCriterionForm.sort_order)) ? Number(judgingCriterionForm.sort_order) : 0,
    };

    if (editingJudgingCriterionId) {
      const { error } = await supabase.from("judging_criteria").update(payload).eq("id", editingJudgingCriterionId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Criterion updated.");
    } else {
      const { error } = await supabase.from("judging_criteria").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Criterion added.");
    }

    setJudgingCriterionForm(initialJudgingCriterion);
    setEditingJudgingCriterionId("");
    refetchJudgingCriteria();
  };

  const deleteJudgingCriterion = async (id: string) => {
    await supabase.from("judging_criteria").delete().eq("id", id);
    toast.success("Criterion removed.");
    refetchJudgingCriteria();
  };

  const saveSchedule = async () => {
    if (!scheduleForm.title) {
      toast.error("Title is required.");
      return;
    }
    const payload = {
      title: scheduleForm.title.trim(),
      description: scheduleForm.description.trim() || null,
      start_at: scheduleForm.start_at ? new Date(scheduleForm.start_at).toISOString() : null,
      end_at: scheduleForm.end_at ? new Date(scheduleForm.end_at).toISOString() : null,
      location: scheduleForm.location.trim() || null,
      highlight: scheduleForm.highlight.trim() || null,
    };

    if (editingScheduleId) {
      const { error } = await supabase.from("event_schedule").update(payload).eq("id", editingScheduleId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Schedule entry updated.");
    } else {
      const { error } = await supabase.from("event_schedule").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Schedule entry added.");
    }

    setScheduleForm(initialSchedule);
    setEditingScheduleId("");
    refetchSchedule();
  };

  const deleteSchedule = async (id: string) => {
    await supabase.from("event_schedule").delete().eq("id", id);
    toast.success("Schedule entry removed.");
    refetchSchedule();
  };

  const saveVenue = async () => {
    if (!venueForm.name) {
      toast.error("Venue name is required.");
      return;
    }
    const payload = {
      name: venueForm.name.trim(),
      address: venueForm.address.trim() || null,
      description: venueForm.description.trim() || null,
      map_url: venueForm.map_url.trim() || null,
      map_embed_url: venueForm.map_embed_url.trim() || null,
      amenities: venueForm.amenities.split(",").map((i) => i.trim()).filter(Boolean),
      parking_details: venueForm.parking_details.trim() || null,
      what_to_bring: venueForm.what_to_bring.trim() || null,
    };

    if (editingVenueId) {
      const { error } = await supabase.from("venues").update(payload).eq("id", editingVenueId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Venue updated.");
    } else {
      const { error } = await supabase.from("venues").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Venue added.");
    }

    setVenueForm(initialVenue);
    setEditingVenueId("");
    refetchVenues();
  };

  const deleteVenue = async (id: string) => {
    await supabase.from("venues").delete().eq("id", id);
    toast.success("Venue removed.");
    refetchVenues();
  };

  const saveFaq = async () => {
    if (!faqForm.question || !faqForm.answer) {
      toast.error("Question and answer are required.");
      return;
    }
    const payload = {
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
    };

    if (editingFaqId) {
      const { error } = await supabase.from("faqs").update(payload).eq("id", editingFaqId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("FAQ updated.");
    } else {
      const { error } = await supabase.from("faqs").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("FAQ added.");
    }

    setFaqForm(initialFaq);
    setEditingFaqId("");
    refetchFaqs();
  };

  const deleteFaq = async (id: string) => {
    await supabase.from("faqs").delete().eq("id", id);
    toast.success("FAQ removed.");
    refetchFaqs();
  };

  const saveContact = async () => {
    if (!contactForm.label) {
      toast.error("Label is required.");
      return;
    }
    const payload = {
      label: contactForm.label.trim(),
      email: contactForm.email.trim() || null,
      phone: contactForm.phone.trim() || null,
      platform: contactForm.platform.trim() || null,
      url: contactForm.url.trim() || null,
      details: contactForm.details.trim() || null,
    };

    if (editingContactId) {
      const { error } = await supabase.from("contact_details").update(payload).eq("id", editingContactId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Contact updated.");
    } else {
      const { error } = await supabase.from("contact_details").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Contact added.");
    }

    setContactForm(initialContact);
    setEditingContactId("");
    refetchContacts();
  };

  const deleteContact = async (id: string) => {
    await supabase.from("contact_details").delete().eq("id", id);
    toast.success("Contact removed.");
    refetchContacts();
  };

  const savePerk = async () => {
    if (!perkForm.title || !perkForm.description) {
      toast.error("Title and description are required.");
      return;
    }
    const payload = {
      title: perkForm.title.trim(),
      description: perkForm.description.trim(),
      icon: perkForm.icon.trim() || null,
    };

    if (editingPerkId) {
      const { error } = await supabase.from("site_highlights").update(payload).eq("id", editingPerkId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Perk updated.");
    } else {
      const { error } = await supabase.from("site_highlights").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Perk added.");
    }

    setPerkForm(initialPerk);
    setEditingPerkId("");
    refetchPerks();
  };

  const deletePerk = async (id: string) => {
    await supabase.from("site_highlights").delete().eq("id", id);
    toast.success("Perk removed.");
    refetchPerks();
  };

  const saveSiteDetail = async () => {
    if (!siteDetailForm.label.trim() || !siteDetailForm.value.trim()) {
      toast.error("Label and value are required for site details.");
      return;
    }
    const payload = {
      label: siteDetailForm.label.trim(),
      value: siteDetailForm.value.trim(),
      icon: siteDetailForm.icon.trim() || null,
    };
    if (editingSiteDetailId) {
      const { error } = await supabase.from("site_details").update(payload).eq("id", editingSiteDetailId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Site detail updated.");
    } else {
      const { error } = await supabase.from("site_details").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Site detail added.");
    }
    setSiteDetailForm(initialSiteDetail);
    setEditingSiteDetailId("");
    refetchSiteDetails();
  };

  const deleteSiteDetail = async (id: string) => {
    await supabase.from("site_details").delete().eq("id", id);
    toast.success("Site detail removed.");
    refetchSiteDetails();
  };

  const saveContactSubmission = async () => {
    if (!contactSubmissionForm.name.trim() && !contactSubmissionForm.email.trim()) {
      toast.error("Provide at least a name or email.");
      return;
    }
    const payload = {
      name: contactSubmissionForm.name.trim() || null,
      email: contactSubmissionForm.email.trim() || null,
      subject: contactSubmissionForm.subject.trim() || null,
      message: contactSubmissionForm.message.trim() || null,
    };
    if (editingContactSubmissionId) {
      const { error } = await supabase.from("contact_submissions").update(payload).eq("id", editingContactSubmissionId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Message updated.");
    } else {
      const { error } = await supabase.from("contact_submissions").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Message added.");
    }
    setContactSubmissionForm(initialContactSubmission);
    setEditingContactSubmissionId("");
    refetchContactSubmissions();
  };

  const deleteContactSubmission = async (id: string) => {
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast.success("Removed message.");
    refetchContactSubmissions();
  };

  const saveEnvironment = async () => {
    if (!environmentForm.name.trim()) {
      toast.error("Environment name is required.");
      return;
    }
    const payload = {
      name: environmentForm.name.trim(),
      summary: environmentForm.summary.trim() || null,
      description: environmentForm.description.trim() || null,
      notable_tags: environmentForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      resources: environmentForm.resources.trim() || null,
    };
    if (editingEnvironmentId) {
      const { error } = await supabase.from("environments").update(payload).eq("id", editingEnvironmentId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Environment updated.");
    } else {
      const { error } = await supabase.from("environments").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Environment added.");
    }
    setEnvironmentForm(initialEnvironment);
    setEditingEnvironmentId("");
    refetchEnvironments();
  };

  const deleteEnvironment = async (id: string) => {
    await supabase.from("environments").delete().eq("id", id);
    toast.success("Environment removed.");
    refetchEnvironments();
  };

  const saveJudge = async () => {
    if (!judgeForm.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    const payload = {
      name: judgeForm.name.trim(),
      title: judgeForm.title.trim() || null,
      role: judgeForm.role.trim() || null,
      description: judgeForm.description.trim() || null,
      type: judgeForm.type.trim() || null,
    };
    if (editingJudgeId) {
      const { error } = await supabase.from("judges_mentors").update(payload).eq("id", editingJudgeId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Profile updated.");
    } else {
      const { error } = await supabase.from("judges_mentors").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Profile added.");
    }
    setJudgeForm(initialJudge);
    setEditingJudgeId("");
    refetchJudges();
  };

  const deleteJudge = async (id: string) => {
    await supabase.from("judges_mentors").delete().eq("id", id);
    toast.success("Profile removed.");
    refetchJudges();
  };

  const saveSkill = async () => {
    if (!skillName.trim()) {
      toast.error("Skill name is required.");
      return;
    }
    const { error } = await supabase.from("skills").insert({ name: skillName.trim() });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Skill added.");
    setSkillName("");
    refetchSkills();
  };

  const deleteSkill = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
    toast.success("Skill removed.");
    refetchSkills();
  };

  const renderChallenges = () => {
    const selectedIconName = iconOptions.includes(challengeForm.icon as (typeof iconOptions)[number])
      ? (challengeForm.icon as (typeof iconOptions)[number])
      : iconOptions[0];
    const SelectedIcon = iconMap[selectedIconName];

    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Add or edit problems people can solve during the hackathon.</p>
        <div ref={challengeFormRef} className="space-y-4 rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</label>
              <input value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Slug</label>
              <input value={challengeForm.slug} onChange={(e) => setChallengeForm({ ...challengeForm, slug: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Tagline</label>
              <input value={challengeForm.tagline} onChange={(e) => setChallengeForm({ ...challengeForm, tagline: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Category</label>
              <input value={challengeForm.category} onChange={(e) => setChallengeForm({ ...challengeForm, category: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 items-center">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Icon</label>
              <select
                value={selectedIconName}
                onChange={(e) => setChallengeForm({ ...challengeForm, icon: e.target.value })}
                className="mt-1 w-full border bg-background px-4 py-3"
              >
                {iconOptions.map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <SelectedIcon size={28} className="text-primary" />
              <span className="text-sm text-muted-foreground">Preview</span>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded border bg-card px-4 py-3">
            <input
              type="checkbox"
              checked={challengeForm.isMain}
              onChange={(e) => setChallengeForm({ ...challengeForm, isMain: e.target.checked })}
            />
            <span className="text-sm">Mark as Main / Highlighted challenge</span>
            <span className="text-xs text-muted-foreground">(only one should be main)</span>
          </label>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Context</label>
            <textarea value={challengeForm.context} onChange={(e) => setChallengeForm({ ...challengeForm, context: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Solution ideas (comma separated)</label>
              <textarea value={challengeForm.solutionIdeas} onChange={(e) => setChallengeForm({ ...challengeForm, solutionIdeas: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Focus areas (comma separated)</label>
              <textarea value={challengeForm.focusAreas} onChange={(e) => setChallengeForm({ ...challengeForm, focusAreas: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={saveChallenge} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
              {editingChallengeId ? "Save changes" : "Add challenge"}
            </button>
            {editingChallengeId && (
              <button type="button" onClick={() => { setEditingChallengeId(""); setChallengeForm(initialChallenge); }} className="text-sm text-muted-foreground">
                Cancel edit
              </button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="rounded-2xl border border-primary/10 bg-background/50 p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                  <strong className="text-base">{challenge.title}</strong>
                  <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={Boolean(challenge.is_main)}
                      onChange={(e) => setMainChallenge(challenge.id, e.target.checked)}
                    />
                    Main
                  </label>
                </div>
                <span className="text-xs font-mono text-muted-foreground">Slug: {challenge.slug}</span>
                <p className="text-sm text-muted-foreground">{challenge.tagline ?? challenge.description}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {(challenge.focus_areas ?? []).map((tag) => (
                  <span key={tag} className="rounded border px-2 py-1 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingChallengeId(challenge.id);
                    setChallengeForm({
                      id: challenge.id,
                      title: challenge.title,
                      slug: challenge.slug,
                      tagline: challenge.tagline ?? "",
                      description: challenge.description ?? "",
                      context: challenge.context ?? "",
                      solutionIdeas: (challenge.solution_ideas ?? []).join(", "),
                      focusAreas: (challenge.focus_areas ?? []).join(", "),
                      category: challenge.category ?? "",
                      icon: challenge.icon ?? "",
                      isMain: Boolean(challenge.is_main),
                    });
                  }}
                  className="text-sm text-primary"
                >
                  Edit
                </button>
                <button type="button" onClick={() => deleteChallenge(challenge.id)} className="text-sm text-destructive">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChallengeExamples = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage “Examples / Inspiration” cards displayed under the main challenge.</p>
      <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Challenge</label>
          <select
            value={exampleChallengeId}
            onChange={(e) => {
              const nextId = e.target.value;
              setExampleChallengeId(nextId);
              setChallengeExampleForm((prev) => ({ ...prev, challenge_id: nextId }));
              setEditingChallengeExampleId("");
            }}
            className="mt-1 w-full border bg-background px-4 py-3"
          >
            <option value="">Select a challenge…</option>
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</label>
            <input
              value={challengeExampleForm.title}
              onChange={(e) => setChallengeExampleForm({ ...challengeExampleForm, title: e.target.value })}
              className="mt-1 w-full border bg-background px-4 py-3"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Link (optional)</label>
            <input
              value={challengeExampleForm.link}
              onChange={(e) => setChallengeExampleForm({ ...challengeExampleForm, link: e.target.value })}
              className="mt-1 w-full border bg-background px-4 py-3"
              placeholder="https://…"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Sort order</label>
            <input
              value={challengeExampleForm.sort_order}
              onChange={(e) => setChallengeExampleForm({ ...challengeExampleForm, sort_order: e.target.value })}
              className="mt-1 w-full border bg-background px-4 py-3"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description (optional)</label>
            <input
              value={challengeExampleForm.description}
              onChange={(e) => setChallengeExampleForm({ ...challengeExampleForm, description: e.target.value })}
              className="mt-1 w-full border bg-background px-4 py-3"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={saveChallengeExample} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingChallengeExampleId ? "Save changes" : "Add example"}
          </button>
          {editingChallengeExampleId && (
            <button
              type="button"
              onClick={() => {
                setEditingChallengeExampleId("");
                setChallengeExampleForm((prev) => ({ ...initialChallengeExample, challenge_id: prev.challenge_id }));
              }}
              className="text-sm text-muted-foreground"
            >
              Cancel edit
            </button>
          )}
        </div>
      </div>
      {!exampleChallengeId ? (
        <p className="text-sm text-muted-foreground">Select a challenge to view and edit its examples.</p>
      ) : (
        <div className="space-y-3">
          {challengeExamples.length === 0 ? (
            <p className="text-sm text-muted-foreground">No examples yet.</p>
          ) : (
            challengeExamples.map((example) => (
              <div key={example.id} className="rounded border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <strong>{example.title}</strong>
                    {example.link && (
                      <p className="text-xs font-mono text-muted-foreground break-all">{example.link}</p>
                    )}
                    {example.description && <p className="text-sm text-muted-foreground">{example.description}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChallengeExampleId(example.id);
                        setChallengeExampleForm({
                          id: example.id,
                          challenge_id: example.challenge_id,
                          title: example.title,
                          description: example.description ?? "",
                          link: example.link ?? "",
                          sort_order: String(example.sort_order ?? 0),
                        });
                      }}
                      className="text-sm text-primary"
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteChallengeExample(example.id)} className="text-sm text-destructive">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs font-mono text-muted-foreground">Sort: {example.sort_order ?? 0}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderJudgingCriteria = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage the judging criteria shown on the public Judging Criteria page.</p>
      <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</label>
            <input
              value={judgingCriterionForm.title}
              onChange={(e) => setJudgingCriterionForm({ ...judgingCriterionForm, title: e.target.value })}
              className="mt-1 w-full border bg-background px-4 py-3"
            />
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Points</label>
              <input
                value={judgingCriterionForm.points}
                onChange={(e) => setJudgingCriterionForm({ ...judgingCriterionForm, points: e.target.value })}
                className="mt-1 w-full border bg-background px-4 py-3"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Sort order</label>
              <input
                value={judgingCriterionForm.sort_order}
                onChange={(e) => setJudgingCriterionForm({ ...judgingCriterionForm, sort_order: e.target.value })}
                className="mt-1 w-full border bg-background px-4 py-3"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">What to assess</label>
          <textarea
            value={judgingCriterionForm.what_to_assess}
            onChange={(e) => setJudgingCriterionForm({ ...judgingCriterionForm, what_to_assess: e.target.value })}
            rows={5}
            className="mt-1 w-full border bg-background px-4 py-3"
            placeholder={"Use new lines for bullet points.\nExample:\nLine 1\nLine 2\nLine 3"}
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={saveJudgingCriterion} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingJudgingCriterionId ? "Save changes" : "Add criterion"}
          </button>
          {editingJudgingCriterionId && (
            <button
              type="button"
              onClick={() => {
                setEditingJudgingCriterionId("");
                setJudgingCriterionForm(initialJudgingCriterion);
              }}
              className="text-sm text-muted-foreground"
            >
              Cancel edit
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {judgingCriteria.length === 0 ? (
          <p className="text-sm text-muted-foreground">No criteria yet.</p>
        ) : (
          judgingCriteria.map((criterion) => (
            <div key={criterion.id} className="rounded border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <strong>{criterion.title}</strong>
                  <p className="text-xs font-mono text-muted-foreground">
                    {criterion.points} pts · sort {criterion.sort_order ?? 0}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJudgingCriterionId(criterion.id);
                      setJudgingCriterionForm({
                        id: criterion.id,
                        title: criterion.title,
                        points: String(criterion.points ?? 0),
                        what_to_assess: criterion.what_to_assess ?? "",
                        sort_order: String(criterion.sort_order ?? 0),
                      });
                    }}
                    className="text-sm text-primary"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteJudgingCriterion(criterion.id)} className="text-sm text-destructive">
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{criterion.what_to_assess}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Keep the schedule up to date so participants know what to expect.</p>
      <div ref={scheduleFormRef} className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</label>
            <input value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Location</label>
            <input value={scheduleForm.location} onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={scheduleForm.description} onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={scheduleForm.start_at} onChange={(e) => setScheduleForm({ ...scheduleForm, start_at: e.target.value })} type="datetime-local" className="mt-1 w-full border bg-background px-4 py-3" />
          <input value={scheduleForm.end_at} onChange={(e) => setScheduleForm({ ...scheduleForm, end_at: e.target.value })} type="datetime-local" className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Highlight</label>
          <input value={scheduleForm.highlight} onChange={(e) => setScheduleForm({ ...scheduleForm, highlight: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" placeholder="Optional speaker or highlight" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={saveSchedule} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingScheduleId ? "Update entry" : "Add entry"}
          </button>
          {editingScheduleId && (
            <button type="button" onClick={() => { setEditingScheduleId(""); setScheduleForm(initialSchedule); }} className="text-sm text-muted-foreground">
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {schedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedule entries yet.</p>
        ) : (
          schedule.map((entry) => (
            <div key={entry.id} className="rounded border bg-card p-4">
              <div className="flex items-center justify-between">
                <strong>{entry.title}</strong>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingScheduleId(entry.id); setScheduleForm({
                    id: entry.id,
                    title: entry.title,
                    description: entry.description ?? "",
                    start_at: entry.start_at ? entry.start_at.slice(0, 16) : "",
                    end_at: entry.end_at ? entry.end_at.slice(0, 16) : "",
                    location: entry.location ?? "",
                    highlight: entry.highlight ?? "",
                  }); }} className="text-primary">
                    Edit
                  </button>
                  <button onClick={() => deleteSchedule(entry.id)} className="text-destructive">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage venues that appear on the public site.</p>
      <div ref={venueFormRef} className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
            <input value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Address</label>
            <input value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={venueForm.map_url} onChange={(e) => setVenueForm({ ...venueForm, map_url: e.target.value })} placeholder="Map link" className="mt-1 w-full border bg-background px-4 py-3" />
          <input value={venueForm.map_embed_url} onChange={(e) => setVenueForm({ ...venueForm, map_embed_url: e.target.value })} placeholder="Embed URL" className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Amenities (comma separated)</label>
          <input value={venueForm.amenities} onChange={(e) => setVenueForm({ ...venueForm, amenities: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={venueForm.parking_details} onChange={(e) => setVenueForm({ ...venueForm, parking_details: e.target.value })} placeholder="Parking details" className="mt-1 w-full border bg-background px-4 py-3" />
          <input value={venueForm.what_to_bring} onChange={(e) => setVenueForm({ ...venueForm, what_to_bring: e.target.value })} placeholder="What to bring" className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={saveVenue} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingVenueId ? "Update" : "Add"}
          </button>
          {editingVenueId && (
            <button type="button" onClick={() => { setEditingVenueId(""); setVenueForm(initialVenue); }} className="text-sm text-muted-foreground">
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {venues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No venues configured yet.</p>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="rounded border bg-card p-4">
              <div className="flex items-center justify-between">
                <strong>{venue.name}</strong>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingVenueId(venue.id); setVenueForm({
                    id: venue.id,
                    name: venue.name,
                    address: venue.address ?? "",
                    description: venue.description ?? "",
                    map_url: venue.map_url ?? "",
                    map_embed_url: venue.map_embed_url ?? "",
                    amenities: (venue.amenities ?? []).join(", "),
                    parking_details: venue.parking_details ?? "",
                    what_to_bring: venue.what_to_bring ?? "",
                  }); }} className="text-primary">
                    Edit
                  </button>
                  <button onClick={() => deleteVenue(venue.id)} className="text-destructive">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{venue.address}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFaqs = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Answer participant questions.</p>
      <div ref={faqFormRef} className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Question</label>
          <input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Answer</label>
          <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={saveFaq} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingFaqId ? "Update" : "Add"}
          </button>
          {editingFaqId && (
            <button type="button" onClick={() => { setEditingFaqId(""); setFaqForm(initialFaq); }} className="text-sm text-muted-foreground">
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No FAQs yet.</p>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="rounded border bg-card p-4">
              <div className="flex items-center justify-between">
                <strong>{faq.question}</strong>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingFaqId(faq.id); setFaqForm({ id: faq.id, question: faq.question, answer: faq.answer }); }} className="text-primary">
                    Edit
                  </button>
                  <button onClick={() => deleteFaq(faq.id)} className="text-destructive">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Configure the contact card that appears on the site.</p>
      <div ref={contactFormRef} className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Label</label>
            <input value={contactForm.label} onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Platform</label>
            <input value={contactForm.platform} onChange={(e) => setContactForm({ ...contactForm, platform: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} type="email" placeholder="Email" className="mt-1 w-full border bg-background px-4 py-3" />
          <input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="Phone" className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">URL</label>
          <input value={contactForm.url} onChange={(e) => setContactForm({ ...contactForm, url: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Details</label>
          <textarea value={contactForm.details} onChange={(e) => setContactForm({ ...contactForm, details: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={saveContact} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingContactId ? "Update" : "Add"}
          </button>
          {editingContactId && (
            <button type="button" onClick={() => { setEditingContactId(""); setContactForm(initialContact); }} className="text-sm text-muted-foreground">
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contact records yet.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="rounded border bg-card p-4">
              <div className="flex items-center justify-between">
                <strong>{contact.label}</strong>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingContactId(contact.id); setContactForm({
                    id: contact.id,
                    label: contact.label,
                    email: contact.email ?? "",
                    phone: contact.phone ?? "",
                    platform: contact.platform ?? "",
                    url: contact.url ?? "",
                    details: contact.details ?? "",
                  }); }} className="text-primary">
                    Edit
                  </button>
                  <button onClick={() => deleteContact(contact.id)} className="text-destructive">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{contact.email ?? contact.platform ?? contact.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPerks = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Highlight perks, network opportunities, and impact statements.</p>
      <div ref={perkFormRef} className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</label>
          <input value={perkForm.title} onChange={(e) => setPerkForm({ ...perkForm, title: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={perkForm.description} onChange={(e) => setPerkForm({ ...perkForm, description: e.target.value })} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Icon</label>
          <input value={perkForm.icon} onChange={(e) => setPerkForm({ ...perkForm, icon: e.target.value })} className="mt-1 w-full border bg-background px-4 py-3" placeholder="Lucide icon name" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={savePerk} className="bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {editingPerkId ? "Update" : "Add"}
          </button>
          {editingPerkId && (
            <button type="button" onClick={() => { setEditingPerkId(""); setPerkForm(initialPerk); }} className="text-sm text-muted-foreground">
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {perks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No perks yet.</p>
        ) : (
          perks.map((perk) => (
            <div key={perk.id} className="rounded border bg-card p-4">
              <div className="flex items-center justify-between">
                <strong>{perk.title}</strong>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingPerkId(perk.id); setPerkForm({ id: perk.id, title: perk.title, description: perk.description, icon: perk.icon ?? "" }); }} className="text-primary">
                    Edit
                  </button>
                  <button onClick={() => deletePerk(perk.id)} className="text-destructive">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{perk.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-background/80 p-4 shadow-lg shadow-primary/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Registrations</p>
            <p className="text-sm text-muted-foreground">
              {registrations.length} {registrations.length === 1 ? "entry" : "entries"} recorded.
            </p>
          </div>
          <button
            type="button"
            onClick={refetchRegistrations}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            Refresh
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Review every leader contact, team composition, and consent recorded through the registration form.
        </p>
      </div>
      {registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-card/60 p-6 text-sm text-muted-foreground">
          No registrations yet.
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div key={registration.id} className="space-y-3 rounded-2xl border border-primary/10 bg-card/70 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{registration.team_name ?? "Team without name"}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Leader: {registration.leader_name}</p>
                </div>
                <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                  {registration.team_size} member{registration.team_size === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Leader email</p>
                  <p className="font-medium text-foreground">{registration.leader_email}</p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{registration.leader_phone ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Organization</p>
                  <p className="font-medium text-foreground">{registration.organization ?? "Independent"}</p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Problem interest</p>
                  <p className="font-medium text-foreground">{registration.problem_interest ?? "Any"}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Skills</p>
                  <p className="text-sm text-foreground">
                    {(registration.skills ?? []).length === 0 ? "None listed" : registration.skills.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Additional members</p>
                  <p className="text-sm text-foreground">
                    {(registration.additional_member_emails ?? []).length === 0
                      ? "None"
                      : registration.additional_member_emails.join(", ")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted at {new Date(registration.created_at).toLocaleString()} · Agreed to rules: {registration.agree_rules ? "Yes" : "No"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

const renderSiteDetails = () => (
  <div className="space-y-6">
    <p className="text-sm text-muted-foreground">Manage the site detail cards that appear on the landing page.</p>
    <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Label</label>
          <input value={siteDetailForm.label} onChange={(e) => setSiteDetailForm((f) => ({ ...f, label: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Value</label>
          <input value={siteDetailForm.value} onChange={(e) => setSiteDetailForm((f) => ({ ...f, value: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Icon</label>
          <input value={siteDetailForm.icon} onChange={(e) => setSiteDetailForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Optional icon name" className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={saveSiteDetail} className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {editingSiteDetailId ? "Save" : "Add detail"}
        </button>
        {editingSiteDetailId && (
          <button type="button" onClick={() => { setEditingSiteDetailId(""); setSiteDetailForm(initialSiteDetail); }} className="text-sm text-muted-foreground">
            Cancel
          </button>
        )}
      </div>
    </div>
    <div className="space-y-3">
      {siteDetails.map((detail) => (
        <div key={detail.id} className="rounded-2xl border border-primary/10 bg-card/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{detail.label}</p>
              <p className="text-xs text-muted-foreground">{detail.value}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  setEditingSiteDetailId(detail.id);
                  setSiteDetailForm({ id: detail.id, label: detail.label, value: detail.value, icon: detail.icon ?? "" });
                }}
                className="text-primary"
              >
                Edit
              </button>
              <button onClick={() => deleteSiteDetail(detail.id)} className="text-destructive">Delete</button>
            </div>
          </div>
          {detail.icon && (
            <span className="mt-2 inline-flex rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
              {detail.icon}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const renderContactSubmissions = () => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Contact submissions</p>
          <p className="text-sm text-muted-foreground">{contactSubmissions.length} messages.</p>
        </div>
        <button type="button" onClick={refetchContactSubmissions} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary">Refresh</button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
          <input
            value={contactSubmissionForm.name}
            onChange={(e) => setContactSubmissionForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full border bg-background px-4 py-3"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email</label>
          <input
            value={contactSubmissionForm.email}
            onChange={(e) => setContactSubmissionForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full border bg-background px-4 py-3"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subject</label>
          <input
            value={contactSubmissionForm.subject}
            onChange={(e) => setContactSubmissionForm((f) => ({ ...f, subject: e.target.value }))}
            className="mt-1 w-full border bg-background px-4 py-3"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Message</label>
        <textarea
          value={contactSubmissionForm.message}
          onChange={(e) => setContactSubmissionForm((f) => ({ ...f, message: e.target.value }))}
          rows={2}
          className="mt-1 w-full border bg-background px-4 py-3"
        />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={saveContactSubmission} className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {editingContactSubmissionId ? "Save" : "Add entry"}
        </button>
        {editingContactSubmissionId && (
          <button type="button" onClick={() => { setEditingContactSubmissionId(""); setContactSubmissionForm(initialContactSubmission); }} className="text-sm text-muted-foreground">
            Cancel
          </button>
        )}
      </div>
    </div>
    {contactSubmissions.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-primary/40 bg-card/60 p-6 text-sm text-muted-foreground">No messages yet.</div>
    ) : (
      <div className="space-y-4">
        {contactSubmissions.map((submission) => (
          <div key={submission.id} className="rounded-2xl border border-primary/10 bg-card/70 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{submission.subject ?? "Contact request"}</p>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => {
                    setEditingContactSubmissionId(submission.id);
                    setContactSubmissionForm({
                      id: submission.id,
                      name: submission.name ?? "",
                      email: submission.email ?? "",
                      subject: submission.subject ?? "",
                      message: submission.message ?? "",
                    });
                  }}
                  className="text-primary"
                >
                  Edit
                </button>
                <button onClick={() => deleteContactSubmission(submission.id)} className="text-destructive">Delete</button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">From: {submission.name ?? "Anonymous"} · {submission.email ?? "Email missing"}</p>
            <p className="mt-3 text-sm text-foreground">{submission.message ?? "No message"}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const renderEnvironments = () => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-dashed border-primary/30 bg-card/50 px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground">
      This section feeds the “Why Participate” callouts and hero highlights visible to every visitor.
    </div>
    <p className="text-sm text-muted-foreground">Create, update, or remove environment tracks stored in the database.</p>
    <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
          <input value={environmentForm.name} onChange={(e) => setEnvironmentForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Summary</label>
          <input value={environmentForm.summary} onChange={(e) => setEnvironmentForm((f) => ({ ...f, summary: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={environmentForm.description} onChange={(e) => setEnvironmentForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Notable tags</label>
          <input value={environmentForm.tags} onChange={(e) => setEnvironmentForm((f) => ({ ...f, tags: e.target.value }))} placeholder="comma separated" className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Resources</label>
          <input value={environmentForm.resources} onChange={(e) => setEnvironmentForm((f) => ({ ...f, resources: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={saveEnvironment} className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {editingEnvironmentId ? "Save track" : "Add track"}
        </button>
        {editingEnvironmentId && (
          <button type="button" onClick={() => { setEditingEnvironmentId(""); setEnvironmentForm(initialEnvironment); }} className="text-sm text-muted-foreground">
            Cancel
          </button>
        )}
      </div>
    </div>
    <div className="space-y-4">
      {environments.map((env) => (
        <div key={env.id} className="rounded-2xl border border-primary/10 bg-card/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{env.name}</p>
              <p className="text-xs text-muted-foreground">{env.summary ?? env.description ?? "No description"}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  setEditingEnvironmentId(env.id);
                  setEnvironmentForm({
                    id: env.id,
                    name: env.name,
                    summary: env.summary ?? "",
                    description: env.description ?? "",
                    tags: (env.notable_tags ?? []).join(", "),
                    resources: env.resources ?? "",
                  });
                }}
                className="text-primary"
              >
                Edit
              </button>
              <button onClick={() => deleteEnvironment(env.id)} className="text-destructive">
                Delete
              </button>
            </div>
          </div>
          {env.notable_tags && env.notable_tags.length > 0 && (
            <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{env.notable_tags.join(", ")}</p>
          )}
          {env.resources && (
            <p className="mt-1 text-xs text-muted-foreground">Resources: {env.resources}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const renderJudges = () => (
  <div className="space-y-6">
    <p className="text-sm text-muted-foreground">Add or edit judge and mentor profiles that appear on the site.</p>
    <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
          <input value={judgeForm.name} onChange={(e) => setJudgeForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Title</label>
          <input value={judgeForm.title} onChange={(e) => setJudgeForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Role</label>
          <input value={judgeForm.role} onChange={(e) => setJudgeForm((f) => ({ ...f, role: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Type</label>
          <input value={judgeForm.type} onChange={(e) => setJudgeForm((f) => ({ ...f, type: e.target.value }))} className="mt-1 w-full border bg-background px-4 py-3" />
        </div>
      </div>
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
        <textarea value={judgeForm.description} onChange={(e) => setJudgeForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="mt-1 w-full border bg-background px-4 py-3" />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={saveJudge} className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {editingJudgeId ? "Save profile" : "Add profile"}
        </button>
        {editingJudgeId && (
          <button type="button" onClick={() => { setEditingJudgeId(""); setJudgeForm(initialJudge); }} className="text-sm text-muted-foreground">
            Cancel
          </button>
        )}
      </div>
    </div>
    <div className="space-y-4">
      {judges.map((person) => (
        <div key={person.id} className="rounded-2xl border border-primary/10 bg-card/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{person.name}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{person.title ?? person.role ?? "Role TBD"}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  setEditingJudgeId(person.id);
                  setJudgeForm({
                    id: person.id,
                    name: person.name,
                    title: person.title ?? "",
                    role: person.role ?? "",
                    description: person.description ?? "",
                    type: person.type ?? "",
                  });
                }}
                className="text-primary"
              >
                Edit
              </button>
              <button onClick={() => deleteJudge(person.id)} className="text-destructive">Delete</button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{person.description ?? "No bio provided."}</p>
        </div>
      ))}
    </div>
  </div>
);

const renderSkills = () => (
  <div className="space-y-6">
    <p className="text-sm text-muted-foreground">Add or remove skill tags used on the registration form.</p>
    <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-lg shadow-primary/5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Skills ({skills.length})</p>
        </div>
        <button type="button" onClick={refetchSkills} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary">Refresh</button>
      </div>
      <div className="flex gap-3">
        <input
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="New skill"
          className="w-full border bg-background px-4 py-3 text-sm"
        />
        <button type="button" onClick={saveSkill} className="bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          Add
        </button>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <div key={skill.id} className="rounded-2xl border border-primary/10 bg-card/60 px-4 py-3 text-sm font-semibold text-foreground shadow-sm flex items-center justify-between">
          {skill.name}
          <button onClick={() => deleteSkill(skill.id)} className="text-destructive text-xs">Delete</button>
        </div>
      ))}
    </div>
  </div>
);

  const renderSubmissions = () => {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-background/80 p-4 shadow-lg shadow-primary/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">Project submissions</p>
              <p className="text-sm text-muted-foreground">
                {submissions.length} {submissions.length === 1 ? "entry" : "entries"} logged.
              </p>
            </div>
            <button
              type="button"
              onClick={refetchSubmissions}
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              Refresh
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Browse the submissions form data, including GitHub/demo URLs and the challenge slug they picked.
          </p>
        </div>
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-card/60 p-6 text-sm text-muted-foreground">
            No projects submitted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="space-y-3 rounded-2xl border border-primary/10 bg-card/70 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{submission.project_title}</p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Team: {submission.team_name ?? "TBD"}</p>
                  </div>
                  <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                    {submission.problem_slug ?? "No slug"}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Summary</p>
                    <p className="text-sm text-foreground">{submission.summary ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Links</p>
                    <p className="text-sm text-foreground flex flex-wrap gap-2">
                      {submission.github ? (
                        <a
                          href={submission.github.startsWith("http") ? submission.github : `https://${submission.github.replace(/^https?:\/\//, "")}`}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      ) : (
                        "GitHub N/A"
                      )}
                      {submission.demo && submission.github ? <span className="text-muted-foreground">·</span> : null}
                      {submission.demo ? (
                        <a
                          href={submission.demo.startsWith("http") ? submission.demo : `https://${submission.demo.replace(/^https?:\/\//, "")}`}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Demo
                        </a>
                      ) : (
                        submission.github ? null : "Demo N/A"
                      )}
                      {submission.presentation_link && (
                        <a
                          href={submission.presentation_link.startsWith("http") ? submission.presentation_link : `https://${submission.presentation_link.replace(/^https?:\/\//, "")}`}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Presentation
                        </a>
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted at {new Date(submission.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sectionContent = () => {
    switch (section) {
      case "info":
        return (
          <div ref={infoFormRef} className="space-y-6 rounded-2xl border border-primary/20 bg-background/80 p-5 shadow-lg shadow-primary/5">
            <p className="text-sm text-muted-foreground">Update the core hackathon metadata stored in the database.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
                <input value={infoForm.name} onChange={(e) => setInfoForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full border bg-card px-4 py-3" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subtitle</label>
                <input value={infoForm.subtitle} onChange={(e) => setInfoForm((f) => ({ ...f, subtitle: e.target.value }))} className="mt-1 w-full border bg-card px-4 py-3" />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea value={infoForm.description} onChange={(e) => setInfoForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full border bg-card px-4 py-3" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Location</label>
                <input value={infoForm.location} onChange={(e) => setInfoForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 w-full border bg-card px-4 py-3" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Registration window</label>
                <div className="flex gap-2">
                  <input
                    value={infoForm.registration_start_date}
                    onChange={(e) => setInfoForm((f) => ({ ...f, registration_start_date: e.target.value }))}
                    type="date"
                    className="mt-1 w-full border bg-card px-4 py-3"
                    aria-label="Registration start date"
                  />
                  <input
                    value={infoForm.registration_end_date}
                    onChange={(e) => setInfoForm((f) => ({ ...f, registration_end_date: e.target.value }))}
                    type="date"
                    className="mt-1 w-full border bg-card px-4 py-3"
                    aria-label="Registration end date"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Submission form opens</label>
                <input
                  value={infoForm.submission_start_date}
                  onChange={(e) => setInfoForm((f) => ({ ...f, submission_start_date: e.target.value }))}
                  type="date"
                  className="mt-1 w-full border bg-card px-4 py-3"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Submission form closes</label>
                <input
                  value={infoForm.submission_end_date}
                  onChange={(e) => setInfoForm((f) => ({ ...f, submission_end_date: e.target.value }))}
                  type="date"
                  className="mt-1 w-full border bg-card px-4 py-3"
                />
              </div>
            </div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              These date windows are used by the site to show registration, submission, or waiting room messages.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={saveHackathonInfo} className="bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Save</button>
              {hackathonInfo[0] && (
                <button type="button" onClick={removeHackathonInfo} className="text-sm text-destructive underline">Remove</button>
              )}
            </div>
          </div>
        );
      case "challenges":
        return renderChallenges();
      case "examples":
        return renderChallengeExamples();
      case "judging_criteria":
        return renderJudgingCriteria();
      case "schedule":
        return renderSchedule();
      case "venues":
        return renderVenues();
      case "faqs":
        return renderFaqs();
      case "contacts":
        return renderContacts();
      case "perks":
        return renderPerks();
      case "site_details":
        return renderSiteDetails();
      case "contact_submissions":
        return renderContactSubmissions();
      case "environments":
        return renderEnvironments();
      case "judges":
        return renderJudges();
      case "skills":
        return renderSkills();
      case "registrations":
        return renderRegistrations();
      case "submissions":
        return renderSubmissions();
      default:
        return null;
    }
  };

  if (!session) {
    return (
      <PageWrapper className="font-admin">
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="w-full max-w-md space-y-6 rounded border bg-card p-8">
            <SectionHeading title="Admin Login" subtitle="Authenticate to manage site content." />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email</label>
                <input value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} type="email" className="mt-1 w-full border bg-background px-4 py-3" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Password</label>
                <input value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} type="password" className="mt-1 w-full border bg-background px-4 py-3" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
                {authLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="font-admin">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <aside className="space-y-5 rounded-2xl border border-primary/10 bg-card/80 p-5 shadow-lg shadow-primary/20">
            <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Admin Panel</p>
            <div className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className={`block w-full rounded-lg border px-4 py-2 text-left text-sm font-semibold transition ${
                    section === s.key
                      ? "border-primary bg-primary/10 text-primary shadow-inner shadow-primary/20"
                      : "border-transparent text-muted-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="w-full rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
            Sign out
          </button>
        </aside>
        <section className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-6 shadow-2xl shadow-primary/20">
            <p className="text-xs font-mono uppercase tracking-widest text-primary/70">Admin Panel</p>
            <h1 className="mt-2 text-2xl font-semibold text-primary">Manage hackathon content directly from this dashboard.</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose a section from the sidebar to add, edit, or delete records without touching the database manually.</p>
          </div>
          {sectionContent()}
        </section>
      </div>
    </div>
  </PageWrapper>
  );
};

export default Admin;
type ContactSubmissionRecord = {
  id: string;
  name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  created_at: string;
};
type EnvironmentRecord = {
  id: string;
  name: string;
  summary?: string | null;
  description?: string | null;
  notable_tags?: string[] | null;
  resources?: string | null;
};
type JudgeRecord = {
  id: string;
  name: string;
  title?: string | null;
  role?: string | null;
  description?: string | null;
  type?: string | null;
};
type SiteDetailRecord = {
  id: string;
  label: string;
  value: string;
  icon?: string | null;
};
type SkillRecord = {
  id: string;
  name: string;
};

type SiteDetailForm = { id: string; label: string; value: string; icon: string };
type ContactSubmissionForm = { id: string; name: string; email: string; subject: string; message: string };
type EnvironmentForm = { id: string; name: string; summary: string; description: string; tags: string; resources: string };
type JudgeForm = { id: string; name: string; title: string; role: string; description: string; type: string };
