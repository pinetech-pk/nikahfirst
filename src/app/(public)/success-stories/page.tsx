import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, ArrowRight, Users, Shield, Star } from "lucide-react";

export const metadata = {
  title: "Success Stories | NikahFirst",
  description:
    "Read inspiring stories from couples who found their life partners through NikahFirst.",
};

export default function SuccessStoriesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-emerald-600 fill-emerald-100" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Every connection on NikahFirst is a step towards building a
            beautiful future together.
          </p>
        </div>
      </section>

      {/* Coming Soon Message */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto p-12 text-center border-dashed border-2">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Your Story Could Be Here
          </h2>

          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            NikahFirst is just getting started, and we are excited to help
            families find meaningful connections. As our community grows, this
            page will feature real success stories from couples who found each
            other through our platform.
          </p>

          <p className="text-sm text-slate-500 mb-8">
            Be among the first to join and create your own success story.
          </p>

          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
            asChild
          >
            <Link href="/register">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Why Trust Us */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
            Why Families Trust NikahFirst
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Verified Profiles
              </h3>
              <p className="text-slate-600 text-sm">
                Every profile is reviewed before going live to ensure
                authenticity.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Family Values
              </h3>
              <p className="text-slate-600 text-sm">
                Built with Pakistani and Muslim family traditions at its core.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Star className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Privacy First
              </h3>
              <p className="text-slate-600 text-sm">
                Your information is protected and shared only with your consent.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Share Your Story CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Found Your Match on NikahFirst?
          </h2>
          <p className="text-slate-600 mb-6">
            We would love to hear your story. Share your journey with us and
            inspire others who are searching for their life partner.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">Share Your Story</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
