import { BANDS, RUBRIC, RUBRIC_TOTAL, bandRange } from "./rubric";

describe("rubric", () => {
  it("adds up to 100 with innovation weighted highest", () => {
    expect(RUBRIC_TOTAL).toBe(100);
    expect(Math.max(...RUBRIC.map((c) => c.points))).toBe(RUBRIC.find((c) => c.name.startsWith("Innovation"))!.points);
  });

  it("matches the printed score sheet bands", () => {
    expect(BANDS.map((b) => bandRange(25, b))).toEqual(["23-25", "18-22", "10-17", "0-9"]);
    expect(BANDS.map((b) => bandRange(15, b))).toEqual(["14-15", "11-13", "6-10", "0-5"]);
    expect(BANDS.map((b) => bandRange(10, b))).toEqual(["9-10", "7-8", "4-6", "0-3"]);
    expect(BANDS.map((b) => bandRange(5, b))).toEqual(["5", "4", "2-3", "0-1"]);
  });
});
