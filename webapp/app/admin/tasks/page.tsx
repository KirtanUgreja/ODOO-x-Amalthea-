"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Clock, AlertTriangle, CheckCircle, Edit, Trash2, Plus, Filter, Search, Eye, User } from "lucide-react"

export default function AdminTasks() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()

  const handleSaveTask = async () => {
    if (!db || !newTask.title || !newTask.projectId) return
    
    if (editingTaskId) {
      // Update existing task
      const updatedTasks = db.tasks.map((t: any) =>
        t.id === editingTaskId ? { ...t, ...newTask } : t
      )
      await updateDb({ tasks: updatedTasks })
    } else {
      // Create new task
      const taskData = {
        ...newTask,
        id: `task-${Date.now()}`,
        taskListId: null,
        createdAt: new Date().toISOString()
      }
      await updateDb({ tasks: [...db.tasks, taskData] })
    }
    
    setShowCreateForm(false)
    setEditingTaskId(null)
    setNewTask({
      title: "",
      description: "",
      projectId: "",
      assignedTo: "",
      priority: "medium",
      status: "new",
      dueDate: ""
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!db || !confirm("Delete this task?")) return
    
    const updatedTasks = db.tasks.filter((t: any) => t.id !== taskId)
    await updateDb({ tasks: updatedTasks })
  }

  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id)
    setNewTask({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate?.split('T')[0] || ""
    })
    setShowCreateForm(true)
  }
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "medium",
    status: "new",
    dueDate: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filteredTasks = db.tasks.filter((task: any) => {
    const matchesStatus = filter === "all" || task.status === filter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.users.find((u: any) => u.id === task.assignedTo)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

  const totalTasks = db.tasks.length
  const completedTasks = db.tasks.filter((t: any) => t.status === "completed").length
  const inProgressTasks = db.tasks.filter((t: any) => t.status === "in_progress").length
  const overdueTasks = db.tasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "completed").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#28a745"
      case "in_progress": return "var(--odoo-accent)"
      case "new": return "var(--odoo-primary)"
      case "on_hold": return "#ffc107"
      default: return "var(--odoo-muted)"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#dc3545"
      case "medium": return "#ffc107"
      case "low": return "#28a745"
      default: return "var(--odoo-muted)"
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  All Tasks Management
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  View, create, edit, and manage all tasks across all projects
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Task
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Eye size={16} />
                  Bulk Actions
                </button>
              </div>
            </div>
          </div>

          {/* Create Task Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                >
                  <option value="">Select Project</option>
                  {db?.projects.filter((p: any) => p.status !== 'archived').map((project: any) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="">Assign To</option>
                  {db?.users.filter((u: any) => u.role === 'team_member' || u.role === 'project_manager').map((user: any) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                />
              </div>
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full mt-4 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveTask}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  {editingTaskId ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingTaskId(null)
                    setNewTask({
                      title: "",
                      description: "",
                      projectId: "",
                      assignedTo: "",
                      priority: "medium",
                      status: "new",
                      dueDate: ""
                    })
                  }}
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: "var(--odoo-muted)", color: "white" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Tasks</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{totalTasks}</p>
                </div>
                <Clock size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Completed</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{completedTasks}</p>
                </div>
                <CheckCircle size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>In Progress</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>{inProgressTasks}</p>
                </div>
                <Clock size={24} style={{ color: "var(--odoo-accent)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Overdue</p>
                  <p className="text-2xl font-bold" style={{ color: "#dc3545" }}>{overdueTasks}</p>
                </div>
                <AlertTriangle size={24} style={{ color: "#dc3545" }} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--odoo-light-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Task</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Project</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Assigned To</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Priority</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Status</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Due Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Hours Logged</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--odoo-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task: any, index: number) => {
                    const project = db.projects.find((p: any) => p.id === task.projectId)
                    const assignee = db.users.find((u: any) => u.id === task.assignedTo)
                    const taskHours = db.timesheets.filter((t: any) => t.taskId === task.id).reduce((sum: number, t: any) => sum + t.hours, 0)
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
                    
                    return (
                      <tr 
                        key={task.id} 
                        className={`${index % 2 === 0 ? "" : ""} ${isOverdue ? "border-l-4" : ""}`}
                        style={{ 
                          backgroundColor: index % 2 === 0 ? "transparent" : "var(--odoo-light-bg)",
                          borderLeftColor: isOverdue ? "#dc3545" : "transparent"
                        }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium" style={{ color: "var(--odoo-text)" }}>
                              {task.title}
                            </p>
                            <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                              {task.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--odoo-text)" }}>
                          {project?.name || "No Project"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User size={16} style={{ color: "var(--odoo-muted)" }} />
                            <span style={{ color: "var(--odoo-text)" }}>
                              {assignee?.name || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: getPriorityColor(task.priority) + "20",
                              color: getPriorityColor(task.priority)
                            }}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: getStatusColor(task.status),
                              color: "white"
                            }}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className={`text-sm ${isOverdue ? "font-semibold" : ""}`}
                            style={{ color: isOverdue ? "#dc3545" : "var(--odoo-text)" }}
                          >
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <div className="text-xs" style={{ color: "#dc3545" }}>
                              Overdue
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium" style={{ color: "var(--odoo-text)" }}>
                            {taskHours}h
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditTask(task)}
                              className="p-1 rounded hover:bg-gray-100"
                              title="Edit Task"
                            >
                              <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 rounded hover:bg-red-100"
                              title="Delete Task"
                            >
                              <Trash2 size={16} style={{ color: "#dc3545" }} />
                            </button>
                            <button 
                              className="p-1 rounded hover:bg-blue-100"
                              title="View Details"
                            >
                              <Eye size={16} style={{ color: "var(--odoo-primary)" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: "var(--odoo-muted)" }}>No tasks found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}