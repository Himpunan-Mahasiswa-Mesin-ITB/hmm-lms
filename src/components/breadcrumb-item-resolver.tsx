"use client";

import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

interface BreadcrumbItemResolverProps {
  path: string;
  index: number;
  pathNames: string[];
}

export default function BreadcrumbItemResolver({
  path,
  index,
  pathNames,
}: BreadcrumbItemResolverProps) {
  const previousPath = index > 0 ? pathNames[index - 1] : null;
  const normalizedPath = decodeURIComponent(path);

  const staticLabels: Record<string, string> = {
    dashboard: "Dashboard",
    "hall-of-fame": "Hall of Fame",
    courses: "Courses",
    tryouts: "Tryouts",
    events: "Events",
    announcements: "Announcements",
    scholarships: "Scholarships",
    loker: "M-Opportunity",
    forms: "Forms",
    settings: "Settings",
    profile: "Profile",
    admin: "Admin",
    responses: "Responses",
    preview: "Preview",
    edit: "Edit",
    attempt: "Attempt",
    results: "Results",
    competition: "Competition"
  };

  const toTitleCase = (value: string) =>
    value
      .replace(/-/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const isLikelyId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      normalizedPath,
    ) || /^c[a-z0-9]{8,}$/i.test(normalizedPath);

  // Check if this is a course ID
  const isCourseId = previousPath === "courses";
  const { data: course, isLoading: isLoadingCourse } = api.course.getCourseById.useQuery(
    { id: path },
    { enabled: isCourseId && isLikelyId },
  );

  // Check if this is an event ID
  const isEventId = previousPath === "events";
  const { data: event, isLoading: isLoadingEvent } = api.event.getEventById.useQuery(
    { id: path },
    { enabled: isEventId && isLikelyId },
  );

  // Check if this is a tryout ID
  const isTryoutId = previousPath === "tryouts";
  const { data: tryout, isLoading: isLoadingTryout } = api.tryout.getById.useQuery(
    { id: path },
    { enabled: isTryoutId && isLikelyId },
  );

  // Check if this is an announcement ID
  const isAnnouncementId = previousPath === "announcements";
  const { data: announcement, isLoading: isLoadingAnnouncement } =
    api.announcement.getById.useQuery(
      { id: path },
      { enabled: isAnnouncementId && isLikelyId },
    );

  // Check if this is a scholarship ID
  const isScholarshipId = previousPath === "scholarships";
  const { data: scholarship, isLoading: isLoadingScholarship } =
    api.scholarship.getPublicById.useQuery(
      { id: path },
      { enabled: isScholarshipId && isLikelyId },
    );

  // Check if this is a job vacancy ID
  const isJobVacancyId = previousPath === "loker";
  const { data: jobVacancy, isLoading: isLoadingJobVacancy } = api.loker.getById.useQuery(
    { id: path },
    { enabled: isJobVacancyId && isLikelyId },
  );

  // Check if this is a form ID
  const isFormId = previousPath === "forms";
  const { data: form, isLoading: isLoadingForm } = api.form.getById.useQuery(
    { id: path },
    { enabled: isFormId && isLikelyId },
  );

  if (isCourseId) {
    if (isLoadingCourse) return <Skeleton className="h-4 w-24" />;
    if (course) return <span>{course.title}</span>;
  }

  if (isEventId) {
    if (isLoadingEvent) return <Skeleton className="h-4 w-24" />;
    if (event) return <span>{event.title}</span>;
  }

  if (isTryoutId) {
    if (isLoadingTryout) return <Skeleton className="h-4 w-24" />;
    if (tryout) return <span>{tryout.title}</span>;
  }

  if (isAnnouncementId) {
    if (isLoadingAnnouncement) return <Skeleton className="h-4 w-24" />;
    if (announcement) return <span>{announcement.title}</span>;
  }

  if (isScholarshipId) {
    if (isLoadingScholarship) return <Skeleton className="h-4 w-24" />;
    if (scholarship) return <span>{scholarship.title}</span>;
  }

  if (isJobVacancyId) {
    if (isLoadingJobVacancy) return <Skeleton className="h-4 w-24" />;
    if (jobVacancy) return <span>{jobVacancy.title}</span>;
  }

  if (isFormId) {
    if (isLoadingForm) return <Skeleton className="h-4 w-24" />;
    if (form) return <span>{form.title}</span>;
  }

  if (previousPath === "attempt" && isLikelyId) {
    return <span>Current Attempt</span>;
  }

  if (previousPath === "results" && isLikelyId) {
    return <span>Attempt Results</span>;
  }

  const staticLabel = staticLabels[normalizedPath];
  if (staticLabel) {
    return <span>{staticLabel}</span>;
  }

  if (isLikelyId) {
    return <span>Details</span>;
  }

  return <span>{toTitleCase(normalizedPath)}</span>;
}
