import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const totalUsers = await prisma.user.count()
  const totalSubjects = await prisma.subject.count()
  const totalTasks = await prisma.task.count()
  const completedTasks = await prisma.task.count({ where: { completed: true } })
  
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  })

  const subjectsByPriority = await prisma.subject.groupBy({
    by: ['priority'],
    _count: true,
  })

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <DashboardLayout>
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalSubjects}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTasks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{completedTasks}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {usersByRole.map((item) => (
                    <div key={item.role} className="flex justify-between">
                      <span>{item.role}</span>
                      <span className="font-semibold">{item._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Subjects by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subjectsByPriority.map((item) => (
                    <div key={item.priority} className="flex justify-between">
                      <span>{item.priority}</span>
                      <span className="font-semibold">{item._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}
