"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Settings,
  Plus,
  Users,
  Calendar,
  DollarSign,
  FileText,
  ShoppingCart,
  Receipt,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  FolderOpen
} from "lucide-react"
import type { Project, Task, SalesOrder, PurchaseOrder, CustomerInvoice, VendorBill, Expense, Timesheet, ProjectStatus } from "@/lib/types"

interface ProjectDetailsProps {
  project: Project
  tasks: Task[]
  salesOrders: SalesOrder[]
  purchaseOrders: PurchaseOrder[]
  customerInvoices: CustomerInvoice[]
  vendorBills: VendorBill[]
  expenses: Expense[]
  timesheets: Timesheet[]
  onBack: () => void
  onEditProject: () => void
  onCreateTask: () => void
  onTaskClick: (task: Task) => void
}

export function ProjectDetails({
  project,
  tasks,
  salesOrders,
  purchaseOrders,
  customerInvoices,
  vendorBills,
  expenses,
  timesheets,
  onBack,
  onEditProject,
  onCreateTask,
  onTaskClick
}: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate financials
  const totalRevenue = salesOrders.reduce((sum, so) => sum + so.amount, 0) + 
                      customerInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  
  const totalCosts = purchaseOrders.reduce((sum, po) => sum + po.amount, 0) + 
                    vendorBills.reduce((sum, bill) => sum + bill.amount, 0) + 
                    expenses.reduce((sum, exp) => sum + exp.amount, 0) +
                    timesheets.reduce((sum, ts) => sum + (ts.hours * (ts.hourlyRate || 0)), 0)
  
  const profit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0

  // Task statistics
  const completedTasks = tasks.filter(t => t.status === "done").length
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length
  const blockedTasks = tasks.filter(t => t.status === "blocked").length
  const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0)

  // Utility functions for status colors and icons
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed": return "bg-green-100 text-green-800 border-green-200"
      case "on_hold": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case "planned": return <Calendar className="w-4 h-4" />
      case "in_progress": return <Clock className="w-4 h-4" />
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "on_hold": return <AlertCircle className="w-4 h-4" />
      default: return <FolderOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header - Reduced spacing */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Badge className={`${getStatusColor(project.status)} text-sm px-2 py-1`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(project.status)}
              <span className="font-medium capitalize">{project.status.replace('_', ' ')}</span>
            </div>
          </Badge>
          <Button variant="outline" onClick={onEditProject} size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Links Panel - Reduced spacing */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Project Links
          </CardTitle>
          <CardDescription className="text-sm">
            Quick access to financial documents
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-blue-50 border-blue-200"
              onClick={() => {/* TODO: Navigate to project sales orders */}}
            >
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span className="text-xl font-bold text-blue-600">{salesOrders.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Sales Orders</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-purple-50 border-purple-200"
              onClick={() => {/* TODO: Navigate to project purchase orders */}}
            >
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-xl font-bold text-purple-600">{purchaseOrders.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Purchase Orders</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-green-50 border-green-200"
              onClick={() => {/* TODO: Navigate to project invoices */}}
            >
              <div className="flex items-center gap-1">
                <Receipt className="w-4 h-4 text-green-600" />
                <span className="text-xl font-bold text-green-600">{customerInvoices.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Customer Invoices</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-orange-50 border-orange-200"
              onClick={() => {/* TODO: Navigate to project vendor bills */}}
            >
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="text-xl font-bold text-orange-600">{vendorBills.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Vendor Bills</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-red-50 border-red-200"
              onClick={() => {/* TODO: Navigate to project expenses */}}
            >
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="text-xl font-bold text-red-600">{expenses.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Expenses</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}/{tasks.length}</div>
                <p className="text-xs text-muted-foreground">{blockedTasks} blocked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours}</div>
                <p className="text-xs text-muted-foreground">Total hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{profitMargin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">₹{profit.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">₹{project.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge>{project.status.replace('_', ' ')}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium text-green-600">₹{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Costs:</span>
                  <span className="font-medium text-red-600">₹{totalCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Profit:</span>
                  <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{profit.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <Button onClick={onCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
          
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onTaskClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.priority}</Badge>
                      <Badge className={
                        task.status === "done" ? "bg-green-100 text-green-800" :
                        task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        task.status === "blocked" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financials">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Sales Orders</h4>
                  {salesOrders.map((so) => (
                    <div key={so.id} className="flex justify-between text-sm">
                      <span>{so.description}</span>
                      <span>₹{so.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customer Invoices</h4>
                  {customerInvoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between text-sm">
                      <span>{inv.description}</span>
                      <span>₹{inv.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Purchase Orders</h4>
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="flex justify-between text-sm">
                      <span>{po.description}</span>
                      <span>₹{po.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Vendor Bills</h4>
                  {vendorBills.map((bill) => (
                    <div key={bill.id} className="flex justify-between text-sm">
                      <span>{bill.description}</span>
                      <span>₹{bill.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Expenses</h4>
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between text-sm">
                      <span>{exp.description}</span>
                      <span>₹{exp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timesheets.map((timesheet) => (
                  <div key={timesheet.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{timesheet.userName}</div>
                      <div className="text-sm text-muted-foreground">{timesheet.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{timesheet.hours}h</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{(timesheet.hours * timesheet.hourlyRate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
