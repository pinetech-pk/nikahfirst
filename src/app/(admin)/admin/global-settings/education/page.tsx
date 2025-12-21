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
  GraduationCap,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  GripVertical,
  Users,
} from "lucide-react";

// Types
interface EducationLevel {
  id: string;
  slug: string;
  label: string;
  level: number;
  yearsOfEducation: number;
  sortOrder: number;
  isActive: boolean;
  tags: string[];
  profileCount: number;
}

interface EducationField {
  id: string;
  slug: string;
  label: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  tags: string[];
  profileCount: number;
}

// Empty form states
const emptyLevel = {
  slug: "",
  label: "",
  level: 1,
  yearsOfEducation: 0,
  sortOrder: 0,
  isActive: true,
};

const emptyField = {
  slug: "",
  label: "",
  category: "",
  sortOrder: 0,
  isActive: true,
};

// Category options for education fields
const fieldCategories = [
  "Islamic Studies",
  "Social Sciences",
  "Natural Sciences",
  "Applied Sciences",
  "Arts & Humanities",
  "Business & Commerce",
  "Medical & Health",
  "Engineering & Technology",
  "Law & Legal",
  "Other",
];

export default function EducationPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("levels");

  // Education Levels state
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  // Education Fields state
  const [fields, setFields] = useState<EducationField[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"level" | "field">("level");
  const [editingItem, setEditingItem] = useState<EducationLevel | EducationField | null>(null);
  const [formData, setFormData] = useState<typeof emptyLevel | typeof emptyField>(emptyLevel);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EducationLevel | EducationField | null>(null);
  const [deleteType, setDeleteType] = useState<"level" | "field">("level");
  const [deleting, setDeleting] = useState(false);

  // Reordering state
  const [reordering, setReordering] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchLevels();
    fetchFields();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoadingLevels(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/education/levels");

      if (!response.ok) {
        throw new Error("Failed to fetch education levels");
      }

      const data = await response.json();
      setLevels(data.levels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingLevels(false);
    }
  };

  const fetchFields = async () => {
    try {
      setLoadingFields(true);

      const response = await fetch("/api/admin/global-settings/education/fields");

      if (!response.ok) {
        throw new Error("Failed to fetch education fields");
      }

      const data = await response.json();
      setFields(data.fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingFields(false);
    }
  };

  // Dialog handlers
  const openLevelDialog = (level?: EducationLevel) => {
    setDialogType("level");
    setEditingItem(level || null);
    setFormData(
      level
        ? {
            slug: level.slug,
            label: level.label,
            level: level.level,
            yearsOfEducation: level.yearsOfEducation,
            sortOrder: level.sortOrder,
            isActive: level.isActive,
          }
        : emptyLevel
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  const openFieldDialog = (field?: EducationField) => {
    setDialogType("field");
    setEditingItem(field || null);
    setFormData(
      field
        ? {
            slug: field.slug,
            label: field.label,
            category: field.category || "",
            sortOrder: field.sortOrder,
            isActive: field.isActive,
          }
        : emptyField
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

      if (dialogType === "level") {
        url = editingItem
          ? `/api/admin/global-settings/education/levels/${editingItem.id}`
          : "/api/admin/global-settings/education/levels";
        method = editingItem ? "PATCH" : "POST";
      } else {
        url = editingItem
          ? `/api/admin/global-settings/education/fields/${editingItem.id}`
          : "/api/admin/global-settings/education/fields";
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
      if (dialogType === "level") {
        fetchLevels();
      } else {
        fetchFields();
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
  const openDeleteDialog = (item: EducationLevel | EducationField, type: "level" | "field") => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);

    try {
      const url =
        deleteType === "level"
          ? `/api/admin/global-settings/education/levels/${itemToDelete.id}`
          : `/api/admin/global-settings/education/fields/${itemToDelete.id}`;

      const response = await fetch(url, { method: "DELETE" });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      // Refresh data
      if (deleteType === "level") {
        fetchLevels();
      } else {
        fetchFields();
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
  const reorderLevels = async (fromIndex: number, toIndex: number) => {
    setReordering(true);

    const newOrder = [...levels];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    // Optimistic update
    setLevels(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/education/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "levels", orderedIds: newOrder.map((l) => l.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder");
      }
    } catch (err) {
      // Revert on error
      fetchLevels();
      setError(err instanceof Error ? err.message : "Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  const reorderFields = async (fromIndex: number, toIndex: number) => {
    setReordering(true);

    const newOrder = [...fields];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    // Optimistic update
    setFields(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/education/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "fields", orderedIds: newOrder.map((f) => f.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder");
      }
    } catch (err) {
      // Revert on error
      fetchFields();
      setError(err instanceof Error ? err.message : "Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  const moveLevelUp = (index: number) => {
    if (index === 0) return;
    reorderLevels(index, index - 1);
  };

  const moveLevelDown = (index: number) => {
    if (index === levels.length - 1) return;
    reorderLevels(index, index + 1);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    reorderFields(index, index - 1);
  };

  const moveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;
    reorderFields(index, index + 1);
  };

  if (loadingLevels && loadingFields && levels.length === 0 && fields.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading education data...</p>
        </div>
      </div>
    );
  }

  if (error && levels.length === 0 && fields.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => { fetchLevels(); fetchFields(); }}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Education Management</h1>
          <p className="text-gray-600 mt-1">
            Manage education levels and fields of study
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Education Levels</p>
                <p className="text-2xl font-bold">{levels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fields of Study</p>
                <p className="text-2xl font-bold">{fields.length}</p>
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
                <p className="text-sm text-gray-500">Active Profiles Using</p>
                <p className="text-2xl font-bold">
                  {levels.reduce((sum, l) => sum + l.profileCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="levels">
            <GraduationCap className="h-4 w-4 mr-2" />
            Education Levels
          </TabsTrigger>
          <TabsTrigger value="fields">
            <BookOpen className="h-4 w-4 mr-2" />
            Fields of Study
          </TabsTrigger>
        </TabsList>

        {/* Education Levels Tab */}
        <TabsContent value="levels" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Education Levels</CardTitle>
                <CardDescription>
                  Manage education levels like Matric, Intermediate, Bachelor&apos;s, Master&apos;s, PhD, etc.
                </CardDescription>
              </div>
              <Button onClick={() => openLevelDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </CardHeader>
            <CardContent>
              {loadingLevels ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : levels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No education levels found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Years</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((level, index) => (
                      <TableRow key={level.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveLevelUp(index)}
                                disabled={index === 0 || reordering}
                              >
                                <span className="text-xs">▲</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveLevelDown(index)}
                                disabled={index === levels.length - 1 || reordering}
                              >
                                <span className="text-xs">▼</span>
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{level.label}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{level.level}</Badge>
                        </TableCell>
                        <TableCell>{level.yearsOfEducation} yrs</TableCell>
                        <TableCell>{level.profileCount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              level.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {level.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openLevelDialog(level)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(level, "level")}
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

        {/* Education Fields Tab */}
        <TabsContent value="fields" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fields of Study</CardTitle>
                <CardDescription>
                  Manage fields of study like Medicine, Engineering, Computer Science, Islamic Studies, etc.
                </CardDescription>
              </div>
              <Button onClick={() => openFieldDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              {loadingFields ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No education fields found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveFieldUp(index)}
                                disabled={index === 0 || reordering}
                              >
                                <span className="text-xs">▲</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveFieldDown(index)}
                                disabled={index === fields.length - 1 || reordering}
                              >
                                <span className="text-xs">▼</span>
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{field.label}</TableCell>
                        <TableCell>
                          {field.category ? (
                            <Badge variant="outline">{field.category}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{field.profileCount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              field.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {field.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openFieldDialog(field)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(field, "field")}
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
              {dialogType === "level" ? "Education Level" : "Field of Study"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "level"
                ? "Define an education level with its ranking and years of study"
                : "Define a field of study with an optional category"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Education Level Form */}
            {dialogType === "level" && (
              <>
                <div>
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Bachelor's Degree"
                    value={(formData as typeof emptyLevel).label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level (1-9)</Label>
                    <Input
                      id="level"
                      type="number"
                      min={1}
                      max={9}
                      placeholder="e.g., 5"
                      value={(formData as typeof emptyLevel).level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">Higher = more education</p>
                  </div>
                  <div>
                    <Label htmlFor="yearsOfEducation">Years of Education</Label>
                    <Input
                      id="yearsOfEducation"
                      type="number"
                      min={0}
                      placeholder="e.g., 16"
                      value={(formData as typeof emptyLevel).yearsOfEducation}
                      onChange={(e) =>
                        setFormData({ ...formData, yearsOfEducation: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="Auto-generated if empty"
                    value={(formData as typeof emptyLevel).slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (auto-generated from label if empty)
                  </p>
                </div>
              </>
            )}

            {/* Education Field Form */}
            {dialogType === "field" && (
              <>
                <div>
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Computer Science"
                    value={(formData as typeof emptyField).label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={(formData as typeof emptyField).category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select a category (optional)</option>
                    {fieldCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="Auto-generated if empty"
                    value={(formData as typeof emptyField).slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (auto-generated from label if empty)
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
