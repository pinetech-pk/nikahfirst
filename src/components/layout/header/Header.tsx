"use client";

import { useSession } from "next-auth/react";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const userCredits = 5; // TODO: Get from database

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <NavLinks className="hidden md:flex" />

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center gap-1 text-sm">
                  <span className="text-slate-600">Credits:</span>
                  <span className="font-semibold">{userCredits}</span>
                </div>
                <UserMenu />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="hidden sm:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}

            <MobileMenu isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </header>
  );
}
