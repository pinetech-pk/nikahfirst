import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Shield,
  Users,
  BadgeCheck,
  ArrowRight,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export const metadata = {
  title: "NikahFirst - Find Your Life Partner | Muslim Matrimonial Platform",
  description:
    "Trusted matrimonial platform for Pakistani & Muslim families. Find your life partner with dignity, privacy, and family involvement.",
};

// Sample profiles for display
const sampleProfiles = [
  {
    id: 1,
    name: "Ayesha K.",
    age: 26,
    profession: "Doctor",
    education: "MBBS",
    location: "Lahore",
    gender: "female",
    initials: "AK",
    color: "bg-pink-500",
  },
  {
    id: 2,
    name: "Fatima S.",
    age: 24,
    profession: "Software Engineer",
    education: "BS Computer Science",
    location: "Karachi",
    gender: "female",
    initials: "FS",
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Mariam A.",
    age: 27,
    profession: "Architect",
    education: "B.Arch",
    location: "Islamabad",
    gender: "female",
    initials: "MA",
    color: "bg-rose-500",
  },
  {
    id: 4,
    name: "Omar S.",
    age: 29,
    profession: "Software Engineer",
    education: "MS Computer Science",
    location: "Karachi",
    gender: "male",
    initials: "OS",
    color: "bg-emerald-500",
  },
  {
    id: 5,
    name: "Ahmed R.",
    age: 31,
    profession: "Business Analyst",
    education: "MBA",
    location: "London, UK",
    gender: "male",
    initials: "AR",
    color: "bg-blue-500",
  },
  {
    id: 6,
    name: "Hassan M.",
    age: 28,
    profession: "Civil Engineer",
    education: "BE Civil",
    location: "Dubai, UAE",
    gender: "male",
    initials: "HM",
    color: "bg-teal-500",
  },
];

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your information is secure and shared only with your permission. You control who sees your profile.",
  },
  {
    icon: Users,
    title: "Family Involved",
    description:
      "Families can create and manage profiles together, keeping everyone part of the beautiful journey.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    description:
      "All profiles are manually verified for authenticity. Real people, real intentions, real connections.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full px-4 py-2 mb-6 shadow-sm">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-emerald-800">
                  Trusted by Families Worldwide
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Where{" "}
                <span className="text-emerald-600 italic font-serif">
                  Beautiful
                </span>
                <br />
                Stories Begin
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Join the trusted matrimonial platform designed for Pakistani &
                Muslim families. Find your life partner with dignity, privacy,
                and family involvement.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8"
                  asChild
                >
                  <Link href="/register">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  asChild
                >
                  <Link href="/how-it-works">How It Works</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-center lg:justify-start gap-8">
                  <div className="flex -space-x-2">
                    {["A", "S", "M", "F"].map((letter, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white ${
                          ["bg-emerald-500", "bg-amber-500", "bg-rose-400", "bg-blue-500"][i]
                        }`}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">
                      Join thousands
                    </span>{" "}
                    of happy families
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Profile Cards Preview */}
            <div className="relative hidden lg:block">
              <div className="relative h-[500px]">
                {/* Background decorative elements */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60" />

                {/* Floating Profile Cards */}
                <Card className="absolute top-0 left-8 w-48 p-4 shadow-xl bg-white/90 backdrop-blur-sm border-0 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <span className="text-emerald-600 font-semibold text-lg">
                        OS
                      </span>
                    </div>
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                    <h4 className="font-semibold text-slate-900">Omar S.</h4>
                    <p className="text-sm text-slate-500">
                      29 • Software Engineer
                    </p>
                  </div>
                </Card>

                <Card className="absolute top-20 right-4 w-52 p-4 shadow-xl bg-white/90 backdrop-blur-sm border-0 transform rotate-[4deg] hover:rotate-0 transition-transform duration-300 z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                      <span className="text-pink-600 font-semibold text-lg">
                        AK
                      </span>
                    </div>
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                    <h4 className="font-semibold text-slate-900">Ayesha K.</h4>
                    <p className="text-sm text-slate-500">26 • Doctor • Lahore</p>
                  </div>
                </Card>

                <Card className="absolute bottom-20 right-16 w-48 p-4 shadow-xl bg-white/90 backdrop-blur-sm border-0 transform rotate-[8deg] hover:rotate-0 transition-transform duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <span className="text-blue-600 font-semibold text-lg">
                        AR
                      </span>
                    </div>
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                    <h4 className="font-semibold text-slate-900">Ahmed R.</h4>
                    <p className="text-sm text-slate-500">31 • Business Analyst</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built on Trust & Care
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We understand the importance of family involvement in finding the
              right match for your loved ones.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-b from-white to-slate-50"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Cards Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              DISCOVER PROFILES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Find Your Perfect Match
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Browse through verified profiles from professionals across
              Pakistan and the global diaspora.
            </p>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sampleProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="overflow-hidden hover:shadow-lg transition-shadow bg-white"
              >
                {/* Card Header with Avatar */}
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 relative flex items-center justify-center">
                  <div
                    className={`w-20 h-20 rounded-full ${profile.color} flex items-center justify-center text-white text-2xl font-semibold shadow-lg`}
                  >
                    {profile.initials}
                  </div>
                  <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {profile.name}
                    </h3>
                    <span className="text-slate-500 text-sm">
                      {profile.age} yrs
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span>{profile.profession}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <span>{profile.education}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{profile.location}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    asChild
                  >
                    <Link href="/register">View Profile</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* View More */}
          <div className="text-center mt-10">
            <Button
              size="lg"
              variant="outline"
              className="px-8"
              asChild
            >
              <Link href="/register">
                View All Profiles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Life Partner?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who have found their perfect match on
            NikahFirst.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8"
            asChild
          >
            <Link href="/register">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
