import EventProfileManagementClient from "./event-profiles-client";

export default async function AdminEventProfilesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <EventProfileManagementClient />
    </div>
  );
}

export const metadata = {
  title: "Event Profiles",
  description: "Manage profiles for events in the platform system",
};
