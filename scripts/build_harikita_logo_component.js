const fs = require('fs');
const path = require('path');

const symFile = fs.readFileSync(path.join(__dirname, '..', 'public', 'brand', 'harikita-symbol.svg'), 'utf8');
const wordFile = fs.readFileSync(path.join(__dirname, '..', 'public', 'brand', 'harikita-logo-horizontal.svg'), 'utf8');

const symMatch = symFile.match(/<path d="([^"]+)"/);
const wordMatch = wordFile.match(/x="115"[^>]*>[\s\S]*?<path d="([^"]+)"/);

if (!symMatch || !wordMatch) {
  throw new Error('Failed to extract SVG paths');
}

const sym = symMatch[1];
const word = wordMatch[1];

const compContent = `import React from "react";
import Link from "next/link";

export interface HariKitaLogoProps {
  variant?: "horizontal" | "stacked" | "symbol";
  tone?: "dark" | "light" | "currentColor";
  size?: "sm" | "md" | "lg" | "xl" | number;
  showTagline?: boolean;
  showSubtitle?: boolean;
  asLink?: boolean;
  href?: string;
  className?: string;
}

// Normalized mathematical Bézier path strings from HariKita-Design.png
const SYMBOL_PATH =
  "${sym}";

const WORDMARK_PATH =
  "${word}";

export const HariKitaLogo: React.FC<HariKitaLogoProps> = ({
  variant = "horizontal",
  tone = "dark",
  size = "md",
  showTagline = false,
  showSubtitle = true,
  asLink = true,
  href = "/",
  className = "",
}) => {
  // Determine color scheme based on tone
  // tone='dark': on light background -> Symbol Taupe (#88735B), Wordmark Charcoal (#2B2B2B)
  // tone='light': on dark background -> Symbol Champagne (#C5B39F), Wordmark Ivory (#FAF8F5)
  // tone='currentColor': inherits CSS text color
  const symbolColor =
    tone === "currentColor"
      ? "currentColor"
      : tone === "light"
      ? "#C5B39F"
      : "#88735B";

  const wordmarkColor =
    tone === "currentColor"
      ? "currentColor"
      : tone === "light"
      ? "#FAF8F5"
      : "#2B2B2B";

  const subtitleColor =
    tone === "currentColor"
      ? "currentColor"
      : tone === "light"
      ? "#C5B39F"
      : "#88735B";

  const taglineColor =
    tone === "currentColor"
      ? "currentColor"
      : tone === "light"
      ? "#E5DED5"
      : "#88735B";

  // Size scale factors
  const scale =
    typeof size === "number"
      ? size / 48
      : size === "sm"
      ? 0.75
      : size === "lg"
      ? 1.25
      : size === "xl"
      ? 1.6
      : 1; // default 'md'

  let content: React.ReactNode;

  if (variant === "symbol") {
    const sWidth = 48 * scale;
    const sHeight = sWidth * (678 / 741);
    content = (
      <svg
        width={sWidth}
        height={sHeight}
        viewBox="602 13 741 678"
        fill="currentColor"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ color: symbolColor }}
      >
        <path d={SYMBOL_PATH} fill="currentColor" fillRule="evenodd" />
      </svg>
    );
  } else if (variant === "stacked") {
    const boxWidth = 260 * scale;
    const sWidth = 85 * scale;
    const sHeight = sWidth * (678 / 741);
    const wWidth = 170 * scale;
    const wHeight = wWidth * (388 / 1898);

    content = (
      <div
        className="flex flex-col items-center text-center select-none group"
        style={{ width: boxWidth }}
      >
        <svg
          width={sWidth}
          height={sHeight}
          viewBox="602 13 741 678"
          fill="currentColor"
          className="shrink-0 transition-transform duration-300 group-hover:scale-105 mb-2.5"
          style={{ color: symbolColor }}
        >
          <path d={SYMBOL_PATH} fill="currentColor" fillRule="evenodd" />
        </svg>

        <svg
          width={wWidth}
          height={wHeight}
          viewBox="26 36 1898 388"
          fill="currentColor"
          className="shrink-0"
          style={{ color: wordmarkColor }}
        >
          <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
        </svg>

        {showSubtitle && (
          <span
            className="text-[9.5px] uppercase tracking-[0.32em] font-semibold mt-2"
            style={{ color: subtitleColor }}
          >
            WEDDING &amp; EVENTS
          </span>
        )}

        {showTagline && (
          <>
            <div
              className="w-12 h-px my-2.5 opacity-40"
              style={{ backgroundColor: subtitleColor }}
            />
            <span
              className="font-serif italic text-sm tracking-normal"
              style={{ color: taglineColor }}
            >
              Your Day. Our Story
            </span>
          </>
        )}
      </div>
    );
  } else {
    // Horizontal variant (Ideal for Navbar and Footers)
    const sWidth = 44 * scale;
    const sHeight = sWidth * (678 / 741);
    const wWidth = 148 * scale;
    const wHeight = wWidth * (388 / 1898);

    content = (
      <div className="flex items-center gap-3 select-none group">
        <svg
          width={sWidth}
          height={sHeight}
          viewBox="602 13 741 678"
          fill="currentColor"
          className="shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ color: symbolColor }}
        >
          <path d={SYMBOL_PATH} fill="currentColor" fillRule="evenodd" />
        </svg>

        <div className="flex flex-col justify-center">
          <svg
            width={wWidth}
            height={wHeight}
            viewBox="26 36 1898 388"
            fill="currentColor"
            className="shrink-0"
            style={{ color: wordmarkColor }}
          >
            <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
          </svg>

          {showSubtitle && (
            <span
              className="text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.28em] font-semibold mt-1"
              style={{ color: subtitleColor }}
            >
              WEDDING &amp; EVENTS
            </span>
          )}
        </div>
      </div>
    );
  }

  if (asLink) {
    return (
      <Link href={href} className={\`focus:outline-none inline-block \${className}\`}>
        {content}
      </Link>
    );
  }

  return <div className={\`inline-block \${className}\`}>{content}</div>;
};
`;

const brandComponentsDir = path.join(__dirname, '..', 'src', 'components', 'brand');
if (!fs.existsSync(brandComponentsDir)) fs.mkdirSync(brandComponentsDir, { recursive: true });

fs.writeFileSync(path.join(brandComponentsDir, 'HariKitaLogo.tsx'), compContent);
console.log('src/components/brand/HariKitaLogo.tsx created successfully!');
