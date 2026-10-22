// ~/app/admin/courses/[id]/documents-management.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
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
import {
  FileText,
  Search,
  Trash2,
  Download,
  Calendar,
  User,
  HardDrive,
  Link as LinkIcon,
  ExternalLink,
  Eye, // Added Eye icon for the view button
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { type RouterOutputs } from '~/trpc/react';
import { ResourceType } from '~/types/enums';
import DocumentViewer from '~/components/document-viewer'; // Import the new viewer

type Course = RouterOutputs['course']['getCourseForAdmin'];
type Resource = NonNullable<RouterOutputs['course']['getCourseForAdmin']>['resources'][number];

interface DocumentsManagementProps {
  course: Course;
}

const getResourceCategoryColor = (category: string | null) => {
  const colors = {
    E_BOOK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    PRESENTATION: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    NOTES: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PROBLEMS: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    VIDEO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    SYLLABUS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };
  return colors[category as keyof typeof colors] || colors.OTHER;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DocumentsManagement({ course }: DocumentsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openViewer, setOpenViewer] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const utils = api.useUtils();

  const deleteResourceMutation = api.course.deleteResource.useMutation({
    onSuccess: async () => {
      toast.success('Resource deleted successfully');
      await utils.course.getCourseForAdmin.invalidate({ id: course.id });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredResources = course.resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ??
    (resource.type === ResourceType.FILE && resource.attachment?.filename.toLowerCase().includes(searchTerm.toLowerCase())) ??
    (resource.type === ResourceType.LINK && resource.link?.url.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleDeleteResource = (resourceId: string) => {
    deleteResourceMutation.mutate({ resourceId });
  };

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setOpenViewer(true);
  };

  const totalFileSize = course.resources
    .filter((res) => res.type === ResourceType.FILE)
    .reduce((sum, res) => sum + (res.attachment?.size ?? 0), 0);

  const totalFiles = course.resources.filter((res) => res.type === ResourceType.FILE).length;
  const totalLinks = course.resources.filter((res) => res.type === ResourceType.LINK).length;

  return (
    <div className="space-y-6">
      {selectedResource && (
        <DocumentViewer
          resource={selectedResource}
          open={openViewer}
          onOpenChange={setOpenViewer}
        />
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{course.resources.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{totalFiles}</p>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold">{totalLinks}</p>
              </div>
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Files Size</p>
                <p className="text-2xl font-bold">{formatFileSize(totalFileSize)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resources Management
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredResources.length} of {course.resources.length} resources
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {resource.type === ResourceType.FILE ? (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {resource.type === ResourceType.FILE ? resource.attachment?.filename : resource.link?.url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {resource.category && (
                        <Badge className={getResourceCategoryColor(resource.category)}>
                          {resource.category.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {resource.uploadedBy.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(resource.createdAt, 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {/* New View Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResource(resource)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Download button for files only */}
                        {resource.type === ResourceType.FILE && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/api/documents/${resource.id}?action=download`} target="_blank">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {/* Link button for links only */}
                        {resource.type === ResourceType.LINK && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.link?.url} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{resource.title}&quot;?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteResource(resource.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Resource
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredResources.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No resources found matching your search' : 'No resources uploaded yet'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
