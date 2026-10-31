'use client';

import {
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

type LinkMode = 'profile' | 'event';

export default function ProgramsClient() {
  const [searchProgram, setSearchProgram] = useState<string>('');
  const [searchOption, setSearchOption] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [progressToAdd, setProgressToAdd] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [linkDialog, setLinkDialog] = useState<{ programId: string; mode: LinkMode } | null>(
    null,
  );
  const [createDialog, setCreateDialog] = useState<boolean>(false);
  const [newProgramName, setNewProgramName] = useState<string>('');
  const [newProgramDescription, setNewProgramDescription] = useState<string>('');
  const [deleteProgramId, setDeleteProgramId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const {
    data: programs,
    refetch: refetchPrograms,
    isLoading: isLoadingPrograms,
    isRefetching: isRefetchingPrograms,
  } = api.program.getPrograms.useQuery();
  const { data: profiles, isLoading: isLoadingProfiles } = api.profile.getProfiles.useQuery();
  const { data: events, isLoading: isLoadingEvents } = api.profile.getAllEvents.useQuery();
  const isLoading = isLoadingPrograms || isLoadingProfiles || isLoadingEvents;

  const closeLinkDialog = () => {
    setLinkDialog(null);
    setSelectedOptionId('');
    setSearchOption('');
    setProgressToAdd(0);
  };

  const mutationOptions = (message: string, onDone?: () => void) => ({
    onSuccess: () => {
      toast.success(message);
      onDone?.();
      void refetchPrograms();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const createProgram = api.program.createProgram.useMutation(
    mutationOptions('Program created successfully', () => {
      setCreateDialog(false);
      setNewProgramName('');
      setNewProgramDescription('');
    }),
  );
  const deleteProgram = api.program.deleteProgram.useMutation(
    mutationOptions('Program deleted successfully', () => setDeleteProgramId(null)),
  );
  const linkProfileToProgram = api.program.linkProfileToProgram.useMutation(
    mutationOptions('Profile linked to program successfully', () => {
      setSelectedOptionId('');
      setProgressToAdd(0);
    }),
  );
  const updateProgramProfileRelation = api.program.updateProgramProfileRelation.useMutation(
    mutationOptions('Profile weight updated successfully'),
  );
  const unlinkProfileFromProgram = api.program.unlinkProfileFromProgram.useMutation(
    mutationOptions('Profile unlinked from program successfully'),
  );
  const linkEventToProgram = api.program.linkEventToProgram.useMutation(
    mutationOptions('Event linked to program successfully', () => setSelectedOptionId('')),
  );
  const unlinkEventFromProgram = api.program.unlinkEventFromProgram.useMutation(
    mutationOptions('Event unlinked from program successfully'),
  );

  const filteredPrograms = useMemo(() => {
    if (!searchProgram) return programs;
    const searchLower = searchProgram.toLowerCase();
    return programs?.filter(
      (program) =>
        program.name.toLowerCase().includes(searchLower) ||
        (program.description && program.description.toLowerCase().includes(searchLower)),
    );
  }, [programs, searchProgram]);

  const paginatedPrograms = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredPrograms?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPrograms, page]);
  const totalPages = Math.ceil((filteredPrograms?.length || 1) / itemsPerPage);

  const selectedProgram = programs?.find((program) => program.id === linkDialog?.programId);

  // Linked items shown in the dialog, normalized for both modes
  const linkedItems = useMemo(() => {
    if (!selectedProgram || !linkDialog) return [];
    if (linkDialog.mode === 'profile')
      return selectedProgram.relatedProfiles.map((relation) => ({
        id: relation.profileId,
        name: relation.profile.name,
      }));
    return selectedProgram.relatedEvents.map((relation) => ({
      id: relation.eventId,
      name: relation.event.title,
    }));
  }, [selectedProgram, linkDialog]);

  // Options for the select, excluding ones already linked
  const availableOptions = useMemo(() => {
    if (!linkDialog) return [];
    const linkedIds = linkedItems.map((item) => item.id);
    const options =
      linkDialog.mode === 'profile'
        ? (profiles ?? []).map((profile) => ({
            id: profile.id,
            name: profile.name,
            description: profile.description,
          }))
        : (events ?? []).map((event) => ({
            id: event.id,
            name: event.title,
            description: event.description,
          }));
    const searchLower = searchOption.toLowerCase();
    return options.filter(
      (option) =>
        !linkedIds.includes(option.id) &&
        (!searchOption ||
          option.name.toLowerCase().includes(searchLower) ||
          (option.description && option.description.toLowerCase().includes(searchLower))),
    );
  }, [linkDialog, linkedItems, profiles, events, searchOption]);

  const isLinkPending =
    linkDialog?.mode === 'profile' ? linkProfileToProgram.isPending : linkEventToProgram.isPending;
  const isUnlinkPending = unlinkProfileFromProgram.isPending || unlinkEventFromProgram.isPending;
  const isValidProgress = Number.isInteger(progressToAdd) && progressToAdd >= 0 && progressToAdd <= 100;

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
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground mt-1">
            Manage profiles, progress weights, and events for programs
          </p>
        </div>
        <Button onClick={() => setCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          <span>Create Program</span>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search programs by name or description..."
              value={searchProgram}
              onChange={(e) => {
                setSearchProgram(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => refetchPrograms()}
            disabled={isRefetchingPrograms}
            title="Refresh"
          >
            <RefreshCcw className={`${isRefetchingPrograms && `animate-spin`}`} />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Profiles</TableHead>
                <TableHead>Events</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPrograms?.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">
                    <div>{program.name}</div>
                    {program.description && (
                      <span className="inline-block max-w-75 truncate text-sm font-normal text-muted-foreground">
                        {program.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{program.relatedProfiles.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{program.relatedEvents.length}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLinkDialog({ programId: program.id, mode: 'profile' })}
                        title="Link Profile"
                      >
                        <Link2 className="h-4 w-4" />
                        <span>Link Profile</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLinkDialog({ programId: program.id, mode: 'event' })}
                        title="Link Event"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        <span>Link Event</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteProgramId(program.id)}
                        title="Delete Program"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedPrograms?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {searchProgram
                      ? `No programs found matching "${searchProgram}"`
                      : 'No programs found'}
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
              onClick={() => setPage((page) => Math.max(1, page - 1))}
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
              onClick={() => setPage((page) => Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!linkDialog} onOpenChange={closeLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {linkDialog?.mode === 'event' ? 'Link Event to Program' : 'Link Profile to Program'}
            </DialogTitle>
            <DialogDescription>
              Select {linkDialog?.mode === 'event' ? 'an event' : 'a profile'} to link to{' '}
              {selectedProgram?.name ?? 'this program'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{linkDialog?.mode === 'event' ? 'Linked Events' : 'Linked Profiles'}</Label>
            {linkDialog?.mode === 'profile' && selectedProgram ? (
              selectedProgram.relatedProfiles.length > 0 ? (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {selectedProgram.relatedProfiles.map((relation) => (
                    <LinkedProfileRow
                      key={relation.profileId}
                      name={relation.profile.name}
                      progressToAdd={relation.progressToAdd}
                      isSaving={updateProgramProfileRelation.isPending}
                      isUnlinking={isUnlinkPending}
                      onSave={(value) =>
                        updateProgramProfileRelation.mutate({
                          programId: selectedProgram.id,
                          profileId: relation.profileId,
                          progressToAdd: value,
                        })
                      }
                      onUnlink={() =>
                        unlinkProfileFromProgram.mutate({
                          programId: selectedProgram.id,
                          profileId: relation.profileId,
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No profiles linked yet</p>
              )
            ) : linkedItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {linkedItems.map((item) => (
                  <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
                    {item.name}
                    <button
                      type="button"
                      className="rounded-sm opacity-70 hover:opacity-100 disabled:pointer-events-none"
                      title="Unlink"
                      disabled={isUnlinkPending}
                      onClick={() => {
                        if (!linkDialog) return;
                        if (linkDialog.mode === 'profile')
                          unlinkProfileFromProgram.mutate({
                            programId: linkDialog.programId,
                            profileId: item.id,
                          });
                        else
                          unlinkEventFromProgram.mutate({
                            programId: linkDialog.programId,
                            eventId: item.id,
                          });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No {linkDialog?.mode === 'event' ? 'events' : 'profiles'} linked yet
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{linkDialog?.mode === 'event' ? 'Event' : 'Profile'}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${linkDialog?.mode === 'event' ? 'events' : 'profiles'} by name or description...`}
                value={searchOption}
                onChange={(e) => setSearchOption(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={linkDialog?.mode === 'event' ? 'Select event' : 'Select profile'}
                />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {linkDialog?.mode === 'profile' && (
            <div className="space-y-2">
              <Label htmlFor="program-progress">Points/Progress (%)</Label>
              <Input
                id="program-progress"
                type="number"
                min={0}
                max={100}
                placeholder="Progress this program adds to the profile"
                value={progressToAdd}
                onChange={(e) => setProgressToAdd(Number(e.target.value))}
              />
              {!isValidProgress && (
                <p className="text-xs text-destructive">Enter a whole number from 0 to 100</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeLinkDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!linkDialog || !selectedOptionId) return;
                if (linkDialog.mode === 'profile')
                  linkProfileToProgram.mutate({
                    programId: linkDialog.programId,
                    profileId: selectedOptionId,
                    progressToAdd,
                  });
                else
                  linkEventToProgram.mutate({
                    programId: linkDialog.programId,
                    eventId: selectedOptionId,
                  });
              }}
              disabled={
                !selectedOptionId ||
                isLinkPending ||
                (linkDialog?.mode === 'profile' && !isValidProgress)
              }
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Program</DialogTitle>
            <DialogDescription>Add a new program to link profiles and events to</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="program-name">Name</Label>
              <Input
                id="program-name"
                placeholder="Program name"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program-description">Description</Label>
              <Textarea
                id="program-description"
                placeholder="Program description (optional)"
                value={newProgramDescription}
                onChange={(e) => setNewProgramDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createProgram.mutate({
                  name: newProgramName,
                  description: newProgramDescription || undefined,
                })
              }
              disabled={!newProgramName.trim() || createProgram.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteProgramId} onOpenChange={() => setDeleteProgramId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              This will delete the program and remove all of its profile and event links. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProgramId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteProgramId) deleteProgram.mutate({ programId: deleteProgramId });
              }}
              disabled={deleteProgram.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LinkedProfileRow({
  name,
  progressToAdd,
  isSaving,
  isUnlinking,
  onSave,
  onUnlink,
}: {
  name: string;
  progressToAdd: number;
  isSaving: boolean;
  isUnlinking: boolean;
  onSave: (value: number) => void;
  onUnlink: () => void;
}) {
  const [value, setValue] = useState<number>(progressToAdd);
  const isValid = Number.isInteger(value) && value >= 0 && value <= 100;
  const isChanged = value !== progressToAdd;

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="h-8 w-20"
          aria-label={`Progress for ${name}`}
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        title="Save weight"
        disabled={!isChanged || !isValid || isSaving}
        onClick={() => onSave(value)}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="Unlink" disabled={isUnlinking} onClick={onUnlink}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
