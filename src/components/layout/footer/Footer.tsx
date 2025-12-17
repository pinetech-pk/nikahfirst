import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "../header/Logo";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Logo size="md" variant="dark" className="mb-4" />
            <p className="text-sm leading-relaxed mb-4">
              Trusted matrimonial platform connecting Pakistani and Muslim
              families worldwide with privacy and dignity.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#" icon={<Facebook className="h-4 w-4" />} />
              <SocialIcon href="#" icon={<Instagram className="h-4 w-4" />} />
              <SocialIcon href="#" icon={<Twitter className="h-4 w-4" />} />
              <SocialIcon href="#" icon={<Youtube className="h-4 w-4" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/how-it-works">How It Works</FooterLink>
              <FooterLink href="/success-stories">Success Stories</FooterLink>
              <FooterLink href="/pricing">Pricing Plans</FooterLink>
              <FooterLink href="/browse">Browse Profiles</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/safety">Safety Tips</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 shrink-0" />
                <span className="text-sm">contact@nikahfirst.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 shrink-0" />
                <span className="text-sm">+92 300 3736005</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span className="text-sm">Karachi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm">
                © {currentYear} NikahFirst. All rights reserved.
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Designed & Developed by{" "}
                <a
                  href="https://www.pinetech.pk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Pinetech - Web Studio
                </a>
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
    >
      {icon}
    </a>
  );
}
