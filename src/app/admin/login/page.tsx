import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.isAdmin) {
    redirect("/admin");
  }

  return (
    <div className="flex justify-center px-6 pb-16 pt-8">
      <AdminLoginForm />
    </div>
  );
}
