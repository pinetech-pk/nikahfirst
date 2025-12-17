import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  UserPlus,
  FileText,
  ShieldCheck,
  Search,
  Heart,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "How It Works | NikahFirst",
  description:
    "Learn how NikahFirst helps you find your life partner through our simple and secure matrimonial process.",
};

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up with your email and phone number. You can register for yourself or on behalf of a family member.",
  },
  {
    number: 2,
    icon: FileText,
    title: "Build Your Profile",
    description:
      "Complete your matrimonial profile with details about education, profession, family background, and what you're looking for in a partner.",
  },
  {
    number: 3,
    icon: ShieldCheck,
    title: "Profile Verification",
    description:
      "Our team reviews every profile to ensure authenticity. Once approved, your profile becomes visible to other members.",
  },
  {
    number: 4,
    icon: Search,
    title: "Browse Profiles",
    description:
      "Search and filter profiles based on your preferences - age, location, education, profession, and more.",
  },
  {
    number: 5,
    icon: Heart,
    title: "Express Interest",
    description:
      "Found someone compatible? Send them an interest request. They'll be notified and can review your profile.",
  },
  {
    number: 6,
    icon: MessageCircle,
    title: "Connect & Communicate",
    description:
      "When both parties accept, contact details are shared so families can take the conversation forward.",
  },
];

const features = [
  {
    title: "Family Involvement",
    description:
      "Parents and guardians can create and manage profiles on behalf of their children, keeping families involved in the process.",
  },
  {
    title: "Privacy Controls",
    description:
      "You decide who sees your photos and contact information. Your privacy is always in your hands.",
  },
  {
    title: "Verified Profiles",
    description:
      "Every profile goes through a verification process before being published, ensuring genuine members.",
  },
  {
    title: "Credit System",
    description:
      "Use credits to send interests and view contact details. Free daily credits are available based on your subscription.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            How NikahFirst Works
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Finding your life partner made simple, secure, and respectful of our
            values and traditions.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
          Your Journey to Finding a Partner
        </h2>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-emerald-200 hidden md:block" />
              )}

              <div className="flex gap-6 mb-8">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <Card className="flex-1 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <step.icon className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
            What Makes Us Different
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
          Common Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Who can create a profile?
            </h3>
            <p className="text-slate-600 text-sm">
              Anyone looking for a spouse can create a profile. Parents and
              guardians can also create profiles on behalf of their children,
              siblings, or relatives.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Is my information safe?
            </h3>
            <p className="text-slate-600 text-sm">
              Yes. Your contact details are only shared when both parties accept
              an interest request. Photos can be hidden until you choose to
              share them.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              How does the credit system work?
            </h3>
            <p className="text-slate-600 text-sm">
              Credits are used to send interest requests and view contact
              details. You receive free credits daily based on your subscription
              plan, and can also purchase additional credits.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              How long does profile verification take?
            </h3>
            <p className="text-slate-600 text-sm">
              Most profiles are reviewed within 24-48 hours. You&apos;ll receive
              a notification once your profile is approved and live.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Join thousands of families who have found their perfect match
            through NikahFirst.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-emerald-600 hover:bg-emerald-50"
              asChild
            >
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-emerald-700"
              asChild
            >
              <Link href="/browse">Browse Profiles</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
