"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUpIcon, TrendingDownIcon, BookOpenIcon, UsersIcon, CheckCircleIcon } from "lucide-react"
import { UserRole } from "@/types/auth"

interface DashboardData {
  totalUsers?: number
  activeUsers?: number
  totalSubjects?: number
  subjectsEnrolled?: number
  coursesCompleted?: number
  currentPhase?: string
  completionRate?: number
  activeLearners?: number
  pendingReviews?: number
  totalTasks?: number
  completedTasks?: number
  systemHealth?: string
  role?: UserRole
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const dashboardData = await response.json()
        setData(dashboardData)
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
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
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

  // Admin cards
  if (data?.role === UserRole.ADMIN) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.totalUsers || 0}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <UsersIcon className="size-3" />
                All time
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Registered users
            </div>
            <div className="text-muted-foreground">Total user count</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.activeUsers || 0}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon className="size-3" />
                Last 30 days
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Recently active
            </div>
            <div className="text-muted-foreground">Users in last 30 days</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Subjects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.totalSubjects || 0}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <BookOpenIcon className="size-3" />
                All subjects
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Learning subjects
            </div>
            <div className="text-muted-foreground">Total subjects created</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>System Health</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.systemHealth || "Unknown"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <CheckCircleIcon className="size-3" />
                Status
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              System operational
            </div>
            <div className="text-muted-foreground">All systems running</div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Manager cards
  if (data?.role === UserRole.MANAGER) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Learners</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.activeLearners || 0}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <UsersIcon className="size-3" />
                Total
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Learners enrolled
            </div>
            <div className="text-muted-foreground">Total active learners</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.completionRate || 0}%
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon className="size-3" />
                Rate
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Task completion
            </div>
            <div className="text-muted-foreground">Overall completion rate</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Subjects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.totalSubjects || 0}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <BookOpenIcon className="size-3" />
                Subjects
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Active subjects
            </div>
            <div className="text-muted-foreground">Subjects in progress</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Pending Reviews</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data.pendingReviews || 0}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <CheckCircleIcon className="size-3" />
                Reviews
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Awaiting review
            </div>
            <div className="text-muted-foreground">Items to review</div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Learner cards
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Subjects Enrolled</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.subjectsEnrolled || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpenIcon className="size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Your subjects
          </div>
          <div className="text-muted-foreground">Currently enrolled</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Courses Completed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.coursesCompleted || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCircleIcon className="size-3" />
              Done
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Completed courses
          </div>
          <div className="text-muted-foreground">Fully finished subjects</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Phase</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.currentPhase || "N/A"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon className="size-3" />
              Progress
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Learning phase
          </div>
          <div className="text-muted-foreground">Current learning stage</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.completionRate || 0}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon className="size-3" />
              Rate
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Task progress
          </div>
          <div className="text-muted-foreground">
            {data.completedTasks || 0} of {data.totalTasks || 0} tasks completed
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
