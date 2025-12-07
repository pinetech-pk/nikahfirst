"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData } from "./types";

interface StepBasicInfoProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
}

export function StepBasicInfo({ formData, updateFormData }: StepBasicInfoProps) {
  const showChildrenFields = formData.maritalStatus !== "NEVER_MARRIED";

  return (
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
  );
}
