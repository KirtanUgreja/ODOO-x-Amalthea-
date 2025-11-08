"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Calendar,
  User,
  Timer,
  DollarSign
} from "lucide-react"

export function TeamMemberDashboard() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseCategory, setExpenseCategory] = useState("")

  // Mock data for team member
  const mockTasks = [
    {
      id: "1",
      name: "Design Homepage Layout",
      project: "Website Redesign",
      dueDate: "2024-11-15",
      status: "in_progress",
      priority: "high"
    },
    {
      id: "2", 
      name: "User Testing Session",
      project: "Mobile App",
      dueDate: "2024-11-12",
      status: "todo",
      priority: "medium"
    },
    {
      id: "3",
      name: "Code Review",
      project: "API Integration",
      dueDate: "2024-11-10",
      status: "done",
      priority: "low"
    },
    {
      id: "4",
      name: "Database Migration",
      project: "Backend Upgrade",
      dueDate: "2024-11-20",
      status: "blocked",
      priority: "high"
    }
  ]

  const taskStats = {
    total: mockTasks.length,
    inProgress: mockTasks.filter(t => t.status === "in_progress").length,
    blocked: mockTasks.filter(t => t.status === "blocked").length,
    done: mockTasks.filter(t => t.status === "done").length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "blocked": return "bg-red-100 text-red-800"
      case "todo": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleSubmitExpense = () => {
    // Mock expense submission
    console.log("Expense submitted:", { expenseAmount, expenseDescription, expenseCategory })
    setIsExpenseModalOpen(false)
    setExpenseAmount("")
    setExpenseDescription("")
    setExpenseCategory("")
  }

  return (
    <div className="dashboard-container space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, Team Member 👋</h1>
          <p className="mt-2 text-muted-foreground">Your tasks and activities overview</p>
        </div>
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Plus className="mr-2 h-4 w-4" />
              Submit Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit New Expense</DialogTitle>
              <DialogDescription>
                Add a new expense for reimbursement approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  placeholder="$0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Travel, Meals, Office Supplies..."
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Expense description..."
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmitExpense} className="w-full">
                Submit Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Statistics Cards */}
      <div className="stats-grid grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to you
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.blocked}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for dependencies
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.done}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {task.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Timesheet Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Timesheet Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hours Today:</span>
                <span className="font-medium">7.5 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hours This Week:</span>
                <span className="font-medium">32 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Target Week:</span>
                <span className="font-medium">40 hrs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">80% of weekly target</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Office Supplies</p>
                  <p className="text-xs text-muted-foreground">Nov 8, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$45.99</p>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Client Lunch</p>
                  <p className="text-xs text-muted-foreground">Nov 6, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$89.50</p>
                  <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Travel - Taxi</p>
                  <p className="text-xs text-muted-foreground">Nov 5, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$23.40</p>
                  <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
