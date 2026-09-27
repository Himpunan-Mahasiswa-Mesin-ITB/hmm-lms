'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, User, MessageSquare, Download, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { DataTable } from '~/components/data-table';
import { DataTableColumnHeader } from '~/components/data-table-column-header';
import { type DataTableFeatures } from '~/components/data-table-features';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { TIMEZONE } from '~/constants/constants';
import { updateFormNoteSchema, type UpdateFormNoteForm } from '~/lib/types/forms';
import { api } from '~/trpc/react';
import type { RouterOutputs } from '~/trpc/react';

type FormWithQuestions = RouterOutputs['form']['getById'];
type Submission = RouterOutputs['form']['getSubmissions']['submissions'][number];

interface ResponsesClientProps {
  form: FormWithQuestions;
  submissions: Submission[];
}

// helper function to get option text from question settings
function getOptionText(question: FormWithQuestions['questions'][number], value: string): string {
  if (!question.settings || typeof question.settings !== 'object') return value;

  const settings = question.settings as {
    options?: Array<{ id: string; text: string; value: string }>;
    allowOther?: boolean;
  };

  if (settings.options && Array.isArray(settings.options)) {
    const option = settings.options.find((opt) => opt.value === value);
    if (option) return option.text;
  }

  // if not found in options, return the original value (or "other" custom text)
  return value;
}

