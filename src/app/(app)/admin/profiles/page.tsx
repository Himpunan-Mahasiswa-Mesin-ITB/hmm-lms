import ProfileManagement from "./profile-management";

export default async function AdminProfilesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <ProfileManagement />
    </div>
  );
}

export const metadata = {
  title: "Manage Profiles",
  description: "Manage profiles and group profiles in the platform system",
};
