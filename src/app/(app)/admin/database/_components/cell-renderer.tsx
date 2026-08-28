/* eslint-disable @typescript-eslint/no-base-to-string */
// src/app/admin/database/_components/cell-renderer.tsx
'use client';

import { Eye, EyeOff, Expand } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { cn } from '~/lib/utils';

interface CellRendererProps {
  fieldKey: string;
  value: unknown;
  userRole: 'ADMIN' | 'SUPERADMIN';
}

const SENSITIVE_FIELDS = [
  'password',
  'auth',
  'p256dh',
  'refresh_token',
  'access_token',
  'id_token',
  'session_state',
  'scope',
];

const LONG_TEXT_FIELDS = [
  'description',
  'content',
  'overview',
  'timeline',
  'eligibility',
  'explanation',
];

const PREVIEW_LENGTH = 50;

export function CellRenderer({ fieldKey, value, userRole }: CellRendererProps) {
  const [showSensitive, setShowSensitive] = useState(false);

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  // Handle ID field - make it prominent and copyable
  if (fieldKey === 'id' && typeof value === 'string') {
    return (
      <div className="flex items-center space-x-2">
        <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
          {value}
        </span>
      </div>
    );
  }

  // Handle sensitive fields
  if (SENSITIVE_FIELDS.includes(fieldKey)) {
    if (!showSensitive) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground font-mono">••••••••</span>
          {userRole === 'SUPERADMIN' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitive(true)}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSensitive(false)}
          className="h-6 w-6 p-0"
        >
          <EyeOff className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Handle long text fields
  if (LONG_TEXT_FIELDS.includes(fieldKey) && typeof value === 'string') {
    const isLong = value.length > PREVIEW_LENGTH;
    const preview = isLong ? `${value.slice(0, PREVIEW_LENGTH)}...` : value;

    if (!isLong) {
      return <span className="text-sm">{value}</span>;
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm">{preview}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Expand className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="capitalize">{fieldKey}</DialogTitle>
              <DialogDescription>Full content for {fieldKey} field</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96 w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm">{value}</div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground italic">empty array</span>;
    }

    return (
      <div className="flex flex-wrap gap-1 max-w-64">
        {value.slice(0, 3).map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {String(item)}
          </Badge>
        ))}
        {value.length > 3 && (
          <Dialog>
            <DialogTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                +{value.length - 3} more
              </Badge>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {fieldKey} ({value.length} items)
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-64 w-full">
                <div className="flex flex-wrap gap-1 p-2">
                  {value.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {String(item)}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Handle dates - improved detection (must come before object check)
  const isDate =
    value instanceof Date ||
    (typeof value === 'string' && !isNaN(Date.parse(value))) ||
    (typeof value === 'object' && value !== null && 'toISOString' in value);

  if (isDate) {
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (typeof value === 'object' && 'toISOString' in value) {
      date = new Date((value as { toISOString: () => string }).toISOString());
    } else {
      date = new Date(value as string);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return <span className="text-muted-foreground italic">Invalid Date</span>;
    }

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    let timeAgo = '';
    if (diffInHours < 1) {
      timeAgo = 'Just now';
    } else if (diffInHours < 24) {
      timeAgo = `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      timeAgo = `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      timeAgo = date.toLocaleDateString();
    }

    return (
      <div className="text-sm">
        <div className="font-medium">{date.toLocaleDateString()}</div>
        <div className="text-xs text-muted-foreground">
          {date.toLocaleTimeString()} • {timeAgo}
        </div>
      </div>
    );
  }

  // Handle objects (like _count, relations)
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <span className="text-muted-foreground italic">empty object</span>;
    }

    return (
      <div className="flex flex-wrap gap-1 max-w-64">
        {entries.slice(0, 2).map(([k, v]) => (
          <Badge key={k} variant="outline" className="text-xs">
            {k}: {String(v)}
          </Badge>
        ))}
        {entries.length > 2 && (
          <Dialog>
            <DialogTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                +{entries.length - 2} more
              </Badge>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="capitalize">{fieldKey}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-64 w-full">
                <div className="space-y-2 p-2">
                  {entries.map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="font-medium text-sm">{k}:</span>
                      <Badge variant="secondary" className="text-xs">
                        {String(v)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return (
      <Badge
        variant={value ? 'default' : 'secondary'}
        className={cn('text-xs', value ? 'bg-success/10 text-success border-success/20' : '')}
      >
        {value ? 'Yes' : 'No'}
      </Badge>
    );
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Format large numbers
    if (value > 1000000) {
      return <span className="font-mono text-sm">{(value / 1000000).toFixed(1)}M</span>;
    } else if (value > 1000) {
      return <span className="font-mono text-sm">{(value / 1000).toFixed(1)}K</span>;
    }
    return <span className="font-mono text-sm">{value.toLocaleString()}</span>;
  }

  // Handle enums and special string values
  if (typeof value === 'string') {
    // Handle email addresses
    if (fieldKey === 'email' || value.includes('@')) {
      return (
        <a href={`mailto:${value}`} className="text-primary hover:underline text-sm">
          {value}
        </a>
      );
    }

    // Handle URLs
    if (fieldKey.includes('link') || fieldKey.includes('url') || value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm"
        >
          {value.length > 30 ? `${value.slice(0, 30)}...` : value}
        </a>
      );
    }

    // Handle enum values with colors
    const enumColors: Record<string, string> = {
      ADMIN: 'bg-primary/10 text-primary border-primary/20',
      SUPERADMIN: 'bg-destructive/10 text-destructive border-destructive/20',
      STUDENT: 'bg-muted text-muted-foreground',
      ACTIVE: 'bg-success/10 text-success border-success/20',
      INACTIVE: 'bg-muted text-muted-foreground',
      GLOBAL: 'bg-info/10 text-info border-info/20',
      COURSE: 'bg-warning/10 text-warning border-warning/20',
    };

    if (enumColors[value]) {
      return <Badge className={cn('text-xs', enumColors[value])}>{value}</Badge>;
    }

    if (fieldKey.endsWith('Id') && fieldKey !== 'id' && value.length > 10) {
      return <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{value}</span>;
    }

    // Default string handling
    return <span className="text-sm">{value}</span>;
  }

  // Fallback for any other type
  return <span className="text-sm text-muted-foreground">{String(value)}</span>;
}
