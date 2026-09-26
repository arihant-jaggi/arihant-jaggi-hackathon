import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Impact Miami 2.0 mark. Young Coders Initiative's diamond of code brackets
 * (green "<", white ">") framing a Miami sunset: a palm tree over a sun
 * setting into Biscayne Bay. Keep in sync with public/mark.svg (favicon).
 */
export const Mark = ({ className, title = "Impact Miami 2.0" }: { className?: string; title?: string }) => {
  const id = useId().replace(/:/g, "");
  const grad = `mark-grad-${id}`;
  const clip = `mark-clip-${id}`;
  return (
    <svg viewBox="0 0 160 160" className={cn("h-10 w-auto", className)} {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3DEB8F" />
          <stop offset="1" stopColor="#16D4F0" />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="0" y="0" width="160" height="96" />
        </clipPath>
      </defs>
      {/* YCI bracket diamond */}
      <path d="M64 16 L14 80 L64 144" fill="none" stroke={`url(#${grad})`} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96 16 L146 80 L96 144" fill="none" stroke="#F2F1EC" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sun on the horizon */}
      <circle cx="78" cy="96" r="26" fill={`url(#${grad})`} clipPath={`url(#${clip})`} />
      {/* Bay */}
      <g fill="none" stroke={`url(#${grad})`} strokeWidth="4" strokeLinecap="round">
        <path d="M48 106 q7.5 -5 15 0 t15 0 t15 0 t15 0" />
        <path d="M58 118 q5.5 -4 11 0 t11 0 t11 0" opacity="0.6" />
      </g>
      {/* Palm */}
      <g fill="none" stroke="#F2F1EC" strokeWidth="4.5" strokeLinecap="round">
        <path d="M100 100 C102 86 99 70 92 56" />
        <path d="M92 56 C84 48 72 48 64 55" />
        <path d="M92 56 C87 44 78 39 69 40" />
        <path d="M92 56 C95 44 103 38 112 40" />
        <path d="M92 56 C101 51 110 54 116 61" />
        <path d="M92 56 C91 48 92 42 97 35" />
      </g>
    </svg>
  );
};
