import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleGuard } from "@/components/role-guard"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AnaTask { completed: boolean }
interface AnaPhase { name: string; tasks: AnaTask[] }
interface AnaSubject {
  id: string
  name: string
  status: string
  priority: string
  phases: AnaPhase[]
  user?: { name: string | null; email: string } | null
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const isAdmin = session.user.role === UserRole.ADMIN
  const userId = session.user.id

  const subjects = (isAdmin
    ? await prisma.subject.findMany({
        include: {
          user: { select: { name: true, email: true } },
          phases: { include: { tasks: true }, orderBy: { order: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      })
    : await prisma.subject.findMany({
        where: { userId },
        include: {
          phases: { include: { tasks: true }, orderBy: { order: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      })) as AnaSubject[]

  const subjectStats = subjects.map((s: AnaSubject) => {
    const allTasks = s.phases.flatMap((p) => p.tasks)
    const total = allTasks.length
    const done = allTasks.filter((t) => t.completed).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return {
      id: s.id,
      name: s.name,
      status: s.status as string,
      priority: s.priority as string,
      owner: isAdmin ? ((s as any).user?.name ?? (s as any).user?.email ?? "—") : null,
      total,
      done,
      pct,
      phases: s.phases.map((p) => {
        const pt = p.tasks.length
        const pd = p.tasks.filter((t) => t.completed).length
        return { name: p.name, pt, pd, ppct: pt > 0 ? Math.round((pd / pt) * 100) : 0 }
      }),
    }
  })

  const totalTasks = subjectStats.reduce((a: number, s) => a + s.total, 0)
  const doneTasks = subjectStats.reduce((a: number, s) => a + s.done, 0)
  const overallPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const byStatus: Record<string, number> = {}
  const byPriority: Record<string, number> = {}
  for (const s of subjectStats) {
    byStatus[s.status] = (byStatus[s.status] ?? 0) + 1
    byPriority[s.priority] = (byPriority[s.priority] ?? 0) + 1
  }

  const STATUS_LABEL: Record<string, string> = {
    NotStarted: "Not Started", InProgress: "In Progress", Paused: "Paused", Completed: "Completed",
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.LEARNER]}>
        <DashboardLayout>
          <div className="px-4 lg:px-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Learning Analytics</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isAdmin ? "Platform-wide learning progress" : "Your personal learning analytics"}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Subjects</CardDescription>
                  <CardTitle className="text-3xl">{subjectStats.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl">{byStatus["Completed"] ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Tasks Completed</CardDescription>
                  <CardTitle className="text-3xl">{doneTasks}/{totalTasks}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Overall Progress</CardDescription>
                  <CardTitle className="text-3xl">{overallPct}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={overallPct} className="h-1.5" />
                </CardContent>
              </Card>
            </div>

            {/* Status and Priority Distribution */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subjects by Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {Object.entries(byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm">{STATUS_LABEL[status] ?? status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.round((count / subjectStats.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(byStatus).length === 0 && (
                    <p className="text-sm text-muted-foreground">No subjects yet</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subjects by Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {Object.entries(byPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm">{priority}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.round((count / subjectStats.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(byPriority).length === 0 && (
                    <p className="text-sm text-muted-foreground">No subjects yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Per-Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subject Progress Breakdown</CardTitle>
                <CardDescription>
                  Phase-level completion for each learning subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subjectStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subjects to display</p>
                ) : (
                  subjectStats.map((s) => (
                    <div key={s.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-sm truncate">{s.name}</span>
                          {isAdmin && s.owner && (
                            <span className="text-xs text-muted-foreground shrink-0">({s.owner})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-xs">{s.priority}</Badge>
                          <span className="text-sm font-semibold tabular-nums">{s.pct}%</span>
                        </div>
                      </div>
                      <Progress value={s.pct} className="h-1.5" />
                      <div className="grid grid-cols-5 gap-1">
                        {s.phases.map((p) => (
                          <div key={p.name} className="space-y-0.5">
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/70 rounded-full"
                                style={{ width: `${p.ppct}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground truncate leading-tight">{p.pd}/{p.pt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
