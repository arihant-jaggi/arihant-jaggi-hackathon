import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

/**
 * Route changes scroll to the top; "/#faq"-style links scroll to that section.
 * Keyed on location.key so clicking the same nav link twice still scrolls,
 * and retried briefly so sections rendered after data loads are found.
 */
const ScrollManager = () => {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    let tries = 0;
    const id = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 20) {
        window.clearInterval(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [pathname, hash, key]);
  return null;
};

const SiteLayout = () => (
  <div className="grid-ground min-h-screen">
    <ScrollManager />
    <Nav />
    <Outlet />
    <Footer />
  </div>
);

export default SiteLayout;
