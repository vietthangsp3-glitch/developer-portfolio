import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { requireAdmin } from "@/server/auth/session";
import { getAdminDashboardMetrics } from "@/server/dal/admin";
import { listAdminInquiries, listAdminMedia } from "@/server/dal/cms";
import { isCloudinaryConfigured } from "@/server/media/cloudinary";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [metrics, recentInquiries, media] = await Promise.all([
    getAdminDashboardMetrics(),
    listAdminInquiries(5),
    listAdminMedia(100),
  ]);

  return (
    <AdminDashboard
      metrics={metrics}
      recentInquiries={recentInquiries}
      mediaTotal={media.length}
      cloudinaryConfigured={isCloudinaryConfigured()}
    />
  );
}
