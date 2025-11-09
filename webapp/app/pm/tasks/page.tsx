"use client"

import { useAuth } from "@/lib/auth-context"
import { useDb } from "@/hooks/use-db"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, MessageSquare, Paperclip, AlertTriangle, X } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TasksPage() {
  const { user } = useAuth()
  const { db, loading, error, updateRecord, deleteRecord, getProjectData, addRecord } = useDb()
  const [view, setView] = useState("all")
  const [selectedProject, setSelectedProject] = useState("all")
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "medium",
    dueDate: ""
  })

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  if (!db || !user) return <div className="flex items-center justify-center h-screen">No data available</div>

  const projectData = getProjectData(user.id)
  if (!projectData) return <div className="flex items-center justify-center h-screen">Unable to load tasks</div>

  const myProjects = projectData.projects
  const projectTasks = projectData.tasks
  
  const filteredTasks = projectTasks.filter((t: any) => {
    if (selectedProject !== "all" && t.projectId !== selectedProject) return false
    if (view === "my" && t.assignedTo !== user?.id) return false
    return true
  })

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateRecord('tasks', taskId, { status })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await deleteRecord('tasks', taskId)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const isDelayed = (task: any) => {
    return new Date(task.dueDate) < new Date() && task.status !== "done"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: "#6c757d",
      in_progress: "#007bff", 
      blocked: "#dc3545",
      done: "#28a745"
    }
    return colors[status as keyof typeof colors] || "#6c757d"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "#28a745",
      medium: "#ffc107",
      high: "#dc3545"
    }
    return colors[priority as keyof typeof colors] || "#6c757d"
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-8" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: "var(--odoo-text)" }}>
              Task Management
            </h1>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                setTaskForm({
                  title: "",
                  description: "",
                  projectId: selectedProject !== "all" ? selectedProject : myProjects[0]?.id || "",
                  assignedTo: "",
                  priority: "medium",
                  dueDate: ""
                })
                setShowCreateTask(true)
              }}
            >
              <Plus size={16} />
              New Task
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={view === "all" ? "default" : "outline"}
                onClick={() => setView("all")}
              >
                All Tasks
              </Button>
              <Button
                variant={view === "my" ? "default" : "outline"}
                onClick={() => setView("my")}
              >
                My Tasks
              </Button>
            </div>

            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Projects</option>
              {myProjects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["new", "in_progress", "blocked", "done"].map((status) => (
              <div key={status} className="space-y-4">
                <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getStatusColor(status) }}
                  />
                  {status.replace("_", " ")}
                  <span className="text-sm text-gray-500">
                    ({filteredTasks.filter((t: any) => t.status === status).length})
                  </span>
                </h3>

                <div className="space-y-3">
                  {filteredTasks
                    .filter((task: any) => task.status === status)
                    .map((task: any) => {
                      const project = myProjects.find((p: any) => p.id === task.projectId)
                      const assignee = db.users.find((u: any) => u.id === task.assignedTo)
                      const comments = db.taskComments?.filter((c: any) => c.taskId === task.id) || []
                      
                      return (
                        <div 
                          key={task.id} 
                          className="p-4 rounded-lg shadow border-l-4" 
                          style={{ 
                            backgroundColor: "var(--odoo-card)",
                            borderLeftColor: getPriorityColor(task.priority)
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              {task.title}
                            </h4>
                            {isDelayed(task) && (
                              <AlertTriangle size={16} className="text-red-500" />
                            )}
                          </div>

                          <p className="text-sm mb-3" style={{ color: "var(--odoo-muted)" }}>
                            {task.description}
                          </p>

                          <div className="space-y-2 text-xs">
                            <div>Project: {project?.name}</div>
                            <div>Assignee: {assignee?.name}</div>
                            <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2">
                              <span 
                                className="px-2 py-1 rounded text-white text-xs"
                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setTaskForm({
                                  title: task.title,
                                  description: task.description || "",
                                  projectId: task.projectId,
                                  assignedTo: task.assignedTo || "",
                                  priority: task.priority,
                                  dueDate: task.dueDate?.split('T')[0] || ""
                                })
                                setShowEditTask(task.id)
                              }}
                            >
                              <Edit size={12} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare size={12} />
                              {comments.length > 0 && (
                                <span className="ml-1">{comments.length}</span>
                              )}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Paperclip size={12} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>

                          <div className="mt-3">
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded"
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="blocked">Blocked</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Create Task Dialog */}
          <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await addRecord('tasks', {
                    ...taskForm,
                    status: 'new'
                  })
                  setShowCreateTask(false)
                } catch (error) {
                  console.error('Failed to create task:', error)
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project *</label>
                    <select
                      required
                      value={taskForm.projectId}
                      onChange={(e) => setTaskForm({...taskForm, projectId: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Select Project</option>
                      {myProjects.map((project: any) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assignee</label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Unassigned</option>
                      {db.users.filter((u: any) => u.role === 'team_member').map((user: any) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit">Create Task</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog open={!!showEditTask} onOpenChange={() => setShowEditTask(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!showEditTask) return
                try {
                  await updateRecord('tasks', showEditTask, taskForm)
                  setShowEditTask(null)
                } catch (error) {
                  console.error('Failed to update task:', error)
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project *</label>
                    <select
                      required
                      value={taskForm.projectId}
                      onChange={(e) => setTaskForm({...taskForm, projectId: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {myProjects.map((project: any) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assignee</label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Unassigned</option>
                      {db.users.filter((u: any) => u.role === 'team_member').map((user: any) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit">Update Task</Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditTask(null)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}