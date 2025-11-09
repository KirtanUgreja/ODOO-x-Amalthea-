"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Download, FileText, Calendar, Filter, Database, Users, Briefcase, DollarSign, Clock, CheckCircle } from "lucide-react"

export default function AdminExports() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [selectedExports, setSelectedExports] = useState<string[]>([])
  const [dateRange, setDateRange] = useState("all")
  const [format, setFormat] = useState("csv")

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const exportOptions = [
    {
      id: "users",
      title: "Users & Employees",
      description: "All user data, roles, hourly rates, contact information",
      icon: Users,
      color: "#007bff",
      count: db.users.length,
      fields: ["Name", "Email", "Role", "Hourly Rate", "Created Date"]
    },
    {
      id: "projects",
      title: "Projects",
      description: "Project details, budgets, timelines, status",
      icon: Briefcase,
      color: "#714B67",
      count: db.projects.length,
      fields: ["Name", "Manager", "Budget", "Status", "Start Date", "End Date"]
    },
    {
      id: "tasks",
      title: "Tasks",
      description: "All tasks, assignments, priorities, completion status",
      icon: CheckCircle,
      color: "#00A09D",
      count: db.tasks.length,
      fields: ["Title", "Project", "Assignee", "Priority", "Status", "Due Date"]
    },
    {
      id: "timesheets",
      title: "Timesheets",
      description: "Time entries, billable hours, employee productivity",
      icon: Clock,
      color: "#ffc107",
      count: db.timesheets.length,
      fields: ["Employee", "Task", "Hours", "Date", "Billable", "Notes"]
    },
    {
      id: "expenses",
      title: "Expenses",
      description: "Employee expenses, approvals, reimbursements",
      icon: DollarSign,
      color: "#dc3545",
      count: db.expenses.length,
      fields: ["Employee", "Amount", "Description", "Status", "Date", "Project"]
    },
    {
      id: "sales_orders",
      title: "Sales Orders",
      description: "Customer orders, revenue, project assignments",
      icon: FileText,
      color: "#28a745",
      count: db.salesOrders.length,
      fields: ["Order ID", "Customer", "Amount", "Status", "Date", "Project"]
    },
    {
      id: "purchase_orders",
      title: "Purchase Orders",
      description: "Vendor orders, procurement, costs",
      icon: FileText,
      color: "#6f42c1",
      count: db.purchaseOrders.length,
      fields: ["PO Number", "Vendor", "Amount", "Status", "Order Date", "Expected Date"]
    },
    {
      id: "invoices",
      title: "Customer Invoices",
      description: "Billing, payments, outstanding amounts",
      icon: FileText,
      color: "#fd7e14",
      count: db.invoices.length,
      fields: ["Invoice ID", "Customer", "Amount", "Status", "Due Date", "Project"]
    },
    {
      id: "vendor_bills",
      title: "Vendor Bills",
      description: "Payables, vendor payments, due dates",
      icon: FileText,
      color: "#e83e8c",
      count: db.vendorBills.length,
      fields: ["Bill Number", "Vendor", "Amount", "Status", "Due Date", "Description"]
    }
  ]

  const handleExportSelection = (exportId: string) => {
    setSelectedExports(prev => 
      prev.includes(exportId) 
        ? prev.filter(id => id !== exportId)
        : [...prev, exportId]
    )
  }

  const handleSelectAll = () => {
    if (selectedExports.length === exportOptions.length) {
      setSelectedExports([])
    } else {
      setSelectedExports(exportOptions.map(opt => opt.id))
    }
  }

  const handleExport = () => {
    // In a real application, this would trigger the actual export
    alert(`Exporting ${selectedExports.length} datasets in ${format.toUpperCase()} format for ${dateRange} period`)
  }

  const getTotalRecords = () => {
    return selectedExports.reduce((total, exportId) => {
      const option = exportOptions.find(opt => opt.id === exportId)
      return total + (option?.count || 0)
    }, 0)
  }

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
                  Data Export Center
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Export all system data for backup, analysis, or migration
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleSelectAll}
                  className="px-4 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  {selectedExports.length === exportOptions.length ? "Deselect All" : "Select All"}
                </button>
                <button 
                  onClick={handleExport}
                  disabled={selectedExports.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Download size={16} />
                  Export Selected ({selectedExports.length})
                </button>
              </div>
            </div>
          </div>

          {/* Export Configuration */}
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Export Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} style={{ color: "var(--odoo-muted)" }} />
                  <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                  Export Format
                </label>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: "var(--odoo-muted)" }} />
                  <select 
                    value={format} 
                    onChange={(e) => setFormat(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                  >
                    <option value="csv">CSV (Comma Separated)</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF Report</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                  Selected Records
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}>
                  <Database size={16} style={{ color: "var(--odoo-muted)" }} />
                  <span style={{ color: "var(--odoo-text)" }}>
                    {getTotalRecords()} records
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exportOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedExports.includes(option.id)
              
              return (
                <div
                  key={option.id}
                  onClick={() => handleExportSelection(option.id)}
                  className={`p-6 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2" : ""
                  }`}
                  style={{ 
                    backgroundColor: "var(--odoo-card)", 
                    borderColor: isSelected ? option.color : "var(--odoo-border)",
                    ringColor: isSelected ? option.color : "transparent"
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: option.color + "20" }}
                      >
                        <Icon size={20} style={{ color: option.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                          {option.title}
                        </h3>
                        <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                          {option.count} records
                        </p>
                      </div>
                    </div>
                    <div 
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? "bg-current" : ""
                      }`}
                      style={{ 
                        borderColor: isSelected ? option.color : "var(--odoo-border)",
                        color: isSelected ? option.color : "transparent"
                      }}
                    >
                      {isSelected && <CheckCircle size={12} color="white" />}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: "var(--odoo-muted)" }}>
                    {option.description}
                  </p>
                  
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                      Included Fields:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {option.fields.slice(0, 3).map((field, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: "var(--odoo-light-bg)", color: "var(--odoo-muted)" }}
                        >
                          {field}
                        </span>
                      ))}
                      {option.fields.length > 3 && (
                        <span 
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: "var(--odoo-light-bg)", color: "var(--odoo-muted)" }}
                        >
                          +{option.fields.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Export Summary */}
          {selectedExports.length > 0 && (
            <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Export Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Selected Datasets</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{selectedExports.length}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Records</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{getTotalRecords()}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Estimated Size</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>
                    {Math.round(getTotalRecords() * 0.5)}KB
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>Selected Datasets:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedExports.map(exportId => {
                    const option = exportOptions.find(opt => opt.id === exportId)
                    return (
                      <span 
                        key={exportId}
                        className="px-3 py-1 rounded text-sm"
                        style={{ backgroundColor: option?.color + "20", color: option?.color }}
                      >
                        {option?.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}