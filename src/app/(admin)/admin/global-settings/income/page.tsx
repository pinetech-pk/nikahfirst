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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Globe2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  GripVertical,
  Users,
} from "lucide-react";

// Types
interface Country {
  id: string;
  name: string;
  code: string;
  currency: string | null;
  currencySymbol: string | null;
  incomeRangeCount: number;
}

interface IncomeRange {
  id: string;
  countryId: string | null;
  slug: string;
  label: string;
  currency: string;
  period: "MONTHLY" | "ANNUAL";
  minValue: number | null;
  maxValue: number | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { profiles: number };
  country?: { id: string; name: string; code: string; currency: string };
}

// Empty form state
const emptyIncomeRange = {
  slug: "",
  label: "",
  currency: "",
  period: "MONTHLY" as const,
  minValue: "",
  maxValue: "",
  sortOrder: 0,
  isActive: true,
};

// Currency options
const currencies = [
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
];

export default function IncomePage() {
  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Income ranges state
  const [incomeRanges, setIncomeRanges] = useState<IncomeRange[]>([]);
  const [loadingRanges, setLoadingRanges] = useState(false);

  // Global ranges state
  const [globalRanges, setGlobalRanges] = useState<IncomeRange[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeRange | null>(null);
  const [formData, setFormData] = useState<any>(emptyIncomeRange);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IncomeRange | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reordering state
  const [reordering, setReordering] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/income");

      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }

      const data = await response.json();
      setCountries(data.countries);
      setGlobalRanges(data.globalRanges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchIncomeRanges = useCallback(async (countryId: string) => {
    try {
      setLoadingRanges(true);

      const response = await fetch(
        `/api/admin/global-settings/income?countryId=${countryId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch income ranges");
      }

      const data = await response.json();
      setIncomeRanges(data.incomeRanges);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingRanges(false);
    }
  }, []);

  // Country selection
  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    fetchIncomeRanges(country.id);
  };

  const goBackToCountries = () => {
    setSelectedCountry(null);
    setIncomeRanges([]);
  };

  // Dialog handlers
  const openDialog = (range?: IncomeRange) => {
    setEditingItem(range || null);
    setFormData(
      range
        ? {
            slug: range.slug,
            label: range.label,
            currency: range.currency,
            period: range.period,
            minValue: range.minValue?.toString() || "",
            maxValue: range.maxValue?.toString() || "",
            sortOrder: range.sortOrder,
            isActive: range.isActive,
          }
        : {
            ...emptyIncomeRange,
            currency: selectedCountry?.currency || "USD",
          }
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const url = editingItem
        ? `/api/admin/global-settings/income/${editingItem.id}`
        : "/api/admin/global-settings/income";
      const method = editingItem ? "PATCH" : "POST";

      const payload = {
        ...formData,
        countryId: selectedCountry?.id || null,
        minValue: formData.minValue ? parseInt(formData.minValue) : null,
        maxValue: formData.maxValue ? parseInt(formData.maxValue) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setSubmitSuccess(editingItem ? "Updated successfully" : "Created successfully");

      // Refresh data
      if (selectedCountry) {
        fetchIncomeRanges(selectedCountry.id);
      }
      fetchCountries(); // Refresh counts

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

  // Delete handlers
  const openDeleteDialog = (range: IncomeRange) => {
    setItemToDelete(range);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/global-settings/income/${itemToDelete.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      // Refresh data
      if (selectedCountry) {
        fetchIncomeRanges(selectedCountry.id);
      }
      fetchCountries(); // Refresh counts

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  // Reorder handlers
  const moveUp = async (index: number) => {
    if (index === 0) return;
    await reorder(index, index - 1);
  };

  const moveDown = async (index: number) => {
    if (index === incomeRanges.length - 1) return;
    await reorder(index, index + 1);
  };

  const reorder = async (fromIndex: number, toIndex: number) => {
    setReordering(true);

    const newOrder = [...incomeRanges];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    // Optimistic update
    setIncomeRanges(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/income/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newOrder.map((r) => r.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder");
      }
    } catch (err) {
      // Revert on error
      if (selectedCountry) {
        fetchIncomeRanges(selectedCountry.id);
      }
      setError(err instanceof Error ? err.message : "Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  // Format currency display
  const formatCurrency = (currency: string) => {
    const curr = currencies.find((c) => c.code === currency);
    return curr ? `${curr.symbol} ${curr.code}` : currency;
  };

  if (loadingCountries && countries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading income data...</p>
        </div>
      </div>
    );
  }

  if (error && countries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchCountries}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">
            Manage income ranges per country with local currencies
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Countries with Income Ranges</p>
                <p className="text-2xl font-bold">
                  {countries.filter((c) => c.incomeRangeCount > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income Ranges</p>
                <p className="text-2xl font-bold">
                  {countries.reduce((sum, c) => sum + c.incomeRangeCount, 0) +
                    globalRanges.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Countries Available</p>
                <p className="text-2xl font-bold">{countries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      {selectedCountry && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={goBackToCountries}>
            Countries
          </Button>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-primary font-medium">
            {selectedCountry.name} Income Ranges
          </span>
        </div>
      )}

      {/* Main Content */}
      {!selectedCountry ? (
        // Countries List
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Countries</CardTitle>
              <CardDescription>
                Select a country to manage its income ranges. Income ranges are displayed
                in local currency.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Income Ranges</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow
                    key={country.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => selectCountry(country)}
                  >
                    <TableCell className="font-medium">
                      {country.name}
                      <span className="text-gray-500 ml-2 text-sm">
                        ({country.code})
                      </span>
                    </TableCell>
                    <TableCell>
                      {country.currency ? (
                        <Badge variant="outline">
                          {formatCurrency(country.currency)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {country.incomeRangeCount > 0 ? (
                        <Badge className="bg-green-100 text-green-700">
                          {country.incomeRangeCount} ranges
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          No ranges
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="h-5 w-5 text-gray-400 inline" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        // Income Ranges for Selected Country
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Income Ranges - {selectedCountry.name}
                {selectedCountry.currency && (
                  <Badge variant="outline" className="ml-2">
                    {formatCurrency(selectedCountry.currency)}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Define income ranges in {selectedCountry.currency || "local currency"}.
                Drag to reorder or use arrows.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={goBackToCountries}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Range
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRanges ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : incomeRanges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No income ranges defined for {selectedCountry.name}. Add one to get
                started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Order</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Min Value</TableHead>
                    <TableHead>Max Value</TableHead>
                    <TableHead>Profiles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeRanges.map((range, index) => (
                    <TableRow key={range.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveUp(index)}
                              disabled={index === 0 || reordering}
                            >
                              <span className="text-xs">▲</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveDown(index)}
                              disabled={
                                index === incomeRanges.length - 1 || reordering
                              }
                            >
                              <span className="text-xs">▼</span>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{range.label}</TableCell>
                      <TableCell>{range.currency}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {range.period === "MONTHLY" ? "Monthly" : "Annual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {range.minValue?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>
                        {range.maxValue?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>{range._count?.profiles || 0}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            range.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {range.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(range)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteDialog(range)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} Income Range
            </DialogTitle>
            <DialogDescription>
              Define an income range for {selectedCountry?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="label">Display Label *</Label>
              <Input
                id="label"
                placeholder="e.g., 75,000 - 125,000 PKR"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This is what users will see in the dropdown
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="period">Period *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) =>
                    setFormData({ ...formData, period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minValue">Min Value</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="e.g., 75000"
                  value={formData.minValue}
                  onChange={(e) =>
                    setFormData({ ...formData, minValue: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">For filtering/sorting</p>
              </div>
              <div>
                <Label htmlFor="maxValue">Max Value</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="e.g., 125000"
                  value={formData.maxValue}
                  onChange={(e) =>
                    setFormData({ ...formData, maxValue: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="Auto-generated if empty"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier (auto-generated from label if empty)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {/* Error/Success Messages */}
            {submitError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                {submitSuccess}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingItem ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the income range{" "}
              <span className="font-semibold">&quot;{itemToDelete?.label}&quot;</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
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
