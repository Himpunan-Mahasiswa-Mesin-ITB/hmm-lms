// src/app/admin/database/_components/database-admin-client.tsx
"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import { DatabaseTable } from './_components/database-table';
import { LoadingSpinner } from '~/components/ui/loading-spinner';
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
// import { DatabaseStats } from './_components/database-stats';

interface DatabaseAdminClientProps {
  userRole: "ADMIN" | "SUPERADMIN" | "STUDENT" | "MACHINING" | "BP";
}

export function DatabaseAdminClient({ userRole }: DatabaseAdminClientProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  const router = useRouter();

  const { data: models, isLoading, error } = api.database.getModels.useQuery();

  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load database models: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!models || models.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No database models found.
        </AlertDescription>
      </Alert>
    );
  }

  // Set initial active tab if not set
  if (!activeTab && models.length > 0) {
    setActiveTab(models[0]?.name ?? "");
  }

  return (
    <div className="w-full">
      {/* <DatabaseStats activeModel={activeTab} /> */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {models.map((model) => (
              <TabsTrigger
                key={model.name}
                value={model.name}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {model.displayName}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {models.map((model) => (
          <TabsContent key={model.name} value={model.name} className="mt-6">
            <DatabaseTable
              modelName={model.name}
              displayName={model.displayName}
              userRole={userRole}
              onDataChange={refreshData}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
