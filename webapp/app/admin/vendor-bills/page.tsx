"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Receipt, Plus, Edit, Trash2, Eye, Check, X, DollarSign, Filter, Search, Download } from "lucide-react"

export default function AdminVendorBills() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBill, setNewBill] = useState({
    vendor: "",
    projectId: "",
    purchaseOrderId: "",
    description: "",
    amount: "",
    status: "pending",
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

  const filteredBills = db.vendorBills.filter((bill: any) => {
    const matchesFilter = filter === "all" || bill.status === filter
    const matchesSearch = searchTerm === "" || 
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalAmount = db.vendorBills.reduce((sum: number, bill: any) => sum + bill.amount, 0)
  const paidBills = db.vendorBills.filter((bill: any) => bill.status === "paid")
  const pendingBills = db.vendorBills.filter((bill: any) => bill.status === "pending")
  const overdueBills = db.vendorBills.filter((bill: any) => bill.status === "overdue")

  const handleCreateBill = async () => {
    if (!db || !newBill.vendor || !newBill.description || !newBill.amount) return
    
    const billData = {
      ...newBill,
      id: `vb-${Date.now()}`,
      amount: parseFloat(newBill.amount),
      billDate: new Date().toISOString(),
      dueDate: newBill.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await updateDb({ vendorBills: [...db.vendorBills, billData] })
    setShowCreateForm(false)
    setNewBill({
      vendor: "",
      projectId: "",
      purchaseOrderId: "",
      description: "",
      amount: "",
      status: "pending",
      dueDate: ""
    })
  }

  const handleMarkAsPaid = async (billId: string) => {
    if (!db) return
    
    const updatedBills = db.vendorBills.map((bill: any) =>
      bill.id === billId ? { ...bill, status: 'paid' } : bill
    )
    await updateDb({ vendorBills: updatedBills })
    alert(`Bill ${billId} marked as paid!`)
  }

  const handleDeleteBill = async (billId: string) => {
    if (!db || !confirm("Delete this vendor bill?")) return
    
    const updatedBills = db.vendorBills.filter((bill: any) => bill.id !== billId)
    await updateDb({ vendorBills: updatedBills })
  }

  const handleExport = () => {
    const csvContent = [
      ["Bill Number", "Vendor", "Description", "Amount", "Status", "Bill Date", "Due Date"],
      ...filteredBills.map((bill: any) => [
        bill.id,
        bill.vendor,
        bill.description,
        bill.amount,
        bill.status,
        new Date(bill.billDate).toLocaleDateString(),
        new Date(bill.dueDate).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vendor-bills-${new Date().toISOString().split('T')[0]}.csv`
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
                  Vendor Bills
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage all vendor bills and payables
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Bill
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

          {/* Create Vendor Bill Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Create New Vendor Bill</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={newBill.vendor}
                  onChange={(e) => setNewBill({...newBill, vendor: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newBill.projectId}
                  onChange={(e) => setNewBill({...newBill, projectId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Project (Optional)</option>
                  {db?.projects.filter((p: any) => p.status !== 'archived').map((project: any) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={newBill.purchaseOrderId}
                  onChange={(e) => setNewBill({...newBill, purchaseOrderId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Purchase Order (Optional)</option>
                  {db?.purchaseOrders.map((po: any) => (
                    <option key={po.id} value={po.id}>{po.id} - {po.vendor}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newBill.status}
                  onChange={(e) => setNewBill({...newBill, status: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <input
                  type="date"
                  placeholder="Due Date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
              </div>
              <textarea
                placeholder="Description"
                value={newBill.description}
                onChange={(e) => setNewBill({...newBill, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
                required
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateBill}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Vendor Bill
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
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{paidBills.length}</p>
                </div>
                <Check size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{pendingBills.length}</p>
                </div>
                <Receipt size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Overdue</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{overdueBills.length}</p>
                </div>
                <X size={24} style={{ color: "#dc3545" }} />
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
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search vendor bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Vendor Bills Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Bill Number</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Vendor</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Bill Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill: any, index: number) => (
                    <tr 
                      key={bill.id} 
                      style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                          {bill.id}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                        {bill.vendor}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                        {bill.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                          ₹{bill.amount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold capitalize"
                          style={{
                            backgroundColor: 
                              bill.status === "paid" ? "#28a745" :
                              bill.status === "overdue" ? "#dc3545" : "#ffc107",
                            color: "white"
                          }}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {new Date(bill.billDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {bill.status === "pending" && (
                            <button 
                              onClick={() => handleMarkAsPaid(bill.id)}
                              className="p-1 rounded hover:bg-green-100"
                              title="Mark as Paid"
                            >
                              <Check size={16} style={{ color: "#28a745" }} />
                            </button>
                          )}
                          <button 
                            onClick={() => alert(`Viewing Vendor Bill: ${bill.id}\nVendor: ${bill.vendor}\nAmount: ₹${bill.amount}\nStatus: ${bill.status}\nDue Date: ${new Date(bill.dueDate).toLocaleDateString()}`)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="View Bill"
                          >
                            <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                          </button>
                          <button 
                            onClick={() => {
                              setNewBill({
                                vendor: bill.vendor,
                                projectId: bill.projectId || "",
                                purchaseOrderId: bill.purchaseOrderId || "",
                                description: bill.description,
                                amount: bill.amount.toString(),
                                status: bill.status,
                                dueDate: bill.dueDate?.split('T')[0] || ""
                              })
                              setShowCreateForm(true)
                            }}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBill(bill.id)}
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

          {filteredBills.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No vendor bills found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}