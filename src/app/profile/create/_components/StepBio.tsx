"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "./types";

interface StepBioProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
}

export function StepBio({ formData, updateFormData }: StepBioProps) {
  return (
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
  );
}
