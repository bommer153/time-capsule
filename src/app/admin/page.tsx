import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession, roleCan } from "@/lib/auth";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session.isAdmin || !session.role) {
    redirect("/admin/login");
  }

  const canView = roleCan(session.role, "view_sealed");
  const canManageCouriers = roleCan(session.role, "manage_couriers");

  const [capsules, couriers] = await Promise.all([
    prisma.capsule.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        category: true,
        createdAt: true,
        unlockAt: true,
        openedViaImport: true,
        bodyHtml: canView,
      },
    }),
    canManageCouriers
      ? prisma.courierAccount.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            username: true,
            createdAt: true,
            createdBy: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-4">
      <AdminDashboard
        role={session.role}
        initialCapsules={capsules.map((capsule) => ({
          ...toCapsuleMeta(capsule),
          bodyHtml: canView ? capsule.bodyHtml : null,
        }))}
        initialCouriers={couriers.map((courier) => ({
          ...courier,
          createdAt: courier.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
