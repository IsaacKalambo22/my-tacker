import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { SubjectListClient } from "@/components/SubjectListClient"

export default async function SubjectsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const isAdmin = session.user.role === "ADMIN"

  const subjects = isAdmin
    ? await prisma.subject.findMany({
        include: {
          user: { select: { name: true, email: true } },
          phases: { include: { tasks: true }, orderBy: { order: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      })
    : await prisma.subject.findMany({
        where: { userId: session.user.id },
        include: {
          phases: { include: { tasks: true }, orderBy: { order: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      })

  interface STask { id: string; text: string; completed: boolean }
  interface SPhase { id: string; name: string; order: number; tasks: STask[] }
  interface SSubject {
    id: string; name: string
    description: string | null; category: string | null; difficulty: string | null
    priority: string; status: string
    targetDate: Date | null; startDate: Date
    phases: SPhase[]
    user?: { name: string | null; email: string } | null
  }

  const serialized = (subjects as unknown as SSubject[]).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? null,
    category: s.category ?? null,
    difficulty: s.difficulty ?? null,
    priority: s.priority as string,
    status: s.status as string,
    targetDate: s.targetDate ? s.targetDate.toISOString() : null,
    startDate: s.startDate.toISOString(),
    ownerName: isAdmin ? (s.user?.name ?? s.user?.email ?? null) : null,
    phases: s.phases.map((p) => ({
      id: p.id,
      name: p.name,
      order: p.order,
      tasks: p.tasks.map((t) => ({ id: t.id, text: t.text, completed: t.completed })),
    })),
  }))

  return (
    <AuthGuard>
      <DashboardLayout>
        <SubjectListClient subjects={serialized} isAdmin={isAdmin} />
      </DashboardLayout>
    </AuthGuard>
  )
}
