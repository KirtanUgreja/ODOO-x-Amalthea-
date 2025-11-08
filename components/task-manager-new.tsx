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
  Flag,
  Calendar,
  User
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
  const [viewType, setViewType] = useState<"my" | "all">("my")

  // Mock data if no tasks provided
  const mockTasks: Task[] = [
    {
      id: "TASK-001",
      projectId: projectId || "1",
      title: "Design Landing Page",
      description: "Create wireframes and mockups for the new landing page with responsive design considerations",
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
      id: "TASK-002",
      projectId: projectId || "1",
      title: "Implement User Authentication",
      description: "Set up login, registration, and password recovery functionality with JWT tokens",
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
      id: "TASK-003",
      projectId: projectId || "2",
      title: "Database Schema Design",
      description: "Design and implement the database schema for user management and project tracking",
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
    },
    {
      id: "TASK-004",
      projectId: projectId || "1",
      title: "API Development",
      description: "Create REST API endpoints for project management functionality",
      status: "in_progress",
      priority: "high",
      assignedTo: "user-1",
      createdBy: "user-manager",
      dueDate: "2024-02-20",
      estimatedHours: 32,
      actualHours: 12,
      createdAt: "2024-01-22",
      updatedAt: "2024-01-25",
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
      case "new": return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "done": return "bg-green-100 text-green-800 border-green-200"
      case "blocked": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "medium": return "bg-yellow-500 text-white"
      case "low": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "new": return <Flag className="h-3 w-3" />
      case "in_progress": return <Clock className="h-3 w-3" />
      case "done": return <CheckSquare className="h-3 w-3" />
      case "blocked": return <AlertTriangle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getTaskStats = () => {
    const totalTasks = filteredTasks.length
    const newTasks = filteredTasks.filter(task => task.status === "new").length
    const inProgress = filteredTasks.filter(task => task.status === "in_progress").length
    const completed = filteredTasks.filter(task => task.status === "done").length
    const overdue = filteredTasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== "done"
    ).length
    
    return { totalTasks, newTasks, inProgress, completed, overdue }
  }

  const stats = getTaskStats()

  return (
    <div className="space-y-6">
      {/* Header - Enhanced with better spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Task Management</h1>
          <p className="text-lg text-muted-foreground">
            {projectId ? "Project tasks and assignments" : "Manage tasks across all projects"}
          </p>
        </div>
        <Button onClick={onCreateTask} size="lg" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Tasks</CardTitle>
            <CheckSquare className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">New</CardTitle>
            <Flag className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{stats.newTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to start
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently working
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
            <CheckSquare className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully done
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Overdue</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
          <Button
            variant={viewType === "my" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewType("my")}
          >
            My Tasks
          </Button>
          <Button
            variant={viewType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewType("all")}
          >
            All Tasks
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
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
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(value: TaskPriority | "all") => setPriorityFilter(value)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            onClick={() => onTaskClick?.(task)}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {task.title}
                    </CardTitle>
                    <Badge className={getStatusColor(task.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        <span className="capitalize">{task.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      <span className="capitalize">{task.priority}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {task.description}
                  </CardDescription>
                </div>
                <div className="text-right sm:text-right min-w-fit">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {task.id}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task.actualHours}h / {task.estimatedHours}h
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Assigned to User</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <div className="text-xs">
                  Created: {new Date(task.createdAt).toLocaleDateString('en-US', {
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

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first task to get started."}
            </p>
            <Button onClick={onCreateTask}>Create Task</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
