"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  User,
  Globe,
  MapPin,
  Heart,
  Ruler,
  GraduationCap,
  FileText,
} from "lucide-react";
import {
  StepBasicInfo,
  StepOrigin,
  StepLocation,
  StepReligionFamily,
  StepPhysical,
  StepEducationCareer,
  StepBio,
  MIN_BIO_LENGTH,
  FormData,
  LookupItem,
  initialFormData,
} from "@/app/profile/create/_components";

const TABS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "origin", label: "Origin", icon: Globe },
  { id: "location", label: "Location", icon: MapPin },
  { id: "religion", label: "Religion & Family", icon: Heart },
  { id: "physical", label: "Physical", icon: Ruler },
  { id: "education", label: "Education & Career", icon: GraduationCap },
  { id: "bio", label: "Bio & Visibility", icon: FileText },
];

export default function EditProfileInformationPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lookup data states
  const [origins, setOrigins] = useState<LookupItem[]>([]);
  const [ethnicities, setEthnicities] = useState<LookupItem[]>([]);
  const [castes, setCastes] = useState<LookupItem[]>([]);
  const [countries, setCountries] = useState<LookupItem[]>([]);
  const [states, setStates] = useState<LookupItem[]>([]);
  const [cities, setCities] = useState<LookupItem[]>([]);
  const [sects, setSects] = useState<LookupItem[]>([]);
  const [maslaks, setMaslaks] = useState<LookupItem[]>([]);
  const [heights, setHeights] = useState<LookupItem[]>([]);
  const [educationLevels, setEducationLevels] = useState<LookupItem[]>([]);
  const [educationFields, setEducationFields] = useState<LookupItem[]>([]);
  const [incomeRanges, setIncomeRanges] = useState<LookupItem[]>([]);
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

  // Load profile and initial lookup data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch profile data
        const profileRes = await fetch(`/api/profile?id=${profileId}`);
        const profileJson = await profileRes.json();

        if (!profileJson.profile) {
          router.push("/dashboard/profiles");
          return;
        }

        const profile = profileJson.profile;

        // Populate form data
        setFormData({
          profileFor: profile.profileFor || "",
          gender: profile.gender || "",
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
          maritalStatus: profile.maritalStatus || "NEVER_MARRIED",
          numberOfChildren: profile.numberOfChildren || 0,
          childrenLivingWith: profile.childrenLivingWith || "",
          originId: profile.originId || "",
          ethnicityId: profile.ethnicityId || "",
          casteId: profile.casteId || "",
          customCaste: profile.customCaste || "",
          countryOfOriginId: profile.countryOfOriginId || "",
          countryLivingInId: profile.countryLivingInId || "",
          stateProvinceId: profile.stateProvinceId || "",
          cityId: profile.cityId || "",
          visaStatus: profile.visaStatus || "",
          suggestedLocation: profile.suggestedLocation || "",
          sectId: profile.sectId || "",
          maslakId: profile.maslakId || "",
          religiousBelonging: profile.religiousBelonging || "",
          socialStatus: profile.socialStatus || "",
          numberOfBrothers: profile.numberOfBrothers || 0,
          numberOfSisters: profile.numberOfSisters || 0,
          marriedBrothers: profile.marriedBrothers || 0,
          marriedSisters: profile.marriedSisters || 0,
          fatherOccupation: profile.fatherOccupation || "",
          propertyOwnership: profile.propertyOwnership || "",
          heightId: profile.heightId || "",
          complexion: profile.complexion || "",
          hasDisability: profile.hasDisability || false,
          disabilityDetails: profile.disabilityDetails || "",
          educationLevelId: profile.educationLevelId || "",
          educationFieldId: profile.educationFieldId || "",
          educationDetails: profile.educationDetails || "",
          occupationType: profile.occupationType || "",
          occupationDetails: profile.occupationDetails || "",
          incomeRangeId: profile.incomeRangeId || "",
          motherTongueId: profile.motherTongueId || "",
          otherMotherTongue: profile.otherMotherTongue || "",
          bio: profile.bio || "",
          originAudience: profile.originAudience || "SAME_ORIGIN",
        });

        // Fetch all lookup data in parallel
        const [
          originsData,
          countriesData,
          sectsData,
          heightsData,
          educationLevelsData,
          educationFieldsData,
        ] = await Promise.all([
          fetchLookup("origin"),
          fetchLookup("country"),
          fetchLookup("sect"),
          fetchLookup("height"),
          fetchLookup("educationLevel"),
          fetchLookup("educationField"),
        ]);

        setOrigins(originsData);
        setCountries(countriesData);
        setSects(sectsData);
        setHeights(heightsData);
        setEducationLevels(educationLevelsData);
        setEducationFields(educationFieldsData);

        // Fetch dependent data if parent IDs exist
        if (profile.originId) {
          const ethnicitiesData = await fetchLookup("ethnicity", profile.originId);
          setEthnicities(ethnicitiesData);
        }
        if (profile.ethnicityId) {
          const castesData = await fetchLookup("caste", profile.ethnicityId);
          setCastes(castesData);
        }
        if (profile.countryLivingInId) {
          const [statesData, incomeData] = await Promise.all([
            fetchLookup("stateProvince", profile.countryLivingInId),
            fetchLookup("incomeRange", profile.countryLivingInId),
          ]);
          setStates(statesData);
          setIncomeRanges(incomeData);
        }
        if (profile.stateProvinceId) {
          const citiesData = await fetchLookup("city", profile.stateProvinceId);
          setCities(citiesData);
        }
        if (profile.sectId) {
          const maslaksData = await fetchLookup("maslak", profile.sectId);
          setMaslaks(maslaksData);
        }
        if (profile.countryOfOriginId) {
          const languagesData = await fetchLookup("language", profile.countryOfOriginId);
          setLanguages(languagesData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
        setLoading(false);
      }
    };

    loadData();
  }, [profileId, router, fetchLookup]);

  // Load dependent data when parent selection changes
  useEffect(() => {
    if (formData.originId && !loading) {
      fetchLookup("ethnicity", formData.originId).then(setEthnicities);
    }
  }, [formData.originId, fetchLookup, loading]);

  useEffect(() => {
    if (formData.ethnicityId && !loading) {
      fetchLookup("caste", formData.ethnicityId).then(setCastes);
    }
  }, [formData.ethnicityId, fetchLookup, loading]);

  useEffect(() => {
    if (formData.countryLivingInId && !loading) {
      fetchLookup("stateProvince", formData.countryLivingInId).then(setStates);
      fetchLookup("incomeRange", formData.countryLivingInId).then(setIncomeRanges);
    }
  }, [formData.countryLivingInId, fetchLookup, loading]);

  useEffect(() => {
    if (formData.stateProvinceId && !loading) {
      fetchLookup("city", formData.stateProvinceId).then(setCities);
    }
  }, [formData.stateProvinceId, fetchLookup, loading]);

  useEffect(() => {
    if (formData.sectId && !loading) {
      fetchLookup("maslak", formData.sectId).then(setMaslaks);
    }
  }, [formData.sectId, fetchLookup, loading]);

  useEffect(() => {
    if (formData.countryOfOriginId && !loading) {
      fetchLookup("language", formData.countryOfOriginId).then(setLanguages);
    }
  }, [formData.countryOfOriginId, fetchLookup, loading]);

  const updateFormData = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null); // Clear message on change
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          ...formData,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: json.message || "Profile updated successfully!" });
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
  const isOtherMotherTongueSelected = languages.find((l) => l.id === formData.motherTongueId)?.isOther || false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href={`/dashboard/profile/${profileId}/edit`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Edit Profile
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile Information</h1>
          <p className="text-gray-500 mt-1">Update your personal details and preferences</p>
        </div>
        <Button onClick={saveChanges} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-2 px-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <TabsContent value="basic" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Profile type, gender, date of birth, and marital status</CardDescription>
              </CardHeader>
              <StepBasicInfo formData={formData} updateFormData={updateFormData} />
            </TabsContent>

            <TabsContent value="origin" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Origin & Background</CardTitle>
                <CardDescription>Your origin, ethnicity, and caste information</CardDescription>
              </CardHeader>
              <StepOrigin
                formData={formData}
                updateFormData={updateFormData}
                origins={origins}
                ethnicities={ethnicities}
                castes={castes}
              />
            </TabsContent>

            <TabsContent value="location" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Country of origin and current residence</CardDescription>
              </CardHeader>
              <StepLocation
                formData={formData}
                updateFormData={updateFormData}
                countries={countries}
                states={states}
                cities={cities}
              />
            </TabsContent>

            <TabsContent value="religion" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Religion & Family</CardTitle>
                <CardDescription>Religious sect, family details, and social status</CardDescription>
              </CardHeader>
              <StepReligionFamily
                formData={formData}
                updateFormData={updateFormData}
                sects={sects}
                maslaks={maslaks}
              />
            </TabsContent>

            <TabsContent value="physical" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Physical Attributes</CardTitle>
                <CardDescription>Height, complexion, and other physical details</CardDescription>
              </CardHeader>
              <StepPhysical formData={formData} updateFormData={updateFormData} heights={heights} />
            </TabsContent>

            <TabsContent value="education" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Education & Career</CardTitle>
                <CardDescription>Educational background, occupation, and income</CardDescription>
              </CardHeader>
              <StepEducationCareer
                formData={formData}
                updateFormData={updateFormData}
                educationLevels={educationLevels}
                educationFields={educationFields}
                incomeRanges={incomeRanges}
                languages={languages}
                isOtherMotherTongueSelected={isOtherMotherTongueSelected}
              />
            </TabsContent>

            <TabsContent value="bio" className="mt-0">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Bio & Visibility</CardTitle>
                <CardDescription>Write about yourself and control who can see your profile</CardDescription>
              </CardHeader>
              <StepBio formData={formData} updateFormData={updateFormData} />
            </TabsContent>

            {/* Save Button at Bottom */}
            <div className="mt-8 pt-4 border-t flex justify-end">
              <Button onClick={saveChanges} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
