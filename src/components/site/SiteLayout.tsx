import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

/** Scrolls to top on route change, but leaves in-page hash jumps (nav anchors) alone. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
};

const SiteLayout = () => (
  <div className="grid-ground min-h-screen">
    <ScrollToTop />
    <Nav />
    <Outlet />
    <Footer />
  </div>
);

export default SiteLayout;
