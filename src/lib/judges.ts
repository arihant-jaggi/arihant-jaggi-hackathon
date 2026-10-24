// Judging panel. Bios are one-liners from each judge's LinkedIn profile.
export interface Judge {
  name: string;
  title?: string;
  bio?: string;
  linkedin?: string;
}

export const JUDGES: Judge[] = [
  {
    name: "Willie Avendano",
    title: "Co-founder, 01",
    bio: "Co-founder of 01, a Miami education prototyping lab for virtual, mixed and augmented reality, and co-founder of Wynwood Maker Camp.",
    linkedin: "https://www.linkedin.com/in/willieavendano/",
  },
  {
    name: "Sharon Ann Holm",
    title: "Dealflow Partner, LvlUp Ventures",
    bio: "Venture investor and board-level advisor with 30+ years in technology, executive leadership and global expansion, now sourcing early-stage startups at LvlUp Ventures.",
    linkedin: "https://www.linkedin.com/in/sharonaholm/",
  },
  {
    name: "Robert Jorrin",
    title: "Instructor & Creative Technologist",
    bio: "Instructor in game design, 3D modeling, robotics and programming, and a curriculum developer with expertise in C++, C# and Python.",
    linkedin: "https://www.linkedin.com/in/robert-jorrin-ba1a5925b/",
  },
];

/** Judging panel size, including seats not yet announced. */
export const JUDGE_SEATS = 3;
