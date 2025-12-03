"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Wallet,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  History,
  User,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  subscription: string;
  fundingWallet: {
    balance: number;
  } | null;
  redeemWallet: {
    balance: number;
    limit: number;
  } | null;
}

interface Transaction {
  id: string;
  type: string;
  walletType: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function AddCreditsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user with wallet info
      const response = await fetch(`/api/admin/credits/user/${userId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data.user);
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const creditAmount = parseInt(amount, 10);

    if (isNaN(creditAmount) || creditAmount <= 0) {
      setError("Please enter a valid positive amount");
      setSubmitting(false);
      return;
    }

    if (creditAmount > 10000) {
      setError("Amount cannot exceed 10,000 credits per transaction");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/credits/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount: creditAmount,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add credits");
      }

      setSuccess(data.message);
      setAmount("");
      setReason("");

      // Refresh user data
      fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchUserData}>Try Again</Button>
            <Link href="/admin/users/regular">
              <Button variant="outline">Back to Users</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/users/regular/${userId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Credits</h1>
          <p className="text-gray-600 mt-1">
            Add credits to user&apos;s funding wallet
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Add Credits Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info Card */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.name || "No name set"}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <Badge className="mt-1" variant="outline">
                      {user.subscription}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Credits Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Credits to Funding Wallet
              </CardTitle>
              <CardDescription>
                Credits will be added to the user&apos;s funding wallet (paid
                credits). These credits are used first when the user performs
                actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Success Message */}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Credits Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="Enter amount (1-10,000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum 10,000 credits per transaction
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Promotional credits, Compensation for issue, etc."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    This will be recorded in the transaction history
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Credits...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Credits
                      </>
                    )}
                  </Button>
                  <Link href={`/admin/users/regular/${userId}`}>
                    <Button type="button" variant="outline" disabled={submitting}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Wallet Info & History */}
        <div className="space-y-6">
          {/* Current Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Funding Wallet */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Funding Wallet</span>
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {user?.fundingWallet?.balance ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Paid credits</p>
              </div>

              {/* Redeem Wallet */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Redeem Wallet</span>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {user?.redeemWallet?.balance ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Limit: {user?.redeemWallet?.limit ?? 0} credits
                </p>
              </div>

              {/* Total */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                <span className="text-sm text-gray-600">Total Credits</span>
                <p className="text-3xl font-bold text-gray-900">
                  {(user?.fundingWallet?.balance ?? 0) +
                    (user?.redeemWallet?.balance ?? 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Credit Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No credit transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={tx.type === "CREDIT" ? "default" : "secondary"}
                            className={
                              tx.type === "CREDIT"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {tx.type === "CREDIT" ? "+" : "-"}
                            {tx.amount}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {tx.walletType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
