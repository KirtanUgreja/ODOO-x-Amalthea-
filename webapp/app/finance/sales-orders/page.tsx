"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { TrendingUp, Plus, Edit, Trash2, Eye, FileText, DollarSign, Filter, Search, Download, Link as LinkIcon, Unlink, Calendar } from "lucide-react"

export default function FinanceSalesOrders() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
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
  const filteredSOs = (db.salesOrders || []).filter((so: any) => {
    const matchesFilter = filter === "all" || so.status === filter
    const matchesProject = projectFilter === "all" || so.projectId === projectFilter
    const matchesCustomer = customerFilter === "all" || so.customerName === customerFilter
    const matchesSearch = searchTerm === "" || 
      so.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.amount?.toString().includes(searchTerm)
    return matchesFilter && matchesProject && matchesCustomer && matchesSearch
  })

  // Group sales orders
  const groupedSOs = groupBy === "none" ? { "All Sales Orders": filteredSOs } :
    filteredSOs.reduce((groups: any, so: any) => {
      let key = "Ungrouped"
      if (groupBy === "project") {
        const project = db.projects?.find((p: any) => p.id === so.projectId)
        key = project?.name || "No Project"
      } else if (groupBy === "customer") {
        key = so.customerName || "Unknown Customer"
      } else if (groupBy === "state") {
        key = so.status || "No Status"
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(so)
      return groups
    }, {})

  // Calculate metrics
  const totalRevenue = filteredSOs.reduce((sum: number, so: any) => sum + (so.amount || 0), 0)
  const confirmedSOs = filteredSOs.filter((so: any) => so.status === "confirmed")
  const draftSOs = filteredSOs.filter((so: any) => so.status === "draft")
  const deliveredSOs = filteredSOs.filter((so: any) => so.status === "delivered")

  // Get unique customers and projects for filters
  const customers = [...new Set((db.salesOrders || []).map((so: any) => so.customerName).filter(Boolean))]
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
                  Sales Orders
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage customer sales orders and revenue tracking
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                  <Plus size={16} />
                  Create Sales Order
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Confirmed</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{confirmedSOs.length}</p>
                </div>
                <TrendingUp size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Draft</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{draftSOs.length}</p>
                </div>
                <FileText size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Delivered</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>{deliveredSOs.length}</p>
                </div>
                <TrendingUp size={24} style={{ color: "var(--odoo-accent)" }} />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded border w-full"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
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
                value={customerFilter} 
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Customers</option>
                {customers.map((customer: string) => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>

              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="none">No Grouping</option>
                <option value="project">Group by Project</option>
                <option value="customer">Group by Customer</option>
                <option value="state">Group by State</option>
              </select>

              <div className="flex items-center gap-2 lg:col-span-2">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search sales orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Sales Orders Table/Groups */}
          {Object.entries(groupedSOs).map(([groupName, salesOrders]: [string, any]) => (
            <div key={groupName} className="mb-6">
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 px-2" style={{ color: "var(--odoo-text)" }}>
                  {groupName} ({salesOrders.length})
                </h3>
              )}
              
              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>SO Number</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Customer</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Order Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesOrders.map((so: any, index: number) => {
                        const project = db.projects?.find((p: any) => p.id === so.projectId)
                        
                        return (
                          <tr 
                            key={so.id} 
                            style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                                {so.id}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {so.customerName || "Unknown Customer"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {project?.name || "No Project"}
                                </span>
                                {so.projectId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {so.description}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                                ₹{so.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                style={{
                                  backgroundColor: 
                                    so.status === "confirmed" ? "#28a745" :
                                    so.status === "delivered" ? "var(--odoo-accent)" :
                                    so.status === "cancelled" ? "#dc3545" : "#ffc107",
                                  color: "white"
                                }}
                              >
                                {so.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {so.createdAt ? new Date(so.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="View Sales Order"
                                >
                                  <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-blue-100"
                                  title="Create Invoice"
                                >
                                  <FileText size={16} style={{ color: "var(--odoo-primary)" }} />
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-green-100"
                                  title={so.projectId ? "Unlink from Project" : "Link to Project"}
                                >
                                  {so.projectId ? 
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

              {salesOrders.length === 0 && (
                <div className="text-center py-8">
                  <p style={{ color: "var(--odoo-muted)" }}>No sales orders found in this group.</p>
                </div>
              )}
            </div>
          ))}

          {filteredSOs.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No sales orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}