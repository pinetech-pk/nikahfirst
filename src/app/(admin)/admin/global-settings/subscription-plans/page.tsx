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
  Crown,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  DollarSign,
  Wallet,
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  freeCredits: number;
  walletLimit: number;
  redeemCredits: number;
  redeemCycleDays: number;
  profileLimit: number;
  priceMonthly: number;
  priceYearly: number;
  yearlyDiscountPct: number;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  color: string | null;
  features: unknown;
  _count: {
    users: number;
  };
}

const emptyPlan: Partial<SubscriptionPlan> = {
  slug: "",
  name: "",
  description: "",
  freeCredits: 0,
  walletLimit: 5,
  redeemCredits: 1,
  redeemCycleDays: 15,
  profileLimit: 1,
  priceMonthly: 0,
  priceYearly: 0,
  yearlyDiscountPct: 0,
  sortOrder: 0,
  isActive: true,
  isDefault: false,
  color: "",
};

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>(emptyPlan);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/subscription-plans");

      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }

      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData(emptyPlan);
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      slug: plan.slug,
      name: plan.name,
      description: plan.description || "",
      freeCredits: plan.freeCredits,
      walletLimit: plan.walletLimit,
      redeemCredits: plan.redeemCredits,
      redeemCycleDays: plan.redeemCycleDays,
      profileLimit: plan.profileLimit,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      yearlyDiscountPct: plan.yearlyDiscountPct,
      sortOrder: plan.sortOrder,
      isActive: plan.isActive,
      isDefault: plan.isDefault,
      color: plan.color || "",
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
      const url = editingPlan
        ? `/api/admin/global-settings/subscription-plans/${editingPlan.id}`
        : "/api/admin/global-settings/subscription-plans";

      const response = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save plan");
      }

      setSubmitSuccess(editingPlan ? "Plan updated successfully" : "Plan created successfully");
      fetchPlans();

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

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/global-settings/subscription-plans/${planToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete plan");
      }

      fetchPlans();
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading subscription plans...</p>
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
          <Button onClick={fetchPlans}>Try Again</Button>
        </div>
      </div>
    );
  }

  const totalUsers = plans.reduce((sum, plan) => sum + plan._count.users, 0);
  const activePlans = plans.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">
            Manage subscription tiers and their benefits
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold">{activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>
            Configure subscription tiers, pricing, and credit allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No subscription plans found</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Plan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Free Credits</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Wallet Limit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Redeem</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Monthly</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Yearly</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Users</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: plan.color || "#6B7280" }}
                          />
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-sm text-gray-500">{plan.slug}</p>
                          </div>
                          {plan.isDefault && (
                            <Badge variant="secondary" className="ml-2">Default</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-green-600">{plan.freeCredits}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium">{plan.walletLimit}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm">
                          {plan.redeemCredits}/{plan.redeemCycleDays}d
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium">
                          ${Number(plan.priceMonthly).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium">
                          ${Number(plan.priceYearly).toFixed(2)}
                        </span>
                        {plan.yearlyDiscountPct > 0 && (
                          <span className="text-xs text-green-600 ml-1">
                            (-{plan.yearlyDiscountPct}%)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="outline">{plan._count.users}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(plan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(plan)}
                            disabled={plan._count.users > 0 || plan.isDefault}
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the subscription plan details"
                : "Add a new subscription tier to the platform"}
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
                    placeholder="e.g., gold"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toUpperCase() })
                    }
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Gold Plan"
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
                  placeholder="Brief description of the plan..."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeCredits">Free Credits</Label>
                  <Input
                    id="freeCredits"
                    type="number"
                    min="0"
                    value={formData.freeCredits || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, freeCredits: parseInt(e.target.value) || 0 })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletLimit">Wallet Limit</Label>
                  <Input
                    id="walletLimit"
                    type="number"
                    min="1"
                    value={formData.walletLimit || 5}
                    onChange={(e) =>
                      setFormData({ ...formData, walletLimit: parseInt(e.target.value) || 5 })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileLimit">Profile Limit</Label>
                  <Input
                    id="profileLimit"
                    type="number"
                    min="1"
                    value={formData.profileLimit || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, profileLimit: parseInt(e.target.value) || 1 })
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="redeemCredits">Redeem Credits</Label>
                  <Input
                    id="redeemCredits"
                    type="number"
                    min="0"
                    value={formData.redeemCredits || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, redeemCredits: parseInt(e.target.value) || 1 })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redeemCycleDays">Redeem Cycle (days)</Label>
                  <Input
                    id="redeemCycleDays"
                    type="number"
                    min="1"
                    value={formData.redeemCycleDays || 15}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        redeemCycleDays: parseInt(e.target.value) || 15,
                      })
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceMonthly">Monthly Price ($)</Label>
                  <Input
                    id="priceMonthly"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.priceMonthly || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceMonthly: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceYearly">Yearly Price ($)</Label>
                  <Input
                    id="priceYearly"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.priceYearly || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceYearly: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearlyDiscountPct">Yearly Discount (%)</Label>
                  <Input
                    id="yearlyDiscountPct"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.yearlyDiscountPct || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearlyDiscountPct: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={submitting}
                  />
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
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color || "#6B7280"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    disabled={submitting}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: checked })
                    }
                    disabled={submitting}
                  />
                  <Label htmlFor="isDefault">Default Plan</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingPlan ? (
                    "Update Plan"
                  ) : (
                    "Create Plan"
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
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{planToDelete?.name}&quot; plan?
              This action cannot be undone.
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
