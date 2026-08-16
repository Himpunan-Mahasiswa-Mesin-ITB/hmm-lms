'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventMode, type RSVPStatus, ApprovalStatus, PresenceStatus } from '@prisma/client';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import {
  BellRing,
  Check,
  ThumbsUp,
  ThumbsDown,
  CircleEllipsis,
  Loader2,
  LogIn,
  CircleX,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { DateTimePicker } from '~/components/ui/date-time-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { TIMEZONE } from '~/constants/constants';
import { eventRSVPResponseMachiningSchema, type EventRSVPResponseMachining } from '~/lib/schema/event';
import { api, type RouterOutputs } from '~/trpc/react';

type EventDetail = NonNullable<RouterOutputs['event']['getEventById']>;

const RSVP_RESPONSE_TEXT: Record<RSVPStatus, string> = {
  YES: 'Will Attend',
  PERMIT: 'Attending with Notice',
  NO: 'Unable to Attend',
  MAYBE: 'You might be attend',
};

const PRESENCE_STATUS_UI: Record<
  PresenceStatus,
  { text: string; icon: React.ElementType; color: string }
> = {
  [PresenceStatus.PRESENT]: { text: 'You were present', icon: ThumbsUp, color: 'bg-green-600' },
  [PresenceStatus.PENDING_APPROVAL]: {
    text: 'Pending Approval',
    icon: CircleEllipsis,
    color: 'bg-amber-500',
  },
  [PresenceStatus.ABSENT]: { text: 'Marked as Absent', icon: ThumbsDown, color: 'bg-destructive' },
  [PresenceStatus.LATE]: { text: 'You were late', icon: Clock, color: 'bg-amber-500' },
  [PresenceStatus.EXCUSED]: { text: 'You were excused', icon: User, color: 'bg-primary' },
  [PresenceStatus.REJECTED]: {
    text: 'Attendance Rejected',
    icon: CircleX,
    color: 'bg-destructive',
  },
};

