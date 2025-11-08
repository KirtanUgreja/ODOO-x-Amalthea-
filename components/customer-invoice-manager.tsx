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
  FileText,
  Clock
} from "lucide-react"
import type { CustomerInvoice, DocumentStatus } from "@/lib/types"

interface CustomerInvoiceManagerProps {
  projectId?: string
  customerInvoices?: CustomerInvoice[]
  onCustomerInvoiceClick?: (invoice: CustomerInvoice) => void
  onCreateCustomerInvoice?: () => void
}

export function CustomerInvoiceManager({ 
  projectId, 
  customerInvoices = [], 
  onCustomerInvoiceClick, 
  onCreateCustomerInvoice 
}: CustomerInvoiceManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")

  // Mock data if no invoices provided
  const mockInvoices: CustomerInvoice[] = [
    {
      id: "INV-001",
      projectId: projectId || "1",
      salesOrderId: "SO-001",
      customerName: "Acme Corporation",
      customerEmail: "accounts@acme.com",
      amount: 22500,
      currency: "USD",
      description: "Website redesign project - Milestone 1",
      status: "paid",
      invoiceDate: "2024-01-20",
      dueDate: "2024-02-20",
      createdAt: "2024-01-18"
    },
    {
      id: "INV-002",
      projectId: projectId || "1",
      salesOrderId: "SO-001",
      customerName: "Acme Corporation",
      customerEmail: "accounts@acme.com",
      amount: 22500,
      currency: "USD",
      description: "Website redesign project - Milestone 2",
      status: "confirmed",
      invoiceDate: "2024-02-15",
      dueDate: "2024-03-15",
      createdAt: "2024-02-13"
    },
    {
      id: "INV-003",
      projectId: projectId || "2",
      customerName: "TechStart Inc",
      customerEmail: "billing@techstart.io",
      amount: 32500,
      currency: "USD",
      description: "Mobile app development - Initial payment",
      status: "draft",
      invoiceDate: "2024-02-01",
      dueDate: "2024-03-01",
      createdAt: "2024-01-30"
    }
  ]

  const displayInvoices = customerInvoices.length > 0 ? customerInvoices : mockInvoices
  
  const filteredInvoices = displayInvoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    
    if (projectId) {
      return invoice.projectId === projectId && matchesSearch && matchesStatus
    }
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "paid": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (invoice: CustomerInvoice) => {
    const today = new Date()
    const dueDate = new Date(invoice.dueDate)
    return invoice.status === "confirmed" && dueDate < today
  }

  const getInvoiceStats = () => {
    const totalInvoices = filteredInvoices.length
    const totalValue = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === "paid").length
    const overdueInvoices = filteredInvoices.filter(isOverdue).length
    
    return { totalInvoices, totalValue, paidInvoices, overdueInvoices }
  }

  const stats = getInvoiceStats()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Invoices</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project customer invoices and billing" : "Manage all customer invoices"}
          </p>
        </div>
        <Button onClick={onCreateCustomerInvoice} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: DocumentStatus | "all") => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card 
            key={invoice.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              isOverdue(invoice) ? 'border-red-200 bg-red-50/50' : ''
            }`}
            onClick={() => onCustomerInvoiceClick?.(invoice)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{invoice.id}</CardTitle>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    {isOverdue(invoice) && (
                      <Badge variant="destructive">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {invoice.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${invoice.amount.toLocaleString()} {invoice.currency}
                  </div>
                  {invoice.salesOrderId && (
                    <div className="text-sm text-muted-foreground">
                      SO: {invoice.salesOrderId}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{invoice.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={isOverdue(invoice) ? 'text-red-600 font-medium' : ''}>
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first customer invoice to get started."}
            </p>
            <Button onClick={onCreateCustomerInvoice}>Create Invoice</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
