"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpenIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  ZapIcon,
  TargetIcon,
  ArrowRightIcon,
} from "lucide-react"
import { UserRole } from "@/types/auth"

interface CurrentFocusSubject {
  id: string
  name: string
  priority: string
  progress: number
  completedTasks: number
  totalTasks: number
  activePhase: string | null
}

interface RecentSubject {
  id: string
  name: string
  status: string
  updatedAt: string
}

interface UpcomingTask {
  taskId: string
  subjectName: string
  phaseName: string
  taskText: string
}

interface DashboardData {
  role: UserRole
  totalSubjects: number
  completedSubjects: number
  inProgressSubjects: number
  totalTasks: number
  completedTasks: number
  overallProgress: number
  totalUsers?: number
  totalLearners?: number
  currentFocus?: CurrentFocusSubject[]
  recentlyUpdated?: RecentSubject[]
  upcomingTasks?: UpcomingTask[]
}

const STATUS_LABELS: Record<string, string> = {
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

function OverviewCards({ data }: { data: DashboardData }) {
  const cards = [
    {
      label: "Total Subjects",
      value: data.totalSubjects,
      sub: "Learning subjects",
      icon: <BookOpenIcon className="size-3" />,
    },
    {
      label: "In Progress",
      value: data.inProgressSubjects,
      sub: "Currently active",
      icon: <TrendingUpIcon className="size-3" />,
    },
    {
      label: "Completed",
      value: data.completedSubjects,
      sub: "Mastered subjects",
      icon: <CheckCircleIcon className="size-3" />,
    },
    {
      label: "Overall Progress",
      value: `${data.overallProgress}%`,
      sub: `${data.completedTasks} of ${data.totalTasks} tasks done`,
      icon: <TargetIcon className="size-3" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.label} className="@container/card">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">{card.icon}</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">{card.sub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function LearnerSections({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2">
      {/* Current Focus */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ZapIcon className="size-4 text-primary" />
              Current Focus
            </CardTitle>
            <Link href="/dashboard/subjects">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRightIcon className="size-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Subjects you are actively learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!data.currentFocus || data.currentFocus.length === 0) ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No active subjects. <Link href="/dashboard/subjects" className="underline text-primary">Start one</Link>
            </div>
          ) : (
            data.currentFocus.map((s) => (
              <Link key={s.id} href={`/dashboard/subjects/${s.id}`} className="block">
                <div className="space-y-1.5 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.progress}%</span>
                  </div>
                  <Progress value={s.progress} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.completedTasks}/{s.totalTasks} tasks</span>
                    {s.activePhase && <span className="italic">{s.activePhase}</span>}
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TargetIcon className="size-4 text-primary" />
              Upcoming Milestones
            </CardTitle>
          </div>
          <CardDescription>Next tasks from your high-priority subjects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(!data.upcomingTasks || data.upcomingTasks.length === 0) ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No upcoming tasks. All high-priority tasks are complete.
            </div>
          ) : (
            data.upcomingTasks.map((t) => (
              <div key={t.taskId} className="flex items-start gap-2 rounded-lg border p-3">
                <div className="mt-0.5 size-2 rounded-full bg-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-1">{t.taskText}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.subjectName} · {t.phaseName}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recently Updated */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClockIcon className="size-4 text-primary" />
            Recently Updated
          </CardTitle>
          <CardDescription>Your latest learning activity</CardDescription>
        </CardHeader>
        <CardContent>
          {(!data.recentlyUpdated || data.recentlyUpdated.length === 0) ? (
            <div className="text-sm text-muted-foreground py-4 text-center">No recent activity.</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentlyUpdated.map((s) => (
                <Link key={s.id} href={`/dashboard/subjects/${s.id}`} className="block">
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium truncate mr-2">{s.name}</span>
                    <Badge variant={STATUS_VARIANT[s.status] ?? "outline"} className="text-xs shrink-0">
                      {STATUS_LABELS[s.status] ?? s.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PlatformOverview({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUpIcon className="size-4 text-primary" />
            Platform Progress
          </CardTitle>
          <CardDescription>Overall task completion across all subjects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-semibold">{data.overallProgress}%</span>
          </div>
          <Progress value={data.overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">{data.completedTasks} of {data.totalTasks} tasks completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersIcon className="size-4 text-primary" />
            {data.role === UserRole.ADMIN ? "Platform Users" : "Learners"}
          </CardTitle>
          <CardDescription>
            {data.role === UserRole.ADMIN ? "Total registered users" : "Total learners on the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {data.role === UserRole.ADMIN ? (data.totalUsers ?? 0) : (data.totalLearners ?? 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) throw new Error("Failed to fetch dashboard data")
        setData(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-4 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading dashboard</CardTitle>
            <CardDescription>{error || "No data available"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OverviewCards data={data} />
      {data.role === UserRole.LEARNER ? (
        <LearnerSections data={data} />
      ) : (
        <PlatformOverview data={data} />
      )}
    </div>
  )
}
