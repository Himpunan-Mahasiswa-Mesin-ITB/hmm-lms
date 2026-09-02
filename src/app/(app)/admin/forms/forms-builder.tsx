'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createId } from '@paralleldrive/cuid2';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import {
  Plus,
  Save,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Switch } from '~/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { TIMEZONE } from '~/constants/constants';
import { type FormBuilderSchema, formBuilderSchema } from '~/lib/types/forms';
import { api } from '~/trpc/react';

import { FormManagers } from './form-managers';
import { QuestionBuilderItem } from './question-builder';

interface FormsBuilderProps {
  mode: 'create' | 'edit';
  initialData?: FormBuilderSchema & { id: string };
}

// helper: format Date to 'YYYY-MM-DDTHH:mm' for datetime-local
function toDateTimeLocalValue(date?: Date | null) {
  if (!date) return '';
  // Convert UTC date to target timezone
  const zonedDate = toZonedTime(date, TIMEZONE);

  const year = zonedDate.getFullYear();
  const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
  const day = String(zonedDate.getDate()).padStart(2, '0');
  const hours = String(zonedDate.getHours()).padStart(2, '0');
  const minutes = String(zonedDate.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// helper: parse input value from datetime-local back to Date
function fromDateTimeLocalValue(value: string): Date {
  if (!value) return new Date();
  // value is "YYYY-MM-DDTHH:mm"
  // Interpret this string as being in the target timezone, then convert to UTC
  return fromZonedTime(value, TIMEZONE);
}

export function FormsBuilder({ mode, initialData }: FormsBuilderProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const utils = api.useUtils();

  function handleUserSelection(userId: string) {
    const newSet = new Set(selectedUserIds);

    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  }

  const form = useForm<FormBuilderSchema>({
    resolver: zodResolver(formBuilderSchema) as Resolver<FormBuilderSchema>,
    defaultValues: initialData
      ? {
          ...initialData,
          start: initialData.start ? new Date(initialData.start) : (undefined as unknown as Date),
          end: initialData.end ? new Date(initialData.end) : (undefined as unknown as Date),
        }
      : {
          id: createId(),
          title: '',
          description: '',
          type: 'NORMAL',
          isPublished: false,
          isActive: true,
          allowMultipleSubmissions: false,
          requireAuth: true,
          showProgressBar: true,
          collectEmail: true,
          start: undefined as unknown as Date,
          end: undefined as unknown as Date,
          questions: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const createForm = api.form.create.useMutation({
    onSuccess: () => {
      toast.success('Form created successfully');
      router.push('/admin/forms');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error creating form: ${error.message}`);
    },
  });

  const addManagers = api.form.addManagers.useMutation({
    onSuccess: () => {
      toast.success('Managers added successfully');
    },
    onError: (error) => {
      toast.error(`Error adding managers: ${error.message}`);
    },
  });

  const updateForm = api.form.update.useMutation({
    onSuccess: () => {
      toast.success('Form updated successfully');
      void utils.form.getById.invalidate({ id: initialData?.id ?? '' });
      router.push('/admin/forms');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error updating form: ${error.message}`);
    },
  });

  const createQuestion = api.form.createQuestion.useMutation({
    onSuccess: () => {
      toast.success('New question added to the form successfully');
      router.push('/admin/forms');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error creating question: ${error.message}`);
    },
  });

  const updateQuestion = api.form.updateQuestion.useMutation({
    onSuccess: () => {
      toast.success('Existing question in the form updated successfully');
      router.push('/admin/forms');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error updating question: ${error.message}`);
    },
  });

  const deleteQuestion = api.form.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success('Question that removed from the form is successfully deleted');
      router.push('/admin/forms');
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error deleting question: ${error.message}`);
    },
  });

  const onSubmit = (data: FormBuilderSchema) => {
    const formattedData = {
      ...data,
      questions: data.questions.map((q, index) => ({
        ...q,
        order: index,
      })),
    };

    if (mode === 'create') {
      const formId = form.getValues('id');
      createForm.mutate(
        {
          ...formattedData,
          id: formId,
        },
        {
          onSuccess: () => {
            if (selectedUserIds.size > 0) {
              addManagers.mutate({
                formId,
                managerIds: Array.from(selectedUserIds),
              });
            }
            formattedData.questions.forEach((question) => {
              createQuestion.mutate({
                ...question,
                formId,
              });
            });
          },
          onError: (error) => {
            console.error('Failed to create form, skipping creating questions: ', error.message);
            toast.error('Failed to create form, skipping creating questions', {
              description: error.message,
            });
          },
        },
      );
    } else if (mode === 'edit' && initialData?.id) {
      const initialFormId = initialData.id;
      updateForm.mutate(
        {
          ...formattedData,
          id: initialFormId,
        },
        {
          onSuccess: () => {
            const submittedQuestions = formattedData.questions;
            const initialQuestions = initialData.questions;

            const submittedQuestionIds = new Set(submittedQuestions.map((question) => question.id));
            const initialQuestionIds = new Set(initialQuestions.map((question) => question.id));

            const newQuestions = submittedQuestions.filter(
              (question) => !initialQuestionIds.has(question.id),
            );
            const updatedQuestions = submittedQuestions.filter((question) =>
              initialQuestionIds.has(question.id),
            );
            const deletedQuestions = initialQuestions.filter(
              (question) => !submittedQuestionIds.has(question.id),
            );

            // handle new questions
            newQuestions.forEach((question) => {
              createQuestion.mutate({
                ...question,
                formId: initialFormId,
              });
            });

            // handle updated questions
            updatedQuestions.forEach((question) => {
              updateQuestion.mutate({
                ...question,
              });
            });

            // handle deleted questions
            deletedQuestions.forEach((question) => {
              deleteQuestion.mutate({
                id: question.id,
              });
            });

            console.log('New questions: ', newQuestions);
            console.log('Updated questions: ', updatedQuestions);
            console.log('Deleted questions: ', deletedQuestions);
          },
        },
      );
    }
  };

  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      type: 'SHORT_ANSWER',
      required: false,
      order: fields.length,
      settings: { placeholder: '' },
    });
  };

  const isSubmitting = createForm.isPending || updateForm.isPending;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'create' ? 'Create New Form' : 'Edit Form'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {mode === 'create' ? 'Create Form' : 'Save Changes'}
          </Button>
        </div>
      </div>
      <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <header className="flex flex-wrap gap-2 text-xs font-medium">
          {form.formState.isValid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Form Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" /> Form Invalid
            </span>
          )}

          {/* is dirty status (has the user touched anything?) */}
          {form.formState.isDirty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              <Info className="h-3.5 w-3.5" /> Unsaved Changes
            </span>
          )}

          {form.formState.isSubmitting && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
            </span>
          )}

          {form.formState.isSubmitSuccessful && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sent Successfully
            </span>
          )}
        </header>

        {Object.keys(form.formState.errors).length > 0 && (
          <div className="space-y-2 rounded-md bg-rose-50/50 p-3 dark:bg-rose-950/10">
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-400">
              Detected {Object.keys(form.formState.errors).length} error(s):
            </p>
            <ul className="space-y-1 text-sm text-rose-600 dark:text-rose-400">
              {Object.entries(form.formState.errors).map(([fieldName, error]) => (
                <li key={fieldName} className="flex items-start gap-1.5 text-xs">
                  <span className="font-medium capitalize">{fieldName}:</span>
                  <span>{error?.message as string}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="managers">Managers</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              {/* Main Form Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Id</FormLabel>
                        <FormControl>
                          <Input {...field} disabled readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Event Registration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the purpose of this form..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Questions</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">No questions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your form by adding a question.
                      </p>
                      <Button type="button" onClick={addQuestion}>
                        Add First Question
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="relative group">
                        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <QuestionBuilderItem form={form} questionIndex={index} />
                      </div>
                    ))}
                  </div>
                )}

                {fields.length > 0 && (
                  <div className="h-4" /> // Spacer
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HOTLINE">Hotline</SelectItem>
                            <SelectItem value="MACHINING">Machining</SelectItem>
                            <SelectItem value="COMPETITION">Competition</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Hotline forms appear in the dedicated Hotline section.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Published</FormLabel>
                          <FormDescription>Make this form visible to users.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>Accept new submissions.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requireAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Require Login</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collectEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Collect Email</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowMultipleSubmissions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Multiple Submissions</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showProgressBar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Progress Bar</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={toDateTimeLocalValue(field.value as unknown as Date)}
                              onChange={(e) =>
                                field.onChange(fromDateTimeLocalValue(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={toDateTimeLocalValue(field.value as unknown as Date)}
                              onChange={(e) =>
                                field.onChange(fromDateTimeLocalValue(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="managers" className="space-y-6">
              <FormManagers
                formId={initialData?.id ?? ''}
                isOwner={session?.user?.id === initialData?.createdBy}
                mode={mode}
                selectedUserIds={selectedUserIds}
                onUserSelection={handleUserSelection}
                ownerData={
                  initialData?.creator
                    ? {
                        id: initialData.creator.id,
                        name: initialData.creator.name,
                        email: initialData.creator.email,
                        role: 'OWNER',
                      }
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {/* Floating Add Question Button */}
      {activeTab === 'questions' && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            type="button"
            className="rounded-full aspect-square px-0 h-10 w-10"
            onClick={addQuestion}
          >
            <Plus className="" />
          </Button>
        </div>
      )}
    </div>
  );
}
