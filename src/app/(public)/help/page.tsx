import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  HelpCircle,
  Shield,
  Lightbulb,
  MessageSquare,
  CreditCard,
  Heart,
  Eye,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Star,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Help Center | NikahFirst",
  description:
    "Find answers to common questions about NikahFirst, learn how the platform works, and get safety tips.",
};

export default function PublicHelpPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions and learn how to use NikahFirst
            safely and effectively.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <a href="#faqs" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow h-full">
              <HelpCircle className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <span className="text-sm font-medium">FAQs</span>
            </Card>
          </a>
          <a href="#safety" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow h-full">
              <Shield className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <span className="text-sm font-medium">Safety Tips</span>
            </Card>
          </a>
          <a href="#getting-started" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow h-full">
              <Lightbulb className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <span className="text-sm font-medium">Getting Started</span>
            </Card>
          </a>
          <a href="#contact" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow h-full">
              <MessageSquare className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <span className="text-sm font-medium">Contact Us</span>
            </Card>
          </a>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Credits FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                How Credits Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium text-slate-900 mb-2">
                  What are credits?
                </h4>
                <p className="text-slate-600 text-sm">
                  Credits are used on NikahFirst to send interest requests and
                  view contact details of potential matches. You receive free
                  credits daily based on your subscription, and can purchase
                  additional credits as needed.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium text-slate-900 mb-2">
                  How many credits do actions cost?
                </h4>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Send Interest: 1 credit</li>
                  <li>• View Contact Details: 2 credits</li>
                </ul>
                <p className="text-slate-500 text-xs mt-2">
                  Credit costs may vary based on your subscription plan.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  How do I get free credits?
                </h4>
                <p className="text-slate-600 text-sm">
                  Free credits are added to your account daily. Complete your
                  profile 100% and verify your account to earn bonus credits.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interest FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-emerald-600" />
                Sending Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium text-slate-900 mb-2">
                  How do I send an interest?
                </h4>
                <p className="text-slate-600 text-sm">
                  Browse profiles, find someone you like, and click the
                  &quot;Send Interest&quot; button on their profile. You can add
                  a personalized message to introduce yourself.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  What happens when someone accepts my interest?
                </h4>
                <p className="text-slate-600 text-sm">
                  When both parties accept, you become a match! Contact details
                  are then shared so families can take the conversation forward.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-emerald-600" />
                Profile & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium text-slate-900 mb-2">
                  Who can see my profile?
                </h4>
                <p className="text-slate-600 text-sm">
                  Your profile is visible to registered members of the opposite
                  gender within your preferences. You can adjust visibility
                  settings in your account.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium text-slate-900 mb-2">
                  Are profiles verified?
                </h4>
                <p className="text-slate-600 text-sm">
                  Yes, every profile is reviewed by our team before being
                  published. We verify basic information to ensure authenticity.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  Can I hide my profile temporarily?
                </h4>
                <p className="text-slate-600 text-sm">
                  Yes, you can hide your profile from search results at any time
                  through your privacy settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Safety Tips
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Safe Meeting Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-2">
                      Before Meeting
                    </h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Video call first to verify identity</li>
                      <li>• Share your plans with family</li>
                      <li>• Verify their profile is approved</li>
                      <li>• Trust your instincts</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      During Meeting
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Meet in a public place</li>
                      <li>• Bring a family member (recommended)</li>
                      <li>• Keep your phone accessible</li>
                      <li>• Arrange your own transport</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Remember:</strong> In our culture, marriage is a
                    family matter. Involving your family adds security and
                    ensures everyone is aligned.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Avoiding Scams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Red Flags to Watch For
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Asking for money (any reason)</li>
                    <li>• Refusing video calls or meetings</li>
                    <li>• Inconsistent stories</li>
                    <li>• Rushing the relationship</li>
                    <li>• Asking for personal documents</li>
                  </ul>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  If you encounter suspicious behavior, report the profile
                  immediately. Never send money to anyone you meet online.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Getting Started
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Creating a Strong Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">
                    Profile Photos
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>Use a clear, recent photo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>Good lighting, simple background</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>Dress modestly and appropriately</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">
                    Bio & Description
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>Be honest about yourself</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>Mention your values and goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>Keep it positive</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <strong>Tip:</strong> Complete profiles get 3x more responses!
                  Fill in all sections including education, profession, and
                  family background.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Create Your Account",
                    desc: "Register with email and phone number",
                  },
                  {
                    step: 2,
                    title: "Complete Your Profile",
                    desc: "Fill in details and upload photos",
                  },
                  {
                    step: 3,
                    title: "Wait for Verification",
                    desc: "Our team reviews your profile (24-48 hours)",
                  },
                  {
                    step: 4,
                    title: "Browse & Connect",
                    desc: "Search profiles and send interests",
                  },
                  {
                    step: 5,
                    title: "Involve Your Family",
                    desc: "Share promising matches with family",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Contact Us
          </h2>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <Mail className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                    <h4 className="font-semibold text-slate-900">Email</h4>
                    <p className="text-slate-600">contact@nikahfirst.com</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Response within 24-48 hours
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <Phone className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                    <h4 className="font-semibold text-slate-900">WhatsApp</h4>
                    <p className="text-slate-600">+92 300 3736005</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mon-Sat, 9 AM - 6 PM PKT
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800 mb-4">
                    For account-specific support, report issues, or to track
                    your support requests, please log in to your account.
                  </p>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link href="/login">
                      Login for Full Support
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-slate-600 mb-8">
            Join NikahFirst today and find your life partner with the support of
            your family.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
              asChild
            >
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
