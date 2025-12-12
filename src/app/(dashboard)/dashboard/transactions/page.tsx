"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  CreditCard,
  Gift,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  walletType: string;
  amount: number;
  description: string;
  paymentMethod: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Summary {
  totalCredits: number;
  totalDebits: number;
  totalTopUps: number;
  totalPurchases: number;
  totalRedemptions: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [walletFilter, setWalletFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, typeFilter, walletFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }
      if (walletFilter !== "all") {
        params.set("walletType", walletFilter);
      }

      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "TOP_UP":
      case "CREDIT":
      case "BONUS":
      case "REFUND":
        return ArrowUpCircle;
      case "DEBIT":
      case "PURCHASE":
        return ArrowDownCircle;
      case "REDEMPTION":
        return Gift;
      default:
        return Wallet;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "TOP_UP":
      case "CREDIT":
      case "BONUS":
      case "REFUND":
        return "text-green-600";
      case "DEBIT":
      case "PURCHASE":
        return "text-red-600";
      case "REDEMPTION":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      TOP_UP: { variant: "default", label: "Top Up" },
      CREDIT: { variant: "default", label: "Credit" },
      DEBIT: { variant: "destructive", label: "Debit" },
      PURCHASE: { variant: "destructive", label: "Purchase" },
      REDEMPTION: { variant: "secondary", label: "Redemption" },
      REFUND: { variant: "outline", label: "Refund" },
      BONUS: { variant: "default", label: "Bonus" },
    };

    const config = variants[type] || { variant: "outline", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getWalletBadge = (walletType: string) => {
    if (walletType === "FUNDING") {
      return (
        <Badge variant="outline" className="text-green-600 border-green-300">
          <CreditCard className="h-3 w-3 mr-1" />
          Funding
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-300">
        <Gift className="h-3 w-3 mr-1" />
        Redeem
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading transactions...</p>
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
          <Button onClick={fetchTransactions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 mt-1">
            View all your credit transactions and activity
          </p>
        </div>
        <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Credits In
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{summary.totalCredits}
              </div>
              <p className="text-xs text-gray-500 mt-1">credits received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Credits Out
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{summary.totalDebits}
              </div>
              <p className="text-xs text-gray-500 mt-1">credits spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Top-Ups
              </CardTitle>
              <ArrowUpCircle className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {summary.totalTopUps}
              </div>
              <p className="text-xs text-gray-500 mt-1">completed purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Transactions
              </CardTitle>
              <Wallet className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {pagination?.total || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">all time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TOP_UP">Top Up</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="REDEMPTION">Redemption</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="BONUS">Bonus</SelectItem>
                </SelectContent>
              </Select>

              <Select value={walletFilter} onValueChange={setWalletFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wallets</SelectItem>
                  <SelectItem value="FUNDING">Funding Wallet</SelectItem>
                  <SelectItem value="REDEEM">Redeem Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )} of ${pagination.total} transactions`
              : "Your transaction history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
              <p className="text-sm text-gray-400 mt-1">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);
                const { date, time } = formatDate(transaction.createdAt);
                const isCredit = ["TOP_UP", "CREDIT", "BONUS", "REFUND", "REDEMPTION"].includes(
                  transaction.type
                );

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border-b last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full bg-gray-100 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(transaction.type)}
                          {getWalletBadge(transaction.walletType)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${colorClass}`}>
                        {isCredit ? "+" : "-"}
                        {transaction.amount} credits
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {date} at {time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
