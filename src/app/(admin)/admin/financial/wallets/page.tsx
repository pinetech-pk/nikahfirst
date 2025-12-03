"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleStatsCard } from "@/components/ui/stats-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Search,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Eye,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  subscription: string;
  fundingBalance: number;
  redeemBalance: number;
}

interface Stats {
  totalUsers: number;
  totalFundingCredits: number;
  totalRedeemCredits: number;
  usersWithCredits: number;
}

export default function CreditsAndWalletsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalFundingCredits: 0,
    totalRedeemCredits: 0,
    usersWithCredits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add credits dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/credits/overview");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setStats(data.stats);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const creditAmount = parseInt(amount, 10);

    if (isNaN(creditAmount) || creditAmount <= 0) {
      setSubmitError("Please enter a valid positive amount");
      setSubmitting(false);
      return;
    }

    if (creditAmount > 10000) {
      setSubmitError("Amount cannot exceed 10,000 credits per transaction");
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
          userId: selectedUser.id,
          amount: creditAmount,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add credits");
      }

      setSubmitSuccess(data.message);
      setAmount("");
      setReason("");

      // Refresh data
      fetchData();

      // Close dialog after a short delay
      setTimeout(() => {
        setDialogOpen(false);
        setSelectedUser(null);
        setSubmitSuccess(null);
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddCreditsDialog = (user: User) => {
    setSelectedUser(user);
    setAmount("");
    setReason("");
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.name?.toLowerCase() || "").includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone || "").includes(query)
    );
  });

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Funding Credits",
      value: stats.totalFundingCredits.toLocaleString(),
      icon: DollarSign,
      iconColor: "bg-green-100 text-green-600",
    },
    {
      title: "Total Redeem Credits",
      value: stats.totalRedeemCredits.toLocaleString(),
      icon: Wallet,
      iconColor: "bg-purple-100 text-purple-600",
    },
    {
      title: "Users with Credits",
      value: stats.usersWithCredits.toLocaleString(),
      icon: TrendingUp,
      iconColor: "bg-orange-100 text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credits & Wallets</h1>
        <p className="text-gray-600 mt-1">
          Manage user credits and funding wallets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <SimpleStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>User Wallets</CardTitle>
              <CardDescription>
                Search users and add credits to their funding wallets
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-9 w-full md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Subscription
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Funding Wallet
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Redeem Wallet
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
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
                            <p className="font-medium">
                              {user.name || "No name"}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{user.subscription}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-blue-600">
                          {user.fundingBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-green-600">
                          {user.redeemBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold">
                          {(
                            user.fundingBalance + user.redeemBalance
                          ).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openAddCreditsDialog(user)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Credits
                          </Button>
                          <Link href={`/admin/users/regular/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Credits Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Credits
            </DialogTitle>
            <DialogDescription>
              Add credits to {selectedUser?.name || selectedUser?.email}&apos;s
              funding wallet
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-700 font-medium">{submitSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleAddCredits} className="space-y-4">
              {/* User Info */}
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {selectedUser.name
                      ? selectedUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : selectedUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedUser.name || "No name"}
                    </p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dialog-amount">Credits Amount *</Label>
                <Input
                  id="dialog-amount"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="Enter amount (1-10,000)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dialog-reason">Reason (Optional)</Label>
                <Textarea
                  id="dialog-reason"
                  placeholder="e.g., Promotional credits, Compensation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Credits
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
