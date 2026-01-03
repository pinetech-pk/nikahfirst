"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  Save,
  MapPin,
  AlertTriangle,
  CheckCircle,
  User,
  Globe,
  GraduationCap,
  Languages,
} from "lucide-react";

interface LookupItem {
  id: string;
  name?: string;
  label?: string;
  isOther?: boolean;
}

interface Profile {
  id: string;
  // Location
  countryOfOrigin: { id: string; name: string } | null;
  countryLivingIn: { id: string; name: string } | null;
  stateProvince: { id: string; name: string } | null;
  city: { id: string; name: string } | null;
  visaStatus: string | null;
  suggestedLocation: string | null;
  // Origin & Background
  origin: { id: string; label: string } | null;
  ethnicity: { id: string; label: string } | null;
  caste: { id: string; label: string } | null;
  customCaste: string | null;
  // Education & Career
  educationLevel: { id: string; label: string } | null;
  educationField: { id: string; label: string } | null;
  educationDetails: string | null;
  // Language
  motherTongue: { id: string; label: string } | null;
  otherMotherTongue: string | null;
  // User
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function AdminEditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("location");

  // Form state - Location
  const [countryLivingInId, setCountryLivingInId] = useState("");
  const [stateProvinceId, setStateProvinceId] = useState("");
  const [cityId, setCityId] = useState("");
  const [visaStatus, setVisaStatus] = useState("");
  const [clearSuggestedLocation, setClearSuggestedLocation] = useState(false);

  // Form state - Origin & Background
  const [originId, setOriginId] = useState("");
  const [ethnicityId, setEthnicityId] = useState("");
  const [casteId, setCasteId] = useState("");
  const [customCaste, setCustomCaste] = useState("");

  // Form state - Education
  const [educationLevelId, setEducationLevelId] = useState("");
  const [educationFieldId, setEducationFieldId] = useState("");
  const [educationDetails, setEducationDetails] = useState("");

  // Form state - Language
  const [motherTongueId, setMotherTongueId] = useState("");
  const [otherMotherTongue, setOtherMotherTongue] = useState("");

  // Lookup data
  const [countries, setCountries] = useState<LookupItem[]>([]);
  const [states, setStates] = useState<LookupItem[]>([]);
  const [cities, setCities] = useState<LookupItem[]>([]);
  const [origins, setOrigins] = useState<LookupItem[]>([]);
  const [ethnicities, setEthnicities] = useState<LookupItem[]>([]);
  const [castes, setCastes] = useState<LookupItem[]>([]);
  const [educationLevels, setEducationLevels] = useState<LookupItem[]>([]);
  const [educationFields, setEducationFields] = useState<LookupItem[]>([]);
  const [languages, setLanguages] = useState<LookupItem[]>([]);

