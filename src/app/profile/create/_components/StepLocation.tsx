"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData, LookupItem } from "./types";
import { MapPin } from "lucide-react";

interface StepLocationProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
  countries: LookupItem[];
  states: LookupItem[];
  cities: LookupItem[];
}

export function StepLocation({
  formData,
  updateFormData,
  countries,
  states,
  cities,
}: StepLocationProps) {
  const [showSuggestionField, setShowSuggestionField] = useState(
    !!formData.suggestedLocation
  );

  const showVisaStatus = formData.countryOfOriginId && formData.countryLivingInId && formData.countryOfOriginId !== formData.countryLivingInId;

  const handleSuggestionToggle = (checked: boolean) => {
    setShowSuggestionField(checked);
    if (!checked) {
      // Clear suggested location when unchecking
      updateFormData("suggestedLocation", "");
    } else {
      // Clear state and city when using suggestion
      updateFormData("stateProvinceId", "");
      updateFormData("cityId", "");
    }
  };

  // Determine if state/city fields should be required
  const locationFromList = !showSuggestionField;
  const hasValidLocation = formData.suggestedLocation || (formData.stateProvinceId && formData.cityId);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="countryOfOrigin">Country of Birth / Origin *</Label>
        <Select
          value={formData.countryOfOriginId}
          onValueChange={(value) => updateFormData("countryOfOriginId", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select country of birth" />
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

      {!showSuggestionField && (
        <>
          <div>
            <Label htmlFor="stateProvince">State/Province {locationFromList ? "*" : ""}</Label>
            <Select
              value={formData.stateProvinceId}
              onValueChange={(value) => {
                updateFormData("stateProvinceId", value);
                updateFormData("cityId", ""); // Reset city when state changes
              }}
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
            <Label htmlFor="city">City {locationFromList ? "*" : ""}</Label>
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
        </>
      )}

      {/* Location Suggestion Option */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cantFindLocation"
            checked={showSuggestionField}
            onCheckedChange={handleSuggestionToggle}
          />
          <label
            htmlFor="cantFindLocation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Can&apos;t find your state/region or city?
          </label>
        </div>

        {showSuggestionField && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="suggestedLocation" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Suggest Your Location *
            </Label>
            <Input
              id="suggestedLocation"
              type="text"
              placeholder="e.g., Abbottabad, Khyber Pakhtunkhwa, Pakistan"
              value={formData.suggestedLocation}
              onChange={(e) => updateFormData("suggestedLocation", e.target.value)}
              className="mt-1"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Enter your city, state/region, and country. Our team will review and add it to the system.
            </p>
          </div>
        )}
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
  );
}
