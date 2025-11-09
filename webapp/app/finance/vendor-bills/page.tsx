"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { Receipt, Plus, Edit, Trash2, Eye, Check, DollarSign, Filter, Search, Download, Link as LinkIcon, Unlink, AlertCircle, Clock } from "lucide-react"

export default function FinanceVendorBills() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [vendorFilter, setVendorFilter] = useState("all")
  const [groupBy, setGroupBy] = useState("none")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBill, setNewBill] = useState({
    vendor: "",
    projectId: "",
    purchaseOrderId: "",
    description: "",
    amount: "",
    status: "received"
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
  const filteredBills = (db.vendorBills || []).filter((vb: any) => {
    const matchesFilter = filter === "all" || vb.status === filter
    const matchesProject = projectFilter === "all" || vb.projectId === projectFilter
    const matchesVendor = vendorFilter === "all" || vb.vendor === vendorFilter
    const matchesSearch = searchTerm === "" || 
      vb.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vb.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vb.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vb.amount?.toString().includes(searchTerm)
    return matchesFilter && matchesProject && matchesVendor && matchesSearch
  })

  // Group vendor bills
  const groupedBills = groupBy === "none" ? { "All Vendor Bills": filteredBills } :
    filteredBills.reduce((groups: any, vb: any) => {
      let key = "Ungrouped"
      if (groupBy === "project") {
        const project = db.projects?.find((p: any) => p.id === vb.projectId)
        key = project?.name || "No Project"
      } else if (groupBy === "vendor") {
        key = vb.vendor || "Unknown Vendor"
      } else if (groupBy === "state") {
        key = vb.status || "No Status"
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(vb)
      return groups
    }, {})

  // Calculate metrics
  const totalAmount = filteredBills.reduce((sum: number, vb: any) => sum + (vb.amount || 0), 0)
  const paidBills = filteredBills.filter((vb: any) => vb.status === "paid")
  const receivedBills = filteredBills.filter((vb: any) => vb.status === "received")
  const draftBills = filteredBills.filter((vb: any) => vb.status === "draft")
  const overdueBills = filteredBills.filter((vb: any) => 
    vb.status === "received" && vb.dueDate && new Date(vb.dueDate) < new Date()
  )

  // Get unique vendors and projects for filters
  const vendors = [...new Set((db.vendorBills || []).map((vb: any) => vb.vendor).filter(Boolean))]
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
                  Vendor Bills
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Record and manage vendor bills and payment obligations
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Record Vendor Bill
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Record Vendor Bill Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Record New Vendor Bill</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={newBill.vendor}
                  onChange={(e) => setNewBill({...newBill, vendor: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
                <select
                  value={newBill.projectId}
                  onChange={(e) => setNewBill({...newBill, projectId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Select Project (Optional)</option>
                  {projects.map((project: any) => (
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
                  {(db.purchaseOrders || []).map((po: any) => (
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
                />
              </div>
              <textarea
                placeholder="Description"
                value={newBill.description}
                onChange={(e) => setNewBill({...newBill, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={async () => {
                    if (!newBill.vendor || !newBill.description || !newBill.amount) {
                      alert('Please fill in Vendor, Description, and Amount')
                      return
                    }
                    const billData = {
                      ...newBill,
                      id: `vb-${Date.now()}`,
                      amount: parseFloat(newBill.amount),
                      billDate: new Date().toISOString(),
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString()
                    }
                    await updateDb({ vendorBills: [...db.vendorBills, billData] })
                    setShowCreateForm(false)
                    setNewBill({ vendor: "", projectId: "", purchaseOrderId: "", description: "", amount: "", status: "received" })
                    alert('Vendor bill recorded successfully!')
                  }}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Record Bill
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Amount</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalAmount.toLocaleString()}</p>
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Received</p>
                  <p className="text-2xl font-bold" style={{ color: "#17a2b8" }}>{receivedBills.length}</p>
                </div>
                <Receipt size={24} style={{ color: "#17a2b8" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Draft</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{draftBills.length}</p>
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
                  placeholder="Search vendor bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Vendor Bills Table/Groups */}
          {Object.entries(groupedBills).map(([groupName, bills]: [string, any]) => (
            <div key={groupName} className="mb-6">
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 px-2" style={{ color: "var(--odoo-text)" }}>
                  {groupName} ({bills.length})
                </h3>
              )}
              
              <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Bill #</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Vendor</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Purchase Order</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Bill Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Due Date</th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((vb: any, index: number) => {
                        const project = db.projects?.find((p: any) => p.id === vb.projectId)
                        const purchaseOrder = db.purchaseOrders?.find((po: any) => po.id === vb.purchaseOrderId)
                        const isOverdue = vb.status === "received" && vb.dueDate && new Date(vb.dueDate) < new Date()
                        
                        return (
                          <tr 
                            key={vb.id} 
                            style={{ 
                              backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)",
                              borderLeft: isOverdue ? "4px solid #dc3545" : "none"
                            }}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                                BILL-{vb.id}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                              {vb.vendor || "Unknown Vendor"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {project?.name || "No Project"}
                                </span>
                                {vb.projectId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ color: "var(--odoo-text)" }}>
                                  {purchaseOrder ? `PO-${purchaseOrder.id}` : "No PO"}
                                </span>
                                {vb.purchaseOrderId && (
                                  <LinkIcon size={12} style={{ color: "var(--odoo-primary)" }} />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                                ₹{vb.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold capitalize"
                                style={{
                                  backgroundColor: 
                                    vb.status === "paid" ? "#28a745" :
                                    vb.status === "received" ? (isOverdue ? "#dc3545" : "#17a2b8") :
                                    vb.status === "cancelled" ? "#6c757d" : "#ffc107",
                                  color: "white"
                                }}
                              >
                                {isOverdue ? "Overdue" : vb.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {vb.billDate ? new Date(vb.billDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: isOverdue ? "#dc3545" : "var(--odoo-muted)" }}>
                              {vb.dueDate ? new Date(vb.dueDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => alert(`Bill Details:\nID: ${vb.id}\nVendor: ${vb.vendor}\nAmount: ₹${vb.amount}\nStatus: ${vb.status}`)}
                                  className="p-1 rounded hover:bg-gray-100"
                                  title="View Bill"
                                >
                                  <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                                </button>
                                {vb.status === "received" && (
                                  <button 
                                    onClick={async () => {
                                      const updatedBills = db.vendorBills.map((b: any) => 
                                        b.id === vb.id ? { ...b, status: "paid" } : b
                                      )
                                      await updateDb({ vendorBills: updatedBills })
                                      alert('Bill marked as paid!')
                                    }}
                                    className="p-1 rounded hover:bg-green-100"
                                    title="Mark as Paid"
                                  >
                                    <Check size={16} style={{ color: "#28a745" }} />
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    if (confirm('Delete this vendor bill?')) {
                                      const updatedBills = db.vendorBills.filter((b: any) => b.id !== vb.id)
                                      await updateDb({ vendorBills: updatedBills })
                                      alert('Vendor bill deleted successfully!')
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

              {bills.length === 0 && (
                <div className="text-center py-8">
                  <p style={{ color: "var(--odoo-muted)" }}>No vendor bills found in this group.</p>
                </div>
              )}
            </div>
          ))}

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