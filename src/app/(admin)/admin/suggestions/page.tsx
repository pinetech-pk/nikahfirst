"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  X,
} from "lucide-react";

// Types
interface Suggestion {
  id: string;
  fieldType: string;
  suggestedValue: string;
  suggestedLabel: string | null;
  additionalInfo: string | null;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  reviewedBy: {
    id: string;
    name: string | null;
  } | null;
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

// Field type labels
const FIELD_TYPE_LABELS: Record<string, string> = {
  MOTHER_TONGUE: "Mother Tongue",
  CASTE: "Caste",
  ETHNICITY: "Ethnicity",
  CITY: "City",
  EDUCATION_FIELD: "Education Field",
  OTHER: "Other",
};

// Status badges
const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  PENDING: { className: "bg-yellow-100 text-yellow-700", label: "Pending" },
  APPROVED: { className: "bg-green-100 text-green-700", label: "Approved" },
  REJECTED: { className: "bg-red-100 text-red-700", label: "Rejected" },
  DUPLICATE: { className: "bg-gray-100 text-gray-700", label: "Duplicate" },
  MERGED: { className: "bg-blue-100 text-blue-700", label: "Merged" },
};

export default function SuggestionsPage() {
  // State
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [fieldTypeFilter, setFieldTypeFilter] = useState<string>("all");

  // Review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewNote, setReviewNote] = useState("");
  const [createLanguage, setCreateLanguage] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = "/api/admin/suggestions";
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (fieldTypeFilter && fieldTypeFilter !== "all") params.append("fieldType", fieldTypeFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestions(data.suggestions);
      setCounts(data.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fieldTypeFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Open review dialog
  const openReviewDialog = (suggestion: Suggestion, action: "approve" | "reject") => {
    setSelectedSuggestion(suggestion);
    setReviewAction(action);
    setReviewNote("");
    setCreateLanguage(action === "approve" && suggestion.fieldType === "MOTHER_TONGUE");
    setReviewDialogOpen(true);
  };

  // Handle review submission
  const handleReview = async () => {
    if (!selectedSuggestion) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/suggestions/${selectedSuggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewAction === "approve" ? "APPROVED" : "REJECTED",
          reviewNote: reviewNote || null,
          createLanguage: reviewAction === "approve" && createLanguage && selectedSuggestion.fieldType === "MOTHER_TONGUE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update suggestion");
      }

      fetchSuggestions();
      setReviewDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Suggestions</h1>
          <p className="text-gray-600 mt-1">
            Review and approve user-submitted suggestions for mother tongues and other fields
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "PENDING" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{counts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "APPROVED" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("APPROVED")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold">{counts.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "REJECTED" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("REJECTED")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold">{counts.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">All Suggestions</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Suggestions</CardTitle>
            <CardDescription>
              {statusFilter === "PENDING"
                ? "Review pending suggestions from users"
                : statusFilter === "all"
                ? "All user suggestions"
                : `${STATUS_BADGES[statusFilter]?.label || statusFilter} suggestions`}
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <Select value={fieldTypeFilter} onValueChange={setFieldTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No suggestions found matching the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Suggested Value</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {FIELD_TYPE_LABELS[suggestion.fieldType] || suggestion.fieldType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {suggestion.suggestedValue}
                      {suggestion.suggestedLabel && suggestion.suggestedLabel !== suggestion.suggestedValue && (
                        <span className="text-gray-500 text-sm ml-2">
                          ({suggestion.suggestedLabel})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{suggestion.user.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{suggestion.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(suggestion.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGES[suggestion.status]?.className || ""}>
                        {STATUS_BADGES[suggestion.status]?.label || suggestion.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {suggestion.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => openReviewDialog(suggestion, "approve")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openReviewDialog(suggestion, "reject")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setReviewDialogOpen(true);
                            setReviewAction("approve"); // Just to view
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSuggestion?.status === "PENDING"
                ? reviewAction === "approve"
                  ? "Approve Suggestion"
                  : "Reject Suggestion"
                : "Suggestion Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedSuggestion?.status === "PENDING"
                ? `Review this ${FIELD_TYPE_LABELS[selectedSuggestion?.fieldType || ""] || "field"} suggestion`
                : "View details of this suggestion"}
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <p className="font-medium">
                    {FIELD_TYPE_LABELS[selectedSuggestion.fieldType] || selectedSuggestion.fieldType}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Suggested Value</Label>
                  <p className="font-medium text-lg">{selectedSuggestion.suggestedValue}</p>
                </div>
                {selectedSuggestion.additionalInfo && (
                  <div>
                    <Label className="text-xs text-gray-500">Additional Info</Label>
                    <p className="text-sm">{selectedSuggestion.additionalInfo}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Submitted By</Label>
                  <p className="text-sm">
                    {selectedSuggestion.user.name || "Unknown"} ({selectedSuggestion.user.email})
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Submitted</Label>
                  <p className="text-sm">{formatDate(selectedSuggestion.createdAt)}</p>
                </div>
              </div>

              {selectedSuggestion.status === "PENDING" ? (
                <>
                  {/* Option to create language when approving MOTHER_TONGUE */}
                  {reviewAction === "approve" && selectedSuggestion.fieldType === "MOTHER_TONGUE" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createLanguage"
                        checked={createLanguage}
                        onCheckedChange={(checked) => setCreateLanguage(checked === true)}
                      />
                      <Label htmlFor="createLanguage" className="text-sm">
                        Also add &quot;{selectedSuggestion.suggestedValue}&quot; to the Languages list
                      </Label>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reviewNote">
                      {reviewAction === "approve" ? "Notes (optional)" : "Reason for Rejection"}
                    </Label>
                    <Textarea
                      id="reviewNote"
                      placeholder={
                        reviewAction === "approve"
                          ? "Any notes about this approval..."
                          : "Explain why this suggestion was rejected..."
                      }
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReview}
                      disabled={submitting}
                      className={reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : reviewAction === "approve" ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <p>
                      <Badge className={STATUS_BADGES[selectedSuggestion.status]?.className || ""}>
                        {STATUS_BADGES[selectedSuggestion.status]?.label || selectedSuggestion.status}
                      </Badge>
                    </p>
                  </div>
                  {selectedSuggestion.reviewedBy && (
                    <div>
                      <Label className="text-xs text-gray-500">Reviewed By</Label>
                      <p className="text-sm">{selectedSuggestion.reviewedBy.name || "Unknown"}</p>
                    </div>
                  )}
                  {selectedSuggestion.reviewedAt && (
                    <div>
                      <Label className="text-xs text-gray-500">Reviewed At</Label>
                      <p className="text-sm">{formatDate(selectedSuggestion.reviewedAt)}</p>
                    </div>
                  )}
                  {selectedSuggestion.reviewNote && (
                    <div>
                      <Label className="text-xs text-gray-500">Review Note</Label>
                      <p className="text-sm">{selectedSuggestion.reviewNote}</p>
                    </div>
                  )}
                  <div className="pt-4">
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="w-full">
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
