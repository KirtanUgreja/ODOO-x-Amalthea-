"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Clock, 
  CheckCircle, 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  User, 
  FileText, 
  Receipt, 
  Filter,
  Plus,
  MessageSquare,
  Paperclip,
  TrendingUp,
  Target,
  Wallet
} from "lucide-react"

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [taskFilter, setTaskFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showTimesheetDialog, setShowTimesheetDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  // Data filtering and calculations
  const myProjects = db.projects?.filter((p: any) => p.teamMembers?.includes(user?.id)) || []
  const myTasks = db.tasks?.filter((t: any) => t.assignedTo === user?.id) || []
  const myTimesheets = db.timesheets?.filter((ts: any) => ts.userId === user?.id) || []
  const myExpenses = db.expenses?.filter((e: any) => e.userId === user?.id) || []
  const taskComments = db.taskComments || []

  // Filter tasks based on selected filters
  const filteredTasks = myTasks.filter((task: any) => {
    const statusMatch = taskFilter === "all" || task.status === taskFilter
    const projectMatch = projectFilter === "all" || task.projectId === projectFilter
    return statusMatch && projectMatch
  })

  // Statistics calculations - current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const currentMonthTimesheets = myTimesheets.filter((ts: any) => {
    const tsDate = new Date(ts.date)
    return tsDate.getMonth() === currentMonth && tsDate.getFullYear() === currentYear
  })
  
  const totalHours = currentMonthTimesheets.reduce((sum: number, ts: any) => sum + (ts.hours || 0), 0)
  const billableHours = currentMonthTimesheets.filter((ts: any) => ts.billable).reduce((sum: number, ts: any) => sum + (ts.hours || 0), 0)
  const nonBillableHours = totalHours - billableHours
  const totalEarnings = totalHours * (user?.hourlyRate || 0)
  const pendingExpenses = myExpenses.filter((e: any) => e.status === "pending")
  const approvedExpenses = myExpenses.filter((e: any) => e.status === "approved")
  const overdueTasks = myTasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "done")

  // Sales calculations
  const totalSalesRevenue = (db.salesOrders || []).reduce((sum, so) => sum + (so.amount || 0), 0)
  const confirmedSalesOrders = (db.salesOrders || []).filter(so => so.status === 'confirmed').length
  
  const stats = [
    { label: "Active Tasks", value: myTasks.filter(t => t.status !== "done").length, icon: Target, color: "#714B67" },
    { label: "Sales Revenue", value: `₹${(totalSalesRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "#28a745" },
    { label: "Hours This Month", value: totalHours, icon: Clock, color: "#F0AD4E" },
    { label: "Pending Expenses", value: pendingExpenses.length, icon: Wallet, color: "#5BC0DE" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "blocked": return "bg-red-100 text-red-800"
      case "done": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600"
      case "medium": return "text-yellow-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const TaskCard = ({ task }: { task: any }) => {
    const project = myProjects.find(p => p.id === task.projectId)
    const comments = taskComments.filter(c => c.taskId === task.id)
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done"
    
    return (
      <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>{task.title}</h3>
            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{project?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
            {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
          </div>
        </div>
        
        <p className="text-sm mb-3" style={{ color: "var(--odoo-text)" }}>{task.description}</p>
        
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--odoo-muted)" }}>
          <div className="flex items-center gap-4">
            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()} Priority
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
            {comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {comments.length}
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedTask(task)
              setShowTaskDialog(true)
            }}
          >
            View Details
          </Button>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              {user?.name} Dashboard
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Your tasks, timesheets, and work progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="p-6 rounded-lg shadow" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p style={{ color: "var(--odoo-muted)" }} className="text-sm">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold mt-2" style={{ color: "var(--odoo-text)" }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <Select value={taskFilter} onValueChange={setTaskFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {myProjects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowTimesheetDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Hours
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>

              {overdueTasks.length > 0 && (
                <div className="p-4 rounded-lg border-l-4 border-red-500" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-red-700">Overdue Tasks ({overdueTasks.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {overdueTasks.map((task: any) => (
                      <div key={task.id} className="text-sm">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-red-600 ml-2">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Timesheets Tab */}
            <TabsContent value="timesheets" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--odoo-text)" }}>My Timesheets</h2>
                <Button onClick={() => setShowTimesheetDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Hours
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Total Hours</span>
                  </div>
                  <p className="text-2xl font-bold">{totalHours}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Billable Hours</span>
                  </div>
                  <p className="text-2xl font-bold">{billableHours}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold">Earnings</span>
                  </div>
                  <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                {myTimesheets
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((timesheet: any) => {
                    const task = myTasks.find(t => t.id === timesheet.taskId)
                    const project = myProjects.find(p => p.id === timesheet.projectId)
                    return (
                      <div key={timesheet.id} className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                              {task?.title || "Unknown Task"}
                            </h3>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {project?.name || 'Unknown Project'} • {new Date(timesheet.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-1">{timesheet.notes || 'No notes'}</p>
                            {timesheet.approvalStatus && (
                              <Badge className={`mt-1 ${
                                timesheet.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                timesheet.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {timesheet.approvalStatus}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{timesheet.hours}h</p>
                            <Badge className={timesheet.billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {timesheet.billable ? "Billable" : "Non-billable"}
                            </Badge>
                            <p className="text-sm mt-1">₹{(timesheet.hours * (user?.hourlyRate || 0)).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--odoo-text)" }}>My Expenses</h2>
                <Button onClick={() => setShowExpenseDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Expense
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">{pendingExpenses.length}</p>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                    ₹{pendingExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Approved</span>
                  </div>
                  <p className="text-2xl font-bold">{approvedExpenses.length}</p>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                    ₹{approvedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Total Submitted</span>
                  </div>
                  <p className="text-2xl font-bold">₹{myExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                {myExpenses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((expense: any) => {
                    const project = myProjects.find(p => p.id === expense.projectId)
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "pending": return "bg-yellow-100 text-yellow-800"
                        case "approved": return "bg-green-100 text-green-800"
                        case "rejected": return "bg-red-100 text-red-800"
                        case "reimbursed": return "bg-blue-100 text-blue-800"
                        default: return "bg-gray-100 text-gray-800"
                      }
                    }
                    
                    return (
                      <div key={expense.id} className="p-4 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                              {expense.description}
                            </h3>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {project?.name || 'No Project'} • {expense.category || 'Uncategorized'} • {new Date(expense.createdAt).toLocaleDateString()}
                            </p>
                            {expense.receipt && (
                              <div className="flex items-center gap-1 mt-1">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{expense.receipt}</span>
                              </div>
                            )}
                            {expense.approvedBy && (
                              <p className="text-xs mt-1" style={{ color: "var(--odoo-muted)" }}>
                                Approved by: {db.users?.find((u: any) => u.id === expense.approvedBy)?.name || expense.approvedBy}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{expense.amount?.toLocaleString() || '0'}</p>
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                            <Badge className={expense.billable ? "bg-green-100 text-green-800 ml-2" : "bg-gray-100 text-gray-800 ml-2"}>
                              {expense.billable ? "Billable" : "Non-billable"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Work Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Projects:</span>
                      <span className="font-semibold">{myProjects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Tasks:</span>
                      <span className="font-semibold">{myTasks.filter(t => t.status !== "done").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Tasks:</span>
                      <span className="font-semibold">{myTasks.filter(t => t.status === "done").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overdue Tasks:</span>
                      <span className="font-semibold text-red-600">{overdueTasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hourly Rate:</span>
                      <span className="font-semibold">₹{user?.hourlyRate}/hour</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Sales & Revenue</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Sales Orders:</span>
                      <span className="font-semibold">{(db.salesOrders || []).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed Orders:</span>
                      <span className="font-semibold text-green-600">{(db.salesOrders || []).filter(so => so.status === 'confirmed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold text-green-600">₹{(db.salesOrders || []).reduce((sum, so) => sum + (so.amount || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Invoices:</span>
                      <span className="font-semibold">{(db.invoices || []).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Invoices:</span>
                      <span className="font-semibold text-blue-600">{(db.invoices || []).filter(inv => inv.status === 'paid').length}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--odoo-card)" }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--odoo-text)" }}>Recent Activity</h3>
                  <div className="space-y-3">
                    {myTimesheets
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((ts: any) => {
                        const task = myTasks.find(t => t.id === ts.taskId)
                        const project = myProjects.find(p => p.id === ts.projectId)
                        return (
                          <div key={ts.id} className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{task?.title || 'Unknown Task'}</p>
                              <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                                {ts.hours}h logged • {project?.name} • {new Date(ts.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Task Details Dialog */}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedTask?.title}</DialogTitle>
              </DialogHeader>
              {selectedTask && (
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm mt-1">{selectedTask.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select defaultValue={selectedTask.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <p className={`text-sm mt-2 font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Add Comment</Label>
                    <Textarea placeholder="Add your comment or update..." className="mt-1" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
                    <Button>Update Task</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Timesheet Dialog */}
          <Dialog open={showTimesheetDialog} onOpenChange={setShowTimesheetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Hours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {myTasks.map((task: any) => (
                        <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Hours</Label>
                    <Input type="number" placeholder="8" />
                  </div>
                </div>
                <div>
                  <Label>Billable</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Billable</SelectItem>
                      <SelectItem value="false">Non-billable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="What did you work on?" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTimesheetDialog(false)}>Cancel</Button>
                  <Button>Log Hours</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Expense Dialog */}
          <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Project</Label>
                  <Select>
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
                    <Label>Amount (₹)</Label>
                    <Input type="number" placeholder="1500" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Billable</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Should client be charged?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Billable (Client pays)</SelectItem>
                      <SelectItem value="false">Non-billable (Company pays)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Cab fare for client meeting" />
                </div>
                <div>
                  <Label>Receipt</Label>
                  <Input type="file" accept="image/*,.pdf" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>Cancel</Button>
                  <Button>Submit Expense</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
