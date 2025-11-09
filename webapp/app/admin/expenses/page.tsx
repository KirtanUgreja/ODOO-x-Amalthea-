"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { DollarSign, Eye, Edit, Trash2, Check, X, Filter, Search, Plus, Download } from "lucide-react"

export default function AdminExpenses() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    userId: "",
    projectId: "",
    description: "",
    amount: "",
    billable: true,
    status: "pending"
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filteredExpenses = db.expenses.filter((expense: any) => {
    const matchesFilter = filter === "all" || expense.status === filter
    const matchesSearch = searchTerm === "" || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.users.find((u: any) => u.id === expense.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalExpenses = db.expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
  const pendingExpenses = db.expenses.filter((e: any) => e.status === "pending")
  const approvedExpenses = db.expenses.filter((e: any) => e.status === "approved")
  const rejectedExpenses = db.expenses.filter((e: any) => e.status === "rejected")

  const handleCreateExpense = async () => {
    if (!db || !newExpense.userId || !newExpense.description || !newExpense.amount) return
    
    const expenseData = {
      ...newExpense,
      id: `exp-${Date.now()}`,
      amount: parseFloat(newExpense.amount),
      createdAt: new Date().toISOString()
    }
    
    await updateDb({ expenses: [...db.expenses, expenseData] })
    setShowCreateForm(false)
    setNewExpense({
      userId: "",
      projectId: "",
      description: "",
      amount: "",
      billable: true,
      status: "pending"
    })
  }

  const handleApproveExpense = async (expenseId: string) => {
    if (!db) return
    
    const updatedExpenses = db.expenses.map((expense: any) =>
      expense.id === expenseId ? { ...expense, status: 'approved' } : expense
    )
    await updateDb({ expenses: updatedExpenses })
  }

  const handleRejectExpense = async (expenseId: string) => {
    if (!db || !confirm("Reject this expense?")) return
    
    const updatedExpenses = db.expenses.map((expense: any) =>
      expense.id === expenseId ? { ...expense, status: 'rejected' } : expense
    )
    await updateDb({ expenses: updatedExpenses })
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!db || !confirm("Delete this expense?")) return
    
    const updatedExpenses = db.expenses.filter((expense: any) => expense.id !== expenseId)
    await updateDb({ expenses: updatedExpenses })
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
                  All Expenses Management
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  View, approve, reject, and manage all employee expenses
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Expense
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Create Expense Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Create New Expense</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newExpense.userId}
                  onChange={(e) => setNewExpense({...newExpense, userId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                >
                  <option value="">Select Employee</option>
                  {db?.users.map((user: any) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <select
                  value={newExpense.projectId}
                  onChange={(e) => setNewExpense({...newExpense, projectId: e.target.value})}
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
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newExpense.billable.toString()}
                  onChange={(e) => setNewExpense({...newExpense, billable: e.target.value === 'true'})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="true">Billable</option>
                  <option value="false">Non-Billable</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
                required
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateExpense}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Expense
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Expenses</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalExpenses}</p>
                </div>
                <DollarSign size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Pending Approval</p>
                  <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>{pendingExpenses.length}</p>
                </div>
                <Eye size={24} style={{ color: "#ffc107" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Approved</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{approvedExpenses.length}</p>
                </div>
                <Check size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Rejected</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{rejectedExpenses.length}</p>
                </div>
                <X size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Employee</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Description</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Amount</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Billable</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense: any, index: number) => {
                    const employee = db.users.find((u: any) => u.id === expense.userId)
                    const project = db.projects.find((p: any) => p.id === expense.projectId)
                    
                    return (
                      <tr 
                        key={expense.id} 
                        className={index % 2 === 0 ? "" : ""}
                        style={{ backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)" }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              {employee?.name || "Unknown"}
                            </p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {employee?.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {expense.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                            ₹{expense.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {project?.name || "No Project"}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: expense.billable ? "#28a745" : "#6c757d",
                              color: "white"
                            }}
                          >
                            {expense.billable ? "Billable" : "Non-Billable"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: 
                                expense.status === "approved" ? "#28a745" :
                                expense.status === "rejected" ? "#dc3545" : "#ffc107",
                              color: "white"
                            }}
                          >
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--odoo-muted)" }}>
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {expense.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => handleApproveExpense(expense.id)}
                                  className="p-1 rounded hover:bg-green-100"
                                  title="Approve"
                                >
                                  <Check size={16} style={{ color: "#28a745" }} />
                                </button>
                                <button 
                                  onClick={() => handleRejectExpense(expense.id)}
                                  className="p-1 rounded hover:bg-red-100"
                                  title="Reject"
                                >
                                  <X size={16} style={{ color: "#dc3545" }} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => {
                                setNewExpense({
                                  userId: expense.userId,
                                  projectId: expense.projectId || "",
                                  description: expense.description,
                                  amount: expense.amount.toString(),
                                  billable: expense.billable,
                                  status: expense.status
                                })
                                setShowCreateForm(true)
                              }}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(expense.id)}
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

          {filteredExpenses.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No expenses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}