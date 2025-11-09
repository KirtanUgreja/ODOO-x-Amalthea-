"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { TrendingUp, BarChart3, PieChart, Activity, DollarSign, Clock, Users, Briefcase } from "lucide-react"

export default function AdminAnalytics() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Calculate current month data for more relevant analytics
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const totalRevenue = db.salesOrders
    .filter((so: any) => so.status === 'confirmed')
    .reduce((sum: number, so: any) => sum + so.amount, 0)
    
  const totalCosts = db.timesheets.reduce((sum: number, t: any) => {
    const user = db.users.find((u: any) => u.id === t.userId)
    return sum + (t.hours * (user?.hourlyRate || 0))
  }, 0)
  
  const totalHours = db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)
  const billableHours = db.timesheets.filter((t: any) => t.billable).reduce((sum: number, t: any) => sum + t.hours, 0)

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              Advanced Analytics
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>
              Comprehensive organization-wide analytics and insights
            </p>
          </div>

          {/* Financial Analytics */}
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <DollarSign size={20} />
              Financial Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "#28a745" }}>₹{totalRevenue}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Revenue</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>₹{totalCosts}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Costs</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>₹{totalRevenue - totalCosts}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Net Profit</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>
                  {totalRevenue > 0 ? Math.round(((totalRevenue - totalCosts) / totalRevenue) * 100) : 0}%
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Profit Margin</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>
                  ₹{db.invoices.filter((inv: any) => inv.status === 'sent').reduce((sum: number, inv: any) => sum + inv.amount, 0)}
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Outstanding Invoices</p>
              </div>
            </div>
            
            {/* Additional Financial Metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
                <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Cash Flow</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Invoices Sent:</span>
                    <span style={{ color: "#28a745" }}>₹{db.invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Vendor Bills:</span>
                    <span style={{ color: "#dc3545" }}>₹{db.vendorBills.reduce((sum: number, vb: any) => sum + vb.amount, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Pending Expenses:</span>
                    <span style={{ color: "#ffc107" }}>₹{db.expenses.filter((e: any) => e.status === 'pending').reduce((sum: number, e: any) => sum + e.amount, 0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
                <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Order Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Confirmed Sales:</span>
                    <span style={{ color: "#28a745" }}>{db.salesOrders.filter((so: any) => so.status === 'confirmed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Draft Sales:</span>
                    <span style={{ color: "#ffc107" }}>{db.salesOrders.filter((so: any) => so.status === 'draft').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Purchase Orders:</span>
                    <span style={{ color: "var(--odoo-primary)" }}>{db.purchaseOrders.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
                <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Revenue Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Billable Revenue:</span>
                    <span style={{ color: "#28a745" }}>₹{billableHours * (db.users.find((u: any) => u.role === 'team_member')?.hourlyRate || 500)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Project Revenue:</span>
                    <span style={{ color: "var(--odoo-primary)" }}>₹{db.salesOrders.filter((so: any) => so.projectId).reduce((sum: number, so: any) => sum + so.amount, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--odoo-muted)" }}>Average Deal Size:</span>
                    <span style={{ color: "var(--odoo-text)" }}>₹{db.salesOrders.length > 0 ? Math.round(totalRevenue / db.salesOrders.length) : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Analytics */}
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <Clock size={20} />
              Resource Utilization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{totalHours}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Hours</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{billableHours}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billable Hours</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{totalHours - billableHours}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Non-Billable Hours</p>
              </div>
              <div className="text-center p-4 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>
                  {totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billability Rate</p>
              </div>
            </div>
          </div>

          {/* Project Analytics */}
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <Briefcase size={20} />
              Project Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3" style={{ color: "var(--odoo-text)" }}>Project Status Distribution</h3>
                <div className="space-y-2">
                  {['in_progress', 'completed', 'on_hold', 'cancelled'].map(status => {
                    const count = db.projects.filter((p: any) => p.status === status).length
                    const percentage = db.projects.length > 0 ? Math.round((count / db.projects.length) * 100) : 0
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="capitalize" style={{ color: "var(--odoo-text)" }}>{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span style={{ color: "var(--odoo-muted)" }}>{count}</span>
                          <span style={{ color: "var(--odoo-primary)" }}>({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3" style={{ color: "var(--odoo-text)" }}>Budget vs Actual</h3>
                <div className="space-y-3">
                  {db.projects.map((project: any) => {
                    const projectCosts = db.timesheets
                      .filter((t: any) => db.tasks.find((task: any) => task.id === t.taskId && task.projectId === project.id))
                      .reduce((sum: number, t: any) => {
                        const user = db.users.find((u: any) => u.id === t.userId)
                        return sum + (t.hours * (user?.hourlyRate || 0))
                      }, 0)
                    const budgetUsed = project.budget > 0 ? Math.round((projectCosts / project.budget) * 100) : 0
                    
                    return (
                      <div key={project.id} className="p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium" style={{ color: "var(--odoo-text)" }}>{project.name}</span>
                          <span style={{ color: budgetUsed > 100 ? "#dc3545" : "var(--odoo-primary)" }}>
                            {budgetUsed}%
                          </span>
                        </div>
                        <div className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                          ₹{projectCosts} / ₹{project.budget}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Team Analytics */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <Users size={20} />
              Team Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {db.users.filter((u: any) => u.role === 'team_member').map((user: any) => {
                const userHours = db.timesheets.filter((t: any) => t.userId === user.id).reduce((sum: number, t: any) => sum + t.hours, 0)
                const userBillableHours = db.timesheets.filter((t: any) => t.userId === user.id && t.billable).reduce((sum: number, t: any) => sum + t.hours, 0)
                const userTasks = db.tasks.filter((t: any) => t.assignedTo === user.id).length
                const completedTasks = db.tasks.filter((t: any) => t.assignedTo === user.id && t.status === 'completed').length
                const userRevenue = userBillableHours * user.hourlyRate
                const billabilityRate = userHours > 0 ? Math.round((userBillableHours / userHours) * 100) : 0
                
                return (
                  <div key={user.id} className="p-4 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
                    <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>{user.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--odoo-muted)" }}>Total Hours:</span>
                        <span style={{ color: "var(--odoo-text)" }}>{userHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--odoo-muted)" }}>Billable Hours:</span>
                        <span style={{ color: "#28a745" }}>{userBillableHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--odoo-muted)" }}>Billability Rate:</span>
                        <span style={{ color: "var(--odoo-accent)" }}>{billabilityRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--odoo-muted)" }}>Tasks Completed:</span>
                        <span style={{ color: "var(--odoo-primary)" }}>{completedTasks}/{userTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--odoo-muted)" }}>Revenue Generated:</span>
                        <span style={{ color: "#28a745" }}>₹{userRevenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--odoo-muted)" }}>Hourly Rate:</span>
                        <span style={{ color: "var(--odoo-text)" }}>₹{user.hourlyRate}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}