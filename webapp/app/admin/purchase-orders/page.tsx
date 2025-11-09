"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { ShoppingCart, Plus, Edit, Trash2, Eye, Check, X, DollarSign, Filter, Search, Download } from "lucide-react"

export default function AdminPurchaseOrders() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPO, setNewPO] = useState({
    vendor: "",
    projectId: "",
    description: "",
    amount: "",
    status: "pending",
    expectedDate: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filteredPOs = db.purchaseOrders.filter((po: any) => {
    const matchesFilter = filter === "all" || po.status === filter
    const matchesSearch = searchTerm === "" || 
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalAmount = db.purchaseOrders.reduce((sum: number, po: any) => sum + po.amount, 0)
  const approvedPOs = db.purchaseOrders.filter((po: any) => po.status === "approved")
  const pendingPOs = db.purchaseOrders.filter((po: any) => po.status === "pending")
  const receivedPOs = db.purchaseOrders.filter((po: any) => po.status === "received")

  const handleCreatePO = async () => {
    if (!db || !newPO.vendor || !newPO.description || !newPO.amount) return
    
    const poData = {
      ...newPO,
      id: `po-${Date.now()}`,
      amount: parseFloat(newPO.amount),
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await updateDb({ purchaseOrders: [...db.purchaseOrders, poData] })
    setShowCreateForm(false)
    setNewPO({
      vendor: "",
      projectId: "",
      description: "",
      amount: "",
      status: "pending",
      expectedDate: ""
    })
  }

  const handleApprovePO = async (poId: string) => {
    if (!db) return
    
    const updatedPOs = db.purchaseOrders.map((po: any) =>
      po.id === poId ? { ...po, status: 'approved' } : po
    )
    await updateDb({ purchaseOrders: updatedPOs })
  }

  const handleCancelPO = async (poId: string) => {
    if (!db || !confirm("Cancel this purchase order?")) return
    
    const updatedPOs = db.purchaseOrders.map((po: any) =>
      po.id === poId ? { ...po, status: 'cancelled' } : po
    )
    await updateDb({ purchaseOrders: updatedPOs })
  }

  const handleDeletePO = async (poId: string) => {
    if (!db || !confirm("Delete this purchase order?")) return
    
    const updatedPOs = db.purchaseOrders.filter((po: any) => po.id !== poId)
    await updateDb({ purchaseOrders: updatedPOs })
  }

  const handleExport = () => {
    const csvContent = [
      ["PO Number", "Vendor", "Description", "Amount", "Status", "Order Date", "Expected Date"],
      ...filteredPOs.map((po: any) => [
        po.id,
        po.vendor,
        po.description,
        po.amount,
        po.status,
        new Date(po.orderDate).toLocaleDateString(),
        new Date(po.expectedDate).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`
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
                  Purchase Orders
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage all purchase orders and vendor procurement
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create PO
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

          {/* Create Purchase Order Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Create New Purchase Order</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={newPO.vendor}
                  onChange={(e) => setNewPO({...newPO, vendor: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newPO.projectId}
                  onChange={(e) => setNewPO({...newPO, projectId: e.target.value})}
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
                  value={newPO.amount}
                  onChange={(e) => setNewPO({...newPO, amount: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <input
                  type="date"
                  placeholder="Expected Date"
                  value={newPO.expectedDate}
                  onChange={(e) => setNewPO({...newPO, expectedDate: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
                <select
                  value={newPO.status}
                  onChange={(e) => setNewPO({...newPO, status: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={newPO.description}
                onChange={(e) => setNewPO({...newPO, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
                required
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreatePO}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Purchase Order
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
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

          {/* Purchase Orders Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>PO Number</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Vendor</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Order Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Expected Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.map((po: any, index: number) => (
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
                        {po.vendor}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                        {po.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                          ₹{po.amount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold capitalize"
                          style={{
                            backgroundColor: 
                              po.status === "approved" ? "#28a745" :
                              po.status === "received" ? "var(--odoo-accent)" :
                              po.status === "cancelled" ? "#dc3545" : "#ffc107",
                            color: "white"
                          }}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {new Date(po.expectedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {po.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleApprovePO(po.id)}
                                className="p-1 rounded hover:bg-green-100"
                                title="Approve"
                              >
                                <Check size={16} style={{ color: "#28a745" }} />
                              </button>
                              <button 
                                onClick={() => handleCancelPO(po.id)}
                                className="p-1 rounded hover:bg-red-100"
                                title="Cancel"
                              >
                                <X size={16} style={{ color: "#dc3545" }} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => alert(`Viewing Purchase Order: ${po.id}\nVendor: ${po.vendor}\nAmount: ₹${po.amount}\nStatus: ${po.status}`)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="View"
                          >
                            <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                          </button>
                          <button 
                            onClick={() => {
                              setNewPO({
                                vendor: po.vendor,
                                projectId: po.projectId || "",
                                description: po.description,
                                amount: po.amount.toString(),
                                status: po.status,
                                expectedDate: po.expectedDate?.split('T')[0] || ""
                              })
                              setShowCreateForm(true)
                            }}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                          </button>
                          <button 
                            onClick={() => handleDeletePO(po.id)}
                            className="p-1 rounded hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={16} style={{ color: "#dc3545" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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