"use client";

import { useMemo } from "react";
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
  // Get the selected origin to access its terminology
  const selectedOrigin = useMemo(() => {
    return origins.find((o) => o.id === formData.originId);
  }, [origins, formData.originId]);

  // Dynamic labels based on selected origin
  const level1Label = selectedOrigin?.level1Label || "Ethnicity";
  const level2Label = selectedOrigin?.level2Label || "Caste";
  const level2Enabled = selectedOrigin?.level2Enabled ?? true;

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="origin">Origin *</Label>
        <Select
          value={formData.originId}
          onValueChange={(value) => {
            updateFormData("originId", value);
            // Clear dependent fields when origin changes
            updateFormData("ethnicityId", "");
            updateFormData("casteId", "");
            updateFormData("customCaste", "");
          }}
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
        <Label htmlFor="ethnicity">{level1Label} *</Label>
        <Select
          value={formData.ethnicityId}
          onValueChange={(value) => {
            updateFormData("ethnicityId", value);
            // Clear caste when ethnicity changes
            updateFormData("casteId", "");
            updateFormData("customCaste", "");
          }}
          disabled={!formData.originId}
        >
          <SelectTrigger className="mt-1">
            <SelectValue
              placeholder={formData.originId ? `Select ${level1Label.toLowerCase()}` : "Select origin first"}
            />
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

      {level2Enabled && (
        <>
          <div>
            <Label htmlFor="caste">{level2Label}</Label>
            <Select
              value={formData.casteId}
              onValueChange={(value) => updateFormData("casteId", value)}
              disabled={!formData.ethnicityId}
            >
              <SelectTrigger className="mt-1">
                <SelectValue
                  placeholder={formData.ethnicityId ? `Select ${level2Label.toLowerCase()} (optional)` : `Select ${level1Label.toLowerCase()} first`}
                />
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
            <Label htmlFor="customCaste">Custom {level2Label} (if not in list)</Label>
            <Input
              id="customCaste"
              placeholder={`Enter ${level2Label.toLowerCase()} if not listed above`}
              value={formData.customCaste}
              onChange={(e) => updateFormData("customCaste", e.target.value)}
              className="mt-1"
              maxLength={50}
            />
          </div>
        </>
      )}
    </div>
  );
}
