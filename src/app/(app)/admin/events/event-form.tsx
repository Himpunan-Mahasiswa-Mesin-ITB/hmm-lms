// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client';


import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { api, type RouterOutputs } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { EventMode } from '@prisma/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { eventInputSchema, type timelineItemSchema } from '~/lib/schema/event';
import type { JsonArray } from '@prisma/client/runtime/library';
import { Switch } from '~/components/ui/switch';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '~/lib/utils';

type EventDetail = NonNullable<RouterOutputs['event']['getEventById']>;

type EventFormValues = z.infer<typeof eventInputSchema>;

interface EventFormProps {
  event?: EventDetail;
  mode: 'create' | 'edit';
}

export default function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [timelineItems, setTimelineItems] = useState<z.infer<typeof timelineItemSchema>[]>(
    event?.timeline ? (event.timeline as z.infer<typeof timelineItemSchema>[]) : []
  );

  const { data: courses } = api.course.getAllCourses.useQuery();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: event
      ? {
        title: event.title,
        description: event.description ?? '',
        start: new Date(event.start),
        end: new Date(event.end),
        hideEventTime: event.hideEventTime,
        allDay: event.allDay ?? false,
        location: event.location ?? '',
        hasTimeline: Boolean(event.timeline && (event.timeline as JsonArray).length > 0),
        timeline: (event.timeline as z.infer<typeof timelineItemSchema>[]) ?? [],
        scope: event.courseId ? 'course' : event.userId ? 'personal' : event.scope === "GLOBAL" ? "global" : "machining",
        courseId: event.courseId ?? undefined,
        eventMode: event.eventMode ?? EventMode.ATTENDANCE_ONLY,
        rsvpDeadline: event.rsvpDeadline ? new Date(event.rsvpDeadline) : null,
        rsvpRequiresApproval: event.rsvpRequiresApproval ?? false,
        presenceRequiresApproval: event.presenceRequiresApproval ?? false,
      }
      : {
        title: '',
        description: '',
        start: undefined as unknown as Date, // will be required
        end: undefined as unknown as Date,   // will be required
        hideEventTime: false,
        allDay: false,
        location: '',
        hasTimeline: false,
        timeline: [],
        scope: 'global',
        courseId: undefined,
        eventMode: EventMode.ATTENDANCE_ONLY,
        rsvpDeadline: null,
        rsvpRequiresApproval: false,
        presenceRequiresApproval: false,
      },
  });

  const createEvent = api.event.createEvent.useMutation({
    onSuccess: () => {
      toast.success('Event created successfully!');
      router.push('/admin/events');
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateEvent = api.event.updateEvent.useMutation({
    onSuccess: () => {
      toast.success('Event updated successfully!');
      router.push('/admin/events');
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data: EventFormValues) => {
    const payload: EventFormValues = {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : null,
      timeline: data.hasTimeline ? (timelineItems ?? []) : undefined,
    };

    if (mode === 'create') {
      createEvent.mutate(payload);
    } else if (event) {
      // update accepts partial plus id, but keeping full payload is fine
      updateEvent.mutate({ ...(payload), id: event.id });
    }
  };

  const scope = form.watch('scope');
  const eventMode = form.watch('eventMode');
  const hasTimeline = form.watch('hasTimeline');

  // RSVP section is only meaningful if eventMode is RSVP_ONLY or RSVP_AND_ATTENDANCE
  const showRsvpOptions =
    eventMode === EventMode.RSVP_ONLY || eventMode === EventMode.RSVP_AND_ATTENDANCE;

  const addTimelineItem = () => {
    setTimelineItems([
      ...timelineItems,
      { time: '', title: '', description: '', isCompleted: false },
    ]);
  };

  const removeTimelineItem = (index: number) => {
    setTimelineItems(timelineItems.filter((_, i) => i !== index));
  };

  const updateTimelineItem = (
    index: number,
    field: keyof z.infer<typeof timelineItemSchema>,
    value: string | boolean
  ) => {
    const updated = [...timelineItems];
    updated[index] = { ...updated[index]!, [field]: value };
    setTimelineItems(updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event description" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={toDateTimeLocalValue(field.value as unknown as Date)}
                        onChange={(e) => field.onChange(fromDateTimeLocalValue(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={toDateTimeLocalValue(field.value as unknown as Date)}
                        onChange={(e) => field.onChange(fromDateTimeLocalValue(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="hideEventTime"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Hide Event Time</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">All day event</FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Scope Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Event Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <Select onValueChange={(value) => {
                    if (value === "machining") form.setValue("hideEventTime", true)
                    field.onChange(value)
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="machining">Machining</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Global events are visible to everyone, course events are visible to course members only
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {scope === 'course' && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.classCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Event Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Event Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="eventMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EventMode.BASIC}>Basic (No tracking)</SelectItem>
                      <SelectItem value={EventMode.RSVP_ONLY}>RSVP Only</SelectItem>
                      <SelectItem value={EventMode.ATTENDANCE_ONLY}>Attendance Only</SelectItem>
                      <SelectItem value={EventMode.RSVP_AND_ATTENDANCE}>RSVP & Attendance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose how participants interact with this event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* RSVP Settings */}
        {showRsvpOptions && (
          <Card>
            <CardHeader>
              <CardTitle>RSVP Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rsvpDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP Deadline</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? toDateTimeLocalValue(field.value as unknown as Date) : ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? fromDateTimeLocalValue(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormDescription>Leave empty for no deadline</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpRequiresApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Require approval for RSVPs</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Presence (approval only, per schema) */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="presenceRequiresApproval"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Require approval for attendance</FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hasTimeline"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => {
                      field.onChange(v);
                      if (!v) setTimelineItems([]);
                    }} />
                  </FormControl>
                  <FormLabel className="!mt-0">Enable timeline</FormLabel>
                </FormItem>
              )}
            />

            {hasTimeline && (
              <div className="space-y-4">
                {timelineItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimelineItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        <Input
                          placeholder="Time (e.g., 09:00)"
                          value={item.time}
                          onChange={(e) => updateTimelineItem(index, 'time', e.target.value)}
                        />
                        <Input
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description ?? ''}
                          onChange={(e) => updateTimelineItem(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addTimelineItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Timeline Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/events')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
            {(createEvent.isPending || updateEvent.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === 'create' ? 'Create Event' : 'Update Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
