"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

import { api, type RouterOutputs } from '~/trpc/react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '~/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Skeleton } from '~/components/ui/skeleton';

import {
  Plus, Search, MoreHorizontal, Eye, Edit, Copy, Trash2,
  BarChart3, Users, Calendar, Grid3X3, List, TrendingUp, FileText, Share,
} from 'lucide-react';
import { Switch } from '~/components/ui/switch';

// --- Type Definitions ---
type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'published' | 'draft' | 'archived';
// Infer the type for a single form item from the tRPC router output
type FormListItemType = RouterOutputs['form']['getForms']['forms'][number];


// --- Main Page Component ---
export default function FormsPage() {
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [filter, setFilter] = React.useState<FilterType>('all');

  // API calls
  const {
    data: formsData,
    isLoading,
    fetchNextPage,
    hasNextPage
  } = api.form.getForms.useInfiniteQuery(
    { limit: 12 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const utils = api.useContext();

  const deleteFormMutation = api.form.delete.useMutation({
    onSuccess: () => {
      toast.success('Form deleted successfully');
      void utils.form.getForms.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateFormMutation = api.form.duplicate.useMutation({
    onSuccess: async (newForm) => {
      toast.success(`Form "${newForm.title}" duplicated successfully`);
      await utils.form.getForms.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const forms = React.useMemo(() => {
    return formsData?.pages.flatMap(page => page.forms) ?? [];
  }, [formsData]);

  const filteredForms = React.useMemo(() => {
    let filtered = forms;

    if (filter !== 'all') {
      filtered = filtered.filter(form => {
        switch (filter) {
          case 'published': return form.isPublished && form.isActive;
          case 'draft': return !form.isPublished;
          case 'archived': return !form.isActive;
          default: return true;
        }
      });
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(form =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [forms, filter, searchQuery]);

  const stats = React.useMemo(() => ({
    total: forms.length,
    published: forms.filter(f => f.isPublished && f.isActive).length,
    draft: forms.filter(f => !f.isPublished).length,
    responses: forms.reduce((sum, f) => sum + (f._count?.submissions ?? 0), 0),
  }), [forms]);

  const handleDeleteForm = (formId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteFormMutation.mutate({ id: formId });
    }
  };

  const handleShareForm = (formId: string) => {
    const shareUrl = `${window.location.origin}/forms/${formId}`;
    void navigator.clipboard.writeText(shareUrl);
    toast.success('Form link copied to clipboard');
  };

  const handleDuplicateForm = (formId: string) => {
    duplicateFormMutation.mutate({ formId });
  };


  return (
    <div className="container mx-auto max-w-5xl">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">Create and manage your forms and surveys.</p>
        </div>
        <Button asChild>
          <Link href='/admin/forms/create'>
            <Plus className="w-4 h-4 mr-2" /> Create Form
          </Link>
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={FileText} title="Total Forms" value={stats.total} color="text-primary" />
        <StatCard icon={TrendingUp} title="Published" value={stats.published} color="text-green-500" />
        <StatCard icon={Edit} title="Drafts" value={stats.draft} color="text-amber-500" />
        <StatCard icon={Users} title="Total Responses" value={stats.responses} color="text-violet-500" />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search forms by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex border rounded-md">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="rounded-r-none"><Grid3X3 className="w-4 h-4" /></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="rounded-l-none"><List className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading && <LoadingState viewMode={viewMode} />}
      {!isLoading && (
        <>
          {filteredForms.length === 0 ? (
            <EmptyState hasSearch={!!searchQuery} />
          ) : (
            <motion.div
              layout
              className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }
            >
              {filteredForms.map((form) => {
                const formActions = {
                  onEdit: () => router.push(`/admin/forms/edit/${form.id}`),
                  onPreview: () => router.push(`/admin/forms/preview/${form.id}`),
                  onShare: () => handleShareForm(form.id),
                  onDuplicate: () => handleDuplicateForm(form.id),
                  onDelete: () => handleDeleteForm(form.id, form.title),
                  onViewResponses: () => router.push(`/admin/forms/responses/${form.id}`),
                };
                return (
                  <motion.div key={form.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {viewMode === 'grid'
                      ? <FormCard form={form} {...formActions} />
                      : <FormListItem form={form} {...formActions} />
                    }
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {hasNextPage && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isLoading}>
                Load More Forms
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Child Components ---

const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: number, color?: string }) => (
  <Card>
    <CardContent className="p-6 flex items-center gap-4">
      <div className={`p-3 rounded-full bg-muted ${color ?? 'text-primary'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const LoadingState = ({ viewMode }: { viewMode: ViewMode }) => (
  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /></CardContent></Card>
    ))}
  </div>
);

const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
  <Card>
    <CardContent className="text-center py-12">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasSearch ? 'No forms found' : 'No forms yet'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {hasSearch ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first form.'}
      </p>
      {!hasSearch && (
        <Button asChild><Link href='/admin/forms/create'><Plus className="w-4 h-4 mr-2" /> Create Your First Form</Link></Button>
      )}
    </CardContent>
  </Card>
);

interface FormComponentProps {
  form: FormListItemType;
  onEdit: () => void;
  onPreview: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onViewResponses: () => void;
}

const FormCard: React.FC<FormComponentProps> = ({ form, onEdit, ...actions }) => {
  const utils = api.useUtils();
  const updatePublish = api.form.updatePublish.useMutation({
    onSuccess: async () => {
      await utils.form.getForms.invalidate();
    },
  });

  const handlePublishToggle = (checked: boolean) => {
    updatePublish.mutate({
      formId: form.id,
      isPublished: checked,
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="cursor-pointer" onClick={onEdit}>
        <div className="flex items-start justify-between w-full overflow-hidden">
          <CardTitle className="text-lg font-semibold truncate max-w-3xs">
            {form.title}
          </CardTitle>
          <FormDropdownMenu actions={{ onEdit, ...actions }} />
        </div>
        <p className="text-sm text-muted-foreground pt-1 line-clamp-2">
          {form.description ?? "No description"}
        </p>
      </CardHeader>
      <CardContent className="cursor-pointer" onClick={onEdit}>
        <div className="flex items-center justify-end mb-4">
          {/* Publish Toggle */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()} // prevent triggering edit when toggling
          >
            <div className="flex items-center gap-2">
              <Badge
                variant={"outline"}
              >
                {form.type.charAt(0) + form.type.slice(1).toLowerCase()}
              </Badge>
              <Badge
                variant={form.isPublished ? "default" : "secondary"}
              >
                {form.isPublished ? "Published" : "Draft"}
              </Badge>
              {!form.isActive && <Badge variant="destructive">Archived</Badge>}
            </div>
            <Switch
              checked={form.isPublished}
              disabled={updatePublish.isPending}
              onCheckedChange={handlePublishToggle}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {form._count?.submissions ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />{" "}
            {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const FormListItem: React.FC<FormComponentProps> = ({ form, onEdit, ...actions }) => {
  const utils = api.useUtils();
  const updatePublish = api.form.updatePublish.useMutation({
    onSuccess: async () => {
      await utils.form.getForms.invalidate();
    },
  });

  const handlePublishToggle = (checked: boolean) => {
    updatePublish.mutate({
      formId: form.id,
      isPublished: checked,
    });
  };

  return (
    <Card className="group hover:bg-muted/50 transition-colors">
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex-1 min-w-0 cursor-pointer flex items-center gap-4" onClick={onEdit}>
          <FileText className="w-6 h-6 text-muted-foreground shrink-0" />
          <div className="flex-1 w-full overflow-hidden">
            <h3 className="font-semibold truncate">{form.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{form.description ?? 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4">
          <Badge variant={"outline"}>
            {form.type.charAt(0) + form.type.slice(1).toLowerCase()}
          </Badge>
          <Badge variant={form.isPublished ? 'default' : 'secondary'} className="hidden md:flex">{form.isPublished ? 'Published' : 'Draft'}</Badge>
          <Switch
            checked={form.isPublished}
            disabled={updatePublish.isPending}
            onCheckedChange={handlePublishToggle}
          />
          <span className="hidden lg:flex items-center gap-1.5"><Users className="w-4 h-4" />{form._count?.submissions ?? 0}</span>
          <span className="hidden md:flex">{formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}</span>
          <FormDropdownMenu actions={{ onEdit, ...actions }} />
        </div>
      </CardContent>
    </Card>
  );
};

const FormDropdownMenu: React.FC<{ actions: Omit<FormComponentProps, 'form'> }> = ({ actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actions.onEdit(); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actions.onDuplicate(); }}>
        <Copy className="w-4 h-4 mr-2" /> Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actions.onPreview(); }}><Eye className="w-4 h-4 mr-2" /> Preview</DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actions.onShare(); }}><Share className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actions.onViewResponses(); }}><BarChart3 className="w-4 h-4 mr-2" /> View Responses</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actions.onDelete(); }} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
