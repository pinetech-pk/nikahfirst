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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleStatsCard } from "@/components/ui/stats-card";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface Transaction {
  id: string;
  type: string;
  walletType: string;
  amount: number;
  description: string;
  paymentMethod: string | null;
  paymentId: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  user: User;
}

interface Stats {
  total: number;
  byType: Record<string, { count: number; totalAmount: number }>;
  byWalletType: Record<string, { count: number; totalAmount: number }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TRANSACTION_TYPES = [
  { value: "CREDIT", label: "Credit", color: "bg-green-100 text-green-700" },
  { value: "DEBIT", label: "Debit", color: "bg-red-100 text-red-700" },
  { value: "PURCHASE", label: "Purchase", color: "bg-blue-100 text-blue-700" },
  { value: "REDEMPTION", label: "Redemption", color: "bg-purple-100 text-purple-700" },
  { value: "REFUND", label: "Refund", color: "bg-orange-100 text-orange-700" },
  { value: "BONUS", label: "Bonus", color: "bg-emerald-100 text-emerald-700" },
  { value: "TOP_UP", label: "Top Up", color: "bg-cyan-100 text-cyan-700" },
];

const WALLET_TYPES = [
  { value: "FUNDING", label: "Funding", color: "bg-blue-100 text-blue-700" },
  { value: "REDEEM", label: "Redeem", color: "bg-green-100 text-green-700" },
];

function getTypeConfig(type: string) {
  return TRANSACTION_TYPES.find((t) => t.value === type) || {
    value: type,
    label: type,
    color: "bg-gray-100 text-gray-700",
  };
}

function getWalletTypeConfig(walletType: string) {
  return WALLET_TYPES.find((w) => w.value === walletType) || {
    value: walletType,
    label: walletType,
    color: "bg-gray-100 text-gray-700",
  };
}

function isPositiveTransaction(type: string): boolean {
  return ["CREDIT", "PURCHASE", "TOP_UP", "BONUS", "REFUND"].includes(type);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [walletTypeFilter, setWalletTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, typeFilter, walletTypeFilter, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter) params.append("type", typeFilter);
      if (walletTypeFilter) params.append("walletType", walletTypeFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/admin/transactions?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setWalletTypeFilter("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = searchQuery || typeFilter || walletTypeFilter || startDate || endDate;

  // Calculate stats for display
  const totalCredits = stats?.byType?.CREDIT?.totalAmount || 0;
  const totalDebits = stats?.byType?.DEBIT?.totalAmount || 0;
  const fundingTotal = stats?.byWalletType?.FUNDING?.count || 0;
  const redeemTotal = stats?.byWalletType?.REDEEM?.count || 0;

  const statsCards = [
    {
      title: "Total Transactions",
      value: stats?.total.toLocaleString() || "0",
      icon: Receipt,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Credits",
      value: totalCredits.toLocaleString(),
      icon: TrendingUp,
      iconColor: "bg-green-100 text-green-600",
    },
    {
      title: "Total Debits",
      value: totalDebits.toLocaleString(),
      icon: TrendingDown,
      iconColor: "bg-red-100 text-red-600",
    },
    {
      title: "Funding / Redeem",
      value: `${fundingTotal} / ${redeemTotal}`,
      icon: Wallet,
      iconColor: "bg-purple-100 text-purple-600",
    },
  ];

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

  if (error && transactions.length === 0) {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            View and manage all credit transactions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchTransactions}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {pagination.total.toLocaleString()} transactions found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-9 w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-gray-100" : ""}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Wallet</label>
                  <Select value={walletTypeFilter} onValueChange={setWalletTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All wallets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All wallets</SelectItem>
                      {WALLET_TYPES.map((wallet) => (
                        <SelectItem key={wallet.value} value={wallet.value}>
                          {wallet.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      className="pl-9 w-40"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      className="pl-9 w-40"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
              {hasActiveFilters && (
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Transaction
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Wallet
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const typeConfig = getTypeConfig(transaction.type);
                      const walletConfig = getWalletTypeConfig(transaction.walletType);
                      const isPositive = isPositiveTransaction(transaction.type);

                      return (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isPositive
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowDownCircle className="h-5 w-5" />
                                ) : (
                                  <ArrowUpCircle className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm line-clamp-1 max-w-[200px]">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {transaction.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              href={`/admin/users/regular/${transaction.user.id}`}
                              className="hover:underline"
                            >
                              <p className="font-medium text-sm">
                                {transaction.user.name || "No name"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {transaction.user.email}
                              </p>
                            </Link>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={walletConfig.color}>
                              {walletConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span
                              className={`font-semibold ${
                                isPositive ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isPositive ? "+" : "-"}
                              {transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm">
                                {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(transaction.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Link href={`/admin/financial/transactions/${transaction.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={pagination.page === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setPagination((prev) => ({ ...prev, page: pageNum }))
                            }
                            disabled={loading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={pagination.page === pagination.totalPages || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
