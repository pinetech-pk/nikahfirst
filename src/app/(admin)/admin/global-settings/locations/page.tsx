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
  Globe,
  MapPin,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// Types
interface Country {
  id: string;
  code: string;
  name: string;
  nameNative: string | null;
  phoneCode: string | null;
  currency: string | null;
  sortOrder: number;
  isActive: boolean;
  stateCount: number;
  cityCount: number;
}

interface StateProvince {
  id: string;
  countryId: string;
  code: string | null;
  name: string;
  nameNative: string | null;
  sortOrder: number;
  isActive: boolean;
  country?: { name: string; code: string };
  _count?: { cities: number };
}

interface City {
  id: string;
  stateProvinceId: string;
  name: string;
  nameNative: string | null;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  stateProvince?: {
    name: string;
    country: { name: string; code: string };
  };
  _count?: { profiles: number };
}

// Empty form states
const emptyCountry = {
  code: "",
  name: "",
  nameNative: "",
  phoneCode: "",
  currency: "",
  sortOrder: 0,
  isActive: true,
};

const emptyState = {
  countryId: "",
  code: "",
  name: "",
  nameNative: "",
  sortOrder: 0,
  isActive: true,
};

const emptyCity = {
  stateProvinceId: "",
  name: "",
  nameNative: "",
  sortOrder: 0,
  isPopular: false,
  isActive: true,
};

