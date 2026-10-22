// ~/app/admin/courses/[id]/upload-document.tsx
'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Upload, Loader2, LinkIcon, FileIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import {
  AttachableType,
  LinkSource,
  ResourceCategory,
  ResourceType,
} from '~/types/enums';
import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon as UploadCloud,
  VideoIcon,
} from 'lucide-react';
import { formatBytes, useFileUpload } from '~/hooks/use-file-upload';
import { Card } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { uploadImages } from '~/server/action'; // Import the uploadImages action

// Helper function to get the appropriate icon for a file
const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;
  if (
    fileType.includes('pdf') ||
    fileName.endsWith('.pdf') ||
    fileType.includes('word') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return <FileTextIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes('zip') ||
    fileType.includes('archive') ||
    fileName.endsWith('.zip') ||
    fileName.endsWith('.rar')
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  } else if (fileType.includes('video/')) {
    return <VideoIcon className="size-4 opacity-60" />;
  } else if (fileType.includes('audio/')) {
    return <HeadphonesIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith('image/')) {
    return <ImageIcon className="size-4 opacity-60" />;
  }
  return <FileIcon className="size-4 opacity-60" />;
};

// Map Prisma enums to a user-friendly format
const ResourceCategories = Object.values(ResourceCategory).map((value) => ({
  value,
  label: value.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
}));

const LinkSources = Object.values(LinkSource).map((value) => ({
  value,
  label: value.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
}));

interface UploadDocumentProps {
  courseId: string;
}

// Define types for files and links with their editable data
interface EditableFile {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  title: string;
  category: ResourceCategory;
  description?: string;
}

interface UploadedLink {
  id: string;
  title: string;
  url: string;
  source: LinkSource;
  category: ResourceCategory;
  description?: string;
}

