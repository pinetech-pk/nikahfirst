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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Moon,
  Layers,
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
interface Sect {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  maslakCount: number;
  profileCount: number;
}

interface Maslak {
  id: string;
  sectId: string;
  slug: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  sect?: { id: string; label: string };
  profileCount: number;
}

// Empty form states
const emptySect = {
  slug: "",
  label: "",
  sortOrder: 0,
  isActive: true,
};

const emptyMaslak = {
  sectId: "",
  slug: "",
  label: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export default function SectsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("sects");

  // Sects state
  const [sects, setSects] = useState<Sect[]>([]);
  const [loadingSects, setLoadingSects] = useState(true);
  const [selectedSect, setSelectedSect] = useState<Sect | null>(null);

  // Maslaks state
  const [maslaks, setMaslaks] = useState<Maslak[]>([]);
  const [loadingMaslaks, setLoadingMaslaks] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"sect" | "maslak">("sect");
  const [editingItem, setEditingItem] = useState<Sect | Maslak | null>(null);
  const [formData, setFormData] = useState<typeof emptySect | typeof emptyMaslak>(emptySect);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Sect | Maslak | null>(null);
  const [deleteType, setDeleteType] = useState<"sect" | "maslak">("sect");
  const [deleting, setDeleting] = useState(false);

  // Reordering state
  const [reordering, setReordering] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch sects on mount
  useEffect(() => {
    fetchSects();
  }, []);

  const fetchSects = async () => {
    try {
      setLoadingSects(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/sects");

      if (!response.ok) {
        throw new Error("Failed to fetch sects");
      }

      const data = await response.json();
      setSects(data.sects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingSects(false);
    }
  };

  const fetchMaslaks = async (sectId: string) => {
    try {
      setLoadingMaslaks(true);

      const response = await fetch(
        `/api/admin/global-settings/sects/maslaks?sectId=${sectId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch maslaks");
      }

      const data = await response.json();
      setMaslaks(data.maslaks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingMaslaks(false);
    }
  };

  // Sect selection
  const selectSect = (sect: Sect) => {
    setSelectedSect(sect);
    fetchMaslaks(sect.id);
    setActiveTab("maslaks");
  };

  const goBackToSects = () => {
    setSelectedSect(null);
    setMaslaks([]);
    setActiveTab("sects");
  };

  // Dialog handlers
  const openSectDialog = (sect?: Sect) => {
    setDialogType("sect");
    setEditingItem(sect || null);
    setFormData(
      sect
        ? {
            slug: sect.slug,
            label: sect.label,
            sortOrder: sect.sortOrder,
            isActive: sect.isActive,
          }
        : emptySect
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const openMaslakDialog = (maslak?: Maslak) => {
    if (!selectedSect) return;

    setDialogType("maslak");
    setEditingItem(maslak || null);
    setFormData(
      maslak
        ? {
            sectId: maslak.sectId,
            slug: maslak.slug,
            label: maslak.label,
            description: maslak.description || "",
            sortOrder: maslak.sortOrder,
            isActive: maslak.isActive,
          }
        : { ...emptyMaslak, sectId: selectedSect.id }
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
      let url: string;
      let method: string;

      if (dialogType === "sect") {
        url = editingItem
          ? `/api/admin/global-settings/sects/${editingItem.id}`
          : "/api/admin/global-settings/sects";
        method = editingItem ? "PATCH" : "POST";
      } else {
        url = editingItem
          ? `/api/admin/global-settings/sects/maslaks/${editingItem.id}`
          : "/api/admin/global-settings/sects/maslaks";
        method = editingItem ? "PATCH" : "POST";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setSubmitSuccess(editingItem ? "Updated successfully" : "Created successfully");

      // Refresh data
      if (dialogType === "sect") {
        fetchSects();
      } else if (selectedSect) {
        fetchMaslaks(selectedSect.id);
      }

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
  const openDeleteDialog = (item: Sect | Maslak, type: "sect" | "maslak") => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);

    try {
      const url =
        deleteType === "sect"
          ? `/api/admin/global-settings/sects/${itemToDelete.id}`
          : `/api/admin/global-settings/sects/maslaks/${itemToDelete.id}`;

      const response = await fetch(url, { method: "DELETE" });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      // Refresh data
      if (deleteType === "sect") {
        fetchSects();
        if (selectedSect?.id === itemToDelete.id) {
          setSelectedSect(null);
          setMaslaks([]);
          setActiveTab("sects");
        }
      } else if (selectedSect) {
        fetchMaslaks(selectedSect.id);
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  // Reorder handlers
  const reorderSects = async (fromIndex: number, toIndex: number) => {
    setReordering(true);

    const newOrder = [...sects];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    // Optimistic update
    setSects(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/sects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sects", orderedIds: newOrder.map((s) => s.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder");
      }
    } catch (err) {
      // Revert on error
      fetchSects();
      setError(err instanceof Error ? err.message : "Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  const reorderMaslaks = async (fromIndex: number, toIndex: number) => {
    setReordering(true);

    const newOrder = [...maslaks];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    // Optimistic update
    setMaslaks(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/sects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "maslaks", orderedIds: newOrder.map((m) => m.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder");
      }
    } catch (err) {
      // Revert on error
      if (selectedSect) fetchMaslaks(selectedSect.id);
      setError(err instanceof Error ? err.message : "Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  const moveSectUp = (index: number) => {
    if (index === 0) return;
    reorderSects(index, index - 1);
  };

  const moveSectDown = (index: number) => {
    if (index === sects.length - 1) return;
    reorderSects(index, index + 1);
  };

  const moveMaslakUp = (index: number) => {
    if (index === 0) return;
    reorderMaslaks(index, index - 1);
  };

  const moveMaslakDown = (index: number) => {
    if (index === maslaks.length - 1) return;
    reorderMaslaks(index, index + 1);
  };

  if (loadingSects && sects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading sects...</p>
        </div>
      </div>
    );
  }

  if (error && sects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSects}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sect Management</h1>
          <p className="text-gray-600 mt-1">
            Manage religious sects and sub-sects (maslaks)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Moon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Religious Sects</p>
                <p className="text-2xl font-bold">{sects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Layers className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Maslaks (Sub-sects)</p>
                <p className="text-2xl font-bold">
                  {sects.reduce((sum, s) => sum + s.maslakCount, 0)}
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
                <p className="text-sm text-gray-500">Profiles Using</p>
                <p className="text-2xl font-bold">
                  {sects.reduce((sum, s) => sum + s.profileCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      {selectedSect && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={goBackToSects}>
            Sects
          </Button>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-primary font-medium">
            {selectedSect.label} (Maslaks)
          </span>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sects" disabled={!!selectedSect}>
            <Moon className="h-4 w-4 mr-2" />
            Sects
          </TabsTrigger>
          <TabsTrigger value="maslaks" disabled={!selectedSect}>
            <Layers className="h-4 w-4 mr-2" />
            Maslaks (Sub-sects)
          </TabsTrigger>
        </TabsList>

        {/* Sects Tab */}
        <TabsContent value="sects" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Religious Sects</CardTitle>
                <CardDescription>
                  Click a sect to manage its maslaks (sub-sects)
                </CardDescription>
              </div>
              <Button onClick={() => openSectDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sect
              </Button>
            </CardHeader>
            <CardContent>
              {loadingSects ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sects found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Maslaks</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sects.map((sect, index) => (
                      <TableRow
                        key={sect.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => selectSect(sect)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveSectUp(index);
                                }}
                                disabled={index === 0 || reordering}
                              >
                                <span className="text-xs">▲</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveSectDown(index);
                                }}
                                disabled={index === sects.length - 1 || reordering}
                              >
                                <span className="text-xs">▼</span>
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{sect.label}</TableCell>
                        <TableCell>{sect.maslakCount}</TableCell>
                        <TableCell>{sect.profileCount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sect.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {sect.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSectDialog(sect);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(sect, "sect");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maslaks Tab */}
        <TabsContent value="maslaks" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maslaks in {selectedSect?.label}</CardTitle>
                <CardDescription>
                  Manage sub-sects for this religious sect
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBackToSects}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => openMaslakDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Maslak
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMaslaks ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : maslaks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No maslaks found for {selectedSect?.label}. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maslaks.map((maslak, index) => (
                      <TableRow key={maslak.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveMaslakUp(index)}
                                disabled={index === 0 || reordering}
                              >
                                <span className="text-xs">▲</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveMaslakDown(index)}
                                disabled={index === maslaks.length - 1 || reordering}
                              >
                                <span className="text-xs">▼</span>
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{maslak.label}</TableCell>
                        <TableCell>
                          {maslak.description ? (
                            <span className="text-gray-600 text-sm truncate max-w-xs block">
                              {maslak.description}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{maslak.profileCount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              maslak.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {maslak.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openMaslakDialog(maslak)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(maslak, "maslak")}
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
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"}{" "}
              {dialogType === "sect" ? "Sect" : "Maslak"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "sect"
                ? "Define a religious sect"
                : `Add a maslak (sub-sect) to ${selectedSect?.label}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sect Form */}
            {dialogType === "sect" && (
              <>
                <div>
                  <Label htmlFor="label">Name *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Sunni"
                    value={(formData as typeof emptySect).label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="Auto-generated if empty"
                    value={(formData as typeof emptySect).slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (auto-generated from name if empty)
                  </p>
                </div>
              </>
            )}

            {/* Maslak Form */}
            {dialogType === "maslak" && (
              <>
                <div>
                  <Label htmlFor="label">Name *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Hanafi - Deobandi"
                    value={(formData as typeof emptyMaslak).label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
                    value={(formData as typeof emptyMaslak).description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="Auto-generated if empty"
                    value={(formData as typeof emptyMaslak).slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (auto-generated from name if empty)
                  </p>
                </div>
              </>
            )}

            {/* Active Toggle */}
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
              This will delete{" "}
              <span className="font-semibold">&quot;{itemToDelete?.label}&quot;</span>
              {deleteType === "sect" && " and all its maslaks"}.
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
