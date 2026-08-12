import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  const capsules = await prisma.capsule.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      createdAt: true,
      unlockAt: true,
      openedViaImport: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-4">
      <AdminDashboard initialCapsules={capsules.map(toCapsuleMeta)} />
    </div>
  );
}
