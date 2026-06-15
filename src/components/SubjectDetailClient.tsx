"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  LayersIcon,
  TargetIcon,
} from "lucide-react"

interface Task {
  id: string
  text: string
  completed: boolean
  completedAt: string | null
}

interface Phase {
  id: string
  name: string
  order: number
  tasks: Task[]
}

export interface SubjectDetail {
  id: string
  name: string
  description: string | null
  category: string | null
  difficulty: string | null
  priority: string
  status: string
  targetDate: string | null
  startDate: string
  phases: Phase[]
}

const STATUS_LABEL: Record<string, string> = {
  NotStarted: "Not Started",
  InProgress: "In Progress",
  Paused: "Paused",
  Completed: "Completed",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  NotStarted: "outline",
  InProgress: "default",
  Paused: "secondary",
  Completed: "default",
}

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
}

function calcPhaseProgress(phase: Phase) {
  const total = phase.tasks.length
  const done = phase.tasks.filter((t) => t.completed).length
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

function calcSubjectProgress(phases: Phase[]) {
  const total = phases.reduce((s, p) => s + p.tasks.length, 0)
  const done = phases.reduce((s, p) => s + p.tasks.filter((t) => t.completed).length, 0)
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

interface SubjectDetailClientProps {
  subject: SubjectDetail
}

const STATUS_OPTIONS = [
  { value: "NotStarted", label: "Not Started" },
  { value: "InProgress", label: "In Progress" },
  { value: "Paused",     label: "Paused" },
  { value: "Completed",  label: "Completed" },
]

const STATUS_COLOR: Record<string, string> = {
  NotStarted: "text-muted-foreground",
  InProgress: "text-blue-600 dark:text-blue-400",
  Paused:     "text-yellow-600 dark:text-yellow-400",
  Completed:  "text-green-600 dark:text-green-400",
}

export function SubjectDetailClient({ subject: initial }: SubjectDetailClientProps) {
  const router = useRouter()
  const [phases, setPhases] = useState<Phase[]>(initial.phases)
  const [status, setStatus] = useState<string>(initial.status)
  const [pending, startTransition] = useTransition()

  const subjectProgress = calcSubjectProgress(phases)

  const changeStatus = async (newStatus: string) => {
    setStatus(newStatus)
    await fetch(`/api/subjects/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    startTransition(() => router.refresh())
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        ),
      }))
    )

    try {
      const res = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed }),
      })
      if (!res.ok) {
        setPhases((prev) =>
          prev.map((phase) => ({
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !completed } : task
            ),
          }))
        )
      } else {
        const data = await res.json()
        if (data.statusChanged) setStatus(data.statusChanged)
        startTransition(() => router.refresh())
      }
    } catch {
      setPhases((prev) =>
        prev.map((phase) => ({
          ...phase,
          tasks: phase.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !completed } : task
          ),
        }))
      )
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div className="space-y-4">
        <Link href="/dashboard/subjects">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeftIcon className="size-3.5" />
            Learning Subjects
          </Button>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl font-bold leading-tight">{initial.name}</h1>
            {initial.description && (
              <p className="text-sm text-muted-foreground">{initial.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-0.5 items-center">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => changeStatus(e.target.value)}
                  className={`appearance-none text-xs font-medium rounded-full border px-3 py-1 pr-7 bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${STATUS_COLOR[status] ?? "text-muted-foreground"}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 opacity-60" />
              </div>
              <Badge variant={PRIORITY_VARIANT[initial.priority] ?? "outline"}>
                {initial.priority} Priority
              </Badge>
              {initial.category && <Badge variant="outline">{initial.category}</Badge>}
              {initial.difficulty && <Badge variant="outline">{initial.difficulty}</Badge>}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1 text-right">
            <span className="text-3xl font-bold tabular-nums">{subjectProgress.pct}%</span>
            <span className="text-xs text-muted-foreground">
              {subjectProgress.done}/{subjectProgress.total} tasks
            </span>
            {initial.targetDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="size-3" />
                Due {new Date(initial.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        <Progress value={subjectProgress.pct} className="h-2" indicatorClassName={subjectProgress.pct === 100 ? "bg-green-500" : "bg-green-400"} />
      </div>

      {/* Overall Phase Summary */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {phases.map((phase) => {
          const { done, total, pct } = calcPhaseProgress(phase)
          const isComplete = pct === 100
          return (
            <div
              key={phase.id}
              className={`rounded-lg border p-3 space-y-1.5 ${isComplete ? "border-green-400/40 bg-green-500/5" : ""}`}
            >
              <div className="flex items-center gap-1.5">
                {isComplete ? (
                  <CheckCircleIcon className="size-3.5 text-green-500 shrink-0" />
                ) : (
                  <CircleIcon className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-xs font-medium leading-tight line-clamp-2">{phase.name}</span>
              </div>
              <Progress value={pct} className="h-1" indicatorClassName={isComplete ? "bg-green-500" : "bg-green-400"} />
              <p className={`text-xs ${isComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>{done}/{total}</p>
            </div>
          )
        })}
      </div>

      {/* Phase Details with Tasks */}
      <div className="space-y-4">
        {phases.map((phase, phaseIndex) => {
          const { done, total, pct } = calcPhaseProgress(phase)
          const isComplete = pct === 100

          return (
            <Card key={phase.id} className={isComplete ? "border-green-400/40 dark:border-green-500/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {phaseIndex + 1}
                    </div>
                    <CardTitle className="text-base">{phase.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{done}/{total}</span>
                    <Badge variant="outline" className={`text-xs ${isComplete ? "border-green-400 text-green-600 dark:text-green-400" : ""}`}>
                      {pct}%
                    </Badge>
                  </div>
                </div>
                <Progress value={pct} className="h-1 mt-2" indicatorClassName={isComplete ? "bg-green-500" : "bg-green-400"} />
              </CardHeader>

              <CardContent className="space-y-1.5">
                {phase.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => toggleTask(task.id, checked === true)}
                      className={`mt-0.5 shrink-0 ${task.completed ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" : ""}`}
                    />
                    <span className={`text-sm leading-snug ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Message */}
      {subjectProgress.pct === 100 && (
        <Card className="border-green-400/50 bg-green-500/5">
          <CardContent className="py-8 text-center space-y-2">
            <CheckCircleIcon className="size-10 text-green-500 mx-auto" />
            <h3 className="font-semibold text-lg">Subject Complete!</h3>
            <p className="text-sm text-muted-foreground">
              You have completed all {subjectProgress.total} tasks in <strong>{initial.name}</strong>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
