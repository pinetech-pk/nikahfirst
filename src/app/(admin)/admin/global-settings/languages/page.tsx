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
  Languages,
  Globe2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  GripVertical,
  Users,
  ArrowLeft,
} from "lucide-react";

// Types
interface Language {
  id: string;
  code: string;
  slug: string;
  label: string;
  labelNative: string | null;
  sortOrder: number;
  isActive: boolean;
  isGlobal: boolean;
  profileCount: number;
  countryCount: number;
}

interface Country {
  id: string;
  code: string;
  name: string;
  languageCount: number;
}

interface CountryLanguage {
  id: string;
  code: string;
  label: string;
  labelNative: string | null;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  associationId: string;
}

interface AvailableLanguage {
  id: string;
  code: string;
  label: string;
  labelNative: string | null;
}

// Empty form state
const emptyLanguage = {
  code: "",
  slug: "",
  label: "",
  labelNative: "",
  isActive: true,
  isGlobal: false,
};

export default function LanguagesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("languages");

  // Languages state
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string; code: string } | null>(null);
  const [countryLanguages, setCountryLanguages] = useState<CountryLanguage[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<AvailableLanguage[]>([]);
  const [loadingCountryLanguages, setLoadingCountryLanguages] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState(emptyLanguage);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add language dialog (for country)
  const [addLanguageDialogOpen, setAddLanguageDialogOpen] = useState(false);
  const [selectedLanguageToAdd, setSelectedLanguageToAdd] = useState("");
  const [addingLanguage, setAddingLanguage] = useState(false);

  // Reordering state
  const [reordering, setReordering] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch languages
  const fetchLanguages = useCallback(async () => {
    try {
      setLoadingLanguages(true);
      setError(null);

      const response = await fetch("/api/admin/global-settings/languages");
      if (!response.ok) throw new Error("Failed to fetch languages");

      const data = await response.json();
      setLanguages(data.languages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingLanguages(false);
    }
  }, []);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      setLoadingCountries(true);

      const response = await fetch("/api/admin/global-settings/languages/countries");
      if (!response.ok) throw new Error("Failed to fetch countries");

      const data = await response.json();
      setCountries(data.countries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // Fetch country languages
  const fetchCountryLanguages = useCallback(async (countryId: string) => {
    try {
      setLoadingCountryLanguages(true);

      const response = await fetch(`/api/admin/global-settings/languages/countries/${countryId}`);
      if (!response.ok) throw new Error("Failed to fetch country languages");

      const data = await response.json();
      setSelectedCountry(data.country);
      setCountryLanguages(data.languages);
      setAvailableLanguages(data.availableLanguages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingCountryLanguages(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchLanguages();
    fetchCountries();
  }, [fetchLanguages, fetchCountries]);

  // Fetch country languages when selected
  useEffect(() => {
    if (selectedCountryId) {
      fetchCountryLanguages(selectedCountryId);
    }
  }, [selectedCountryId, fetchCountryLanguages]);

  // Dialog handlers
  const openLanguageDialog = (language?: Language) => {
    setEditingLanguage(language || null);
    setFormData(
      language
        ? {
            code: language.code,
            slug: language.slug,
            label: language.label,
            labelNative: language.labelNative || "",
            isActive: language.isActive,
            isGlobal: language.isGlobal,
          }
        : emptyLanguage
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
      const url = editingLanguage
        ? `/api/admin/global-settings/languages/${editingLanguage.id}`
        : "/api/admin/global-settings/languages";
      const method = editingLanguage ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setSubmitSuccess(editingLanguage ? "Updated successfully" : "Created successfully");
      fetchLanguages();

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
  const openDeleteDialog = (language: Language) => {
    setLanguageToDelete(language);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!languageToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/global-settings/languages/${languageToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      fetchLanguages();
      setDeleteDialogOpen(false);
      setLanguageToDelete(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  // Add language to country
  const handleAddLanguageToCountry = async () => {
    if (!selectedLanguageToAdd || !selectedCountryId) return;

    setAddingLanguage(true);

    try {
      const response = await fetch(`/api/admin/global-settings/languages/countries/${selectedCountryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId: selectedLanguageToAdd }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add language");
      }

      fetchCountryLanguages(selectedCountryId);
      fetchCountries();
      setAddLanguageDialogOpen(false);
      setSelectedLanguageToAdd("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAddingLanguage(false);
    }
  };

  // Remove language from country
  const handleRemoveLanguageFromCountry = async (languageId: string) => {
    if (!selectedCountryId) return;

    try {
      const response = await fetch(
        `/api/admin/global-settings/languages/countries/${selectedCountryId}?languageId=${languageId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove language");
      }

      fetchCountryLanguages(selectedCountryId);
      fetchCountries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Reorder handlers
  const reorderLanguages = async (fromIndex: number, toIndex: number) => {
    setReordering(true);

    const newOrder = [...languages];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setLanguages(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/languages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newOrder.map((l) => l.id) }),
      });

      if (!response.ok) throw new Error("Failed to reorder");
    } catch {
      fetchLanguages();
      setError("Failed to reorder languages");
    } finally {
      setReordering(false);
    }
  };

  const reorderCountryLanguages = async (fromIndex: number, toIndex: number) => {
    if (!selectedCountryId) return;

    setReordering(true);

    const newOrder = [...countryLanguages];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setCountryLanguages(newOrder);

    try {
      const response = await fetch("/api/admin/global-settings/languages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedIds: newOrder.map((l) => l.id),
          countryId: selectedCountryId,
        }),
      });

      if (!response.ok) throw new Error("Failed to reorder");
    } catch {
      fetchCountryLanguages(selectedCountryId);
      setError("Failed to reorder languages");
    } finally {
      setReordering(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    reorderLanguages(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index === languages.length - 1) return;
    reorderLanguages(index, index + 1);
  };

  const moveCountryLangUp = (index: number) => {
    if (index === 0) return;
    reorderCountryLanguages(index, index - 1);
  };

  const moveCountryLangDown = (index: number) => {
    if (index === countryLanguages.length - 1) return;
    reorderCountryLanguages(index, index + 1);
  };

  if (loadingLanguages && loadingCountries && languages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading languages...</p>
        </div>
      </div>
    );
  }

  if (error && languages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => { fetchLanguages(); fetchCountries(); }}>Try Again</Button>
        </div>
      </div>
    );
  }

  const totalProfiles = languages.reduce((sum, l) => sum + l.profileCount, 0);
  const countriesWithLanguages = countries.filter((c) => c.languageCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mother Tongue Management</h1>
          <p className="text-gray-600 mt-1">
            Manage languages and country associations for mother tongue selection
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Languages className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Languages</p>
                <p className="text-2xl font-bold">{languages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Globe2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Countries with Languages</p>
                <p className="text-2xl font-bold">{countriesWithLanguages}</p>
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
                <p className="text-2xl font-bold">{totalProfiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="languages">
            <Languages className="h-4 w-4 mr-2" />
            All Languages
          </TabsTrigger>
          <TabsTrigger value="countries">
            <Globe2 className="h-4 w-4 mr-2" />
            Country Associations
          </TabsTrigger>
        </TabsList>

        {/* All Languages Tab */}
        <TabsContent value="languages" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Languages</CardTitle>
                <CardDescription>
                  All available languages for mother tongue selection
                </CardDescription>
              </div>
              <Button onClick={() => openLanguageDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </CardHeader>
            <CardContent>
              {loadingLanguages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : languages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No languages found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Native</TableHead>
                      <TableHead>Countries</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {languages.map((lang, index) => (
                      <TableRow key={lang.id}>
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
                                disabled={index === languages.length - 1 || reordering}
                              >
                                <span className="text-xs">▼</span>
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {lang.label}
                          {lang.isGlobal && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Global
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lang.code}</Badge>
                        </TableCell>
                        <TableCell>{lang.labelNative || "-"}</TableCell>
                        <TableCell>{lang.countryCount}</TableCell>
                        <TableCell>{lang.profileCount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              lang.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {lang.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openLanguageDialog(lang)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(lang)}
                              disabled={lang.slug === "other_language"}
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

        {/* Country Associations Tab */}
        <TabsContent value="countries" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Country Language Associations</CardTitle>
              <CardDescription>
                Configure which languages appear for each country&apos;s mother tongue selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCountryId ? (
                <div className="space-y-4">
                  <div>
                    <Label>Select a Country</Label>
                    <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                      <SelectTrigger className="mt-1 max-w-md">
                        <SelectValue placeholder="Choose a country to manage..." />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name} ({country.code}) - {country.languageCount} languages
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCountryId("");
                          setSelectedCountry(null);
                          setCountryLanguages([]);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Countries
                      </Button>
                      {selectedCountry && (
                        <div>
                          <h3 className="text-lg font-semibold">
                            {selectedCountry.name} ({selectedCountry.code})
                          </h3>
                          <p className="text-sm text-gray-500">
                            {countryLanguages.length} languages configured
                          </p>
                        </div>
                      )}
                    </div>
                    <Button onClick={() => setAddLanguageDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Language
                    </Button>
                  </div>

                  {loadingCountryLanguages ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : countryLanguages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No languages configured for this country. Add some to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Order</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Native</TableHead>
                          <TableHead>Primary</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countryLanguages.map((lang, index) => (
                          <TableRow key={lang.associationId}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <div className="flex flex-col">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => moveCountryLangUp(index)}
                                    disabled={index === 0 || reordering}
                                  >
                                    <span className="text-xs">▲</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => moveCountryLangDown(index)}
                                    disabled={index === countryLanguages.length - 1 || reordering}
                                  >
                                    <span className="text-xs">▼</span>
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{lang.label}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{lang.code}</Badge>
                            </TableCell>
                            <TableCell>{lang.labelNative || "-"}</TableCell>
                            <TableCell>
                              {lang.isPrimary && (
                                <Badge className="bg-blue-100 text-blue-700">Primary</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveLanguageFromCountry(lang.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Language Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLanguage ? "Edit Language" : "Add Language"}
            </DialogTitle>
            <DialogDescription>
              {editingLanguage
                ? "Update the language details"
                : "Add a new language for mother tongue selection"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., ur, en, pa"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">ISO 639 language code</p>
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Auto-generated if empty"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Urdu, English, Punjabi"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="labelNative">Native Label</Label>
              <Input
                id="labelNative"
                placeholder="e.g., اردو, پنجابی"
                value={formData.labelNative}
                onChange={(e) => setFormData({ ...formData, labelNative: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                How the language is written in its native script
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                />
                <Label htmlFor="isGlobal">Global (shown for all countries)</Label>
              </div>
            </div>

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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingLanguage ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Language to Country Dialog */}
      <Dialog open={addLanguageDialogOpen} onOpenChange={setAddLanguageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Language to Country</DialogTitle>
            <DialogDescription>
              Select a language to add to {selectedCountry?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Language</Label>
              <Select value={selectedLanguageToAdd} onValueChange={setSelectedLanguageToAdd}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a language..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.label} {lang.labelNative && `(${lang.labelNative})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddLanguageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLanguageToCountry} disabled={!selectedLanguageToAdd || addingLanguage}>
                {addingLanguage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Language"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the language &quot;{languageToDelete?.label}&quot;.
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
