import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRightIcon, CheckCircleIcon, CircleIcon } from "lucide-react"

const STATUS_LABEL: Record<string, string> = {
  NotStarted: "Not Started",
  InProgress: "In Progress",
  Paused: "Paused",
  Completed: "Completed",
}

interface PTask { completed: boolean }
interface PPhase { id: string; name: string; tasks: PTask[] }
interface PSubject {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  phases: PPhase[]
}
interface PUser {
  id: string
  name: string | null
  email: string
  subjects: (PSubject & { phases: (PPhase & { tasks: PTask[] })[] })[]
}

export default async function ProgressPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const role = session.user.role as UserRole
  const userId = session.user.id

  // MANAGER / ADMIN: per-learner summary table
  if (role === UserRole.MANAGER || role === UserRole.ADMIN) {
    const learners = await prisma.user.findMany({
      where: { role: "LEARNER" },
      include: {
        subjects: {
          include: { phases: { include: { tasks: true } } },
        },
      },
      orderBy: { name: "asc" },
    })

    const rows = (learners as PUser[]).map((u) => {
      const allTasks = u.subjects.flatMap((s) => s.phases.flatMap((p) => p.tasks))
      const done = allTasks.filter((t) => t.completed).length
      const total = allTasks.length
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      const completedSubjects = u.subjects.filter((s) => s.status === "Completed").length
      const inProgress = u.subjects.filter((s) => s.status === "InProgress").length
      return {
        id: u.id,
        name: u.name ?? u.email,
        subjects: u.subjects.length,
        completedSubjects,
        inProgress,
        done,
        total,
        pct,
      }
    })

    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="px-4 lg:px-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Learner Progress</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Task completion overview for all learners
              </p>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-3 font-medium">Learner</th>
                        <th className="text-center px-4 py-3 font-medium">Subjects</th>
                        <th className="text-center px-4 py-3 font-medium">In Progress</th>
                        <th className="text-center px-4 py-3 font-medium">Completed</th>
                        <th className="text-left px-4 py-3 font-medium min-w-48">Overall Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No learners found
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => (
                          <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{r.name}</td>
                            <td className="px-4 py-3 text-center">{r.subjects}</td>
                            <td className="px-4 py-3 text-center">{r.inProgress}</td>
                            <td className="px-4 py-3 text-center">{r.completedSubjects}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Progress value={r.pct} className="h-1.5 flex-1" />
                                <span className="text-xs tabular-nums w-8 text-right">{r.pct}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {r.done}/{r.total} tasks
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  // LEARNER: per-subject phase-by-phase breakdown
  const subjects = (await prisma.subject.findMany({
    where: { userId },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: { tasks: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: [{ status: "asc" }, { priority: "asc" }],
  })) as PSubject[]

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="px-4 lg:px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Progress Tracking</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Phase-by-phase breakdown of your learning subjects
            </p>
          </div>

          {subjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-3">No subjects yet.</p>
                <Link href="/dashboard/subjects">
                  <Button variant="outline" size="sm">Go to Learning Subjects</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => {
                const allTasks = subject.phases.flatMap((p) => p.tasks)
                const done = allTasks.filter((t) => t.completed).length
                const total = allTasks.length
                const pct = total > 0 ? Math.round((done / total) * 100) : 0

                return (
                  <Card key={subject.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base">{subject.name}</CardTitle>
                          {subject.description && (
                            <CardDescription className="mt-0.5 line-clamp-1">
                              {subject.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-xs">{subject.priority as string}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {STATUS_LABEL[subject.status as string] ?? subject.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-sm font-semibold tabular-nums shrink-0">{pct}%</span>
                        <span className="text-xs text-muted-foreground shrink-0">{done}/{total}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 pt-0">
                      {subject.phases.map((phase) => {
                        const pt = phase.tasks.length
                        const pd = phase.tasks.filter((t) => t.completed).length
                        const ppct = pt > 0 ? Math.round((pd / pt) * 100) : 0
                        const complete = ppct === 100

                        return (
                          <div key={phase.id} className="flex items-center gap-3">
                            {complete ? (
                              <CheckCircleIcon className="size-3.5 text-primary shrink-0" />
                            ) : (
                              <CircleIcon className="size-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-sm w-40 shrink-0 truncate text-muted-foreground">
                              {phase.name}
                            </span>
                            <Progress value={ppct} className="h-1 flex-1" />
                            <span className="text-xs tabular-nums w-16 text-right shrink-0 text-muted-foreground">
                              {pd}/{pt} ({ppct}%)
                            </span>
                          </div>
                        )
                      })}
                      <div className="pt-1">
                        <Link href={`/dashboard/subjects/${subject.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2">
                            Open Roadmap <ArrowRightIcon className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
