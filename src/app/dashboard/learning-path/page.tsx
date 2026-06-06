import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, CircleIcon } from "lucide-react"

export default async function LearningPathPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <DashboardLayout>
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold mb-6">Learning Path</h1>
          
          {subjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No learning paths available. Start by creating a subject.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {subjects.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader>
                    <CardTitle>{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {subject.phases.map((phase, phaseIndex) => {
                        const phaseTasks = phase.tasks
                        const completedTasks = phaseTasks.filter(t => t.completed).length
                        const isPhaseComplete = completedTasks === phaseTasks.length

                        return (
                          <div key={phase.id} className="relative">
                            {phaseIndex > 0 && (
                              <div className="absolute left-4 -top-6 h-6 w-0.5 bg-border" />
                            )}
                            <div className="flex items-start gap-4">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                isPhaseComplete ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}>
                                {isPhaseComplete ? (
                                  <CheckCircleIcon className="h-5 w-5" />
                                ) : (
                                  <CircleIcon className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{phase.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {completedTasks}/{phaseTasks.length} tasks
                                  </Badge>
                                </div>
                                <div className="space-y-2 ml-2">
                                  {phaseTasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-2 text-sm">
                                      {task.completed ? (
                                        <CheckCircleIcon className="h-4 w-4 text-primary" />
                                      ) : (
                                        <CircleIcon className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                        {task.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}
