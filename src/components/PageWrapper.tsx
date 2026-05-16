import { ReactNode } from "react";

const PageWrapper = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <main className={`min-h-screen pt-16 ${className}`}>{children}</main>
);

export default PageWrapper;
