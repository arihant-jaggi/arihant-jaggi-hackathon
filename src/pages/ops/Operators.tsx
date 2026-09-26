import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input, Kicker, Panel, Select } from "@/components/ui";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/ops/EmptyState";
import { CopyButton } from "@/components/ops/CopyButton";
import { useAddOperator, useCurrentOperator, useOperators, useRemoveOperator, useSession, useUpdateOperatorRole } from "@/lib/ops";

const BOOTSTRAP_SQL = `insert into public.operators (user_id, email, role)
select id, email, 'owner' from auth.users where email = 'you@example.com';`;

const Operators = () => {
  const { session } = useSession();
  const { data: me } = useCurrentOperator(session?.user?.id);
  const isOwner = me?.role === "owner";

  const { data: operators, isLoading, isError } = useOperators();
  const addOperator = useAddOperator();
  const updateRole = useUpdateOperatorRole();
  const removeOperator = useRemoveOperator();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "operator">("operator");

  const submit = async () => {
    if (!userId.trim() || !email.trim()) {
      toast.error("User id and email are required.");
      return;
    }
    try {
      await addOperator.mutateAsync({ user_id: userId.trim(), email: email.trim(), role });
      toast.success("Operator added.");
      setUserId("");
      setEmail("");
      setRole("operator");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add operator. Make sure the user id is correct and they've signed up.");
    }
  };

  if (isError) return <EmptyState title="Couldn't load operators" />;

  return (
    <div className="max-w-3xl space-y-6">
      <Kicker>Operators</Kicker>

      {isOwner && (
        <Panel className="p-5">
          <p className="kicker mb-3">Add operator</p>
          <p className="mb-4 text-sm text-dim">
            The person must already have a Supabase Auth account (they've signed in once). You can't look up a user by email from here — ask
            them for their user id (shown on the "access pending" screen after they sign in), or run the bootstrap SQL below.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="User id" htmlFor="op-uid">
              <Input id="op-uid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="uuid" />
            </Field>
            <Field label="Email" htmlFor="op-email">
              <Input id="op-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Role" htmlFor="op-role">
              <Select id="op-role" value={role} onChange={(e) => setRole(e.target.value as "owner" | "operator")}>
                <option value="operator">Operator</option>
                <option value="owner">Owner</option>
              </Select>
            </Field>
          </div>
          <Button className="mt-4" size="sm" onClick={submit} disabled={addOperator.isPending}>
            <Plus className="h-3.5 w-3.5" /> {addOperator.isPending ? "Adding…" : "Add operator"}
          </Button>

          <div className="mt-5 space-y-1.5 border-t border-line pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Bootstrap SQL (Supabase SQL editor)</p>
            <pre className="overflow-x-auto rounded-lg border border-line bg-rail p-3 text-xs text-dim">
              <code>{BOOTSTRAP_SQL}</code>
            </pre>
            <CopyButton value={BOOTSTRAP_SQL} label="Copy SQL" />
          </div>
        </Panel>
      )}

      <Panel className="p-5">
        <p className="kicker mb-3">Console access</p>
        {isLoading ? (
          <p className="text-sm text-dim">Loading…</p>
        ) : !operators?.length ? (
          <p className="text-sm text-faint">No operators yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {operators.map((op) => (
              <div key={op.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{op.email}</p>
                  <p className="truncate font-mono text-xs text-faint">{op.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <Select
                      className="!h-8 w-auto"
                      value={op.role}
                      onChange={(e) => updateRole.mutate({ user_id: op.user_id, role: e.target.value as "owner" | "operator" })}
                    >
                      <option value="operator">Operator</option>
                      <option value="owner">Owner</option>
                    </Select>
                  ) : (
                    <Badge tone={op.role === "owner" ? "signal" : "dim"}>{op.role}</Badge>
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      aria-label={`Remove ${op.email}`}
                      onClick={() => {
                        if (window.confirm(`Remove ${op.email} as an operator?`)) removeOperator.mutate(op.user_id);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md text-faint hover:text-alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

export default Operators;
