"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { FileText, Plus, Edit, Trash2, Eye, Send, DollarSign, Filter, Search, Download } from "lucide-react"

export default function AdminInvoices() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    projectId: "",
    salesOrderId: "",
    description: "",
    amount: "",
    status: "draft",
    dueDate: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filteredInvoices = db.invoices.filter((invoice: any) => {
    const matchesFilter = filter === "all" || invoice.status === filter
    const matchesSearch = searchTerm === "" || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalAmount = db.invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0)
  const paidInvoices = db.invoices.filter((inv: any) => inv.status === "paid")
  const pendingInvoices = db.invoices.filter((inv: any) => inv.status === "pending")
  const overdueInvoices = db.invoices.filter((inv: any) => inv.status === "overdue")

  const handleCreateInvoice = async () => {
    if (!db || !newInvoice.customerName || !newInvoice.description || !newInvoice.amount) return
    
    const invoiceData = {
      ...newInvoice,
      id: `inv-${Date.now()}`,
      amount: parseFloat(newInvoice.amount),
      invoiceDate: new Date().toISOString(),
      dueDate: newInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await updateDb({ invoices: [...db.invoices, invoiceData] })
    setShowCreateForm(false)
    setNewInvoice({
      customerName: "",
      projectId: "",
      salesOrderId: "",
      description: "",
      amount: "",
      status: "draft",
      dueDate: ""
    })
  }

  const handleSendInvoice = async (invoiceId: string) => {
    if (!db) return
    
    const updatedInvoices = db.invoices.map((inv: any) =>
      inv.id === invoiceId ? { ...inv, status: 'sent' } : inv
    )
    await updateDb({ invoices: updatedInvoices })
    alert(`Invoice ${invoiceId} sent successfully!`)
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!db || !confirm("Delete this invoice?")) return
    
    const updatedInvoices = db.invoices.filter((inv: any) => inv.id !== invoiceId)
    await updateDb({ invoices: updatedInvoices })
  }

  const handleExport = () => {
    const csvContent = [
      ["Invoice #", "Customer", "Project", "Description", "Amount", "Status", "Due Date"],
      ...filteredInvoices.map((inv: any) => {
        const project = db.projects.find((p: any) => p.id === inv.projectId)
        return [
          inv.id,
          inv.customerName || "Unknown Customer",
          project?.name || "No Project",
          inv.description,
          inv.amount,
          inv.status,
          new Date(inv.dueDate).toLocaleDateString()
        ]
      })
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
                  Customer Invoices
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage all customer invoices and billing
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
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-accent)" }}
                >
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
                  required
                />
                <select
                  value={newInvoice.projectId}
                  onChange={(e) => setNewInvoice({...newInvoice, projectId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Project (Optional)</option>
                  {db?.projects.filter((p: any) => p.status !== 'archived').map((project: any) => (
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
                  {db?.salesOrders.map((so: any) => (
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
                  required
                />
                <select
                  value={newInvoice.status}
                  onChange={(e) => setNewInvoice({...newInvoice, status: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                </select>
                <input
                  type="date"
                  placeholder="Due Date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
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
                required
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateInvoice}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Amount</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalAmount}</p>
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
                <FileText size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{pendingInvoices.length}</p>
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
                <FileText size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
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

          {/* Invoices Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Invoice #</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Customer</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice: any, index: number) => {
                    const project = db.projects.find((p: any) => p.id === invoice.projectId)
                    
                    return (
                      <tr 
                        key={invoice.id} 
                        style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                            {invoice.id}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {invoice.customerName || "Unknown Customer"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {project?.name || "No Project"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                            ₹{invoice.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: 
                                invoice.status === "paid" ? "#28a745" :
                                invoice.status === "overdue" ? "#dc3545" : "#ffc107",
                              color: "white"
                            }}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => alert(`Viewing Invoice: ${invoice.id}\nCustomer: ${invoice.customerName}\nAmount: ₹${invoice.amount}\nStatus: ${invoice.status}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}`)}
                              className="p-1 rounded hover:bg-gray-100"
                              title="View Invoice"
                            >
                              <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="p-1 rounded hover:bg-blue-100"
                              title="Send Invoice"
                            >
                              <Send size={16} style={{ color: "var(--odoo-primary)" }} />
                            </button>
                            <button 
                              onClick={() => {
                                setNewInvoice({
                                  customerName: invoice.customerName,
                                  projectId: invoice.projectId || "",
                                  salesOrderId: invoice.salesOrderId || "",
                                  description: invoice.description,
                                  amount: invoice.amount.toString(),
                                  status: invoice.status,
                                  dueDate: invoice.dueDate?.split('T')[0] || ""
                                })
                                setShowCreateForm(true)
                              }}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleDeleteInvoice(invoice.id)}
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