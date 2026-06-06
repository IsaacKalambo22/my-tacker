import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpenIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

export default async function SubjectsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const isAdmin = session.user.role === "ADMIN"
  
  const subjects = isAdmin 
    ? await prisma.subject.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          } as any,
          phases: {
            include: {
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : await prisma.subject.findMany({
        where: { userId: session.user.id },
        include: {
          phases: {
            include: {
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Subjects</h1>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Subject
            </Button>
          </div>
          
          <div className="grid gap-4">
            {subjects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpenIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No subjects found</p>
                  <Button className="mt-4">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create your first subject
                  </Button>
                </CardContent>
              </Card>
            ) : (
              subjects.map((subject) => {
                const totalTasks = subject.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)
                const completedTasks = subject.phases.reduce((sum, phase) => 
                  sum + phase.tasks.filter(t => t.completed).length, 0)
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                return (
                  <Card key={subject.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{subject.name}</CardTitle>
                          {isAdmin && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {(subject as any).user?.name || (subject as any).user?.email}
                            </p>
                          )}
                        </div>
                        <Badge variant={progress === 100 ? "default" : "secondary"}>
                          {progress}% complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{subject.phases.length} phases</span>
                          <span>•</span>
                          <span>{totalTasks} tasks</span>
                          <span>•</span>
                          <span>{completedTasks} completed</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <Link href={`/dashboard/subjects/${subject.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
