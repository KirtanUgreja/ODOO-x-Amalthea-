"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Workflow, Plus, Edit, Trash2, Play, Pause, Settings } from "lucide-react"

export default function WorkflowManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger: "",
    steps: [""],
    status: "active"
  })
  const [workflows, setWorkflows] = useState([
    {
      id: "wf-1",
      name: "Project Approval Workflow",
      description: "Automated approval process for new projects",
      trigger: "Project Creation",
      steps: ["Manager Review", "Budget Approval", "Resource Allocation", "Final Approval"],
      status: "active",
      executionCount: 25,
      successRate: 92
    },
    {
      id: "wf-2",
      name: "Expense Approval Workflow", 
      description: "Multi-level expense approval process",
      trigger: "Expense Submission",
      steps: ["Team Lead Review", "Finance Review", "Final Approval", "Payment Processing"],
      status: "active",
      executionCount: 156,
      successRate: 88
    },
    {
      id: "wf-3",
      name: "Task Assignment Workflow",
      description: "Automatic task assignment based on workload",
      trigger: "Task Creation",
      steps: ["Skill Matching", "Workload Check", "Assignment", "Notification"],
      status: "paused",
      executionCount: 89,
      successRate: 95
    },
    {
      id: "wf-4",
      name: "Invoice Generation Workflow",
      description: "Automated invoice creation from completed projects",
      trigger: "Project Completion",
      steps: ["Time Calculation", "Rate Application", "Invoice Creation", "Client Notification"],
      status: "active",
      executionCount: 34,
      successRate: 100
    }
  ])

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.description || !newWorkflow.trigger) return
    
    const workflowData = {
      ...newWorkflow,
      id: `wf-${Date.now()}`,
      steps: newWorkflow.steps.filter(step => step.trim() !== ""),
      executionCount: 0,
      successRate: 100,
      createdAt: new Date().toISOString()
    }
    
    const updatedWorkflows = [...workflows, workflowData]
    setWorkflows(updatedWorkflows)
    
    // Save to database if workflows collection exists
    if (db && db.workflows) {
      await updateDb({ workflows: [...db.workflows, workflowData] })
    }
    
    setShowCreateForm(false)
    setNewWorkflow({
      name: "",
      description: "",
      trigger: "",
      steps: [""],
      status: "active"
    })
  }

  const handleAddStep = () => {
    setNewWorkflow({
      ...newWorkflow,
      steps: [...newWorkflow.steps, ""]
    })
  }

  const handleRemoveStep = (index: number) => {
    const updatedSteps = newWorkflow.steps.filter((_, i) => i !== index)
    setNewWorkflow({
      ...newWorkflow,
      steps: updatedSteps.length > 0 ? updatedSteps : [""]
    })
  }

  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...newWorkflow.steps]
    updatedSteps[index] = value
    setNewWorkflow({
      ...newWorkflow,
      steps: updatedSteps
    })
  }

  const handleToggleWorkflow = (workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    const updatedWorkflows = workflows.map(w => 
      w.id === workflowId ? { ...w, status: newStatus } : w
    )
    setWorkflows(updatedWorkflows)
    alert(`Workflow ${workflowId} ${newStatus === "active" ? "activated" : "paused"}`)
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "#28a745" : "#ffc107"
  }

  if (loading || !db) return <div>Loading...</div>

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>Workflow Management</h1>
                <p style={{ color: "var(--odoo-muted)" }}>Configure and manage automated business workflows</p>
              </div>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <Plus size={16} />
                Create Workflow
              </button>
            </div>
          </div>

          {/* Create Workflow Form */}
          {showCreateForm && (
            <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Create New Workflow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Workflow Name"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                />
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow({...newWorkflow, trigger: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                  required
                >
                  <option value="">Select Trigger</option>
                  <option value="Project Creation">Project Creation</option>
                  <option value="Task Creation">Task Creation</option>
                  <option value="Expense Submission">Expense Submission</option>
                  <option value="Invoice Generation">Invoice Generation</option>
                  <option value="User Registration">User Registration</option>
                  <option value="Project Completion">Project Completion</option>
                </select>
                <select
                  value={newWorkflow.status}
                  onChange={(e) => setNewWorkflow({...newWorkflow, status: e.target.value})}
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <textarea
                placeholder="Workflow Description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                className="w-full px-3 py-2 rounded border mb-4"
                style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                rows={3}
                required
              />
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: "var(--odoo-text)" }}>Workflow Steps</h4>
                  <button
                    onClick={handleAddStep}
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: "var(--odoo-accent)" }}
                  >
                    Add Step
                  </button>
                </div>
                <div className="space-y-2">
                  {newWorkflow.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 rounded border"
                        style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                      />
                      {newWorkflow.steps.length > 1 && (
                        <button
                          onClick={() => handleRemoveStep(index)}
                          className="p-2 rounded hover:bg-red-100"
                          title="Remove Step"
                        >
                          <Trash2 size={16} style={{ color: "#dc3545" }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateWorkflow}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Workflow
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: "var(--odoo-muted)", color: "white" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Workflow Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Workflows</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-primary)" }}>{workflows.length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Active</h3>
              <p className="text-2xl font-bold" style={{ color: "#28a745" }}>
                {workflows.filter(w => w.status === "active").length}
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Total Executions</h3>
              <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>
                {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Avg Success Rate</h3>
              <p className="text-2xl font-bold" style={{ color: "var(--odoo-accent)" }}>
                {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
              </p>
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--odoo-primary)" + "20" }}>
                      <Workflow size={20} style={{ color: "var(--odoo-primary)" }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>{workflow.name}</h3>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleToggleWorkflow(workflow.id, workflow.status)}
                      className="p-2 rounded hover:bg-gray-100"
                      title={workflow.status === "active" ? "Pause Workflow" : "Activate Workflow"}
                    >
                      {workflow.status === "active" ? 
                        <Pause size={16} style={{ color: "#ffc107" }} /> : 
                        <Play size={16} style={{ color: "#28a745" }} />
                      }
                    </button>
                    <button className="p-2 rounded hover:bg-gray-100" title="Edit Workflow">
                      <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button className="p-2 rounded hover:bg-red-100" title="Delete Workflow">
                      <Trash2 size={16} style={{ color: "#dc3545" }} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>Status</span>
                    <span 
                      className="px-2 py-1 rounded text-xs font-semibold capitalize"
                      style={{ backgroundColor: getStatusColor(workflow.status) + "20", color: getStatusColor(workflow.status) }}
                    >
                      {workflow.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: "var(--odoo-text)" }}>Trigger</span>
                    <span className="text-sm" style={{ color: "var(--odoo-muted)" }}>{workflow.trigger}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>Workflow Steps</h4>
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "var(--odoo-primary)" }}>
                          {index + 1}
                        </div>
                        <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: "var(--odoo-primary)" }}>{workflow.executionCount}</p>
                    <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>Executions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: "#28a745" }}>{workflow.successRate}%</p>
                    <p className="text-xs" style={{ color: "var(--odoo-muted)" }}>Success Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Builder Section */}
          <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <Settings size={24} style={{ color: "var(--odoo-primary)" }} />
              <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>Workflow Builder</h3>
            </div>
            <p className="mb-4" style={{ color: "var(--odoo-muted)" }}>
              Create custom workflows to automate your business processes. Define triggers, conditions, and actions to streamline operations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 rounded-lg border text-left hover:shadow-md transition-shadow" style={{ borderColor: "var(--odoo-border)" }}>
                <h4 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Approval Workflows</h4>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Multi-step approval processes</p>
              </button>
              <button className="p-4 rounded-lg border text-left hover:shadow-md transition-shadow" style={{ borderColor: "var(--odoo-border)" }}>
                <h4 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Notification Workflows</h4>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Automated notifications and alerts</p>
              </button>
              <button className="p-4 rounded-lg border text-left hover:shadow-md transition-shadow" style={{ borderColor: "var(--odoo-border)" }}>
                <h4 className="font-semibold mb-2" style={{ color: "var(--odoo-text)" }}>Data Workflows</h4>
                <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Data processing and transformation</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}