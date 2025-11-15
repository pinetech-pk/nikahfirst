"use client";

import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/button";

export function Header() {
  // TODO: Replace with actual auth state
  const isLoggedIn = false;
  const userCredits = 5;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation - Hidden on mobile */}
          <NavLinks className="hidden md:flex" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Credits Display */}
                <div className="hidden sm:flex items-center gap-1 text-sm">
                  <span className="text-slate-600">Credits:</span>
                  <span className="font-semibold">{userCredits}</span>
                </div>

                {/* User Menu */}
                <UserMenu />
              </>
            ) : (
              <>
                {/* Auth Buttons - Hidden on mobile */}
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button className="hidden sm:inline-flex">Sign Up</Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <MobileMenu isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </header>
  );
}
