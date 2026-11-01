import ProgramsClient from "./programs-client";

export default async function AdminProgramsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <ProgramsClient />
    </div>
  );
}

export const metadata = {
  title: "Programs",
  description: "Manage profiles linked to programs in the platform system",
};
