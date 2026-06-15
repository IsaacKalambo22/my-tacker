import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toggleTaskSchema } from '@/lib/zod-schemas';

const SubjectStatus = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Paused: 'Paused',
  Completed: 'Completed',
} as const
type SubjectStatus = typeof SubjectStatus[keyof typeof SubjectStatus]

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = toggleTaskSchema.parse(body);

    // Verify task belongs to user through subject ownership
    const task = await prisma.task.findUnique({
      where: { id: validated.taskId },
      include: {
        phase: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!task || task.phase.subject.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: validated.taskId },
      data: {
        completed: validated.completed,
        completedAt: validated.completed ? new Date() : null,
      },
    });

    // Auto-advance subject status based on overall task completion
    const subject = task.phase.subject
    const allTasks = await prisma.task.findMany({
      where: { phase: { subjectId: subject.id } },
    })
    const totalTasks = allTasks.length
    const doneTasks = allTasks.filter((t: { id: string; completed: boolean }) =>
      t.id === validated.taskId ? validated.completed : t.completed
    ).length

    let newStatus: SubjectStatus | undefined  
    if (doneTasks === 0 && subject.status === SubjectStatus.InProgress) {
      newStatus = SubjectStatus.NotStarted
    } else if (doneTasks > 0 && doneTasks < totalTasks && subject.status === SubjectStatus.NotStarted) {
      newStatus = SubjectStatus.InProgress
    } else if (doneTasks === totalTasks) {
      newStatus = SubjectStatus.Completed
    } else if (doneTasks > 0 && doneTasks < totalTasks && subject.status === SubjectStatus.Completed) {
      newStatus = SubjectStatus.InProgress
    }

    await prisma.subject.update({
      where: { id: subject.id },
      data: {
        updatedAt: new Date(),
        ...(newStatus ? { status: newStatus } : {}),
      },
    })

    return NextResponse.json({ task: updatedTask, statusChanged: newStatus ?? null });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error toggling task:', error);
    return NextResponse.json(
      { error: 'Failed to toggle task' },
      { status: 500 }
    );
  }
}