  // Fetch lookup data
  const fetchLookup = useCallback(async (table: string, parentId?: string) => {
    try {
      let url = `/api/lookup?table=${table}`;
      if (parentId) url += `&parentId=${parentId}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error(`Failed to fetch ${table}:`, error);
      return [];
    }
  }, []);

  // Load profile and initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch profile
        const profileRes = await fetch(`/api/admin/profiles/${resolvedParams.id}`);
        if (!profileRes.ok) {
          router.push("/admin/profiles/pending");
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Set form values - Location
        setCountryLivingInId(profileData.countryLivingIn?.id || "");
        setStateProvinceId(profileData.stateProvince?.id || "");
        setCityId(profileData.city?.id || "");
        setVisaStatus(profileData.visaStatus || "");

        // Set form values - Origin
        setOriginId(profileData.origin?.id || "");
        setEthnicityId(profileData.ethnicity?.id || "");
        setCasteId(profileData.caste?.id || "");
        setCustomCaste(profileData.customCaste || "");

        // Set form values - Education
        setEducationLevelId(profileData.educationLevel?.id || "");
        setEducationFieldId(profileData.educationField?.id || "");
        setEducationDetails(profileData.educationDetails || "");

        // Set form values - Language
        setMotherTongueId(profileData.motherTongue?.id || "");
        setOtherMotherTongue(profileData.otherMotherTongue || "");

        // Fetch all lookup data in parallel
        const [
          countriesData,
          originsData,
          educationLevelsData,
          educationFieldsData,
          languagesData,
        ] = await Promise.all([
          fetchLookup("country"),
          fetchLookup("origin"),
          fetchLookup("educationLevel"),
          fetchLookup("educationField"),
          fetchLookup("language"),
        ]);

        setCountries(countriesData);
        setOrigins(originsData);
        setEducationLevels(educationLevelsData);
        setEducationFields(educationFieldsData);
        setLanguages(languagesData);

        // Fetch dependent data if parent IDs exist
        if (profileData.countryLivingIn?.id) {
          const statesData = await fetchLookup("stateProvince", profileData.countryLivingIn.id);
          setStates(statesData);
        }
        if (profileData.stateProvince?.id) {
          const citiesData = await fetchLookup("city", profileData.stateProvince.id);
          setCities(citiesData);
        }
        if (profileData.origin?.id) {
          const ethnicitiesData = await fetchLookup("ethnicity", profileData.origin.id);
          setEthnicities(ethnicitiesData);
        }
        if (profileData.ethnicity?.id) {
          const castesData = await fetchLookup("caste", profileData.ethnicity.id);
          setCastes(castesData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, router, fetchLookup]);

  // Load states when country changes
  useEffect(() => {
    if (countryLivingInId && !loading) {
      fetchLookup("stateProvince", countryLivingInId).then(setStates);
    }
  }, [countryLivingInId, fetchLookup, loading]);

  // Load cities when state changes
  useEffect(() => {
    if (stateProvinceId && !loading) {
      fetchLookup("city", stateProvinceId).then(setCities);
    }
  }, [stateProvinceId, fetchLookup, loading]);

  // Load ethnicities when origin changes
  useEffect(() => {
    if (originId && !loading) {
      fetchLookup("ethnicity", originId).then(setEthnicities);
    }
  }, [originId, fetchLookup, loading]);

  // Load castes when ethnicity changes
  useEffect(() => {
    if (ethnicityId && !loading) {
      fetchLookup("caste", ethnicityId).then(setCastes);
    }
  }, [ethnicityId, fetchLookup, loading]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updateData: Record<string, string | null> = {
        // Location
        countryLivingInId: countryLivingInId || null,
        stateProvinceId: stateProvinceId || null,
        cityId: cityId || null,
        visaStatus: visaStatus || null,
        // Origin & Background
        originId: originId || null,
        ethnicityId: ethnicityId || null,
        casteId: casteId || null,
        customCaste: customCaste || null,
        // Education
        educationLevelId: educationLevelId || null,
        educationFieldId: educationFieldId || null,
        educationDetails: educationDetails || null,
        // Language
        motherTongueId: motherTongueId || null,
        otherMotherTongue: otherMotherTongue || null,
      };

      // Clear suggested location if checkbox is checked and we have a proper location set
      if (clearSuggestedLocation && stateProvinceId && cityId) {
        updateData.suggestedLocation = null;
      }

      const res = await fetch(`/api/admin/profiles/${resolvedParams.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const json = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: json.message || "Profile updated successfully!" });
        // Update local profile state
        if (json.profile) {
          setProfile((prev) => prev ? { ...prev, ...json.profile } : prev);
        }
        if (clearSuggestedLocation && stateProvinceId && cityId) {
          setProfile((prev) => prev ? { ...prev, suggestedLocation: null } : prev);
        }
      } else {
        setMessage({ type: "error", text: json.error || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save changes. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Check if "Other" language is selected
  const isOtherMotherTongueSelected = languages.find((l) => l.id === motherTongueId)?.isOther || false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <Link href="/admin/profiles/pending">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pending Profiles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/profiles/${resolvedParams.id}/review`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600">
              Update profile information and map suggested values
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-md flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Owner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{profile.user.name || "No name"}</p>
              <p className="text-sm text-gray-500">{profile.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Alert */}
      {(profile.suggestedLocation || profile.customCaste || profile.otherMotherTongue) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              User Suggested Values
            </CardTitle>
            <CardDescription className="text-amber-700">
              The user provided these values because they couldn&apos;t find them in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.suggestedLocation && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">Location</Badge>
                <span className="font-medium text-amber-900">{profile.suggestedLocation}</span>
              </div>
            )}
            {profile.customCaste && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">Caste</Badge>
                <span className="font-medium text-amber-900">{profile.customCaste}</span>
              </div>
            )}
            {profile.otherMotherTongue && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">Mother Tongue</Badge>
                <span className="font-medium text-amber-900">{profile.otherMotherTongue}</span>
              </div>
            )}
            <p className="text-xs text-amber-600 mt-2">
              If you&apos;ve added these values to the database, select them below to properly map the profile.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Form with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="location" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
          <TabsTrigger value="origin" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Origin</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-1">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
        </TabsList>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                Update the user&apos;s location by selecting from the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Location Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-2">Current Location</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {profile.countryLivingIn?.name || "No country"}
                  </Badge>
                  <Badge variant="outline">
                    {profile.stateProvince?.name || "No state/province"}
                  </Badge>
                  <Badge variant="outline">
                    {profile.city?.name || "No city"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Country Selection */}
              <div>
                <Label>Country Living In</Label>
                <Select value={countryLivingInId} onValueChange={(val) => {
                  setCountryLivingInId(val);
                  setStateProvinceId("");
                  setCityId("");
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State/Province Selection */}
              <div>
                <Label>State/Province</Label>
                <Select
                  value={stateProvinceId}
                  onValueChange={(val) => {
                    setStateProvinceId(val);
                    setCityId("");
                  }}
                  disabled={!countryLivingInId || states.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !countryLivingInId
                          ? "Select country first"
                          : states.length === 0
                          ? "No states available"
                          : "Select state/province"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {countryLivingInId && states.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No states/provinces found. Add them in Global Settings → Locations first.
                  </p>
                )}
              </div>

              {/* City Selection */}
              <div>
                <Label>City</Label>
                <Select
                  value={cityId}
                  onValueChange={setCityId}
                  disabled={!stateProvinceId || cities.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !stateProvinceId
                          ? "Select state first"
                          : cities.length === 0
                          ? "No cities available"
                          : "Select city"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {stateProvinceId && cities.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No cities found. Add them in Global Settings → Locations first.
                  </p>
                )}
              </div>

              {/* Visa Status */}
              <div>
                <Label>Visa Status</Label>
                <Select value={visaStatus} onValueChange={setVisaStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select visa status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CITIZEN">Citizen</SelectItem>
                    <SelectItem value="PERMANENT_RESIDENT">Permanent Resident</SelectItem>
                    <SelectItem value="WORK_VISA">Work Visa</SelectItem>
                    <SelectItem value="STUDENT_VISA">Student Visa</SelectItem>
                    <SelectItem value="VISIT_VISA">Visit Visa</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Suggested Location Checkbox */}
              {profile.suggestedLocation && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <input
                    type="checkbox"
                    id="clearSuggestion"
                    checked={clearSuggestedLocation}
                    onChange={(e) => setClearSuggestedLocation(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="clearSuggestion" className="text-sm text-green-800">
                    Clear suggested location &quot;{profile.suggestedLocation}&quot; after saving
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Origin Tab */}
        <TabsContent value="origin">
          <Card>
            <CardHeader>
              <CardTitle>Origin & Background</CardTitle>
              <CardDescription>
                Update origin, ethnicity, and caste information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Origin Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-2">Current Values</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Origin: {profile.origin?.label || "Not set"}
                  </Badge>
                  <Badge variant="outline">
                    Ethnicity: {profile.ethnicity?.label || "Not set"}
                  </Badge>
                  <Badge variant="outline">
                    Caste: {profile.caste?.label || profile.customCaste || "Not set"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Origin Selection */}
              <div>
                <Label>Origin</Label>
                <Select value={originId} onValueChange={(val) => {
                  setOriginId(val);
                  setEthnicityId("");
                  setCasteId("");
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {origins.map((origin) => (
                      <SelectItem key={origin.id} value={origin.id}>
                        {origin.name || origin.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ethnicity Selection */}
              <div>
                <Label>Ethnicity</Label>
                <Select
                  value={ethnicityId}
                  onValueChange={(val) => {
                    setEthnicityId(val);
                    setCasteId("");
                  }}
                  disabled={!originId || ethnicities.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !originId
                          ? "Select origin first"
                          : ethnicities.length === 0
                          ? "No ethnicities available"
                          : "Select ethnicity"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ethnicities.map((eth) => (
                      <SelectItem key={eth.id} value={eth.id}>
                        {eth.name || eth.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Caste Selection */}
              <div>
                <Label>Caste</Label>
                <Select
                  value={casteId}
                  onValueChange={setCasteId}
                  disabled={!ethnicityId || castes.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        !ethnicityId
                          ? "Select ethnicity first"
                          : castes.length === 0
                          ? "No castes available"
                          : "Select caste"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {castes.map((caste) => (
                      <SelectItem key={caste.id} value={caste.id}>
                        {caste.name || caste.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ethnicityId && castes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No castes found. Add them in Global Settings → Origins first.
                  </p>
                )}
              </div>

              {/* Custom Caste (read-only display) */}
              {profile.customCaste && (
                <div>
                  <Label>Custom Caste (User Entered)</Label>
                  <Input
                    value={customCaste}
                    onChange={(e) => setCustomCaste(e.target.value)}
                    placeholder="Custom caste value"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Clear this field after mapping to a proper caste from the database.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education & Career</CardTitle>
              <CardDescription>
                Update education level and field of study
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Education Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-2">Current Values</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Level: {profile.educationLevel?.label || "Not set"}
                  </Badge>
                  <Badge variant="outline">
                    Field: {profile.educationField?.label || "Not set"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Education Level Selection */}
              <div>
                <Label>Education Level</Label>
                <Select value={educationLevelId} onValueChange={setEducationLevelId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name || level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Education Field Selection */}
              <div>
                <Label>Field of Study</Label>
                <Select value={educationFieldId} onValueChange={setEducationFieldId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select field of study" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name || field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {educationFields.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No education fields found. Add them in Global Settings → Education first.
                  </p>
                )}
              </div>

              {/* Education Details */}
              <div>
                <Label>Education Details</Label>
                <Input
                  value={educationDetails}
                  onChange={(e) => setEducationDetails(e.target.value)}
                  placeholder="Additional education details"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>
                Update mother tongue information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Language Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-2">Current Value</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {profile.motherTongue?.label || profile.otherMotherTongue || "Not set"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Mother Tongue Selection */}
              <div>
                <Label>Mother Tongue</Label>
                <Select value={motherTongueId} onValueChange={setMotherTongueId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select mother tongue" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name || lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Other Mother Tongue */}
              {(isOtherMotherTongueSelected || profile.otherMotherTongue) && (
                <div>
                  <Label>Other Mother Tongue (User Entered)</Label>
                  <Input
                    value={otherMotherTongue}
                    onChange={(e) => setOtherMotherTongue(e.target.value)}
                    placeholder="Custom mother tongue"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Clear this field after adding the language to the database and selecting it above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button */}
      <div className="flex justify-between items-center pt-4">
        <Link href={`/admin/profiles/${resolvedParams.id}/review`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Review
          </Button>
        </Link>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
