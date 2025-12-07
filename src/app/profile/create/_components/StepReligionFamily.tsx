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

interface StepReligionFamilyProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number | boolean) => void;
  sects: LookupItem[];
  maslaks: LookupItem[];
}

export function StepReligionFamily({
  formData,
  updateFormData,
  sects,
  maslaks,
}: StepReligionFamilyProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="sect">Religious Sect *</Label>
        <Select
          value={formData.sectId}
          onValueChange={(value) => updateFormData("sectId", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select sect" />
          </SelectTrigger>
          <SelectContent>
            {sects.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="maslak">Maslak (Sub-sect)</Label>
        <Select
          value={formData.maslakId}
          onValueChange={(value) => updateFormData("maslakId", value)}
          disabled={!formData.sectId}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={formData.sectId ? "Select maslak (optional)" : "Select sect first"} />
          </SelectTrigger>
          <SelectContent>
            {maslaks.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="religiousBelonging">Religious Practice *</Label>
        <Select
          value={formData.religiousBelonging}
          onValueChange={(value) => updateFormData("religiousBelonging", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select religious practice level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STRICT">Strict</SelectItem>
            <SelectItem value="INCLINED">Inclined</SelectItem>
            <SelectItem value="MODERATE">Moderate</SelectItem>
            <SelectItem value="LIBERAL">Liberal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="socialStatus">Social Status *</Label>
        <Select
          value={formData.socialStatus}
          onValueChange={(value) => updateFormData("socialStatus", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select social status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ELITE_CLASS">Elite Class</SelectItem>
            <SelectItem value="ESTABLISHED_MIDDLE">Established Middle Class</SelectItem>
            <SelectItem value="TECHNICALLY_MIDDLE">Technically Middle Class</SelectItem>
            <SelectItem value="AFFLUENT_WORKING">Affluent Working Class</SelectItem>
            <SelectItem value="TRADITIONAL_WORKING">Traditional Working Class</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numberOfBrothers">Brothers</Label>
          <Input
            id="numberOfBrothers"
            type="number"
            min="0"
            max="20"
            value={formData.numberOfBrothers}
            onChange={(e) => updateFormData("numberOfBrothers", parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="marriedBrothers">Married Brothers</Label>
          <Input
            id="marriedBrothers"
            type="number"
            min="0"
            max="20"
            value={formData.marriedBrothers}
            onChange={(e) => updateFormData("marriedBrothers", parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numberOfSisters">Sisters</Label>
          <Input
            id="numberOfSisters"
            type="number"
            min="0"
            max="20"
            value={formData.numberOfSisters}
            onChange={(e) => updateFormData("numberOfSisters", parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="marriedSisters">Married Sisters</Label>
          <Input
            id="marriedSisters"
            type="number"
            min="0"
            max="20"
            value={formData.marriedSisters}
            onChange={(e) => updateFormData("marriedSisters", parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fatherOccupation">Father&apos;s Occupation</Label>
        <Input
          id="fatherOccupation"
          placeholder="e.g., Businessman, Government Officer"
          value={formData.fatherOccupation}
          onChange={(e) => updateFormData("fatherOccupation", e.target.value)}
          className="mt-1"
          maxLength={50}
        />
      </div>

      <div>
        <Label htmlFor="propertyOwnership">Property Ownership</Label>
        <Input
          id="propertyOwnership"
          placeholder="e.g., Own House, Rented"
          value={formData.propertyOwnership}
          onChange={(e) => updateFormData("propertyOwnership", e.target.value)}
          className="mt-1"
          maxLength={50}
        />
      </div>
    </div>
  );
}
