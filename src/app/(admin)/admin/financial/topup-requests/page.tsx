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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
  Eye,
  Check,
  X,
  DollarSign,
  Users,
  Building,
  Smartphone,
} from "lucide-react";

interface TopUpRequest {
  id: string;
  requestNumber: string;
  credits: number;
  bonusCredits: number;
  amount: number;
  paymentMethod: string;
  status: string;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  processedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  package: {
    name: string;
    credits: number;
    bonusCredits: number;
    price: number;
  } | null;
  processor: {
    name: string | null;
    email: string;
  } | null;
}

interface Stats {
  pending: number;
  completed: number;
  rejected: number;
  cancelled: number;
  total: number;
}

export default function TopUpRequestsPage() {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Process dialog state
  const [selectedRequest, setSelectedRequest] = useState<TopUpRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const url =
        statusFilter === "all"
          ? "/api/admin/topup-requests"
          : `/api/admin/topup-requests?status=${statusFilter}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();
      setRequests(data.requests);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openProcessDialog = (request: TopUpRequest) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setRejectionReason("");
    setProcessError(null);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    setProcessError(null);

    try {
      const response = await fetch(
        `/api/admin/topup-requests/${selectedRequest.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            adminNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve request");
      }

      setDialogOpen(false);
      fetchRequests();
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      setProcessError("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    setProcessError(null);

    try {
      const response = await fetch(
        `/api/admin/topup-requests/${selectedRequest.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            adminNotes,
            rejectionReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject request");
      }

      setDialogOpen(false);
      fetchRequests();
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method === "BANK_TRANSFER") return Building;
    if (method === "JAZZCASH" || method === "EASYPAISA") return Smartphone;
    return CreditCard;
  };

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.requestNumber.toLowerCase().includes(query) ||
      request.user.email.toLowerCase().includes(query) ||
      (request.user.name?.toLowerCase() || "").includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading requests...</p>
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
          <Button onClick={fetchRequests}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Top-Up Requests</h1>
        <p className="text-gray-600 mt-1">
          Review and process credit top-up requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${
            statusFilter === "PENDING" ? "ring-2 ring-yellow-400" : ""
          }`}
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            statusFilter === "COMPLETED" ? "ring-2 ring-green-400" : ""
          }`}
          onClick={() => setStatusFilter("COMPLETED")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            statusFilter === "REJECTED" ? "ring-2 ring-red-400" : ""
          }`}
          onClick={() => setStatusFilter("REJECTED")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            statusFilter === "all" ? "ring-2 ring-blue-400" : ""
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>
                {statusFilter === "all"
                  ? "All Requests"
                  : `${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Requests`}
              </CardTitle>
              <CardDescription>
                {stats.pending > 0 && (
                  <span className="text-yellow-600 font-medium">
                    {stats.pending} pending request{stats.pending > 1 ? "s" : ""} need
                    attention
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by request #, email..."
                className="pl-9 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Request
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Package
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      Amount
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      Method
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
                    const MethodIcon = getMethodIcon(request.paymentMethod);
                    return (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium">{request.requestNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium">
                            {request.user.name || "No name"}
                          </p>
                          <p className="text-sm text-gray-500">{request.user.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium">
                            {request.package?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.credits + request.bonusCredits} credits
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold">
                            ${Number(request.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MethodIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{request.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="py-4 px-4">
                          {request.status === "PENDING" ? (
                            <Button
                              size="sm"
                              onClick={() => openProcessDialog(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openProcessDialog(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === "PENDING"
                ? "Process Top-Up Request"
                : "Request Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.requestNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedRequest.user.name || "No name"}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <p className="font-medium">{selectedRequest.package?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.credits + selectedRequest.bonusCredits} credits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">
                    ${Number(selectedRequest.amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{selectedRequest.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Show existing notes/reason for non-pending */}
              {selectedRequest.status !== "PENDING" && (
                <>
                  {selectedRequest.processor && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Processed by: {selectedRequest.processor.name || selectedRequest.processor.email}
                      </p>
                      {selectedRequest.processedAt && (
                        <p className="text-sm text-blue-600">
                          on {new Date(selectedRequest.processedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedRequest.rejectionReason && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                  {selectedRequest.adminNotes && (
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        Admin Notes:
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.adminNotes}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Process Form for Pending */}
              {selectedRequest.status === "PENDING" && (
                <>
                  {processError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <p className="text-red-700 text-sm">{processError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Internal notes about this request..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      disabled={processing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">
                      Rejection Reason (Required for rejection)
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Why is this request being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      disabled={processing}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status !== "PENDING" && (
                <Button
                  onClick={() => setDialogOpen(false)}
                  className="w-full"
                  variant="outline"
                >
                  Close
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
