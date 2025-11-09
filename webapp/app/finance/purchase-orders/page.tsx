"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { ShoppingCart, Plus, Edit, Trash2, Eye, Check, X, DollarSign, Filter, Search, Download, Link as LinkIcon, Unlink, Receipt } from "lucide-react"

export default function FinancePurchaseOrders() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [vendorFilter, setVendorFilter] = useState("all")
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
  const filteredPOs = (db.purchaseOrders || []).filter((po: any) => {
    const matchesFilter = filter === "all" || po.status === filter
    const matchesProject = projectFilter === "all" || po.projectId === projectFilter
    const matchesVendor = vendorFilter === "all" || po.vendor === vendorFilter
    const matchesSearch = searchTerm === "" || 
      po.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.amount?.toString().includes(searchTerm)
    return matchesFilter && matchesProject && matchesVendor && matchesSearch
  })

  // Group purchase orders
  const groupedPOs = groupBy === "none" ? { "All Purchase Orders": filteredPOs } :
    filteredPOs.reduce((groups: any, po: any) => {
      let key = "Ungrouped"
      if (groupBy === "project") {
        const project = db.projects?.find((p: any) => p.id === po.projectId)
        key = project?.name || "No Project"
      } else if (groupBy === "vendor") {
        key = po.vendor || "Unknown Vendor"
      } else if (groupBy === "state") {
        key = po.status || "No Status"
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(po)
      return groups
    }, {})

  // Calculate metrics
  const totalAmount = filteredPOs.reduce((sum: number, po: any) => sum + (po.amount || 0), 0)
  const approvedPOs = filteredPOs.filter((po: any) => po.status === "approved")
  const pendingPOs = filteredPOs.filter((po: any) => po.status === "pending" || po.status === "draft")
  const receivedPOs = filteredPOs.filter((po: any) => po.status === "received")

  // Get unique vendors and projects for filters
  const vendors = [...new Set((db.purchaseOrders || []).map((po: any) => po.vendor).filter(Boolean))]
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
                  Purchase Orders
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage vendor purchase orders and procurement
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                  <Plus size={16} />
                  Create Purchase Order
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Amount</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Approved</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{approvedPOs.length}</p>
                </div>
                <Check size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{pendingPOs.length}</p>
                </div>
                <ShoppingCart size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Received</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>{receivedPOs.length}</p>
                </div>
                <ShoppingCart size={24} style={{ color: "var(--odoo-accent)" }} />
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="received">Received</option>
                  <option value="paid">Paid</option>
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
                value={vendorFilter} 
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Vendors</option>
                {vendors.map((vendor: string) => (
                  <option key={vendor} value={vendor}>{vendor}</option>
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
                <option value="vendor">Group by Vendor</option>
                <option value="state">Group by State</option>
              </select>

              <div className="flex items-center gap-2 lg:col-span-2">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search purchase orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Purchase Orders Table/Groups */}
          {Object.entries(groupedPOs).map(([groupName, purchaseOrders]: [string, any]) => (
            <div key={groupName} className="mb-6">
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 px-2" style={{ color: "var(--odoo-text)" }}>
                  {groupName} ({purchaseOrders.length})
                </h3>
              )}
              
              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>PO Number</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Vendor</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Order Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.map((po: any, index: number) => {
                        const project = db.projects?.find((p: any) => p.id === po.projectId)
                        
                        return (
                          <tr 
                            key={po.id} 
                            style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                                {po.id}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {po.vendor || "Unknown Vendor"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {project?.name || "No Project"}
                                </span>
                                {po.projectId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {po.description}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                                ₹{po.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                style={{
                                  backgroundColor: 
                                    po.status === "approved" ? "#28a745" :
                                    po.status === "received" ? "var(--odoo-accent)" :
                                    po.status === "paid" ? "#6f42c1" :
                                    po.status === "cancelled" ? "#dc3545" : "#ffc107",
                                  color: "white"
                                }}
                              >
                                {po.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="View Purchase Order"
                                >
                                  <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-blue-100"
                                  title="Create Vendor Bill"
                                >
                                  <Receipt size={16} style={{ color: "var(--odoo-primary)" }} />
                                </button>
                                <button 
                                  className="p-1 rounded hover:bg-green-100"
                                  title={po.projectId ? "Unlink from Project" : "Link to Project"}
                                >
                                  {po.projectId ? 
                                    <Unlink size={16} style={{ color: "#dc3545" }} /> :
                                    <LinkIcon size={16} style={{ color: "#28a745" }} />
                                  }
                                </button>
                                {po.status === "pending" && (
                                  <>
                                    <button 
                                      className="p-1 rounded hover:bg-green-100"
                                      title="Approve"
                                    >
                                      <Check size={16} style={{ color: "#28a745" }} />
                                    </button>
                                    <button 
                                      className="p-1 rounded hover:bg-red-100"
                                      title="Cancel"
                                    >
                                      <X size={16} style={{ color: "#dc3545" }} />
                                    </button>
                                  </>
                                )}
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

              {purchaseOrders.length === 0 && (
                <div className="text-center py-8">
                  <p style={{ color: "var(--odoo-muted)" }}>No purchase orders found in this group.</p>
                </div>
              )}
            </div>
          ))}

          {filteredPOs.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No purchase orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}