// helper function to render answer value based on question type
function renderAnswerValue(
  question: FormWithQuestions['questions'][number],
  answer: Submission['answers'][number] | null | undefined,
): React.ReactNode {
  if (!answer) {
    return <span className="text-muted-foreground italic">Skipped</span>;
  }

  switch (question.type) {
    case 'SHORT_ANSWER':
    case 'LONG_ANSWER':
    case 'NAME_SELECT':
    case 'NIM_SELECT':
    case 'TIME':
    case 'COURSE_SELECT':
    case 'EVENT_SELECT':
      return answer.textValue ?? 'No answer';

    case 'MULTIPLE_CHOICE':
      if (answer.textValue) {
        return getOptionText(question, answer.textValue);
      }
      return 'No answer';

    case 'MULTIPLE_SELECT':
      if (answer.jsonValue && Array.isArray(answer.jsonValue)) {
        return (answer.jsonValue as string[])
          .map((value) => getOptionText(question, value))
          .join(', ');
      }
      return 'No answer';

    case 'RATING':
      if (answer.numberValue !== null && answer.numberValue !== undefined) {
        return answer.numberValue.toString();
      }
      return 'No answer';

    case 'DATE':
      if (answer.dateValue) {
        return formatInTimeZone(new Date(answer.dateValue), TIMEZONE, 'PPP');
      }
      return 'No answer';

    case 'FILE_UPLOAD':
      if (answer.fileUrl) {
        return (
          <a
            href={answer.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View
          </a>
        );
      }
      if (answer.jsonValue && Array.isArray(answer.jsonValue)) {
        // multiple files stored as array of objects with url and name
        const files = answer.jsonValue as Array<{ url: string; name: string }>;
        return files.map((file, idx) => (
          <div key={idx}>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {file.name || 'View'}
            </a>
            {idx < files.length - 1 && ', '}
          </div>
        ));
      }
      return 'No answer';

    default:
      return (
        answer.textValue ??
        (answer.numberValue !== null ? String(answer.numberValue) : null) ??
        (answer.dateValue ? formatInTimeZone(new Date(answer.dateValue), TIMEZONE, 'PPP') : null) ??
        (answer.jsonValue ? JSON.stringify(answer.jsonValue) : 'No answer')
      );
  }
}

// helper function to get answer value as string for export
function getAnswerValueAsString(
  question: FormWithQuestions['questions'][number],
  answer: Submission['answers'][number] | null | undefined,
): string {
  if (!answer) return 'No answer';

  switch (question.type) {
    case 'SHORT_ANSWER':
    case 'LONG_ANSWER':
    case 'NAME_SELECT':
    case 'NIM_SELECT':
    case 'TIME':
    case 'COURSE_SELECT':
    case 'EVENT_SELECT':
      return answer.textValue ?? 'No answer';

    case 'MULTIPLE_CHOICE':
      if (answer.textValue) {
        return getOptionText(question, answer.textValue);
      }
      return 'No answer';

    case 'MULTIPLE_SELECT':
      if (answer.jsonValue && Array.isArray(answer.jsonValue)) {
        return (answer.jsonValue as string[])
          .map((value) => getOptionText(question, value))
          .join(', ');
      }
      return 'No answer';

    case 'RATING':
      if (answer.numberValue !== null && answer.numberValue !== undefined) {
        return answer.numberValue.toString();
      }
      return 'No answer';

    case 'DATE':
      if (answer.dateValue) {
        return formatInTimeZone(new Date(answer.dateValue), TIMEZONE, 'PPP');
      }
      return 'No answer';

    case 'FILE_UPLOAD':
      if (answer.fileUrl) {
        return answer.fileUrl;
      }
      if (answer.jsonValue && Array.isArray(answer.jsonValue)) {
        const files = answer.jsonValue as Array<{ url: string; name: string }>;
        return files.map((f) => f.url).join(', ');
      }
      return 'No answer';

    default:
      return (
        answer.textValue ??
        (answer.numberValue !== null ? String(answer.numberValue) : 'No answer') ??
        (answer.dateValue
          ? formatInTimeZone(new Date(answer.dateValue), TIMEZONE, 'PPP')
          : 'No answer') ??
        (answer.jsonValue ? JSON.stringify(answer.jsonValue) : 'No answer')
      );
  }
}

function UpdateNoteDialog({
  submissionId,
  currentNotes,
  onUpdate,
  isPending,
}: {
  submissionId: string;
  currentNotes: string | null;
  onUpdate: (data: { submissionId: string; notes: string }) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateFormNoteForm>({
    resolver: zodResolver(updateFormNoteSchema),
    defaultValues: {
      notes: currentNotes || '',
    },
  });

  const handleSubmit = (values: UpdateFormNoteForm) => {
    onUpdate({ submissionId, notes: values.notes });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Notes</DialogTitle>
          <DialogDescription>Add or update notes for this form submission.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter notes..." className="min-h-25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Notes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const createResponseColumns = (
  form: FormWithQuestions,
  updateSubmissionNote: (data: { submissionId: string; notes: string }) => void,
  isUpdatingNote: boolean,
): ColumnDef<DataTableFeatures, Submission>[] => {
  const baseColumns: ColumnDef<DataTableFeatures, Submission>[] = [
    {
      accessorKey: 'submitter.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Respondent" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{row.original.submitter?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.submitter?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'submitter.email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.submitter?.email}</span>
      ),
    },
    {
      accessorKey: 'submitter.nim',
      header: ({ column }) => <DataTableColumnHeader column={column} title="NIM" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.submitter?.nim}</span>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Responded At" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatInTimeZone(new Date(row.original.submittedAt), TIMEZONE, 'MMM d, yyyy • HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
      cell: ({ row }) => (
        <span className="flex items-center">
          <UpdateNoteDialog
            submissionId={row.original.id}
            currentNotes={row.original.notes}
            onUpdate={updateSubmissionNote}
            isPending={isUpdatingNote}
          />
          {row.original.notes && (
            <span className="ml-2 text-xs text-muted-foreground">{row.original.notes}</span>
          )}
        </span>
      ),
    },
  ];

  const questionColumns: ColumnDef<DataTableFeatures, Submission>[] = form.questions.map(
    (question) => ({
      id: `question-${question.id}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={question.title} />,
      cell: ({ row }) => {
        const answer = row.original.answers.find((a) => a.questionId === question.id);
        return <span className="text-sm">{renderAnswerValue(question, answer)}</span>;
      },
    }),
  );

  return [...baseColumns, ...questionColumns];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ResponsesClient({ form, submissions }: ResponsesClientProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const router = useRouter();

  const { mutate: updateSubmissionNote, isPending: isUpdatingNote } =
    api.form.updateSubmissionNote.useMutation({
      onMutate: () => {
        toast.info('Updating note...');
      },
      onSuccess: async () => {
        toast.success('Note updated successfully');
        router.refresh();
      },
      onError: (err) => toast.error(err.message),
    });

  const responseColumns = useMemo(
    () => createResponseColumns(form, updateSubmissionNote, isUpdatingNote),
    [form, updateSubmissionNote, isUpdatingNote],
  );
  const handleExportResponses = () => {
    if (!submissions) return;

    const questions = form.questions.map((q) => q.title);

    const worksheetData = [
      ['Name', 'NIM', 'Email', 'Submitted At', 'Notes', ...questions],
      ...submissions.map((s) => [
        s.submitter?.name ?? 'N/A',
        s.submitter?.email ?? 'N/A',
        s.submitter?.nim ?? 'N/A',
        formatInTimeZone(new Date(s.submittedAt), TIMEZONE, 'yyyy-MM-dd HH:mm'),
        s.notes ?? '',
        ...form.questions.map((question) => {
          const answer = s.answers.find((a) => a.questionId === question.id);
          return getAnswerValueAsString(question, answer);
        }),
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    XLSX.writeFile(workbook, `Responses-${form.title}.xlsx`);
    toast.success('Responses exported to Excel successfully');
  };

  // --- Summary Tab Logic ---
  const summaryData = useMemo(() => {
    return form.questions.map((question) => {
      const answers = submissions.flatMap((s) =>
        s.answers.filter((a) => a.questionId === question.id),
      );

      let chartData: { name: string; value: number }[] = [];
      let textAnswers: string[] = [];

      if (['MULTIPLE_CHOICE', 'RATING', 'MULTIPLE_SELECT'].includes(question.type)) {
        const counts: Record<string, number> = {};
        answers.forEach((a) => {
          let values: string[] = [];

          switch (question.type) {
            case 'MULTIPLE_CHOICE':
              if (a.textValue) {
                values = [getOptionText(question, a.textValue)];
              }
              break;
            case 'NAME_SELECT':
            case 'NIM_SELECT':
            case 'TIME':
            case 'COURSE_SELECT':
            case 'EVENT_SELECT':
              if (a.textValue) values = [a.textValue];
              break;
            case 'MULTIPLE_SELECT':
              if (a.jsonValue && Array.isArray(a.jsonValue)) {
                values = (a.jsonValue as string[]).map((v) => getOptionText(question, v));
              }
              break;
            case 'RATING':
              if (a.numberValue !== null && a.numberValue !== undefined) {
                values = [String(a.numberValue)];
              }
              break;
            case 'FILE_UPLOAD':
              if (a.fileUrl) values = [a.fileUrl];
              break;
            default:
              if (a.textValue) values = [a.textValue];
          }

          values.forEach((v) => {
            counts[v] = (counts[v] ?? 0) + 1;
          });
        });

        chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
      } else {
        textAnswers = answers.map((a) => getAnswerValueAsString(question, a));
      }

      return {
        question,
        chartData,
        textAnswers,
        totalAnswers: answers.length,
      };
    });
  }, [form.questions, submissions]);

  // --- Individual Tab Logic ---
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const currentSubmission = submissions[currentSubmissionIndex];

  const handleNextSubmission = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      setCurrentSubmissionIndex((prev) => prev + 1);
    }
  };

  const handlePrevSubmission = () => {
    if (currentSubmissionIndex > 0) {
      setCurrentSubmissionIndex((prev) => prev - 1);
    }
  };

  // --- Question Tab Logic ---
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(form.questions[0]?.id ?? '');
  const selectedQuestion = form.questions.find((q) => q.id === selectedQuestionId);
  const selectedQuestionAnswers = useMemo(() => {
    if (!selectedQuestionId) return [];
    return submissions
      .map((s) => {
        const answer = s.answers.find((a) => a.questionId === selectedQuestionId);
        return {
          submission: s,
          answer,
        };
      })
      .filter((item) => item.answer);
  }, [submissions, selectedQuestionId]);

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
          <p>Share your form to start collecting responses.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-100">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="question">Question</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {summaryData.map((item) => (
            <Card key={item.question.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg font-medium">{item.question.title}</CardTitle>
                <CardDescription>{item.totalAnswers} responses</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {item.chartData.length > 0 ? (
                  <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={item.chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            color: 'black',
                          }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                          {item.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <ScrollArea className="h-50 w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {item.textAnswers.map((ans, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                          {ans}
                        </div>
                      ))}
                      {item.textAnswers.length === 0 && (
                        <p className="text-muted-foreground italic">No text answers.</p>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="question" className="space-y-6 mt-6">
          <div className="flex items-center gap-4">
            <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
              <SelectTrigger className="w-full md:w-100">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {form.questions.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {selectedQuestionAnswers.length} responses
            </div>
          </div>

          {selectedQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="overflow-auto">{selectedQuestion.title}</CardTitle>
                {selectedQuestion.description && (
                  <CardDescription className="overflow-auto">
                    {selectedQuestion.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-87.5 w-full rounded-md border p-4">
                  {selectedQuestionAnswers.map((item, i) => {
                    const val = renderAnswerValue(selectedQuestion, item.answer);

                    return (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors my-2"
                      >
                        <div className="flex-1 w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-muted-foreground">
                              {item.submission.submitter?.name ?? 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatInTimeZone(
                                new Date(item.submission.submittedAt),
                                TIMEZONE,
                                'MMM d, yyyy • HH:mm',
                              )}
                            </span>
                          </div>
                          <p className="text-foreground overflow-auto">{val}</p>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="individual" className="space-y-6 mt-6">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevSubmission}
                disabled={currentSubmissionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentSubmissionIndex + 1} of {submissions.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextSubmission}
                disabled={currentSubmissionIndex === submissions.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSubmission &&
                formatInTimeZone(
                  new Date(currentSubmission.submittedAt),
                  TIMEZONE,
                  "PPP 'at' HH:mm",
                )}
            </div>
          </div>

          {currentSubmission && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{currentSubmission.submitter?.name ?? 'Anonymous'}</CardTitle>
                    <CardDescription>
                      {currentSubmission.submitter?.email ?? 'No email'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-6 w-full">
                {form.questions.map((question) => {
                  const answer = currentSubmission.answers.find(
                    (a) => a.questionId === question.id,
                  );
                  const val = renderAnswerValue(question, answer);

                  return (
                    <div key={question.id} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground overflow-auto">
                        {question.title}
                      </h4>
                      <div className="p-3 bg-muted/30 rounded-md border text-sm overflow-auto">
                        {val}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="responses" className="space-y-6 mt-6">
          <div className="flex flex-col">
            <div className="flex max-sm:flex-col max-sm:gap-2 items-center sm:flex-row sm:justify-between mb-3">
              <h2 className="text-2xl font-bold">All Responses</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportResponses}
                disabled={!submissions.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Responses
              </Button>
            </div>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No responses yet.</div>
            ) : (
              <DataTable
                columns={responseColumns}
                data={submissions}
                defaultFilterColumn="submitter.name"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
