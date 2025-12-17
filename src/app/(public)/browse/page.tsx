import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Heart, Bell, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Browse Profiles | NikahFirst",
  description:
    "Browse verified matrimonial profiles on NikahFirst. Find your perfect match from thousands of genuine profiles.",
};

export default function BrowsePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Search className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Browse Profiles
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find your perfect match from our community of verified profiles.
          </p>
        </div>
      </section>

      {/* Coming Soon Card */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-12 text-center border-2 border-dashed border-emerald-200">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <Heart className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            We Have Just Launched!
          </h2>

          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            NikahFirst has just launched and we are excited to welcome you to
            our platform. Full profile browsing features with advanced search
            and filters will be available very soon.
          </p>

          <div className="bg-emerald-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-emerald-800">
              <strong>What&apos;s coming:</strong> Advanced search filters,
              profile recommendations, save favorites, and more.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-slate-500 text-sm">
              Create your account now to be among the first to access these
              features and start your journey.
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
                <Link href="/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Features Preview */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Coming Soon
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-emerald-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">
                Advanced Search
              </h3>
              <p className="text-slate-600 text-sm">
                Filter by age, location, education, profession, and more.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto text-emerald-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">
                Smart Matches
              </h3>
              <p className="text-slate-600 text-sm">
                Get personalized recommendations based on your preferences.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Bell className="h-8 w-8 mx-auto text-emerald-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">
                Instant Alerts
              </h3>
              <p className="text-slate-600 text-sm">
                Get notified when new profiles match your criteria.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
