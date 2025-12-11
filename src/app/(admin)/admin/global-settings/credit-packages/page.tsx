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
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Sparkles,
  Star,
} from "lucide-react";

interface CreditPackage {
  id: string;
  slug: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  savingsPercent: number | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyPackage: Partial<CreditPackage> = {
  slug: "",
  name: "",
  credits: 5,
  price: 10,
  bonusCredits: 0,
  savingsPercent: null,
  isPopular: false,
  isActive: true,
  sortOrder: 0,
};

export default function CreditPackagesPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [formData, setFormData] = useState<Partial<CreditPackage>>(emptyPackage);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<CreditPackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/credit-packages");

      if (!response.ok) {
        throw new Error("Failed to fetch credit packages");
      }

      const data = await response.json();
      setPackages(data.packages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPackage(null);
    setFormData(emptyPackage);
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: CreditPackage) => {
    setEditingPackage(pkg);
    setFormData({
      slug: pkg.slug,
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      bonusCredits: pkg.bonusCredits,
      savingsPercent: pkg.savingsPercent,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
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
      const url = editingPackage
        ? `/api/admin/global-settings/credit-packages/${editingPackage.id}`
        : "/api/admin/global-settings/credit-packages";

      const response = await fetch(url, {
        method: editingPackage ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          savingsPercent: formData.savingsPercent || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save package");
      }

      setSubmitSuccess(
        editingPackage ? "Package updated successfully" : "Package created successfully"
      );
      fetchPackages();

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

  const openDeleteDialog = (pkg: CreditPackage) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/global-settings/credit-packages/${packageToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete package");
      }

      fetchPackages();
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const calculatePricePerCredit = (pkg: CreditPackage) => {
    const totalCredits = pkg.credits + pkg.bonusCredits;
    return (Number(pkg.price) / totalCredits).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading credit packages...</p>
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
          <Button onClick={fetchPackages}>Try Again</Button>
        </div>
      </div>
    );
  }

  const activePackages = packages.filter((p) => p.isActive).length;
  const popularPackage = packages.find((p) => p.isPopular);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Packages</h1>
          <p className="text-gray-600 mt-1">
            Manage credit top-up packages for users
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Packages</p>
                <p className="text-2xl font-bold">{packages.length}</p>
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
                <p className="text-sm text-gray-500">Active Packages</p>
                <p className="text-2xl font-bold">{activePackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Popular Package</p>
                <p className="text-2xl font-bold">
                  {popularPackage?.name || "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Credit Packages</CardTitle>
          <CardDescription>
            Configure credit packages that users can purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No credit packages found</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Package
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative ${
                    pkg.isPopular ? "ring-2 ring-yellow-400" : ""
                  } ${!pkg.isActive ? "opacity-60" : ""}`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-lg font-bold">{pkg.name}</p>
                      <p className="text-sm text-gray-500">{pkg.slug}</p>
                    </div>

                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-primary">
                        {pkg.credits}
                      </span>
                      {pkg.bonusCredits > 0 && (
                        <span className="text-lg text-green-600 ml-1">
                          +{pkg.bonusCredits}
                        </span>
                      )}
                      <p className="text-sm text-gray-500">credits</p>
                    </div>

                    <div className="text-center mb-4">
                      <span className="text-2xl font-bold">
                        ${Number(pkg.price).toFixed(2)}
                      </span>
                      {pkg.savingsPercent && pkg.savingsPercent > 0 && (
                        <Badge variant="secondary" className="ml-2 text-green-600">
                          Save {pkg.savingsPercent}%
                        </Badge>
                      )}
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-4">
                      ${calculatePricePerCredit(pkg)} per credit
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(pkg)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingPackage ? "Edit Credit Package" : "Create Credit Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the credit package details"
                : "Add a new credit package for purchase"}
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
                    placeholder="e.g., PACK_10"
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
                    placeholder="e.g., Starter Pack"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={formData.credits || 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits: parseInt(e.target.value) || 5,
                      })
                    }
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonusCredits">Bonus Credits</Label>
                  <Input
                    id="bonusCredits"
                    type="number"
                    min="0"
                    value={formData.bonusCredits || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bonusCredits: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || 10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 10,
                      })
                    }
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savingsPercent">Savings (%)</Label>
                  <Input
                    id="savingsPercent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Optional"
                    value={formData.savingsPercent || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        savingsPercent: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    disabled={submitting}
                  />
                </div>
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
                    id="isPopular"
                    checked={formData.isPopular}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPopular: checked })
                    }
                    disabled={submitting}
                  />
                  <Label htmlFor="isPopular">Mark as Popular</Label>
                </div>
              </div>

              {/* Preview */}
              {formData.credits && formData.price && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <p className="text-sm text-gray-600">
                    Total credits:{" "}
                    <span className="font-bold">
                      {(formData.credits || 0) + (formData.bonusCredits || 0)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price per credit:{" "}
                    <span className="font-bold">
                      $
                      {(
                        (formData.price || 0) /
                        ((formData.credits || 1) + (formData.bonusCredits || 0))
                      ).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingPackage ? (
                    "Update Package"
                  ) : (
                    "Create Package"
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
            <AlertDialogTitle>Delete Credit Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{packageToDelete?.name}&quot;
              package? This action cannot be undone.
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
