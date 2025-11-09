"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDb } from "@/hooks/use-db"
import { useRealtimeSync } from "@/hooks/use-realtime-sync"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle, CheckCircle, TrendingUp, Users, DollarSign, Calendar, ArrowRight, FileText, Target } from "lucide-react"
import Link from "next/link"

export default function PMDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, error, getProjectData, fetchDb } = useDb()
  
  // Enable real-time sync
  useRealtimeSync(fetchDb, {
    interval: 15000, // Sync every 15 seconds for dashboard
    onError: (error) => console.error('Dashboard sync error:', error)
  })

  useEffect(() => {
    if (!loading && user?.role !== "project_manager" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  }

  if (!db || !user) {
    return <div className="flex items-center justify-center h-screen">No data available</div>
  }

  const projectData = getProjectData(user.id)
  if (!projectData) {
    return <div className="flex items-center justify-center h-screen">Unable to load project data</div>
  }

  const { projects: myProjects, tasks: myTasks, delayedTasks, pendingExpenses, totalHours, totalRevenue } = projectData

  const stats = [
    {
      label: "Active Projects",
      value: myProjects.filter((p: any) => p.status === "in_progress").length,
      icon: TrendingUp,
      color: "#714B67",
      link: "/pm/projects"
    },
    { 
      label: "Delayed Tasks", 
      value: delayedTasks.length, 
      icon: AlertCircle, 
      color: "#F06050",
      link: "/pm/tasks"
    },
    { 
      label: "Hours Logged", 
      value: totalHours, 
      icon: Clock, 
      color: "#00A09D",
      link: "/pm/timesheets"
    },
    { 
      label: "Revenue Earned", 
      value: `₹${totalRevenue.toLocaleString()}`, 
      icon: CheckCircle, 
      color: "#F0AD4E",
      link: "/pm/analytics"
    },
  ]

  const quickActions = [
    { label: "New Project", icon: TrendingUp, link: "/pm/projects/new", color: "#714B67" },
    { label: "View Tasks", icon: CheckCircle, link: "/pm/tasks", color: "#007bff" },
    { label: "Manage Team", icon: Users, link: "/pm/team", color: "#28a745" },
    { label: "View Analytics", icon: FileText, link: "/pm/analytics", color: "#ffc107" },
  ]

  const getProjectProgress = (projectId: string) => {
    const tasks = myTasks.filter((t: any) => t.projectId === projectId)
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter((t: any) => t.status === "done")
    return Math.round((completedTasks.length / tasks.length) * 100)
  }

  const activeMilestones = db.milestones?.filter((m: any) => 
    myProjects.some((p: any) => p.id === m.projectId) && m.status === "in_progress"
  ).length || 0

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              Project Manager Dashboard
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Manage projects, tasks, team members, and track performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Link key={stat.label} href={stat.link}>
                  <div className="p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" style={{ backgroundColor: "var(--odoo-card)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p style={{ color: "var(--odoo-muted)" }} className="text-sm">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold mt-2" style={{ color: "var(--odoo-text)" }}>
                          {stat.value}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                        <Icon size={24} style={{ color: stat.color }} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.link}>
                  <Button className="w-full h-16 flex items-center justify-between p-4" variant="outline">
                    <div className="flex items-center gap-3">
                      <Icon size={20} style={{ color: action.color }} />
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: "var(--odoo-text)" }}>
                  My Projects
                </h2>
                <Link href="/pm/projects">
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {myProjects.slice(0, 4).map((project: any) => {
                  const progress = getProjectProgress(project.id)
                  return (
                    <div
                      key={project.id}
                      className="p-3 rounded border-l-4"
                      style={{
                        backgroundColor: "var(--odoo-light-bg)",
                        borderLeftColor: "var(--odoo-primary)",
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                          {project.name}
                        </p>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}>
                          {progress}%
                        </span>
                      </div>
                      <p style={{ color: "var(--odoo-muted)" }} className="text-sm">
                        Budget: ₹{project.budget?.toLocaleString()}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div 
                          className="h-1 rounded-full" 
                          style={{ 
                            width: `${progress}%`, 
                            backgroundColor: "var(--odoo-primary)" 
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: "var(--odoo-text)" }}>
                  Recent Tasks
                </h2>
                <Link href="/pm/tasks">
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {myTasks
                  .filter((t: any) => t.status !== "done")
                  .slice(0, 5)
                  .map((task: any) => {
                    const project = myProjects.find((p: any) => p.id === task.projectId)
                    const isDelayed = new Date(task.dueDate) < new Date()
                    return (
                      <div key={task.id} className="p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              {task.title}
                            </p>
                            <p style={{ color: "var(--odoo-muted)" }} className="text-xs">
                              {project?.name} • {task.status}
                            </p>
                          </div>
                          {isDelayed && <AlertCircle size={16} className="text-red-500" />}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                Pending Actions
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-orange-500" />
                    <span className="text-sm">Delayed Tasks</span>
                  </div>
                  <span className="font-semibold text-orange-600">{delayedTasks.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-500" />
                    <span className="text-sm">Pending Expenses</span>
                  </div>
                  <span className="font-semibold text-blue-600">{pendingExpenses.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-green-500" />
                    <span className="text-sm">Active Milestones</span>
                  </div>
                  <span className="font-semibold text-green-600">{activeMilestones}</span>
                </div>
                
                <Link href="/pm/expenses">
                  <Button className="w-full mt-4" size="sm">
                    Review Expenses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
