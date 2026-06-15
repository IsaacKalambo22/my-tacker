import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, StarIcon, TrophyIcon } from "lucide-react"

interface ATask { id: string; completed: boolean }
interface APhase { tasks: ATask[] }
interface ASubject {
  id: string
  name: string
  status: string
  category: string | null
  difficulty: string | null
  phases: APhase[]
}

export default async function AchievementsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const subjects = (await prisma.subject.findMany({
    where: { userId: session.user.id },
    include: {
      phases: { include: { tasks: true }, orderBy: { order: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  })) as ASubject[]

  const completed = subjects.filter((s) => {
    const tasks = s.phases.flatMap((p) => p.tasks)
    return tasks.length > 0 && tasks.every((t) => t.completed)
  })

  const inProgress = subjects.filter((s) => {
    const tasks = s.phases.flatMap((p) => p.tasks)
    const done = tasks.filter((t) => t.completed).length
    return done > 0 && done < tasks.length
  })

  const totalTasks = subjects.flatMap((s) => s.phases.flatMap((p) => p.tasks)).length
  const doneTasks = subjects.flatMap((s) => s.phases.flatMap((p) => p.tasks)).filter((t) => t.completed).length

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="px-4 lg:px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your learning milestones and completed subjects
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Subjects Completed</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {completed.length}
                  <TrophyIcon className="size-6 text-primary" />
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tasks Completed</CardDescription>
                <CardTitle className="text-3xl">{doneTasks}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">of {totalTasks} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Subjects In Progress</CardDescription>
                <CardTitle className="text-3xl">{inProgress.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Completed Subjects */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrophyIcon className="size-4 text-primary" />
              Completed Subjects
            </h2>
            {completed.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <StarIcon className="size-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No completed subjects yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete all tasks in a subject to earn your first achievement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((s) => {
                  const tasks = s.phases.flatMap((p) => p.tasks)
                  return (
                    <Card key={s.id} className="border-primary/30 bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                          <CheckCircleIcon className="size-5 text-primary shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <CardTitle className="text-sm leading-snug">{s.name}</CardTitle>
                            {s.category && (
                              <CardDescription className="mt-0.5">{s.category}</CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="default" className="text-xs">Completed</Badge>
                          {s.difficulty && <Badge variant="outline" className="text-xs">{s.difficulty}</Badge>}
                          <Badge variant="outline" className="text-xs">{tasks.length} tasks</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* In Progress */}
          {inProgress.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-muted-foreground">In Progress</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((s) => {
                  const tasks = s.phases.flatMap((p) => p.tasks)
                  const done = tasks.filter((t) => t.completed).length
                  const pct = Math.round((done / tasks.length) * 100)
                  return (
                    <Card key={s.id} className="opacity-80">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{s.name}</CardTitle>
                        {s.category && <CardDescription>{s.category}</CardDescription>}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          {done}/{tasks.length} tasks — {pct}% done
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
