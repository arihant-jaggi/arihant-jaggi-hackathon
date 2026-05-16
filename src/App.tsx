import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Problems from "./pages/Problems";
import Schedule from "./pages/Schedule";
import Venue from "./pages/Venue";
import Register from "./pages/Register";
import ThankYou from "./pages/ThankYou";
import Submit from "./pages/Submit";
import Judges from "./pages/Judges";
import JudgingCriteria from "./pages/JudgingCriteria";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const showFooter = location.pathname !== "/admin";

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/register" element={<Register />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/judges" element={<Judges />} />
        <Route path="/judging-criteria" element={<JudgingCriteria />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
