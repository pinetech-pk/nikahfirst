"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData, LookupItem } from "./types";

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
  const showVisaStatus = formData.countryOfOriginId && formData.countryLivingInId && formData.countryOfOriginId !== formData.countryLivingInId;

  return (
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
  );
}
