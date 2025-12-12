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
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building,
  Smartphone,
} from "lucide-react";

interface PaymentSetting {
  id: string;
  method: string;
  label: string;
  instructions: string;
  accountTitle: string | null;
  accountNumber: string | null;
  bankName: string | null;
  branchCode: string | null;
  iban: string | null;
  mobileNumber: string | null;
  isActive: boolean;
  sortOrder: number;
}

const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
  { value: "JAZZCASH", label: "JazzCash", icon: Smartphone },
  { value: "EASYPAISA", label: "EasyPaisa", icon: Smartphone },
  { value: "OTHER", label: "Other", icon: CreditCard },
];

const emptySetting: Partial<PaymentSetting> = {
  method: "",
  label: "",
  instructions: "",
  accountTitle: "",
  accountNumber: "",
  bankName: "",
  branchCode: "",
  iban: "",
  mobileNumber: "",
  isActive: true,
  sortOrder: 0,
};

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PaymentSetting | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentSetting>>(emptySetting);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<PaymentSetting | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/payment-settings");

      if (!response.ok) {
        throw new Error("Failed to fetch payment settings");
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSetting(null);
    setFormData(emptySetting);
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const openEditDialog = (setting: PaymentSetting) => {
    setEditingSetting(setting);
    setFormData({
      method: setting.method,
      label: setting.label,
      instructions: setting.instructions,
      accountTitle: setting.accountTitle || "",
      accountNumber: setting.accountNumber || "",
      bankName: setting.bankName || "",
      branchCode: setting.branchCode || "",
      iban: setting.iban || "",
      mobileNumber: setting.mobileNumber || "",
      isActive: setting.isActive,
      sortOrder: setting.sortOrder,
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
      const url = editingSetting
        ? `/api/admin/global-settings/payment-settings/${editingSetting.id}`
        : "/api/admin/global-settings/payment-settings";

      const response = await fetch(url, {
        method: editingSetting ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save setting");
      }

      setSubmitSuccess(
        editingSetting ? "Setting updated successfully" : "Setting created successfully"
      );
      fetchSettings();

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

  const openDeleteDialog = (setting: PaymentSetting) => {
    setSettingToDelete(setting);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/global-settings/payment-settings/${settingToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete setting");
      }

      fetchSettings();
      setDeleteDialogOpen(false);
      setSettingToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const getMethodIcon = (method: string) => {
    const found = PAYMENT_METHODS.find((m) => m.value === method);
    return found?.icon || CreditCard;
  };

  const getMethodLabel = (method: string) => {
    const found = PAYMENT_METHODS.find((m) => m.value === method);
    return found?.label || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading payment settings...</p>
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
          <Button onClick={fetchSettings}>Try Again</Button>
        </div>
      </div>
    );
  }

  const activeSettings = settings.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure payment methods for manual top-ups
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Methods</p>
                <p className="text-2xl font-bold">{settings.length}</p>
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
                <p className="text-sm text-gray-500">Active Methods</p>
                <p className="text-2xl font-bold">{activeSettings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Configure how users can pay for credit packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment methods configured</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Method
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => {
                const Icon = getMethodIcon(setting.method);
                return (
                  <Card key={setting.id} className={!setting.isActive ? "opacity-60" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <Icon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{setting.label}</h3>
                              <Badge variant={setting.isActive ? "default" : "secondary"}>
                                {setting.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {getMethodLabel(setting.method)}
                            </p>
                            {setting.bankName && (
                              <p className="text-sm text-gray-600 mt-2">
                                Bank: {setting.bankName}
                                {setting.accountNumber && ` • Account: ${setting.accountNumber}`}
                              </p>
                            )}
                            {setting.mobileNumber && (
                              <p className="text-sm text-gray-600 mt-2">
                                Mobile: {setting.mobileNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(setting)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(setting)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {editingSetting ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editingSetting
                ? "Update the payment method details"
                : "Configure a new payment method for users"}
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
                  <Label htmlFor="method">Method *</Label>
                  <Select
                    value={formData.method || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, method: value })
                    }
                    disabled={submitting || !!editingSetting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Bank Transfer - HBL"
                    value={formData.label || ""}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Payment Instructions *</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instructions shown to user when they select this method..."
                  value={formData.instructions || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  rows={3}
                  required
                  disabled={submitting}
                />
              </div>

              {(formData.method === "BANK_TRANSFER" || !formData.method) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., HBL, Meezan"
                        value={formData.bankName || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountTitle">Account Title</Label>
                      <Input
                        id="accountTitle"
                        placeholder="Account holder name"
                        value={formData.accountTitle || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, accountTitle: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Account number"
                        value={formData.accountNumber || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, accountNumber: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        placeholder="IBAN (optional)"
                        value={formData.iban || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, iban: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </>
              )}

              {(formData.method === "JAZZCASH" || formData.method === "EASYPAISA") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      placeholder="03XX-XXXXXXX"
                      value={formData.mobileNumber || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, mobileNumber: e.target.value })
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountTitle">Account Title</Label>
                    <Input
                      id="accountTitle"
                      placeholder="Account holder name"
                      value={formData.accountTitle || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, accountTitle: e.target.value })
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}

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
                  ) : editingSetting ? (
                    "Update Method"
                  ) : (
                    "Add Method"
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
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{settingToDelete?.label}&quot;?
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
