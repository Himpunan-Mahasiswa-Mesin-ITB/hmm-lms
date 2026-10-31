"use client";

import {
  ChevronLeft,
  ChevronRight,
  Link2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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

// TODO: replace placeholder data with tRPC queries once the program backend exists
const PLACEHOLDER_PROGRAMS = [
  { id: "program-1", name: "Program Kerja 1", linkedProfileIds: ["profile-1"] },
  {
    id: "program-2",
    name: "Program Kerja 2",
    linkedProfileIds: ["profile-1", "profile-2"],
  },
  {
    id: "program-3",
    name: "Program Kerja 3",
    linkedProfileIds: [] as string[],
  },
];

const PLACEHOLDER_PROFILES = [
  { id: "profile-1", name: "Profile 1", description: "Placeholder profile" },
  { id: "profile-2", name: "Profile 2", description: "Placeholder profile" },
  { id: "profile-3", name: "Profile 3", description: "Placeholder profile" },
];

export default function ProgramsClient() {
  const [searchProgram, setSearchProgram] = useState<string>("");
  const [searchProfile, setSearchProfile] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [linkProgramIdDialog, setLinkProgramIdDialog] = useState<string | null>(
    null,
  );
  const itemsPerPage = 10;

  const programs = PLACEHOLDER_PROGRAMS;
  const profiles = PLACEHOLDER_PROFILES;

  const filteredPrograms = useMemo(() => {
    if (!searchProgram) return programs;
    const searchLower = searchProgram.toLowerCase();
    return programs.filter((program) =>
      program.name.toLowerCase().includes(searchLower),
    );
  }, [programs, searchProgram]);

  const filteredProfiles = useMemo(() => {
    if (!searchProfile) return profiles;
    const searchLower = searchProfile.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        (profile.description &&
          profile.description.toLowerCase().includes(searchLower)),
    );
  }, [profiles, searchProfile]);

  const selectedProgram = programs.find(
    (program) => program.id === linkProgramIdDialog,
  );
  const linkedProfiles = profiles.filter((profile) =>
    selectedProgram?.linkedProfileIds.includes(profile.id),
  );

  const paginatedPrograms = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredPrograms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPrograms, page]);
  const totalPages = Math.ceil((filteredPrograms.length || 1) / itemsPerPage);

  const closeLinkDialog = () => {
    setLinkProgramIdDialog(null);
    setSelectedProfileId("");
    setSearchProfile("");
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground mt-1">
            Manage profiles for programs
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search programs by name..."
              value={searchProgram}
              onChange={(e) => {
                setSearchProgram(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          {/* TODO: wire to refetch once programs are fetched from the API */}
          <Button title="Refresh">
            <RefreshCcw />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLinkProgramIdDialog(program.id)}
                      title="Link Profile"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>Link Profile</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedPrograms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    {searchProgram
                      ? `No programs found matching "${searchProgram}"`
                      : "No programs found"}
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

      <Dialog open={!!linkProgramIdDialog} onOpenChange={closeLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Profile to Program</DialogTitle>
            <DialogDescription>
              Select a profile to link to{" "}
              {selectedProgram?.name ?? "this program"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Linked Profiles</Label>
            {linkedProfiles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {linkedProfiles.map((profile) => (
                  <Badge key={profile.id} variant="secondary">
                    {profile.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No profiles linked yet
              </p>
            )}
          </div>
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
            <Select
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                {filteredProfiles
                  .filter(
                    (profile) =>
                      !selectedProgram?.linkedProfileIds.includes(profile.id),
                  )
                  .map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLinkDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: call link mutation once the program backend exists
                toast.info("Linking profiles to programs is not available yet");
                closeLinkDialog();
              }}
              disabled={!selectedProfileId}
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
