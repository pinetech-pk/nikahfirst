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
  Users,
  Globe2,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Settings2,
} from "lucide-react";

// Types
interface Origin {
  id: string;
  slug: string;
  label: string;
  labelNative: string | null;
  emoji: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  level1Label: string;
  level1LabelPlural: string;
  level2Label: string;
  level2LabelPlural: string;
  level2Enabled: boolean;
  ethnicityCount: number;
  casteCount: number;
  profileCount: number;
}

interface Ethnicity {
  id: string;
  originId: string;
  slug: string;
  label: string;
  labelNative: string | null;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  origin?: { label: string; level1Label: string; level2Label: string };
  _count?: { castes: number; profiles: number };
}

interface Caste {
  id: string;
  ethnicityId: string;
  slug: string;
  label: string;
  labelNative: string | null;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  ethnicity?: {
    label: string;
    origin: { label: string; level2Label: string };
  };
  _count?: { profiles: number };
}

// Empty form states
const emptyOrigin = {
  slug: "",
  label: "",
  labelNative: "",
  emoji: "",
  description: "",
  sortOrder: 0,
  isActive: true,
  level1Label: "Ethnicity",
  level1LabelPlural: "Ethnicities",
  level2Label: "Caste",
  level2LabelPlural: "Castes",
  level2Enabled: true,
};

const emptyEthnicity = {
  originId: "",
  slug: "",
  label: "",
  labelNative: "",
  sortOrder: 0,
  isPopular: false,
  isActive: true,
};

const emptyCaste = {
  ethnicityId: "",
  slug: "",
  label: "",
  labelNative: "",
  sortOrder: 0,
  isPopular: false,
  isActive: true,
};

