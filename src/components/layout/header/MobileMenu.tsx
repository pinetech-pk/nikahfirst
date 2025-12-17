"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";

interface MobileMenuProps {
  isLoggedIn: boolean;
}

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
          <div className="px-4 py-4">
            <NavLinks mobile />

            {!isLoggedIn && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <Button className="w-full" asChild onClick={closeMenu}>
                  <Link href="/register">Sign Up</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild onClick={closeMenu}>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            )}

            {isLoggedIn && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-slate-600">Credits</span>
                  <span className="font-semibold">5</span>
                </div>
                <Button variant="outline" className="w-full" asChild onClick={closeMenu}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
