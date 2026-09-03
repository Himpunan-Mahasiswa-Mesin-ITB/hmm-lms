"use client";

// import { useState } from "react";
import { format } from "date-fns";
import {
  // Bell,
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  // TrendingUp,
  // FileText,
  Award,
  MessageSquare,
  Activity,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
// import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import Link from "next/link";

export function DashboardContent() {
  // Quick stats queries
  const { data: dashboardStats, isLoading } = api.dashboard.getQuickStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity } = api.dashboard.getRecentActivity.useQuery();
  const { data: pendingActions } = api.dashboard.getPendingActions.useQuery();
  const { data: upcomingEvents } = api.dashboard.getUpcomingEvents.useQuery({ limit: 5 });
  const { data: systemAlerts } = api.dashboard.getSystemAlerts.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your platform today, {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Full Analytics
          </Link>
        </Button>
      </div>

      {/* System Alerts */}
      {systemAlerts && systemAlerts.length > 0 && (
        <div className="space-y-3">
          {systemAlerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === "error" ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{dashboardStats?.newUsersToday ?? 0}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeCourses ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.totalCourses ?? 0} total courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.todayActivity ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Learning sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingActions?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions Card */}
        <Card className="max-sm:w-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription>Items that need your immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions?.items.map((action, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={action.priority === "high" ? "destructive" : "secondary"}>
                        {action.type}
                      </Badge>
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <p className="text-xs text-muted-foreground">{action.time}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={action.link}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}

              {(!pendingActions?.items || pendingActions.items.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground">No pending actions at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Events scheduled for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent >
            <div className="space-y-4">
              {upcomingEvents?.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.start), "MMM dd, yyyy • HH:mm")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {event.location && (
                        <Badge variant="outline" className="text-xs">
                          {event.location}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {event.rsvpCount} RSVPs
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming events scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.user && (
                    <Badge variant="outline" className="text-xs">
                      {activity.user}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Courses
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Events
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/tryouts">
                  <Award className="h-4 w-4 mr-2" />
                  Manage Tryouts
                </Link>
              </Button>
              {/*<Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/resources">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Resources
                </Link>
              </Button>*/}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/announcements">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Announcement
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Quick overview of platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Engagement</span>
                <span className="text-sm text-muted-foreground">
                  {dashboardStats?.userEngagement ?? 0}%
                </span>
              </div>
              <Progress value={dashboardStats?.userEngagement ?? 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Course Completion</span>
                <span className="text-sm text-muted-foreground">
                  {dashboardStats?.courseCompletion ?? 0}%
                </span>
              </div>
              <Progress value={dashboardStats?.courseCompletion ?? 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Uptime</span>
                <iframe src="https://status.hmmitb.com/badge?theme=dark" width="250" height="30" style={{ colorScheme: "normal" }} ></iframe>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