export default function OriginsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("origins");

  // Origins state
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [loadingOrigins, setLoadingOrigins] = useState(true);

  // Ethnicities state
  const [ethnicities, setEthnicities] = useState<Ethnicity[]>([]);
  const [loadingEthnicities, setLoadingEthnicities] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null);

  // Castes state
  const [castes, setCastes] = useState<Caste[]>([]);
  const [loadingCastes, setLoadingCastes] = useState(false);
  const [selectedEthnicity, setSelectedEthnicity] = useState<Ethnicity | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"origin" | "ethnicity" | "caste">("origin");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>(emptyOrigin);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<"origin" | "ethnicity" | "caste">("origin");
  const [deleting, setDeleting] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch origins on mount
  useEffect(() => {
    fetchOrigins();
  }, []);

  const fetchOrigins = async () => {
    try {
      setLoadingOrigins(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/origins");

      if (!response.ok) {
        throw new Error("Failed to fetch origins");
      }

      const data = await response.json();
      setOrigins(data.origins);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingOrigins(false);
    }
  };

  const fetchEthnicities = async (originId: string) => {
    try {
      setLoadingEthnicities(true);

      const response = await fetch(
        `/api/admin/global-settings/origins/ethnicities?originId=${originId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ethnicities");
      }

      const data = await response.json();
      setEthnicities(data.ethnicities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingEthnicities(false);
    }
  };

  const fetchCastes = async (ethnicityId: string) => {
    try {
      setLoadingCastes(true);

      const response = await fetch(
        `/api/admin/global-settings/origins/castes?ethnicityId=${ethnicityId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch castes");
      }

      const data = await response.json();
      setCastes(data.castes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingCastes(false);
    }
  };

  // Origin handlers
  const selectOrigin = (origin: Origin) => {
    setSelectedOrigin(origin);
    setSelectedEthnicity(null);
    setCastes([]);
    fetchEthnicities(origin.id);
    setActiveTab("ethnicities");
  };

  const openOriginDialog = (origin?: Origin) => {
    setDialogType("origin");
    setEditingItem(origin || null);
    setFormData(
      origin
        ? {
            slug: origin.slug,
            label: origin.label,
            labelNative: origin.labelNative || "",
            emoji: origin.emoji || "",
            description: origin.description || "",
            sortOrder: origin.sortOrder,
            isActive: origin.isActive,
            level1Label: origin.level1Label,
            level1LabelPlural: origin.level1LabelPlural,
            level2Label: origin.level2Label,
            level2LabelPlural: origin.level2LabelPlural,
            level2Enabled: origin.level2Enabled,
          }
        : emptyOrigin
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  // Ethnicity handlers
  const selectEthnicity = (ethnicity: Ethnicity) => {
    if (!selectedOrigin?.level2Enabled) return;
    setSelectedEthnicity(ethnicity);
    fetchCastes(ethnicity.id);
    setActiveTab("castes");
  };

  const openEthnicityDialog = (ethnicity?: Ethnicity) => {
    if (!selectedOrigin) return;

    setDialogType("ethnicity");
    setEditingItem(ethnicity || null);
    setFormData(
      ethnicity
        ? {
            originId: ethnicity.originId,
            slug: ethnicity.slug,
            label: ethnicity.label,
            labelNative: ethnicity.labelNative || "",
            sortOrder: ethnicity.sortOrder,
            isPopular: ethnicity.isPopular,
            isActive: ethnicity.isActive,
          }
        : { ...emptyEthnicity, originId: selectedOrigin.id }
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  // Caste handlers
  const openCasteDialog = (caste?: Caste) => {
    if (!selectedEthnicity) return;

    setDialogType("caste");
    setEditingItem(caste || null);
    setFormData(
      caste
        ? {
            ethnicityId: caste.ethnicityId,
            slug: caste.slug,
            label: caste.label,
            labelNative: caste.labelNative || "",
            sortOrder: caste.sortOrder,
            isPopular: caste.isPopular,
            isActive: caste.isActive,
          }
        : { ...emptyCaste, ethnicityId: selectedEthnicity.id }
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

      if (dialogType === "origin") {
        url = editingItem
          ? `/api/admin/global-settings/origins/${editingItem.id}`
          : "/api/admin/global-settings/origins";
        method = editingItem ? "PATCH" : "POST";
      } else if (dialogType === "ethnicity") {
        url = editingItem
          ? `/api/admin/global-settings/origins/ethnicities/${editingItem.id}`
          : "/api/admin/global-settings/origins/ethnicities";
        method = editingItem ? "PATCH" : "POST";
      } else {
        url = editingItem
          ? `/api/admin/global-settings/origins/castes/${editingItem.id}`
          : "/api/admin/global-settings/origins/castes";
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
      if (dialogType === "origin") {
        fetchOrigins();
      } else if (dialogType === "ethnicity" && selectedOrigin) {
        fetchEthnicities(selectedOrigin.id);
      } else if (dialogType === "caste" && selectedEthnicity) {
        fetchCastes(selectedEthnicity.id);
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
  const openDeleteDialog = (item: any, type: "origin" | "ethnicity" | "caste") => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);

    try {
      let url: string;

      if (deleteType === "origin") {
        url = `/api/admin/global-settings/origins/${itemToDelete.id}`;
      } else if (deleteType === "ethnicity") {
        url = `/api/admin/global-settings/origins/ethnicities/${itemToDelete.id}`;
      } else {
        url = `/api/admin/global-settings/origins/castes/${itemToDelete.id}`;
      }

      const response = await fetch(url, { method: "DELETE" });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      // Refresh data
      if (deleteType === "origin") {
        fetchOrigins();
        if (selectedOrigin?.id === itemToDelete.id) {
          setSelectedOrigin(null);
          setEthnicities([]);
          setActiveTab("origins");
        }
      } else if (deleteType === "ethnicity" && selectedOrigin) {
        fetchEthnicities(selectedOrigin.id);
        if (selectedEthnicity?.id === itemToDelete.id) {
          setSelectedEthnicity(null);
          setCastes([]);
          setActiveTab("ethnicities");
        }
      } else if (deleteType === "caste" && selectedEthnicity) {
        fetchCastes(selectedEthnicity.id);
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  // Navigation
  const goBackToOrigins = () => {
    setSelectedOrigin(null);
    setSelectedEthnicity(null);
    setEthnicities([]);
    setCastes([]);
    setActiveTab("origins");
  };

  const goBackToEthnicities = () => {
    setSelectedEthnicity(null);
    setCastes([]);
    setActiveTab("ethnicities");
  };

  // Get dynamic labels
  const getLevel1Label = () => selectedOrigin?.level1Label || "Ethnicity";
  const getLevel1LabelPlural = () => selectedOrigin?.level1LabelPlural || "Ethnicities";
  const getLevel2Label = () => selectedOrigin?.level2Label || "Caste";
  const getLevel2LabelPlural = () => selectedOrigin?.level2LabelPlural || "Castes";

  if (loadingOrigins && origins.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading origins...</p>
        </div>
      </div>
    );
  }

  if (error && origins.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchOrigins}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Origin Management</h1>
          <p className="text-gray-600 mt-1">
            Manage origins, ethnicities/tribes, and castes/sub-tribes with flexible terminology
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
                <p className="text-sm text-gray-500">Origins</p>
                <p className="text-2xl font-bold">{origins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Level 1 (Ethnicities/Tribes)</p>
                <p className="text-2xl font-bold">
                  {origins.reduce((sum, o) => sum + o.ethnicityCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Level 2 (Castes/Sub-tribes)</p>
                <p className="text-2xl font-bold">
                  {origins.reduce((sum, o) => sum + o.casteCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      {(selectedOrigin || selectedEthnicity) && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={goBackToOrigins}>
            Origins
          </Button>
          {selectedOrigin && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={goBackToEthnicities}
                className={selectedEthnicity ? "" : "text-primary font-medium"}
              >
                {selectedOrigin.label} ({getLevel1LabelPlural()})
              </Button>
            </>
          )}
          {selectedEthnicity && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-primary font-medium">
                {selectedEthnicity.label} ({getLevel2LabelPlural()})
              </span>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="origins" disabled={!!selectedOrigin}>
            <Globe2 className="h-4 w-4 mr-2" />
            Origins
          </TabsTrigger>
          <TabsTrigger value="ethnicities" disabled={!selectedOrigin}>
            <Layers className="h-4 w-4 mr-2" />
            {getLevel1LabelPlural()}
          </TabsTrigger>
          <TabsTrigger value="castes" disabled={!selectedEthnicity || !selectedOrigin?.level2Enabled}>
            <Users className="h-4 w-4 mr-2" />
            {getLevel2LabelPlural()}
          </TabsTrigger>
        </TabsList>

        {/* Origins Tab */}
        <TabsContent value="origins" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Origins</CardTitle>
                <CardDescription>
                  Click an origin to manage its sub-categories. Configure terminology per origin.
                </CardDescription>
              </div>
              <Button onClick={() => openOriginDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Origin
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Terminology</TableHead>
                    <TableHead>Level 1</TableHead>
                    <TableHead>Level 2</TableHead>
                    <TableHead>Profiles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origins.map((origin) => (
                    <TableRow
                      key={origin.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => selectOrigin(origin)}
                    >
                      <TableCell className="font-medium">
                        {origin.emoji && <span className="mr-2">{origin.emoji}</span>}
                        {origin.label}
                        {origin.labelNative && (
                          <span className="text-gray-500 ml-2 text-sm">
                            ({origin.labelNative})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-500">
                          <div>{origin.level1Label} → {origin.level2Enabled ? origin.level2Label : "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{origin.ethnicityCount}</TableCell>
                      <TableCell>
                        {origin.level2Enabled ? origin.casteCount : "-"}
                      </TableCell>
                      <TableCell>{origin.profileCount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            origin.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {origin.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOriginDialog(origin);
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
                              openDeleteDialog(origin, "origin");
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ethnicities Tab */}
        <TabsContent value="ethnicities" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {getLevel1LabelPlural()} in {selectedOrigin?.label}
                </CardTitle>
                <CardDescription>
                  {selectedOrigin?.level2Enabled
                    ? `Click to manage ${getLevel2LabelPlural().toLowerCase()}`
                    : `Level 2 (${getLevel2Label()}) is disabled for this origin`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBackToOrigins}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => openEthnicityDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {getLevel1Label()}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEthnicities ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : ethnicities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {getLevel1LabelPlural().toLowerCase()} found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Popular</TableHead>
                      <TableHead>{getLevel2LabelPlural()}</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ethnicities.map((ethnicity) => (
                      <TableRow
                        key={ethnicity.id}
                        className={selectedOrigin?.level2Enabled ? "cursor-pointer hover:bg-gray-50" : ""}
                        onClick={() => selectEthnicity(ethnicity)}
                      >
                        <TableCell className="font-medium">
                          {ethnicity.label}
                          {ethnicity.labelNative && (
                            <span className="text-gray-500 ml-2 text-sm">
                              ({ethnicity.labelNative})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ethnicity.isPopular ? (
                            <Badge className="bg-amber-100 text-amber-700">Popular</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {selectedOrigin?.level2Enabled ? ethnicity._count?.castes || 0 : "-"}
                        </TableCell>
                        <TableCell>{ethnicity._count?.profiles || 0}</TableCell>
                        <TableCell>{ethnicity.sortOrder}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ethnicity.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {ethnicity.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEthnicityDialog(ethnicity);
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
                                openDeleteDialog(ethnicity, "ethnicity");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {selectedOrigin?.level2Enabled && (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
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

        {/* Castes Tab */}
        <TabsContent value="castes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {getLevel2LabelPlural()} in {selectedEthnicity?.label}
                </CardTitle>
                <CardDescription>
                  Manage {getLevel2LabelPlural().toLowerCase()} for this {getLevel1Label().toLowerCase()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBackToEthnicities}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => openCasteDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {getLevel2Label()}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCastes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : castes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {getLevel2LabelPlural().toLowerCase()} found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Popular</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {castes.map((caste) => (
                      <TableRow key={caste.id}>
                        <TableCell className="font-medium">
                          {caste.label}
                          {caste.labelNative && (
                            <span className="text-gray-500 ml-2 text-sm">
                              ({caste.labelNative})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {caste.isPopular ? (
                            <Badge className="bg-amber-100 text-amber-700">Popular</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{caste._count?.profiles || 0}</TableCell>
                        <TableCell>{caste.sortOrder}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              caste.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {caste.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCasteDialog(caste)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(caste, "caste")}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"}{" "}
              {dialogType === "origin"
                ? "Origin"
                : dialogType === "ethnicity"
                ? getLevel1Label()
                : getLevel2Label()}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "origin"
                ? "Configure the origin with custom terminology for sub-categories"
                : dialogType === "ethnicity"
                ? `Add a new ${getLevel1Label().toLowerCase()} to ${selectedOrigin?.label}`
                : `Add a new ${getLevel2Label().toLowerCase()} to ${selectedEthnicity?.label}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Origin Form */}
            {dialogType === "origin" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="label">Origin Name *</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Pakistani"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emoji">Emoji</Label>
                    <Input
                      id="emoji"
                      placeholder="e.g., 🇵🇰"
                      value={formData.emoji}
                      onChange={(e) =>
                        setFormData({ ...formData, emoji: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="e.g., pakistani"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="labelNative">Native Name</Label>
                    <Input
                      id="labelNative"
                      placeholder="e.g., پاکستانی"
                      value={formData.labelNative}
                      onChange={(e) =>
                        setFormData({ ...formData, labelNative: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Terminology Configuration */}
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">Terminology Configuration</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Define what the sub-categories are called for this origin (e.g., Ethnicity/Caste for Pakistani, Tribe/Sub-tribe for Arab)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level1Label">Level 1 Label (singular)</Label>
                      <Input
                        id="level1Label"
                        placeholder="e.g., Ethnicity, Tribe"
                        value={formData.level1Label}
                        onChange={(e) =>
                          setFormData({ ...formData, level1Label: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="level1LabelPlural">Level 1 Label (plural)</Label>
                      <Input
                        id="level1LabelPlural"
                        placeholder="e.g., Ethnicities, Tribes"
                        value={formData.level1LabelPlural}
                        onChange={(e) =>
                          setFormData({ ...formData, level1LabelPlural: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      id="level2Enabled"
                      checked={formData.level2Enabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, level2Enabled: checked })
                      }
                    />
                    <Label htmlFor="level2Enabled">Enable Level 2 sub-categories</Label>
                  </div>
                  {formData.level2Enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="level2Label">Level 2 Label (singular)</Label>
                        <Input
                          id="level2Label"
                          placeholder="e.g., Caste, Sub-tribe"
                          value={formData.level2Label}
                          onChange={(e) =>
                            setFormData({ ...formData, level2Label: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="level2LabelPlural">Level 2 Label (plural)</Label>
                        <Input
                          id="level2LabelPlural"
                          placeholder="e.g., Castes, Sub-tribes"
                          value={formData.level2LabelPlural}
                          onChange={(e) =>
                            setFormData({ ...formData, level2LabelPlural: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </>
            )}

            {/* Ethnicity Form */}
            {dialogType === "ethnicity" && (
              <>
                <div>
                  <Label htmlFor="label">{getLevel1Label()} Name *</Label>
                  <Input
                    id="label"
                    placeholder={`e.g., Punjabi`}
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="labelNative">Native Name</Label>
                  <Input
                    id="labelNative"
                    placeholder="e.g., پنجابی"
                    value={formData.labelNative}
                    onChange={(e) =>
                      setFormData({ ...formData, labelNative: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isPopular"
                      checked={formData.isPopular}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPopular: checked })
                      }
                    />
                    <Label htmlFor="isPopular">Popular</Label>
                  </div>
                </div>
              </>
            )}

            {/* Caste Form */}
            {dialogType === "caste" && (
              <>
                <div>
                  <Label htmlFor="label">{getLevel2Label()} Name *</Label>
                  <Input
                    id="label"
                    placeholder={`e.g., Rajput`}
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="labelNative">Native Name</Label>
                  <Input
                    id="labelNative"
                    placeholder="e.g., راجپوت"
                    value={formData.labelNative}
                    onChange={(e) =>
                      setFormData({ ...formData, labelNative: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isPopular"
                      checked={formData.isPopular}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPopular: checked })
                      }
                    />
                    <Label htmlFor="isPopular">Popular</Label>
                  </div>
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
              <span className="font-semibold">{itemToDelete?.label}</span>
              {deleteType === "origin" && (
                <> and all its {getLevel1LabelPlural().toLowerCase()} and {getLevel2LabelPlural().toLowerCase()}</>
              )}
              {deleteType === "ethnicity" && selectedOrigin?.level2Enabled && (
                <> and all its {getLevel2LabelPlural().toLowerCase()}</>
              )}
              . This action cannot be undone.
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
