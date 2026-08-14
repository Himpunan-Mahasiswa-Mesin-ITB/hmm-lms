'use client';

import { PresenceStatus, ApprovalStatus, type RSVPStatus } from '@prisma/client';
import cn from 'cnfast';
import { isAfter, isBefore } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  CalendarOff,
  CircleX,
  User,
  CircleEllipsis,
  ThumbsDown,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button, buttonVariants } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Separator } from '~/components/ui/separator';
import { TIMEZONE } from '~/constants/constants';
import { api } from '~/trpc/react';
// import { Label } from '~/components/ui/label';
// import { Textarea } from '~/components/ui/textarea';

const RSVP_RESPONSE_TEXT: Record<RSVPStatus, string> = {
  YES: 'Will Attend',
  PERMIT: 'Attending with Notice',
  NO: 'Unable to Attend',
  MAYBE: 'You might be attend',
};

const PRESENCE_STATUS_UI: Record<
  PresenceStatus,
  { text: string; icon: React.ElementType; color: string; textColor: string }
> = {
  [PresenceStatus.PRESENT]: {
    text: 'Checked in',
    icon: CheckCircle,
    color: 'bg-green-600',
    textColor: 'text-green-600',
  },
  [PresenceStatus.PENDING_APPROVAL]: {
    text: 'Pending Approval',
    icon: CircleEllipsis,
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
  },
  [PresenceStatus.ABSENT]: {
    text: 'Marked as Absent',
    icon: ThumbsDown,
    color: 'bg-destructive',
    textColor: 'text-destructive',
  },
  [PresenceStatus.LATE]: {
    text: 'Checked in (Late)',
    icon: Clock,
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
  },
  [PresenceStatus.EXCUSED]: {
    text: 'You were excused',
    icon: User,
    color: 'bg-primary',
    textColor: 'text-primary',
  },
  [PresenceStatus.REJECTED]: {
    text: 'Attendance Rejected',
    icon: CircleX,
    color: 'bg-destructive',
    textColor: 'text-destructive',
  },
};

