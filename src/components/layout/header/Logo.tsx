import Link from "next/link";

interface LogoProps {
  /**
   * Size variants for different use cases
   * - xs: Extra small for compact spaces (text-lg)
   * - sm: Small for secondary placements (text-xl)
   * - md: Medium/default for headers (text-2xl)
   * - lg: Large for hero sections (text-4xl)
   * - xl: Extra large for landing pages (text-5xl)
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "small" | "normal" | "large";
  className?: string;
  /**
   * Background variant to ensure visibility
   * - light: Use on light backgrounds (dark text for "Nikah")
   * - dark: Use on dark backgrounds (white text for "Nikah")
   */
  variant?: "light" | "dark";
  href?: string;
}

export function Logo({
  size = "md",
  className = "",
  variant = "light",
  href = "/",
}: LogoProps) {
  // Support both old and new size names for backwards compatibility
  const sizes: Record<string, string> = {
    xs: "text-lg",
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-5xl",
    // Legacy size names (backwards compatibility)
    small: "text-xl",
    normal: "text-2xl",
    large: "text-4xl",
  };

  const content = (
    <span className={`font-bold ${sizes[size]} ${className}`}>
      <span className={variant === "dark" ? "text-white" : "text-slate-900"}>
        Nikah
      </span>
      <span className="text-green-500">First</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="hover:opacity-80 transition-opacity inline-block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
