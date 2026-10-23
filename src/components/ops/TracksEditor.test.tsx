import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromptRelease, promptLockReady } from "./TracksEditor";
import { DEFAULT_EVENT } from "@/lib/defaults";
import type { EventRow } from "@/lib/types";

const renderRelease = (event: EventRow, trackCount: number) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PromptRelease event={event} trackCount={trackCount} />
    </QueryClientProvider>,
  );

const legacy = { ...DEFAULT_EVENT } as EventRow; // database without the lock migration
delete legacy.prompts_released;

describe("PromptRelease", () => {
  it("asks for the one-time lock setup when the migration hasn't run", () => {
    expect(promptLockReady(legacy)).toBe(false);
    renderRelease(legacy, 3);
    expect(screen.getByText(/One-time setup needed/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Release prompts/i })).not.toBeInTheDocument();
  });

  it("offers Release prompts once locked and tracks exist", () => {
    renderRelease({ ...DEFAULT_EVENT, prompts_released: false }, 3);
    expect(screen.getByText(/Prompts are hidden/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Release prompts/i })).toBeEnabled();
  });

  it("disables release until tracks are added", () => {
    renderRelease({ ...DEFAULT_EVENT, prompts_released: false }, 0);
    expect(screen.getByRole("button", { name: /Release prompts/i })).toBeDisabled();
  });

  it("offers Hide prompts once released", () => {
    renderRelease({ ...DEFAULT_EVENT, prompts_released: true, prompts_released_at: "2026-10-25T13:30:00Z" }, 3);
    expect(screen.getByText(/Prompts are live/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hide prompts/i })).toBeInTheDocument();
  });
});
