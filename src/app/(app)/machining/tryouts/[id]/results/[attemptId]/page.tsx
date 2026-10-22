import type { QuestionOption } from '~/lib/types/tryout';
import cn from 'cnfast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { JSX } from 'react';

import MotionImageDialog from '~/components/motion/dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import type { ResultsUserAnswer } from '~/lib/types/tryout';
import { api } from '~/trpc/server';

type ScoreBadgeVariant = 'default' | 'secondary' | 'destructive';

const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreBadgeVariant = (percentage: number): ScoreBadgeVariant => {
  if (percentage >= 80) return 'default';
  if (percentage >= 60) return 'secondary';
  return 'destructive';
};

const getScoreLabel = (percentage: number): string => {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  return 'Needs Improvement';
};

const OptionDetail = ({ option }: { option: QuestionOption }) => (
  <div className="flex flex-col gap-2">
    <span>{option.text}</span>
    {option.images && option.images.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {option.images.map((imgUrl) => (
          <Image
            key={imgUrl}
            src={imgUrl}
            alt="Option image"
            width={64}
            height={64}
            className="h-16 w-16 rounded-md border object-cover"
          />
        ))}
      </div>
    )}
  </div>
);

const renderMultipleChoiceAnswer = (answer: ResultsUserAnswer, isCorrect: boolean, isAllowViewCorrectAnswers: boolean): JSX.Element => {
  const { question } = answer;
  const correctOptions = question.options.filter((opt) => opt.isCorrect);

  if (question.type === 'MULTIPLE_CHOICE_SINGLE') {
    const selectedOption = question.options.find((opt) => opt.id === answer.answer);
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">Your Answer:</div>
        <div className="text-sm text-muted-foreground">
          {selectedOption ? <OptionDetail option={selectedOption} /> : 'No answer'}
        </div>
        {!isCorrect && isAllowViewCorrectAnswers && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-green-600">Correct Answer:</div>
            {correctOptions.map((opt) => (
              <div key={opt.id} className="text-sm text-green-600">
                <OptionDetail option={opt} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'MULTIPLE_CHOICE_MULTIPLE') {
    try {
      const selectedIds = JSON.parse(answer.answer) as string[];
      const selectedOptions = question.options.filter((opt) => selectedIds.includes(opt.id));
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Your Answer:</div>
          <div className="text-sm text-muted-foreground space-y-2">
            {selectedOptions.length > 0
              ? selectedOptions.map((opt) => (
                  <div key={opt.id}>
                    <OptionDetail option={opt} />
                  </div>
                ))
              : 'No answer'}
          </div>
          {!isCorrect && isAllowViewCorrectAnswers && (
            <div className="space-y-1 mt-3">
              <div className="text-sm font-medium text-green-600">Correct Answer:</div>
              <div className="space-y-2">
                {correctOptions.map((opt) => (
                  <div key={opt.id} className="text-sm text-green-600">
                    <OptionDetail option={opt} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch {
      return <div className="text-sm text-muted-foreground">Invalid answer format</div>;
    }
  }
  return <div>Unsupported question type</div>;
};

const renderTextAnswer = (answer: ResultsUserAnswer, isCorrect: boolean, isAllowViewCorrectAnswers: boolean): JSX.Element => {
  const { question } = answer;
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Your Answer:</div>
      <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md whitespace-pre-wrap">
        {answer.answer || 'No answer provided'}
      </div>
      {!isCorrect && isAllowViewCorrectAnswers && question.type === 'SHORT_ANSWER' && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-green-600">Possible Correct Answers:</div>
          <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/50 p-2 rounded-md">
            {question.shortAnswers && question.shortAnswers.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {question.shortAnswers.map((ans, idx) => (
                  <li key={idx}>{typeof ans === 'string' ? ans : ans.value}</li>
                ))}
              </ul>
            ) : (
              'No correct answers provided.'
            )}
          </div>
        </div>
      )}
      {!isCorrect && isAllowViewCorrectAnswers && question.type === 'LONG_ANSWER' && (
        <div className="text-sm text-amber-600">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          This answer requires manual grading.
        </div>
      )}
    </div>
  );
};

interface TryoutResultsPageProps {
  params: Promise<{
    id: string;
    attemptId: string;
  }>;
}

export default async function TryoutResultsPage({ params }: TryoutResultsPageProps) {
  const { id, attemptId } = await params;

  try {
    const attempt = await api.tryout.getAttemptResults({ attemptId });

    if (!attempt) {
      redirect(`/machining/tryouts/${id}`);
    }

    const isDisabled = !attempt.tryout.allowMultipleAttempts;
    const scorePercentage = (attempt.score / attempt.maxScore) * 100;
    const duration = attempt.endedAt
      ? new Date(attempt.endedAt).getTime() - new Date(attempt.startedAt).getTime()
      : 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/machining/tryouts/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Results Summary */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {scorePercentage >= 60 ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <AlertCircle className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-2xl">Tryout Completed!</CardTitle>
            <p className="text-muted-foreground">{attempt.tryout.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
                {Math.round(scorePercentage * 100) / 100}%
              </div>
              <div className="text-muted-foreground">
                {attempt.score} out of {attempt.maxScore} points
              </div>
              <Badge variant={getScoreBadgeVariant(scorePercentage)} className="text-sm">
                {getScoreLabel(scorePercentage)}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={scorePercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold">{attempt.answers.length}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold">
                  {attempt.answers.filter((a) => a.points > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-semibold">
                  {duration > 0 ? `${Math.round(duration / 60000)}m` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            {/* Attempt Info */}
            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Started: {format(new Date(attempt.startedAt), 'PPp')}</span>
              </div>
              {attempt.endedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed: {format(new Date(attempt.endedAt), 'PPp')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {attempt.answers.map((answer, index) => {
              const { question } = answer;
              const isCorrect = answer.points > 0;
              const isAllowViewCorrectAnswers = attempt.tryout.allowViewCorrectAnswers;

              return (
                <div key={answer.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="border rounded-lg p-4 space-y-4 bg-background">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Question {index + 1}</span>
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{question.question}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div
                          className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {answer.points}/{question.points}
                        </div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>

                    {question.images && question.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {question.images.map((imgUrl) => (
                          <Image
                            key={imgUrl}
                            src={imgUrl}
                            alt="Question attachment"
                            width={128}
                            height={128}
                            className="h-32 w-auto rounded-md border object-contain"
                          />
                        ))}
                      </div>
                    )}

                    {(question.type === 'MULTIPLE_CHOICE_SINGLE' ||
                      question.type === 'MULTIPLE_CHOICE_MULTIPLE') &&
                      renderMultipleChoiceAnswer(answer, isCorrect, isAllowViewCorrectAnswers)}

                    {(question.type === 'SHORT_ANSWER' || question.type === 'LONG_ANSWER') &&
                      renderTextAnswer(answer, isCorrect, isAllowViewCorrectAnswers)}
                  </div>

                  {question.explanation && (
                    <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                      <p className="text-sm font-medium text-blue-900 mb-2">Explanation:</p>
                      <p className="text-sm text-blue-800">{question.explanation}</p>

                      {/* Add this section for explanation images */}
                      {question.explanationImages && question.explanationImages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {question.explanationImages.map((imgUrl) => (
                            <MotionImageDialog
                              key={imgUrl}
                              layoutId={imgUrl + 'explanation'}
                              width={1000}
                              height={1000}
                              src={imgUrl}
                              alt="Explanation image"
                              className="h-20 w-20 rounded-md border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {!isDisabled && (
                <Button asChild className="flex-1" disabled={isDisabled}>
                  <Link
                    href={`/machining/tryouts/${id}`}
                    className={cn(isDisabled ? 'pointer-events-none opacity-50' : '')}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="flex-1">
                <Link href="/machining/tryouts">View All Tryouts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading results:', error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Results Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The results you&apos;re looking for don&apos;t exist or you don&apos;t have access to
              them.
            </p>
            <Button asChild>
              <Link href={`/machining/tryouts/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tryout
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export const metadata = {
  title: 'Tryout Results',
};
