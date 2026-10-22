'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { api, type RouterOutputs } from '~/trpc/react';
import { RSVPStatus, ApprovalStatus, PresenceStatus, EventMode } from '~/lib/types/prisma';
import { BellRing, Check, ThumbsUp, ThumbsDown, CircleEllipsis, Loader2, LogIn, CircleX, Clock, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { toZonedTime } from 'date-fns-tz';
import { TIMEZONE } from '~/constants/constants';

type EventDetail = NonNullable<RouterOutputs['event']['getEventById']>;

const RSVP_RESPONSE_TEXT: Record<RSVPStatus, string> = {
  YES: 'Will Attend',
  PERMIT: 'Attending with Notice',
  NO: 'Unable to Attend',
  MAYBE: 'You might be attend',
};

const PRESENCE_STATUS_UI: Record<PresenceStatus, { text: string; icon: React.ElementType; color: string }> = {
  [PresenceStatus.PRESENT]: { text: "You were present", icon: ThumbsUp, color: "bg-green-600" },
  [PresenceStatus.PENDING_APPROVAL]: { text: "Pending Approval", icon: CircleEllipsis, color: "bg-amber-500" },
  [PresenceStatus.ABSENT]: { text: "Marked as Absent", icon: ThumbsDown, color: "bg-destructive" },
  [PresenceStatus.LATE]: { text: "You were late", icon: Clock, color: "bg-amber-500" },
  [PresenceStatus.EXCUSED]: { text: "You were excused", icon: User, color: "bg-primary" },
  [PresenceStatus.REJECTED]: { text: "Attendance Rejected", icon: CircleX, color: "bg-destructive" },
};

export default function EventActions({ event }: { event: EventDetail }) {
  const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
  const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);
  const currentDate = toZonedTime(new Date(), TIMEZONE);
  const router = useRouter();
  const showRsvp = event.eventMode === EventMode.RSVP_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const showAttendance = event.eventMode === EventMode.ATTENDANCE_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const Icon = PRESENCE_STATUS_UI[event.userPresence?.status ?? PresenceStatus.PENDING_APPROVAL].icon;

  const { mutate: respond, isPending: isResponding } = api.event.respondToRsvp.useMutation({
    onSuccess: () => { toast.success("Your RSVP has been recorded!"); router.refresh(); },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: checkIn, isPending: isCheckingIn } = api.event.recordPresence.useMutation({
    onSuccess: () => { toast.success("Successfully checked in!"); router.refresh(); },
    onError: (err) => toast.error(err.message),
  });

  const handleRsvp = (status: RSVPStatus) => respond({ eventId: event.id, status });
  const isCheckInAvailable =
    currentDate >= toZonedTime(new Date(eventStart.getTime() - 60 * 60 * 1000), TIMEZONE) &&
    currentDate <= eventEnd;
  const isRsvpAvailable = event.rsvpDeadline
    ? currentDate <= toZonedTime(new Date(event.rsvpDeadline), TIMEZONE)
    : currentDate <= eventStart;

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
      {showRsvp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" /> RSVP
            </CardTitle>
            <CardDescription>
              {event.rsvpDeadline
                ? ``
                : 'No RSVP deadline'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.userRsvp ? (
              <div className="p-3 bg-accent text-accent-foreground rounded-md text-sm font-medium">
                {RSVP_RESPONSE_TEXT[event.userRsvp.status]}
                {event.userRsvp.approvalStatus === ApprovalStatus.PENDING && " (Pending Approval)"}
                {event.userRsvp.approvalStatus === ApprovalStatus.REJECTED && " (Not Approved)"}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleRsvp(RSVPStatus.YES)} disabled={isResponding || !isRsvpAvailable} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" /> Will Attend
                </Button>
                <Button onClick={() => handleRsvp(RSVPStatus.NO)} disabled={isResponding || !isRsvpAvailable} variant="outline" className="flex-1">
                  <CircleX className="h-4 w-4 mr-2" /> Won&apos;t Attend
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAttendance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" /> Attendance
            </CardTitle>
            <CardDescription>Check-in is available one hour before event start</CardDescription>
          </CardHeader>
          <CardContent>
            {event.userPresence ? (
              <div className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md text-primary-foreground ${PRESENCE_STATUS_UI[event.userPresence.status].color}`}>
                <Icon className="h-4 w-4" />
                {PRESENCE_STATUS_UI[event.userPresence.status].text}
              </div>
            ) : (
              <Button onClick={() => checkIn({ eventId: event.id })} disabled={isCheckingIn || !isCheckInAvailable} className="w-full">
                {isCheckingIn && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {!isCheckInAvailable && <CircleX className="h-4 w-4 mr-2" />}
                {isCheckInAvailable && !isCheckingIn && <LogIn className="h-4 w-4 mr-2" />}
                {isCheckingIn ? "Checking in..." : isCheckInAvailable ? "Check-in Now" : "Check-in Not Available"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
