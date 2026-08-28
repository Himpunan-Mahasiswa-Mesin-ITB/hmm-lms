// src/app/admin/database/_components/database-table.tsx
/* eslint-disable */
// @ts-nocheck
'use client';

import {
  ChevronDown,
  Search,
  Download,
  Settings2,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';

// import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
// import { Badge } from "~/components/ui/badge";
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

import { AutoRefresh } from './auto-refresh';
import { BulkActions } from './bulk-actions';
import { CellRenderer } from './cell-renderer';
import { CreateRecordDialog } from './create-record-dialog';
import { DeleteRecordDialog } from './delete-record-dialog';
import { EditRecordDialog } from './edit-record-dialog';
import { ExportDialog } from './export-dialog';
import { TableLoading } from './loading-states';
import { TablePagination } from './table-pagination';

interface DatabaseTableProps {
  modelName: string;
  displayName: string;
  userRole: 'ADMIN' | 'SUPERADMIN' | 'STUDENT' | 'MACHINING';
  onDataChange: () => void;
}

const SENSITIVE_FIELDS = [
  'password',
  'auth',
  'p256dh',
  'refresh_token',
  'access_token',
  'id_token',
];
const LONG_TEXT_FIELDS = ['description', 'content', 'overview', 'timeline'];

export function DatabaseTable({
  modelName,
  displayName,
  userRole,
  onDataChange,
}: DatabaseTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);

  const limit = 15;

  const { data, isLoading, error, refetch } = api.database.getData.useQuery({
    model: modelName as never,
    page,
    limit,
    search: search || undefined,
    searchColumn: searchColumn === 'all' ? undefined : searchColumn,
    sortBy: sortBy || undefined,
    sortOrder,
  });

  // Get all possible columns from the first row of data
  const allColumns = useMemo(() => {
    if (!data?.data || data.data.length === 0) return [];

    const firstRow = data.data[0];
    if (!firstRow) return [];

    return Object.keys(firstRow);
  }, [data?.data]);

  // Initialize visible columns
  useEffect(() => {
    if (allColumns.length > 0 && visibleColumns.length === 0) {
      // Always include id column, then show next 5 columns by default
      const idColumn = allColumns.find((col) => col === 'id');
      const otherColumns = allColumns.filter((col) => col !== 'id');
      const columnsToShow = idColumn
        ? [idColumn, ...otherColumns.slice(0, 5)]
        : otherColumns.slice(0, 6);
      setVisibleColumns(columnsToShow);
    }
  }, [allColumns, visibleColumns.length]);

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(column);
        setSortOrder('asc');
      }
    },
    [sortBy, sortOrder],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && data?.data) {
        setSelectedRows(data.data.map((row) => row.id as string));
      } else {
        setSelectedRows([]);
      }
    },
    [data?.data],
  );

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  }, []);

  const formatCellValue = useCallback(
    (key: string, value: unknown) => {
      return <CellRenderer fieldKey={key} value={value} userRole={userRole} />;
    },
    [userRole],
  );

  const handleDataChange = useCallback(() => {
    void refetch();
    onDataChange();
  }, [refetch, onDataChange]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load {displayName} data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <ScrollArea className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  searchColumn === 'all'
                    ? `Search ${displayName.toLowerCase()}...`
                    : `Search by ${searchColumn}...`
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>

            {/* column search selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {searchColumn === 'all' ? 'All Columns' : searchColumn}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  key="all"
                  checked={searchColumn === 'all'}
                  onCheckedChange={() => {
                    setSearch('');
                    setSearchColumn('all');
                  }}
                >
                  All Columns
                </DropdownMenuCheckboxItem>
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={searchColumn === column}
                    onCheckedChange={() => {
                      setSearch('');
                      setSearchColumn(column);
                    }}
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Cols ({visibleColumns.length})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={visibleColumns.includes(column)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setVisibleColumns((prev) => [...prev, column]);
                      } else {
                        setVisibleColumns((prev) => prev.filter((col) => col !== column));
                      }
                    }}
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <AutoRefresh onRefresh={handleDataChange} isLoading={isLoading} />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {userRole === 'SUPERADMIN' && (
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {displayName}
              </Button>
            )}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedRows.length > 0 && userRole === 'SUPERADMIN' && (
        <BulkActions
          selectedCount={selectedRows.length}
          modelName={modelName}
          selectedIds={selectedRows}
          onSuccess={() => {
            setSelectedRows([]);
            handleDataChange();
          }}
        />
      )}

      {/* table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    data?.data && data.data.length > 0
                      ? selectedRows.length === data.data.length
                      : false
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column}</span>
                    {sortBy === column && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          sortOrder === 'asc' && 'rotate-180',
                        )}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              {userRole === 'SUPERADMIN' && !isLoading && (
                <TableHead className="w-24">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading columns={5} rows={5} />
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((row) => (
                <TableRow key={row.id as string}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id as string)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(row.id as string, checked as boolean)
                      }
                    />
                  </TableCell>
                  {visibleColumns.map((column) => (
                    <TableCell key={column}>
                      {formatCellValue(column, row[column as keyof typeof row])}
                    </TableCell>
                  ))}
                  {userRole === 'SUPERADMIN' && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(row);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(row);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (userRole === 'SUPERADMIN' ? 2 : 1)}
                  className="text-center py-12 text-muted-foreground"
                >
                  No {displayName.toLowerCase()} found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.pagination && <TablePagination pagination={data.pagination} onPageChange={setPage} />}

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        modelName={modelName}
        displayName={displayName}
      />
      <CreateRecordDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        modelName={modelName}
        displayName={displayName}
        onSuccess={handleDataChange}
      />

      {selectedRecord && (
        <>
          <EditRecordDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            modelName={modelName}
            displayName={displayName}
            recordId={selectedRecord.id as string}
            initialData={selectedRecord}
            onSuccess={handleDataChange}
          />

          <DeleteRecordDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            modelName={modelName}
            displayName={displayName}
            recordId={selectedRecord.id as string}
            recordTitle={
              (selectedRecord.title as string) ||
              (selectedRecord.name as string) ||
              (selectedRecord.email as string) ||
              undefined
            }
            onSuccess={handleDataChange}
          />
        </>
      )}
    </div>
  );
}
