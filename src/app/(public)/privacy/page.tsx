import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | NikahFirst",
  description:
    "Learn how NikahFirst collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-600">Last updated: December 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-900 mt-0">
              1. Introduction
            </h2>
            <p className="text-slate-600">
              NikahFirst (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you use our matrimonial platform.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              2. Information We Collect
            </h2>
            <p className="text-slate-600">
              We collect information you provide directly to us, including:
            </p>
            <ul className="text-slate-600">
              <li>
                Account information (name, email, phone number, password)
              </li>
              <li>
                Profile information (age, gender, location, education,
                profession, family details)
              </li>
              <li>Photos you upload to your profile</li>
              <li>Partner preferences and search criteria</li>
              <li>Communications with other users and our support team</li>
              <li>Payment information for premium services</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              3. How We Use Your Information
            </h2>
            <p className="text-slate-600">We use the information we collect to:</p>
            <ul className="text-slate-600">
              <li>Create and manage your account</li>
              <li>Display your profile to potential matches</li>
              <li>Provide matchmaking and recommendation services</li>
              <li>Process transactions and send related information</li>
              <li>Send notifications about matches, interests, and messages</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze usage patterns to improve our services</li>
              <li>Detect, prevent, and address fraud and abuse</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              4. Information Sharing
            </h2>
            <p className="text-slate-600">
              Your profile information is visible to other registered members
              based on your privacy settings. We do not sell your personal
              information. We may share information:
            </p>
            <ul className="text-slate-600">
              <li>With other users as part of the matching process</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              5. Your Privacy Controls
            </h2>
            <p className="text-slate-600">You have control over your information:</p>
            <ul className="text-slate-600">
              <li>Edit or delete your profile information at any time</li>
              <li>Control who can see your photos and contact details</li>
              <li>Hide your profile from search results</li>
              <li>Block specific users from contacting you</li>
              <li>Delete your account and associated data</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              6. Data Security
            </h2>
            <p className="text-slate-600">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              7. Data Retention
            </h2>
            <p className="text-slate-600">
              We retain your information for as long as your account is active
              or as needed to provide services. You may request deletion of your
              account and data at any time by contacting our support team.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              8. Contact Us
            </h2>
            <p className="text-slate-600">
              If you have questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <ul className="text-slate-600">
              <li>Email: contact@nikahfirst.com</li>
              <li>Phone: +92 300 3736005</li>
            </ul>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 m-0">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;Last updated&quot; date.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
