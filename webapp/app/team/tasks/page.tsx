"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { EmployeeSidebar } from "@/components/employee/employee-sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  User,
  Filter,
  Plus,
  Eye
} from "lucide-react"

export default function EmployeeTasksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [taskFilter, setTaskFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [newComment, setNewComment] = useState("")
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    if (!loading && user?.role !== "team_member" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const myProjects = db.projects.filter((p: any) => p.teamMembers.includes(user?.id))
  const myTasks = db.tasks.filter((t: any) => t.assignedTo === user?.id)
  const taskComments = db.taskComments || []

  const filteredTasks = myTasks.filter((task: any) => {
    const statusMatch = taskFilter === "all" || task.status === taskFilter
    const projectMatch = projectFilter === "all" || task.projectId === projectFilter
    return statusMatch && projectMatch
  })

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

  const handleUpdateTask = () => {
    // In a real app, this would update the database
    console.log("Updating task:", selectedTask.id, "Status:", newStatus, "Comment:", newComment)
    setShowTaskDialog(false)
    setNewComment("")
    setNewStatus("")
  }

  const TaskCard = ({ task }: { task: any }) => {
    const project = myProjects.find(p => p.id === task.projectId)
    const comments = taskComments.filter(c => c.taskId === task.id)
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done"
    
    return (
      <div className="p-4 rounded-lg border hover:shadow-md transition-shadow" style={{ backgroundColor: "var(--odoo-card)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg" style={{ color: "var(--odoo-text)" }}>{task.title}</h3>
            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{project?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
            {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
          </div>
        </div>
        
        <p className="text-sm mb-4" style={{ color: "var(--odoo-text)" }}>{task.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--odoo-muted)" }}>
            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
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
            onClick={() => {
              setSelectedTask(task)
              setNewStatus(task.status)
              setShowTaskDialog(true)
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </div>
      </div>
    )
  }

  const tasksByStatus = {
    new: filteredTasks.filter(t => t.status === "new"),
    in_progress: filteredTasks.filter(t => t.status === "in_progress"),
    blocked: filteredTasks.filter(t => t.status === "blocked"),
    done: filteredTasks.filter(t => t.status === "done")
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
              My Tasks
            </h1>
            <p style={{ color: "var(--odoo-muted)" }}>Manage your assigned tasks and track progress</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
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

          {/* Task Views */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
                  <p style={{ color: "var(--odoo-muted)" }}>No tasks found matching your filters</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="kanban">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(tasksByStatus).map(([status, tasks]) => (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize" style={{ color: "var(--odoo-text)" }}>
                        {status.replace('_', ' ')}
                      </h3>
                      <Badge variant="secondary">{tasks.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {tasks.map((task: any) => (
                        <div key={task.id} className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow" 
                             style={{ backgroundColor: "var(--odoo-card)" }}
                             onClick={() => {
                               setSelectedTask(task)
                               setNewStatus(task.status)
                               setShowTaskDialog(true)
                             }}>
                          <h4 className="font-medium text-sm mb-2" style={{ color: "var(--odoo-text)" }}>
                            {task.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs" style={{ color: "var(--odoo-muted)" }}>
                            <span className={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Task Details Dialog */}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  {selectedTask?.title}
                </DialogTitle>
              </DialogHeader>
              {selectedTask && (
                <div className="space-y-6">
                  {/* Task Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Project</Label>
                      <p className="text-sm mt-1" style={{ color: "var(--odoo-text)" }}>
                        {myProjects.find(p => p.id === selectedTask.projectId)?.name}
                      </p>
                    </div>
                    <div>
                      <Label>Assigned By</Label>
                      <p className="text-sm mt-1" style={{ color: "var(--odoo-text)" }}>
                        Project Manager
                      </p>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <p className={`text-sm mt-1 font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <p className="text-sm mt-1" style={{ color: "var(--odoo-text)" }}>
                        {new Date(selectedTask.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <p className="text-sm mt-1 p-3 rounded" style={{ 
                      backgroundColor: "var(--odoo-light-bg)",
                      color: "var(--odoo-text)"
                    }}>
                      {selectedTask.description}
                    </p>
                  </div>

                  {/* Status Update */}
                  <div>
                    <Label>Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-1">
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

                  {/* Comments Section */}
                  <div>
                    <Label>Comments & Updates</Label>
                    <div className="mt-2 space-y-3 max-h-40 overflow-y-auto">
                      {taskComments
                        .filter(c => c.taskId === selectedTask.id)
                        .map((comment: any) => (
                          <div key={comment.id} className="p-3 rounded" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">Project Manager</span>
                              <span className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Add Comment */}
                  <div>
                    <Label>Add Comment/Update</Label>
                    <Textarea 
                      placeholder="Provide status update, ask questions, or report blockers..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateTask}>
                      Update Task
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}