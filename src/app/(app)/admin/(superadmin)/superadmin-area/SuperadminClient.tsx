'use client';

import { AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { api } from '~/trpc/react';

export default function SuperadminClient() {
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'convert' | 'revoke' | null;
  }>({ type: null });

  const convertMachiningToStudent = api.user.bulkConvertMachiningToStudent.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setConfirmDialog({ type: null });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const revokeBPUsers = api.user.bulkRevokeBPUsers.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setConfirmDialog({ type: null });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleConvertMachiningToStudent = () => {
    convertMachiningToStudent.mutate();
  };

  const handleRevokeBPUsers = () => {
    revokeBPUsers.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Superadmin Area</h1>
        <p className="text-muted-foreground mt-2">Bulk user management operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Convert MACHINING to STUDENT
            </CardTitle>
            <CardDescription>Convert all users with MACHINING role to STUDENT role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  This will change the role of all users currently assigned the MACHINING role to
                  STUDENT. This action can be reversed by manually updating individual users.
                </p>
              </div>
              <Button
                onClick={() => setConfirmDialog({ type: 'convert' })}
                disabled={convertMachiningToStudent.isPending}
                className="w-full"
              >
                {convertMachiningToStudent.isPending
                  ? 'Converting...'
                  : 'Convert All MACHINING Users'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Revoke BP Users
            </CardTitle>
            <CardDescription>Revoke all users with BP role from the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  <strong>Warning:</strong> This will permanently revoke all users with BP role.
                  This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={() => setConfirmDialog({ type: 'revoke' })}
                disabled={revokeBPUsers.isPending}
                variant="destructive"
                className="w-full"
              >
                {revokeBPUsers.isPending ? 'Revoking...' : 'Revoke All BP Users'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={confirmDialog.type !== null}
        onOpenChange={() => setConfirmDialog({ type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === 'convert'
                ? 'Confirm Role Conversion'
                : 'Confirm User Deletion'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'convert'
                ? 'Are you sure you want to convert all users with MACHINING role to STUDENT role?'
                : 'Are you sure you want to revoke all users with BP role? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ type: null })}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog.type === 'revoke' ? 'destructive' : 'default'}
              onClick={
                confirmDialog.type === 'convert'
                  ? handleConvertMachiningToStudent
                  : handleRevokeBPUsers
              }
              disabled={convertMachiningToStudent.isPending || revokeBPUsers.isPending}
            >
              {confirmDialog.type === 'convert'
                ? convertMachiningToStudent.isPending
                  ? 'Converting...'
                  : 'Confirm Convert'
                : revokeBPUsers.isPending
                  ? 'Revoking...'
                  : 'Confirm Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