export default function EventActions({ event }: { event: EventDetail }) {
  const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
  const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);
  const currentDate = toZonedTime(new Date(), TIMEZONE);
  const router = useRouter();

  const showRsvp =
    event.eventMode === EventMode.RSVP_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const showAttendance =
    event.eventMode === EventMode.ATTENDANCE_ONLY ||
    event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const Icon =
    PRESENCE_STATUS_UI[event.userPresence?.status ?? PresenceStatus.PENDING_APPROVAL].icon;

  const form = useForm<EventRSVPResponseMachining>({
    resolver: zodResolver(eventRSVPResponseMachiningSchema),
    mode: 'onChange',
    defaultValues: {
      rsvpStatus: (event.userRsvp?.status as RSVPStatus) || undefined,
      idLine: event.userRsvp?.idLine || '',
      reason: event.userRsvp?.reason || '',
      proofUrl: event.userRsvp?.proofUrl || '',
      leavingTime: event.userRsvp?.leavingTime ? new Date(event.userRsvp.leavingTime) : undefined,
      catchingUpTime: event.userRsvp?.catchingUpTime ? new Date(event.userRsvp.catchingUpTime) : undefined,
      notes: event.userRsvp?.notes || '',
    },
  });

  const rsvpStatus = form.watch('rsvpStatus');

  const { mutate: respond, isPending: isResponding } = api.event.respondToRsvpMachining.useMutation({
    onSuccess: () => {
      toast.success('Your RSVP has been recorded!');
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: checkIn, isPending: isCheckingIn } = api.event.recordPresence.useMutation({
    onSuccess: () => {
      toast.success('Successfully checked in!');
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const setStatus = (status: 'YES' | 'PERMIT' | 'NO' | 'MAYBE') => {
    form.setValue('rsvpStatus', status, { shouldValidate: true, shouldDirty: true });

    if (status === 'YES' || status === 'MAYBE') {
      form.setValue('reason', '');
      form.setValue('proofUrl', '');
      form.setValue('leavingTime', undefined);
      form.setValue('catchingUpTime', undefined);
      form.clearErrors(['reason', 'proofUrl', 'leavingTime', 'catchingUpTime']);
    } else if (status === 'NO') {
      form.setValue('leavingTime', undefined);
      form.setValue('catchingUpTime', undefined);
      form.clearErrors(['leavingTime', 'catchingUpTime']);
    }

    form.trigger();
  };

  const onSubmit = (data: EventRSVPResponseMachining) => {
    if (!data.rsvpStatus) return;
    respond({
      eventId: event.id,
      status: data.rsvpStatus,
      notes: data.notes,
      idLine: data.idLine,
      reason: data.reason,
      proofUrl: data.proofUrl,
      leavingTime: data.leavingTime,
      catchingUpTime: data.catchingUpTime,
    });
  };

  const isCheckInAvailable =
    currentDate >= toZonedTime(new Date(eventStart.getTime() - 60 * 60 * 1000), TIMEZONE) &&
    currentDate <= eventEnd;
  const isRsvpAvailable = event.rsvpDeadline
    ? currentDate <= toZonedTime(new Date(event.rsvpDeadline), TIMEZONE)
    : currentDate <= eventStart;

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 pb-6">
      {showRsvp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" /> RSVP
            </CardTitle>
            <CardDescription>{event.rsvpDeadline ? '' : 'No RSVP deadline'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.userRsvp ? (
              <div className="space-y-3">
                <div className="p-3 bg-accent text-accent-foreground rounded-md text-sm font-medium">
                  {RSVP_RESPONSE_TEXT[event.userRsvp.status]}
                  {event.userRsvp.approvalStatus === ApprovalStatus.PENDING &&
                    ' (Pending Approval)'}
                  {event.userRsvp.approvalStatus === ApprovalStatus.REJECTED && ' (Not Approved)'}
                  {(event.userRsvp.status === 'PERMIT' || event.userRsvp.status === 'NO') && event.userRsvp.approvalStatus === ApprovalStatus.APPROVED && ' (Approved)'}
                </div>
                {(event.userRsvp.status === 'PERMIT' || event.userRsvp.status === 'NO') && (
                  <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                    {event.userRsvp.idLine && (
                      <div>
                        <span className="font-medium">ID Line:</span> {event.userRsvp.idLine}
                      </div>
                    )}
                    {event.userRsvp.reason && (
                      <div>
                        <span className="font-medium">Alasan:</span> {event.userRsvp.reason}
                      </div>
                    )}
                    {event.userRsvp.proofUrl && (
                      <div>
                        <span className="font-medium">Bukti:</span>{' '}
                        <a
                          href={event.userRsvp.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Lihat Bukti
                        </a>
                      </div>
                    )}
                    {event.userRsvp.leavingTime && (
                      <div>
                        <span className="font-medium">Jam Meninggalkan:</span>{' '}
                        {formatInTimeZone(event.userRsvp.leavingTime, TIMEZONE, 'HH:mm')}
                      </div>
                    )}
                    {event.userRsvp.catchingUpTime && (
                      <div>
                        <span className="font-medium">Jam Menyusul:</span>{' '}
                        {formatInTimeZone(event.userRsvp.catchingUpTime, TIMEZONE, 'HH:mm')}
                      </div>
                    )}
                    {event.userRsvp.notes && (
                      <div>
                        <span className="font-medium">Catatan:</span> {event.userRsvp.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rsvpStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Status RSVP</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={() => setStatus('YES')}
                              variant={field.value === 'YES' ? 'default' : 'outline'}
                              className="flex-1"
                              disabled={isResponding || !isRsvpAvailable}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Hadir
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setStatus('NO')}
                              variant={field.value === 'NO' ? 'default' : 'outline'}
                              className="flex-1"
                              disabled={isResponding || !isRsvpAvailable}
                            >
                              <CircleX className="h-4 w-4 mr-2" /> Tidak Hadir
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setStatus('PERMIT')}
                              variant={field.value === 'PERMIT' ? 'default' : 'outline'}
                              className="flex-1"
                              disabled={isResponding || !isRsvpAvailable}
                            >
                              <CircleEllipsis className="h-4 w-4 mr-2" /> Menyusul/Meninggalkan
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(rsvpStatus === 'NO' || rsvpStatus === 'PERMIT') && (
                    <FormField
                      control={form.control}
                      name="idLine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Line</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan ID Line"
                              {...field}
                              disabled={isResponding || !isRsvpAvailable}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(rsvpStatus === 'NO' || rsvpStatus === 'PERMIT') && (
                    <>
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alasan</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={
                                  rsvpStatus === 'NO'
                                    ? 'Sertakan alasan tidak hadir'
                                    : 'Sertakan alasan menyusul/meninggalkan'
                                }
                                {...field}
                                disabled={isResponding || !isRsvpAvailable}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="proofUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link Bukti</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://..."
                                {...field}
                                disabled={isResponding || !isRsvpAvailable}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {rsvpStatus === 'PERMIT' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="leavingTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jam Meninggalkan</FormLabel>
                                <FormControl>
                                  <DateTimePicker
                                    value={field.value}
                                    onChange={(date) => {
                                      field.onChange(date)
                                      form.trigger()
                                    }}
                                    placeholder="Select date & time"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="catchingUpTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jam Menyusul</FormLabel>
                                <FormControl>
                                  <DateTimePicker
                                    value={field.value}
                                    onChange={(date) => {
                                      field.onChange(date)
                                      form.trigger()
                                    }}
                                    placeholder="Select date & time"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {rsvpStatus && (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isResponding || !isRsvpAvailable}
                    >
                      {isResponding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Confirm RSVP
                    </Button>
                  )}
                </form>
              </Form>
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
              <div
                className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md text-primary-foreground ${PRESENCE_STATUS_UI[event.userPresence.status].color}`}
              >
                <Icon className="h-4 w-4" />
                {PRESENCE_STATUS_UI[event.userPresence.status].text}
              </div>
            ) : (
              <Button
                onClick={() => checkIn({ eventId: event.id })}
                disabled={isCheckingIn || !isCheckInAvailable}
                className="w-full"
              >
                {isCheckingIn && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {!isCheckInAvailable && <CircleX className="h-4 w-4 mr-2" />}
                {isCheckInAvailable && !isCheckingIn && <LogIn className="h-4 w-4 mr-2" />}
                {isCheckingIn
                  ? 'Checking in...'
                  : isCheckInAvailable
                    ? 'Check-in Now'
                    : 'Check-in Not Available'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
