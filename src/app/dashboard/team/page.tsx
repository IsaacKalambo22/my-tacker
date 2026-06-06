import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function TeamPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const learners = await prisma.user.findMany({
    where: { role: UserRole.LEARNER },
    include: {
      _count: {
        select: { subjects: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <RoleGuard allowedRoles={[UserRole.MANAGER]}>
      <DashboardLayout>
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold mb-6">Team</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learners.map((learner) => (
                  <div key={learner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{learner.name || learner.email}</p>
                      <p className="text-sm text-muted-foreground">{learner.email}</p>
                    </div>
                    <Badge variant="secondary">{learner._count.subjects} subjects</Badge>
                  </div>
                ))}
                {learners.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No team members found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}
