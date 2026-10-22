"use client";

import { useState, useEffect } from "react";
import type { Editor, JSONContent } from "~/components/ui/shadcn-io/editor";
import {
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorClearFormatting,
  EditorFloatingMenu,
  EditorFormatBold,
  EditorFormatCode,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorFormatSubscript,
  EditorFormatSuperscript,
  EditorFormatUnderline,
  EditorLinkSelector,
  EditorNodeBulletList,
  EditorNodeCode,
  EditorNodeHeading1,
  EditorNodeHeading2,
  EditorNodeHeading3,
  EditorNodeOrderedList,
  EditorNodeQuote,
  EditorNodeTable,
  EditorNodeTaskList,
  EditorNodeText,
  EditorProvider,
  EditorSelector,
  EditorTableColumnAfter,
  EditorTableColumnBefore,
  EditorTableColumnDelete,
  EditorTableColumnMenu,
  EditorTableDelete,
  EditorTableFix,
  EditorTableGlobalMenu,
  EditorTableHeaderColumnToggle,
  EditorTableHeaderRowToggle,
  EditorTableMenu,
  EditorTableMergeCells,
  EditorTableRowAfter,
  EditorTableRowBefore,
  EditorTableRowDelete,
  EditorTableRowMenu,
  EditorTableSplitCell,
} from "~/components/ui/shadcn-io/editor";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnnouncementScope } from "~/types/enums";
import type { RouterOutputs } from "~/trpc/react";
import { X } from "lucide-react";
import Link from "next/link";
import ImageUploader from "~/components/image-uploader";
import { uploadImages } from "~/server/action";
import Image from "next/image";

type Course = RouterOutputs["course"]["getAllCourses"][number];
type Announcement = RouterOutputs["announcement"]["getById"];

interface AnnouncementFormProps {
  courses: Course[];
  announcement?: Announcement;
}

export function AnnouncementForm({ courses, announcement }: AnnouncementFormProps) {
  const router = useRouter();
  const isEditing = !!announcement;

  const [title, setTitle] = useState(announcement?.title ?? "");
  const [scope, setScope] = useState<AnnouncementScope>(
    announcement?.scope ?? AnnouncementScope.GLOBAL
  );
  const [courseId, setCourseId] = useState<string | undefined>(
    announcement?.courseId ?? undefined
  );
  const [images, setImages] = useState<string[]>(announcement?.images ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [content, setContent] = useState<JSONContent>(() => {
    if (announcement?.content) {
      try {
        return JSON.parse(announcement.content) as JSONContent;
      } catch {
        return { type: "doc", content: [{ type: "paragraph" }] };
      }
    }
    return { type: "doc", content: [{ type: "paragraph" }] };
  });

  const createMutation = api.announcement.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement created successfully");
      router.push("/admin/announcements");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create announcement");
    },
  });

  const updateMutation = api.announcement.update.useMutation({
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      router.push("/admin/announcements");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update announcement");
    },
  });

  useEffect(() => {
    if (scope === AnnouncementScope.GLOBAL) {
      setCourseId(undefined);
    }
  }, [scope]);

  const handleUpdate = ({ editor }: { editor: Editor }) => {
    const json = editor.getJSON();
    setContent(json);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Need announcement ID to upload images
    if (!announcement?.id) {
      toast.error("Please save the announcement first before uploading images");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImages = await uploadImages(
        files,
        'announcement',
        announcement.id
      );
      const imageUrls = uploadedImages.map((img) => img.CDNurl);
      setImages((prev) => [...prev, ...imageUrls]);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (scope === AnnouncementScope.COURSE && !courseId) {
      toast.error("Please select a course");
      return;
    }

    const data = {
      title,
      content: JSON.stringify(content),
      scope,
      courseId: scope === AnnouncementScope.COURSE ? courseId : undefined,
      images,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: announcement.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={scope}
                onValueChange={(value) => {
                  setScope(value as AnnouncementScope)
                  console.log(value)
                }}
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnnouncementScope.GLOBAL}>
                    Global (All Students)
                  </SelectItem>
                  <SelectItem value={AnnouncementScope.MACHINING}>
                    Machining Only
                  </SelectItem>
                  <SelectItem value={AnnouncementScope.COURSE}>
                    Specific Course
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scope === AnnouncementScope.COURSE && (
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={courseId ?? ""} onValueChange={setCourseId}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Images (Optional)</Label>
            <div className="flex flex-wrap gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative w-24 h-24 group">
                  <Image
                    src={imageUrl}
                    alt={`Announcement image ${index + 1}`}
                    fill
                    sizes='200'
                    className="object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <ImageUploader onUpload={handleImageUpload} isUploading={isUploading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <EditorProvider
              className="min-h-[400px] w-full overflow-y-auto rounded-lg border bg-background p-4"
              content={content}
              onUpdate={handleUpdate}
              placeholder="Start typing your announcement..."
            >
              <EditorFloatingMenu>
                <EditorNodeHeading1 hideName />
                <EditorNodeBulletList hideName />
                <EditorNodeQuote hideName />
                <EditorNodeCode hideName />
                <EditorNodeTable hideName />
              </EditorFloatingMenu>

              <EditorBubbleMenu>
                <EditorSelector title="Text">
                  <EditorNodeText />
                  <EditorNodeHeading1 />
                  <EditorNodeHeading2 />
                  <EditorNodeHeading3 />
                  <EditorNodeBulletList />
                  <EditorNodeOrderedList />
                  <EditorNodeTaskList />
                  <EditorNodeQuote />
                  <EditorNodeCode />
                </EditorSelector>

                <EditorSelector title="Format">
                  <EditorFormatBold />
                  <EditorFormatItalic />
                  <EditorFormatUnderline />
                  <EditorFormatStrike />
                  <EditorFormatCode />
                  <EditorFormatSuperscript />
                  <EditorFormatSubscript />
                </EditorSelector>

                <EditorLinkSelector />
                <EditorClearFormatting />
              </EditorBubbleMenu>

              <EditorTableMenu>
                <EditorTableColumnMenu>
                  <EditorTableColumnBefore />
                  <EditorTableColumnAfter />
                  <EditorTableColumnDelete />
                </EditorTableColumnMenu>

                <EditorTableRowMenu>
                  <EditorTableRowBefore />
                  <EditorTableRowAfter />
                  <EditorTableRowDelete />
                </EditorTableRowMenu>

                <EditorTableGlobalMenu>
                  <EditorTableHeaderColumnToggle />
                  <EditorTableHeaderRowToggle />
                  <EditorTableDelete />
                  <EditorTableMergeCells />
                  <EditorTableSplitCell />
                  <EditorTableFix />
                </EditorTableGlobalMenu>
              </EditorTableMenu>

              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <EditorCharacterCount.Words>Words: </EditorCharacterCount.Words>
                <span>Use the toolbar to format your content</span>
              </div>
            </EditorProvider>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href="/admin/announcements">
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button onClick={() => void handleSubmit()} disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Announcement"
                  : "Create Announcement"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
