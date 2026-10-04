'use client';

import {
  Trash2,
  Edit,
  Link2,
  Unlink,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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
import { api } from '~/trpc/react';

export default function EventProfileManagementClient() {
  const [activeTab, setActiveTab] = useState<string>('events');
  const [searchEvent, setSearchEvent] = useState<string>('');
  const [searchProfile, setSearchProfile] = useState<string>('');
  const [progressToAdd, setProgressToAdd] = useState<number>(0);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [pageEventProfiles, setPageEventProfiles] = useState<number>(1);
  const [mutationMode, setMutationMode] = useState<'link' | 'unlink'>('link');
  const [linkEventIdDialog, setLinkEventIdDialog] = useState<string | null>(null);
  const itemsPerPage = 10;
  const {
    data: events,
    refetch: refetchEvents,
    isLoading: isLoadingEvents,
  } = api.profile.getAllEvents.useQuery();
  const {
    data: profiles,
    refetch: refetchProfiles,
    isLoading: isLoadingProfiles,
  } = api.profile.getProfiles.useQuery();
  const isLoading = isLoadingEvents || isLoadingProfiles;

  const filteredEvents = useMemo(() => {
    if (!searchEvent) return events;
    const searchLower = searchEvent.toLowerCase();
    return events?.filter(
      (event) =>
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower)),
    );
  }, [events, searchEvent]);

  const filteredProfiles = useMemo(() => {
    if (!searchProfile) return profiles;
    const searchLower = searchProfile.toLowerCase();
    return profiles?.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower)),
    );
  }, [profiles, searchProfile]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (pageEventProfiles - 1) * itemsPerPage;
    return filteredEvents?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, pageEventProfiles]);
  const totalPages = Math.ceil((filteredEvents?.length || 1) / itemsPerPage);

  const linkProfileToEvent = api.profile.linkProfileToEvent.useMutation({
    onSuccess: () => {
      toast.success('Profile linked to event successfully');
      setLinkEventIdDialog(null);
      setSelectedProfileId('');
      void refetchEvents();
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const unlinkProfileToEvent = api.profile.unlinkProfileFromEvent.useMutation({
    onSuccess: () => {
      toast.success('Profile unlinked from event successfully');
      setLinkEventIdDialog(null);
      setSelectedProfileId('');
      void refetchEvents();
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage profiles for events</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-full sm:w-auto inline-flex min-w-max">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="event-profiles">Assigned Profiles</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search event profiles by name or description..."
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => refetchEvents()} disabled={isLoading}>
              <RefreshCcw className={`${isLoading && `animate-spin`}`} />
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Profiles Count</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{event.relatedProfiles.length}</Badge>
                    </TableCell>
                    <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(event.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLinkEventIdDialog(event.id);
                            setMutationMode('link');
                            setSelectedProfileId('');
                            setSearchProfile('');
                          }}
                          title="Link Profile"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLinkEventIdDialog(event.id);
                            setMutationMode('unlink');
                            setSelectedProfileId('');
                            setSearchProfile('');
                          }}
                          title="Unlink Profile"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedEvents?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchEvent
                        ? `No event profiles found matching "${searchEvent}"`
                        : 'No event profiles found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageEventProfiles((page) => Math.max(1, page - 1))}
                disabled={pageEventProfiles === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Previous</span>
              </Button>
              <span className="flex items-center px-4">
                Page {pageEventProfiles} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageEventProfiles((page) => Math.min(totalPages, page + 1))}
                disabled={pageEventProfiles === totalPages}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="event-profiles" className="space-y-4">
          <EventProfilesTable />
        </TabsContent>
      </Tabs>

      <Dialog open={!!linkEventIdDialog} onOpenChange={() => setLinkEventIdDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mutationMode === 'link' ? 'Link Profile to Event' : 'Unlink Profile from Event'}
            </DialogTitle>
            <DialogDescription>
              Select a profile to {mutationMode === 'link' ? 'link' : 'unlink'} from this event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search profiles by name or description..."
                  value={searchProfile}
                  onChange={(e) => setSearchProfile(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProfiles
                    ?.filter((p) => {
                      console.log('Event Id', linkEventIdDialog!);
                      if (mutationMode === 'link')
                        return !p.relatedEvents
                          .map((event) => event.eventId)
                          .includes(linkEventIdDialog!);
                      else
                        return p.relatedEvents
                          .map((event) => event.eventId)
                          .includes(linkEventIdDialog!);
                    })
                    .map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {mutationMode === 'link' && (
              <div className="space-y-2">
                <Label>Points/Progress (%)</Label>
                <Input
                  placeholder="Input how many points/progress to add"
                  value={progressToAdd}
                  onChange={(e) => setProgressToAdd(Number(e.target.value))}
                  className="mt-2"
                  type="number"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkEventIdDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkEventIdDialog && selectedProfileId && mutationMode === 'link') {
                  linkProfileToEvent.mutate({
                    profileId: selectedProfileId,
                    eventId: linkEventIdDialog,
                    progressToAdd: progressToAdd,
                  });
                } else if (linkEventIdDialog && selectedProfileId && mutationMode === 'unlink') {
                  unlinkProfileToEvent.mutate({
                    profileId: selectedProfileId,
                    eventId: linkEventIdDialog,
                  });
                }
              }}
              disabled={
                !selectedProfileId ||
                (mutationMode === 'link'
                  ? linkProfileToEvent.isPending
                  : unlinkProfileToEvent.isPending)
              }
            >
              {mutationMode === 'link' ? 'Link' : 'Unlink'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function EventProfilesTable() {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [editDialog, setEditDialog] = useState<{
    eventId: string;
    eventTitle: string;
    profileId: string;
    profileName: string;
    progressToAdd: number;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    eventId: string;
    profileId: string;
  } | null>(null);
  const itemsPerPage = 10;
  const { data: events, isLoading, isRefetching, refetch } = api.profile.getAllEvents.useQuery();
  const isFetching = isLoading || isRefetching;

  const updateEventProfileRelation = api.profile.updateEventProfileRelation.useMutation({
    onSuccess: () => {
      toast.success('Event profile updated successfully');
      setEditDialog(null);
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unlinkProfileFromEvent = api.profile.unlinkProfileFromEvent.useMutation({
    onSuccess: () => {
      toast.success('Event profile deleted/unlinked successfully');
      setDeleteDialog(null);
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const allEventProfiles = useMemo(() => {
    const eventProfiles: Array<{
      eventId: string;
      eventTitle: string;
      eventDescription: string;
      profileId: string;
      profileName: string;
      profileDescription: string;
      progressToAdd: number;
      createdAt: Date;
    }> = [];

    events?.forEach((event) => {
      event.relatedProfiles.forEach((relation) => {
        eventProfiles.push({
          eventId: event.id,
          eventTitle: event.title,
          eventDescription: event.description || '',
          profileId: relation.profile.id,
          profileName: relation.profile.name,
          profileDescription: relation.profile.description || '',
          progressToAdd: relation.progressToAdd || 0,
          createdAt: relation.createdAt,
        });
      });
    });

    return eventProfiles;
  }, [events]);

  const filteredEventProfiles = useMemo(() => {
    if (!search) return allEventProfiles;
    const searchLower = search.toLowerCase();
    return allEventProfiles.filter(
      (ep) =>
        ep.eventTitle.toLowerCase().includes(searchLower) ||
        ep.profileName.toLowerCase().includes(searchLower) ||
        (ep.eventDescription && ep.eventDescription.toLowerCase().includes(searchLower)) ||
        (ep.profileDescription && ep.profileDescription.toLowerCase().includes(searchLower)),
    );
  }, [allEventProfiles, search]);

  const paginatedEventProfiles = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredEventProfiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEventProfiles, page]);

  const totalPages = Math.ceil(filteredEventProfiles.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event title or profile name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`${isFetching && `animate-spin`}`} />
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Added Progress (%)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEventProfiles.map((ep) => (
              <TableRow key={`${ep.eventId}-${ep.profileId}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{ep.eventTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {ep.eventDescription || '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ep.profileName}</div>
                    <div className="text-sm text-muted-foreground">
                      {ep.profileDescription || '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{`${ep.progressToAdd}%`}</TableCell>
                <TableCell>{new Date(ep.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditDialog({
                          eventId: ep.eventId,
                          eventTitle: ep.eventTitle,
                          profileId: ep.profileId,
                          profileName: ep.profileName,
                          progressToAdd: ep.progressToAdd,
                        })
                      }
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeleteDialog({
                          eventId: ep.eventId,
                          profileId: ep.profileId,
                        })
                      }
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedEventProfiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {search
                    ? `No event profiles found matching "${search}"`
                    : 'No event profiles found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Previous</span>
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Profile</DialogTitle>
            <DialogDescription>Update the progress to add for this event profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{editDialog?.eventTitle}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profile</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{editDialog?.profileName}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Progress to Add (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editDialog?.progressToAdd || 0}
                onChange={(e) =>
                  setEditDialog(
                    editDialog ? { ...editDialog, progressToAdd: Number(e.target.value) } : null,
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editDialog && editDialog.eventId && editDialog.profileId) {
                  updateEventProfileRelation.mutate({
                    eventId: editDialog.eventId,
                    profileId: editDialog.profileId,
                    progressToAdd: editDialog.progressToAdd,
                  });
                }
              }}
              disabled={
                !editDialog?.eventId ||
                !editDialog?.profileId ||
                updateEventProfileRelation.isPending
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete/Unlink Event Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete/unlink this event profile? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog && deleteDialog.eventId && deleteDialog.profileId) {
                  unlinkProfileFromEvent.mutate({
                    eventId: deleteDialog.eventId,
                    profileId: deleteDialog.profileId,
                  });
                }
              }}
              disabled={unlinkProfileFromEvent.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
