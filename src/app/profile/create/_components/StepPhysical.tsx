"use client";

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

interface StepPhysicalProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
  heights: LookupItem[];
}

export function StepPhysical({
  formData,
  updateFormData,
  heights,
}: StepPhysicalProps) {
  return (
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
  );
}
