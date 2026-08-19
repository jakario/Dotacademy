import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DepartmentsClient from "./DepartmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    redirect("/th/login");
  }
  return <DepartmentsClient />;
}