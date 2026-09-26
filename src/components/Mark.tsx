import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Impact Miami 2.0 mark: a shield holding a Miami sun setting over bay
 * waves, flanked by code brackets. Stroke and sun use the signal gradient.
 * Keep in sync with public/mark.svg (the favicon).
 */
export const Mark = ({ className, title = "Impact Miami 2.0" }: { className?: string; title?: string }) => {
  const id = useId().replace(/:/g, "");
  const grad = `mark-grad-${id}`;
  const clip = `mark-clip-${id}`;
  return (
    <svg viewBox="0 0 120 132" className={cn("h-10 w-auto", className)} {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3DEB8F" />
          <stop offset="1" stopColor="#16D4F0" />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="0" y="0" width="120" height="72" />
        </clipPath>
      </defs>
      {/* Shield */}
      <path
        d="M60 5 L110 21 V62 C110 94 88 116 60 127 C32 116 10 94 10 62 V21 Z"
        fill="#0E1012"
        stroke={`url(#${grad})`}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Sun, cut at the horizon */}
      <circle cx="60" cy="72" r="22" fill={`url(#${grad})`} clipPath={`url(#${clip})`} />
      {/* Bay waves */}
      <g fill="none" stroke={`url(#${grad})`} strokeWidth="4" strokeLinecap="round">
        <path d="M30 82 q7.5 -6 15 0 t15 0 t15 0 t15 0" />
        <path d="M38 94 q5.5 -5 11 0 t11 0 t11 0 t11 0" opacity="0.75" />
        <path d="M48 106 q3 -4 6 0 t6 0 t6 0 t6 0" opacity="0.5" />
      </g>
      {/* Code brackets */}
      <g fill="none" stroke="#F2F1EC" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M31 44 L21 55 L31 66" />
        <path d="M89 44 L99 55 L89 66" />
      </g>
    </svg>
  );
};
