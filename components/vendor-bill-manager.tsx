"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  FileText,
  DollarSign,
  Calendar,
  Building,
  Search,
  Clock,
  AlertCircle
} from "lucide-react"
import type { VendorBill, DocumentStatus } from "@/lib/types"

interface VendorBillManagerProps {
  projectId?: string
  vendorBills?: VendorBill[]
  onVendorBillClick?: (bill: VendorBill) => void
  onCreateVendorBill?: () => void
}

export function VendorBillManager({ 
  projectId, 
  vendorBills = [], 
  onVendorBillClick, 
  onCreateVendorBill 
}: VendorBillManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")

  // Mock data if no vendor bills provided
  const mockVendorBills: VendorBill[] = [
    {
      id: "VB-001",
      projectId: projectId || "1",
      purchaseOrderId: "PO-001",
      vendorName: "CloudHost Solutions",
      vendorEmail: "billing@cloudhost.com",
      amount: 2400,
      currency: "USD",
      description: "Monthly cloud hosting services - January 2024",
      status: "paid",
      billDate: "2024-01-15",
      dueDate: "2024-02-15",
      createdAt: "2024-01-15"
    },
    {
      id: "VB-002",
      projectId: projectId || "1",
      purchaseOrderId: "PO-002",
      vendorName: "Design Assets Co",
      vendorEmail: "billing@designassets.com",
      amount: 850,
      currency: "USD",
      description: "Premium stock photos and icons license",
      status: "confirmed",
      billDate: "2024-01-22",
      dueDate: "2024-02-22",
      createdAt: "2024-01-22"
    },
    {
      id: "VB-003",
      projectId: projectId || "2",
      vendorName: "DevTools Inc",
      vendorEmail: "billing@devtools.inc",
      amount: 5000,
      currency: "USD",
      description: "Annual development tools subscription",
      status: "draft",
      billDate: "2024-02-01",
      dueDate: "2024-03-01",
      createdAt: "2024-02-01"
    },
    {
      id: "VB-004",
      projectId: projectId || "1",
      vendorName: "Marketing Pro",
      vendorEmail: "accounts@marketingpro.com",
      amount: 1200,
      currency: "USD",
      description: "SEO analysis and content optimization",
      status: "confirmed",
      billDate: "2024-01-10",
      dueDate: "2024-01-25",
      createdAt: "2024-01-10"
    }
  ]

  const displayBills = vendorBills.length > 0 ? vendorBills : mockVendorBills
  
  const filteredBills = displayBills.filter(bill => {
    const matchesSearch = bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter
    
    if (projectId) {
      return bill.projectId === projectId && matchesSearch && matchesStatus
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

  const isOverdue = (bill: VendorBill) => {
    const today = new Date()
    const dueDate = new Date(bill.dueDate)
    return bill.status === "confirmed" && dueDate < today
  }

  const getBillStats = () => {
    const totalBills = filteredBills.length
    const totalValue = filteredBills.reduce((sum, bill) => sum + bill.amount, 0)
    const paidBills = filteredBills.filter(bill => bill.status === "paid").length
    const overdueBills = filteredBills.filter(isOverdue).length
    
    return { totalBills, totalValue, paidBills, overdueBills }
  }

  const stats = getBillStats()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Bills</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project vendor bills and payments" : "Manage all vendor bills"}
          </p>
        </div>
        <Button onClick={onCreateVendorBill} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Vendor Bill
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBills}</div>
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
            <div className="text-2xl font-bold">{stats.paidBills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueBills}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vendor bills..."
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

      {/* Vendor Bill List */}
      <div className="grid gap-4">
        {filteredBills.map((bill) => (
          <Card 
            key={bill.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              isOverdue(bill) ? 'border-red-200 bg-red-50/50' : ''
            }`}
            onClick={() => onVendorBillClick?.(bill)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{bill.id}</CardTitle>
                    <Badge className={getStatusColor(bill.status)}>
                      {bill.status}
                    </Badge>
                    {isOverdue(bill) && (
                      <Badge variant="destructive">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {bill.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${bill.amount.toLocaleString()} {bill.currency}
                  </div>
                  {bill.purchaseOrderId && (
                    <div className="text-sm text-muted-foreground">
                      PO: {bill.purchaseOrderId}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span>{bill.vendorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Billed: {new Date(bill.billDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={isOverdue(bill) ? 'text-red-600 font-medium' : ''}>
                  Due: {new Date(bill.dueDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBills.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vendor bills found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first vendor bill to get started."}
            </p>
            <Button onClick={onCreateVendorBill}>Create Vendor Bill</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
