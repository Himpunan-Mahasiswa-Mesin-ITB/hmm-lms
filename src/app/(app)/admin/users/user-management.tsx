"use client";

import { useState, Suspense } from "react";
import { api } from "~/trpc/react";
import { Role } from "~/types/enums";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Search, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import UserDetailsDialog from './user-details-dialog';
import EditUserDialog from './edit-user-dialog';

function UsersTable({
  page,
  search,
  roleFilter,
  onUserSelect,
  onUserEdit,
  onUserDelete,
  // onRefetch,
}: {
  page: number;
  search: string;
  roleFilter?: Role;
  onUserSelect: (id: string) => void;
  onUserEdit: (id: string) => void;
  onUserDelete: (id: string) => void;
  onRefetch: () => void;
}) {
  const { data, isLoading } = api.user.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter,
  });

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "destructive";
      case Role.STUDENT:
        return "secondary";
      default:
        return "outline";
    }
  };

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>NIM</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? ""} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{user.nim}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{user._count.courses}</TableCell>
              <TableCell>{user._count.userAttempts}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUserSelect(user.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUserEdit(user.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUserDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | undefined>();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const { data, refetch } = api.user.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter,
  });

  const deleteUser = api.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeleteDialog(null);
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value === "all" ? undefined : (value as Role));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or NIM..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter ?? "all"} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value={Role.ADMIN}>Admin</SelectItem>
            <SelectItem value={Role.STUDENT}>Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Suspense fallback={
        <div className="rounded-md border">
          <div className="flex items-center justify-center h-64">
            <div>Loading...</div>
          </div>
        </div>
      }>
        <UsersTable
          page={page}
          search={search}
          roleFilter={roleFilter}
          onUserSelect={setSelectedUser}
          onUserEdit={setEditingUser}
          onUserDelete={setDeleteDialog}
          onRefetch={() => void refetch()}
        />
      </Suspense>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {selectedUser && (
        <UserDetailsDialog
          userId={selectedUser}
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        />
      )}

      {editingUser && (
        <EditUserDialog
          userId={editingUser}
          open={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
          onSuccess={() => void refetch()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone and will remove all their data including learning sessions
              and tryout attempts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog) {
                  deleteUser.mutate({ id: deleteDialog });
                }
              }}
              disabled={deleteUser.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
