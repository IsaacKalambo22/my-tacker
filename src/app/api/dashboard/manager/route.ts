import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"

export async function GET() {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const activeLearners = await prisma.user.count()
    const totalSubjects = await prisma.subject.count()
    
    // Calculate completion rate (completed tasks / total tasks)
    const allTasks = await prisma.task.findMany()
    const completedTasks = allTasks.filter(task => task.completed).length
    const completionRate = allTasks.length > 0 
      ? Math.round((completedTasks / allTasks.length) * 100) 
      : 0

    return NextResponse.json({
      activeLearners,
      completionRate,
      totalSubjects,
      pendingReviews: 0
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
