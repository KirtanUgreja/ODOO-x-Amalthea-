"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, DollarSign, FileText } from "lucide-react"
import { useState } from "react"

export default function ExpensesPage() {
  const { user } = useAuth()
  const { db, loading, error, updateRecord, getProjectData } = useDb()
  const [selectedProject, setSelectedProject] = useState("all")

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  if (!db || !user) return <div className="flex items-center justify-center h-screen">No data available</div>

  const projectData = getProjectData(user.id)
  if (!projectData) return <div className="flex items-center justify-center h-screen">Unable to load expenses</div>

  const myProjects = projectData.projects
  const projectExpenses = projectData.expenses
  
  const filteredExpenses = selectedProject === "all" 
    ? projectExpenses 
    : projectExpenses.filter((e: any) => e.projectId === selectedProject)

  const approveExpense = async (expenseId: string, billable: boolean = true) => {
    try {
      await updateRecord('expenses', expenseId, { 
        status: "approved", 
        approvedBy: user?.id, 
        billable 
      })
    } catch (error) {
      console.error('Failed to approve expense:', error)
    }
  }

  const rejectExpense = async (expenseId: string) => {
    try {
      await updateRecord('expenses', expenseId, { 
        status: "rejected", 
        approvedBy: user?.id 
      })
    } catch (error) {
      console.error('Failed to reject expense:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "#ffc107",
      approved: "#28a745",
      rejected: "#dc3545"
    }
    return colors[status as keyof typeof colors] || "#6c757d"
  }

  const totalExpenses = filteredExpenses.reduce((sum, e: any) => sum + e.amount, 0)
  const approvedExpenses = filteredExpenses
    .filter((e: any) => e.status === "approved")
    .reduce((sum, e: any) => sum + e.amount, 0)
  const billableExpenses = filteredExpenses
    .filter((e: any) => e.status === "approved" && e.billable)
    .reduce((sum, e: any) => sum + e.amount, 0)

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: "var(--odoo-text)" }}>
              Expense Management
            </h1>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Projects</option>
              {myProjects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-3">
                <DollarSign className="text-blue-500" size={24} />
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Expenses</p>
                  <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-3">
                <Check className="text-green-500" size={24} />
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Approved</p>
                  <p className="text-2xl font-bold">₹{approvedExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-3">
                <FileText className="text-purple-500" size={24} />
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Billable</p>
                  <p className="text-2xl font-bold">₹{billableExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredExpenses.map((expense: any) => {
              const project = myProjects.find((p: any) => p.id === expense.projectId)
              const submitter = db.users.find((u: any) => u.id === expense.userId)
              
              return (
                <div 
                  key={expense.id} 
                  className="p-6 rounded-lg shadow border-l-4" 
                  style={{ 
                    backgroundColor: "var(--odoo-card)",
                    borderLeftColor: getStatusColor(expense.status)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--odoo-text)" }}>
                          {expense.description}
                        </h3>
                        <span 
                          className="px-3 py-1 rounded-full text-sm text-white"
                          style={{ backgroundColor: getStatusColor(expense.status) }}
                        >
                          {expense.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p style={{ color: "var(--odoo-muted)" }}>Amount</p>
                          <p className="font-semibold text-lg">₹{expense.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--odoo-muted)" }}>Project</p>
                          <p>{project?.name}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--odoo-muted)" }}>Submitted By</p>
                          <p>{submitter?.name}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--odoo-muted)" }}>Date</p>
                          <p>{new Date(expense.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {expense.receipt && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye size={14} />
                            View Receipt
                          </Button>
                        </div>
                      )}
                    </div>

                    {expense.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => approveExpense(expense.id, true)}
                        >
                          <Check size={14} className="mr-1" />
                          Approve (Billable)
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => approveExpense(expense.id, false)}
                        >
                          <Check size={14} className="mr-1" />
                          Approve (Non-billable)
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rejectExpense(expense.id)}
                        >
                          <X size={14} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {expense.status === "approved" && (
                      <div className="ml-4">
                        <span className={`px-3 py-1 rounded text-sm ${
                          expense.billable 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {expense.billable ? "Billable" : "Non-billable"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: "var(--odoo-muted)" }}>No expenses found for the selected project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}