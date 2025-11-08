"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } f      {/* Header - Enhanced with better spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Sales Orders</h1>
          <p className="text-lg text-muted-foreground">
            {projectId ? "Project sales orders and revenue tracking" : "Manage all sales orders across projects"}
          </p>
        </div>
        <Button onClick={onCreateSalesOrder} size="lg" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Sales Order
        </Button>
      </div>ents/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  ShoppingCart,
  DollarSign,
  Calendar,
  User,
  Search,
  Filter,
  FileText
} from "lucide-react"
import type { SalesOrder, DocumentStatus } from "@/lib/types"

interface SalesOrderManagerProps {
  projectId?: string
  salesOrders?: SalesOrder[]
  onSalesOrderClick?: (order: SalesOrder) => void
  onCreateSalesOrder?: () => void
}

export function SalesOrderManager({ 
  projectId, 
  salesOrders = [], 
  onSalesOrderClick, 
  onCreateSalesOrder 
}: SalesOrderManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all")

  // Mock data if no sales orders provided
  const mockSalesOrders: SalesOrder[] = [
    {
      id: "SO-001",
      projectId: projectId || "1",
      customerName: "Acme Corporation",
      customerEmail: "procurement@acme.com",
      amount: 45000,
      currency: "USD",
      description: "Website redesign project - Phase 1",
      status: "confirmed",
      orderDate: "2024-01-15",
      deliveryDate: "2024-04-15",
      createdAt: "2024-01-10"
    },
    {
      id: "SO-002",
      projectId: projectId || "2",
      customerName: "TechStart Inc",
      customerEmail: "orders@techstart.io",
      amount: 65000,
      currency: "USD",
      description: "Mobile application development",
      status: "draft",
      orderDate: "2024-02-01",
      deliveryDate: "2024-08-01",
      createdAt: "2024-01-25"
    },
    {
      id: "SO-003",
      projectId: projectId || "1",
      customerName: "Global Dynamics",
      customerEmail: "contact@globaldynamics.com",
      amount: 25000,
      currency: "USD",
      description: "Additional features and enhancements",
      status: "paid",
      orderDate: "2024-01-20",
      deliveryDate: "2024-03-20",
      createdAt: "2024-01-18"
    }
  ]

  const displayOrders = salesOrders.length > 0 ? salesOrders : mockSalesOrders
  
  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project sales orders and customer agreements" : "Manage all sales orders"}
          </p>
        </div>
        <Button onClick={onCreateSalesOrder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Sales Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
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
            <FileText className="h-4 w-4 text-muted-foreground" />
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sales orders..."
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

      {/* Sales Order List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card 
            key={order.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSalesOrderClick?.(order)}
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
                    <User className="h-3 w-3" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Order: {new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sales orders found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first sales order to get started."}
            </p>
            <Button onClick={onCreateSalesOrder}>Create Sales Order</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
