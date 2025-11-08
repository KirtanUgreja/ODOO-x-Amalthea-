"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
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
      description: "Website redesign project - Phase 1 development and design",
      status: "confirmed",
      orderDate: "2024-01-15",
      deliveryDate: "2024-04-15",
      createdAt: "2024-01-10"
    },
    {
      id: "SO-002",
      projectId: projectId || "1",
      customerName: "TechStart Inc.",
      customerEmail: "orders@techstart.com",
      amount: 32500,
      currency: "USD",
      description: "Mobile app development - MVP version",
      status: "draft",
      orderDate: "2024-01-20",
      deliveryDate: "2024-05-20",
      createdAt: "2024-01-18"
    },
    {
      id: "SO-003",
      projectId: projectId || "2",
      customerName: "Global Solutions Ltd",
      customerEmail: "procurement@globalsol.com",
      amount: 78000,
      currency: "USD",
      description: "Enterprise software integration project",
      status: "confirmed",
      orderDate: "2024-01-10",
      deliveryDate: "2024-06-10",
      createdAt: "2024-01-08"
    },
    {
      id: "SO-004",
      projectId: projectId || "3",
      customerName: "StartupCo",
      customerEmail: "hello@startupco.com",
      amount: 15750,
      currency: "USD",
      description: "E-commerce platform setup and customization",
      status: "pending",
      orderDate: "2024-01-25",
      deliveryDate: "2024-03-25",
      createdAt: "2024-01-22"
    }
  ]

  const displaySalesOrders = salesOrders.length > 0 ? salesOrders : mockSalesOrders
  
  const filteredSalesOrders = displaySalesOrders.filter(order => {
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
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed": return "bg-green-100 text-green-800 border-green-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "draft": return <FileText className="h-3 w-3" />
      case "pending": return <Clock className="h-3 w-3" />
      case "confirmed": return <CheckCircle className="h-3 w-3" />
      case "cancelled": return <AlertCircle className="h-3 w-3" />
      default: return <FileText className="h-3 w-3" />
    }
  }

  const getSalesOrderStats = () => {
    const totalOrders = filteredSalesOrders.length
    const totalValue = filteredSalesOrders.reduce((sum, order) => sum + order.amount, 0)
    const confirmedOrders = filteredSalesOrders.filter(order => order.status === "confirmed").length
    const pendingOrders = filteredSalesOrders.filter(order => order.status === "pending").length
    const confirmedValue = filteredSalesOrders
      .filter(order => order.status === "confirmed")
      .reduce((sum, order) => sum + order.amount, 0)
    
    return { totalOrders, totalValue, confirmedOrders, pendingOrders, confirmedValue }
  }

  const stats = getSalesOrderStats()

  return (
    <div className="space-y-6">
      {/* Header - Enhanced with better spacing */}
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
      </div>

      {/* Stats Cards - Enhanced with better layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All sales orders
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross sales value
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Confirmed</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{stats.confirmedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to execute
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Confirmed Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${stats.confirmedValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Secured revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Order List - Enhanced layout */}
      <div className="space-y-4">
        {filteredSalesOrders.map((order) => (
          <Card 
            key={order.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            onClick={() => onSalesOrderClick?.(order)}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {order.id}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    <span className="font-medium text-foreground">{order.customerName}</span> • {order.description}
                  </CardDescription>
                </div>
                <div className="text-right sm:text-right min-w-fit">
                  <div className="text-2xl font-bold text-foreground">
                    ${order.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {order.currency}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Order: {new Date(order.orderDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <div className="text-xs">
                  Created: {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSalesOrders.length === 0 && (
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
