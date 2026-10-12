// Event partners, shown in the hero, the Partners section and the footer.
export interface Partner {
  name: string;
  logo: string;
  /** Tile background behind the logo, matching the logo's own ground. */
  tile: string;
  /** Newly announced; gets a "New partner" tag and a highlight. */
  isNew?: boolean;
}

export const PARTNERS: Partner[] = [
  { name: "Big Red Education", logo: "/bigred-logo.png", tile: "bg-white" },
  { name: "Founders Future", logo: "/founders-future.png", tile: "bg-[#013C4A]", isNew: true },
];

export const PARTNER_NAMES = PARTNERS.map((p) => p.name).join(" and ");
