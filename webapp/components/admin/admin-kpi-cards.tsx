"use client"

import { Users, Briefcase, DollarSign, AlertCircle, Clock, TrendingUp, Eye, BarChart3, Shield, CheckCircle } from "lucide-react"

interface AdminKPICardsProps {
  db: any
}

export function AdminKPICards({ db }: AdminKPICardsProps) {
  const totalHours = db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)
  const totalRevenue = db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0)
  const totalCosts = db.timesheets.reduce((sum: number, t: any) => {
    const user = db.users.find((u: any) => u.id === t.userId)
    return sum + (t.hours * (user?.hourlyRate || 0))
  }, 0)
  const delayedTasks = db.tasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "completed").length
  const billableHours = db.timesheets.filter((t: any) => t.billable).reduce((sum: number, t: any) => sum + t.hours, 0)
  const nonBillableHours = totalHours - billableHours
  const pendingExpenses = db.expenses.filter((e: any) => e.status === "pending").length
  const completedTasks = db.tasks.filter((t: any) => t.status === "completed").length
  const activeProjects = db.projects.filter((p: any) => p.status === "in_progress").length
  const workingDays = 22 // Average working days per month
  const workingHoursPerDay = 8
  const teamMembers = db.users.filter((u: any) => u.role === 'team_member')
  const expectedHours = teamMembers.length * workingHoursPerDay * workingDays
  const resourceUtilization = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0

  const kpiCards = [
    {
      title: "Organization Profit",
      value: `₹${totalRevenue - totalCosts}`,
      icon: TrendingUp,
      color: "#28a745",
      description: "Total Revenue - Total Costs"
    },
    {
      title: "Total Active Projects",
      value: activeProjects,
      icon: Briefcase,
      color: "#714B67",
      description: "All projects in progress"
    },
    {
      title: "All Users",
      value: db.users.length,
      icon: Users,
      color: "#007bff",
      description: "Total system users"
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue}`,
      icon: DollarSign,
      color: "#F0AD4E",
      description: "All sales orders combined"
    },
    {
      title: "Total Costs",
      value: `₹${totalCosts}`,
      icon: DollarSign,
      color: "#dc3545",
      description: "Employee costs based on hours"
    },
    {
      title: "Total Hours Logged",
      value: totalHours,
      icon: Clock,
      color: "#00A09D",
      description: "All timesheet entries"
    },
    {
      title: "Billable Hours",
      value: billableHours,
      icon: Clock,
      color: "#28a745",
      description: "Client billable time"
    },
    {
      title: "Non-Billable Hours",
      value: nonBillableHours,
      icon: Clock,
      color: "#ffc107",
      description: "Internal/overhead time"
    },
    {
      title: "Delayed Tasks",
      value: delayedTasks,
      icon: AlertCircle,
      color: "#F06050",
      description: "Overdue tasks across all projects"
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle,
      color: "#28a745",
      description: "Successfully finished tasks"
    },
    {
      title: "Resource Utilization",
      value: `${resourceUtilization}%`,
      icon: BarChart3,
      color: "#6f42c1",
      description: "Team capacity utilization"
    },
    {
      title: "Pending Approvals",
      value: pendingExpenses,
      icon: Shield,
      color: "#fd7e14",
      description: "Expenses awaiting approval"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {kpiCards.map((card) => {
        const Icon = card.icon
        return (
          <div 
            key={card.title} 
            className="p-6 rounded-lg shadow-sm border transition-all hover:shadow-md" 
            style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p style={{ color: "var(--odoo-muted)" }} className="text-sm font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  {card.value}
                </p>
                <p style={{ color: "var(--odoo-muted)" }} className="text-xs">
                  {card.description}
                </p>
              </div>
              <div 
                className="p-3 rounded-lg ml-4" 
                style={{ backgroundColor: card.color + "20" }}
              >
                <Icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}