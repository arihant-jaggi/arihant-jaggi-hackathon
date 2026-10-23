import { Kicker } from "@/components/ui";
import { TracksEditor } from "@/components/ops/TracksEditor";
import { useOpsEvent } from "@/lib/ops";

/** Challenge prompts (tracks): edit them, then release them to the public. */
const Prompts = () => {
  const { data: event, isLoading, isError } = useOpsEvent();
  if (isLoading) return <p className="font-mono text-xs uppercase tracking-kicker text-dim">Loading…</p>;
  if (isError || !event) return <p className="text-sm text-alert">Couldn't load the event.</p>;
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Kicker>Prompts</Kicker>
        <p className="text-sm text-dim">The challenge tracks teams choose from. They stay hidden from the public until you release them.</p>
      </div>
      <TracksEditor event={event} />
    </div>
  );
};

export default Prompts;
