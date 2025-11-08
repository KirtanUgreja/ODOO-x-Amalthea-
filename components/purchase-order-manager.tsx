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
  Filter,
  ShoppingCart
} from "lucide-react"
import type { PurchaseOrder, DocumentStatus } from "@/lib/types"

interface PurchaseOrderManagerProps {
  projectId?: string
  purchaseOrders?: PurchaseOrder[]
  onPurchaseOrderClick?: (order: PurchaseOrder) => void
  onCreatePurchaseOrder?: () => void
}

export function PurchaseOrderManager({ 
  projectId, 
  purchaseOrders = [], 
  onPurchaseOrderClick, 
  onCreatePurchaseOrder 
}: PurchaseOrderManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")

  // Mock data if no purchase orders provided
  const mockPurchaseOrders: PurchaseOrder[] = [
    {
      id: "PO-001",
      projectId: projectId || "1",
      vendorName: "CloudHost Solutions",
      vendorEmail: "billing@cloudhost.com",
      amount: 2400,
      currency: "USD",
      description: "Cloud hosting services for 12 months",
      status: "confirmed",
      orderDate: "2024-01-10",
      expectedDate: "2024-01-15",
      createdAt: "2024-01-08"
    },
    {
      id: "PO-002",
      projectId: projectId || "1",
      vendorName: "Design Assets Co",
      vendorEmail: "sales@designassets.com",
      amount: 850,
      currency: "USD",
      description: "Premium stock photos and icons license",
      status: "draft",
      orderDate: "2024-01-20",
      expectedDate: "2024-01-22",
      createdAt: "2024-01-18"
    },
    {
      id: "PO-003",
      projectId: projectId || "2",
      vendorName: "DevTools Inc",
      vendorEmail: "orders@devtools.inc",
      amount: 5000,
      currency: "USD",
      description: "Mobile development tools and licenses",
      status: "paid",
      orderDate: "2024-01-12",
      expectedDate: "2024-01-14",
      createdAt: "2024-01-10"
    }
  ]

  const displayOrders = purchaseOrders.length > 0 ? purchaseOrders : mockPurchaseOrders
  
  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    if (projectId) {
      return order.projectId === projectId && matchesSearch && matchesStatus
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

  const getOrderStats = () => {
    const totalOrders = filteredOrders.length
    const totalValue = filteredOrders.reduce((sum, order) => sum + order.amount, 0)
    const confirmedOrders = filteredOrders.filter(order => order.status === "confirmed").length
    const paidOrders = filteredOrders.filter(order => order.status === "paid").length
    
    return { totalOrders, totalValue, confirmedOrders, paidOrders }
  }

  const stats = getOrderStats()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project purchase orders and vendor agreements" : "Manage all purchase orders"}
          </p>
        </div>
        <Button onClick={onCreatePurchaseOrder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
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
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search purchase orders..."
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

      {/* Purchase Order List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card 
            key={order.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onPurchaseOrderClick?.(order)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {order.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${order.amount.toLocaleString()} {order.currency}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span>{order.vendorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Order: {new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  Expected: {new Date(order.expectedDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first purchase order to get started."}
            </p>
            <Button onClick={onCreatePurchaseOrder}>Create Purchase Order</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
