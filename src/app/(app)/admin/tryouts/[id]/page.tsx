import { Role } from '@prisma/client';
import { Edit, Users, Clock, BookOpen, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';

import TryoutStatistics from './analytics';
import TryoutAttempts from './attemp';
import TryoutQuestions from './question';

interface TryoutDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TryoutDetailsPage({ params }: TryoutDetailsPageProps) {
  const session = await auth();

  if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPERADMIN)) {
    redirect('/');
  }
  const { id } = await params;

  const tryout = await api.tryout.getDetailedById({ id });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{tryout.title}</h1>
            <p className="text-muted-foreground">
              {tryout.course.title} ({tryout.course.classCode})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={tryout.isActive ? 'default' : 'secondary'}>
            {tryout.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/tryouts/${tryout.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tryout._count.questions}</div>
            <p className="text-xs text-muted-foreground">
              {tryout.questions.reduce((sum, q) => sum + q.points, 0)} total points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tryout.statistics.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {tryout.statistics.completedAttempts} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tryout.statistics.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {tryout.statistics.completedAttempts > 0 ? 'From completed attempts' : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tryout.duration ? `${tryout.duration}m` : 'No limit'}
            </div>
            <p className="text-xs text-muted-foreground">Time allowed</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {tryout.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{tryout.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <TryoutStatistics tryout={tryout} />

      {/* Questions */}
      <TryoutQuestions questions={tryout.questions} />

      {/* Recent Attempts */}
      <TryoutAttempts attempts={tryout.attempts} />
    </div>
  );
}

export const metadata = {
  title: 'Tryout Details',
  description: 'View details of a specific tryout',
};
