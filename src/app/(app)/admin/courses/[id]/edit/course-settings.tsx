'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Settings, Save, Trash2, Loader2, ImageIcon, X } from 'lucide-react';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { type RouterOutputs } from '~/trpc/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { CourseScope, CourseType } from '@prisma/client';
import { useFileUpload } from '~/hooks/use-file-upload';
import { uploadImages } from '~/server/action';
import Image from 'next/image';

type Course = RouterOutputs['course']['getCourseForAdmin'];

interface CourseSettingsProps {
  course: Course;
}

export default function CourseSettings({ course }: CourseSettingsProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description ?? '',
    lecturers: course.lecturers ?? "",
    image: course.image,
    classCode: course.classCode,
    scope: course.scope,
    type: course.type,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const utils = api.useUtils();

  const [{ isDragging }, { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps }] = useFileUpload({
    multiple: false,
    maxFiles: 1,
    accept: "image/*",
    onFilesAdded: (files) => {
      void (async () => {
        setIsUploading(true);
        try {
          const file = files[0]?.file as File;
          if (!file) return;
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const uploadResults = await uploadImages(dataTransfer.files, "course", course.id);
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

  const updateCourseMutation = api.course.updateCourse.useMutation({
    onSuccess: async () => {
      toast.success('Course updated successfully');
      await utils.course.getCourseForAdmin.invalidate({ id: course.id });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const deleteCourseMutation = api.course.deleteCourse.useMutation({
    onSuccess: () => {
      toast.success('Course deleted successfully');
      router.push('/admin/courses');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    updateCourseMutation.mutate({
      id: course.id,
      ...formData,
    });
  };

  const handleDeleteCourse = () => {
    deleteCourseMutation.mutate({ id: course.id });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Course Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classCode">Class Code</Label>
              <Input
                id="classCode"
                value={formData.classCode}
                onChange={(e) => setFormData(prev => ({ ...prev, classCode: e.target.value }))}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Course description"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lecturers">Lecturers</Label>
              <Textarea
                id="lecturers"
                value={formData.lecturers}
                onChange={(e) => setFormData(prev => ({ ...prev, lecturers: e.target.value }))}
                placeholder="Abdul Hakim Masyhur, Yunendar Handoko, etc."
                disabled={isUpdating}
              />
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
                        SVG, PNG, or JPG
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(value) => setFormData(prev => ({
                ...prev,
                type: value as CourseType,
              }))} value={formData.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANDATORY">Mandatory</SelectItem>
                  <SelectItem value="OPTIONAL">Optional</SelectItem>
                  <SelectItem value="MACHINING">Machining</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select onValueChange={(value) => setFormData(prev => ({
                ...prev,
                scope: value as CourseScope,
              }))} value={formData.scope}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                  <SelectItem value="MACHINING">Machining</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isUpdating || isUploading}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deleting this course will permanently remove all associated data including:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All course documents and materials</li>
              <li>All tryouts and questions</li>
              <li>All student attempts and progress</li>
              <li>All announcements</li>
              <li>Member enrollments</li>
            </ul>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you absolutely sure you want to delete &quot;{course.title}&quot;?
                    This action cannot be undone and will permanently delete all course data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCourse}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
