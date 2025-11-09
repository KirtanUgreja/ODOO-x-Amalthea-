"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BarChart3, TrendingUp, Clock, DollarSign, CheckCircle, Users } from "lucide-react"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { db } = useDb()

  if (!db) return <div>Loading...</div>

  const myProjects = db.projects.filter((p: any) => p.managerId === user?.id)
  const myTasks = db.tasks.filter((t: any) => 
    myProjects.some((p: any) => p.id === t.projectId)
  )
  const myTimesheets = db.timesheets.filter((ts: any) => 
    myProjects.some((p: any) => p.id === ts.projectId)
  )

  const totalProjects = myProjects.length
  const completedTasks = myTasks.filter((t: any) => t.status === "done").length
  const totalHours = myTimesheets.reduce((sum, ts: any) => sum + ts.hours, 0)
  const billableHours = myTimesheets.filter((ts: any) => ts.billable).reduce((sum, ts: any) => sum + ts.hours, 0)
  const nonBillableHours = totalHours - billableHours

  const projectProgress = myProjects.map((project: any) => {
    const projectTasks = myTasks.filter((t: any) => t.projectId === project.id)
    const completedProjectTasks = projectTasks.filter((t: any) => t.status === "done")
    const progress = projectTasks.length > 0 ? (completedProjectTasks.length / projectTasks.length) * 100 : 0
    
    const projectTimesheets = myTimesheets.filter((ts: any) => ts.projectId === project.id)
    const projectHours = projectTimesheets.reduce((sum, ts: any) => sum + ts.hours, 0)
    
    const revenue = db.salesOrders
      .filter((so: any) => so.projectId === project.id)
      .reduce((sum, so: any) => sum + so.amount, 0)
    
    const expenses = db.expenses
      .filter((e: any) => e.projectId === project.id && e.status === "approved")
      .reduce((sum, e: any) => sum + e.amount, 0)
    
    const laborCost = projectTimesheets.reduce((sum, ts: any) => {
      const user = db.users.find((u: any) => u.id === ts.userId)
      return sum + (ts.hours * (user?.hourlyRate || 0))
    }, 0)
    
    const totalCost = expenses + laborCost
    const profit = revenue - totalCost

    return {
      ...project,
      progress: Math.round(progress),
      hours: projectHours,
      revenue,
      cost: totalCost,
      profit
    }
  })

  const teamUtilization = db.users
    .filter((u: any) => u.role === "team_member")
    .map((member: any) => {
      const memberTimesheets = myTimesheets.filter((ts: any) => ts.userId === member.id)
      const memberHours = memberTimesheets.reduce((sum, ts: any) => sum + ts.hours, 0)
      const memberTasks = myTasks.filter((t: any) => t.assignedTo === member.id)
      const completedMemberTasks = memberTasks.filter((t: any) => t.status === "done")
      
      return {
        name: member.name,
        hours: memberHours,
        tasks: memberTasks.length,
        completed: completedMemberTasks.length,
        utilization: memberTasks.length > 0 ? Math.round((completedMemberTasks.length / memberTasks.length) * 100) : 0
      }
    })

  const kpiCards = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: BarChart3,
      color: "#714B67"
    },
    {
      title: "Tasks Completed", 
      value: completedTasks,
      icon: CheckCircle,
      color: "#28a745"
    },
    {
      title: "Hours Logged",
      value: totalHours,
      icon: Clock,
      color: "#007bff"
    },
    {
      title: "Billable Hours",
      value: `${billableHours}/${totalHours}`,
      icon: DollarSign,
      color: "#ffc107"
    }
  ]

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              Analytics Dashboard
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>
              Performance insights for your projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold mt-2" style={{ color: "var(--odoo-text)" }}>
                        {card.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: card.color + "20" }}>
                      <Icon size={24} style={{ color: card.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--odoo-text)" }}>
                Project Progress
              </h2>
              <div className="space-y-4">
                {projectProgress.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${project.progress}%`, 
                          backgroundColor: "var(--odoo-primary)" 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--odoo-text)" }}>
                Team Utilization
              </h2>
              <div className="space-y-4">
                {teamUtilization.map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {member.hours}h logged • {member.completed}/{member.tasks} tasks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{member.utilization}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--odoo-text)" }}>
                Project Financials
              </h2>
              <div className="space-y-4">
                {projectProgress.map((project) => (
                  <div key={project.id} className="p-4 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <h3 className="font-medium mb-2">{project.name}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p style={{ color: "var(--odoo-muted)" }}>Revenue</p>
                        <p className="font-semibold text-green-600">₹{project.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--odoo-muted)" }}>Cost</p>
                        <p className="font-semibold text-red-600">₹{project.cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--odoo-muted)" }}>Profit</p>
                        <p className={`font-semibold ${project.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{project.profit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--odoo-text)" }}>
                Hours Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <span>Billable Hours</span>
                  <span className="font-semibold text-green-600">{billableHours}h</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <span>Non-billable Hours</span>
                  <span className="font-semibold text-gray-600">{nonBillableHours}h</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded font-semibold" style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}>
                  <span>Total Hours</span>
                  <span>{totalHours}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}