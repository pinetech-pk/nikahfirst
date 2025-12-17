import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing | NikahFirst",
  description:
    "Simple and affordable pricing plans to help you find your life partner on NikahFirst.",
};

const plans = [
  {
    name: "Free",
    description: "Get started with basic features",
    price: "0",
    features: [
      "Create your profile",
      "Browse profiles",
      "Basic search filters",
      "Daily free credits",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Premium",
    description: "Enhanced features for serious seekers",
    price: "Coming Soon",
    features: [
      "Everything in Free",
      "More daily credits",
      "Advanced search filters",
      "Priority profile visibility",
      "See who viewed your profile",
    ],
    cta: "Join Waitlist",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start for free and upgrade when you need more features. No hidden
            charges.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 ${
                plan.highlighted
                  ? "border-emerald-600 border-2 relative"
                  : "border-slate-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                {plan.price === "Coming Soon" ? (
                  <span className="text-2xl font-bold text-emerald-600">
                    Coming Soon
                  </span>
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-slate-900">
                      Rs. {plan.price}
                    </span>
                    <span className="text-slate-600">/month</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
                asChild
              >
                <Link href="/register">
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Credit System Info */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              How Credits Work
            </h2>
            <p className="text-slate-600 mb-6">
              NikahFirst uses a simple credit system. You receive free credits
              daily based on your plan, and use them to send interest requests
              and view contact details. Additional credits can be purchased as
              needed.
            </p>
            <p className="text-sm text-slate-500">
              Detailed pricing and credit packages will be available after
              registration.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Find Your Partner?
          </h2>
          <p className="text-slate-600 mb-8">
            Join NikahFirst today and start your journey towards finding your
            life partner.
          </p>
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
        </div>
      </section>
    </>
  );
}
