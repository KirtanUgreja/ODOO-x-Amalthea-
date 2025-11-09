"use client"

import { Eye, BarChart3, Users, Briefcase, DollarSign, Clock, AlertTriangle, CheckCircle, TrendingUp, Edit, Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminOverviewSectionsProps {
  db: any
  currentView: string
}

export function AdminOverviewSections({ db, currentView }: AdminOverviewSectionsProps) {
  const router = useRouter()
  if (currentView === "admin") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* All Users Management */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <Users size={20} />
              All Users
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push('/admin/users/create')}
                className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <Plus size={16} /> Add User
              </button>
              <button 
                onClick={() => router.push('/admin/users')}
                className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
                style={{ backgroundColor: "var(--odoo-accent)" }}
              >
                <Eye size={16} /> View All
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {db.users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "var(--odoo-text)" }}>{user.name}</p>
                  <p style={{ color: "var(--odoo-muted)" }} className="text-sm">{user.email}</p>
                  <p style={{ color: "var(--odoo-muted)" }} className="text-xs">Rate: ₹{user.hourlyRate}/hr</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded text-sm font-semibold" style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}>
                    {user.role.replace("_", " ")}
                  </div>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Edit size={14} style={{ color: "var(--odoo-muted)" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Projects Management */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <Briefcase size={20} />
              All Projects
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push('/admin/projects/create')}
                className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <Plus size={16} /> Create
              </button>
              <button 
                onClick={() => router.push('/admin/analytics')}
                className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
                style={{ backgroundColor: "var(--odoo-accent)" }}
              >
                <BarChart3 size={16} /> Analytics
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {db.projects.map((project: any) => (
              <div key={project.id} className="p-3 rounded border" style={{ backgroundColor: "var(--odoo-light-bg)", borderColor: "var(--odoo-border)" }}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium" style={{ color: "var(--odoo-text)" }}>{project.name}</p>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <Edit size={14} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <Trash2 size={14} style={{ color: "#dc3545" }} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p style={{ color: "var(--odoo-muted)" }} className="text-sm">Budget: ₹{project.budget}</p>
                  <div className="px-2 py-1 rounded text-xs font-semibold" style={{
                    backgroundColor: project.status === "in_progress" ? "var(--odoo-accent)" : "var(--odoo-muted)",
                    color: "white"
                  }}>
                    {project.status}
                  </div>
                </div>
                <p style={{ color: "var(--odoo-muted)" }} className="text-xs mt-1">
                  Manager: {db.users.find((u: any) => u.id === project.managerId)?.name || "Unassigned"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <DollarSign size={20} />
              Financial Overview
            </h2>
            <button 
              onClick={() => router.push('/admin/reports')}
              className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
              style={{ backgroundColor: "var(--odoo-accent)" }}
            >
              <TrendingUp size={16} /> Reports
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-lg font-bold" style={{ color: "var(--odoo-primary)" }}>
                  ₹{db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0)}
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Revenue</p>
              </div>
              <div className="text-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-lg font-bold" style={{ color: "#dc3545" }}>
                  ₹{db.timesheets.reduce((sum: number, t: any) => {
                    const user = db.users.find((u: any) => u.id === t.userId)
                    return sum + (t.hours * (user?.hourlyRate || 0))
                  }, 0)}
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Costs</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Sales Orders</span>
                <span className="font-medium" style={{ color: "var(--odoo-text)" }}>{db.salesOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Purchase Orders</span>
                <span className="font-medium" style={{ color: "var(--odoo-text)" }}>{db.purchaseOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending Expenses</span>
                <span className="font-medium" style={{ color: "#dc3545" }}>{db.expenses.filter((e: any) => e.status === "pending").length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Management Overview */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <Clock size={20} />
              Task Management
            </h2>
            <button 
              onClick={() => router.push('/admin/tasks')}
              className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
              style={{ backgroundColor: "var(--odoo-accent)" }}
            >
              <Eye size={16} /> View All
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-lg font-bold" style={{ color: "var(--odoo-primary)" }}>{db.tasks.length}</p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Tasks</p>
              </div>
              <div className="text-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                <p className="text-lg font-bold" style={{ color: "#dc3545" }}>
                  {db.tasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "completed").length}
                </p>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Overdue</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Completed</span>
                <span className="font-medium" style={{ color: "#28a745" }}>
                  {db.tasks.filter((t: any) => t.status === "completed").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>In Progress</span>
                <span className="font-medium" style={{ color: "var(--odoo-accent)" }}>
                  {db.tasks.filter((t: any) => t.status === "in_progress").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Hours Logged</span>
                <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                  {db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health & Monitoring */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
              <BarChart3 size={20} />
              System Health
            </h2>
            <button 
              onClick={() => router.push('/admin/audit')}
              className="flex items-center gap-2 px-3 py-1 rounded text-white text-sm" 
              style={{ backgroundColor: "var(--odoo-accent)" }}
            >
              <Eye size={16} /> Audit Logs
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active Users</span>
              <span className="font-medium" style={{ color: "#28a745" }}>{db.users.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>System Utilization</span>
              <span className="font-medium" style={{ color: "var(--odoo-primary)" }}>
                {(() => {
                  const workingDays = 22
                  const workingHoursPerDay = 8
                  const teamMembers = db.users.filter((u: any) => u.role === 'team_member')
                  const expectedHours = teamMembers.length * workingHoursPerDay * workingDays
                  const totalHours = db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)
                  return expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0
                })()}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
              <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending Approvals</span>
              <span className="font-medium" style={{ color: "#ffc107" }}>
                {db.expenses.filter((e: any) => e.status === "pending").length}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--odoo-text)" }}>
            <Plus size={20} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => router.push('/admin/users/create')}
              className="flex items-center gap-3 p-3 rounded border text-left transition-colors hover:bg-gray-50" 
              style={{ borderColor: "var(--odoo-border)" }}
            >
              <Users size={16} style={{ color: "var(--odoo-primary)" }} />
              <span style={{ color: "var(--odoo-text)" }}>Create New User</span>
            </button>
            <button 
              onClick={() => router.push('/admin/projects/create')}
              className="flex items-center gap-3 p-3 rounded border text-left transition-colors hover:bg-gray-50" 
              style={{ borderColor: "var(--odoo-border)" }}
            >
              <Briefcase size={16} style={{ color: "var(--odoo-primary)" }} />
              <span style={{ color: "var(--odoo-text)" }}>Create New Project</span>
            </button>
            <button 
              onClick={() => router.push('/admin/sales-orders')}
              className="flex items-center gap-3 p-3 rounded border text-left transition-colors hover:bg-gray-50" 
              style={{ borderColor: "var(--odoo-border)" }}
            >
              <DollarSign size={16} style={{ color: "var(--odoo-primary)" }} />
              <span style={{ color: "var(--odoo-text)" }}>Create Sales Order</span>
            </button>
            <button 
              onClick={() => router.push('/admin/purchase-orders')}
              className="flex items-center gap-3 p-3 rounded border text-left transition-colors hover:bg-gray-50" 
              style={{ borderColor: "var(--odoo-border)" }}
            >
              <BarChart3 size={16} style={{ color: "var(--odoo-primary)" }} />
              <span style={{ color: "var(--odoo-text)" }}>Create Purchase Order</span>
            </button>
            <button 
              onClick={() => router.push('/admin/expenses')}
              className="flex items-center gap-3 p-3 rounded border text-left transition-colors hover:bg-gray-50" 
              style={{ borderColor: "var(--odoo-border)" }}
            >
              <DollarSign size={16} style={{ color: "var(--odoo-primary)" }} />
              <span style={{ color: "var(--odoo-text)" }}>Create Expense</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Other role views with simplified content
  if (currentView === "pm") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>Project Manager View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>My Projects</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.projects.length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Team Tasks</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.tasks.length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Pending Expenses</h3>
            <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{db.expenses.filter((e: any) => e.status === "pending").length}</p>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "team") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>Team Member View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>My Tasks</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.tasks.length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Hours Logged</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.timesheets.reduce((sum: number, t: any) => sum + t.hours, 0)}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>My Expenses</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.expenses.length}</p>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "finance") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>Finance View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Sales Orders</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.salesOrders.length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Total Revenue</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>₹{db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0)}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Purchase Orders</h3>
            <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.purchaseOrders.length}</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}