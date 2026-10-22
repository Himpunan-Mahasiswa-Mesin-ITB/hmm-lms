"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useFieldArray } from "react-hook-form";
import { QuestionType } from "~/types/enums";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Plus, Trash2, Image as ImageIcon, AlertCircle, MoreVertical, FileImage, Newspaper } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateTryoutInput } from "~/lib/schema/tryout";
import { toast } from 'sonner';
import { cn } from "~/lib/utils";
import { uploadImages } from '~/server/action';

const ImageUploader = ({
  onUpload,
  isUploading,
}: {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
}) => (
  <div className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
    <input
      type="file"
      accept="image/*"
      onChange={onUpload}
      disabled={isUploading}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      multiple
    />
    {isUploading ? (
      <span className="animate-pulse">Uploading...</span>
    ) : (
      <div className="flex flex-col items-center">
        <ImageIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Add Images</span>
      </div>
    )}
  </div>
);

interface QuestionBuilderProps {
  form: UseFormReturn<CreateTryoutInput>;
  questionIndex: number;
  tryoutId: string;
}

export default function QuestionBuilder({ form, questionIndex, tryoutId }: QuestionBuilderProps) {
  const { formState: { errors } } = form;

  // Get errors for this specific question object
  const questionErrors = errors.questions?.[questionIndex];

  const questionType = form.watch(`questions.${questionIndex}.type`);
  const questionImages = form.watch(`questions.${questionIndex}.images`);
  const questionExplanationImages = form.watch(`questions.${questionIndex}.explanationImages`);

  // State for showing/hiding optional sections
  const [showQuestionImages, setShowQuestionImages] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showExplanationImages, setShowExplanationImages] = useState(false);

  const [isUploadingQuestionImage, setIsUploadingQuestionImage] = useState(false);
  const [uploadingOptionImage, setUploadingOptionImage] = useState<number | null>(null);
  const [isUploadingExplanationImage, setIsUploadingExplanationImage] = useState(false);

  // State for showing images per option
  const [optionImageVisibility, setOptionImageVisibility] = useState<Record<number, boolean>>({});

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  const { fields: shortAnswerFields, append: appendShortAnswer, remove: removeShortAnswer } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.shortAnswers`,
  });

  // Remove the old useEffect and add these watch subscriptions instead:
  const explanation = form.watch(`questions.${questionIndex}.explanation`);

  useEffect(() => {
    if (questionImages && questionImages.length > 0) {
      setShowQuestionImages(true);
    }
  }, [questionImages]);

  useEffect(() => {
    if (explanation && explanation.length > 0) {
      setShowExplanation(true);
    }
  }, [explanation]);

  useEffect(() => {
    if (questionExplanationImages && questionExplanationImages.length > 0) {
      setShowExplanationImages(true);
    }
  }, [questionExplanationImages]);

  // Auto-show option images if they have content on mount
  useEffect(() => {
    optionFields.forEach((_, optionIndex) => {
      const images = form.watch(`questions.${questionIndex}.options.${optionIndex}.images`);
      if (images && images.length > 0) {
        setOptionImageVisibility(prev => ({
          ...prev,
          [optionIndex]: true
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionFields.length]);

  const handleExplanationImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploadingExplanationImage(true);
    try {
      const results = await uploadImages(files, 'tryout', tryoutId, questionIndex + 1);
      const newImageUrls = results.map(result => result.CDNurl);
      const currentImages = form.getValues(`questions.${questionIndex}.explanationImages`) ?? [];
      form.setValue(`questions.${questionIndex}.explanationImages`, [...currentImages, ...newImageUrls]);
      toast.success(`${results.length} explanation image(s) uploaded!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload explanation images.");
    } finally {
      setIsUploadingExplanationImage(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleRemoveExplanationImage = (imageUrl: string) => {
    const currentImages = form.getValues(`questions.${questionIndex}.explanationImages`) ?? [];
    form.setValue(`questions.${questionIndex}.explanationImages`, currentImages.filter((img) => img !== imageUrl));
    toast.success("Explanation image removed.");
  };

  const handleQuestionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploadingQuestionImage(true);
    try {
      const results = await uploadImages(files, 'tryout', tryoutId, questionIndex + 1);
      const newImageUrls = results.map(result => result.CDNurl);
      const currentImages = form.getValues(`questions.${questionIndex}.images`) ?? [];
      form.setValue(`questions.${questionIndex}.images`, [...currentImages, ...newImageUrls]);
      toast.success(`${results.length} image(s) uploaded!`);
    } catch {
      toast.error("Failed to upload one or more images.");
    } finally {
      setIsUploadingQuestionImage(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleOptionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, optionIndex: number) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploadingOptionImage(optionIndex);
    try {
      const results = await uploadImages(files, 'tryout', tryoutId, questionIndex + 1);
      const newImageUrls = results.map(result => result.CDNurl);
      const currentImages = form.getValues(`questions.${questionIndex}.options.${optionIndex}.images`) ?? [];
      form.setValue(`questions.${questionIndex}.options.${optionIndex}.images`, [...currentImages, ...newImageUrls]);
      toast.success(`${results.length} image(s) uploaded for option ${String.fromCharCode(65 + optionIndex)}!`);
    } catch {
      toast.error("Failed to upload images for option.");
    } finally {
      setUploadingOptionImage(null);
      if (event.target) event.target.value = '';
    }
  };

  const handleRemoveImage = (imageUrl: string, optionIndex?: number) => {
    const path = (typeof optionIndex === 'number')
      ? `questions.${questionIndex}.options.${optionIndex}.images`
      : `questions.${questionIndex}.images`;
    // @ts-expect-error - Path is valid but TS can't infer it perfectly
    const currentImages = form.getValues(path) as string[] ?? [];
    // @ts-expect-error - Same as above
    form.setValue(path, currentImages.filter((img: string) => img !== imageUrl));
    toast.success("Image removed.");
  };

  const toggleOptionImageVisibility = (optionIndex: number) => {
    setOptionImageVisibility(prev => ({
      ...prev,
      [optionIndex]: !prev[optionIndex]
    }));
  };

  useEffect(() => {
    if (
      (questionType === QuestionType.MULTIPLE_CHOICE_SINGLE || questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) &&
      optionFields.length === 0
    ) {
      [1, 2].forEach(() => appendOption({ text: "", isCorrect: false, explanation: "", images: [] }));
    }
  }, [questionType, optionFields.length, appendOption]);

  const addOption = () => {
    appendOption({ text: "", isCorrect: false, explanation: "", images: [] });
  };

  const handleTypeChange = (newType: QuestionType) => {
    form.setValue(`questions.${questionIndex}.type`, newType, { shouldValidate: true });
    if (newType === QuestionType.SHORT_ANSWER) {
      form.setValue(`questions.${questionIndex}.options`, []);
    } else if (newType === QuestionType.MULTIPLE_CHOICE_SINGLE || newType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) {
      form.setValue(`questions.${questionIndex}.shortAnswers`, []);
    } else if (newType === QuestionType.LONG_ANSWER) {
      form.setValue(`questions.${questionIndex}.options`, []);
      form.setValue(`questions.${questionIndex}.shortAnswers`, []);
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE: return "Multiple Choice (Single)";
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE: return "Multiple Choice (Multiple)";
      case QuestionType.SHORT_ANSWER: return "Short Answer";
      case QuestionType.LONG_ANSWER: return "Long Answer";
      default: return type;
    }
  };

  return (
    <Card className={cn(
      "border-l-4 transition-colors",
      questionErrors ? "border-l-destructive" : "border-l-primary"
    )}>
      <CardContent className="pt-6 space-y-6">
        {(questionErrors?.options?.message ?? questionErrors?.shortAnswers?.message) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {questionErrors.options?.message ?? questionErrors.shortAnswers?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Type, Points, Required */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <FormField control={form.control} name={`questions.${questionIndex}.type`} render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select onValueChange={(value) => handleTypeChange(value as QuestionType)} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {Object.values(QuestionType).map((type) => (<SelectItem key={type} value={type}>{getQuestionTypeLabel(type)}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`questions.${questionIndex}.points`} render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl><Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`questions.${questionIndex}.required`} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-full">
              <div className="space-y-0.5"><FormLabel>Required</FormLabel></div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        {/* Question Text with Dropdown Menu for Optional Fields */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Question</FormLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Optional Fields
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowQuestionImages(true)} disabled={showQuestionImages}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Question Images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowExplanation(true)} disabled={showExplanation}>
                  <Newspaper className="w-4 h-4 mr-2" />
                  Add Explanation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowExplanationImages(true)} disabled={showExplanationImages}>
                  <FileImage className="w-4 h-4 mr-2" />
                  Add Explanation Images
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <FormField control={form.control} name={`questions.${questionIndex}.question`} render={({ field }) => (
            <FormItem>
              <FormControl><Textarea placeholder="Enter your question here..." className="min-h-[75px]" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Question Image Upload and Display - Conditionally Shown */}
        {showQuestionImages && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Question Images (Optional)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowQuestionImages(false);
                  form.setValue(`questions.${questionIndex}.images`, []);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {questionImages?.map((imageUrl) => (
                <div key={imageUrl} className="relative w-24 h-24 rounded-md overflow-hidden group">
                  <Image src={imageUrl} alt="Question image" fill style={{ objectFit: 'cover' }} className="transition-transform duration-200 group-hover:scale-105" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(imageUrl)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <ImageUploader onUpload={handleQuestionImageUpload} isUploading={isUploadingQuestionImage} />
            </div>
          </div>
        )}

        {/* Overall Question Explanation - Conditionally Shown */}
        {showExplanation && (
          <FormField control={form.control} name={`questions.${questionIndex}.explanation`} render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Overall Explanation (Optional)</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowExplanation(false);
                    form.setValue(`questions.${questionIndex}.explanation`, '');
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <FormControl><Textarea placeholder="Explain the correct answer after the user completes the question..." {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* Explanation Images - Conditionally Shown */}
        {showExplanationImages && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Explanation Images (Optional)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowExplanationImages(false);
                  form.setValue(`questions.${questionIndex}.explanationImages`, []);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {questionExplanationImages?.map((imageUrl) => (
                <div key={imageUrl} className="relative w-24 h-24 rounded-md overflow-hidden group">
                  <Image src={imageUrl} alt="Explanation image" fill style={{ objectFit: 'cover' }} className="transition-transform duration-200 group-hover:scale-105" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveExplanationImage(imageUrl)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <ImageUploader onUpload={handleExplanationImageUpload} isUploading={isUploadingExplanationImage} />
            </div>
          </div>
        )}

        {/* Options for Multiple Choice Questions */}
        {(questionType === QuestionType.MULTIPLE_CHOICE_SINGLE || questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Answer Options</Label>
              <Button type="button" onClick={addOption} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Option</Button>
            </div>
            <div className="space-y-3">
              {optionFields?.map((option, optionIndex) => {
                const optionImages = form.watch(`questions.${questionIndex}.options.${optionIndex}.images`);
                const showImages = optionImageVisibility[optionIndex] ?? (optionImages && optionImages.length > 0);

                return (
                  <div key={option.id} className="flex items-start gap-3 p-4 border rounded-lg bg-background">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{String.fromCharCode(65 + optionIndex)}</Badge>
                          <FormField control={form.control} name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`} render={({ field }) => (
                            <FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" /></FormControl></FormItem>
                          )} />
                        </div>
                        <div className="flex-1">
                          <FormField control={form.control} name={`questions.${questionIndex}.options.${optionIndex}.text`} render={({ field }) => (
                            <FormItem>
                              <FormControl><Input placeholder={`Option ${String.fromCharCode(65 + optionIndex)} text`} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleOptionImageVisibility(optionIndex)} disabled={showImages}>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Add Images
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {showImages && (
                        <div className="pl-12">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-xs text-muted-foreground">Option Images</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                toggleOptionImageVisibility(optionIndex);
                                form.setValue(`questions.${questionIndex}.options.${optionIndex}.images`, []);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {optionImages?.map((imageUrl) => (
                              <div key={imageUrl} className="relative w-24 h-24 rounded-md overflow-hidden group">
                                <Image src={imageUrl} alt="Option image" fill style={{ objectFit: 'cover' }} className="transition-transform duration-200 group-hover:scale-105" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(imageUrl, optionIndex)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <ImageUploader onUpload={(e) => handleOptionImageUpload(e, optionIndex)} isUploading={uploadingOptionImage === optionIndex} />
                          </div>
                        </div>
                      )}

                      {form.watch(`questions.${questionIndex}.options.${optionIndex}.isCorrect`) && (
                        <FormField control={form.control} name={`questions.${questionIndex}.options.${optionIndex}.explanation`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Textarea placeholder="Explanation for correct answer (optional)" className="min-h-[60px]" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)} className="text-destructive hover:text-destructive mt-1" disabled={optionFields.length <= 2}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            {questionType === QuestionType.MULTIPLE_CHOICE_SINGLE && (<p className="text-sm text-muted-foreground">ℹ️ For single choice questions, only one option should be marked as correct.</p>)}
            {questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE && (<p className="text-sm text-muted-foreground">ℹ️ For multiple choice questions, you can mark multiple options as correct.</p>)}
          </div>
        )}

        {/* Short Answer with multiple possible answers */}
        {questionType === QuestionType.SHORT_ANSWER && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <p className="text-sm text-muted-foreground">📝 For auto-grading, the student&apos;s answer must exactly match one of the answers you provide.</p>
            {shortAnswerFields.map((field, index) => (
              <FormField key={field.id} control={form.control} name={`questions.${questionIndex}.shortAnswers.${index}.value`} render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl><Input placeholder={`Correct Answer #${index + 1}`} {...field} /></FormControl>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeShortAnswer(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => appendShortAnswer({ value: "" })}>
              <Plus className="w-4 h-4 mr-2" />Add Correct Answer
            </Button>
          </div>
        )}

        {/* Long Answer (Manual Grading) */}
        {questionType === QuestionType.LONG_ANSWER && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">📄 This is a long answer question. Students will provide a detailed text response that requires manual grading.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