export default function UploadDocument({ courseId }: UploadDocumentProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType>(ResourceType.FILE);
  const [filesToUpload, setFilesToUpload] = useState<EditableFile[]>([]);
  const [linksToUpload, setLinksToUpload] = useState<UploadedLink[]>([]);
  const [commonDescription, setCommonDescription] = useState('');
  const router = useRouter();

  const utils = api.useUtils();
  const createResource = api.course.createResource.useMutation({
    onSuccess: async () => {
      toast.success('Resources uploaded successfully');
      setOpen(false);
      setFilesToUpload([]);
      setLinksToUpload([]);
      setCommonDescription('');
      router.refresh();
      await utils.course.getCourseForAdmin.invalidate({ id: courseId });
      await utils.course.getCourseAnalytics.invalidate({ id: courseId });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create resources');
    },
  });

  const maxSize = 50 * 1024 * 1024;
  const maxFiles = 10;

  const [{ isDragging, errors }, { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, clearFiles, getInputProps, removeFile }] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    onFilesAdded: (addedFiles) => {
      setFilesToUpload(prev => [
        ...prev,
        ...addedFiles.map(f => ({
          id: f.id,
          file: f.file as File,
          fileName: f.file.name,
          fileSize: f.file.size,
          fileType: f.file.type,
          title: f.file.name.split('.')[0] ?? '',
          category: ResourceCategory.OTHER,
        }))
      ]);
    },
  });

  const removeFileFromList = (idToRemove: string) => {
    setFilesToUpload(prev => prev.filter(file => file.id !== idToRemove));
    removeFile(idToRemove);
  };

  const addLink = () => {
    setLinksToUpload(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: '',
        url: '',
        source: LinkSource.GOOGLE_DRIVE,
        category: ResourceCategory.OTHER,
      }
    ]);
  };

  const removeLink = (idToRemove: string) => {
    setLinksToUpload(prev => prev.filter(link => link.id !== idToRemove));
  };

  const handleFileChange = (id: string, field: 'title' | 'category' | 'description', value: string) => {
    setFilesToUpload(prev =>
      prev.map(file =>
        file.id === id ? { ...file, [field]: value } : file
      )
    );
  };

  const handleLinkChange = (id: string, field: 'title' | 'url' | 'source' | 'category' | 'description', value: string) => {
    setLinksToUpload(prev =>
      prev.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const handleFileSubmit = async () => {
    if (filesToUpload.length === 0) {
      toast.error('Please select at least one file.');
      return;
    }

    const allFilesValid = filesToUpload.every(f => f.title && f.category);
    if (!allFilesValid) {
      toast.error('Please provide a title and category for all files.');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (fileObj) => {
        // Create a FileList-like object from single file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fileObj.file);
        const fileList = dataTransfer.files;

        // Upload using the uploadImages action with proper entity type and ID
        const uploadResults = await uploadImages(
          fileList,
          'course',
          courseId
        );

        const uploadedFile = uploadResults[0];
        if (!uploadedFile) {
          throw new Error(`File upload failed for ${fileObj.fileName}.`);
        }

        // Create resource with the uploaded file info
        await createResource.mutateAsync({
          type: ResourceType.FILE,
          title: fileObj.title,
          description: fileObj.description ?? commonDescription,
          attachableId: courseId,
          attachableType: AttachableType.COURSE,
          category: fileObj.category,
          file: {
            key: uploadedFile.key,
            name: fileObj.fileName,
            type: fileObj.fileType,
            size: fileObj.fileSize,
          },
        });
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      clearFiles();
    }
  };

  const handleLinkSubmit = async () => {
    if (linksToUpload.length === 0) {
      toast.error('Please add at least one link.');
      return;
    }

    const allLinksValid = linksToUpload.every(l => l.title && l.url && l.source && l.category);
    if (!allLinksValid) {
      toast.error('Please provide a title, URL, source, and category for all links.');
      return;
    }

    setUploading(true);
    try {
      const linkPromises = linksToUpload.map(async (linkData) => {
        await createResource.mutateAsync({
          type: ResourceType.LINK,
          title: linkData.title,
          description: linkData.description ?? commonDescription,
          attachableId: courseId,
          attachableType: AttachableType.COURSE,
          category: linkData.category,
          link: {
            url: linkData.url,
            source: linkData.source,
          },
        });
      });
      await Promise.all(linkPromises);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Link creation failed');
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = () => {
    if (selectedType === ResourceType.FILE) {
      return filesToUpload.length > 0 && filesToUpload.every(f => f.title && f.category);
    }
    if (selectedType === ResourceType.LINK) {
      return linksToUpload.length > 0 && linksToUpload.every(l => l.title && l.url && l.source && l.category);
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>
            Upload a new file or link to this course.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as ResourceType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={ResourceType.FILE}>
                <FileIcon className="h-4 w-4 mr-2" />
                File
              </TabsTrigger>
              <TabsTrigger value={ResourceType.LINK}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Link
              </TabsTrigger>
            </TabsList>
            <TabsContent value={ResourceType.FILE} className="mt-4">
              <div className="space-y-4">
                <Card
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  data-dragging={isDragging || undefined}
                  className="border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors hover:bg-muted/50"
                >
                  <input {...getInputProps()} className="sr-only" aria-label="Upload files" disabled={uploading} />
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Drag and drop files here</p>
                  <p className="text-xs text-muted-foreground">or</p>
                  <Button variant="outline" className="mt-2" onClick={openFileDialog} disabled={uploading}>
                    Select files
                  </Button>
                </Card>
                {errors.length > 0 && (
                  <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{errors[0]}</span>
                  </div>
                )}
                {filesToUpload.length > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium">Files ({filesToUpload.length})</h3>
                      <Button variant="ghost" size="sm" onClick={() => { setFilesToUpload([]); clearFiles(); }} disabled={uploading}>
                        <Trash2Icon className="mr-2 size-4" />
                        Remove All
                      </Button>
                    </div>
                    {filesToUpload.map((file) => (
                      <Card key={file.id} className="p-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 text-muted-foreground hover:text-foreground"
                          onClick={() => removeFileFromList(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="flex items-start gap-4">
                          <div className="bg-muted p-2 rounded-md">
                            {getFileIcon({ file: file.file })}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`title-${file.id}`} className="sr-only">Title</Label>
                              <Input
                                id={`title-${file.id}`}
                                value={file.title}
                                onChange={(e) => handleFileChange(file.id, 'title', e.target.value)}
                                placeholder="File title"
                                required
                                disabled={uploading}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`category-${file.id}`} className="sr-only">Category</Label>
                              <Select
                                value={file.category}
                                onValueChange={(value) => handleFileChange(file.id, 'category', value)}
                                disabled={uploading}
                              >
                                <SelectTrigger id={`category-${file.id}`}>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ResourceCategories.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-sm text-muted-foreground">{formatBytes(file.fileSize)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value={ResourceType.LINK} className="mt-4">
              <div className="space-y-4">
                <Button variant="outline" onClick={addLink} className="w-full" disabled={uploading}>
                  <LinkIcon className="h-4 w-4 mr-2" /> Add Link
                </Button>
                {linksToUpload.map((link) => (
                  <Card key={link.id} className="p-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 text-muted-foreground hover:text-foreground"
                      onClick={() => removeLink(link.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor={`title-${link.id}`} className="sr-only">Title</Label>
                      <Input
                        id={`title-${link.id}`}
                        value={link.title}
                        onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                        placeholder="Link title"
                        required
                        disabled={uploading}
                      />
                      <Label htmlFor={`url-${link.id}`} className="sr-only">URL</Label>
                      <Input
                        id={`url-${link.id}`}
                        value={link.url}
                        onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                        placeholder="URL"
                        required
                        disabled={uploading}
                      />
                      <Label htmlFor={`source-${link.id}`} className="sr-only">Source</Label>
                      <Select
                        value={link.source}
                        onValueChange={(value) => handleLinkChange(link.id, 'source', value)}
                        disabled={uploading}
                      >
                        <SelectTrigger id={`source-${link.id}`}>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {LinkSources.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Label htmlFor={`category-${link.id}`} className="sr-only">Category</Label>
                      <Select
                        value={link.category}
                        onValueChange={(value) => handleLinkChange(link.id, 'category', value)}
                        disabled={uploading}
                      >
                        <SelectTrigger id={`category-${link.id}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ResourceCategories.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <Label htmlFor="description">Common Description (Optional)</Label>
            <Textarea
              id="description"
              value={commonDescription}
              onChange={(e) => setCommonDescription(e.target.value)}
              placeholder="A description for all uploaded resources"
              disabled={uploading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={selectedType === ResourceType.FILE ? handleFileSubmit : handleLinkSubmit}
            disabled={uploading || !isFormValid()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
