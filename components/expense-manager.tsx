"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Receipt,
  DollarSign,
  Calendar,
  User,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Camera
} from "lucide-react"
import type { Expense } from "@/lib/types"

interface ExpenseManagerProps {
  projectId?: string
  expenses?: Expense[]
  onExpenseClick?: (expense: Expense) => void
  onCreateExpense?: () => void
}

export function ExpenseManager({ 
  projectId, 
  expenses = [], 
  onExpenseClick, 
  onCreateExpense 
}: ExpenseManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [billableFilter, setBillableFilter] = useState<"all" | "billable" | "non-billable">("all")

  // Mock data if no expenses provided
  const mockExpenses: Expense[] = [
    {
      id: "EXP-001",
      projectId: projectId || "1",
      userId: "user-1",
      userName: "John Doe",
      amount: 45.50,
      currency: "USD",
      category: "Meals",
      description: "Client lunch meeting at Bistro Downtown",
      date: "2024-01-20",
      status: "approved",
      isBillable: true,
      receiptUrl: "/receipts/exp-001.jpg",
      createdAt: "2024-01-20T14:30:00Z"
    },
    {
      id: "EXP-002",
      projectId: projectId || "1",
      userId: "user-2",
      userName: "Jane Smith",
      amount: 125.00,
      currency: "USD",
      category: "Transportation",
      description: "Uber rides for client meetings",
      date: "2024-01-19",
      status: "pending",
      isBillable: true,
      receiptUrl: "/receipts/exp-002.jpg",
      createdAt: "2024-01-19T18:00:00Z"
    },
    {
      id: "EXP-003",
      projectId: projectId || "2",
      userId: "user-1",
      userName: "John Doe",
      amount: 89.99,
      currency: "USD",
      category: "Software",
      description: "Design software monthly subscription",
      date: "2024-01-18",
      status: "approved",
      isBillable: false,
      receiptUrl: "/receipts/exp-003.jpg",
      createdAt: "2024-01-18T10:15:00Z"
    },
    {
      id: "EXP-004",
      projectId: projectId || "1",
      userId: "user-3",
      userName: "Mike Johnson",
      amount: 15.75,
      currency: "USD",
      category: "Office Supplies",
      description: "Notebooks and pens for project planning",
      date: "2024-01-17",
      status: "rejected",
      isBillable: false,
      createdAt: "2024-01-17T16:45:00Z"
    }
  ]

  const displayExpenses = expenses.length > 0 ? expenses : mockExpenses
  
  const filteredExpenses = displayExpenses.filter(expense => {
    const matchesSearch = expense.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter
    
    const matchesBillable = billableFilter === "all" || 
                           (billableFilter === "billable" && expense.isBillable) ||
                           (billableFilter === "non-billable" && !expense.isBillable)
    
    if (projectId) {
      return expense.projectId === projectId && matchesSearch && matchesStatus && matchesBillable
    }
    
    return matchesSearch && matchesStatus && matchesBillable
  })

  const getStatusColor = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "pending": return <Clock className="h-3 w-3" />
      case "approved": return <CheckCircle className="h-3 w-3" />
      case "rejected": return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  const getExpenseStats = () => {
    const totalExpenses = filteredExpenses.length
    const totalValue = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const approvedExpenses = filteredExpenses.filter(expense => expense.status === "approved").length
    const pendingExpenses = filteredExpenses.filter(expense => expense.status === "pending").length
    const billableValue = filteredExpenses
      .filter(expense => expense.isBillable && expense.status === "approved")
      .reduce((sum, expense) => sum + expense.amount, 0)
    
    return { totalExpenses, totalValue, approvedExpenses, pendingExpenses, billableValue }
  }

  const stats = getExpenseStats()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project expenses and reimbursements" : "Manage all expenses across projects"}
          </p>
        </div>
        <Button onClick={onCreateExpense} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Expense
        </Button>
      </div>

      {/* Stats Cards - Enhanced with better layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Expenses</CardTitle>
            <Receipt className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total amount submitted
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{stats.approvedExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for reimbursement
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pendingExpenses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Billable Value</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${stats.billableValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Client recoverable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: "all" | "pending" | "approved" | "rejected") => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={billableFilter} onValueChange={(value: "all" | "billable" | "non-billable") => setBillableFilter(value)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expenses</SelectItem>
            <SelectItem value="billable">Billable</SelectItem>
            <SelectItem value="non-billable">Non-billable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expense List - Enhanced layout with better visual hierarchy */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <Card 
            key={expense.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            onClick={() => onExpenseClick?.(expense)}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {expense.id}
                    </CardTitle>
                    <Badge className={getStatusColor(expense.status)} variant="secondary">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(expense.status)}
                        <span className="capitalize">{expense.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                    {expense.isBillable && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Billable
                      </Badge>
                    )}
                    {expense.receiptUrl && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Camera className="h-3 w-3 mr-1" />
                        Receipt
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {expense.description}
                  </CardDescription>
                </div>
                <div className="text-right sm:text-right min-w-fit">
                  <div className="text-2xl font-bold text-foreground">
                    ${expense.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {expense.currency} • {expense.category}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{expense.userName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(expense.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <div className="text-xs">
                  Submitted: {new Date(expense.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || billableFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first expense to get started."}
            </p>
            <Button onClick={onCreateExpense}>Create Expense</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
