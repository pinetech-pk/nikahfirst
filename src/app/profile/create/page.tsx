"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import {
  StepBasicInfo,
  StepOrigin,
  StepLocation,
  StepReligionFamily,
  StepPhysical,
  StepEducationCareer,
  StepBio,
  FormData,
  LookupItem,
  initialFormData,
  STEP_TITLES,
  TOTAL_STEPS,
} from "./_components";

export default function CreateProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
            originAudience: json.profile.originAudience || "SAME_ORIGIN",
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
  const isStep7Valid = formData.bio && formData.bio.length >= 50 && formData.originAudience;

  // Get validation errors for current step
  const getStepValidationErrors = useCallback((currentStep: number): string[] => {
    const errors: string[] = [];
    switch (currentStep) {
      case 1:
        if (!formData.profileFor) errors.push("Profile For");
        if (!formData.gender) errors.push("Gender");
        if (!formData.dateOfBirth) errors.push("Date of Birth");
        if (!formData.maritalStatus) errors.push("Marital Status");
        break;
      case 2:
        if (!formData.originId) errors.push("Origin");
        if (!formData.ethnicityId) errors.push("Ethnicity");
        break;
      case 3:
        if (!formData.countryOfOriginId) errors.push("Country of Origin");
        if (!formData.countryLivingInId) errors.push("Currently Living In");
        if (!formData.stateProvinceId) errors.push("State/Province");
        if (!formData.cityId) errors.push("City");
        break;
      case 4:
        if (!formData.sectId) errors.push("Religious Sect");
        if (!formData.religiousBelonging) errors.push("Religious Practice");
        if (!formData.socialStatus) errors.push("Social Status");
        break;
      case 5:
        if (!formData.heightId) errors.push("Height");
        if (!formData.complexion) errors.push("Complexion");
        break;
      case 6:
        if (!formData.educationLevelId) errors.push("Education Level");
        if (!formData.educationFieldId) errors.push("Field of Study");
        if (!formData.occupationType) errors.push("Occupation Type");
        if (!formData.incomeRangeId) errors.push("Income Range");
        if (!formData.motherTongueId) errors.push("Mother Tongue");
        break;
      case 7:
        if (!formData.bio) errors.push("Bio");
        else if (formData.bio.length < 50) errors.push("Bio (minimum 50 characters)");
        if (!formData.originAudience) errors.push("Profile Visibility");
        break;
    }
    return errors;
  }, [formData]);

  // Update validation errors when form data or step changes
  useEffect(() => {
    setValidationErrors(getStepValidationErrors(step));
  }, [formData, step, getStepValidationErrors]);

  // Get step description
  const getStepDescription = (currentStep: number): string => {
    switch (currentStep) {
      case 1: return "Tell us about the person this profile is for";
      case 2: return "Select your origin and background";
      case 3: return "Where are you from and where do you live?";
      case 4: return "Religious and family information";
      case 5: return "Physical characteristics";
      case 6: return "Your education and career details";
      case 7: return "Write about yourself or the person";
      default: return "";
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <StepBasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return (
          <StepOrigin
            formData={formData}
            updateFormData={updateFormData}
            origins={origins}
            ethnicities={ethnicities}
            castes={castes}
          />
        );
      case 3:
        return (
          <StepLocation
            formData={formData}
            updateFormData={updateFormData}
            countries={countries}
            states={states}
            cities={cities}
          />
        );
      case 4:
        return (
          <StepReligionFamily
            formData={formData}
            updateFormData={updateFormData}
            sects={sects}
            maslaks={maslaks}
          />
        );
      case 5:
        return (
          <StepPhysical
            formData={formData}
            updateFormData={updateFormData}
            heights={heights}
          />
        );
      case 6:
        return (
          <StepEducationCareer
            formData={formData}
            updateFormData={updateFormData}
            educationLevels={educationLevels}
            educationFields={educationFields}
            incomeRanges={incomeRanges}
            languages={languages}
          />
        );
      case 7:
        return <StepBio formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (step) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return isStep4Valid;
      case 5: return isStep5Valid;
      case 6: return isStep6Valid;
      case 7: return isStep7Valid;
      default: return false;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      {/* Back to Dashboard Link */}
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

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

      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 rounded-md bg-amber-50 border border-amber-200">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Please fill in the following required fields:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Step {step}: {STEP_TITLES[step - 1]}</CardTitle>
          <CardDescription>{getStepDescription(step)}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

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
                  disabled={saving || !isCurrentStepValid()}
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
