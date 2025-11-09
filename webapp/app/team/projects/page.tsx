"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Calendar, DollarSign, Users, Clock } from "lucide-react"

export default function EmployeeProjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) return <div>Loading...</div>

  const myProjects = db.projects.filter((p: any) => p.teamMembers.includes(user?.id))
  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user?.id)
  const myTimesheets = db.timesheets.filter((ts: any) => ts.userId === user?.id)

  const getProjectStats = (projectId: string) => {
    const tasks = myTasks.filter(t => t.projectId === projectId)
    const completed = tasks.filter(t => t.status === "done").length
    const hours = myTimesheets.filter(ts => ts.projectId === projectId).reduce((sum, ts) => sum + ts.hours, 0)
    return { tasks: tasks.length, completed, hours, progress: tasks.length ? (completed / tasks.length) * 100 : 0 }
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>My Projects</h1>
            <p style={{ color: "var(--odoo-muted)" }}>Projects you're assigned to and your contributions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myProjects.map((project: any) => {
              const stats = getProjectStats(project.id)
              return (
                <div key={project.id} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: "var(--odoo-text)" }}>{project.name}</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--odoo-muted)" }}>{project.description}</p>
                    </div>
                    <Badge className={project.status === "in_progress" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Task Progress</span>
                        <span>{stats.completed}/{stats.tasks} completed</span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>{stats.tasks} tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>{stats.hours}h logged</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <span>₹{project.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>{new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}