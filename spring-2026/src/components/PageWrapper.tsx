import { ReactNode } from "react";

// pt-[100px] = the fixed Navbar's own height (pt-16 = 64px) plus the fixed
// 36px ArchiveBanner above it (see ArchiveBanner.tsx / Navbar.tsx).
const PageWrapper = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <main className={`min-h-screen pt-[100px] ${className}`}>{children}</main>
);

export default PageWrapper;
