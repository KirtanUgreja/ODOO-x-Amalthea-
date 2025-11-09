"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, DollarSign, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function ViewProjectPage() {
  const { user } = useAuth()
  const { db, loading, error } = useDb()
  const params = useParams()
  const projectId = params.id as string

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  if (!db || !user) return <div className="flex items-center justify-center h-screen">No data available</div>

  const project = db.projects.find((p: any) => p.id === projectId)
  if (!project) return <div className="flex items-center justify-center h-screen">Project not found</div>

  const projectTasks = db.tasks.filter((t: any) => t.projectId === projectId)
  const projectTimesheets = db.timesheets.filter((ts: any) => ts.projectId === projectId)
  const projectExpenses = db.expenses.filter((e: any) => e.projectId === projectId)
  
  const completedTasks = projectTasks.filter((t: any) => t.status === "done")
  const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
  const totalHours = projectTimesheets.reduce((sum: number, ts: any) => sum + ts.hours, 0)
  const totalExpenses = projectExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
  const delayedTasks = projectTasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "done")

  const getStatusColor = (status: string) => {
    const colors = {
      planned: "#6c757d",
      in_progress: "#007bff",
      on_hold: "#ffc107",
      completed: "#28a745"
    }
    return colors[status as keyof typeof colors] || "#6c757d"
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-6">
            <Link href="/pm/projects">
              <Button variant="outline" className="mb-4">
                <ArrowLeft size={16} className="mr-2" />
                Back to Projects
              </Button>
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  {project.name}
                </h1>
                <span 
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <Link href={`/pm/projects/${projectId}/edit`}>
                <Button>Edit Project</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h2 className="text-xl font-bold mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p style={{ color: "var(--odoo-muted)" }}>{project.description || "No description provided"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} style={{ color: "var(--odoo-primary)" }} />
                      <div>
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Start Date</p>
                        <p>{new Date(project.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar size={16} style={{ color: "var(--odoo-primary)" }} />
                      <div>
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>End Date</p>
                        <p>{new Date(project.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign size={16} style={{ color: "var(--odoo-primary)" }} />
                    <div>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Budget</p>
                      <p className="text-lg font-semibold">₹{project.budget?.toLocaleString() || "0"}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full" 
                        style={{ 
                          width: `${progress}%`, 
                          backgroundColor: "var(--odoo-primary)" 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
                <div className="space-y-3">
                  {projectTasks.slice(0, 5).map((task: any) => {
                    const assignee = db.users.find((u: any) => u.id === task.assignedTo)
                    const isDelayed = new Date(task.dueDate) < new Date() && task.status !== "done"
                    
                    return (
                      <div key={task.id} className="p-3 rounded border-l-4" style={{ 
                        backgroundColor: "var(--odoo-light-bg)",
                        borderLeftColor: isDelayed ? "#dc3545" : "var(--odoo-primary)"
                      }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {assignee?.name} • Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          {isDelayed && <AlertCircle size={16} className="text-red-500" />}
                        </div>
                      </div>
                    )
                  })}
                  {projectTasks.length === 0 && (
                    <p style={{ color: "var(--odoo-muted)" }}>No tasks created yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="font-bold mb-4">Project Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm">Total Tasks</span>
                    </div>
                    <span className="font-semibold">{projectTasks.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="font-semibold">{completedTasks.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      <span className="text-sm">Delayed</span>
                    </div>
                    <span className="font-semibold">{delayedTasks.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      <span className="text-sm">Hours Logged</span>
                    </div>
                    <span className="font-semibold">{totalHours}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-purple-500" />
                      <span className="text-sm">Expenses</span>
                    </div>
                    <span className="font-semibold">₹{totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href={`/pm/tasks?project=${projectId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      View All Tasks
                    </Button>
                  </Link>
                  <Link href={`/pm/timesheets?project=${projectId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      View Timesheets
                    </Button>
                  </Link>
                  <Link href={`/pm/expenses?project=${projectId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      View Expenses
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}