export function DashboardCalendar() {
  const [date, setDate] = React.useState<Date>(toZonedTime(new Date(), TIMEZONE));
  const [selectedDate, setSelectedDate] = React.useState<Date>(toZonedTime(new Date(), TIMEZONE));

  const utils = api.useUtils();

  // get machining events for the current month
  const { data: calendarEvents } = api.studentDashboard.getCalendarMachiningEvents.useQuery({
    month: date.getMonth(),
    year: date.getFullYear(),
  });

  // get machining events for selected date
  const { data: dayEvents, isLoading: dayEventsLoading } =
    api.studentDashboard.getMachiningEventsForDate.useQuery({
      date: selectedDate,
    });

  // get machining forms for the current month
  const { data: calendarForms } = api.studentDashboard.getCalendarMachiningForms.useQuery({
    month: date.getMonth(),
    year: date.getFullYear(),
  });
  // get machining forms for selected date
  const { data: dayForms, isLoading: dayFormsLoading } =
    api.studentDashboard.getMachiningFormsForDate.useQuery({
      date: selectedDate,
    });

  // Attendance mutation
  const attendanceMutation = api.event.recordPresence.useMutation({
    onSuccess: () => {
      toast.success('Attendance recorded successfully');
      void utils.studentDashboard.getMachiningEventsForDate.invalidate();
      void utils.studentDashboard.getCalendarMachiningEvents.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get dates that have events
  const eventDates = React.useMemo(() => {
    if (!calendarEvents) return [];
    return calendarEvents.map((event) => toZonedTime(new Date(event.start), TIMEZONE));
  }, [calendarEvents]);

  // Get dates that have forms
  const formDates = React.useMemo(() => {
    if (!calendarForms) return [];
    return calendarForms
      .map((form) => {
        if (!form.start) return null;
        return toZonedTime(new Date(form.start), TIMEZONE);
      })
      .filter((date) => date !== null);
  }, [calendarForms]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleCheckIn = (eventId: string) => {
    attendanceMutation.mutate({ eventId });
  };

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="pt-5 flex flex-col overflow-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          onMonthChange={setDate}
          modifiers={{
            hasEvent: eventDates,
            hasForm: formDates,
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              textDecorationColor: 'hsl(var(--primary))',
            },
            hasForm: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              textDecorationColor: 'hsl(var(--primary))',
            },
          }}
          className="mx-auto w-full rounded-md border-0"
        />

        <Separator className="my-4" />

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold tracking-tight">
            {formatInTimeZone(selectedDate, TIMEZONE, 'd MMMM yyyy')}
          </h3>

          {dayEventsLoading ? (
            <p className="text-muted-foreground text-sm">Loading events...</p>
          ) : dayEvents && dayEvents.length > 0 ? (
            <div className="space-y-2">
              {dayEvents.map((event) => {
                const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
                const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);
                const currentDate = toZonedTime(new Date(), TIMEZONE);
                const Icon =
                  PRESENCE_STATUS_UI[event.userPresence?.status ?? PresenceStatus.PENDING_APPROVAL]
                    .icon;

                // check-in available 1 hour before event start until event end
                const isCheckInAvailable =
                  currentDate >=
                    toZonedTime(new Date(eventStart.getTime() - 60 * 60 * 1000), TIMEZONE) &&
                  currentDate <= eventEnd;

                return (
                  <Popover key={event.id}>
                    <PopoverTrigger asChild>
                      <button className="border-border/70 bg-background/70 hover:bg-accent/40 w-full rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm leading-5 font-semibold">
                              {event.title}
                            </p>
                            {!event.hideEventTime && (
                              <p className="text-muted-foreground text-[11px]">
                                {formatInTimeZone(eventStart, TIMEZONE, 'HH:mm')} -{' '}
                                {formatInTimeZone(eventEnd, TIMEZONE, 'HH:mm')}
                              </p>
                            )}
                          </div>
                          {event.userRsvp && (
                            <Badge
                              variant={event.userRsvp.status === 'YES' ? 'default' : 'secondary'}
                              className="ml-2 text-xs"
                            >
                              {event.userRsvp.status === 'YES'
                                ? 'Will Attend'
                                : event.userRsvp.status === 'PERMIT'
                                  ? `Attend With Notice`
                                  : event.userRsvp.status === 'NO'
                                    ? `Won't Attend`
                                    : 'Maybe Attend'}
                            </Badge>
                          )}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[min(20rem,calc(100vw-2rem))] **:text-xs"
                      align="end"
                    >
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold line-clamp-1">{event.title}</h4>
                          {event.course && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {event.course.classCode}
                            </Badge>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                        )}

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="text-muted-foreground h-4 w-4" />
                            <span>
                              {event.hideEventTime
                                ? formatInTimeZone(eventStart, TIMEZONE, 'MMMM d yyyy')
                                : formatInTimeZone(eventStart, TIMEZONE, 'MMMM d yyyy,  HH:mm')}{' '}
                              (Start)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarOff className="text-muted-foreground h-4 w-4" />
                            <span>
                              {event.hideEventTime
                                ? formatInTimeZone(eventEnd, TIMEZONE, 'MMMM d yyyy')
                                : formatInTimeZone(eventEnd, TIMEZONE, 'MMMM d yyyy,  HH:mm')} (End)
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="text-muted-foreground h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.rsvpCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="text-muted-foreground h-4 w-4" />
                              <span>{event.rsvpCount} attending</span>
                            </div>
                          )}

                          {event.userPresence && (
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`h-4 w-4 ${PRESENCE_STATUS_UI[event.userPresence.status].textColor}`}
                              />
                              <span
                                className={PRESENCE_STATUS_UI[event.userPresence.status].textColor}
                              >
                                {PRESENCE_STATUS_UI[event.userPresence.status].text}
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* RSVP Section */}
                        {event.eventMode !== 'BASIC' && event.eventMode !== 'ATTENDANCE_ONLY' && (
                          <div className="space-y-2">
                             <p className="text-sm font-medium">RSVP Status:</p>
                            {event.userRsvp && (
                              <div className="flex flex-col gap-1">
                                <div className="p-3 bg-accent text-accent-foreground rounded-md text-sm font-medium">
                                  {RSVP_RESPONSE_TEXT[event.userRsvp.status]}
                                  {event.userRsvp.approvalStatus === ApprovalStatus.PENDING &&
                                    ' (Pending Approval)'}
                                  {event.userRsvp.approvalStatus === ApprovalStatus.REJECTED &&
                                    ' (Not Approved)'}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Attendance Section */}
                        {event.eventMode !== 'BASIC' &&
                          event.eventMode !== 'RSVP_ONLY' &&
                          !event.userPresence && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Attendance:</p>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleCheckIn(event.id)}
                                disabled={attendanceMutation.isPending || !isCheckInAvailable}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Check In
                              </Button>
                              <p className="text-muted-foreground text-center text-xs">
                                Available 1 hour before event start
                              </p>
                            </div>
                          )}

                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/machining/events/${event.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No events today</p>
          )}

          <Separator className="my-4" />

          {dayFormsLoading ? (
            <p className="text-muted-foreground text-sm">Loading tasks...</p>
          ) : dayForms && dayForms.length > 0 ? (
            <div className="space-y-2">
              {dayForms.map((form) => {
                const formStart = form.start ? toZonedTime(new Date(form.start), TIMEZONE) : null;
                const formEnd = form.end ? toZonedTime(new Date(form.end), TIMEZONE) : null;
                const currentDate = toZonedTime(new Date(), TIMEZONE);
                const isBeforeForm = formStart && isBefore(currentDate, formStart);
                const isAfterForm = formEnd && isAfter(currentDate, formEnd);
                const isDisabled =
                  isBeforeForm || isAfterForm || !form.isPublished || !form.isActive;

                return (
                  <Popover key={form.id}>
                    <PopoverTrigger asChild>
                      <button className="border-border/70 bg-background/70 hover:bg-accent/40 w-full rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm leading-5 font-semibold">{form.title}</p>
                          {formEnd && (
                            <span className="text-muted-foreground text-[11px]">
                              Due {formatInTimeZone(formEnd, TIMEZONE, 'MMM d, yyyy')} at{' '}
                              {formatInTimeZone(formEnd, TIMEZONE, 'HH:mm')}
                            </span>
                          )}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[min(20rem,calc(100vw-2rem))] **:text-xs"
                      align="end"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold line-clamp-1">{form.title}</h4>
                          <Badge variant="default" className="text-xs">
                            Form
                          </Badge>
                        </div>

                        {form.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2">{form.description}</p>
                        )}

                        <div className="space-y-2 text-sm">
                          {formStart && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="text-muted-foreground h-4 w-4" />
                              <span>
                                {formatInTimeZone(formStart, TIMEZONE, 'MMMM d yyyy, HH:mm')}{' '}
                                (Start)
                              </span>
                            </div>
                          )}
                          {formEnd && (
                            <div className="flex items-center gap-2">
                              <CalendarOff className="text-muted-foreground h-4 w-4" />
                              <span>
                                {formatInTimeZone(formEnd, TIMEZONE, 'MMMM d yyyy, HH:mm')} (End)
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <Button asChild>
                          <Link
                            href={`/machining/forms/${form.id}`}
                            className={buttonVariants({
                              variant: 'ghost',
                              className: cn(
                                'w-full',
                                isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                              ),
                              size: 'sm',
                            })}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {!form.isActive
                              ? 'Form Inactive'
                              : !form.isPublished
                                ? 'Form Unavailable'
                                : isBeforeForm
                                  ? 'Not Started'
                                  : isAfterForm
                                    ? 'Form Ended'
                                    : 'Fill Form'}
                          </Link>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tasks today</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/machining/events">
            View all events
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
