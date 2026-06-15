import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"

const VALID_STATUSES = ["NotStarted", "InProgress", "Paused", "Completed"]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const subject = await prisma.subject.findUnique({ where: { id } })
  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isAdmin = session.user.role === UserRole.ADMIN
  if (!isAdmin && subject.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.subject.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  })

  return NextResponse.json({ subject: updated })
}
