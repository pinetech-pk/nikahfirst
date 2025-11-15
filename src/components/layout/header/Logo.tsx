import Link from "next/link";

interface LogoProps {
  size?: "small" | "normal" | "large";
  className?: string;
}

export function Logo({ size = "normal", className = "" }: LogoProps) {
  const sizes = {
    small: "text-xl",
    normal: "text-2xl",
    large: "text-4xl",
  };

  return (
    <Link
      href="/"
      className={`font-bold text-slate-900 hover:text-slate-700 transition-colors ${sizes[size]} ${className}`}
    >
      NikahFirst
    </Link>
  );
}
