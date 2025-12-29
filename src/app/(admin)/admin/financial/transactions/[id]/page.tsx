"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Wallet,
  Clock,
  Hash,
  FileText,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  ExternalLink,
  Receipt,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  subscription: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  walletType: string;
  amount: number;
  description: string;
  paymentMethod: string | null;
  paymentId: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  user: UserData;
}

interface RelatedTransaction {
  id: string;
  type: string;
  walletType: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletInfo {
  funding: {
    balance: number;
    totalPurchased: number;
    totalSpent: number;
  } | null;
  redeem: {
    balance: number;
    limit: number;
  } | null;
}

const TRANSACTION_TYPES: Record<string, { label: string; color: string }> = {
  CREDIT: { label: "Credit", color: "bg-green-100 text-green-700" },
  DEBIT: { label: "Debit", color: "bg-red-100 text-red-700" },
  PURCHASE: { label: "Purchase", color: "bg-blue-100 text-blue-700" },
  REDEMPTION: { label: "Redemption", color: "bg-purple-100 text-purple-700" },
  REFUND: { label: "Refund", color: "bg-orange-100 text-orange-700" },
  BONUS: { label: "Bonus", color: "bg-emerald-100 text-emerald-700" },
  TOP_UP: { label: "Top Up", color: "bg-cyan-100 text-cyan-700" },
};

const WALLET_TYPES: Record<string, { label: string; color: string }> = {
  FUNDING: { label: "Funding Wallet", color: "bg-blue-100 text-blue-700" },
  REDEEM: { label: "Redeem Wallet", color: "bg-green-100 text-green-700" },
};

function isPositiveTransaction(type: string): boolean {
  return ["CREDIT", "PURCHASE", "TOP_UP", "BONUS", "REFUND"].includes(type);
}

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<RelatedTransaction[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchTransaction();
  }, [resolvedParams.id]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/transactions/${resolvedParams.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Transaction not found");
        }
        throw new Error("Failed to fetch transaction");
      }

      const data = await response.json();
      setTransaction(data.transaction);
      setRelatedTransactions(data.relatedTransactions);
      setWalletInfo(data.walletInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/admin/transactions/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete transaction");
      }

      setDeleteSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/financial/transactions");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (deleteSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Deleted</h2>
          <p className="text-gray-500">Redirecting to transactions list...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error || "Transaction not found"}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchTransaction}>Try Again</Button>
            <Link href="/admin/financial/transactions">
              <Button variant="outline">Back to List</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = TRANSACTION_TYPES[transaction.type] || {
    label: transaction.type,
    color: "bg-gray-100 text-gray-700",
  };
  const walletConfig = WALLET_TYPES[transaction.walletType] || {
    label: transaction.walletType,
    color: "bg-gray-100 text-gray-700",
  };
  const isPositive = isPositiveTransaction(transaction.type);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/financial/transactions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-600 mt-1">
            View transaction information and related data
          </p>
        </div>
        {isSuperAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Transaction
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this transaction record. This action cannot
                  be undone.
                  <br />
                  <br />
                  <strong className="text-amber-600">Note:</strong> Deleting a transaction
                  does NOT reverse or refund the credits. It only removes the record from
                  the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Transaction"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Transaction Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isPositive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowDownCircle className="h-8 w-8" />
                    ) : (
                      <ArrowUpCircle className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      <span className={isPositive ? "text-green-600" : "text-red-600"}>
                        {isPositive ? "+" : "-"}
                        {transaction.amount.toLocaleString()}
                      </span>{" "}
                      Credits
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {transaction.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                  <Badge variant="outline" className={walletConfig.color}>
                    {walletConfig.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm">{transaction.id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Date & Time
                  </p>
                  <p className="text-sm">
                    {format(new Date(transaction.createdAt), "PPpp")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(transaction.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {transaction.referenceType && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Reference Type
                    </p>
                    <p className="text-sm">{transaction.referenceType}</p>
                  </div>
                )}

                {transaction.referenceId && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Reference ID
                    </p>
                    <p className="font-mono text-sm">{transaction.referenceId}</p>
                  </div>
                )}

                {transaction.paymentMethod && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Method
                    </p>
                    <p className="text-sm">{transaction.paymentMethod}</p>
                  </div>
                )}

                {transaction.paymentId && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Payment ID
                    </p>
                    <p className="font-mono text-sm">{transaction.paymentId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Transactions */}
          {relatedTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent User Transactions</CardTitle>
                <CardDescription>
                  Other transactions by the same user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedTransactions.map((tx) => {
                    const txType = TRANSACTION_TYPES[tx.type] || {
                      label: tx.type,
                      color: "bg-gray-100 text-gray-700",
                    };
                    const txIsPositive = isPositiveTransaction(tx.type);

                    return (
                      <Link
                        key={tx.id}
                        href={`/admin/financial/transactions/${tx.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              txIsPositive
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {txIsPositive ? (
                              <ArrowDownCircle className="h-4 w-4" />
                            ) : (
                              <ArrowUpCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {tx.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(tx.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={txType.color} variant="secondary">
                            {txType.label}
                          </Badge>
                          <span
                            className={`font-semibold ${
                              txIsPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {txIsPositive ? "+" : "-"}
                            {tx.amount}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {transaction.user.name
                    ? transaction.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : transaction.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.user.name || "No name"}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.user.email}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                {transaction.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span>{transaction.user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <Badge variant="outline">{transaction.user.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    className={
                      transaction.user.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {transaction.user.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subscription</span>
                  <Badge variant="secondary">{transaction.user.subscription}</Badge>
                </div>
              </div>

              <Link href={`/admin/users/regular/${transaction.user.id}`}>
                <Button variant="outline" className="w-full mt-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View User Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Wallet Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Wallet Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletInfo?.funding && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-blue-800">Funding Wallet</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {walletInfo.funding.balance.toLocaleString()}
                  </p>
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>Purchased: {walletInfo.funding.totalPurchased}</span>
                    <span>Spent: {walletInfo.funding.totalSpent}</span>
                  </div>
                </div>
              )}

              {walletInfo?.redeem && (
                <div className="p-4 bg-green-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-800">Redeem Wallet</p>
                  <p className="text-2xl font-bold text-green-700">
                    {walletInfo.redeem.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Limit: {walletInfo.redeem.limit} credits
                  </p>
                </div>
              )}

              {!walletInfo?.funding && !walletInfo?.redeem && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No wallet information available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/admin/users/regular/${transaction.user.id}/credits`}>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage User Credits
                </Button>
              </Link>
              <Link
                href={`/admin/financial/transactions?userId=${transaction.userId}`}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="h-4 w-4 mr-2" />
                  All User Transactions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
