"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShieldCheck,
  Search,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  User,
  AlertTriangle,
  Loader2,
  X,
  Calendar,
} from "lucide-react";

interface VerificationRequest {
  id: string;
  phone: string;
  otp: string;
  expiresAt: string;
  requestedAt: string;
  attempts: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    phoneVerified: boolean;
    createdAt: string;
  };
}

interface UnverifiedUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  phoneVerifications: {
    id: string;
    requestedAt: string;
    expiresAt: string;
  }[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Helper function to format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return formatDate(dateString);
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Helper function to format date with time
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper function to get time remaining
function getTimeRemaining(expiresAt: string): string {
  const expiry = new Date(expiresAt);
  const now = new Date();
  if (expiry <= now) return "Expired";

  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
  return `${diffMins}m`;
}

export default function UserVerificationPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<VerificationRequest[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "verify" | "reject" | "reminder";
    data?: any;
  }>({ open: false, type: "verify" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users/verification?${params}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (activeTab === "pending") {
        setPendingRequests(result.data);
      } else {
        setUnverifiedUsers(result.data);
      }
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching verification data:", error);
      showMessage("error", "Failed to load verification data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, search]);

  useEffect(() => {
    fetchData();
    setSelectedUsers([]);
  }, [fetchData]);

  const handleVerify = async (verificationId?: string, userId?: string) => {
    setActionLoading(verificationId || userId || "action");
    try {
      const response = await fetch("/api/admin/users/verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          verificationId,
          userId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      showMessage("success", result.message);
      fetchData();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to verify user");
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: "verify" });
    }
  };

  const handleReject = async (verificationId: string) => {
    setActionLoading(verificationId);
    try {
      const response = await fetch("/api/admin/users/verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          verificationId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      showMessage("success", result.message);
      fetchData();
    } catch (error: any) {
      showMessage("error", error.message || "Failed to reject request");
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: "reject" });
    }
  };

  const handleSendReminders = async () => {
    if (selectedUsers.length === 0) {
      showMessage("error", "Please select users to send reminders");
      return;
    }

    setActionLoading("reminder");
    try {
      const response = await fetch("/api/admin/users/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_reminder",
          userIds: selectedUsers,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      showMessage("success", result.message);
      setSelectedUsers([]);
    } catch (error: any) {
      showMessage("error", error.message || "Failed to send reminders");
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: "reminder" });
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === unverifiedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(unverifiedUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
          User Verification
        </h1>
        <p className="text-gray-500 mt-1">
          Manage phone verification requests and track unverified users
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert
          className={`${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setMessage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold">
                {activeTab === "pending" ? pagination.total : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unverified Users</p>
              <p className="text-2xl font-bold">
                {activeTab === "unverified" ? pagination.total : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Selected for Reminder</p>
              <p className="text-2xl font-bold">{selectedUsers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Verification Management</CardTitle>
              <CardDescription>
                Review verification requests and manage unverified users
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Requests
              </TabsTrigger>
              <TabsTrigger value="unverified" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Unverified Users
              </TabsTrigger>
            </TabsList>

            {/* Pending Requests Tab */}
            <TabsContent value="pending">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending verification requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phone Number</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">OTP Code</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Requested</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Expires</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Attempts</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium">{request.user.name || "No Name"}</p>
                                <p className="text-sm text-gray-500">{request.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="font-mono">{request.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className="font-mono text-lg">
                              {request.otp}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-500">
                              {formatDateTime(request.requestedAt)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                new Date(request.expiresAt) > new Date() ? "outline" : "destructive"
                              }
                            >
                              {getTimeRemaining(request.expiresAt)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{request.attempts} / 5</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    type: "verify",
                                    data: { verificationId: request.id },
                                  })
                                }
                                disabled={actionLoading === request.id}
                              >
                                {actionLoading === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    type: "reject",
                                    data: { verificationId: request.id },
                                  })
                                }
                                disabled={actionLoading === request.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Unverified Users Tab */}
            <TabsContent value="unverified">
              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-amber-800">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setConfirmDialog({ open: true, type: "reminder" })}
                    disabled={actionLoading === "reminder"}
                  >
                    {actionLoading === "reminder" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Send Reminder
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : unverifiedUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>All users with phone numbers are verified</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 w-12">
                          <Checkbox
                            checked={
                              selectedUsers.length === unverifiedUsers.length &&
                              unverifiedUsers.length > 0
                            }
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phone Number</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Registered</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Request Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unverifiedUsers.map((user) => {
                        const hasPendingRequest = user.phoneVerifications.length > 0;
                        return (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => toggleSelectUser(user.id)}
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-medium">{user.name || "No Name"}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="font-mono">{user.phone}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {formatDate(user.createdAt)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-500">
                                {formatRelativeTime(user.lastLoginAt)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {hasPendingRequest ? (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  No Request
                                </Badge>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    type: "verify",
                                    data: { userId: user.id },
                                  })
                                }
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Verify
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "verify" && "Verify Phone Number"}
              {confirmDialog.type === "reject" && "Reject Verification Request"}
              {confirmDialog.type === "reminder" && "Send Verification Reminder"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "verify" &&
                "Are you sure you want to mark this phone number as verified? This will update the user's verification status."}
              {confirmDialog.type === "reject" &&
                "Are you sure you want to reject this verification request? The request will be expired."}
              {confirmDialog.type === "reminder" &&
                `Are you sure you want to send a verification reminder email to ${selectedUsers.length} user(s)?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === "verify") {
                  handleVerify(confirmDialog.data?.verificationId, confirmDialog.data?.userId);
                } else if (confirmDialog.type === "reject") {
                  handleReject(confirmDialog.data?.verificationId);
                } else if (confirmDialog.type === "reminder") {
                  handleSendReminders();
                }
              }}
            >
              {confirmDialog.type === "verify" && "Verify"}
              {confirmDialog.type === "reject" && "Reject"}
              {confirmDialog.type === "reminder" && "Send Reminder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
