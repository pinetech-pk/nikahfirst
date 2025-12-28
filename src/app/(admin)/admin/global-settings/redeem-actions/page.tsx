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
  Gift,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  Repeat,
  Timer,
} from "lucide-react";

interface RedeemAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  creditsAwarded: number;
  maxRedemptions: number | null;
  cooldownDays: number | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyAction: Partial<RedeemAction> = {
  slug: "",
  name: "",
  description: "",
  category: "onboarding",
  creditsAwarded: 1,
  maxRedemptions: null,
  cooldownDays: null,
  isActive: true,
  sortOrder: 0,
};

const CATEGORIES = [
  { value: "onboarding", label: "Onboarding" },
  { value: "engagement", label: "Engagement" },
  { value: "referral", label: "Referral" },
  { value: "promotion", label: "Promotion" },
  { value: "loyalty", label: "Loyalty" },
  { value: "achievement", label: "Achievement" },
];

export default function RedeemActionsPage() {
  const [actions, setActions] = useState<RedeemAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<RedeemAction | null>(null);
  const [formData, setFormData] = useState<Partial<RedeemAction>>(emptyAction);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<RedeemAction | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/redeem-actions");

      if (!response.ok) {
        throw new Error("Failed to fetch redeem actions");
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

  const openEditDialog = (action: RedeemAction) => {
    setEditingAction(action);
    setFormData({
      slug: action.slug,
      name: action.name,
      description: action.description || "",
      category: action.category || "onboarding",
      creditsAwarded: action.creditsAwarded,
      maxRedemptions: action.maxRedemptions,
      cooldownDays: action.cooldownDays,
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
        ? `/api/admin/global-settings/redeem-actions/${editingAction.id}`
        : "/api/admin/global-settings/redeem-actions";

      const response = await fetch(url, {
        method: editingAction ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxRedemptions: formData.maxRedemptions || null,
          cooldownDays: formData.cooldownDays || null,
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

  const openDeleteDialog = (action: RedeemAction) => {
    setActionToDelete(action);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!actionToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/global-settings/redeem-actions/${actionToDelete.id}`,
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
      onboarding: "bg-green-100 text-green-700",
      engagement: "bg-blue-100 text-blue-700",
      referral: "bg-purple-100 text-purple-700",
      promotion: "bg-orange-100 text-orange-700",
      loyalty: "bg-yellow-100 text-yellow-700",
      achievement: "bg-pink-100 text-pink-700",
    };
    return colors[category || "onboarding"] || colors.onboarding;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading redeem actions...</p>
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
  const totalCreditsAwarded = actions.reduce((sum, a) => sum + a.creditsAwarded, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redeem Actions</h1>
          <p className="text-gray-600 mt-1">
            Configure credit rewards for user actions
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
              <div className="p-3 bg-green-100 rounded-lg">
                <Gift className="h-6 w-6 text-green-600" />
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Repeat className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Credits Awarded</p>
                <p className="text-2xl font-bold">
                  {actions.length > 0
                    ? (totalCreditsAwarded / actions.length).toFixed(1)
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
          <CardTitle>All Redeem Actions</CardTitle>
          <CardDescription>
            Define how many credits users earn for each action
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No redeem actions found</p>
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
                      Credits Awarded
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      Limits
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
                        <span className="inline-flex items-center gap-1 font-bold text-green-600">
                          <Gift className="h-4 w-4" />
                          +{action.creditsAwarded}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-sm">
                          {action.maxRedemptions ? (
                            <span className="flex items-center justify-center gap-1 text-gray-600">
                              <Repeat className="h-3 w-3" />
                              {action.maxRedemptions}x max
                            </span>
                          ) : (
                            <span className="text-gray-400">Unlimited</span>
                          )}
                          {action.cooldownDays && (
                            <span className="flex items-center justify-center gap-1 text-gray-500 mt-1">
                              <Timer className="h-3 w-3" />
                              {action.cooldownDays}d cooldown
                            </span>
                          )}
                        </div>
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
              <Gift className="h-5 w-5" />
              {editingAction ? "Edit Redeem Action" : "Create Redeem Action"}
            </DialogTitle>
            <DialogDescription>
              {editingAction
                ? "Update the redeem action details"
                : "Add a new action that rewards credits"}
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
                    placeholder="e.g., PROFILE_CREATION"
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
                    placeholder="e.g., Profile Creation Bonus"
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
                  placeholder="Brief description of when this reward is given..."
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
                    value={formData.category || "onboarding"}
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
                  <Label htmlFor="creditsAwarded">Credits Awarded *</Label>
                  <Input
                    id="creditsAwarded"
                    type="number"
                    min="0"
                    value={formData.creditsAwarded ?? 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        creditsAwarded: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">Set to 0 to disable reward</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={formData.maxRedemptions || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRedemptions: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    Max times user can earn this
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cooldownDays">Cooldown (days)</Label>
                  <Input
                    id="cooldownDays"
                    type="number"
                    min="1"
                    placeholder="Leave empty for no cooldown"
                    value={formData.cooldownDays || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cooldownDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    Days before earning again
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center gap-2 pt-8">
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
            <AlertDialogTitle>Delete Redeem Action</AlertDialogTitle>
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
