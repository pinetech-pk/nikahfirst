import Link from "next/link";

interface LogoProps {
  size?: "small" | "normal" | "large";
  className?: string;
  variant?: "light" | "dark";
  href?: string;
}

export function Logo({
  size = "normal",
  className = "",
  variant = "light",
  href = "/",
}: LogoProps) {
  const sizes = {
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
