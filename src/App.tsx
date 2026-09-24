import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import SiteLayout from "@/components/site/SiteLayout";
import Home from "@/pages/public/Home";
import Register from "@/pages/public/Register";
import NotFound from "@/pages/public/NotFound";

// The operator console is its own bundle; public visitors never download it.
const OpsLayout = lazy(() => import("@/pages/ops/OpsLayout"));
const OpsTeams = lazy(() => import("@/pages/ops/Teams"));
const OpsTeamDetail = lazy(() => import("@/pages/ops/TeamDetail"));
const OpsCheckIn = lazy(() => import("@/pages/ops/CheckIn"));
const OpsEvent = lazy(() => import("@/pages/ops/EventSettings"));
const OpsContent = lazy(() => import("@/pages/ops/Content"));
const OpsOperators = lazy(() => import("@/pages/ops/Operators"));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const OpsFallback = () => (
  <div className="grid min-h-screen place-items-center bg-void font-mono text-xs uppercase tracking-kicker text-dim">
    booting console<span className="animate-blink">_</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster theme="dark" position="bottom-right" toastOptions={{ className: "!bg-deck !border-line !text-ink" }} />
      <Suspense fallback={<OpsFallback />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/ops" element={<OpsLayout />}>
            <Route index element={<Navigate to="teams" replace />} />
            <Route path="teams" element={<OpsTeams />} />
            <Route path="teams/:teamId" element={<OpsTeamDetail />} />
            <Route path="check-in" element={<OpsCheckIn />} />
            <Route path="event" element={<OpsEvent />} />
            <Route path="content" element={<OpsContent />} />
            <Route path="operators" element={<OpsOperators />} />
          </Route>
          <Route path="/admin" element={<Navigate to="/ops" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
