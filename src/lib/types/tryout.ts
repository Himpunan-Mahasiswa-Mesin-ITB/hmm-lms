import type { QuestionOption, QuestionType } from "@prisma/client";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  order: number;
  required: boolean;
  options: QuestionOption[];
  images: string[]; // Array of image URLs
}

export interface Course {
  title: string;
  classCode: string;
}

export interface Tryout {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  isActive: boolean;
  questions: Question[];
  course: Course;
}

export interface UserAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  points: number;
  createdAt: Date;
  question: {
    id: string;
    type: QuestionType;
    question: string;
    points: number;
    options: QuestionOption[];
    images: string[]; // Array of image URLs
    shortAnswers?: Array<{
      value: string;
    }> | string[];
    explanation?: string | null;
  };
}

export interface UserAttempt {
  id: string;
  userId: string;
  tryoutId: string;
  score: number;
  maxScore: number;
  startedAt: Date;
  endedAt: Date | null;
  isCompleted: boolean;
  answers: UserAnswer[];
  tryout: {
    title: string;
    duration: number | null;
    questions: { id: string }[];
  };
}

// Separate interface for results with more detailed question info
export interface ResultsUserAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  points: number;
  createdAt: Date;
  question: {
    id: string;
    type: QuestionType;
    question: string;
    points: number;
    options: QuestionOption[];
    images: string[]; // Array of image URLs
    shortAnswers?: Array<{
      value: string;
    }> | string[];
    explanation?: string | null;
  };
}

export interface AttemptResults {
  id: string;
  userId: string;
  tryoutId: string;
  score: number;
  maxScore: number;
  startedAt: Date;
  endedAt: Date | null;
  isCompleted: boolean;
  tryout: {
    title: string;
    duration: number | null;
  };
  answers: ResultsUserAnswer[];
}
