"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { TrendingUp, Plus, Edit, Trash2, Eye, FileText, DollarSign, Filter, Search, Download } from "lucide-react"

export default function AdminSalesOrders() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSO, setNewSO] = useState({
    customerName: "",
    projectId: "",
    description: "",
    amount: "",
    status: "draft",
    deliverables: "",
    paymentTerms: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filteredSOs = db.salesOrders.filter((so: any) => {
    const matchesFilter = filter === "all" || so.status === filter
    const matchesSearch = searchTerm === "" || 
      so.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalRevenue = db.salesOrders.reduce((sum: number, so: any) => sum + so.amount, 0)
  const confirmedSOs = db.salesOrders.filter((so: any) => so.status === "confirmed")
  const draftSOs = db.salesOrders.filter((so: any) => so.status === "draft")
  const deliveredSOs = db.salesOrders.filter((so: any) => so.status === "delivered")

  const handleCreateSO = async () => {
    if (!db || !newSO.customerName || !newSO.description || !newSO.amount) return
    
    const soData = {
      ...newSO,
      id: `so-${Date.now()}`,
      amount: parseFloat(newSO.amount),
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await updateDb({ salesOrders: [...db.salesOrders, soData] })
    setShowCreateForm(false)
    setNewSO({
      customerName: "",
      projectId: "",
      description: "",
      amount: "",
      status: "draft",
      deliverables: "",
      paymentTerms: ""
    })
  }

  const handleDeleteSO = async (soId: string) => {
    if (!db || !confirm("Delete this sales order?")) return
    
    const updatedSOs = db.salesOrders.filter((so: any) => so.id !== soId)
    await updateDb({ salesOrders: updatedSOs })
  }

  const handleCreateInvoice = async (so: any) => {
    if (!db) return
    
    const invoiceData = {
      id: `inv-${Date.now()}`,
      projectId: so.projectId,
      salesOrderId: so.id,
      customerName: so.customerName,
      amount: so.amount,
      description: so.description,
      status: "draft",
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await updateDb({ invoices: [...db.invoices, invoiceData] })
    alert(`Invoice ${invoiceData.id} created successfully!`)
  }

  const handleExport = () => {
    const csvContent = [
      ["SO Number", "Customer", "Project", "Description", "Amount", "Status", "Order Date"],
      ...filteredSOs.map((so: any) => {
        const project = db.projects.find((p: any) => p.id === so.projectId)
        return [
          so.id,
          so.customerName || "Unknown Customer",
          project?.name || "No Project",
          so.description,
          so.amount,
          so.status,
          new Date(so.orderDate).toLocaleDateString()
        ]
      })
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-orders-${new Date().toISOString().split('T')[0]}.csv`
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
                  Sales Orders
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage all sales orders and customer deals
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Sales Order
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

          {/* Create Sales Order Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Create New Sales Order</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newSO.customerName}
                  onChange={(e) => setNewSO({...newSO, customerName: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newSO.projectId}
                  onChange={(e) => setNewSO({...newSO, projectId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Project (Optional)</option>
                  {db?.projects.filter((p: any) => p.status !== 'archived').map((project: any) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newSO.amount}
                  onChange={(e) => setNewSO({...newSO, amount: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newSO.status}
                  onChange={(e) => setNewSO({...newSO, status: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="draft">Draft</option>
                  <option value="confirmed">Confirmed</option>
                </select>
                <input
                  type="text"
                  placeholder="Payment Terms"
                  value={newSO.paymentTerms}
                  onChange={(e) => setNewSO({...newSO, paymentTerms: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
              </div>
              <textarea
                placeholder="Description"
                value={newSO.description}
                onChange={(e) => setNewSO({...newSO, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
                required
              />
              <textarea
                placeholder="Deliverables"
                value={newSO.deliverables}
                onChange={(e) => setNewSO({...newSO, deliverables: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={2}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateSO}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Sales Order
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalRevenue}</p>
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
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
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

          {/* Sales Orders Table */}
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
                  {filteredSOs.map((so: any, index: number) => {
                    const project = db.projects.find((p: any) => p.id === so.projectId)
                    
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
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {project?.name || "No Project"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {so.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                            ₹{so.amount}
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
                          {new Date(so.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => alert(`Viewing Sales Order: ${so.id}\nCustomer: ${so.customerName}\nAmount: ₹${so.amount}\nStatus: ${so.status}`)}
                              className="p-1 rounded hover:bg-gray-100"
                              title="View Sales Order"
                            >
                              <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleCreateInvoice(so)}
                              className="p-1 rounded hover:bg-blue-100"
                              title="Create Invoice"
                            >
                              <FileText size={16} style={{ color: "var(--odoo-primary)" }} />
                            </button>
                            <button 
                              onClick={() => {
                                setNewSO({
                                  customerName: so.customerName,
                                  projectId: so.projectId || "",
                                  description: so.description,
                                  amount: so.amount.toString(),
                                  status: so.status,
                                  deliverables: so.deliverables || "",
                                  paymentTerms: so.paymentTerms || ""
                                })
                                setShowCreateForm(true)
                              }}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSO(so.id)}
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