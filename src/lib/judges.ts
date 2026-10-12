// Confirmed judges. Add a title or LinkedIn URL once they're confirmed.
export interface Judge {
  name: string;
  title?: string;
  linkedin?: string;
}

export const JUDGES: Judge[] = [{ name: "Willie Avendano" }, { name: "Sharon Ann Holm" }];

/** Judging panel size, including seats not yet announced. */
export const JUDGE_SEATS = 3;
