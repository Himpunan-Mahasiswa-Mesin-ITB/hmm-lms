'use client';

import { Award, Target, TrendingUp, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
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
import { Progress } from '~/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { api } from '~/trpc/react';

interface Profile {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  updatedAt: Date | null;
}

interface GroupProfile {
  groupProfile: {
    id: string;
    name: string;
    description: string | null;
  };
  profiles: Profile[];
}

interface ProfileProgressCardProps {
  profileProgress: GroupProfile[];
  refetch?: () => void;
}

export function ProfileProgressCard({ profileProgress, refetch }: ProfileProgressCardProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  const { data: profiles } = api.profile.getProfiles.useQuery();

  const filteredStandaloneProfiles = useMemo(() => {
    if (!profiles) return [];
    const standaloneProfiles = profiles.filter((p) => !p.groupId);
    if (!search) return standaloneProfiles;
    const searchLower = search.toLowerCase();
    return standaloneProfiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower)),
    );
  }, [profiles, search]);

  const existingProfileIds = useMemo(() => {
    const ids = new Set<string>();
    if (profileProgress) {
      profileProgress.forEach((group) => {
        group.profiles.forEach((profile) => {
          ids.add(profile.id);
        });
      });
    }
    return ids;
  }, [profileProgress]);

  const availableProfiles = useMemo(() => {
    return filteredStandaloneProfiles.filter((p) => !existingProfileIds.has(p.id));
  }, [filteredStandaloneProfiles, existingProfileIds]);

  const availableProfilesToRemove = useMemo(() => {
    return filteredStandaloneProfiles.filter((p) => existingProfileIds.has(p.id));
  }, [filteredStandaloneProfiles, existingProfileIds]);

  const addStandaloneProfiles = api.profile.addStandaloneProfiles.useMutation({
    onSuccess: () => {
      toast.success('Standalone profile added successfully');
      setOpenAddDialog(false);
      setSelectedProfileId('');
      setSearch('');
      if (refetch) {
        void refetch();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const removeStandaloneProfiles = api.profile.removeStandaloneProfiles.useMutation({
    onSuccess: () => {
      toast.success('Standalone profile removed successfully');
      setOpenRemoveDialog(false);
      setSelectedProfileId('');
      setSearch('');
      if (refetch) {
        void refetch();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleGroup = (groupId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  const totalProfiles = profileProgress.reduce((sum, group) => sum + group.profiles.length, 0);
  const totalProgress = profileProgress.reduce(
    (sum, group) => sum + group.profiles.reduce((pSum, profile) => pSum + profile.progress, 0),
    0,
  );
  const overallProgress = totalProfiles > 0 ? Math.round(totalProgress / totalProfiles) : 0;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl tracking-tight">Profile Progress</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Track your progress across assigned profiles
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalProfiles} profiles
            </Badge>
            <Badge variant="outline" className="text-xs">
              {overallProgress}% complete
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {profileProgress.map((group) => {
          const isOpen = openGroups.has(group.groupProfile.id);
          const groupProgress =
            group.profiles.length > 0
              ? Math.round(
                group.profiles.reduce((sum, profile) => sum + profile.progress, 0) /
                group.profiles.length,
              )
              : 0;

          return (
            <Collapsible
              key={group.groupProfile.id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.groupProfile.id)}
            >
              <div className="border-border/70 bg-card/50 rounded-lg border p-3 sm:p-4">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-0 hover:bg-transparent h-auto py-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 text-left flex-1 min-w-0">
                      <Award className="h-4 w-4 text-primary shrink-0" />
                      <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                        <div className="font-medium text-sm sm:text-base truncate">
                          {group.groupProfile.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {group.profiles.length} profile{group.profiles.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{groupProgress}%</div>
                        <Progress value={groupProgress} className="h-1.5 w-16" />
                      </div>
                      <div className="sm:hidden">
                        <Badge variant="secondary" className="text-xs">
                          {groupProgress}%
                        </Badge>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <p className="space-y-2 pl-6 sm:pl-7 text-muted-foreground text-sm">
                    {group.groupProfile.description}
                  </p>
                  {group.profiles.map((profile) => (
                    <div key={profile.id} className="space-y-2 pl-6 sm:pl-7">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{profile.name}</div>
                          {profile.description && (
                            <div className="text-muted-foreground text-xs line-clamp-2">
                              {profile.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={profile.progress === 100 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {profile.progress}%
                          </Badge>
                          {profile.progress > 0 && profile.progress < 100 && (
                            <TrendingUp className="h-3 w-3 text-primary shrink-0" />
                          )}
                          {profile.progress === 100 && (
                            <Award className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                      </div>
                      <Progress value={profile.progress} className="h-1.5" />
                      {profile.updatedAt && (
                        <div className="text-muted-foreground text-xs">
                          Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
        <Button
          className="w-full border-dashed border-white/30!"
          variant="outline"
          onClick={() => setOpenAddDialog(true)}
        >
          Add Standalone Profile
        </Button>
        <Button
          className="w-full border-dashed border-destructive/50!"
          variant="outline"
          onClick={() => setOpenRemoveDialog(true)}
        >
          Remove Standalone Profile
        </Button>
      </CardContent>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Standalone Profile</DialogTitle>
            <DialogDescription>Select a standalone profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Standalone Profile</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search standalone profiles by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standalone profile" />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.length > 0 ? (
                    availableProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      {search ? 'No standalone profiles found' : 'No available standalone profiles'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProfileId) {
                  addStandaloneProfiles.mutate({
                    profileId: selectedProfileId,
                  });
                }
              }}
              disabled={!selectedProfileId || addStandaloneProfiles.isPending}
            >
              Add Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openRemoveDialog} onOpenChange={setOpenRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Standalone Profile</DialogTitle>
            <DialogDescription>
              Select a standalone profile to remove, doing this will reset the corresponding
              profile's progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Standalone Profile</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search standalone profiles by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standalone profile" />
                </SelectTrigger>
                <SelectContent>
                  {availableProfilesToRemove.length > 0 ? (
                    availableProfilesToRemove.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      {search ? 'No standalone profiles found' : 'No available standalone profiles'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRemoveDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProfileId) {
                  removeStandaloneProfiles.mutate({
                    profileId: selectedProfileId,
                  });
                }
              }}
              disabled={!selectedProfileId || removeStandaloneProfiles.isPending}
            >
              Remove Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
