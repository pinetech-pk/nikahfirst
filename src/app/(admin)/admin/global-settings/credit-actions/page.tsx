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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coins,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  Clock,
} from "lucide-react";

interface CreditAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  creditCost: number;
  durationDays: number | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyAction: Partial<CreditAction> = {
  slug: "",
  name: "",
  description: "",
  category: "general",
  creditCost: 1,
  durationDays: null,
  isActive: true,
  sortOrder: 0,
};

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "connection", label: "Connection" },
  { value: "profile", label: "Profile Access" },
  { value: "messaging", label: "Messaging" },
  { value: "boost", label: "Boost" },
  { value: "premium", label: "Premium Features" },
];

export default function CreditActionsPage() {
  const [actions, setActions] = useState<CreditAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CreditAction | null>(null);
  const [formData, setFormData] = useState<Partial<CreditAction>>(emptyAction);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<CreditAction | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/credit-actions");

      if (!response.ok) {
        throw new Error("Failed to fetch credit actions");
      }

      const data = await response.json();
      setActions(data.actions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingAction(null);
    setFormData(emptyAction);
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const openEditDialog = (action: CreditAction) => {
    setEditingAction(action);
    setFormData({
      slug: action.slug,
      name: action.name,
      description: action.description || "",
      category: action.category || "general",
      creditCost: action.creditCost,
      durationDays: action.durationDays,
      isActive: action.isActive,
      sortOrder: action.sortOrder,
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const url = editingAction
        ? `/api/admin/global-settings/credit-actions/${editingAction.id}`
        : "/api/admin/global-settings/credit-actions";

      const response = await fetch(url, {
        method: editingAction ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          durationDays: formData.durationDays || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save action");
      }

      setSubmitSuccess(
        editingAction ? "Action updated successfully" : "Action created successfully"
      );
      fetchActions();

      setTimeout(() => {
        setDialogOpen(false);
        setSubmitSuccess(null);
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (action: CreditAction) => {
    setActionToDelete(action);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!actionToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/global-settings/credit-actions/${actionToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete action");
      }

      fetchActions();
      setDeleteDialogOpen(false);
      setActionToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const found = CATEGORIES.find((c) => c.value === category);
    return found?.label || category || "General";
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      connection: "bg-blue-100 text-blue-700",
      profile: "bg-purple-100 text-purple-700",
      messaging: "bg-green-100 text-green-700",
      boost: "bg-orange-100 text-orange-700",
      premium: "bg-yellow-100 text-yellow-700",
      general: "bg-gray-100 text-gray-700",
    };
    return colors[category || "general"] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading credit actions...</p>
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
          <Button onClick={fetchActions}>Try Again</Button>
        </div>
      </div>
    );
  }

  const activeActions = actions.filter((a) => a.isActive).length;
  const totalCreditCost = actions.reduce((sum, a) => sum + a.creditCost, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Actions</h1>
          <p className="text-gray-600 mt-1">
            Configure credit costs for platform actions
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Coins className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Actions</p>
                <p className="text-2xl font-bold">{actions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Actions</p>
                <p className="text-2xl font-bold">{activeActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Credit Cost</p>
                <p className="text-2xl font-bold">
                  {actions.length > 0
                    ? (totalCreditCost / actions.length).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Credit Actions</CardTitle>
          <CardDescription>
            Define how many credits each action costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No credit actions found</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Action
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Category
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      Credit Cost
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      Duration
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
                  {actions.map((action) => (
                    <tr key={action.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-sm text-gray-500">{action.slug}</p>
                          {action.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            action.category
                          )}`}
                        >
                          {getCategoryLabel(action.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                          <Coins className="h-4 w-4" />
                          {action.creditCost}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {action.durationDays ? (
                          <span className="text-sm">{action.durationDays} days</span>
                        ) : (
                          <span className="text-sm text-gray-400">One-time</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={action.isActive ? "default" : "secondary"}>
                          {action.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(action)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(action)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {editingAction ? "Edit Credit Action" : "Create Credit Action"}
            </DialogTitle>
            <DialogDescription>
              {editingAction
                ? "Update the credit action details"
                : "Add a new action that costs credits"}
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-700 font-medium">{submitSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., REQUEST_CONNECTION"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                      })
                    }
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Request Connection"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this action does..."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category || "general"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditCost">Credit Cost *</Label>
                  <Input
                    id="creditCost"
                    type="number"
                    min="1"
                    value={formData.creditCost || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        creditCost: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="0"
                    placeholder="Leave empty for one-time"
                    value={formData.durationDays || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    For time-limited features like boosts
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  disabled={submitting}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingAction ? (
                    "Update Action"
                  ) : (
                    "Create Action"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credit Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{actionToDelete?.name}&quot;
              action? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
