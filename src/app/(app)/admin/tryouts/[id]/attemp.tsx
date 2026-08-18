'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format, formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { DataTable } from '~/components/data-table';
import { DataTableColumnHeader } from '~/components/data-table-column-header';
import { type DataTableFeatures } from '~/components/data-table-features';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { RouterOutputs } from '~/trpc/react';
type Attempt = RouterOutputs['tryout']['getDetailedById']['attempts'][number];

interface TryoutAttemptsProps {
  attempts: Attempt[];
}

export default function TryoutAttempts({ attempts }: TryoutAttemptsProps) {
  const columns: ColumnDef<DataTableFeatures, Attempt>[] = useMemo(() => {
    return [
      {
        accessorKey: 'user.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{row.original.user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.original.user.name}</div>
              <div className="text-sm text-muted-foreground">{row.original.user.nim}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'isCompleted',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <Badge
            variant={row.original.isCompleted ? 'default' : 'secondary'}
            className="flex items-center gap-1 w-fit"
          >
            {row.original.isCompleted ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {row.original.isCompleted ? 'Completed' : 'In Progress'}
          </Badge>
        ),
      },
      {
        accessorKey: 'score',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Score" />,
        cell: ({ row }) => {
          const scorePercentage =
            row.original.maxScore > 0
              ? Math.round((row.original.score / row.original.maxScore) * 100)
              : 0;
          return row.original.isCompleted ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{scorePercentage}%</span>
              <span className="text-sm text-muted-foreground">
                ({row.original.score}/{row.original.maxScore})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'startedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Started" />,
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDistanceToNow(new Date(row.original.startedAt), { addSuffix: true })}
          </div>
        ),
      },
      {
        accessorKey: 'duration',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
        cell: ({ row }) => {
          const duration = row.original.endedAt
            ? Math.round(
                (new Date(row.original.endedAt).getTime() -
                  new Date(row.original.startedAt).getTime()) /
                  (1000 * 60),
              )
            : null;
          return duration ? (
            <span className="text-sm">{duration}m</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
    ];
  }, []);

  const handleExportAttempts = () => {
    if (!attempts) return;

    const worksheetData = [
      ['Name', 'NIM', 'Email', 'Status', 'Score', 'Started At', 'Ended At', 'Duration'],
      ...attempts.map((attempt) => [
        attempt.user?.name ?? 'N/A',
        attempt.user?.nim ?? 'N/A',
        attempt.user?.email ?? 'N/A',
        attempt.isCompleted ? 'Completed' : 'In Progress',
        `${attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0}% (${attempt.score}/${attempt.maxScore})`,
        format(new Date(attempt.startedAt), 'yyyy-MM-dd HH:mm'),
        attempt.endedAt ? format(new Date(attempt.endedAt), 'yyyy-MM-dd HH:mm') : 'N/A',
        `${
          attempt.endedAt
            ? Math.round(
                (new Date(attempt.endedAt).getTime() - new Date(attempt.startedAt).getTime()) /
                  (1000 * 60),
              )
            : null
        }m`,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tryout Attempts');
    XLSX.writeFile(workbook, `tryout-attempts.xlsx`);
    toast.success('Tryout attempts exported to Excel successfully');
  };

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No attempts yet</h3>
            <p className="text-muted-foreground">
              Student attempts will appear here once they start taking the tryout.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex max-sm:flex-col items-center sm:flex-row sm:justify-between gap-2">
        <CardTitle>Recent Attempts ({attempts.length})</CardTitle>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAttempts}
          disabled={!attempts.length}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Attempts
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={attempts} defaultFilterColumn="user.name" />
      </CardContent>
    </Card>
  );
}
