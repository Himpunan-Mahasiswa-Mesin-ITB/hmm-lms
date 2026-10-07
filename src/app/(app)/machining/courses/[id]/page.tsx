import { api } from '~/trpc/server';
import { Badge } from '~/components/ui/badge';
import {
  ClipboardList,
  Users,
  CheckCircle,
  Crown,
  GraduationCap,
} from 'lucide-react';
import EnrollButton from '../enroll-button';
import CoursePreview from '../course-preview';
import UnenrollButton from './unenroll-button';
import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import CourseContentClient from './client';

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailedCoursePage({ params }: CoursePageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseById({ id });

    if (!course) {
      notFound();
    }

    const canAccessContent = course.isEnrolled;

    if (!canAccessContent) {
      return (
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-xl border bg-gradient-to-r from-secondary/70 to-secondary/30 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {course.title}
                </h1>
                {course.lecturers && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4 text-foreground/70 shrink-0" />
                    <span>{course.lecturers}</span>
                  </p>
                )}
                {course.description && (
                  <p className="text-muted-foreground mt-2">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course._count.members} students
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" />
                    {course._count.tryout} tryouts
                  </Badge>
                  <Badge variant="outline">
                    {course.classCode}
                  </Badge>
                  <Badge variant="outline">
                    {course.type.charAt(0) + course.type.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>
              <div className="shrink-0">
                <EnrollButton courseId={course.id} courseName={course.title} />
              </div>
            </div>
          </div>
          <CoursePreview course={course} />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-border/80 bg-gradient-to-r from-background to-primary/5 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {course.isAdmin ? (
                  <>
                    <Crown className="h-5 w-5 text-primary" />
                    <Badge variant="default">Admin Access</Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <Badge variant="default" className="bg-success hover:bg-success/90">Enrolled</Badge>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{course.title}</h1>
              {course.lecturers && (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-foreground/70 shrink-0" />
                  <span>{course.lecturers}</span>
                </p>
              )}
              {course.description && (
                <p className="mt-2 max-w-3xl text-foreground/80">{course.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course._count.members} students
                </Badge>
                <Badge variant="outline" className="border-border/80 bg-background/80 text-foreground flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" />
                  {course._count.tryout} tryouts
                </Badge>
                <Badge variant="outline" className="border-border/80 bg-background/80 text-foreground">{course.classCode}</Badge>
                <Badge variant="outline" className="border-border/80 bg-background/80 text-foreground"> {course.type.charAt(0) + course.type.slice(1).toLowerCase()}</Badge>
              </div>
            </div>
            <div className="shrink-0">
              {course.isEnrolled && !course.isAdmin && (
                <UnenrollButton courseId={course.id} courseName={course.title} />
              )}
            </div>
          </div>
        </section>

        <CourseContentClient initialCourseData={course} courseId={id} />
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      notFound();
    }
    console.error(error);
    return <div>An unexpected error occurred. Please try again later.</div>
  }
}

export async function generateMetadata({ params }: CoursePageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseById({ id });

    if (!course) {
      return {
        title: 'Course Not Found',
      };
    }

    return {
      title: `${course.title} - Course`,
      description: course.description ?? `Learn about ${course.title}`,
    };
  } catch {
    return {
      title: 'Course Not Found',
    };
  }
}
