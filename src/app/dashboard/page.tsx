import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardCards } from "@/components/dashboard-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { AuthGuard } from "@/components/auth-guard"

import data from "./data.json"

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/login")
  
  return (
    <AuthGuard>
      <DashboardLayout>
        <DashboardCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </DashboardLayout>
    </AuthGuard>
  )
}
