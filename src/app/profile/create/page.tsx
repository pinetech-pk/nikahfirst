"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2 } from "lucide-react";

const TOTAL_STEPS = 7;

// Step titles for the progress indicator
const STEP_TITLES = [
  "Basic Info",
  "Origin & Background",
  "Location",
  "Religion & Family",
  "Physical Attributes",
  "Education & Career",
  "About Me",
];

// Types for lookup data
interface LookupItem {
  id: string;
  name?: string;
  display?: string;
  originId?: string;
  ethnicityId?: string;
  countryId?: string;
  stateProvinceId?: string;
  sectId?: string;
}

interface FormData {
  // Step 1: Basic Info
  profileFor: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  numberOfChildren: number;
  childrenLivingWith: string;
  // Step 2: Origin & Background
  originId: string;
  ethnicityId: string;
  casteId: string;
  customCaste: string;
  // Step 3: Location
  countryOfOriginId: string;
  countryLivingInId: string;
  stateProvinceId: string;
  cityId: string;
  visaStatus: string;
  // Step 4: Religion & Family
  sectId: string;
  maslakId: string;
  religiousBelonging: string;
  socialStatus: string;
  numberOfBrothers: number;
  numberOfSisters: number;
  marriedBrothers: number;
  marriedSisters: number;
  fatherOccupation: string;
  propertyOwnership: string;
  // Step 5: Physical Attributes
  heightId: string;
  complexion: string;
  hasDisability: boolean;
  disabilityDetails: string;
  // Step 6: Education & Career
  educationLevelId: string;
  educationFieldId: string;
  educationDetails: string;
  occupationType: string;
  occupationDetails: string;
  incomeRangeId: string;
  motherTongueId: string;
  // Step 7: Bio
  bio: string;
}

const initialFormData: FormData = {
  profileFor: "",
  gender: "",
  dateOfBirth: "",
  maritalStatus: "NEVER_MARRIED",
  numberOfChildren: 0,
  childrenLivingWith: "",
  originId: "",
  ethnicityId: "",
  casteId: "",
  customCaste: "",
  countryOfOriginId: "",
  countryLivingInId: "",
  stateProvinceId: "",
  cityId: "",
  visaStatus: "",
  sectId: "",
  maslakId: "",
  religiousBelonging: "",
  socialStatus: "",
  numberOfBrothers: 0,
  numberOfSisters: 0,
  marriedBrothers: 0,
  marriedSisters: 0,
  fatherOccupation: "",
  propertyOwnership: "",
  heightId: "",
  complexion: "",
  hasDisability: false,
  disabilityDetails: "",
  educationLevelId: "",
  educationFieldId: "",
  educationDetails: "",
  occupationType: "",
  occupationDetails: "",
  incomeRangeId: "",
  motherTongueId: "",
  bio: "",
};

