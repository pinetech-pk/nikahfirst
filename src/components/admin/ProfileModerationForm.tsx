"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ProfileModerationForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | "">("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/profiles/${profileId}/moderate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            feedback,
          }),
        }
      );

      if (response.ok) {
        alert(`Profile ${action}d successfully!`);
        router.push("/admin/profiles/pending");
        router.refresh();
      } else {
        alert("Failed to moderate profile");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Action</Label>
        <RadioGroup
          value={action}
          onValueChange={(value: any) => setAction(value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approve" id="approve" />
            <Label htmlFor="approve">Approve Profile</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="reject" />
            <Label htmlFor="reject">Reject Profile</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="feedback">
          Feedback{" "}
          {action === "reject" ? "(Required for rejection)" : "(Optional)"}
        </Label>
        <Textarea
          id="feedback"
          placeholder={
            action === "reject"
              ? "Please provide reason for rejection..."
              : "Any feedback for the user..."
          }
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          required={action === "reject"}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!action || loading || (action === "reject" && !feedback)}
          variant={action === "reject" ? "destructive" : "default"}
        >
          {loading
            ? "Processing..."
            : action === "approve"
            ? "Approve Profile"
            : "Reject Profile"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
