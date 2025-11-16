"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const TOTAL_STEPS = 3;

export default function CreateProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profileFor: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    bio: "",
    city: "",
    country: "Pakistan",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // You can replace with toast
        router.push("/dashboard");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
          <CardDescription>
            Complete your profile to start connecting with matches
          </CardDescription>
          <Progress value={(step / TOTAL_STEPS) * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          {/* Step 1: Profile For */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Who is this profile for?</Label>
                <RadioGroup
                  value={formData.profileFor}
                  onValueChange={(value) => updateFormData("profileFor", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SELF" id="self" />
                    <Label htmlFor="self">Myself</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SON" id="son" />
                    <Label htmlFor="son">My Son</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DAUGHTER" id="daughter" />
                    <Label htmlFor="daughter">My Daughter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BROTHER" id="brother" />
                    <Label htmlFor="brother">My Brother</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SISTER" id="sister" />
                    <Label htmlFor="sister">My Sister</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RELATIVE" id="relative" />
                    <Label htmlFor="relative">Relative</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-end">
                <Button onClick={nextStep} disabled={!formData.profileFor}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => updateFormData("gender", value)}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    updateFormData("dateOfBirth", e.target.value)
                  }
                  required
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={
                    !formData.firstName ||
                    !formData.gender ||
                    !formData.dateOfBirth
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">About</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself/the person..."
                  value={formData.bio}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Karachi, Lahore, Islamabad"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateFormData("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pakistan">Pakistan</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Complete Profile"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
