"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { BarChart3, FileText, Download, Calendar, TrendingUp, DollarSign, Users, Clock, Briefcase, Eye } from "lucide-react"

export default function AdminReports() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [selectedReport, setSelectedReport] = useState("financial")
  const [dateRange, setDateRange] = useState("month")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const reports = [
    {
      id: "financial",
      title: "Financial Reports",
      description: "Revenue, expenses, profit/loss analysis",
      icon: DollarSign,
      color: "#28a745"
    },
    {
      id: "project",
      title: "Project Reports",
      description: "Project performance, budget utilization",
      icon: Briefcase,
      color: "#714B67"
    },
    {
      id: "timesheet",
      title: "Timesheet Reports",
      description: "Time tracking, billability, productivity",
      icon: Clock,
      color: "#00A09D"
    },
    {
      id: "team",
      title: "Team Performance",
      description: "Employee productivity, task completion",
      icon: Users,
      color: "#F0AD4E"
    },
    {
      id: "sales",
      title: "Sales Reports",
      description: "Sales orders, customer analysis",
      icon: TrendingUp,
      color: "#F06050"
    }
  ]

  const generateFinancialData = () => {
    const totalRevenue = db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0)
    const totalExpenses = db.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const totalCosts = db.timesheets.reduce((sum: number, t: any) => {
      const employee = db.users.find((u: any) => u.id === t.userId)
      return sum + (t.hours * (employee?.hourlyRate || 0))
    }, 0)
    
    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      costs: totalCosts,
      profit: totalRevenue - totalExpenses - totalCosts,
      margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses - totalCosts) / totalRevenue * 100) : 0
    }
  }

  const generateProjectData = () => {
    return db.projects.map((project: any) => {
      const projectTasks = db.tasks.filter((t: any) => t.projectId === project.id)
      const completedTasks = projectTasks.filter((t: any) => t.status === "completed")
      const projectHours = db.timesheets
        .filter((ts: any) => projectTasks.some((t: any) => t.id === ts.taskId))
        .reduce((sum: number, ts: any) => sum + ts.hours, 0)
      const projectCosts = db.timesheets
        .filter((ts: any) => projectTasks.some((t: any) => t.id === ts.taskId))
        .reduce((sum: number, ts: any) => {
          const employee = db.users.find((u: any) => u.id === ts.userId)
          return sum + (ts.hours * (employee?.hourlyRate || 0))
        }, 0)
      
      return {
        ...project,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        completionRate: projectTasks.length > 0 ? (completedTasks.length / projectTasks.length * 100) : 0,
        totalHours: projectHours,
        totalCosts: projectCosts,
        budgetUtilization: project.budget > 0 ? (projectCosts / project.budget * 100) : 0
      }
    })
  }

  const generateTimesheetData = () => {
    const totalHours = db.timesheets.reduce((sum: number, ts: any) => sum + ts.hours, 0)
    const billableHours = db.timesheets.filter((ts: any) => ts.billable).reduce((sum: number, ts: any) => sum + ts.hours, 0)
    
    const employeeData = db.users.filter((u: any) => u.role === 'team_member').map((employee: any) => {
      const empTimesheets = db.timesheets.filter((ts: any) => ts.userId === employee.id)
      const empHours = empTimesheets.reduce((sum: number, ts: any) => sum + ts.hours, 0)
      const empBillableHours = empTimesheets.filter((ts: any) => ts.billable).reduce((sum: number, ts: any) => sum + ts.hours, 0)
      
      return {
        ...employee,
        totalHours: empHours,
        billableHours: empBillableHours,
        billabilityRate: empHours > 0 ? (empBillableHours / empHours * 100) : 0,
        revenue: empBillableHours * employee.hourlyRate
      }
    })
    
    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      billabilityRate: totalHours > 0 ? (billableHours / totalHours * 100) : 0,
      employeeData
    }
  }

  const financialData = generateFinancialData()
  const projectData = generateProjectData()
  const timesheetData = generateTimesheetData()

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Reports & Analytics
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Comprehensive business intelligence and reporting dashboard
                </p>
              </div>
              <div className="flex gap-3">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export All
                </button>
              </div>
            </div>
          </div>

          {/* Report Categories */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {reports.map((report) => {
              const Icon = report.icon
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedReport === report.id ? "ring-2" : ""
                  }`}
                  style={{ 
                    backgroundColor: "var(--odoo-card)", 
                    borderColor: selectedReport === report.id ? report.color : "var(--odoo-border)",
                    ringColor: selectedReport === report.id ? report.color : "transparent"
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} style={{ color: report.color }} />
                    <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                      {report.title}
                    </h3>
                  </div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                    {report.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Financial Reports */}
          {selectedReport === "financial" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Revenue</h3>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>₹{financialData.revenue}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Expenses</h3>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>₹{financialData.expenses}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Labor Costs</h3>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>₹{financialData.costs}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Net Profit</h3>
                  <p className="text-2xl font-bold" style={{ color: financialData.profit >= 0 ? "#28a745" : "#dc3545" }}>
                    ₹{financialData.profit}
                  </p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Profit Margin Analysis</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold mb-2" style={{ color: financialData.margin >= 0 ? "#28a745" : "#dc3545" }}>
                    {financialData.margin.toFixed(1)}%
                  </p>
                  <p style={{ color: "var(--odoo-muted)" }}>Current Profit Margin</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Reports */}
          {selectedReport === "project" && (
            <div className="space-y-6">
              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="p-4 border-b" style={{ borderColor: "var(--odoo-border)" }}>
                  <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Project Performance Dashboard</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Tasks</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Completion</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Hours</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Budget Used</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.map((project: any, index: number) => (
                        <tr key={project.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{project.name}</td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                            {project.completedTasks}/{project.totalTasks}
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ color: project.completionRate >= 80 ? "#28a745" : project.completionRate >= 50 ? "#ffc107" : "#dc3545" }}>
                              {project.completionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{project.totalHours}h</td>
                          <td className="px-4 py-3">
                            <span style={{ color: project.budgetUtilization > 100 ? "#dc3545" : "#28a745" }}>
                              {project.budgetUtilization.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded text-xs font-semibold capitalize" style={{ backgroundColor: "var(--odoo-primary)", color: "white" }}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Timesheet Reports */}
          {selectedReport === "timesheet" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Hours</h3>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{timesheetData.totalHours}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Billable Hours</h3>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{timesheetData.billableHours}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Non-Billable</h3>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{timesheetData.nonBillableHours}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Billability Rate</h3>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>{timesheetData.billabilityRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="p-4 border-b" style={{ borderColor: "var(--odoo-border)" }}>
                  <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Employee Productivity Report</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Employee</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Total Hours</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Billable Hours</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Billability %</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheetData.employeeData.map((employee: any, index: number) => (
                        <tr key={employee.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{employee.name}</td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{employee.totalHours}h</td>
                          <td className="px-4 py-3" style={{ color: "#28a745" }}>{employee.billableHours}h</td>
                          <td className="px-4 py-3">
                            <span style={{ color: employee.billabilityRate >= 80 ? "#28a745" : employee.billabilityRate >= 60 ? "#ffc107" : "#dc3545" }}>
                              {employee.billabilityRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>₹{employee.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Team Performance */}
          {selectedReport === "team" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Team Members</h3>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.users.filter((u: any) => u.role === 'team_member').length}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Active Tasks</h3>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{db.tasks.filter((t: any) => t.status === 'in_progress').length}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Completed Tasks</h3>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{db.tasks.filter((t: any) => t.status === 'completed').length}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Overdue Tasks</h3>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{db.tasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== 'completed').length}</p>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="p-4 border-b" style={{ borderColor: "var(--odoo-border)" }}>
                  <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Team Member Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Member</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Assigned Tasks</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Completed</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Completion Rate</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Hours Logged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.users.filter((u: any) => u.role === 'team_member').map((member: any, index: number) => {
                        const memberTasks = db.tasks.filter((t: any) => t.assignedTo === member.id)
                        const completedTasks = memberTasks.filter((t: any) => t.status === 'completed')
                        const memberHours = db.timesheets.filter((ts: any) => ts.userId === member.id).reduce((sum: number, ts: any) => sum + ts.hours, 0)
                        const completionRate = memberTasks.length > 0 ? (completedTasks.length / memberTasks.length * 100) : 0
                        
                        return (
                          <tr key={member.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{member.name}</td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{memberTasks.length}</td>
                            <td className="px-4 py-3" style={{ color: "#28a745" }}>{completedTasks.length}</td>
                            <td className="px-4 py-3">
                              <span style={{ color: completionRate >= 80 ? "#28a745" : completionRate >= 60 ? "#ffc107" : "#dc3545" }}>
                                {completionRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{memberHours}h</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sales Reports */}
          {selectedReport === "sales" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Sales Orders</h3>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{db.salesOrders.length}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Confirmed Orders</h3>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{db.salesOrders.filter((so: any) => so.status === 'confirmed').length}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Draft Orders</h3>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{db.salesOrders.filter((so: any) => so.status === 'draft').length}</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Average Deal Size</h3>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>₹{db.salesOrders.length > 0 ? Math.round(db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0) / db.salesOrders.length) : 0}</p>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="p-4 border-b" style={{ borderColor: "var(--odoo-border)" }}>
                  <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Sales Orders Overview</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Customer</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Order Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.salesOrders.map((order: any, index: number) => (
                        <tr key={order.id} style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>{order.customerName}</td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>₹{order.amount}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded text-xs font-semibold capitalize" style={{ 
                              backgroundColor: order.status === 'confirmed' ? "#28a745" : "#ffc107", 
                              color: "white" 
                            }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                            {order.projectId ? db.projects.find((p: any) => p.id === order.projectId)?.name || 'Unknown' : 'No Project'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Customer Analysis</h3>
                  <div className="space-y-3">
                    {db.customers.map((customer: any) => {
                      const customerOrders = db.salesOrders.filter((so: any) => so.customerName === customer.name)
                      const totalValue = customerOrders.reduce((sum: number, so: any) => sum + so.amount, 0)
                      
                      return (
                        <div key={customer.id} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>{customer.name}</p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{customerOrders.length} orders</p>
                          </div>
                          <p className="font-bold" style={{ color: "#28a745" }}>₹{totalValue}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Invoice Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>Total Invoices</span>
                      <span className="font-bold" style={{ color: "var(--odoo-primary)" }}>{db.invoices.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>Sent Invoices</span>
                      <span className="font-bold" style={{ color: "#28a745" }}>{db.invoices.filter((inv: any) => inv.status === 'sent').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>Draft Invoices</span>
                      <span className="font-bold" style={{ color: "#ffc107" }}>{db.invoices.filter((inv: any) => inv.status === 'draft').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <span style={{ color: "var(--odoo-text)" }}>Total Invoice Value</span>
                      <span className="font-bold" style={{ color: "#28a745" }}>₹{db.invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}