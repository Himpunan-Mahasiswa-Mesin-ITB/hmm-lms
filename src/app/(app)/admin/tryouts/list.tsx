
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  Copy
} from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

type Tryout = RouterOutputs["tryout"]["getAll"][number];

interface TryoutsListProps {
  tryouts: Tryout[];
}

export default function TryoutsList({ tryouts: initialTryouts }: TryoutsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tryoutToDelete, setTryoutToDelete] = useState<string | null>(null);

  const utils = api.useUtils();

  const deleteTryout = api.tryout.delete.useMutation({
    onSuccess: () => {
      toast.success("Tryout deleted successfully");
      void utils.tryout.getAll.invalidate();
      setDeleteDialogOpen(false);
      setTryoutToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleActive = api.tryout.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Tryout status updated");
      void utils.tryout.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateTryout = api.tryout.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success(`Tryout duplicated: ${data?.title}`);
      void utils.tryout.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    setTryoutToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tryoutToDelete) {
      deleteTryout.mutate({ id: tryoutToDelete });
    }
  };

  const handleToggleActive = (id: string) => {
    toggleActive.mutate({ id });
  };

  const handleDuplicate = (id: string) => {
    duplicateTryout.mutate({ id });
  };

  if (initialTryouts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tryouts yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first tryout to get started with assessments.
          </p>
          <Button asChild>
            <Link href="/admin/tryouts/create">Create Tryout</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialTryouts.map((tryout) => (
          <Card key={tryout.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {tryout.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tryout.description ?? "No description"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/tryouts/${tryout.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/tryouts/${tryout.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(tryout.id)}
                      disabled={duplicateTryout.isPending}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(tryout.id)}
                      disabled={toggleActive.isPending}
                    >
                      {tryout.isActive ? (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(tryout.id)}
                      className="text-destructive focus:text-destructive"
                      disabled={deleteTryout.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={tryout.isActive ? "default" : "secondary"}>
                  {tryout.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {tryout.course.classCode}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{tryout.course.title}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{tryout._count.questions} questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{tryout._count.attempts} attempts</span>
                </div>
                {tryout.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tryout.duration}m</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              tryout and all associated data including student attempts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
