// ~/app/admin/tryouts/_components/tryout-questions.tsx
'use client';

import { QuestionType } from '~/types/enums';
import { CheckCircle, Circle, FileText, MessageSquare } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import type { RouterOutputs } from '~/trpc/react';

type Question = RouterOutputs['tryout']['getDetailedById']['questions'][number];

interface TryoutQuestionsProps {
  questions: Question[];
}

export default function TryoutQuestions({ questions }: TryoutQuestionsProps) {
  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        return <Circle className="w-4 h-4" />;
      case QuestionType.SHORT_ANSWER:
        return <MessageSquare className="w-4 h-4" />;
      case QuestionType.LONG_ANSWER:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
        return 'Single Choice';
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        return 'Multiple Choice';
      case QuestionType.SHORT_ANSWER:
        return 'Short Answer';
      case QuestionType.LONG_ANSWER:
        return 'Long Answer';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions ({questions.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Q{index + 1}</Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getQuestionTypeIcon(question.type)}
                  {getQuestionTypeLabel(question.type)}
                </Badge>
                <Badge variant="outline">{question.points} pts</Badge>
                {question.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </div>

            <div className="pl-4">
              <p className="font-medium mb-3">{question.question}</p>

              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        option.isCorrect
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {String.fromCharCode(65 + optionIndex)}
                        </Badge>
                        {option.isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{option.text}</p>
                        {option.isCorrect && option.explanation && (
                          <p className="text-xs text-green-700 dark:text-green-400 mt-2 italic">
                            Explanation: {option.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {index < questions.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
