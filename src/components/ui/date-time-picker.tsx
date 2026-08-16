'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = 'Pick date & time',
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  React.useEffect(() => {
    setSelectedDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedDate(undefined);
    onChange(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      handleReset();
      return;
    }

    const newDate = new Date(date);
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    } else {
      const now = new Date();
      newDate.setHours(now.getHours());
      newDate.setMinutes(now.getMinutes());
    }

    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    if (type === 'hours') {
      baseDate.setHours(parseInt(val, 10));
    } else {
      baseDate.setMinutes(parseInt(val, 10));
    }
    setSelectedDate(baseDate);
    onChange(baseDate);
  };

  const handleSetToday = () => {
    const now = new Date();
    setSelectedDate(now);
    onChange(now);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const now = new Date();
  const currentHour = selectedDate
    ? String(selectedDate.getHours()).padStart(2, '0')
    : String(now.getHours()).padStart(2, '0');
  const currentMinute = selectedDate
    ? String(selectedDate.getMinutes()).padStart(2, '0')
    : String(now.getMinutes()).padStart(2, '0');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex items-center">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal pr-8',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, 'PPP HH:mm')
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          autoFocus
        />

        <div className="border-t border-border p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Select
              value={currentHour}
              onValueChange={(val) => handleTimeChange('hours', val)}
            >
              <SelectTrigger className="w-[68px] h-8 text-xs">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {hours.map((h) => (
                  <SelectItem key={h} value={h} className="text-xs">
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-xs">:</span>
            <Select
              value={currentMinute}
              onValueChange={(val) => handleTimeChange('minutes', val)}
            >
              <SelectTrigger className="w-[68px] h-8 text-xs">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {minutes.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-border p-2 flex items-center justify-between gap-2 bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!selectedDate}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSetToday}
            className="h-7 px-2 text-xs text-primary font-medium"
          >
            Now
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
