"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FolderOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Plus, 
  Search,
  Filter,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign
} from "lucide-react"
import type { Project, ProjectStatus } from "@/lib/types"

interface ProjectDashboardProps {
  projects: Project[]
  onProjectClick: (project: Project) => void
  onCreateProject: () => void
}

export function ProjectDashboard({ projects, onProjectClick, onCreateProject }: ProjectDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-green-100 text-green-800"
      case "on_hold": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
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

  // Calculate KPIs
  const activeProjects = projects.filter(p => p.status === "in_progress").length
  const completedProjects = projects.filter(p => p.status === "completed").length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0

  return (
    <div className="space-y-4">
      {/* Header - Reduced spacing for better alignment */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">OneFlow Dashboard</h1>
          <p className="text-muted-foreground">Plan to Bill in One Place</p>
        </div>
        <Button onClick={onCreateProject} size="default" className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* KPI Widgets - Enhanced with better visual hierarchy and colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50/50 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Projects</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{activeProjects}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              +{projects.filter(p => p.status === "planned").length} planned
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-red-50/50 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Delayed Tasks</CardTitle>
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">3</div>
            <p className="text-xs text-red-600 mt-1 font-medium">
              Tasks past due date
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50/50 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Hours Logged</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">1,247</div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              This month across projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50/50 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Revenue Earned</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-purple-600 mt-1 font-medium">
              Total project budgets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onProjectClick(project)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(project.status)}
                    {project.status.replace('_', ' ')}
                  </div>
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">₹{project.budget.toLocaleString()}</span>
                </div>

                {/* Due Date */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Team Size */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Size:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.teamMemberIds.length + 1}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your filters" 
              : "Get started by creating a new project"
            }
          </p>
          {(!searchTerm && statusFilter === "all") && (
            <div className="mt-6">
              <Button onClick={onCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
