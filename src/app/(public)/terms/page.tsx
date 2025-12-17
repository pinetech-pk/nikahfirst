import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | NikahFirst",
  description:
    "Read the terms and conditions for using NikahFirst matrimonial platform.",
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-600">Last updated: December 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-900 mt-0">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600">
              By accessing or using NikahFirst, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our platform.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              2. Eligibility
            </h2>
            <p className="text-slate-600">To use NikahFirst, you must:</p>
            <ul className="text-slate-600">
              <li>Be at least 18 years of age</li>
              <li>Be legally able to enter into marriage</li>
              <li>Not be currently married (unless legally separated)</li>
              <li>Create only one account for yourself</li>
              <li>
                Provide accurate and truthful information in your profile
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              3. Account Responsibilities
            </h2>
            <p className="text-slate-600">You are responsible for:</p>
            <ul className="text-slate-600">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your profile information is accurate and current</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              4. Acceptable Use
            </h2>
            <p className="text-slate-600">You agree NOT to:</p>
            <ul className="text-slate-600">
              <li>Provide false or misleading information</li>
              <li>Use the platform for any purpose other than matrimonial</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Send spam, solicitations, or promotional content</li>
              <li>Upload inappropriate, offensive, or illegal content</li>
              <li>Attempt to access other users&apos; accounts</li>
              <li>Use automated systems to access the platform</li>
              <li>Engage in any fraudulent or deceptive activities</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900">
              5. Profile Verification
            </h2>
            <p className="text-slate-600">
              All profiles are reviewed before being published. We reserve the
              right to reject or remove any profile that violates our guidelines
              or appears to be fraudulent. Profile verification does not
              guarantee the accuracy of user-provided information.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              6. Credits and Payments
            </h2>
            <p className="text-slate-600">
              Some features require credits which can be purchased or earned.
              All purchases are final and non-refundable unless otherwise
              specified. We reserve the right to modify pricing at any time.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              7. Content Ownership
            </h2>
            <p className="text-slate-600">
              You retain ownership of content you upload but grant us a license
              to use, display, and distribute it on our platform. We own all
              rights to the NikahFirst platform, design, and features.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              8. Termination
            </h2>
            <p className="text-slate-600">
              We may suspend or terminate your account at any time for violation
              of these terms or for any reason at our discretion. You may delete
              your account at any time through your settings.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              9. Disclaimer
            </h2>
            <p className="text-slate-600">
              NikahFirst is a platform that connects individuals seeking
              marriage. We do not guarantee matches or outcomes. We are not
              responsible for the conduct of users or the accuracy of their
              profiles. Users are advised to exercise caution and involve family
              members in their search.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              10. Limitation of Liability
            </h2>
            <p className="text-slate-600">
              To the maximum extent permitted by law, NikahFirst shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the platform.
            </p>

            <h2 className="text-xl font-semibold text-slate-900">
              11. Contact Us
            </h2>
            <p className="text-slate-600">
              For questions about these Terms of Service, please contact us at:
            </p>
            <ul className="text-slate-600">
              <li>Email: contact@nikahfirst.com</li>
              <li>Phone: +92 300 3736005</li>
            </ul>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 m-0">
                We may update these Terms of Service from time to time. Continued
                use of the platform after changes constitutes acceptance of the
                new terms.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
