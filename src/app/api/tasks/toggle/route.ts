import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toggleTaskSchema } from '@/lib/zod-schemas';

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

    return NextResponse.json(updatedTask);
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
