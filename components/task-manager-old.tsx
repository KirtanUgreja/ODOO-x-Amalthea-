"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search,
  Filter,
  CheckSquare,
  Clock,
  Users,
  AlertTriangle,
  Flag
} from "lucide-react"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

interface TaskManagerProps {
  projectId?: string
  tasks?: Task[]
  onTaskClick?: (task: Task) => void
  onCreateTask?: () => void
}

export function TaskManager({ projectId, tasks = [], onTaskClick, onCreateTask }: TaskManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")

  // Mock data if no tasks provided
  const mockTasks: Task[] = [
    {
      id: "1",
      projectId: projectId || "1",
      title: "Design Landing Page",
      description: "Create wireframes and mockups for the new landing page",
      status: "in_progress",
      priority: "high",
      assignedTo: "user-1",
      createdBy: "user-manager",
      dueDate: "2024-02-15",
      estimatedHours: 16,
      actualHours: 8,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      comments: [],
      attachments: []
    },
    {
      id: "2",
      projectId: projectId || "1",
      title: "Implement User Authentication",
      description: "Set up login, registration, and password recovery functionality",
      status: "new",
      priority: "urgent",
      assignedTo: "user-2",
      createdBy: "user-manager",
      dueDate: "2024-02-10",
      estimatedHours: 24,
      actualHours: 0,
      createdAt: "2024-01-18",
      updatedAt: "2024-01-18",
      comments: [],
      attachments: []
    },
    {
      id: "3",
      projectId: projectId || "2",
      title: "Database Schema Design",
      description: "Design and implement the database schema for user management",
      status: "done",
      priority: "medium",
      assignedTo: "user-3",
      createdBy: "user-manager",
      dueDate: "2024-01-30",
      estimatedHours: 12,
      actualHours: 14,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-28",
      comments: [],
      attachments: []
    }
  ]

  const displayTasks = tasks.length > 0 ? tasks : mockTasks
  
  const filteredTasks = displayTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    
    if (projectId) {
      return task.projectId === projectId && matchesSearch && matchesStatus && matchesPriority
    }
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "blocked": return "bg-red-100 text-red-800"
      case "done": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-800"
      case "medium": return "bg-blue-100 text-blue-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "urgent": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent": return <Flag className="h-3 w-3" />
      case "high": return <AlertTriangle className="h-3 w-3" />
      default: return null
    }
  }

  const getTaskStats = () => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter(t => t.status === "done").length
    const inProgress = filteredTasks.filter(t => t.status === "in_progress").length
    const blocked = filteredTasks.filter(t => t.status === "blocked").length
    
    return { total, completed, inProgress, blocked }
  }

  const stats = getTaskStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project tasks and assignments" : "Manage all tasks across projects"}
          </p>
        </div>
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blocked}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks / All Tasks Toggle & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={projectId ? "default" : "outline"} 
            size="sm"
            className="transition-all"
          >
            My Tasks
          </Button>
          <Button 
            variant={!projectId ? "default" : "outline"} 
            size="sm"
            className="transition-all"
          >
            All Tasks
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: TaskStatus | "all") => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(value: TaskPriority | "all") => setPriorityFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onTaskClick?.(task)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    {getPriorityIcon(task.priority)}
                  </div>
                  <CardDescription className="text-sm">
                    {task.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Assigned to: {task.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.actualHours}h / {task.estimatedHours}h</span>
                  </div>
                </div>
                <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by creating your first task."}
            </p>
            <Button onClick={onCreateTask}>Create Task</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
