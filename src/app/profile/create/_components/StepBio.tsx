"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormData } from "./types";

const MIN_BIO_LENGTH = 15;
const MAX_BIO_LENGTH = 300;

interface StepBioProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
}

export function StepBio({ formData, updateFormData }: StepBioProps) {
  const bioLength = formData.bio.length;
  const isMinMet = bioLength >= MIN_BIO_LENGTH;
  const isMaxExceeded = bioLength > MAX_BIO_LENGTH;

  const handleBioChange = (value: string) => {
    // Allow typing but enforce max limit
    if (value.length <= MAX_BIO_LENGTH) {
      updateFormData("bio", value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="bio">About Me / About the Person *</Label>
        <Textarea
          id="bio"
          placeholder="Write a brief description about yourself or the person this profile is for. Include personality traits, interests, and what you're looking for in a partner."
          value={formData.bio}
          onChange={(e) => handleBioChange(e.target.value)}
          className="mt-1"
          rows={6}
          maxLength={MAX_BIO_LENGTH}
        />
        <div className="flex justify-between items-center mt-1">
          <p className={`text-sm ${isMinMet ? "text-green-600" : "text-red-500"}`}>
            {isMinMet ? (
              <span>Minimum requirement met</span>
            ) : (
              <span>{MIN_BIO_LENGTH - bioLength} more characters needed</span>
            )}
          </p>
          <p className={`text-sm ${isMaxExceeded ? "text-red-500" : "text-muted-foreground"}`}>
            {bioLength}/{MAX_BIO_LENGTH}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-base font-semibold">Who can view this profile? *</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-3">
          Choose whether this profile should be visible only to people of the same origin or to all users globally.
        </p>
        <RadioGroup
          value={formData.originAudience}
          onValueChange={(value) => updateFormData("originAudience", value)}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="SAME_ORIGIN" id="same-origin" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="same-origin" className="font-medium cursor-pointer">
                Same origin only
              </Label>
              <p className="text-sm text-muted-foreground">
                Only users with the same origin (e.g., Pakistani) can view this profile.
                Best for those seeking matches within their own community.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="ALL_ORIGINS" id="all-origins" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="all-origins" className="font-medium cursor-pointer">
                All origins globally
              </Label>
              <p className="text-sm text-muted-foreground">
                Users from any origin can view this profile (Arabs, Indians, reverts,
                Western Muslims, etc.). Best for those open to diverse backgrounds.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

// Export constants for use in validation
export { MIN_BIO_LENGTH, MAX_BIO_LENGTH };
