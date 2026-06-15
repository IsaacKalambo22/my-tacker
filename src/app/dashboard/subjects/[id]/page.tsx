import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { SubjectDetailClient } from "@/components/SubjectDetailClient"

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          tasks: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!subject) notFound()

  const isAdmin = session.user.role === "ADMIN"
  const isOwner = subject.userId === session.user.id

  if (!isAdmin && !isOwner) redirect("/dashboard/subjects")

  interface DTask { id: string; text: string; completed: boolean; completedAt: Date | null }
  interface DPhase { id: string; name: string; order: number; tasks: DTask[] }
  interface DSubject { phases: DPhase[] }

  const typedPhases = (subject as unknown as DSubject).phases

  const serialized = {
    id: subject.id,
    name: subject.name,
    description: subject.description ?? null,
    category: subject.category ?? null,
    difficulty: subject.difficulty ?? null,
    priority: subject.priority as string,
    status: subject.status as string,
    targetDate: subject.targetDate ? subject.targetDate.toISOString() : null,
    startDate: subject.startDate.toISOString(),
    phases: typedPhases.map((p) => ({
      id: p.id,
      name: p.name,
      order: p.order,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      })),
    })),
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <SubjectDetailClient subject={serialized} />
      </DashboardLayout>
    </AuthGuard>
  )
}
