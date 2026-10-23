import { render as rtlRender, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { TracksSection } from "./TracksSection";
import type { TrackRow } from "@/lib/types";

const render = (ui: ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

const track = (n: number): TrackRow => ({
  id: `t${n}`,
  event_id: "e1",
  title: `Secret Track ${n}`,
  summary: `Secret prompt text ${n}`,
  description: null,
  icon: null,
  sort_order: n,
});

describe("TracksSection", () => {
  it("never renders prompt text before release, even if tracks are passed in", () => {
    const { container } = render(<TracksSection tracks={[track(1), track(2), track(3)]} released={false} />);
    expect(container.textContent).not.toContain("Secret");
    expect(screen.getByText(/Prompts locked/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/locked/i)).toHaveLength(3);
  });

  it("shows the tracks once released", () => {
    render(<TracksSection tracks={[track(1), track(2)]} released />);
    expect(screen.getByText("Secret Track 1")).toBeInTheDocument();
    expect(screen.getByText("Secret prompt text 2")).toBeInTheDocument();
    expect(screen.queryByText(/Prompts locked/i)).not.toBeInTheDocument();
  });
});
