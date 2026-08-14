import Link from 'next/link';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { CalendarDays, Clock, MapPin, CheckSquare, BellRing, Settings } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { type RouterOutputs } from '~/trpc/react';
import { EventMode } from '@prisma/client';
import GeometryBackground from '~/components/ui/background/geometry';
import { TIMEZONE } from '~/constants/constants';

interface EventItemProps {
  event: RouterOutputs['event']['getMachiningEvents'][number];
  href: string;
}

export default function EventItem({ event, href }: EventItemProps) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const currentDate = new Date()

  const isOngoing = startDate <= currentDate && endDate >= currentDate;

  const getEventScope = () => {
    return { label: 'Machining', icon: Settings };
  };

  const scope = getEventScope();
  const ScopeIcon = scope.icon;

  const showRsvp = event.eventMode === EventMode.RSVP_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const showAttendance = event.eventMode === EventMode.ATTENDANCE_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full group relative overflow-hidden">
        <GeometryBackground className='opacity-40' />
        <CardHeader className="pb-3 relative z-10">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {isOngoing && <Badge variant="secondary">Live</Badge>}
            {showRsvp && (
              <Badge variant="default" className="flex items-center gap-1">
                <BellRing className="h-3 w-3" /> RSVP
              </Badge>
            )}
            {showAttendance && (
              <Badge variant="outline" className="flex border-accent items-center gap-1">
                <CheckSquare className="h-3 w-3" /> Attendance
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm relative z-10">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">
              {formatInTimeZone(startDate, TIMEZONE, 'MMM d, yyyy')}
            </span>
          </div>
          {!event.allDay && !event.hideEventTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{formatInTimeZone(startDate, TIMEZONE, 'HH:mm')} - {formatInTimeZone(endDate, TIMEZONE, 'HH:mm')}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <ScopeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{scope.label}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
