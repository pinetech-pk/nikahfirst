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

interface StepOriginProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
  origins: LookupItem[];
  ethnicities: LookupItem[];
  castes: LookupItem[];
}

export function StepOrigin({
  formData,
  updateFormData,
  origins,
  ethnicities,
  castes,
}: StepOriginProps) {
  return (
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
  );
}
