'use client';

import type { QuestionOption } from '@prisma/client';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Flag,
  CircleDot,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import MotionImageDialog from '~/components/motion/dialog';
import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Progress } from '~/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Textarea } from '~/components/ui/textarea';
import type { Tryout, UserAttempt, Question } from '~/lib/types/tryout';
import { api } from '~/trpc/react';

interface TryoutAttemptClientProps {
  attempt: UserAttempt;
  tryout: Tryout;
  tryoutId: string;
}

export function TryoutAttemptClient({ attempt, tryout, tryoutId }: TryoutAttemptClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const submitAnswerMutation = api.tryout.submitAnswer.useMutation();
  // const submitAnswersBatchMutation = api.tryout.submitAnswersBatch.useMutation();
  const completeAttemptMutation = api.tryout.completeAttempt.useMutation();

  const currentQuestion = tryout.questions[currentQuestionIndex];
  const totalQuestions = tryout.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Initialize answers from existing attempt
  useEffect(() => {
    const existingAnswers: Record<string, string> = {};
    attempt.answers.forEach((answer) => {
      existingAnswers[answer.questionId] = answer.answer;
    });
    setAnswers(existingAnswers);
  }, [attempt.answers]);

  // Timer logic
  useEffect(() => {
    if (!tryout.duration) return;

    const startTime = new Date(attempt.startedAt).getTime();
    const durationMs = tryout.duration * 60 * 1000;
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        void handleAutoSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [tryout.duration, attempt.startedAt]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = useCallback(
    async (questionId: string, answer: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));

      try {
        await submitAnswerMutation.mutateAsync({
          attemptId: attempt.id,
          questionId,
          answer,
        });
      } catch (error) {
        toast.error('Failed to save answer');
        console.error(error);
      }
    },
    [attempt.id, submitAnswerMutation],
  );

  const submitAllAnswers = useCallback(async () => {
    // console.log('Answers in function: ', answers);
    const answerEntries = Object.entries(answers);
    // const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
    //   questionId,
    //   answer,
    // }));

    // if (formattedAnswers.length === 0) return;

    // try {
    //   await submitAnswersBatchMutation.mutateAsync({
    //     attemptId: attempt.id,
    //     answers: formattedAnswers,
    //   });
    // } catch (error) {
    //   console.error('Failed to batch submit answers:', error);
    //   throw error;
    // }

    // for (const [questionId, answer] of answerEntries) {
    //   try {
    //     await submitAnswerMutation.mutateAsync({
    //       attemptId: attempt.id,
    //       questionId,
    //       answer,
    //     });
    //   } catch (error) {
    //     console.error(`Failed to submit answer for question ${questionId}:`, error);
    //   }
    // }
    const promises = answerEntries.map(async ([questionId, answer]) => {
      try {
        return await submitAnswerMutation.mutateAsync({
          attemptId: attempt.id,
          questionId,
          answer,
        });
      } catch (error) {
        console.error(`Failed to submit answer for question ${questionId}:`, error);
        throw error;
      }
    });

    // run all mutations concurrently
    await Promise.all(promises);
  }, [answers, attempt.id, submitAnswerMutation]);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const toastId = toast.loading('Submitting Tryout...');
    setIsSubmitting(true);
    try {
      await submitAllAnswers();
      await completeAttemptMutation.mutateAsync({
        attemptId: attempt.id,
      });
      toast.dismiss(toastId);
      toast.success('Tryout submitted automatically due to time limit');
      router.push(`/tryouts/${tryoutId}/results/${attempt.id}`);
    } catch {
      toast.error('Failed to submit tryout');
      setIsSubmitting(false);
    }
  }, [attempt.id, completeAttemptMutation, router, tryoutId, isSubmitting]);

  const handleSubmit = async () => {
    const toastId = toast.loading('Submitting Tryout...');
    setIsSubmitting(true);
    try {
      await submitAllAnswers();
      await completeAttemptMutation.mutateAsync({
        attemptId: attempt.id,
      });
      toast.dismiss(toastId);
      toast.success('Tryout submitted successfully!');
      router.push(`/tryouts/${tryoutId}/results/${attempt.id}`);
    } catch {
      toast.error('Failed to submit tryout');
      setIsSubmitting(false);
    }
  };

  const handleAutoFillCorrectAnswers = async () => {
    if (session?.user?.role !== 'SUPERADMIN') {
      toast.error('You do not have permission to use this feature');
      return;
    }

    setIsAutoFilling(true);
    const toastId = toast.loading('Auto-filling correct answers...');

    try {
      const correctAnswers: Record<string, string> = {};

      for (const question of tryout.questions) {
        switch (question.type) {
          case 'MULTIPLE_CHOICE_SINGLE': {
            const correctOption = question.options.find((opt) => opt.isCorrect);
            if (correctOption) {
              correctAnswers[question.id] = correctOption.id;
            }
            break;
          }
          case 'MULTIPLE_CHOICE_MULTIPLE': {
            const correctOptions = question.options.filter((opt) => opt.isCorrect);
            if (correctOptions.length > 0) {
              correctAnswers[question.id] = JSON.stringify(correctOptions.map((opt) => opt.id));
            }
            break;
          }
          case 'SHORT_ANSWER':
          case 'LONG_ANSWER': {
            if (question.shortAnswers && question.shortAnswers.length > 0) {
              const firstAnswer = question.shortAnswers[0];
              if (firstAnswer) {
                correctAnswers[question.id] =
                  typeof firstAnswer === 'string' ? firstAnswer : firstAnswer.value;
              }
            }
            break;
          }
        }
      }

      setAnswers(correctAnswers);

      const promises = Object.entries(correctAnswers).map(async ([questionId, answer]) => {
        try {
          return await submitAnswerMutation.mutateAsync({
            attemptId: attempt.id,
            questionId,
            answer,
          });
        } catch (error) {
          console.error(`Failed to submit answer for question ${questionId}:`, error);
          throw error;
        }
      });

      await Promise.all(promises);

      toast.dismiss(toastId);
      toast.success('All correct answers filled successfully!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to auto-fill answers');
      console.error(error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const renderMultipleChoiceSingle = (question: Question, questionAnswer: string) => (
    <RadioGroup
      value={questionAnswer}
      onValueChange={(value) => handleAnswerChange(question.id, value)}
      className="space-y-2"
    >
      {question.options.map((option: QuestionOption) => (
        <Label
          key={option.id}
          htmlFor={option.id}
          className="rounded-md border p-3 text-sm transition-colors cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:bg-accent/70 has-[[data-state=checked]]:border-primary flex flex-col items-start"
        >
          <div className="flex items-center space-x-3 w-full">
            <RadioGroupItem value={option.id} id={option.id} />
            <span className="flex-1">{option.text}</span>
          </div>
          {option.images && option.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {option.images.map((imgUrl) => (
                <MotionImageDialog
                  key={imgUrl}
                  layoutId={imgUrl + option.id}
                  width={1000}
                  height={1000}
                  src={imgUrl}
                  alt="Option image"
                  className="h-20 w-20 rounded-md border object-cover"
                />
              ))}
            </div>
          )}
        </Label>
      ))}
    </RadioGroup>
  );

  const renderMultipleChoiceMultiple = (question: Question, questionAnswer: string) => {
    const selectedOptions: string[] = questionAnswer
      ? (JSON.parse(questionAnswer) as string[])
      : [];

    return (
      <div className="space-y-2">
        {question.options.map((option: QuestionOption) => (
          <Label
            key={option.id}
            htmlFor={option.id}
            className="rounded-md border p-3 text-sm transition-colors cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:bg-accent/70 has-[[data-state=checked]]:border-primary flex flex-col items-start"
          >
            <div className="flex items-center space-x-3 w-full">
              <Checkbox
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={(checked) => {
                  const newSelected = checked
                    ? [...selectedOptions, option.id]
                    : selectedOptions.filter((id: string) => id !== option.id);
                  void handleAnswerChange(question.id, JSON.stringify(newSelected));
                }}
              />
              <span className="flex-1">{option.text}</span>
            </div>
            {option.images && option.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {option.images.map((imgUrl) => (
                  <MotionImageDialog
                    key={imgUrl}
                    layoutId={imgUrl + option.id}
                    width={1000}
                    height={1000}
                    src={imgUrl}
                    alt="Option image"
                    className="h-20 w-20 rounded-md border object-cover"
                  />
                ))}
              </div>
            )}
          </Label>
        ))}
      </div>
    );
  };

  const renderTextAnswer = (question: Question, questionAnswer: string) => (
    <Textarea
      value={questionAnswer ?? ''}
      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
      placeholder="Type your answer here..."
      className={question.type === 'LONG_ANSWER' ? 'min-h-32' : ''}
    />
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const questionAnswer = answers[currentQuestion.id] ?? '';

    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE_SINGLE':
        return renderMultipleChoiceSingle(currentQuestion, questionAnswer);

      case 'MULTIPLE_CHOICE_MULTIPLE':
        return renderMultipleChoiceMultiple(currentQuestion, questionAnswer);

      case 'SHORT_ANSWER':
      case 'LONG_ANSWER':
        return renderTextAnswer(currentQuestion, questionAnswer);

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const answeredQuestions = Object.keys(answers).filter(
    (questionId) =>
      answers[questionId] &&
      answers[questionId].trim() !== '' &&
      answers[questionId].trim() !== '[]',
  ).length;

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <section className="sticky top-2 z-20 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85 md:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold md:text-xl">{tryout.title}</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {tryout.course.title} ({tryout.course.classCode})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              Q {currentQuestionIndex + 1}/{totalQuestions}
            </Badge>
            <Badge
              variant={answeredQuestions === totalQuestions ? 'default' : 'secondary'}
              className="font-medium"
            >
              {answeredQuestions} answered
            </Badge>
            {timeLeft !== null && (
              <Badge
                variant="outline"
                className={`font-mono ${timeLeft < 300000 ? 'border-red-300 text-red-700' : ''}`}
              >
                <Clock className="mr-1 h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </Badge>
            )}
            {session?.user?.role === 'SUPERADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoFillCorrectAnswers}
                disabled={isAutoFilling}
                className="text-xs"
              >
                {isAutoFilling ? 'Filling...' : 'Auto-fill Answers'}
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </section>

      {/* Time Warning */}
      {timeLeft !== null && timeLeft < 300000 && (
        <Alert className="border-amber-200 bg-amber-50 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            Less than 5 minutes remaining! The tryout will be submitted automatically when time runs
            out.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="rounded-xl border p-3 md:p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold md:text-lg">
              Question {currentQuestionIndex + 1}
            </h2>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </Badge>
              {answers[currentQuestion.id] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
          </div>
          <div className="mt-3 space-y-4">
            <div className="prose prose-sm max-w-none leading-relaxed dark:prose-invert">
              <p>{currentQuestion.question}</p>
            </div>

            {currentQuestion.images && currentQuestion.images.length > 0 && (
              <div className="flex h-36 flex-wrap gap-3 overflow-x-auto md:h-44">
                {currentQuestion.images.map((imgUrl) => (
                  <MotionImageDialog
                    key={imgUrl}
                    layoutId={imgUrl + 'question'}
                    src={imgUrl}
                    alt="Question attachment"
                    className="rounded-md border object-contain h-full w-max"
                    width={1000}
                    height={1000}
                  />
                ))}
              </div>
            )}

            {renderQuestion()}
          </div>
        </section>

        <aside className="space-y-3 rounded-xl border p-3 lg:sticky lg:top-24 lg:h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Navigator</h3>
            <span className="text-xs text-muted-foreground">{totalQuestions} questions</span>
          </div>
          <div className="grid grid-cols-6 gap-2 lg:grid-cols-5">
            {tryout.questions.map((question: Question, index: number) => (
              <Button
                key={question.id}
                variant={index === currentQuestionIndex ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${
                  answers[question.id] &&
                  answers[question.id]?.trim() !== '' &&
                  answers[question.id]?.trim() !== '[]'
                    ? 'border-green-300 bg-green-100 text-green-800 hover:bg-green-200'
                    : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDot className="h-3.5 w-3.5 text-primary" />
              Jump between questions quickly
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="w-full justify-between"
            >
              <span className="inline-flex items-center">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </span>
              {currentQuestionIndex}
            </Button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="w-full justify-between"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Flag className="mr-2 h-4 w-4" />
                Submit Tryout
              </Button>
            )}
          </div>
        </aside>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Tryout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your tryout? You have answered {answeredQuestions} out
              of {totalQuestions} questions.
              {answeredQuestions < totalQuestions && (
                <span className="block mt-2 text-amber-600">
                  You still have {totalQuestions - answeredQuestions} unanswered questions.
                </span>
              )}
              <span className="block mt-2 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Tryout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
