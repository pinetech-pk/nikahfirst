import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Find Your Life Partner
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Trusted matrimonial platform for Pakistani & Muslim families
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-slate-600">
              Your information is secure and shared only with your permission
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Family Involved</h3>
            <p className="text-slate-600">
              Families can create and manage profiles together
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Verified Profiles</h3>
            <p className="text-slate-600">
              All profiles are verified for authenticity
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
