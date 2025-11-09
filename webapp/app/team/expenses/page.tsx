"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Receipt, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  Paperclip,
  Eye,
  Filter,
  Calendar,
  Wallet
} from "lucide-react"

export default function EmployeeExpensesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [billable, setBillable] = useState("true")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [showExpenseDetails, setShowExpenseDetails] = useState(false)

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const myProjects = db.projects.filter((p: any) => p.teamMembers.includes(user?.id))
  const myExpenses = db.expenses.filter((e: any) => e.userId === user?.id)

  const filteredExpenses = myExpenses.filter((expense: any) => {
    if (filterStatus === "all") return true
    return expense.status === filterStatus
  })

  const expensesByStatus = {
    pending: myExpenses.filter(e => e.status === "pending"),
    approved: myExpenses.filter(e => e.status === "approved"),
    rejected: myExpenses.filter(e => e.status === "rejected"),
    reimbursed: myExpenses.filter(e => e.status === "reimbursed")
  }

  const totalSubmitted = myExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalApproved = expensesByStatus.approved.reduce((sum, e) => sum + e.amount, 0)
  const totalPending = expensesByStatus.pending.reduce((sum, e) => sum + e.amount, 0)
  const totalReimbursed = expensesByStatus.reimbursed.reduce((sum, e) => sum + e.amount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "reimbursed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />
      case "approved": return <CheckCircle className="w-4 h-4" />
      case "rejected": return <XCircle className="w-4 h-4" />
      case "reimbursed": return <DollarSign className="w-4 h-4" />
      default: return <Receipt className="w-4 h-4" />
    }
  }

  const handleSubmitExpense = async () => {
    if (!selectedProject || !amount || !category || !description) return
    
    const newExpense = {
      id: `exp-${Date.now()}`,
      projectId: selectedProject,
      userId: user?.id,
      amount: parseFloat(amount),
      description,
      billable: billable === "true",
      status: "pending",
      approvedBy: null,
      receipt: receipt?.name || null,
      category,
      createdAt: new Date().toISOString()
    }

    try {
      await updateDb({ expenses: [...db.expenses, newExpense] })
      
      // Reset form
      setSelectedProject("")
      setAmount("")
      setCategory("")
      setDescription("")
      setBillable("true")
      setReceipt(null)
      setShowExpenseDialog(false)
    } catch (error) {
      console.error("Failed to submit expense:", error)
    }
  }

  const ExpenseCard = ({ expense }: { expense: any }) => {
    const project = myProjects.find(p => p.id === expense.projectId)
    
    return (
      <div className="p-4 rounded-lg border hover:shadow-md transition-shadow" style={{ backgroundColor: "var(--odoo-card)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
              {expense.description}
            </h3>
            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
              {project?.name} • {expense.category} • {new Date(expense.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">₹{expense.amount.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(expense.status)}>
                {getStatusIcon(expense.status)}
                <span className="ml-1">{expense.status}</span>
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className={expense.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {expense.billable ? "Billable" : "Non-billable"}
            </Badge>
            {expense.receipt && (
              <div className="flex items-center gap-1 text-sm" style={{ color: "var(--odoo-muted)" }}>
                <Paperclip className="w-4 h-4" />
                <span>Receipt attached</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              onClick={() => {
                setSelectedExpense(expense)
                setShowExpenseDetails(true)
              }}
            >
              View
            </button>
            {expense.status === "pending" && (
              <button 
                className="px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-600"
                onClick={async () => {
                  if (confirm("Are you sure you want to withdraw this expense?")) {
                    const updatedExpenses = db.expenses.filter(e => e.id !== expense.id)
                    await updateDb({ expenses: updatedExpenses })
                  }
                }}
              >
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              My Expenses
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Submit and track your project-related expenses</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Total Submitted</span>
              </div>
              <p className="text-2xl font-bold">₹{totalSubmitted.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {myExpenses.length} expenses
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Pending</span>
              </div>
              <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {expensesByStatus.pending.length} pending
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Approved</span>
              </div>
              <p className="text-2xl font-bold">₹{totalApproved.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {expensesByStatus.approved.length} approved
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Reimbursed</span>
              </div>
              <p className="text-2xl font-bold">₹{totalReimbursed.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                {expensesByStatus.reimbursed.length} reimbursed
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setShowExpenseDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Expense
            </Button>
          </div>

          {/* Expenses Tabs */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">All Expenses</TabsTrigger>
              <TabsTrigger value="pending">Pending ({expensesByStatus.pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({expensesByStatus.approved.length})</TabsTrigger>
              <TabsTrigger value="reimbursed">Reimbursed ({expensesByStatus.reimbursed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredExpenses.length > 0 ? (
                filteredExpenses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((expense: any) => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))
              ) : (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
                  <p style={{ color: "var(--odoo-muted)" }}>No expenses found</p>
                  <Button className="mt-4" onClick={() => setShowExpenseDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Expense
                  </Button>
                </div>
              )}
            </TabsContent>

            {["pending", "approved", "reimbursed"].map(status => (
              <TabsContent key={status} value={status} className="space-y-4">
                {expensesByStatus[status as keyof typeof expensesByStatus].map((expense: any) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </TabsContent>
            ))}
          </Tabs>

          {/* Submit Expense Dialog */}
          <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Project *</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {myProjects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount (₹) *</Label>
                    <Input 
                      type="number" 
                      placeholder="1500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Accommodation">Accommodation</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Billing Type *</Label>
                  <Select value={billable} onValueChange={setBillable}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Billable (Client should be charged)</SelectItem>
                      <SelectItem value="false">Non-billable (Company absorbs cost)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Cab fare for client meeting on 9th Nov"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Receipt/Proof</Label>
                  <Input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--odoo-muted)" }}>
                    Upload receipt, invoice, or proof of expense (JPG, PNG, PDF)
                  </p>
                </div>

                {selectedProject && amount && category && (
                  <div className="p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">₹{parseFloat(amount || "0").toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Billing:</span>
                        <Badge className={billable === "true" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {billable === "true" ? "Billable" : "Non-billable"}
                        </Badge>
                      </div>
                      {receipt && (
                        <div className="flex justify-between">
                          <span>Receipt:</span>
                          <span className="font-medium">{receipt.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowExpenseDialog(false)
                    setSelectedProject("")
                    setAmount("")
                    setCategory("")
                    setDescription("")
                    setBillable("true")
                    setReceipt(null)
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitExpense}
                    disabled={!selectedProject || !amount || !category || !description}
                  >
                    Submit Expense
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Expense Details Dialog */}
          <Dialog open={showExpenseDetails} onOpenChange={setShowExpenseDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Expense Details</DialogTitle>
              </DialogHeader>
              {selectedExpense && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm mt-1">{selectedExpense.description}</p>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <p className="text-sm mt-1 font-bold">₹{selectedExpense.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p className="text-sm mt-1">{selectedExpense.category}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(selectedExpense.status)}>
                        {getStatusIcon(selectedExpense.status)}
                        <span className="ml-1">{selectedExpense.status}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label>Project</Label>
                      <p className="text-sm mt-1">
                        {myProjects.find(p => p.id === selectedExpense.projectId)?.name}
                      </p>
                    </div>
                    <div>
                      <Label>Billing Type</Label>
                      <Badge className={selectedExpense.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {selectedExpense.billable ? "Billable" : "Non-billable"}
                      </Badge>
                    </div>
                    <div>
                      <Label>Submitted Date</Label>
                      <p className="text-sm mt-1">{new Date(selectedExpense.createdAt).toLocaleDateString()}</p>
                    </div>
                    {selectedExpense.receipt && (
                      <div>
                        <Label>Receipt</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm">{selectedExpense.receipt}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedExpense.status === "rejected" && (
                    <div className="p-3 rounded border-l-4 border-red-500" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <h4 className="font-semibold text-red-700 mb-1">Rejection Reason</h4>
                      <p className="text-sm">Please contact your Project Manager for details about why this expense was rejected.</p>
                    </div>
                  )}

                  {selectedExpense.status === "approved" && (
                    <div className="p-3 rounded border-l-4 border-green-500" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                      <h4 className="font-semibold text-green-700 mb-1">Approved</h4>
                      <p className="text-sm">This expense has been approved and will be processed for reimbursement.</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => setShowExpenseDetails(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}