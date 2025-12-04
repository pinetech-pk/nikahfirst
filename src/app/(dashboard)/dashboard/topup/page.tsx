import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  Gift,
  Zap,
  Crown,
  Check,
  Info,
} from "lucide-react";

export default async function TopUpPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get wallet balances
  const redeemWallet = await prisma.redeemWallet.findUnique({
    where: { userId: session.user.id },
  });

  const fundingWallet = await prisma.fundingWallet.findUnique({
    where: { userId: session.user.id },
  });

  const totalCredits =
    (redeemWallet?.balance || 0) + (fundingWallet?.balance || 0);

  // Placeholder top-up packages (will be managed via global settings later)
  const packages = [
    {
      id: "starter",
      name: "Starter Pack",
      credits: 10,
      price: 100,
      popular: false,
      icon: Gift,
    },
    {
      id: "basic",
      name: "Basic Pack",
      credits: 25,
      price: 200,
      bonus: 5,
      popular: false,
      icon: Zap,
    },
    {
      id: "popular",
      name: "Popular Pack",
      credits: 50,
      price: 350,
      bonus: 15,
      popular: true,
      icon: Crown,
    },
    {
      id: "premium",
      name: "Premium Pack",
      credits: 100,
      price: 600,
      bonus: 40,
      popular: false,
      icon: Crown,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Top Up Credits</h1>
        <p className="text-gray-500 mt-1">
          Purchase credits to send interests, view contacts, and unlock premium features
        </p>
      </div>

      {/* Current Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Balance
            </CardTitle>
            <Wallet className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCredits}</div>
            <p className="text-xs text-gray-500 mt-1">credits available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Funding Wallet
            </CardTitle>
            <CreditCard className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {fundingWallet?.balance || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">purchased credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Redeem Wallet
            </CardTitle>
            <Gift className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {redeemWallet?.balance || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">free credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                How credits work
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Credits from your <strong>Funding Wallet</strong> (purchased credits) are used first.
                Once depleted, credits from your <strong>Redeem Wallet</strong> (free daily credits) will be used.
                Purchased credits never expire!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Packages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Choose a Package
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative hover:shadow-lg transition-shadow ${
                pkg.popular ? "border-green-500 border-2" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pt-6">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <pkg.icon className={`h-6 w-6 ${pkg.popular ? "text-green-600" : "text-gray-600"}`} />
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">
                    {pkg.credits}
                  </span>
                  <span className="text-gray-500"> credits</span>
                  {pkg.bonus && (
                    <span className="block text-green-600 text-sm font-medium mt-1">
                      +{pkg.bonus} bonus credits
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    Rs. {pkg.price}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Send {pkg.credits} interests
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Never expires
                  </li>
                  {pkg.bonus && (
                    <li className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {pkg.bonus} bonus credits free
                    </li>
                  )}
                </ul>
                <Button
                  className={`w-full ${
                    pkg.popular
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  disabled
                >
                  Buy Now
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Payment integration coming soon
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
          <CardDescription>
            Secure payment options for Pakistani users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center text-gray-500">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium">JazzCash</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium">EasyPaisa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium">Bank Transfer</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium">Debit/Credit Card</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Payment integration will be available soon. For now, please contact support for manual top-up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
