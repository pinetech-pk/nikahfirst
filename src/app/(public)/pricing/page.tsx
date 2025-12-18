"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Loader2,
  Crown,
  Zap,
  Star,
  Sparkles,
  Gift,
  RefreshCcw,
  Users,
  Wallet,
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  freeCredits: number;
  walletLimit: number;
  redeemCredits: number;
  redeemCycleDays: number;
  profileLimit: number;
  priceMonthly: number;
  priceYearly: number;
  yearlyDiscountPct: number;
  sortOrder: number;
  isDefault: boolean;
  color: string | null;
  features: string[] | null;
}

// Icon mapping for different plan tiers
const planIcons: { [key: string]: React.ReactNode } = {
  FREE: <Gift className="h-6 w-6" />,
  STANDARD: <Zap className="h-6 w-6" />,
  SILVER: <Star className="h-6 w-6" />,
  GOLD: <Crown className="h-6 w-6" />,
  PLATINUM: <Sparkles className="h-6 w-6" />,
  PRO: <Crown className="h-6 w-6" />,
};

// Popular plans (highlighted)
const popularPlans = ["GOLD", "PLATINUM"];

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscription-plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === "yearly") {
      return plan.priceYearly / 12; // Show monthly equivalent
    }
    return plan.priceMonthly;
  };

  const getTotalYearlyPrice = (plan: SubscriptionPlan) => {
    return plan.priceYearly;
  };

  // Generate feature list based on plan attributes - only 5 relevant features
  const generateFeatures = (plan: SubscriptionPlan): string[] => {
    const features: string[] = [];

    // 1. Active profiles
    if (plan.profileLimit > 1) {
      features.push(`${plan.profileLimit} Active Profiles`);
    } else {
      features.push("1 Active Profile");
    }

    // 2. Free credits on signup
    features.push(`${plan.freeCredits} free credits on signup`);

    // 3. Credits redemption cycle
    features.push(`${plan.redeemCredits} free credit${plan.redeemCredits > 1 ? "s" : ""} every ${plan.redeemCycleDays} days`);

    // 4. Redeem wallet limit
    features.push(`Redeem Wallet limit of ${plan.walletLimit} credits`);

    // 5. Funding wallet - no limit
    features.push("No limit for Funding Wallet");

    return features;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Start for free and upgrade when you need more features. No hidden
            charges.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                Save up to 20%
              </Badge>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-slate-500">Loading plans...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No subscription plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const isPopular = popularPlans.includes(plan.slug);
              const isFree = plan.priceMonthly === 0;
              const features = generateFeatures(plan);
              const price = getPrice(plan);

              return (
                <Card
                  key={plan.id}
                  className={`p-6 relative flex flex-col ${
                    isPopular
                      ? "border-2 shadow-lg scale-105 z-10"
                      : "border-slate-200"
                  }`}
                  style={{
                    borderColor: isPopular ? (plan.color || "#10b981") : undefined,
                  }}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className="text-white"
                        style={{ backgroundColor: plan.color || "#10b981" }}
                      >
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                      style={{
                        backgroundColor: `${plan.color || "#10b981"}20`,
                        color: plan.color || "#10b981",
                      }}
                    >
                      {planIcons[plan.slug] || <Star className="h-6 w-6" />}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-slate-500 text-sm">{plan.description}</p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    {isFree ? (
                      <div>
                        <span className="text-4xl font-bold text-slate-900">Free</span>
                        <span className="text-slate-500 block text-sm mt-1">
                          No credit card required
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-lg text-slate-500">$</span>
                          <span className="text-4xl font-bold text-slate-900">
                            {price.toFixed(2)}
                          </span>
                          <span className="text-slate-500">/mo</span>
                        </div>
                        {billingCycle === "yearly" && plan.yearlyDiscountPct > 0 && (
                          <div className="mt-1">
                            <span className="text-sm text-emerald-600 font-medium">
                              ${getTotalYearlyPrice(plan).toFixed(2)}/year
                            </span>
                            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                              Save {plan.yearlyDiscountPct}%
                            </Badge>
                          </div>
                        )}
                        {billingCycle === "monthly" && (
                          <span className="text-slate-500 block text-sm mt-1">
                            Billed monthly
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                        <Gift className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">{plan.freeCredits}</p>
                      <p className="text-xs text-slate-500">Free Credits</p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <RefreshCcw className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {plan.redeemCredits}/{plan.redeemCycleDays}d
                      </p>
                      <p className="text-xs text-slate-500">Redeem Cycle</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">{plan.walletLimit}</p>
                      <p className="text-xs text-slate-500">Wallet Limit</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check
                          className="h-5 w-5 shrink-0 mt-0.5"
                          style={{ color: plan.color || "#10b981" }}
                        />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      isPopular
                        ? "text-white"
                        : isFree
                        ? "bg-slate-900 hover:bg-slate-800"
                        : ""
                    }`}
                    style={
                      isPopular
                        ? { backgroundColor: plan.color || "#10b981" }
                        : undefined
                    }
                    asChild
                  >
                    <Link href="/register">
                      {isFree ? "Get Started Free" : "Choose Plan"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Features Comparison */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How Credits Work
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              NikahFirst uses a simple credit system to ensure quality interactions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Free Credits
              </h3>
              <p className="text-slate-600 text-sm">
                Get free credits when you sign up. Higher plans receive more credits to kickstart your journey.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <RefreshCcw className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Redemption Cycle
              </h3>
              <p className="text-slate-600 text-sm">
                Earn credits regularly based on your plan. Premium plans get more credits, more frequently.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Use Credits
              </h3>
              <p className="text-slate-600 text-sm">
                Use credits to send interest requests and view contact details of potential matches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-slate-600">
                Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you will receive the new benefits immediately.
              </p>
            </div>
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600">
                We accept JazzCash, EasyPaisa, and bank transfers for Pakistani users. International cards (Visa/Mastercard) coming soon.
              </p>
            </div>
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What happens to unused credits?
              </h3>
              <p className="text-slate-600">
                Unused credits remain in your wallet up to your plan limit. They do not expire as long as your account is active.
              </p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-slate-600">
                We offer a 7-day money-back guarantee if you are not satisfied with your subscription. Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Find Your Partner?
            </h2>
            <p className="text-emerald-100 mb-8 text-lg">
              Join thousands of Muslims who have found their life partner on NikahFirst.
            </p>
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
          </div>
        </div>
      </section>
    </>
  );
}
