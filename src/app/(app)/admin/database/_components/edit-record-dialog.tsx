// src/app/admin/database/_components/edit-record-dialog.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";

interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  displayName: string;
  recordId: string;
  initialData: Record<string, unknown>;
  onSuccess: () => void;
}

// Reuse the same MODEL_FIELDS from create dialog
const MODEL_FIELDS: Record<string, Record<string, { type: string; required?: boolean; options?: string[] }>> = {
  user: {
    email: { type: "email", required: true },
    name: { type: "text", required: true },
    nim: { type: "text", required: true },
    faculty: { type: "text" },
    program: { type: "text" },
    position: { type: "text" },
    role: { type: "select", options: ["ADMIN", "STUDENT", "SUPERADMIN", "MACHINING", "BP"], required: true },
  },
  course: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    classCode: { type: "text", required: true },
  },
  tryout: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    duration: { type: "number" },
    isActive: { type: "boolean" },
  },
  event: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    start: { type: "datetime-local", required: true },
    end: { type: "datetime-local", required: true },
    allDay: { type: "boolean" },
    location: { type: "text" },
    color: { type: "select", options: ["SKY", "AMBER", "VIOLET", "ROSE", "EMERALD", "ORANGE"] },
  },
  announcement: {
    title: { type: "text", required: true },
    content: { type: "textarea", required: true },
    scope: { type: "select", options: ["GLOBAL", "COURSE"], required: true },
  },
  scholarship: {
    title: { type: "text", required: true },
    description: { type: "textarea", required: true },
    provider: { type: "text", required: true },
    deadline: { type: "datetime-local", required: true },
    link: { type: "url", required: true },
  },
  document: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    filename: { type: "text", required: true },
    mimeType: { type: "text", required: true },
    size: { type: "number", required: true },
    type: { type: "select", options: ["EBOOK", "PRESENTATION", "DOCUMENT", "SPREADSHEET", "IMAGE", "VIDEO", "AUDIO", "EXAM", "MATERIAL"], required: true },
  },
  jobVacancy: {
    title: { type: "text", required: true },
    company: { type: "text", required: true },
    position: { type: "text", required: true },
    eligibility: { type: "text", required: true },
    streams: { type: "array" },
    overview: { type: "textarea", required: true },
    timeline: { type: "textarea", required: true },
    applyLink: { type: "url", required: true },
    isActive: { type: "boolean" },
  },
};

export function EditRecordDialog({
  open,
  onOpenChange,
  modelName,
  displayName,
  recordId,
  initialData,
  onSuccess,
}: EditRecordDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMutation = api.database.updateRecord.useMutation({
    onSuccess: () => {
      toast.success(`Successfully updated ${displayName}`);
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update ${displayName}: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const fields = useMemo(() => {
    return MODEL_FIELDS[modelName] ?? {};
  }, [modelName]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && initialData) {
      const processedData: Record<string, unknown> = {};

      Object.entries(fields).forEach(([key, config]) => {
        const value = initialData[key];

        if (config.type === "datetime-local" && value) {
          // Convert ISO string to datetime-local format
          const date = new Date(value as string);
          processedData[key] = date.toISOString().slice(0, 16);
        } else if (config.type === "array" && Array.isArray(value)) {
          processedData[key] = value.join(", ");
        } else {
          processedData[key] = value;
        }
      });

      setFormData(processedData);
    }
  }, [open, initialData, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Process form data
    const processedData: Record<string, unknown> = {};

    Object.entries(formData).forEach(([key, value]) => {
      const fieldConfig = fields[key];
      if (!fieldConfig) return;

      // Skip if value hasn't changed
      if (value === initialData[key]) return;

      if (fieldConfig.type === "number" && typeof value === "string") {
        processedData[key] = value ? parseInt(value, 10) : null;
      } else if (fieldConfig.type === "boolean") {
        processedData[key] = Boolean(value);
      } else if (fieldConfig.type === "array" && typeof value === "string") {
        processedData[key] = value.split(",").map(s => s.trim()).filter(Boolean);
      } else if (fieldConfig.type === "datetime-local" && typeof value === "string") {
        processedData[key] = value ? new Date(value).toISOString() : null;
      } else {
        processedData[key] = value ?? null;
      }
    });

    // Only update if there are changes
    if (Object.keys(processedData).length === 0) {
      toast.info("No changes detected");
      setIsSubmitting(false);
      return;
    }

    await updateMutation.mutateAsync({
      model: modelName as never,
      id: recordId,
      // @ts-expect-error i dont know cuz its comlicated
      data: processedData,
    });
  };

  const updateFormData = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string, config: { type: string; required?: boolean; options?: string[] }) => {
    const value = formData[key];

    switch (config.type) {
      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
            rows={3}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(newValue) => updateFormData(key, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) => updateFormData(key, checked)}
            />
            <Label className="text-sm font-normal">
              {key === "isActive" ? "Active" : key === "allDay" ? "All Day" : "Yes"}
            </Label>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "datetime-local":
        return (
          <Input
            type="datetime-local"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
          />
        );

      case "email":
        return (
          <Input
            type="email"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "url":
        return (
          <Input
            type="url"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "array":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder="Enter comma-separated values"
          />
        );

      default:
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit {displayName}</span>
            </DialogTitle>
            <DialogDescription>
              Update the details for this {displayName.toLowerCase()} record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 sm:max-h-[60vh] max-h-[70vh] overflow-y-auto">
            {Object.entries(fields).map(([key, config]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium">
                  {key}
                  {config.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(key, config)}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update {displayName}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
