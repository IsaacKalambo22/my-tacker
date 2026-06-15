export interface TaskLike {
  completed: boolean
}

export interface PhaseLike {
  tasks: TaskLike[]
}

export interface SubjectLike {
  phases: PhaseLike[]
}

export function calcTaskProgress(tasks: TaskLike[]): number {
  if (tasks.length === 0) return 0
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
}

export function calcPhaseProgress(phase: PhaseLike): number {
  return calcTaskProgress(phase.tasks)
}

export function calcSubjectProgress(subject: SubjectLike): number {
  const allTasks = subject.phases.flatMap((p) => p.tasks)
  return calcTaskProgress(allTasks)
}

export function calcOverallProgress(subjects: SubjectLike[]): number {
  const allTasks = subjects.flatMap((s) => s.phases.flatMap((p) => p.tasks))
  return calcTaskProgress(allTasks)
}

export function countCompletedTasks(subject: SubjectLike): number {
  return subject.phases.flatMap((p) => p.tasks).filter((t) => t.completed).length
}

export function countTotalTasks(subject: SubjectLike): number {
  return subject.phases.flatMap((p) => p.tasks).length
}

export function isSubjectComplete(subject: SubjectLike): boolean {
  const tasks = subject.phases.flatMap((p) => p.tasks)
  return tasks.length > 0 && tasks.every((t) => t.completed)
}
