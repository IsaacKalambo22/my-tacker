import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardCards } from "@/components/dashboard-cards"
import { AuthGuard } from "@/components/auth-guard"

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/login")
  
  return (
    <AuthGuard>
      <DashboardLayout>
        <DashboardCards />
      </DashboardLayout>
    </AuthGuard>
  )
}
