"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData, LookupItem } from "./types";

interface StepEducationCareerProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
  educationLevels: LookupItem[];
  educationFields: LookupItem[];
  incomeRanges: LookupItem[];
  languages: LookupItem[];
  isOtherMotherTongueSelected: boolean; // Whether "Other" language is selected
}

export function StepEducationCareer({
  formData,
  updateFormData,
  educationLevels,
  educationFields,
  incomeRanges,
  languages,
  isOtherMotherTongueSelected,
}: StepEducationCareerProps) {
  return (
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
        <Label htmlFor="motherTongue">Mother Tongue</Label>
        <Select
          value={formData.motherTongueId}
          onValueChange={(value) => {
            updateFormData("motherTongueId", value);
            // Clear custom text if not selecting "Other"
            const selectedLang = languages.find((l) => l.id === value);
            if (!selectedLang?.isOther) {
              updateFormData("otherMotherTongue", "");
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select mother tongue (optional)" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nameNative ? `${item.name} (${item.nameNative})` : item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Can&apos;t find your language? Select &quot;Other&quot; to suggest one.
        </p>
      </div>

      {/* Show text input when "Other" is selected */}
      {isOtherMotherTongueSelected && (
        <div>
          <Label htmlFor="otherMotherTongue">Specify Your Mother Tongue *</Label>
          <Input
            id="otherMotherTongue"
            placeholder="e.g., Shina, Burushaski, Khowar"
            value={formData.otherMotherTongue}
            onChange={(e) => updateFormData("otherMotherTongue", e.target.value)}
            className="mt-1"
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your suggestion will be reviewed and may be added to our list.
          </p>
        </div>
      )}
    </div>
  );
}
