'use client';

import {
  Trash2,
  Edit,
  Link2,
  Unlink,
  Plus,
  Users,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';
import { useState, Suspense, useMemo } from 'react';
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
import { Progress } from '~/components/ui/progress';
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
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

function GroupProfilesTable({
  onEdit,
  onDelete,
  onLinkProfile,
}: {
  onEdit: (id: string, name: string, description?: string) => void;
  onDelete: (id: string) => void;
  onLinkProfile: (id: string) => void;
}) {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 10;
  const { data: groupProfiles, isLoading, isRefetching, refetch } = api.profile.getGroupProfiles.useQuery();
  const isFetching = isLoading || isRefetching

  const filteredGroupProfiles = useMemo(() => {
    if (!search) return groupProfiles;
    const searchLower = search.toLowerCase();
    return groupProfiles?.filter(
      (group) =>
        group.name.toLowerCase().includes(searchLower) ||
        (group.description && group.description.toLowerCase().includes(searchLower)),
    );
  }, [groupProfiles, search]);

  const paginatedGroupProfiles = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredGroupProfiles?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroupProfiles, page]);

  const totalPages = Math.ceil((filteredGroupProfiles?.length || 1) / itemsPerPage);

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
            placeholder="Search group profiles by name or description..."
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
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Profiles Count</TableHead>
              <TableHead>Members Count</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGroupProfiles?.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell className="text-muted-foreground">{group.description || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{group.profiles.length}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{group.userMemberships.length}</Badge>
                </TableCell>
                <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLinkProfile(group.id)}
                      title="Link Profile"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(group.id, group.name, group.description || '')}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(group.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedGroupProfiles?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {search
                    ? `No group profiles found matching "${search}"`
                    : 'No group profiles found'}
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
  );
}

function ProfilesTable({
  onEdit,
  onDelete,
  onLinkToGroup,
  onUnlinkFromGroup,
}: {
  onEdit: (id: string, name: string, description?: string) => void;
  onDelete: (id: string) => void;
  onLinkToGroup: (id: string) => void;
  onUnlinkFromGroup: (id: string) => void;
}) {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 10;
  const { data: profiles, isLoading, isRefetching, refetch } = api.profile.getProfiles.useQuery();
  const isFetching = isLoading || isRefetching

  const filteredProfiles = useMemo(() => {
    if (!search) return profiles;
    const searchLower = search.toLowerCase();
    return profiles?.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower)) ||
        (profile.group && profile.group.name.toLowerCase().includes(searchLower)),
    );
  }, [profiles, search]);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredProfiles?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProfiles, page]);

  const totalPages = Math.ceil((filteredProfiles?.length || 1) / itemsPerPage);

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
            placeholder="Search group profiles by name or description..."
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
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProfiles?.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.description || '-'}
                </TableCell>
                <TableCell>
                  {profile.group ? (
                    <Badge variant="secondary">{profile.group.name}</Badge>
                  ) : (
                    <Badge variant="outline">No Group</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{profile.userProgresses.length}</Badge>
                </TableCell>
                <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {profile.group ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnlinkFromGroup(profile.id)}
                        title="Unlink from Group"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLinkToGroup(profile.id)}
                        title="Link to Group"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(profile.id, profile.name, profile.description || '')}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(profile.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedProfiles?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {search ? `No profile found matching "${search}"` : 'No profile found'}
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
  );
}

function UserMembershipManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedGroupProfileId, setSelectedGroupProfileId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [removeGroupProfileId, setRemoveGroupProfileId] = useState<string>('');
  const [removeProfileId, setRemoveProfileId] = useState<string>('');

  const [userSearch, setUserSearch] = useState<string>('');
  const [groupProfileSearch, setGroupProfileSearch] = useState<string>('');
  const [profileSearch, setProfileSearch] = useState<string>('');

  const { data: users } = api.profile.getAllUsers.useQuery();
  const { data: groupProfiles, refetch: refetchGroupProfiles } = api.profile.getGroupProfiles.useQuery();
  const { data: profiles, refetch: refetchProfiles } = api.profile.getProfiles.useQuery();

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const searchLower = userSearch.toLowerCase();
    return users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.nim.toLowerCase().includes(searchLower),
    );
  }, [users, userSearch]);

  const filteredGroupProfiles = useMemo(() => {
    if (!groupProfileSearch) return groupProfiles;
    const searchLower = groupProfileSearch.toLowerCase();
    return groupProfiles?.filter(
      (group) =>
        group.name.toLowerCase().includes(searchLower) ||
        (group.description && group.description.toLowerCase().includes(searchLower)),
    );
  }, [groupProfiles, groupProfileSearch]);

  const filteredProfiles = useMemo(() => {
    if (!profileSearch) return profiles;
    const searchLower = profileSearch.toLowerCase();
    return profiles?.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower)),
    );
  }, [profiles, profileSearch]);

  const addAssociatedProfileProgress = api.profile.createProfileProgress.useMutation({
    onSuccess: () => {
      toast.success('Added associated profile to member successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


  const createGroupProfileMembership = api.profile.createGroupProfileMembership.useMutation({
    onSuccess: () => {
      toast.success('Member added to group profile successfully');
      const profilesByGroupId = profiles?.filter((profile) => profile.groupId === selectedGroupProfileId)
      profilesByGroupId?.forEach((profile) => {
        addAssociatedProfileProgress.mutate({
          userId: selectedUserId,
          profileId: profile.id,
          progress: 0,
        })
      })
      setSelectedUserId('');
      setSelectedGroupProfileId('');

      void refetchGroupProfiles()
      void refetchProfiles()
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createProfileProgress = api.profile.createProfileProgress.useMutation({
    onSuccess: () => {
      toast.success('Added profile to member successfully');
      setSelectedUserId('');
      setSelectedProfileId('');
      setProgress(0);
      void refetchProfiles()
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteGroupProfileMembership = api.profile.deleteGroupProfileMembership.useMutation({
    onSuccess: () => {
      toast.success('Member removed from group profile successfully');
      setRemoveGroupProfileId('');
      setSelectedUserId('');

      void refetchGroupProfiles()
      void refetchProfiles()
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteAssociatedProfileProgress = api.profile.deleteProfileProgress.useMutation({
    onSuccess: () => {
      toast.success(`Removed associated profile from member successfully`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteProfileProgress = api.profile.deleteProfileProgress.useMutation({
    onSuccess: () => {
      toast.success(`Member's profile deleted successfully`);
      setRemoveProfileId('');
      setSelectedUserId('');
      void refetchProfiles()
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Add Member to Group Profile
          </h3>
          <div className="space-y-2">
            <Label>Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or NIM..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers && filteredUsers?.length > 0 ? (
                  filteredUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.nim})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No users found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Group Profile</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search group profiles..."
                value={groupProfileSearch}
                onChange={(e) => setGroupProfileSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedGroupProfileId} onValueChange={setSelectedGroupProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select group profile" />
              </SelectTrigger>
              <SelectContent>
                {filteredGroupProfiles && filteredGroupProfiles?.length > 0 ? (
                  filteredGroupProfiles?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No group profiles found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              if (selectedUserId && selectedGroupProfileId) {
                createGroupProfileMembership.mutate({
                  userId: selectedUserId,
                  groupProfileId: selectedGroupProfileId,
                });
              }
            }}
            disabled={
              !selectedUserId || !selectedGroupProfileId || createGroupProfileMembership.isPending
            }
          >
            Add to Group Profile
          </Button>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Add Profile to Member
          </h3>
          <div className="space-y-2">
            <Label>Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or NIM..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers && filteredUsers?.length > 0 ? (
                  filteredUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.nim})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No users found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profile</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                {filteredProfiles && filteredProfiles?.length > 0 ? (
                  filteredProfiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No profiles found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Progress (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
          <Button
            onClick={() => {
              if (selectedUserId && selectedProfileId) {
                createProfileProgress.mutate({
                  userId: selectedUserId,
                  profileId: selectedProfileId,
                  progress,
                });
              }
            }}
            disabled={!selectedUserId || !selectedProfileId || createProfileProgress.isPending}
          >
            Add Profile
          </Button>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Remove Member from Group Profile
          </h3>
          <div className="space-y-2">
            <Label>Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or NIM..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers && filteredUsers?.length > 0 ? (
                  filteredUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.nim})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No users found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Group Profile</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search group profiles..."
                value={groupProfileSearch}
                onChange={(e) => setGroupProfileSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={removeGroupProfileId} onValueChange={setRemoveGroupProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select group profile" />
              </SelectTrigger>
              <SelectContent>
                {filteredGroupProfiles && filteredGroupProfiles?.length > 0 ? (
                  filteredGroupProfiles?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No group profiles found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              if (selectedUserId && removeGroupProfileId) {
                const profilesByGroupId = profiles?.filter((profile) => profile.groupId === removeGroupProfileId)
                profilesByGroupId?.forEach((profile) => {
                  deleteAssociatedProfileProgress.mutate({
                    userId: selectedUserId,
                    profileId: profile.id,
                  })
                })
                deleteGroupProfileMembership.mutate({
                  userId: selectedUserId,
                  groupProfileId: removeGroupProfileId,
                });
              }
            }}
            disabled={
              !selectedUserId || !removeGroupProfileId || deleteGroupProfileMembership.isPending
            }
          >
            Remove from Group Profile
          </Button>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Delete Member Profile
          </h3>
          <div className="space-y-2">
            <Label>Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or NIM..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers && filteredUsers?.length > 0 ? (
                  filteredUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.nim})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No users found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profile</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={removeProfileId} onValueChange={setRemoveProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                {filteredProfiles && filteredProfiles?.length > 0 ? (
                  filteredProfiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No profiles found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              if (selectedUserId && removeProfileId) {
                deleteProfileProgress.mutate({
                  userId: selectedUserId,
                  profileId: removeProfileId,
                });
              }
            }}
            disabled={!selectedUserId || !removeProfileId || deleteProfileProgress.isPending}
          >
            Delete Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

function AssignedMemberships() {
  const [activeSubTab, setActiveSubTab] = useState<'group-profiles' | 'profiles'>('group-profiles');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<string | null>(null);
  const [deleteProfileDialog, setDeleteProfileDialog] = useState<string | null>(null);
  const [editProfileDialog, setEditProfileDialog] = useState<{
    profileName: string;
    profileId: string;
    userName: string;
    userEmail: string;
    userNim: string;
    userId: string;
    progress: number;
  } | null>(null);
  const itemsPerPage = 10;

  const { data: users } = api.profile.getAllUsers.useQuery();
  const { data: groupProfiles, refetch: refetchGroupProfiles, isRefetching: isRefetchingGroupProfiles, isLoading: isLoadingGroupProfiles } =
    api.profile.getGroupProfiles.useQuery();
  const { data: profiles, refetch: refetchProfiles, isRefetching: isRefetchingProfiles, isLoading: isLoadingProfiles, } = api.profile.getProfiles.useQuery();

  const isFetching = ((isRefetchingGroupProfiles || isRefetchingProfiles) || (isLoadingGroupProfiles || isLoadingProfiles))

  const allGroupMemberships = useMemo(() => {
    const memberships: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      userNim: string;
      groupProfileId: string;
      groupProfileName: string;
      joinedAt: Date;
    }> = [];

    groupProfiles?.forEach((group) => {
      group.userMemberships.forEach((membership) => {
        const user = users?.find((u) => u.id === membership.userId);
        if (user) {
          memberships.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userNim: user.nim,
            groupProfileId: group.id,
            groupProfileName: group.name,
            joinedAt: membership.joinedAt,
          });
        }
      });
    });

    return memberships;
  }, [groupProfiles, users]);

  const allProfileProgress = useMemo(() => {
    const progress: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      userNim: string;
      profileId: string;
      profileName: string;
      progress: number;
      updatedAt: Date;
    }> = [];

    profiles?.forEach((profile) => {
      profile.userProgresses.forEach((progressItem) => {
        const user = users?.find((u) => u.id === progressItem.userId);
        if (user) {
          progress.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userNim: user.nim,
            profileId: profile.id,
            profileName: profile.name,
            progress: progressItem.progress,
            updatedAt: progressItem.updatedAt,
          });
        }
      });
    });

    return progress;
  }, [profiles, users]);

  const filteredGroupMemberships = useMemo(() => {
    if (!search) return allGroupMemberships;
    const searchLower = search.toLowerCase();
    return allGroupMemberships.filter(
      (membership) =>
        membership.userName.toLowerCase().includes(searchLower) ||
        membership.userEmail.toLowerCase().includes(searchLower) ||
        membership.userNim.toLowerCase().includes(searchLower) ||
        membership.groupProfileName.toLowerCase().includes(searchLower),
    );
  }, [allGroupMemberships, search]);

  const filteredProfileProgress = useMemo(() => {
    if (!search) return allProfileProgress;
    const searchLower = search.toLowerCase();
    return allProfileProgress.filter(
      (progress) =>
        progress.userName.toLowerCase().includes(searchLower) ||
        progress.userEmail.toLowerCase().includes(searchLower) ||
        progress.userNim.toLowerCase().includes(searchLower) ||
        progress.profileName.toLowerCase().includes(searchLower),
    );
  }, [allProfileProgress, search]);

  const paginatedGroupMemberships = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredGroupMemberships.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroupMemberships, page]);

  const paginatedProfileProgress = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredProfileProgress.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProfileProgress, page]);

  const totalPages = Math.ceil(
    (activeSubTab === 'group-profiles'
      ? filteredGroupMemberships.length
      : filteredProfileProgress.length) / itemsPerPage,
  );

  const updateProfileProgress = api.profile.updateProfileProgress.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setEditProfileDialog(null);
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteGroupProfileMembership = api.profile.deleteGroupProfileMembership.useMutation({
    onSuccess: () => {
      toast.success('Member removed from group profile successfully');
      setSelectedUserId(null);
      setDeleteGroupDialog(null);
      refetchGroupProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProfileProgress = api.profile.deleteProfileProgress.useMutation({
    onSuccess: () => {
      toast.success('Member profile deleted successfully');
      setSelectedUserId(null);
      setDeleteProfileDialog(null);
      refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs
          value={activeSubTab}
          onValueChange={(value) => {
            setActiveSubTab(value as 'group-profiles' | 'profiles');
            setPage(1);
            setSearch('');
          }}
        >
          <TabsList>
            <TabsTrigger value="group-profiles">Group Profile Members</TabsTrigger>
            <TabsTrigger value="profiles">Profile Progress</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            void refetchGroupProfiles()
            void refetchProfiles()
          }}
            disabled={isFetching}
          >
            <RefreshCcw className={`${isFetching && `animate-spin`}`} />
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by user name, email, NIM..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs
        value={activeSubTab}
        onValueChange={(value) => {
          setActiveSubTab(value as 'group-profiles' | 'profiles');
          setPage(1);
          setSearch('');
        }}
      >
        <TabsContent value="group-profiles" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Group Profile</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGroupMemberships.map((membership) => (
                  <TableRow key={`${membership.userId}-${membership.groupProfileId}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{membership.userName}</div>
                        <div className="text-sm text-muted-foreground">{membership.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{membership.userNim}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{membership.groupProfileName}</Badge>
                    </TableCell>
                    <TableCell>{new Date(membership.joinedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteGroupDialog(membership.groupProfileId);
                          setSelectedUserId(membership.userId);
                        }}
                        disabled={deleteGroupProfileMembership.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedGroupMemberships.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {search
                        ? `No memberships found matching "${search}"`
                        : 'No group profile memberships found'}
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
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfileProgress.map((progress) => (
                  <TableRow key={`${progress.userId}-${progress.profileId}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{progress.userName}</div>
                        <div className="text-sm text-muted-foreground">{progress.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{progress.userNim}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{progress.profileName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress.progress} className="w-24" />
                        <span className="text-sm">{progress.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(progress.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditProfileDialog({
                            userId: progress.userId,
                            userNim: progress.userNim,
                            userEmail: progress.userEmail,
                            userName: progress.userName,
                            profileId: progress.profileId,
                            profileName: progress.profileName,
                            progress: progress.progress,
                          })
                        }
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteProfileDialog(progress.profileId);
                          setSelectedUserId(progress.userId);
                        }}
                        disabled={deleteProfileProgress.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedProfileProgress.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {search ? `No profile found matching "${search}"` : 'No profile found'}
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
        </TabsContent>
      </Tabs>

      <Dialog open={!!editProfileDialog} onOpenChange={() => setEditProfileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update the profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{editProfileDialog?.profileName}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Member</Label>
              <div className="p-3 bg-muted rounded-md space-y-1">
                <div className="font-medium">{editProfileDialog?.userName}</div>
                <div className="text-sm text-muted-foreground">{editProfileDialog?.userEmail}</div>
                <div className="text-sm font-mono">{editProfileDialog?.userNim}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editProfileDialog?.progress || 0}
                onChange={(e) =>
                  setEditProfileDialog(
                    editProfileDialog
                      ? { ...editProfileDialog, progress: Number(e.target.value) }
                      : null,
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editProfileDialog && editProfileDialog.userId && editProfileDialog.profileId) {
                  updateProfileProgress.mutate({
                    profileId: editProfileDialog.profileId,
                    userId: editProfileDialog.userId,
                    progress: editProfileDialog.progress,
                  });
                }
              }}
              disabled={
                !editProfileDialog?.profileId ||
                !editProfileDialog?.userId ||
                updateProfileProgress.isPending
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteGroupDialog} onOpenChange={() => setDeleteGroupDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group profile? This action cannot be undone and
              will remove all associated profiles and user memberships.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteGroupProfileMembership.mutate({
                  userId: selectedUserId as string,
                  groupProfileId: deleteGroupDialog as string,
                });
              }}
              disabled={deleteGroupProfileMembership.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteProfileDialog} onOpenChange={() => setDeleteProfileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile? This action cannot be undone and will
              remove all associated user progress data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProfileDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteProfileDialog) {
                  deleteProfileProgress.mutate({
                    userId: selectedUserId as string,
                    profileId: deleteProfileDialog,
                  });
                }
              }}
              disabled={deleteProfileProgress.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProfileManagement() {
  const [activeTab, setActiveTab] = useState('group-profiles');

  const [createGroupDialog, setCreateGroupDialog] = useState(false);
  const [editGroupDialog, setEditGroupDialog] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<string | null>(null);
  const [linkProfileDialog, setLinkProfileDialog] = useState<string | null>(null);

  const [createProfileDialog, setCreateProfileDialog] = useState(false);
  const [editProfileDialog, setEditProfileDialog] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [deleteProfileDialog, setDeleteProfileDialog] = useState<string | null>(null);
  const [linkToGroupDialog, setLinkToGroupDialog] = useState<string | null>(null);
  const [unlinkFromGroupDialog, setUnlinkFromGroupDialog] = useState<string | null>(null);

  // form states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [groupProfileSearch, setGroupProfileSearch] = useState<string>('');
  const [profileSearch, setProfileSearch] = useState<string>('');

  const { data: groupProfiles, refetch: refetchGroupProfiles } =
    api.profile.getGroupProfiles.useQuery();
  const { data: profiles, refetch: refetchProfiles } = api.profile.getProfiles.useQuery();

  const filteredGroupProfiles = useMemo(() => {
    if (!groupProfileSearch) return groupProfiles;
    const searchLower = groupProfileSearch.toLowerCase();
    return groupProfiles?.filter(
      (group) =>
        group.name.toLowerCase().includes(searchLower) ||
        (group.description && group.description.toLowerCase().includes(searchLower)),
    );
  }, [groupProfiles, groupProfileSearch]);

  const filteredProfiles = useMemo(() => {
    if (!profileSearch) return profiles;
    const searchLower = profileSearch.toLowerCase();
    return profiles?.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        (profile.description && profile.description.toLowerCase().includes(searchLower)),
    );
  }, [profiles, profileSearch]);

  const createGroupProfile = api.profile.createGroupProfile.useMutation({
    onSuccess: () => {
      toast.success('Group profile created successfully');
      setCreateGroupDialog(false);
      setGroupName('');
      setGroupDescription('');
      void refetchGroupProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateGroupProfile = api.profile.updateGroupProfile.useMutation({
    onSuccess: () => {
      toast.success('Group profile updated successfully');
      setEditGroupDialog(null);
      void refetchGroupProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteGroupProfile = api.profile.deleteGroupProfile.useMutation({
    onSuccess: () => {
      toast.success('Group profile deleted successfully');
      setDeleteGroupDialog(null);
      void refetchGroupProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const linkProfileToGroup = api.profile.linkProfileToGroup.useMutation({
    onSuccess: () => {
      toast.success('Profile linked to group successfully');
      setLinkProfileDialog(null);
      setSelectedGroupId('');
      setSelectedProfileId('');
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createProfile = api.profile.createProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile created successfully');
      setCreateProfileDialog(false);
      setProfileName('');
      setProfileDescription('');
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setEditProfileDialog(null);
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProfile = api.profile.deleteProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile deleted successfully');
      setDeleteProfileDialog(null);
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const linkProfileToGroupMutation = api.profile.linkProfileToGroup.useMutation({
    onSuccess: () => {
      toast.success('Profile linked to group successfully');
      setLinkToGroupDialog(null);
      setSelectedGroupId('');
      setSelectedProfileId('');
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unlinkProfileFromGroup = api.profile.unlinkProfileFromGroup.useMutation({
    onSuccess: () => {
      toast.success('Profile unlinked from group successfully');
      setUnlinkFromGroupDialog(null);
      void refetchProfiles();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage profiles, group profiles, and user memberships
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-full sm:w-auto inline-flex min-w-max">
            <TabsTrigger value="group-profiles">Group Profiles</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="user-memberships">User Memberships</TabsTrigger>
            <TabsTrigger value="assigned-memberships">Assigned Memberships</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="group-profiles" className="space-y-4">
          <div className="flex justify-center sm:justify-end">
            <Button onClick={() => setCreateGroupDialog(true)} className="max-sm:w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Group Profile
            </Button>
          </div>
          <Suspense
            fallback={
              <div className="rounded-md border">
                <div className="flex items-center justify-center h-64">
                  <div>Loading...</div>
                </div>
              </div>
            }
          >
            <GroupProfilesTable
              onEdit={(id, name, description) => setEditGroupDialog({ id, name, description })}
              onDelete={setDeleteGroupDialog}
              onLinkProfile={setLinkProfileDialog}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <div className="flex justify-center sm:justify-end">
            <Button onClick={() => setCreateProfileDialog(true)} className="max-sm:w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </div>
          <Suspense
            fallback={
              <div className="rounded-md border">
                <div className="flex items-center justify-center h-64">
                  <div>Loading...</div>
                </div>
              </div>
            }
          >
            <ProfilesTable
              onEdit={(id, name, description) => setEditProfileDialog({ id, name, description })}
              onDelete={setDeleteProfileDialog}
              onLinkToGroup={setLinkToGroupDialog}
              onUnlinkFromGroup={setUnlinkFromGroupDialog}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="user-memberships" className="space-y-4">
          <Suspense
            fallback={
              <div className="rounded-md border">
                <div className="flex items-center justify-center h-64">
                  <div>Loading...</div>
                </div>
              </div>
            }
          >
            <UserMembershipManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="assigned-memberships" className="space-y-4">
          <Suspense
            fallback={
              <div className="rounded-md border">
                <div className="flex items-center justify-center h-64">
                  <div>Loading...</div>
                </div>
              </div>
            }
          >
            <AssignedMemberships />
          </Suspense>
        </TabsContent>
      </Tabs>

      <Dialog open={createGroupDialog} onOpenChange={setCreateGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Profile</DialogTitle>
            <DialogDescription>
              Create a new group profile to organize related profiles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group profile name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Enter group profile description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (groupName) {
                  createGroupProfile.mutate({ name: groupName, description: groupDescription });
                }
              }}
              disabled={!groupName || createGroupProfile.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editGroupDialog} onOpenChange={() => setEditGroupDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Profile</DialogTitle>
            <DialogDescription>Update the group profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editGroupDialog?.name || ''}
                onChange={(e) =>
                  setEditGroupDialog(
                    editGroupDialog ? { ...editGroupDialog, name: e.target.value } : null,
                  )
                }
                placeholder="Enter group profile name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editGroupDialog?.description || ''}
                onChange={(e) =>
                  setEditGroupDialog(
                    editGroupDialog ? { ...editGroupDialog, description: e.target.value } : null,
                  )
                }
                placeholder="Enter group profile description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroupDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editGroupDialog && editGroupDialog.name) {
                  updateGroupProfile.mutate({
                    name: editGroupDialog.name,
                    groupId: editGroupDialog.id,
                    description: editGroupDialog.description,
                  });
                }
              }}
              disabled={!editGroupDialog?.name || updateGroupProfile.isPending}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteGroupDialog} onOpenChange={() => setDeleteGroupDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group profile? This action cannot be undone and
              will remove all associated profiles and user memberships.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteGroupDialog) {
                  deleteGroupProfile.mutate({ groupId: deleteGroupDialog });
                }
              }}
              disabled={deleteGroupProfile.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!linkProfileDialog} onOpenChange={() => setLinkProfileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Profile to Group</DialogTitle>
            <DialogDescription>Select a profile to link to this group profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search profiles by name, description, or group..."
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProfiles
                    ?.filter((p) => !p.groupId)
                    .map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkProfileDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkProfileDialog && selectedProfileId) {
                  linkProfileToGroup.mutate({
                    profileId: selectedProfileId,
                    groupId: linkProfileDialog,
                  });
                }
              }}
              disabled={!selectedProfileId || linkProfileToGroup.isPending}
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createProfileDialog} onOpenChange={setCreateProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Profile</DialogTitle>
            <DialogDescription>Create a new profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter profile name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                placeholder="Enter profile description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProfileDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (profileName) {
                  createProfile.mutate({ name: profileName, description: profileDescription });
                }
              }}
              disabled={!profileName || createProfile.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProfileDialog} onOpenChange={() => setEditProfileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update the profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editProfileDialog?.name || ''}
                onChange={(e) =>
                  setEditProfileDialog(
                    editProfileDialog ? { ...editProfileDialog, name: e.target.value } : null,
                  )
                }
                placeholder="Enter profile name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editProfileDialog?.description || ''}
                onChange={(e) =>
                  setEditProfileDialog(
                    editProfileDialog
                      ? { ...editProfileDialog, description: e.target.value }
                      : null,
                  )
                }
                placeholder="Enter profile description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editProfileDialog && editProfileDialog.name) {
                  updateProfile.mutate({
                    name: editProfileDialog.name,
                    profileId: editProfileDialog.id,
                    description: editProfileDialog.description,
                  });
                }
              }}
              disabled={!editProfileDialog?.name || updateProfile.isPending}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteProfileDialog} onOpenChange={() => setDeleteProfileDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile? This action cannot be undone and will
              remove all associated user progress data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProfileDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteProfileDialog) {
                  deleteProfile.mutate({ profileId: deleteProfileDialog });
                }
              }}
              disabled={deleteProfile.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!linkToGroupDialog} onOpenChange={() => setLinkToGroupDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Profile to Group</DialogTitle>
            <DialogDescription>Select a group profile to link this profile to</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Group Profile</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search group profiles by name, or description..."
                  value={groupProfileSearch}
                  onChange={(e) => setGroupProfileSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group profile" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGroupProfiles?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkToGroupDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkToGroupDialog && selectedGroupId) {
                  linkProfileToGroupMutation.mutate({
                    profileId: linkToGroupDialog,
                    groupId: selectedGroupId,
                  });
                }
              }}
              disabled={!selectedGroupId || linkProfileToGroupMutation.isPending}
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!unlinkFromGroupDialog} onOpenChange={() => setUnlinkFromGroupDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Profile from Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink this profile from its group? The profile will become
              standalone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkFromGroupDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (unlinkFromGroupDialog) {
                  const profile = profiles?.find((p) => p.id === unlinkFromGroupDialog);
                  if (profile?.groupId) {
                    unlinkProfileFromGroup.mutate({
                      profileId: unlinkFromGroupDialog,
                    });
                  } else {
                    toast.error('Profile is not linked to any group');
                  }
                }
              }}
              disabled={unlinkProfileFromGroup.isPending}
            >
              Unlink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
