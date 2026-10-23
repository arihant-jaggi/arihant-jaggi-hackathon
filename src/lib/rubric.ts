// Judging rubric: 100 raw points, identical for every track. Mirrors the
// printable judge score sheet.
export interface Criterion {
  name: string;
  points: number;
  lookFor: string;
}

export const RUBRIC: Criterion[] = [
  { name: "Innovation & originality", points: 25, lookFor: "A genuinely new idea or approach, from a surprising angle. Not a copy of an existing app or tutorial." },
  { name: "Sustainability & viability", points: 15, lookFor: "Could it keep running after today? Realistic cost, upkeep and adoption, with a clear owner or path forward." },
  { name: "Agentic design", points: 15, lookFor: "The AI acts: it plans, uses tools and takes steps rather than just chatting. It's clear when a human stays in control." },
  { name: "Community impact", points: 15, lookFor: "A real, specific problem for Miami residents. Clear who benefits and how much it changes things for them." },
  { name: "Technical execution", points: 15, lookFor: "Works in the live demo. Tools, APIs and data used well. Real technical effort for one day." },
  { name: "Responsible & safe AI", points: 5, lookFor: "Handles mistakes, privacy and misuse sensibly. Avoids giving advice it shouldn't." },
  { name: "Pitch & storytelling", points: 10, lookFor: "Problem, solution and vision come across clearly in 5 minutes. Handles Q&A well." },
];

export const RUBRIC_TOTAL = RUBRIC.reduce((sum, c) => sum + c.points, 0);

/** Score bands, as shares of each criterion's points. */
export const BANDS = [
  { name: "Exceptional", from: 0.9, to: 1 },
  { name: "Strong", from: 0.7, to: 0.89 },
  { name: "Developing", from: 0.4, to: 0.69 },
  { name: "Minimal", from: 0, to: 0.39 },
] as const;

/** Point range for a band on a criterion, e.g. Strong on 25 -> "18-22". */
export const bandRange = (points: number, band: (typeof BANDS)[number]) => {
  const lo = Math.ceil(band.from * points - 1e-9);
  const next = BANDS[BANDS.indexOf(band) - 1];
  const hi = next ? Math.ceil(next.from * points - 1e-9) - 1 : points;
  return hi > lo ? `${lo}-${hi}` : `${Math.max(lo, 0)}`;
};
