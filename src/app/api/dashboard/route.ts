import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"

interface TaskRow { completed: boolean; id: string; text: string }
interface PhaseRow { id: string; name: string; tasks: TaskRow[] }
interface SubjectRow {
  id: string
  name: string
  priority: string
  status: string
  updatedAt: Date
  phases: PhaseRow[]
}

async function getPlatformStats() {
  const totalSubjects = await prisma.subject.count()
  const completedSubjects = await prisma.subject.count({ where: { status: "Completed" } })
  const inProgressSubjects = await prisma.subject.count({ where: { status: "InProgress" } })
  const totalTasks = await prisma.task.count()
  const completedTasks = await prisma.task.count({ where: { completed: true } })
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return { totalSubjects, completedSubjects, inProgressSubjects, totalTasks, completedTasks, overallProgress }
}

export async function GET() {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as UserRole

  try {
    if (role === UserRole.ADMIN) {
      const totalUsers = await prisma.user.count()
      const stats = await getPlatformStats()

      return NextResponse.json({
        role: UserRole.ADMIN,
        totalUsers,
        ...stats,
      })
    }

    if (role === UserRole.MANAGER) {
      const stats = await getPlatformStats()
      const totalLearners = await prisma.user.count({ where: { role: "LEARNER" } })

      return NextResponse.json({
        role: UserRole.MANAGER,
        totalLearners,
        ...stats,
      })
    }

    // Learner — scoped to their own data
    const userId = session.user.id

    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: {
            tasks: { orderBy: { order: "asc" } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }) as SubjectRow[]

    const totalSubjects = subjects.length
    const completedSubjects = subjects.filter(s => s.status === "Completed").length
    const inProgressSubjects = subjects.filter(s => s.status === "InProgress").length

    const allTasks = subjects.flatMap(s => s.phases.flatMap(p => p.tasks))
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.completed).length
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Current focus: in-progress subjects with their active phase
    const currentFocus = subjects
      .filter(s => s.status === "InProgress")
      .slice(0, 3)
      .map(s => {
        const subjectTasks = s.phases.flatMap(p => p.tasks)
        const subjectCompleted = subjectTasks.filter(t => t.completed).length
        const subjectProgress = subjectTasks.length > 0
          ? Math.round((subjectCompleted / subjectTasks.length) * 100)
          : 0
        const activePhase = s.phases.find(p => p.tasks.some(t => !t.completed))
        return {
          id: s.id,
          name: s.name,
          priority: s.priority,
          progress: subjectProgress,
          completedTasks: subjectCompleted,
          totalTasks: subjectTasks.length,
          activePhase: activePhase?.name ?? null,
        }
      })

    // Recently updated subjects
    const recentlyUpdated = subjects.slice(0, 5).map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      updatedAt: s.updatedAt,
    }))

    // Upcoming: tasks not yet completed from high-priority subjects
    const upcomingTasks = subjects
      .filter(s => s.priority === "High" && s.status !== "Completed")
      .flatMap(s =>
        s.phases.flatMap(p =>
          p.tasks
            .filter(t => !t.completed)
            .map(t => ({ subjectName: s.name, phaseName: p.name, taskText: t.text, taskId: t.id }))
        )
      )
      .slice(0, 5)

    return NextResponse.json({
      role: UserRole.LEARNER,
      totalSubjects,
      completedSubjects,
      inProgressSubjects,
      totalTasks,
      completedTasks,
      overallProgress,
      currentFocus,
      recentlyUpdated,
      upcomingTasks,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
