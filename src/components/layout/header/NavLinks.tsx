"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinksProps {
  className?: string;
  mobile?: boolean;
}

export function NavLinks({ className = "", mobile = false }: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/browse", label: "Browse" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/success-stories", label: "Success Stories" },
  ];

  const baseStyles = mobile
    ? "block px-3 py-2 text-base"
    : "inline-flex items-center px-3 py-2 text-sm";

  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`
            ${baseStyles}
            font-medium transition-colors hover:text-primary
            ${
              pathname === link.href
                ? "text-primary"
                : "text-slate-600 hover:text-slate-900"
            }
          `}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
