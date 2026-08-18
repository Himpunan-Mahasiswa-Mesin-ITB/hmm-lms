'use client';

import type { ReactTable, RowData } from '@tanstack/react-table';
import * as React from 'react';

import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import type { DataTableFeatures } from './data-table-features';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>;
  defaultFilterColumn?: string;
}

export function DataTableToolbar<TData extends RowData>({
  table,
  defaultFilterColumn,
}: DataTableToolbarProps<TData>) {
  // get all columns that can be filtered and aren't row selector/action utility columns
  const filterableColumns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter(
        (column) => column.getCanFilter() && column.id !== 'select' && column.id !== 'actions',
      );
  }, [table]);

  const [selectedColumnId, setSelectedColumnId] = React.useState<string>(() => {
    if (defaultFilterColumn && table.getColumn(defaultFilterColumn)?.getCanFilter()) {
      return defaultFilterColumn;
    }
    return filterableColumns[0]?.id ?? '';
  });

  const activeColumn = table.getColumn(selectedColumnId);

  const getColumnLabel = (id: string) => {
    return id
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleColumnChange = (newColumnId: string) => {
    // clear old filter value when switching active column
    if (activeColumn) {
      activeColumn.setFilterValue(undefined);
    }
    setSelectedColumnId(newColumnId);
  };

  return (
    <div className="flex items-center justify-between gap-2 py-4">
      <div className="flex flex-1 items-center space-x-2">
        {filterableColumns.length > 1 && (
          <Select value={selectedColumnId} onValueChange={handleColumnChange}>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {filterableColumns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {getColumnLabel(column.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          placeholder={`Filter by ${getColumnLabel(selectedColumnId || 'value')}...`}
          value={(activeColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => activeColumn?.setFilterValue(event.target.value)}
          disabled={!activeColumn}
          className="max-w-sm"
        />
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
