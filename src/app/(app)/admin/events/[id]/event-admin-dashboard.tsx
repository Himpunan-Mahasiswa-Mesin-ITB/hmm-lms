'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PresenceStatus, RSVPStatus } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';
import { Download, Users, CheckCircle, XCircle, Clock, FileText, TimerIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { DataTable } from '~/components/data-table';
import { DataTableColumnHeader } from '~/components/data-table-column-header';
import { type DataTableFeatures } from '~/components/data-table-features';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { TIMEZONE } from '~/constants/constants';
import { updateNoteSchema, type UpdateNoteForm } from '~/lib/schema/event';
import { api } from '~/trpc/react';

type AttendanceRecord = {
  id: string;
  user: {
    name: string;
    nim: string;
    email: string;
  };
  checkedInAt: Date | null;
  status: PresenceStatus;
  notes: string | null;
};

type RSVPResponse = {
  id: string;
  user: {
    name: string;
    id: string;
    email: string;
    nim: string;
    image: string | null;
  } | null;
  status: RSVPStatus;
  approvalStatus: string;
  respondedAt: Date;
  idLine: string | null;
  reason: string | null;
  proofUrl: string | null;
  leavingTime: Date | null;
  catchingUpTime: Date | null;
  notes: string | null;
};

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
                    <Textarea placeholder="Enter notes..." className="min-h-25" {...field} />
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

  const attendanceColumns: ColumnDef<DataTableFeatures, AttendanceRecord>[] = useMemo(() => {
    return [
      {
        accessorKey: 'user.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Name" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{row.original.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{row.original.user.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'user.nim',
        header: ({ column }) => <DataTableColumnHeader column={column} title="NIM" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.user.nim}</span>,
      },
      {
        accessorKey: 'user.email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.user.email}</span>,
      },
      {
        accessorKey: 'checkedInAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Check-in Time" />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.checkedInAt
              ? formatInTimeZone(row.original.checkedInAt, TIMEZONE, 'MMM d, HH:mm')
              : 'Not checked in'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === PresenceStatus.PRESENT
                ? 'default'
                : row.original.status === PresenceStatus.LATE
                  ? 'secondary'
                  : 'outline'
            }
          >
            {row.original.status.replace(/_/g, ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
        cell: ({ row }) => (
          <UpdateNoteDialog
            presenceId={row.original.id}
            currentNotes={row.original.notes}
            onUpdate={(data) => updatePresenceNote(data)}
            isPending={isUpdatingNote}
            type="attendance"
          />
        ),
      },
      {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
        cell: ({ row }) => (
          <Select
            onValueChange={(val) =>
              updatePresence({
                presenceId: row.original.id,
                status: val as PresenceStatus,
              })
            }
            defaultValue={row.original.status}
            disabled={isUpdatingPresence}
          >
            <SelectTrigger className="w-35">
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
        ),
      },
    ];
  }, [updatePresence, isUpdatingPresence, updatePresenceNote, isUpdatingNote]);

  const rsvpColumns: ColumnDef<DataTableFeatures, RSVPResponse>[] = useMemo(() => {
    return [
      {
        accessorKey: 'user.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Participant" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{row.original.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{row.original.user?.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'user.nim',
        header: ({ column }) => <DataTableColumnHeader column={column} title="NIM" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.user?.nim}</span>,
      },
      {
        accessorKey: 'user.email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.user?.email}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Response" />,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'YES'
                ? 'default'
                : row.original.status === 'MAYBE'
                  ? 'secondary'
                  : row.original.status === 'PERMIT'
                    ? 'secondary'
                    : 'outline'
            }
          >
            {row.original.status === 'YES' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" /> Will Attend
              </>
            ) : row.original.status === 'MAYBE' ? (
              <>
                <Clock className="h-3 w-3 mr-1" /> Maybe
              </>
            ) : row.original.status === 'PERMIT' ? (
              <>
                <Clock className="h-3 w-3 mr-1" /> Attending with Notice
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" /> Won&apos;t Attend
              </>
            )}
          </Badge>
        ),
      },
      {
        accessorKey: 'approvalStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Approval Status" />,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.approvalStatus === 'APPROVED'
                ? 'default'
                : row.original.approvalStatus === 'REJECTED'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {row.original.approvalStatus === 'APPROVED' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" /> Approved
              </>
            ) : row.original.approvalStatus === 'REJECTED' ? (
              <>
                <XCircle className="h-3 w-3 mr-1" /> Rejected
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" /> Pending
              </>
            )}
          </Badge>
        ),
      },
      {
        accessorKey: 'idLine',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID Line" />,
        cell: ({ row }) => <span className="text-sm">{row.original.idLine || '-'}</span>,
      },
      {
        accessorKey: 'reason',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
        cell: ({ row }) => <span className="text-sm">{row.original.reason || '-'}</span>,
      },
      {
        accessorKey: 'proofUrl',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Proof URL" />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.proofUrl ? (
              <a
                href={row.original.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Proof
              </a>
            ) : (
              '-'
            )}
          </span>
        ),
      },
      {
        accessorKey: 'leavingTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Leaving Time" />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.leavingTime
              ? formatInTimeZone(row.original.leavingTime, TIMEZONE, 'MMM d, HH:mm')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'catchingUpTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Follow-up Time" />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.catchingUpTime
              ? formatInTimeZone(row.original.catchingUpTime, TIMEZONE, 'MMM d, HH:mm')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
        cell: ({ row }) => (
          <UpdateNoteDialog
            presenceId={row.original.id}
            currentNotes={row.original.notes}
            onUpdate={(data) => updatePresenceNote(data)}
            isPending={isUpdatingNote}
            type="rsvp"
          />
        ),
      },
      {
        accessorKey: 'respondedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Responded At" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatInTimeZone(row.original.respondedAt, TIMEZONE, 'MMM d, yyyy • HH:mm')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Select
              onValueChange={(val) =>
                updateRSVPStatus({
                  responseId: row.original.id,
                  status: val as RSVPStatus,
                })
              }
              defaultValue={row.original.status}
              disabled={isUpdatingRSVP}
            >
              <SelectTrigger className="w-35">
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
                  responseId: row.original.id,
                  status: val as 'APPROVED' | 'PENDING' | 'REJECTED',
                })
              }
              disabled={isUpdatingApproval}
            >
              <SelectTrigger className="w-35">
                <SelectValue
                  defaultValue={row.original.approvalStatus}
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
        ),
      },
    ];
  }, [
    updateRSVPStatus,
    isUpdatingRSVP,
    updateRsvpApproval,
    isUpdatingApproval,
    updatePresenceNote,
    isUpdatingNote,
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data)
      return {
        totalRsvps: 0,
        yesRsvps: 0,
        totalPresence: 0,
        presentCount: 0,
        attendWithNoticeCount: 0,
        noRsvps: 0,
        permitRsvps: 0,
        approvedNoPermit: 0,
        rejectedNoPermit: 0,
        pendingNoPermit: 0,
      };

    const yesRsvps = data.rsvpResponses.filter((r) => r.status === 'YES').length;
    const noRsvps = data.rsvpResponses.filter((r) => r.status === 'NO').length;
    const permitRsvps = data.rsvpResponses.filter((r) => r.status === 'PERMIT').length;
    const presentCount = data.presenceRecords.filter(
      (p) => p.status === PresenceStatus.PRESENT || p.status === PresenceStatus.LATE,
    ).length;

    const noPermitResponses = data.rsvpResponses.filter(
      (r) => r.status === 'NO' || r.status === 'PERMIT',
    );
    const approvedNoPermit = noPermitResponses.filter(
      (r) => r.approvalStatus === 'APPROVED',
    ).length;
    const rejectedNoPermit = noPermitResponses.filter(
      (r) => r.approvalStatus === 'REJECTED',
    ).length;
    const pendingNoPermit = noPermitResponses.filter((r) => r.approvalStatus === 'PENDING').length;

    return {
      totalRsvps: data.rsvpResponses.length,
      yesRsvps,
      totalPresence: data.presenceRecords.length,
      presentCount,
      noRsvps,
      permitRsvps,
      approvedNoPermit,
      rejectedNoPermit,
      pendingNoPermit,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won&apos;t Attend</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noRsvps}</div>
            <p className="text-xs text-muted-foreground">Cannot attend request</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attending with Notice</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.permitRsvps}</div>
            <p className="text-xs text-muted-foreground">Permit requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedNoPermit}</div>
            <p className="text-xs text-muted-foreground">request approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedNoPermit}</div>
            <p className="text-xs text-muted-foreground">request rejected</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <TimerIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNoPermit}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingNoPermit > 0
                ? 'NO/PERMIT requests awaiting approval'
                : 'No pending approvals'}
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
              <div className="flex max-sm:flex-col gap-2 justify-end px-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => approveAllAttendances({ eventId })}
                  disabled={
                    isApprovingAllAttendances ||
                    !data?.presenceRecords.some((p) => p.status === 'PENDING_APPROVAL')
                  }
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
                <DataTable columns={attendanceColumns} data={data?.presenceRecords || []} />
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
                <DataTable columns={rsvpColumns} data={data?.rsvpResponses || []} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
