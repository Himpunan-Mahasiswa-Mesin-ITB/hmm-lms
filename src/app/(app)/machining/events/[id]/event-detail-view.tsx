import { formatInTimeZone } from 'date-fns-tz';
import { CalendarDays, Clock, MapPin, User, GraduationCap, Globe } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { TIMEZONE } from '~/constants/constants';
import { type RouterOutputs } from '~/trpc/react';

type EventDetail = NonNullable<RouterOutputs['event']['getEventById']>;

interface EventDetailViewProps {
  event: EventDetail;
}

export default function EventDetailView({ event }: EventDetailViewProps) {
  const startDate = event.start;
  const endDate = event.end;

  const getEventScope = () => {
    if (event.course) return { label: 'Course Event', icon: GraduationCap };
    if (event.userId) return { label: 'Personal Event', icon: User };
    return { label: 'Global Event', icon: Globe };
  };

  const scope = getEventScope();
  const ScopeIcon = scope.icon;

  const timeline = event.timeline as Array<{
    time: string;
    title: string;
    description?: string;
  }> | null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className={`border-accent border-l-4 border-y-0 border-r-0`}>
        <CardHeader>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ScopeIcon className="h-4 w-4" />
              <span className="text-sm">{scope.label}</span>
              {event.course && (
                <>
                  <span>•</span>
                  <span className="text-sm">{event.course.title}</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {event.description ? (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  No description available for this event
                </p>
              </CardContent>
            </Card>
          )}

          {timeline && timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>{/* Your timeline rendering logic would go here */}</CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-4">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Date & Time</p>
                  <p className="text-muted-foreground flex flex-col gap-2">
                    {event.hideEventTime ? (
                      <>
                        <span>
                          {formatInTimeZone(startDate, TIMEZONE, 'EEEE, MMM d, yyyy')} (start)
                        </span>
                        <span>
                          {formatInTimeZone(endDate, TIMEZONE, 'EEEE, MMM d, yyyy')} (end)
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {formatInTimeZone(startDate, TIMEZONE, 'EEEE, MMM d, yyyy, HH:mm')} (start)
                        </span>
                        <span>
                          {formatInTimeZone(endDate, TIMEZONE, 'EEEE, MMM d, yyyy, HH:mm')} (end)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {event.location && (
                <>
                  <Separator />
                  <div className="flex gap-4">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                </>
              )}

              {event.rsvpDeadline && (
                <>
                  <Separator />
                  <div className="flex gap-4">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">RSVP Before</p>
                      <p className="text-muted-foreground">
                        {formatInTimeZone(event.rsvpDeadline, TIMEZONE, 'EEEE, MMM d, yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex gap-4 items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.createdBy.image ?? undefined} />
                  <AvatarFallback>{event.createdBy.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">Created by</p>
                  <p className="text-muted-foreground">{event.createdBy.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
