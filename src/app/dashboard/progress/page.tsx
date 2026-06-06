import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ProgressPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const isManager = session.user.role === UserRole.MANAGER
  
  if (isManager) {
    const allSubjects = await prisma.subject.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    })

    const subjectProgress = allSubjects.map((subject) => {
      const totalTasks = subject.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)
      const completedTasks = subject.phases.reduce((sum, phase) => 
        sum + phase.tasks.filter(t => t.completed).length, 0)
      return {
        ...subject,
        totalTasks,
        completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      }
    })

    return (
      <RoleGuard allowedRoles={[UserRole.MANAGER]}>
        <DashboardLayout>
          <div className="px-4 lg:px-6">
            <h1 className="text-3xl font-bold mb-6">Team Progress</h1>
            
            <div className="grid gap-4">
              {subjectProgress.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{subject.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {subject.user.name || subject.user.email}
                        </p>
                      </div>
                      <Badge variant={subject.progress === 100 ? "default" : "secondary"}>
                        {subject.progress}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {subject.completedTasks} of {subject.totalTasks} tasks completed
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    )
  }

  // Learner view
  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
    include: {
      phases: {
        include: {
          tasks: true,
        },
      },
    },
  })

  const subjectProgress = subjects.map((subject) => {
    const totalTasks = subject.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)
    const completedTasks = subject.phases.reduce((sum, phase) => 
      sum + phase.tasks.filter(t => t.completed).length, 0)
    return {
      ...subject,
      totalTasks,
      completedTasks,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  })

  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <DashboardLayout>
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold mb-6">My Progress</h1>
          
          <div className="grid gap-4">
            {subjectProgress.map((subject) => (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{subject.name}</CardTitle>
                    <Badge variant={subject.progress === 100 ? "default" : "secondary"}>
                      {subject.progress}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {subject.completedTasks} of {subject.totalTasks} tasks completed
                  </p>
                </CardContent>
              </Card>
            ))}
            {subjects.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No subjects to show progress for
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}
