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
} from "lucide-react";

interface LookupItem {
  id: string;
  name?: string;
}

interface Profile {
  id: string;
  countryOfOrigin: { id: string; name: string } | null;
  countryLivingIn: { id: string; name: string } | null;
  stateProvince: { id: string; name: string } | null;
  city: { id: string; name: string } | null;
  visaStatus: string | null;
  suggestedLocation: string | null;
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

  // Form state
  const [countryLivingInId, setCountryLivingInId] = useState("");
  const [stateProvinceId, setStateProvinceId] = useState("");
  const [cityId, setCityId] = useState("");
  const [visaStatus, setVisaStatus] = useState("");
  const [clearSuggestedLocation, setClearSuggestedLocation] = useState(false);

  // Lookup data
  const [countries, setCountries] = useState<LookupItem[]>([]);
  const [states, setStates] = useState<LookupItem[]>([]);
  const [cities, setCities] = useState<LookupItem[]>([]);

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

        // Set form values
        setCountryLivingInId(profileData.countryLivingIn?.id || "");
        setStateProvinceId(profileData.stateProvince?.id || "");
        setCityId(profileData.city?.id || "");
        setVisaStatus(profileData.visaStatus || "");

        // Fetch countries
        const countriesData = await fetchLookup("country");
        setCountries(countriesData);

        // Fetch states if country is set
        if (profileData.countryLivingIn?.id) {
          const statesData = await fetchLookup("stateProvince", profileData.countryLivingIn.id);
          setStates(statesData);
        }

        // Fetch cities if state is set
        if (profileData.stateProvince?.id) {
          const citiesData = await fetchLookup("city", profileData.stateProvince.id);
          setCities(citiesData);
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
    if (countryLivingInId) {
      fetchLookup("stateProvince", countryLivingInId).then(setStates);
      // Reset state and city when country changes
      if (profile && countryLivingInId !== profile.countryLivingIn?.id) {
        setStateProvinceId("");
        setCityId("");
        setCities([]);
      }
    } else {
      setStates([]);
      setStateProvinceId("");
      setCities([]);
      setCityId("");
    }
  }, [countryLivingInId, fetchLookup, profile]);

  // Load cities when state changes
  useEffect(() => {
    if (stateProvinceId) {
      fetchLookup("city", stateProvinceId).then(setCities);
      // Reset city when state changes
      if (profile && stateProvinceId !== profile.stateProvince?.id) {
        setCityId("");
      }
    } else {
      setCities([]);
      setCityId("");
    }
  }, [stateProvinceId, fetchLookup, profile]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updateData: Record<string, string | null> = {
        countryLivingInId: countryLivingInId || null,
        stateProvinceId: stateProvinceId || null,
        cityId: cityId || null,
        visaStatus: visaStatus || null,
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
          if (clearSuggestedLocation && stateProvinceId && cityId) {
            setProfile((prev) => prev ? { ...prev, suggestedLocation: null } : prev);
          }
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/profiles/${resolvedParams.id}/review`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile Location</h1>
            <p className="text-gray-600">
              Update location information for this profile
            </p>
          </div>
        </div>
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

      {/* Suggested Location Alert */}
      {profile.suggestedLocation && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              User Suggested Location
            </CardTitle>
            <CardDescription className="text-amber-700">
              The user provided this location because they couldn&apos;t find it in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-amber-900 text-lg">{profile.suggestedLocation}</p>
            <p className="text-sm text-amber-600 mt-2">
              If you&apos;ve added this location to the database, select it below and check the box to clear this suggestion.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Location Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </CardTitle>
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
                <Globe className="h-3 w-3 mr-1" />
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
            <Label htmlFor="country">Country Living In</Label>
            <Select value={countryLivingInId} onValueChange={setCountryLivingInId}>
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
            <Label htmlFor="state">State/Province</Label>
            <Select
              value={stateProvinceId}
              onValueChange={setStateProvinceId}
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
                No states/provinces found for this country. You may need to add them in Global Settings first.
              </p>
            )}
          </div>

          {/* City Selection */}
          <div>
            <Label htmlFor="city">City</Label>
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
                No cities found for this state. You may need to add them in Global Settings first.
              </p>
            )}
          </div>

          {/* Visa Status */}
          <div>
            <Label htmlFor="visaStatus">Visa Status</Label>
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
                Clear suggested location after saving (only if state and city are properly mapped)
              </label>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Link href={`/admin/profiles/${resolvedParams.id}/review`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Review
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
