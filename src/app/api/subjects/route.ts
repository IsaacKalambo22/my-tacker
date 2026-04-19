import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSubjectSchema } from '@/lib/zod-schemas';
import { learningTemplate } from '@/lib/learning-template';

// GET - Fetch all subjects for logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      include: {
        phases: {
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// POST - Create new subject with default phases and tasks
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
    const validated = createSubjectSchema.parse(body);

    // Create subject with phases and tasks
    const subject = await prisma.subject.create({
      data: {
        name: validated.name,
        priority: validated.priority,
        targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
        userId: session.user.id,
        phases: {
          create: Object.entries(learningTemplate).map(([name, tasks], index) => ({
            name,
            order: index,
            tasks: {
              create: tasks.map((text, taskIndex) => ({
                text,
                order: taskIndex,
              })),
            },
          })),
        },
      },
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}
