import { DashboardContent } from './dashboard-content';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardContent />
    </div>
  );
}

export const metadata = {
  title: "Dashboard",
  description: "Admin dashboard overview",
};
