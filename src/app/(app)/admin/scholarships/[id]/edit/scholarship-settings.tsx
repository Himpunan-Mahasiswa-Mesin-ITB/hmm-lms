"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { toast } from "sonner";
import { Loader2, Save, Trash2, Upload, X, ImageIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ScholarshipType } from "~/types/enums";
import { useFileUpload } from "~/hooks/use-file-upload";
import { uploadImages } from "~/server/action";
import Image from "next/image";

interface ScholarshipSettingsProps {
  scholarship: {
    id: string;
    title: string;
    description: string;
    provider: string;
    deadline: Date;
    link: string;
    type: ScholarshipType;
    image: string | null;
    benefits: string[];
    requirements: string[];
    quota: number | null;
  };
}

export default function ScholarshipSettings({ scholarship }: ScholarshipSettingsProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: scholarship.title,
    description: scholarship.description,
    provider: scholarship.provider,
    deadline: scholarship.deadline ? format(new Date(scholarship.deadline), "yyyy-MM-dd") : "",
    link: scholarship.link,
    type: scholarship.type,
    image: scholarship.image,
    benefits: scholarship.benefits.length > 0 ? scholarship.benefits : ["", "", ""],
    requirements: scholarship.requirements.length > 0 ? scholarship.requirements : ["", "", ""],
    quota: scholarship.quota?.toString() ?? "",
  });

  const updateMutation = api.scholarship.update.useMutation({
    onSuccess: () => {
      toast.success("Scholarship updated successfully");
      void utils.scholarship.getById.invalidate({ id: scholarship.id });
      void utils.scholarship.getAll.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const deleteMutation = api.scholarship.delete.useMutation({
    onSuccess: () => {
      toast.success("Scholarship deleted successfully");
      router.push("/admin/scholarships");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [{ isDragging }, { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps }] = useFileUpload({
    multiple: false,
    maxFiles: 1,
    accept: "image/*",
    onFilesAdded: (files) => {
      // Mark the promise as explicitly ignored with 'void'
      void (async () => {
        setIsUploading(true);
        try {
          const file = files[0]?.file as File;
          if (!file) return;
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const uploadResults = await uploadImages(dataTransfer.files, "scholarship", scholarship.id);
          const uploadedFile = uploadResults[0];

          if (uploadedFile) {
            setFormData(prev => ({ ...prev, image: uploadedFile.CDNurl || uploadedFile.key }));
            toast.success("Image uploaded successfully");
          }
        } catch (error) {
          toast.error("Failed to upload image");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      })();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateMutation.mutate({
      id: scholarship.id,
      title: formData.title,
      description: formData.description,
      provider: formData.provider,
      deadline: new Date(formData.deadline),
      link: formData.link,
      type: formData.type,
      image: formData.image ?? undefined,
      benefits: formData.benefits.filter(line => line.trim() !== ""),
      requirements: formData.requirements.filter(line => line.trim() !== ""),
      quota: formData.quota ? parseInt(formData.quota) : null,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this scholarship?")) {
      deleteMutation.mutate({ id: scholarship.id });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scholarship Details</CardTitle>
          <CardDescription>
            Basic information about the scholarship.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ScholarshipType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNAL">Internal</SelectItem>
                    <SelectItem value="EXTERNAL">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota">Quota (Optional)</Label>
                <Input
                  id="quota"
                  type="number"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Benefits</Label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...formData.benefits];
                          newBenefits[index] = e.target.value;
                          setFormData({ ...formData, benefits: newBenefits });
                        }}
                        placeholder={`Benefit ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newBenefits = formData.benefits.filter((_, i) => i !== index);
                          setFormData({ ...formData, benefits: newBenefits });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ""] })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Benefit
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={requirement}
                        onChange={(e) => {
                          const newRequirements = [...formData.requirements];
                          newRequirements[index] = e.target.value;
                          setFormData({ ...formData, requirements: newRequirements });
                        }}
                        placeholder={`Requirement ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newRequirements = formData.requirements.filter((_, i) => i !== index);
                          setFormData({ ...formData, requirements: newRequirements });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setFormData({ ...formData, requirements: [...formData.requirements, ""] })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Requirement
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <input {...getInputProps()} className="sr-only" />
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"}
                `}
              >
                {formData.image ? (
                  <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg">
                    <Image
                      src={formData.image}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, image: null });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="p-4 bg-muted rounded-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SVG, PNG, JPG or GIF (max. 800x400px)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
