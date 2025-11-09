"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Search, Filter, Users, Briefcase, DollarSign, Clock, FileText, Eye, Edit } from "lucide-react"

export default function AdminSearch() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (searchTerm && db) {
      performSearch()
    } else {
      setResults([])
    }
  }, [searchTerm, searchType, db])

  const performSearch = () => {
    if (!searchTerm.trim()) return

    const searchResults: any[] = []
    const term = searchTerm.toLowerCase()

    // Search Users
    if (searchType === "all" || searchType === "users") {
      db.users.forEach((user: any) => {
        if (user.name.toLowerCase().includes(term) || 
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)) {
          searchResults.push({
            type: "user",
            id: user.id,
            title: user.name,
            subtitle: user.email,
            description: `Role: ${user.role.replace("_", " ")} | Rate: ₹${user.hourlyRate}/hr`,
            data: user
          })
        }
      })
    }

    // Search Projects
    if (searchType === "all" || searchType === "projects") {
      db.projects.forEach((project: any) => {
        if (project.name.toLowerCase().includes(term) || 
            project.description.toLowerCase().includes(term)) {
          const manager = db.users.find((u: any) => u.id === project.managerId)
          searchResults.push({
            type: "project",
            id: project.id,
            title: project.name,
            subtitle: `Budget: ₹${project.budget}`,
            description: `Manager: ${manager?.name || "Unassigned"} | Status: ${project.status}`,
            data: project
          })
        }
      })
    }

    // Search Tasks
    if (searchType === "all" || searchType === "tasks") {
      db.tasks.forEach((task: any) => {
        if (task.title.toLowerCase().includes(term) || 
            task.description.toLowerCase().includes(term)) {
          const assignee = db.users.find((u: any) => u.id === task.assignedTo)
          const project = db.projects.find((p: any) => p.id === task.projectId)
          searchResults.push({
            type: "task",
            id: task.id,
            title: task.title,
            subtitle: `Project: ${project?.name || "No Project"}`,
            description: `Assigned to: ${assignee?.name || "Unassigned"} | Priority: ${task.priority} | Status: ${task.status}`,
            data: task
          })
        }
      })
    }

    // Search Sales Orders
    if (searchType === "all" || searchType === "sales") {
      db.salesOrders.forEach((so: any) => {
        if (so.description.toLowerCase().includes(term) || 
            so.id.toLowerCase().includes(term)) {
          const project = db.projects.find((p: any) => p.id === so.projectId)
          searchResults.push({
            type: "sales_order",
            id: so.id,
            title: `Sales Order ${so.id}`,
            subtitle: `Amount: ₹${so.amount}`,
            description: `Project: ${project?.name || "No Project"} | Status: ${so.status}`,
            data: so
          })
        }
      })
    }

    // Search Expenses
    if (searchType === "all" || searchType === "expenses") {
      db.expenses.forEach((expense: any) => {
        if (expense.description.toLowerCase().includes(term)) {
          const employee = db.users.find((u: any) => u.id === expense.userId)
          const project = db.projects.find((p: any) => p.id === expense.projectId)
          searchResults.push({
            type: "expense",
            id: expense.id,
            title: expense.description,
            subtitle: `Amount: ₹${expense.amount}`,
            description: `Employee: ${employee?.name || "Unknown"} | Project: ${project?.name || "No Project"} | Status: ${expense.status}`,
            data: expense
          })
        }
      })
    }

    // Search Timesheets
    if (searchType === "all" || searchType === "timesheets") {
      db.timesheets.forEach((timesheet: any) => {
        if (timesheet.notes.toLowerCase().includes(term)) {
          const employee = db.users.find((u: any) => u.id === timesheet.userId)
          const task = db.tasks.find((t: any) => t.id === timesheet.taskId)
          searchResults.push({
            type: "timesheet",
            id: timesheet.id,
            title: `Timesheet Entry - ${timesheet.hours}h`,
            subtitle: `Employee: ${employee?.name || "Unknown"}`,
            description: `Task: ${task?.title || "Unknown Task"} | Date: ${new Date(timesheet.date).toLocaleDateString()} | Billable: ${timesheet.billable ? "Yes" : "No"}`,
            data: timesheet
          })
        }
      })
    }

    setResults(searchResults)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user": return Users
      case "project": return Briefcase
      case "task": return Clock
      case "sales_order": return DollarSign
      case "expense": return DollarSign
      case "timesheet": return Clock
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "user": return "#007bff"
      case "project": return "#714B67"
      case "task": return "#00A09D"
      case "sales_order": return "#28a745"
      case "expense": return "#dc3545"
      case "timesheet": return "#ffc107"
      default: return "var(--odoo-muted)"
    }
  }

  if (loading || !db) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              Global Search
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>
              Search across all system data - users, projects, tasks, financial records, and more
            </p>
          </div>

          {/* Search Interface */}
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search by document number, partner, amount, employee, project, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border text-lg"
                  style={{ 
                    borderColor: "var(--odoo-border)", 
                    backgroundColor: "var(--odoo-light-bg)",
                    color: "var(--odoo-text)"
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={searchType} 
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-4 py-3 rounded-lg border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Types</option>
                  <option value="users">Users</option>
                  <option value="projects">Projects</option>
                  <option value="tasks">Tasks</option>
                  <option value="sales">Sales Orders</option>
                  <option value="expenses">Expenses</option>
                  <option value="timesheets">Timesheets</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                Search Results ({results.length} found)
              </h2>
              
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, index) => {
                    const Icon = getTypeIcon(result.type)
                    const color = getTypeColor(result.type)
                    
                    return (
                      <div 
                        key={`${result.type}-${result.id}-${index}`}
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                        style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: color + "20" }}
                          >
                            <Icon size={20} style={{ color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                                  {result.title}
                                </h3>
                                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                                  {result.subtitle}
                                </p>
                                <p className="text-sm mt-1" style={{ color: "var(--odoo-text)" }}>
                                  {result.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                  style={{ backgroundColor: color + "20", color }}
                                >
                                  {result.type.replace("_", " ")}
                                </span>
                                <button 
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="View Details"
                                >
                                  <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="Edit"
                                >
                                  <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                  <Search size={48} className="mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
                  <p style={{ color: "var(--odoo-muted)" }}>
                    No results found for "{searchTerm}"
                  </p>
                  <p className="text-sm mt-2" style={{ color: "var(--odoo-muted)" }}>
                    Try different keywords or search in a specific category
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!searchTerm && (
            <div className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                Search Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>What you can search:</h4>
                  <ul className="space-y-1 text-sm" style={{ color: "var(--odoo-muted)" }}>
                    <li>• User names and email addresses</li>
                    <li>• Project names and descriptions</li>
                    <li>• Task titles and descriptions</li>
                    <li>• Sales order descriptions</li>
                    <li>• Expense descriptions</li>
                    <li>• Timesheet notes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Search examples:</h4>
                  <ul className="space-y-1 text-sm" style={{ color: "var(--odoo-muted)" }}>
                    <li>• "john@company.com" - Find user by email</li>
                    <li>• "website redesign" - Find related projects/tasks</li>
                    <li>• "travel" - Find travel expenses</li>
                    <li>• "SO-001" - Find sales order by number</li>
                    <li>• "design" - Find design-related items</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}