"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Clock, DollarSign, Award, Calendar } from "lucide-react"

export default function EmployeePerformancePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) return <div>Loading...</div>

  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user?.id)
  const myTimesheets = db.timesheets.filter((ts: any) => ts.userId === user?.id)
  const myProjects = db.projects.filter((p: any) => p.teamMembers.includes(user?.id))

  const completedTasks = myTasks.filter(t => t.status === "done").length
  const totalHours = myTimesheets.reduce((sum, ts) => sum + ts.hours, 0)
  const billableHours = myTimesheets.filter(ts => ts.billable).reduce((sum, ts) => sum + ts.hours, 0)
  const onTimeCompletion = myTasks.filter(t => t.status === "done" && new Date(t.dueDate) >= new Date()).length
  const totalEarnings = totalHours * (user?.hourlyRate || 0)

  const performanceMetrics = [
    {
      label: "Task Completion Rate",
      value: myTasks.length ? Math.round((completedTasks / myTasks.length) * 100) : 0,
      target: 85,
      icon: Target,
      color: "text-blue-600"
    },
    {
      label: "On-Time Delivery",
      value: completedTasks ? Math.round((onTimeCompletion / completedTasks) * 100) : 0,
      target: 90,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      label: "Billable Hours %",
      value: totalHours ? Math.round((billableHours / totalHours) * 100) : 0,
      target: 80,
      icon: DollarSign,
      color: "text-purple-600"
    }
  ]

  const monthlyStats = [
    { month: "Jan", hours: 160, tasks: 12 },
    { month: "Feb", hours: 152, tasks: 10 },
    { month: "Mar", hours: 168, tasks: 14 },
    { month: "Apr", hours: 144, tasks: 11 },
    { month: "May", hours: 176, tasks: 15 },
    { month: "Jun", hours: 160, tasks: 13 }
  ]

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Performance Dashboard</h1>
            <p style={{ color: "var(--odoo-muted)" }}>Track your productivity and work metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Tasks Completed</span>
              </div>
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>of {myTasks.length} total</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Total Hours</span>
              </div>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{billableHours} billable</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>@ ₹{user?.hourlyRate}/hr</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Active Projects</span>
              </div>
              <p className="text-2xl font-bold">{myProjects.length}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>projects assigned</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Performance Metrics</h3>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, index) => {
                    const Icon = metric.icon
                    const isAboveTarget = metric.value >= metric.target
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${metric.color}`} />
                            <span className="text-sm font-medium">{metric.label}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${isAboveTarget ? 'text-green-600' : 'text-orange-600'}`}>
                              {metric.value}%
                            </span>
                            <span className="text-xs ml-1" style={{ color: "var(--odoo-muted)" }}>
                              (Target: {metric.target}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Recent Achievements</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Task Completion Streak</p>
                      <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>5 tasks completed on time this week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Productivity Boost</p>
                      <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>20% increase in hours logged this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Monthly Trends</h3>
                <div className="space-y-4">
                  {monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded" 
                         style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span className="font-medium">{stat.month}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{stat.hours}h</span>
                        <span>{stat.tasks} tasks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Work Distribution</h3>
                <div className="space-y-3">
                  {myProjects.map((project: any) => {
                    const projectTasks = myTasks.filter(t => t.projectId === project.id)
                    const projectHours = myTimesheets.filter(ts => ts.projectId === project.id).reduce((sum, ts) => sum + ts.hours, 0)
                    const percentage = totalHours ? Math.round((projectHours / totalHours) * 100) : 0
                    
                    return (
                      <div key={project.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{project.name}</span>
                          <span>{percentage}% ({projectHours}h)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}