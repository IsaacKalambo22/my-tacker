"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookOpenIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  LayersIcon,
  CheckCircleIcon,
} from "lucide-react"

interface SubjectTask { id: string; text: string; completed: boolean }
interface SubjectPhase { id: string; name: string; order: number; tasks: SubjectTask[] }
export interface SubjectItem {
  id: string
  name: string
  description: string | null
  category: string | null
  difficulty: string | null
  priority: string
  status: string
  targetDate: string | null
  startDate: string
  ownerName: string | null
  phases: SubjectPhase[]
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

function calcProgress(phases: SubjectPhase[]): { progress: number; completed: number; total: number } {
  const total = phases.reduce((s, p) => s + p.tasks.length, 0)
  const completed = phases.reduce((s, p) => s + p.tasks.filter((t) => t.completed).length, 0)
  return { progress: total > 0 ? Math.round((completed / total) * 100) : 0, completed, total }
}

interface FormState {
  name: string
  description: string
  category: string
  difficulty: string
  priority: string
  status: string
  targetDate: string
}

const defaultForm: FormState = {
  name: "",
  description: "",
  category: "",
  difficulty: "",
  priority: "Medium",
  status: "NotStarted",
  targetDate: "",
}

function AddSubjectDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<FormState>(defaultForm)

  const set = (field: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Subject name is required"); return }
    setError("")
    setSubmitting(true)
    try {
      const body = {
        name: form.name.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        difficulty: form.difficulty || undefined,
        priority: form.priority,
        status: form.status,
        targetDate: form.targetDate || undefined,
      }
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to create subject")
      setForm(defaultForm)
      setOpen(false)
      onCreated()
    } catch (e) {
      setError("Failed to create subject. Please try again.")
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Subject
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Learning Subject</DialogTitle>
          <DialogDescription>
            Start tracking your progress on a new technology, skill, or certification.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Subject / Technology Name *</Label>
            <Input
              id="name"
              placeholder="e.g., React, Python, AWS, Docker"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of what you want to learn"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Frontend, DevOps"
                value={form.category}
                onChange={(e) => set("category")(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty || undefined}
                onValueChange={(v) => set("difficulty")(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority *</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority")(v ?? "Medium")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status")(v ?? "NotStarted")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NotStarted">Not Started</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetDate">Target Completion Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={form.targetDate}
              onChange={(e) => set("targetDate")(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface SubjectListClientProps {
  subjects: SubjectItem[]
  isAdmin: boolean
}

export function SubjectListClient({ subjects: initialSubjects, isAdmin }: SubjectListClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")

  const handleCreated = () => {
    router.refresh()
  }

  const filtered = filter === "all"
    ? initialSubjects
    : initialSubjects.filter((s) => s.status === filter)

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning Subjects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {initialSubjects.length} subject{initialSubjects.length !== 1 ? "s" : ""} · {initialSubjects.filter((s) => s.status === "InProgress").length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="NotStarted">Not Started</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {!isAdmin && <AddSubjectDialog onCreated={handleCreated} />}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpenIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">
              {filter === "all" ? "No subjects yet" : `No ${STATUS_LABEL[filter] ?? filter} subjects`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === "all"
                ? "Add your first learning subject to get started."
                : "Try a different filter or add a new subject."}
            </p>
            {!isAdmin && filter === "all" && <AddSubjectDialog onCreated={handleCreated} />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject) => {
            const { progress, completed, total } = calcProgress(subject.phases)
            return (
              <Card key={subject.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug line-clamp-2">{subject.name}</CardTitle>
                    <Badge variant={STATUS_VARIANT[subject.status] ?? "outline"} className="text-xs shrink-0">
                      {STATUS_LABEL[subject.status] ?? subject.status}
                    </Badge>
                  </div>
                  {subject.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{subject.description}</p>
                  )}
                  {isAdmin && subject.ownerName && (
                    <p className="text-xs text-muted-foreground mt-1">Learner: {subject.ownerName}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={PRIORITY_VARIANT[subject.priority] ?? "outline"} className="text-xs">
                      {subject.priority}
                    </Badge>
                    {subject.category && (
                      <Badge variant="outline" className="text-xs">{subject.category}</Badge>
                    )}
                    {subject.difficulty && (
                      <Badge variant="outline" className="text-xs">{subject.difficulty}</Badge>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{completed}/{total} tasks</span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <LayersIcon className="size-3" />
                      {subject.phases.length} phases
                    </span>
                    {subject.targetDate && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {new Date(subject.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {progress === 100 && (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircleIcon className="size-3" />
                        Done
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-3">
                  <Link href={`/dashboard/subjects/${subject.id}`} className="w-full">
                    <Button variant="outline" className="w-full gap-1">
                      Open Roadmap
                      <ArrowRightIcon className="size-3" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
