import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Contact Us | NikahFirst",
  description:
    "Get in touch with the NikahFirst team. We are here to help you with any questions or concerns.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions or need assistance? We are here to help.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <p className="text-slate-600">contact@nikahfirst.com</p>
                    <p className="text-sm text-slate-500 mt-1">
                      We respond within 24-48 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      WhatsApp
                    </h3>
                    <p className="text-slate-600">+92 300 3736005</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Mon-Sat, 9 AM - 6 PM PKT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Location
                    </h3>
                    <p className="text-slate-600">Karachi, Pakistan</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Serving families worldwide
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Support Hours
                    </h3>
                    <p className="text-slate-600">Monday - Saturday</p>
                    <p className="text-sm text-slate-500 mt-1">
                      9:00 AM - 6:00 PM PKT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Center CTA */}
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Looking for Quick Answers?
              </h2>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                Visit our Help Center for FAQs, safety tips, and guides on how
                to use NikahFirst effectively.
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                asChild
              >
                <Link href="/help">
                  Visit Help Center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Registered Users */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">
              Already have an account? Get personalized support through your
              dashboard.
            </p>
            <Button variant="outline" asChild>
              <Link href="/login">Login to Your Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Common Topics */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Common Topics
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Account Issues
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Help with login, password reset, account verification, or
                profile updates.
              </p>
              <Link
                href="/help#faqs"
                className="text-emerald-600 text-sm font-medium hover:underline"
              >
                View FAQs →
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Safety Concerns
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Report suspicious profiles, harassment, or fraudulent activity.
              </p>
              <Link
                href="/help#safety"
                className="text-emerald-600 text-sm font-medium hover:underline"
              >
                Safety Tips →
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Billing & Credits
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Questions about credits, payments, subscriptions, or refunds.
              </p>
              <Link
                href="/help#faqs"
                className="text-emerald-600 text-sm font-medium hover:underline"
              >
                Learn More →
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