export default function LocationsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("countries");

  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // States state
  const [states, setStates] = useState<StateProvince[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Cities state
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedState, setSelectedState] = useState<StateProvince | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"country" | "state" | "city">("country");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>(emptyCountry);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<"country" | "state" | "city">("country");
  const [deleting, setDeleting] = useState(false);

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

      const response = await fetch("/api/admin/global-settings/locations/countries");

      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }

      const data = await response.json();
      setCountries(data.countries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      setLoadingStates(true);

      const response = await fetch(
        `/api/admin/global-settings/locations/states?countryId=${countryId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }

      const data = await response.json();
      setStates(data.states);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      setLoadingCities(true);

      const response = await fetch(
        `/api/admin/global-settings/locations/cities?stateId=${stateId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }

      const data = await response.json();
      setCities(data.cities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingCities(false);
    }
  };

  // Country handlers
  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setCities([]);
    fetchStates(country.id);
    setActiveTab("states");
  };

  const openCountryDialog = (country?: Country) => {
    setDialogType("country");
    setEditingItem(country || null);
    setFormData(
      country
        ? {
            code: country.code,
            name: country.name,
            nameNative: country.nameNative || "",
            phoneCode: country.phoneCode || "",
            currency: country.currency || "",
            sortOrder: country.sortOrder,
            isActive: country.isActive,
          }
        : emptyCountry
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  // State handlers
  const selectState = (state: StateProvince) => {
    setSelectedState(state);
    fetchCities(state.id);
    setActiveTab("cities");
  };

  const openStateDialog = (state?: StateProvince) => {
    if (!selectedCountry) return;

    setDialogType("state");
    setEditingItem(state || null);
    setFormData(
      state
        ? {
            countryId: state.countryId,
            code: state.code || "",
            name: state.name,
            nameNative: state.nameNative || "",
            sortOrder: state.sortOrder,
            isActive: state.isActive,
          }
        : { ...emptyState, countryId: selectedCountry.id }
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setDialogOpen(true);
  };

  // City handlers
  const openCityDialog = (city?: City) => {
    if (!selectedState) return;

    setDialogType("city");
    setEditingItem(city || null);
    setFormData(
      city
        ? {
            stateProvinceId: city.stateProvinceId,
            name: city.name,
            nameNative: city.nameNative || "",
            sortOrder: city.sortOrder,
            isPopular: city.isPopular,
            isActive: city.isActive,
          }
        : { ...emptyCity, stateProvinceId: selectedState.id }
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

      if (dialogType === "country") {
        url = editingItem
          ? `/api/admin/global-settings/locations/countries/${editingItem.id}`
          : "/api/admin/global-settings/locations/countries";
        method = editingItem ? "PATCH" : "POST";
      } else if (dialogType === "state") {
        url = editingItem
          ? `/api/admin/global-settings/locations/states/${editingItem.id}`
          : "/api/admin/global-settings/locations/states";
        method = editingItem ? "PATCH" : "POST";
      } else {
        url = editingItem
          ? `/api/admin/global-settings/locations/cities/${editingItem.id}`
          : "/api/admin/global-settings/locations/cities";
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
      if (dialogType === "country") {
        fetchCountries();
      } else if (dialogType === "state" && selectedCountry) {
        fetchStates(selectedCountry.id);
      } else if (dialogType === "city" && selectedState) {
        fetchCities(selectedState.id);
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
  const openDeleteDialog = (item: any, type: "country" | "state" | "city") => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);

    try {
      let url: string;

      if (deleteType === "country") {
        url = `/api/admin/global-settings/locations/countries/${itemToDelete.id}`;
      } else if (deleteType === "state") {
        url = `/api/admin/global-settings/locations/states/${itemToDelete.id}`;
      } else {
        url = `/api/admin/global-settings/locations/cities/${itemToDelete.id}`;
      }

      const response = await fetch(url, { method: "DELETE" });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      // Refresh data
      if (deleteType === "country") {
        fetchCountries();
        if (selectedCountry?.id === itemToDelete.id) {
          setSelectedCountry(null);
          setStates([]);
          setActiveTab("countries");
        }
      } else if (deleteType === "state" && selectedCountry) {
        fetchStates(selectedCountry.id);
        if (selectedState?.id === itemToDelete.id) {
          setSelectedState(null);
          setCities([]);
          setActiveTab("states");
        }
      } else if (deleteType === "city" && selectedState) {
        fetchCities(selectedState.id);
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
  const goBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedState(null);
    setStates([]);
    setCities([]);
    setActiveTab("countries");
  };

  const goBackToStates = () => {
    setSelectedState(null);
    setCities([]);
    setActiveTab("states");
  };

  if (loadingCountries && countries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading locations...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-600 mt-1">
            Manage countries, states/provinces, and cities
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Countries</p>
                <p className="text-2xl font-bold">{countries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total States/Regions</p>
                <p className="text-2xl font-bold">
                  {countries.reduce((sum, c) => sum + c.stateCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cities</p>
                <p className="text-2xl font-bold">
                  {countries.reduce((sum, c) => sum + c.cityCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      {(selectedCountry || selectedState) && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={goBackToCountries}>
            Countries
          </Button>
          {selectedCountry && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={goBackToStates}
                className={selectedState ? "" : "text-primary font-medium"}
              >
                {selectedCountry.name}
              </Button>
            </>
          )}
          {selectedState && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-primary font-medium">{selectedState.name}</span>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="countries" disabled={!!selectedCountry}>
            <Globe className="h-4 w-4 mr-2" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="states" disabled={!selectedCountry}>
            <MapPin className="h-4 w-4 mr-2" />
            States/Regions
          </TabsTrigger>
          <TabsTrigger value="cities" disabled={!selectedState}>
            <Building2 className="h-4 w-4 mr-2" />
            Cities
          </TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Countries</CardTitle>
                <CardDescription>
                  Click a country to manage its states and cities
                </CardDescription>
              </div>
              <Button onClick={() => openCountryDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Country
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>States</TableHead>
                    <TableHead>Cities</TableHead>
                    <TableHead>Status</TableHead>
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
                        {country.nameNative && (
                          <span className="text-gray-500 ml-2 text-sm">
                            ({country.nameNative})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{country.code}</Badge>
                      </TableCell>
                      <TableCell>{country.phoneCode || "-"}</TableCell>
                      <TableCell>{country.currency || "-"}</TableCell>
                      <TableCell>{country.stateCount}</TableCell>
                      <TableCell>{country.cityCount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            country.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {country.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCountryDialog(country);
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
                              openDeleteDialog(country, "country");
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

        {/* States Tab */}
        <TabsContent value="states" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  States/Regions in {selectedCountry?.name}
                </CardTitle>
                <CardDescription>
                  Click a state to manage its cities
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBackToCountries}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => openStateDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add State
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStates ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : states.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No states/regions found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Cities</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {states.map((state) => (
                      <TableRow
                        key={state.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => selectState(state)}
                      >
                        <TableCell className="font-medium">
                          {state.name}
                          {state.nameNative && (
                            <span className="text-gray-500 ml-2 text-sm">
                              ({state.nameNative})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {state.code ? (
                            <Badge variant="outline">{state.code}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{state._count?.cities || 0}</TableCell>
                        <TableCell>{state.sortOrder}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              state.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {state.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openStateDialog(state);
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
                                openDeleteDialog(state, "state");
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

        {/* Cities Tab */}
        <TabsContent value="cities" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cities in {selectedState?.name}</CardTitle>
                <CardDescription>
                  Manage cities in this state/region
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBackToStates}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => openCityDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add City
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCities ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : cities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No cities found. Add one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Popular</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">
                          {city.name}
                          {city.nameNative && (
                            <span className="text-gray-500 ml-2 text-sm">
                              ({city.nameNative})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {city.isPopular ? (
                            <Badge className="bg-amber-100 text-amber-700">
                              Popular
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{city.sortOrder}</TableCell>
                        <TableCell>{city._count?.profiles || 0}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              city.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {city.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCityDialog(city)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(city, "city")}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"}{" "}
              {dialogType === "country"
                ? "Country"
                : dialogType === "state"
                ? "State/Region"
                : "City"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "country"
                ? "Add a new country to the system"
                : dialogType === "state"
                ? `Add a new state/region to ${selectedCountry?.name}`
                : `Add a new city to ${selectedState?.name}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Country Form */}
            {dialogType === "country" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Country Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., PK"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      maxLength={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneCode">Phone Code</Label>
                    <Input
                      id="phoneCode"
                      placeholder="e.g., +92"
                      value={formData.phoneCode}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneCode: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Country Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Pakistan"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameNative">Native Name</Label>
                  <Input
                    id="nameNative"
                    placeholder="e.g., پاکستان"
                    value={formData.nameNative}
                    onChange={(e) =>
                      setFormData({ ...formData, nameNative: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      placeholder="e.g., PKR"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                    />
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
                </div>
              </>
            )}

            {/* State Form */}
            {dialogType === "state" && (
              <>
                <div>
                  <Label htmlFor="name">State/Region Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Punjab"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameNative">Native Name</Label>
                  <Input
                    id="nameNative"
                    placeholder="e.g., پنجاب"
                    value={formData.nameNative}
                    onChange={(e) =>
                      setFormData({ ...formData, nameNative: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">State Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g., PB"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                    />
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
                </div>
              </>
            )}

            {/* City Form */}
            {dialogType === "city" && (
              <>
                <div>
                  <Label htmlFor="name">City Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Lahore"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameNative">Native Name</Label>
                  <Input
                    id="nameNative"
                    placeholder="e.g., لاہور"
                    value={formData.nameNative}
                    onChange={(e) =>
                      setFormData({ ...formData, nameNative: e.target.value })
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
                    <Label htmlFor="isPopular">Popular City</Label>
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
              <span className="font-semibold">{itemToDelete?.name}</span>
              {deleteType === "country" && (
                <> and all its states and cities</>
              )}
              {deleteType === "state" && <> and all its cities</>}.
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
