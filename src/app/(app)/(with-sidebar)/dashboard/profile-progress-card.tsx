'use client';

import { Award, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Progress } from '~/components/ui/progress';

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
}

export function ProfileProgressCard({ profileProgress }: ProfileProgressCardProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

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
                        <div className="font-medium text-sm sm:text-base truncate">{group.groupProfile.name}</div>
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
                          {profile.progress === 100 && <Award className="h-3 w-3 text-amber-500 shrink-0" />}
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
      </CardContent>
    </Card>
  );
}
