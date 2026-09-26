import { useState, type FormEvent } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { Button, Field, Input, Panel } from "@/components/ui";
import { Shell } from "@/components/ops/Shell";
import { CopyButton } from "@/components/ops/CopyButton";
import { isBackendConfigured, supabase } from "@/lib/supabase";
import { useCurrentOperator, useIsOperator, useOpsEvent, useSession } from "@/lib/ops";

const BOOTSTRAP_SQL = `insert into public.operators (user_id, email, role)
select id, email, 'owner' from auth.users where email = 'you@example.com';`;

// ---------------------------------------------------------------------------
// Gate states
// ---------------------------------------------------------------------------

const NotConfigured = () => (
  <div className="grid min-h-screen grid-cols-1 place-items-center bg-void p-6">
    <Panel className="w-full min-w-0 max-w-md p-6">
      <p className="kicker mb-3">Setup required</p>
      <h1 className="font-display text-xl font-semibold text-ink">Backend not configured</h1>
      <p className="mt-3 text-sm text-dim">
        The operator console needs a Supabase project. Set <code className="text-ink">VITE_SUPABASE_URL</code> and{" "}
        <code className="text-ink">VITE_SUPABASE_ANON_KEY</code>, run the migration below, then reload. See <code className="text-ink">DEPLOYMENT.md</code>{" "}
        for the full walkthrough.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-rail p-3 text-xs text-dim">
        <code>supabase/migrations/20260924000000_impact_miami_2.sql</code>
      </pre>
    </Panel>
  </div>
);

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"password" | "magic" | null>(null);

  const signInWithPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy("password");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(null);
    if (error) toast.error(error.message);
  };

  const sendMagicLink = async () => {
    if (!supabase) return;
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setBusy("magic");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/ops` },
    });
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success("Magic link sent — check your email.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-void p-6">
      <Panel className="w-full max-w-sm p-6">
        <p className="kicker mb-3">Operator console</p>
        <h1 className="font-display text-xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-dim">Operators only — ask an owner for an invite. New accounts aren't created here.</p>
        <form onSubmit={signInWithPassword} className="mt-5 space-y-4">
          <Field label="Email" htmlFor="ops-email">
            <Input id="ops-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="ops-password">
            <Input id="ops-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" disabled={busy !== null}>
            {busy === "password" ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3 text-faint">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <Button type="button" variant="outline" className="w-full" disabled={busy !== null} onClick={sendMagicLink}>
          {busy === "magic" ? "Sending…" : "Email me a magic link"}
        </Button>
      </Panel>
    </div>
  );
};

const AccessPending = ({ userId, email, onSignOut }: { userId: string; email: string; onSignOut: () => void }) => (
  <div className="grid min-h-screen place-items-center bg-void p-6">
    <Panel className="w-full max-w-lg p-6">
      <p className="kicker mb-3">Access pending</p>
      <h1 className="font-display text-xl font-semibold text-ink">Ask an owner to add you</h1>
      <p className="mt-3 text-sm text-dim">
        You're signed in as <span className="text-ink">{email}</span> but you're not yet an operator. Share your user id with an owner, or have
        them run the SQL below in the Supabase SQL editor. New operator accounts are invited from Supabase Auth → Users, not created from this
        page.
      </p>
      <div className="mt-4 space-y-1.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Your user id</p>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-rail px-3 py-2">
          <code className="flex-1 truncate text-xs text-ink">{userId}</code>
          <CopyButton value={userId} />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Bootstrap SQL (owner runs once)</p>
        <pre className="overflow-x-auto rounded-lg border border-line bg-rail p-3 text-xs text-dim">
          <code>{BOOTSTRAP_SQL.replace("you@example.com", email)}</code>
        </pre>
        <CopyButton value={BOOTSTRAP_SQL.replace("you@example.com", email)} label="Copy SQL" />
      </div>
      <Button variant="outline" className="mt-5" onClick={onSignOut}>
        Sign out
      </Button>
    </Panel>
  </div>
);

// ---------------------------------------------------------------------------

const OpsLayout = () => {
  const { session, loading } = useSession();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? "";
  const { data: isOperator, isLoading: checkingOperator } = useIsOperator(userId);
  const { data: operator } = useCurrentOperator(userId);
  const { data: event } = useOpsEvent();

  const signOut = () => {
    supabase?.auth.signOut();
  };

  if (!isBackendConfigured) return <NotConfigured />;
  if (loading) return <ConsoleBoot />;
  if (!session) return <SignIn />;
  if (checkingOperator) return <ConsoleBoot />;
  if (!isOperator) return <AccessPending userId={userId!} email={email} onSignOut={signOut} />;

  return (
    <Shell event={event} operatorEmail={operator?.email ?? email} onSignOut={signOut}>
      <Outlet />
    </Shell>
  );
};

const ConsoleBoot = () => (
  <div className="grid min-h-screen place-items-center bg-void font-mono text-xs uppercase tracking-kicker text-dim">
    booting console<span className="animate-blink">_</span>
  </div>
);

export default OpsLayout;
