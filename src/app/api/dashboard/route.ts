import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"

export async function GET() {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as UserRole

  try {
    // Admin data
    if (role === UserRole.ADMIN) {
      const totalUsers = await prisma.user.count()
      const totalSubjects = await prisma.subject.count()
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const activeUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })

      return NextResponse.json({
        role: UserRole.ADMIN,
        totalUsers,
        activeUsers,
        totalSubjects,
        systemHealth: "operational"
      })
    }

    // Manager data
    if (role === UserRole.MANAGER) {
      const activeLearners = await prisma.user.count()
      const totalSubjects = await prisma.subject.count()
      
      const allTasks = await prisma.task.findMany()
      const completedTasks = allTasks.filter(task => task.completed).length
      const completionRate = allTasks.length > 0 
        ? Math.round((completedTasks / allTasks.length) * 100) 
        : 0

      return NextResponse.json({
        role: UserRole.MANAGER,
        activeLearners,
        completionRate,
        totalSubjects,
        pendingReviews: 0
      })
    }

    // Learner data
    const userId = session.user.id
    
    const subjectsEnrolled = await prisma.subject.count({
      where: { userId }
    })

    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    })

    let totalTasks = 0
    let completedTasks = 0
    let currentPhase = "Not started"

    subjects.forEach(subject => {
      subject.phases.forEach(phase => {
        totalTasks += phase.tasks.length
        completedTasks += phase.tasks.filter(task => task.completed).length
      })
    })

    const coursesCompleted = subjects.filter(subject => {
      const subjectTasks = subject.phases.flatMap(p => p.tasks)
      return subjectTasks.length > 0 && subjectTasks.every(t => t.completed)
    }).length

    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0

    if (subjects.length > 0 && totalTasks > 0) {
      const firstIncompletePhase = subjects[0].phases.find(phase => {
        return phase.tasks.some(task => !task.completed)
      })
      if (firstIncompletePhase) {
        currentPhase = firstIncompletePhase.name
      } else {
        currentPhase = "All phases completed"
      }
    }

    return NextResponse.json({
      role: UserRole.LEARNER,
      subjectsEnrolled,
      coursesCompleted,
      currentPhase,
      completionRate,
      totalTasks,
      completedTasks
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
