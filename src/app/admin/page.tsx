import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";
import { roleCan } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session.isAdmin || !session.role) {
    redirect("/admin/login");
  }

  const canView = roleCan(session.role, "view_sealed");

  const capsules = await prisma.capsule.findMany({
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
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-4">
      <AdminDashboard
        role={session.role}
        initialCapsules={capsules.map((capsule) => ({
          ...toCapsuleMeta(capsule),
          bodyHtml: canView ? capsule.bodyHtml : null,
        }))}
      />
    </div>
  );
}
