'use client';

import { ArrowRight, BookOpen, CalendarDays, Crown, Flame, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { api } from '~/trpc/react';

import { DashboardCalendar } from './dashboard-calendar';
import { DashboardChart } from './dashboard-chart';
import { ProfileProgressCard } from './profile-progress-card';

export function DashboardContent() {
  const { data: courses, isLoading: coursesLoading } =
    api.studentDashboard.getEnrolledCourses.useQuery();

  const { isLoading: statsLoading } = api.studentDashboard.getDashboardStats.useQuery();
  const { data: hallOfFame, isLoading: hallOfFameLoading } =
    api.studentDashboard.getWeeklyHallOfFame.useQuery({ limit: 3 });

  const { data: profileProgress, isLoading: profileProgressLoading } =
    api.profile.getCurrentUserProfileProgress.useQuery();

  if (coursesLoading || statsLoading || hallOfFameLoading || profileProgressLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 overflow-x-clip">
      <Card className="border-border/70 bg-card overflow-hidden shadow-sm">
        <div className="from-primary/15 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent to-transparent" />
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div className="space-y-3.5">
            <Badge variant="secondary" className="h-6 w-fit gap-1 px-2 text-[11px] font-medium">
              <Flame className="h-3.5 w-3.5" />
              Weekly Learning Focus
            </Badge>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Make progress with a clearer plan
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6 md:text-[15px]">
                Jump back into your active courses and keep your learning streak going this week.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/courses">Continue Learning</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/events">Upcoming Events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {profileProgress && profileProgress.length > 0 && (
        <ProfileProgressCard profileProgress={profileProgress} />
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-8">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl tracking-tight">Continue Your Courses</CardTitle>
                  <CardDescription className="text-sm">
                    Your active classes in one clean list
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/courses">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses && courses.length > 0 ? (
                courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="border-border/70 bg-card hover:bg-accent/40 flex items-center justify-between gap-3 rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-[15px] leading-5 font-semibold">{course.title}</p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide">
                        <span>{course.classCode}</span>
                        <span aria-hidden>•</span>
                        <span>{course.videoCount} videos</span>
                        <span aria-hidden>•</span>
                        <span>{course.attachmentsCount} materials</span>
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
                  <h3 className="font-semibold">No courses yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Start learning by enrolling in your first course.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <DashboardChart />
        </div>

        <div className="min-w-0 space-y-6 xl:col-span-4 max-sm:pb-16">
          <Card className="border-border/60 bg-card/80 shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg tracking-tight">Hall of Fame</CardTitle>
                <Sparkles className="ml-auto h-4 w-4 text-fuchsia-500" />
              </div>
              <CardDescription className="text-xs tracking-[0.08em] uppercase">
                Top learners this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hallOfFame?.leaderboard.length ? (
                <>
                  {hallOfFame.leaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      className="border-border/60 bg-background/70 flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-semibold">
                          #{entry.rank} {entry.userName}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {Math.round(entry.weeklyDurationSeconds / 60)} mins this week
                        </p>
                      </div>
                      {entry.rank === 1 ? (
                        <Trophy className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CalendarDays className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                  ))}
                  <Button asChild className="w-full">
                    <Link href="/hall-of-fame">View full ranking</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No learning sessions this week yet. Be the first champion.
                </p>
              )}
            </CardContent>
          </Card>

          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="space-y-6 xl:col-span-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-105 w-full" />
        </div>
      </div>
    </div>
  );
}