export default function CreateProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
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

  // Load initial lookup data
  useEffect(() => {
    const loadInitialData = async () => {
      const [
        originsData,
        countriesData,
        sectsData,
        heightsData,
        educationLevelsData,
        educationFieldsData,
        incomeRangesData,
        languagesData,
      ] = await Promise.all([
        fetchLookup("origin"),
        fetchLookup("country"),
        fetchLookup("sect"),
        fetchLookup("height"),
        fetchLookup("educationLevel"),
        fetchLookup("educationField"),
        fetchLookup("incomeRange"),
        fetchLookup("language"),
      ]);

      setOrigins(originsData);
      setCountries(countriesData);
      setSects(sectsData);
      setHeights(heightsData);
      setEducationLevels(educationLevelsData);
      setEducationFields(educationFieldsData);
      setIncomeRanges(incomeRangesData);
      setLanguages(languagesData);
    };

    loadInitialData();
  }, [fetchLookup]);

  // Check for existing incomplete profile on mount
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json.profile) {
          setProfileId(json.profile.id);
          setProfileCompletion(json.profile.profileCompletion || 0);
          // Populate form with existing data
          setFormData((prev) => ({
            ...prev,
            profileFor: json.profile.profileFor || "",
            gender: json.profile.gender || "",
            dateOfBirth: json.profile.dateOfBirth ? new Date(json.profile.dateOfBirth).toISOString().split("T")[0] : "",
            maritalStatus: json.profile.maritalStatus || "NEVER_MARRIED",
            numberOfChildren: json.profile.numberOfChildren || 0,
            childrenLivingWith: json.profile.childrenLivingWith || "",
            originId: json.profile.originId || "",
            ethnicityId: json.profile.ethnicityId || "",
            casteId: json.profile.casteId || "",
            customCaste: json.profile.customCaste || "",
            countryOfOriginId: json.profile.countryOfOriginId || "",
            countryLivingInId: json.profile.countryLivingInId || "",
            stateProvinceId: json.profile.stateProvinceId || "",
            cityId: json.profile.cityId || "",
            visaStatus: json.profile.visaStatus || "",
            sectId: json.profile.sectId || "",
            maslakId: json.profile.maslakId || "",
            religiousBelonging: json.profile.religiousBelonging || "",
            socialStatus: json.profile.socialStatus || "",
            numberOfBrothers: json.profile.numberOfBrothers || 0,
            numberOfSisters: json.profile.numberOfSisters || 0,
            marriedBrothers: json.profile.marriedBrothers || 0,
            marriedSisters: json.profile.marriedSisters || 0,
            fatherOccupation: json.profile.fatherOccupation || "",
            propertyOwnership: json.profile.propertyOwnership || "",
            heightId: json.profile.heightId || "",
            complexion: json.profile.complexion || "",
            hasDisability: json.profile.hasDisability || false,
            disabilityDetails: json.profile.disabilityDetails || "",
            educationLevelId: json.profile.educationLevelId || "",
            educationFieldId: json.profile.educationFieldId || "",
            educationDetails: json.profile.educationDetails || "",
            occupationType: json.profile.occupationType || "",
            occupationDetails: json.profile.occupationDetails || "",
            incomeRangeId: json.profile.incomeRangeId || "",
            motherTongueId: json.profile.motherTongueId || "",
            bio: json.profile.bio || "",
          }));
          // Determine which step to show based on completion
          if (json.profile.profileCompletion < 30) setStep(2);
          else if (json.profile.profileCompletion < 45) setStep(3);
          else if (json.profile.profileCompletion < 60) setStep(4);
          else if (json.profile.profileCompletion < 75) setStep(5);
          else if (json.profile.profileCompletion < 90) setStep(6);
          else setStep(7);
        }
      } catch (error) {
        console.error("Failed to check existing profile:", error);
      }
    };

    checkExistingProfile();
  }, []);

  // Load dependent data when parent selection changes
  useEffect(() => {
    if (formData.originId) {
      fetchLookup("ethnicity", formData.originId).then(setEthnicities);
    } else {
      setEthnicities([]);
      setFormData((prev) => ({ ...prev, ethnicityId: "", casteId: "" }));
    }
  }, [formData.originId, fetchLookup]);

  useEffect(() => {
    if (formData.ethnicityId) {
      fetchLookup("caste", formData.ethnicityId).then(setCastes);
    } else {
      setCastes([]);
      setFormData((prev) => ({ ...prev, casteId: "" }));
    }
  }, [formData.ethnicityId, fetchLookup]);

  useEffect(() => {
    if (formData.countryLivingInId) {
      fetchLookup("stateProvince", formData.countryLivingInId).then(setStates);
    } else {
      setStates([]);
      setFormData((prev) => ({ ...prev, stateProvinceId: "", cityId: "" }));
    }
  }, [formData.countryLivingInId, fetchLookup]);

  useEffect(() => {
    if (formData.stateProvinceId) {
      fetchLookup("city", formData.stateProvinceId).then(setCities);
    } else {
      setCities([]);
      setFormData((prev) => ({ ...prev, cityId: "" }));
    }
  }, [formData.stateProvinceId, fetchLookup]);

  useEffect(() => {
    if (formData.sectId) {
      fetchLookup("maslak", formData.sectId).then(setMaslaks);
    } else {
      setMaslaks([]);
      setFormData((prev) => ({ ...prev, maslakId: "" }));
    }
  }, [formData.sectId, fetchLookup]);

  const updateFormData = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveStep = async (nextStep?: number) => {
    setSaving(true);
    setMessage(null);

    try {
      if (step === 1 && !profileId) {
        // Create new profile
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileFor: formData.profileFor,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            maritalStatus: formData.maritalStatus,
            numberOfChildren: formData.numberOfChildren,
            childrenLivingWith: formData.childrenLivingWith,
          }),
        });

        const json = await res.json();
        if (res.ok) {
          setProfileId(json.profileId);
          setProfileCompletion(json.profileCompletion);
          setMessage({ type: "success", text: json.message });
          if (nextStep) setStep(nextStep);
        } else {
          setMessage({ type: "error", text: json.error });
        }
      } else if (profileId) {
        // Update existing profile
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            step,
            ...formData,
          }),
        });

        const json = await res.json();
        if (res.ok) {
          setProfileCompletion(json.profileCompletion);
          setMessage({ type: "success", text: json.message });
          if (nextStep) setStep(nextStep);
        } else {
          setMessage({ type: "error", text: json.error });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    saveStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    await saveStep();
    setLoading(false);
    router.push("/dashboard");
  };

  // Validation for each step
  const isStep1Valid = formData.profileFor && formData.gender && formData.dateOfBirth && formData.maritalStatus;
  const isStep2Valid = formData.originId && formData.ethnicityId;
  const isStep3Valid = formData.countryOfOriginId && formData.countryLivingInId && formData.stateProvinceId && formData.cityId;
  const isStep4Valid = formData.sectId && formData.religiousBelonging && formData.socialStatus;
  const isStep5Valid = formData.heightId && formData.complexion;
  const isStep6Valid = formData.educationLevelId && formData.educationFieldId && formData.occupationType && formData.incomeRangeId && formData.motherTongueId;
  const isStep7Valid = formData.bio && formData.bio.length >= 50;

  const showChildrenFields = formData.maritalStatus !== "NEVER_MARRIED";
  const showVisaStatus = formData.countryOfOriginId && formData.countryLivingInId && formData.countryOfOriginId !== formData.countryLivingInId;

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Create Profile</h1>
          <span className="text-sm text-muted-foreground">
            {profileCompletion}% Complete
          </span>
        </div>
        <Progress value={profileCompletion} className="h-2" />
        <div className="flex justify-between mt-4">
          {STEP_TITLES.map((title, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index + 1 === step
                  ? "text-primary"
                  : index + 1 < step
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 === step
                    ? "bg-primary text-white"
                    : index + 1 < step
                    ? "bg-green-600 text-white"
                    : "bg-muted"
                }`}
              >
                {index + 1 < step ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span className="text-xs mt-1 hidden md:block">{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Step {step}: {STEP_TITLES[step - 1]}</CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about the person this profile is for"}
            {step === 2 && "Select your origin and background"}
            {step === 3 && "Where are you from and where do you live?"}
            {step === 4 && "Religious and family information"}
            {step === 5 && "Physical characteristics"}
            {step === 6 && "Your education and career details"}
            {step === 7 && "Write about yourself or the person"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base">Who is this profile for? *</Label>
                <RadioGroup
                  value={formData.profileFor}
                  onValueChange={(value) => updateFormData("profileFor", value)}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {["SELF", "SON", "DAUGHTER", "BROTHER", "SISTER", "RELATIVE"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option.toLowerCase()} />
                      <Label htmlFor={option.toLowerCase()}>
                        {option === "SELF" ? "Myself" : option.charAt(0) + option.slice(1).toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Gender *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => updateFormData("gender", value)}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <Label htmlFor="male">Male (Groom)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <Label htmlFor="female">Female (Bride)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  className="mt-1"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                />
              </div>

              <div>
                <Label htmlFor="maritalStatus">Marital Status *</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => updateFormData("maritalStatus", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEVER_MARRIED">Never Married</SelectItem>
                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                    <SelectItem value="MARRIED">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showChildrenFields && (
                <>
                  <div>
                    <Label htmlFor="numberOfChildren">Number of Children</Label>
                    <Input
                      id="numberOfChildren"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.numberOfChildren}
                      onChange={(e) => updateFormData("numberOfChildren", parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>

                  {formData.numberOfChildren > 0 && (
                    <div>
                      <Label htmlFor="childrenLivingWith">Children Living With</Label>
                      <Input
                        id="childrenLivingWith"
                        placeholder="e.g., Mother, Father, Both"
                        value={formData.childrenLivingWith}
                        onChange={(e) => updateFormData("childrenLivingWith", e.target.value)}
                        className="mt-1"
                        maxLength={50}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Origin & Background */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="origin">Origin *</Label>
                <Select
                  value={formData.originId}
                  onValueChange={(value) => updateFormData("originId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {origins.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ethnicity">Ethnicity *</Label>
                <Select
                  value={formData.ethnicityId}
                  onValueChange={(value) => updateFormData("ethnicityId", value)}
                  disabled={!formData.originId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={formData.originId ? "Select ethnicity" : "Select origin first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ethnicities.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caste">Caste</Label>
                <Select
                  value={formData.casteId}
                  onValueChange={(value) => updateFormData("casteId", value)}
                  disabled={!formData.ethnicityId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={formData.ethnicityId ? "Select caste (optional)" : "Select ethnicity first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {castes.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customCaste">Custom Caste (if not in list)</Label>
                <Input
                  id="customCaste"
                  placeholder="Enter caste if not listed above"
                  value={formData.customCaste}
                  onChange={(e) => updateFormData("customCaste", e.target.value)}
                  className="mt-1"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="countryOfOrigin">Country of Origin *</Label>
                <Select
                  value={formData.countryOfOriginId}
                  onValueChange={(value) => updateFormData("countryOfOriginId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country of origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="countryLivingIn">Currently Living In *</Label>
                <Select
                  value={formData.countryLivingInId}
                  onValueChange={(value) => updateFormData("countryLivingInId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stateProvince">State/Province *</Label>
                <Select
                  value={formData.stateProvinceId}
                  onValueChange={(value) => updateFormData("stateProvinceId", value)}
                  disabled={!formData.countryLivingInId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={formData.countryLivingInId ? "Select state/province" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(value) => updateFormData("cityId", value)}
                  disabled={!formData.stateProvinceId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={formData.stateProvinceId ? "Select city" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showVisaStatus && (
                <div>
                  <Label htmlFor="visaStatus">Visa Status</Label>
                  <Select
                    value={formData.visaStatus}
                    onValueChange={(value) => updateFormData("visaStatus", value)}
                  >
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
              )}
            </div>
          )}

          {/* Step 4: Religion & Family */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="sect">Religious Sect *</Label>
                <Select
                  value={formData.sectId}
                  onValueChange={(value) => updateFormData("sectId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select sect" />
                  </SelectTrigger>
                  <SelectContent>
                    {sects.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maslak">Maslak (Sub-sect)</Label>
                <Select
                  value={formData.maslakId}
                  onValueChange={(value) => updateFormData("maslakId", value)}
                  disabled={!formData.sectId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={formData.sectId ? "Select maslak (optional)" : "Select sect first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {maslaks.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="religiousBelonging">Religious Practice *</Label>
                <Select
                  value={formData.religiousBelonging}
                  onValueChange={(value) => updateFormData("religiousBelonging", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select religious practice level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRICT">Strict</SelectItem>
                    <SelectItem value="INCLINED">Inclined</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="LIBERAL">Liberal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="socialStatus">Social Status *</Label>
                <Select
                  value={formData.socialStatus}
                  onValueChange={(value) => updateFormData("socialStatus", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select social status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELITE_CLASS">Elite Class</SelectItem>
                    <SelectItem value="ESTABLISHED_MIDDLE">Established Middle Class</SelectItem>
                    <SelectItem value="TECHNICALLY_MIDDLE">Technically Middle Class</SelectItem>
                    <SelectItem value="AFFLUENT_WORKING">Affluent Working Class</SelectItem>
                    <SelectItem value="TRADITIONAL_WORKING">Traditional Working Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfBrothers">Brothers</Label>
                  <Input
                    id="numberOfBrothers"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.numberOfBrothers}
                    onChange={(e) => updateFormData("numberOfBrothers", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marriedBrothers">Married Brothers</Label>
                  <Input
                    id="marriedBrothers"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.marriedBrothers}
                    onChange={(e) => updateFormData("marriedBrothers", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfSisters">Sisters</Label>
                  <Input
                    id="numberOfSisters"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.numberOfSisters}
                    onChange={(e) => updateFormData("numberOfSisters", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marriedSisters">Married Sisters</Label>
                  <Input
                    id="marriedSisters"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.marriedSisters}
                    onChange={(e) => updateFormData("marriedSisters", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fatherOccupation">Father&apos;s Occupation</Label>
                <Input
                  id="fatherOccupation"
                  placeholder="e.g., Businessman, Government Officer"
                  value={formData.fatherOccupation}
                  onChange={(e) => updateFormData("fatherOccupation", e.target.value)}
                  className="mt-1"
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="propertyOwnership">Property Ownership</Label>
                <Input
                  id="propertyOwnership"
                  placeholder="e.g., Own House, Rented"
                  value={formData.propertyOwnership}
                  onChange={(e) => updateFormData("propertyOwnership", e.target.value)}
                  className="mt-1"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {/* Step 5: Physical Attributes */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="height">Height *</Label>
                <Select
                  value={formData.heightId}
                  onValueChange={(value) => updateFormData("heightId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent>
                    {heights.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="complexion">Complexion *</Label>
                <Select
                  value={formData.complexion}
                  onValueChange={(value) => updateFormData("complexion", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select complexion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERY_FAIR">Very Fair</SelectItem>
                    <SelectItem value="MEDIUM_FAIR">Medium Fair</SelectItem>
                    <SelectItem value="TAN_WHEATISH">Tan/Wheatish</SelectItem>
                    <SelectItem value="DARK">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDisability"
                  checked={formData.hasDisability}
                  onCheckedChange={(checked) => updateFormData("hasDisability", checked as boolean)}
                />
                <Label htmlFor="hasDisability">Has any disability</Label>
              </div>

              {formData.hasDisability && (
                <div>
                  <Label htmlFor="disabilityDetails">Disability Details</Label>
                  <Input
                    id="disabilityDetails"
                    placeholder="Please provide details"
                    value={formData.disabilityDetails}
                    onChange={(e) => updateFormData("disabilityDetails", e.target.value)}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 6: Education & Career */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="educationLevel">Education Level *</Label>
                <Select
                  value={formData.educationLevelId}
                  onValueChange={(value) => updateFormData("educationLevelId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="educationField">Field of Study *</Label>
                <Select
                  value={formData.educationFieldId}
                  onValueChange={(value) => updateFormData("educationFieldId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select field of study" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationFields.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="educationDetails">Education Details</Label>
                <Input
                  id="educationDetails"
                  placeholder="e.g., MBBS from King Edward Medical University"
                  value={formData.educationDetails}
                  onChange={(e) => updateFormData("educationDetails", e.target.value)}
                  className="mt-1"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="occupationType">Occupation Type *</Label>
                <Select
                  value={formData.occupationType}
                  onValueChange={(value) => updateFormData("occupationType", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select occupation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELF_EMPLOYED">Self Employed</SelectItem>
                    <SelectItem value="PRIVATE_JOB">Private Job</SelectItem>
                    <SelectItem value="GOVERNMENT_JOB">Government Job</SelectItem>
                    <SelectItem value="ARMED_FORCES">Armed Forces</SelectItem>
                    <SelectItem value="NOT_WORKING">Not Working</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occupationDetails">Job Title / Details</Label>
                <Input
                  id="occupationDetails"
                  placeholder="e.g., Software Engineer at Google"
                  value={formData.occupationDetails}
                  onChange={(e) => updateFormData("occupationDetails", e.target.value)}
                  className="mt-1"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="incomeRange">Income Range *</Label>
                <Select
                  value={formData.incomeRangeId}
                  onValueChange={(value) => updateFormData("incomeRangeId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeRanges.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="motherTongue">Mother Tongue *</Label>
                <Select
                  value={formData.motherTongueId}
                  onValueChange={(value) => updateFormData("motherTongueId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select mother tongue" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 7: Bio */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="bio">About Me / About the Person *</Label>
                <Textarea
                  id="bio"
                  placeholder="Write a detailed description about yourself or the person this profile is for. Include personality traits, interests, hobbies, what you're looking for in a partner, etc. (Minimum 50 characters)"
                  value={formData.bio}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  className="mt-1"
                  rows={8}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.bio.length}/50 characters minimum
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || saving}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {profileId && step > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => saveStep()}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Progress
                </Button>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    saving ||
                    (step === 1 && !isStep1Valid) ||
                    (step === 2 && !isStep2Valid) ||
                    (step === 3 && !isStep3Valid) ||
                    (step === 4 && !isStep4Valid) ||
                    (step === 5 && !isStep5Valid) ||
                    (step === 6 && !isStep6Valid)
                  }
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save & Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading || !isStep7Valid}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Complete Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
