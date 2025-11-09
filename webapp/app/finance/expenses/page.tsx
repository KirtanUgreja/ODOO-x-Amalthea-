"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { Wallet, Plus, Edit, Trash2, Eye, Check, X, DollarSign, Filter, Search, Download, Link as LinkIcon, Unlink, FileText, User } from "lucide-react"

export default function FinanceExpenses() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [employeeFilter, setEmployeeFilter] = useState("all")
  const [billableFilter, setBillableFilter] = useState("all")
  const [groupBy, setGroupBy] = useState("none")

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Filter and search logic
  const filteredExpenses = (db.expenses || []).filter((exp: any) => {
    const matchesFilter = filter === "all" || exp.status === filter
    const matchesProject = projectFilter === "all" || exp.projectId === projectFilter
    const matchesEmployee = employeeFilter === "all" || exp.userId === employeeFilter
    const matchesBillable = billableFilter === "all" || 
      (billableFilter === "billable" && exp.billable) ||
      (billableFilter === "non-billable" && !exp.billable)
    const matchesSearch = searchTerm === "" || 
      exp.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.amount?.toString().includes(searchTerm)
    return matchesFilter && matchesProject && matchesEmployee && matchesBillable && matchesSearch
  })

  // Group expenses
  const groupedExpenses = groupBy === "none" ? { "All Expenses": filteredExpenses } :
    filteredExpenses.reduce((groups: any, exp: any) => {
      let key = "Ungrouped"
      if (groupBy === "project") {
        const project = db.projects?.find((p: any) => p.id === exp.projectId)
        key = project?.name || "No Project"
      } else if (groupBy === "employee") {
        const employee = db.users?.find((u: any) => u.id === exp.userId)
        key = employee?.name || "Unknown Employee"
      } else if (groupBy === "billable") {
        key = exp.billable ? "Billable" : "Non-billable"
      } else if (groupBy === "type") {
        key = exp.category || "Uncategorized"
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(exp)
      return groups
    }, {})

  // Calculate metrics
  const totalExpenses = filteredExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
  const billableExpenses = filteredExpenses.filter((exp: any) => exp.billable)
  const nonBillableExpenses = filteredExpenses.filter((exp: any) => !exp.billable)
  const pendingExpenses = filteredExpenses.filter((exp: any) => exp.status === "pending")
  const approvedExpenses = filteredExpenses.filter((exp: any) => exp.status === "approved")
  const reimbursedExpenses = filteredExpenses.filter((exp: any) => exp.status === "reimbursed")

  // Get unique employees and projects for filters
  const employees = db.users?.filter((u: any) => u.role === "team_member") || []
  const projects = db.projects || []

  return (
    <div className="flex">
      <FinanceSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Expenses
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage team expenses and reimbursements
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                  <Plus size={16} />
                  Create Expense
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Expenses</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalExpenses.toLocaleString()}</p>
                </div>
                <DollarSign size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billable</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{billableExpenses.length}</p>
                </div>
                <FileText size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Non-billable</p>
                  <p className="text-2xl font-bold" style={{ color: "#6c757d" }}>{nonBillableExpenses.length}</p>
                </div>
                <Wallet size={24} style={{ color: "#6c757d" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{pendingExpenses.length}</p>
                </div>
                <Wallet size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Approved</p>
                  <p className="text-2xl font-bold" style={{ color: "#17a2b8" }}>{approvedExpenses.length}</p>
                </div>
                <Check size={24} style={{ color: "#17a2b8" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Reimbursed</p>
                  <p className="text-2xl font-bold" style={{ color: "#6f42c1" }}>{reimbursedExpenses.length}</p>
                </div>
                <Check size={24} style={{ color: "#6f42c1" }} />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded border w-full"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="reimbursed">Reimbursed</option>
                </select>
              </div>
              
              <select 
                value={projectFilter} 
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Projects</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              <select 
                value={employeeFilter} 
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Employees</option>
                {employees.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>

              <select 
                value={billableFilter} 
                onChange={(e) => setBillableFilter(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Types</option>
                <option value="billable">Billable</option>
                <option value="non-billable">Non-billable</option>
              </select>

              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="none">No Grouping</option>
                <option value="project">Group by Project</option>
                <option value="employee">Group by Employee</option>
                <option value="billable">Group by Billable</option>
                <option value="type">Group by Type</option>
              </select>

              <div className="flex items-center gap-2 lg:col-span-2">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Expenses Table/Groups */}
          {Object.entries(groupedExpenses).map(([groupName, expenses]: [string, any]) => (
            <div key={groupName} className="mb-6">
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 px-2" style={{ color: "var(--odoo-text)" }}>
                  {groupName} ({expenses.length})
                </h3>
              )}
              
              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Expense #</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Employee</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Type</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp: any, index: number) => {
                        const project = db.projects?.find((p: any) => p.id === exp.projectId)
                        const employee = db.users?.find((u: any) => u.id === exp.userId)
                        
                        return (
                          <tr 
                            key={exp.id} 
                            style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                                EXP-{exp.id}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <User size={16} style={{ color: "var(--odoo-muted)" }} />
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {employee?.name || "Unknown Employee"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {project?.name || "No Project"}
                                </span>
                                {exp.projectId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {exp.description}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                                ₹{exp.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold"
                                style={{
                                  backgroundColor: exp.billable ? "#d4edda" : "#f8d7da",
                                  color: exp.billable ? "#155724" : "#721c24"
                                }}
                              >
                                {exp.billable ? "Billable" : "Non-billable"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                style={{
                                  backgroundColor: 
                                    exp.status === "approved" ? "#28a745" :
                                    exp.status === "reimbursed" ? "#6f42c1" :
                                    exp.status === "rejected" ? "#dc3545" : "#ffc107",
                                  color: "white"
                                }}
                              >
                                {exp.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="View Expense"
                                >
                                  <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                {exp.billable && exp.status === "approved" && (
                                  <button 
                                    className="p-1 rounded hover:bg-blue-100"
                                    title="Include in Invoice"
                                  >
                                    <FileText size={16} style={{ color: "var(--odoo-primary)" }} />
                                  </button>
                                )}
                                <button 
                                  className="p-1 rounded hover:bg-green-100"
                                  title={exp.projectId ? "Unlink from Project" : "Link to Project"}
                                >
                                  {exp.projectId ? 
                                    <Unlink size={16} style={{ color: "#dc3545" }} /> :
                                    <LinkIcon size={16} style={{ color: "#28a745" }} />
                                  }
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="Edit"
                                >
                                  <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-red-100"
                                  title="Delete"
                                >
                                  <Trash2 size={16} style={{ color: "#dc3545" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {expenses.length === 0 && (
                <div className="text-center py-8">
                  <p style={{ color: "var(--odoo-muted)" }}>No expenses found in this group.</p>
                </div>
              )}
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No expenses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}