'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PresenceStatus, RSVPStatus } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { Download, Users, CheckCircle, XCircle, Clock, FileText, TimerIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { TIMEZONE } from '~/constants/constants';
import { updateNoteSchema, type UpdateNoteForm } from '~/lib/schema/event';
import { api } from '~/trpc/react';

function UpdateNoteDialog({
  presenceId,
  currentNotes,
  onUpdate,
  isPending,
  type,
}: {
  presenceId: string;
  currentNotes: string | null;
  onUpdate: (data: { presenceId: string; notes: string; type: 'attendance' | 'rsvp' }) => void;
  isPending: boolean;
  type: 'attendance' | 'rsvp';
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateNoteForm>({
    resolver: zodResolver(updateNoteSchema),
    defaultValues: {
      notes: currentNotes || '',
    },
  });

  const handleSubmit = (values: UpdateNoteForm) => {
    onUpdate({ presenceId, notes: values.notes, type });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Notes</DialogTitle>
          <DialogDescription>Add or update notes for this attendance record.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter notes..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Notes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function EventAdminDashboard({ eventId }: { eventId: string }) {
  const { data, refetch } = api.event.getEventManagementData.useQuery({ eventId });

  const { mutate: updatePresence, isPending: isUpdatingPresence } =
    api.event.updatePresenceStatus.useMutation({
      onSuccess: async () => {
        toast.success('Presence status updated');
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  const { mutate: updateRSVPStatus, isPending: isUpdatingRSVP } =
    api.event.updateRSVPStatus.useMutation({
      onSuccess: async () => {
        toast.success('RSVP status updated');
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  const { mutate: updateRsvpApproval, isPending: isUpdatingApproval } =
    api.event.updateRsvpApproval.useMutation({
      onSuccess: async () => {
        toast.success('RSVP approval status updated');
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  const { mutate: updatePresenceNote, isPending: isUpdatingNote } =
    api.event.updatePresenceNote.useMutation({
      onSuccess: async () => {
        toast.success('Note updated successfully');
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  const { mutate: approveAllRsvps, isPending: isApprovingAll } =
    api.event.approveAllRsvps.useMutation({
      onSuccess: async () => {
        toast.success('All pending RSVPs approved successfully');
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  const { mutate: approveAllAttendances, isPending: isApprovingAllAttendances } =
    api.event.approveAllAttendances.useMutation({
      onSuccess: async () => {
        toast.success('All pending attendances approved successfully');
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data) return { totalRsvps: 0, yesRsvps: 0, totalPresence: 0, presentCount: 0 };

    const yesRsvps = data.rsvpResponses.filter((r) => r.status === 'YES').length;
    const presentCount = data.presenceRecords.filter(
      (p) => p.status === PresenceStatus.PRESENT || p.status === PresenceStatus.LATE,
    ).length;

    return {
      totalRsvps: data.rsvpResponses.length,
      yesRsvps,
      totalPresence: data.presenceRecords.length,
      presentCount,
    };
  }, [data]);

  const handleExportRsvps = () => {
    if (!data) return;

    const worksheetData = [
      [
        'Name',
        'NIM',
        'Status',
        'Approval Status',
        'Responded At',
        'Email',
        'ID Line',
        'Reason',
        'Proof URL',
        'Leaving Time',
        'Follow-up Time',
        'Notes',
      ],
      ...data.rsvpResponses.map((r) => [
        r.user?.name ?? 'N/A',
        r.user?.nim ?? 'N/A',
        r.status === 'YES'
          ? 'Hadir'
          : r.status === 'NO'
            ? 'Tidak Hadir'
            : r.status === 'PERMIT'
              ? 'Menyusul/Meninggalkan'
              : r.status === 'MAYBE'
                ? 'Mungkin Hadir'
                : 'No RSVP response',
        r.approvalStatus,
        formatInTimeZone(r.respondedAt, TIMEZONE, 'yyyy-MM-dd HH:mm'),
        r.user?.email ?? 'N/A',
        r.idLine ?? '',
        r.reason ?? '',
        r.proofUrl ?? '',
        r.leavingTime ? formatInTimeZone(r.leavingTime, TIMEZONE, 'yyyy-MM-dd HH:mm') : '',
        r.catchingUpTime ? formatInTimeZone(r.catchingUpTime, TIMEZONE, 'yyyy-MM-dd HH:mm') : '',
        r.notes ?? '',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RSVPs');
    XLSX.writeFile(workbook, `rsvps-${eventId}.xlsx`);
    toast.success('RSVPs exported to Excel successfully');
  };

  const handleExportAttendance = () => {
    if (!data) return;

    const worksheetData = [
      ['Name', 'NIM', 'Status', 'Checked In At', 'Duration (min)', 'Notes'],
      ...data.presenceRecords.map((p) => [
        p.user.name,
        p.user.nim,
        p.status,
        p.checkedInAt ? formatInTimeZone(p.checkedInAt, TIMEZONE, 'yyyy-MM-dd HH:mm') : 'N/A',
        p.duration ?? 'N/A',
        p.notes ?? '',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `attendance-${eventId}.xlsx`);
    toast.success('Attendance exported to Excel successfully');
  };

  // const handleExportCSVRsvps = () => {
  //   if (!data) return;

  //   const csv = [
  //     ['Name', 'NIM', 'Status', 'Responded At'].join(','),
  //     ...data.rsvpResponses.map((r) =>
  //       [
  //         r.user?.name ?? 'N/A',
  //         r.user?.nim ?? 'N/A',
  //         r.status,
  //         format(new Date(r.respondedAt), 'yyyy-MM-dd HH:mm'),
  //       ].join(','),
  //     ),
  //   ].join('\n');

  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `rsvps-${eventId}.csv`;
  //   a.click();
  //   toast.success('RSVPs exported to CSV successfully');
  // };

  // const handleExportCSVAttendance = () => {
  //   if (!data) return;

  //   const csv = [
  //     ['Name', 'NIM', 'Status', 'Checked In At'].join(','),
  //     ...data.presenceRecords.map((p) =>
  //       [
  //         p.user.name,
  //         p.user.nim,
  //         p.status,
  //         p.checkedInAt ? format(new Date(p.checkedInAt), 'yyyy-MM-dd HH:mm') : 'N/A',
  //       ].join(','),
  //     ),
  //   ].join('\n');

  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `attendance-${eventId}.csv`;
  //   a.click();
  //   toast.success('Attendance exported to CSV successfully');
  // };

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRsvps}</div>
            <p className="text-xs text-muted-foreground">{stats.yesRsvps} confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.yesRsvps}</div>
            <p className="text-xs text-muted-foreground">Going to attend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPresence}</div>
            <p className="text-xs text-muted-foreground">Total attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.yesRsvps > 0
                ? `${Math.round((stats.presentCount / stats.yesRsvps) * 100)}%`
                : '0%'}{' '}
              of confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for RSVP and Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">
                Attendance ({data?.presenceRecords.length})
              </TabsTrigger>
              <TabsTrigger value="rsvps">RSVPs ({data?.rsvpResponses.length})</TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <div className="flex max-sm:flex-col gap-2 justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => approveAllAttendances({ eventId })}
                  disabled={isApprovingAllAttendances || !data?.presenceRecords.some((p) => p.status === 'PENDING_APPROVAL')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All Pending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAttendance}
                  disabled={!data?.presenceRecords.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Attendance (Excel)
                </Button>
              </div>

              {data?.presenceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.presenceRecords.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{p.user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{p.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.user.nim}</TableCell>
                        <TableCell className="text-muted-foreground">{p.user.email}</TableCell>
                        <TableCell className="text-sm">
                          {p.checkedInAt
                            ? formatInTimeZone(p.checkedInAt, TIMEZONE, 'MMM d, HH:mm')
                            : 'Not checked in'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === PresenceStatus.PRESENT
                                ? 'default'
                                : p.status === PresenceStatus.LATE
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {p.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <UpdateNoteDialog
                            presenceId={p.id}
                            currentNotes={p.notes}
                            onUpdate={updatePresenceNote}
                            // onUpdate={(data) =>
                            //   updatePresenceNote({
                            //     presenceId: data.presenceId,
                            //     notes: data.notes,
                            //   })
                            // }
                            isPending={isUpdatingNote}
                            type="attendance"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            onValueChange={(val) =>
                              updatePresence({
                                presenceId: p.id,
                                status: val as PresenceStatus,
                              })
                            }
                            defaultValue={p.status}
                            disabled={isUpdatingPresence}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(PresenceStatus)
                                .filter((s) => s !== 'PENDING_APPROVAL' && s !== 'REJECTED')
                                .map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* RSVPs Tab */}
            <TabsContent value="rsvps" className="space-y-4">
              <div className="flex max-sm:flex-col gap-2 justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => approveAllRsvps({ eventId })}
                  disabled={
                    isApprovingAll ||
                    !data?.rsvpResponses.some((r) => r.approvalStatus === 'PENDING')
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All Pending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportRsvps}
                  disabled={!data?.rsvpResponses.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export RSVPs (Excel)
                </Button>
              </div>

              {data?.rsvpResponses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No RSVP responses yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Approval Status</TableHead>
                      <TableHead>ID Line</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Proof URL</TableHead>
                      <TableHead>Leaving Time</TableHead>
                      <TableHead>Follow-up Time</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Responded At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.rsvpResponses.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{r.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{r.user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.user?.nim}</TableCell>
                        <TableCell className="text-muted-foreground">{r.user?.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === 'YES'
                                ? 'default'
                                : r.status === 'MAYBE'
                                  ? 'secondary'
                                  : r.status === 'PERMIT'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {r.status === 'YES' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" /> Will Attend
                              </>
                            ) : r.status === 'MAYBE' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" /> Maybe
                              </>
                            ) : r.status === 'PERMIT' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" /> Attending with Notice
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" /> Won&apos;t Attend
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.approvalStatus === 'APPROVED'
                                ? 'default'
                                : r.approvalStatus === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {r.approvalStatus === 'APPROVED' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" /> Approved
                              </>
                            ) : r.approvalStatus === 'REJECTED' ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" /> Rejected
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" /> Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.idLine || '-'}</TableCell>
                        <TableCell className="text-sm">{r.reason || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {r.proofUrl ? (
                            <a
                              href={r.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Proof
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.leavingTime
                            ? formatInTimeZone(r.leavingTime, TIMEZONE, 'MMM d, HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.catchingUpTime
                            ? formatInTimeZone(r.catchingUpTime, TIMEZONE, 'MMM d, HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <UpdateNoteDialog
                            presenceId={r.id}
                            currentNotes={r.notes}
                            onUpdate={updatePresenceNote}
                            isPending={isUpdatingNote}
                            type="rsvp"
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatInTimeZone(r.respondedAt, TIMEZONE, 'MMM d, yyyy • HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(val) =>
                                updateRSVPStatus({
                                  responseId: r.id,
                                  status: val as RSVPStatus,
                                })
                              }
                              defaultValue={r.status}
                              disabled={isUpdatingRSVP}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(RSVPStatus).map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s === 'YES'
                                      ? 'WILL ATTEND'
                                      : s === 'NO'
                                        ? `WON'T ATTEND`
                                        : s === 'PERMIT'
                                          ? 'ATTEND WITH NOTICE'
                                          : s.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              onValueChange={(val) =>
                                updateRsvpApproval({
                                  responseId: r.id,
                                  status: val as 'APPROVED' | 'PENDING' | 'REJECTED',
                                })
                              }
                              disabled={isUpdatingApproval}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue
                                  defaultValue={r.approvalStatus}
                                  placeholder="Approve/Reject/Pending"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="APPROVED">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Approve
                                  </div>
                                </SelectItem>
                                <SelectItem value="REJECTED">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Reject
                                  </div>
                                </SelectItem>
                                <SelectItem value="PENDING">
                                  <div className="flex items-center gap-2">
                                    <TimerIcon className="h-4 w-4 text-yellow-600" />
                                    Pending
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
