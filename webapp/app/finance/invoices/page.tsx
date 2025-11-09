"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { FileText, Plus, Edit, Trash2, Eye, Send, DollarSign, Filter, Search, Download, Link as LinkIcon, Unlink, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function FinanceInvoices() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
  const [groupBy, setGroupBy] = useState("none")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    projectId: "",
    salesOrderId: "",
    description: "",
    amount: "",
    status: "draft"
  })

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Filter and search logic
  const filteredInvoices = (db.invoices || []).filter((inv: any) => {
    const matchesFilter = filter === "all" || inv.status === filter
    const matchesProject = projectFilter === "all" || inv.projectId === projectFilter
    const matchesCustomer = customerFilter === "all" || inv.customerName === customerFilter
    const matchesSearch = searchTerm === "" || 
      inv.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.amount?.toString().includes(searchTerm)
    return matchesFilter && matchesProject && matchesCustomer && matchesSearch
  })

  // Group invoices
  const groupedInvoices = groupBy === "none" ? { "All Customer Invoices": filteredInvoices } :
    filteredInvoices.reduce((groups: any, inv: any) => {
      let key = "Ungrouped"
      if (groupBy === "project") {
        const project = db.projects?.find((p: any) => p.id === inv.projectId)
        key = project?.name || "No Project"
      } else if (groupBy === "customer") {
        key = inv.customerName || "Unknown Customer"
      } else if (groupBy === "state") {
        key = inv.status || "No Status"
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(inv)
      return groups
    }, {})

  // Calculate metrics
  const totalRevenue = filteredInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
  const paidInvoices = filteredInvoices.filter((inv: any) => inv.status === "paid")
  const sentInvoices = filteredInvoices.filter((inv: any) => inv.status === "sent")
  const draftInvoices = filteredInvoices.filter((inv: any) => inv.status === "draft")
  const overdueInvoices = filteredInvoices.filter((inv: any) => 
    inv.status === "sent" && inv.dueDate && new Date(inv.dueDate) < new Date()
  )

  // Get unique customers and projects for filters
  const customers = [...new Set((db.invoices || []).map((inv: any) => inv.customerName).filter(Boolean))]
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
                  Customer Invoices
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Generate and manage customer invoices and billing
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Invoice
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Create Invoice Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Create New Invoice</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newInvoice.customerName}
                  onChange={(e) => setNewInvoice({...newInvoice, customerName: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
                <select
                  value={newInvoice.projectId}
                  onChange={(e) => setNewInvoice({...newInvoice, projectId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Project (Optional)</option>
                  {projects.map((project: any) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={newInvoice.salesOrderId}
                  onChange={(e) => setNewInvoice({...newInvoice, salesOrderId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Sales Order (Optional)</option>
                  {(db.salesOrders || []).map((so: any) => (
                    <option key={so.id} value={so.id}>{so.id} - {so.customerName}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
              </div>
              <textarea
                placeholder="Description"
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={async () => {
                    if (!newInvoice.customerName || !newInvoice.description || !newInvoice.amount) {
                      alert('Please fill in Customer Name, Description, and Amount')
                      return
                    }
                    const invoiceData = {
                      ...newInvoice,
                      id: `inv-${Date.now()}`,
                      amount: parseFloat(newInvoice.amount),
                      invoiceDate: new Date().toISOString(),
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString()
                    }
                    await updateDb({ invoices: [...db.invoices, invoiceData] })
                    setShowCreateForm(false)
                    setNewInvoice({ customerName: "", projectId: "", salesOrderId: "", description: "", amount: "", status: "draft" })
                    alert('Invoice created successfully!')
                  }}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Invoice
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: "var(--odoo-muted)", color: "white" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Paid</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{paidInvoices.length}</p>
                </div>
                <CheckCircle size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Sent</p>
                  <p className="text-2xl font-bold" style={{ color: "#17a2b8" }}>{sentInvoices.length}</p>
                </div>
                <Send size={24} style={{ color: "#17a2b8" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Draft</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{draftInvoices.length}</p>
                </div>
                <FileText size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Overdue</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{overdueInvoices.length}</p>
                </div>
                <AlertCircle size={24} style={{ color: "#dc3545" }} />
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
                  <option value="sent">Sent</option>
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
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Invoices Table/Groups */}
          {Object.entries(groupedInvoices).map(([groupName, invoices]: [string, any]) => (
            <div key={groupName} className="mb-6">
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 px-2" style={{ color: "var(--odoo-text)" }}>
                  {groupName} ({invoices.length})
                </h3>
              )}
              
              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Invoice #</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Customer</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Sales Order</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Invoice Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Due Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any, index: number) => {
                        const project = db.projects?.find((p: any) => p.id === inv.projectId)
                        const salesOrder = db.salesOrders?.find((so: any) => so.id === inv.salesOrderId)
                        const isOverdue = inv.status === "sent" && inv.dueDate && new Date(inv.dueDate) < new Date()
                        
                        return (
                          <tr 
                            key={inv.id} 
                            style={{ 
                              backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)",
                              borderLeft: isOverdue ? "4px solid #dc3545" : "none"
                            }}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                                INV-{inv.id}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {inv.customerName || "Unknown Customer"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {project?.name || "No Project"}
                                </span>
                                {inv.projectId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {salesOrder ? `SO-${salesOrder.id}` : "No SO"}
                                </span>
                                {inv.salesOrderId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                                ₹{inv.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                style={{
                                  backgroundColor: 
                                    inv.status === "paid" ? "#28a745" :
                                    inv.status === "sent" ? (isOverdue ? "#dc3545" : "#17a2b8") :
                                    inv.status === "cancelled" ? "#6c757d" : "#ffc107",
                                  color: "white"
                                }}
                              >
                                {isOverdue ? "Overdue" : inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: isOverdue ? "#dc3545" : "var(--odoo-muted)" }}>
                              {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => alert(`Invoice Details:\nID: ${inv.id}\nCustomer: ${inv.customerName}\nAmount: ₹${inv.amount}\nStatus: ${inv.status}`)}
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="View Invoice"
                                >
                                  <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                {inv.status === "draft" && (
                                  <button 
                                    onClick={async () => {
                                      const updatedInvoices = db.invoices.map((i: any) => 
                                        i.id === inv.id ? { ...i, status: "sent" } : i
                                      )
                                      await updateDb({ invoices: updatedInvoices })
                                      alert('Invoice sent successfully!')
                                    }}
                                    className="p-1 rounded hover:bg-blue-100"
                                    title="Send Invoice"
                                  >
                                    <Send size={16} style={{ color: "var(--odoo-primary)" }} />
                                  </button>
                                )}
                                {inv.status === "sent" && (
                                  <button 
                                    onClick={async () => {
                                      const updatedInvoices = db.invoices.map((i: any) => 
                                        i.id === inv.id ? { ...i, status: "paid" } : i
                                      )
                                      await updateDb({ invoices: updatedInvoices })
                                      alert('Invoice marked as paid!')
                                    }}
                                    className="p-1 rounded hover:bg-green-100"
                                    title="Mark as Paid"
                                  >
                                    <CheckCircle size={16} style={{ color: "#28a745" }} />
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    if (confirm('Delete this invoice?')) {
                                      const updatedInvoices = db.invoices.filter((i: any) => i.id !== inv.id)
                                      await updateDb({ invoices: updatedInvoices })
                                      alert('Invoice deleted successfully!')
                                    }
                                  }}
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

              {invoices.length === 0 && (
                <div className="text-center py-8">
                  <p style={{ color: "var(--odoo-muted)" }}>No invoices found in this group.</p>
                </div>
              )}
            </div>
          ))}

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No invoices found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}