import { mockProjects } from '../mock-db'

export interface Project {
  id: string
  name: string
  description?: string
  manager_id: string
  customer_id?: string
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  start_date?: Date
  end_date?: Date
  budget?: number
  archived: boolean
  created_at: Date
  updated_at: Date
}

export interface ProjectSummary extends Project {
  manager_name: string
  customer_name?: string
  team_size: number
  total_tasks: number
  completed_tasks: number
  total_hours_logged: number
  billable_amount: number
  total_expenses: number
}

export const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'archived'>) => {
  const newProject = {
    ...projectData,
    id: `project-${Date.now()}`,
    archived: false,
    created_at: new Date(),
    updated_at: new Date()
  }
  mockProjects.push(newProject as any)
  return newProject
}

export const getProjectById = async (id: string): Promise<ProjectSummary | null> => {
  return mockProjects.find(project => project.id === id) || null
}

export const getAllProjects = async (): Promise<ProjectSummary[]> => {
  return mockProjects.filter(project => !project.archived)
}

export const getProjectsByManager = async (managerId: string): Promise<ProjectSummary[]> => {
  return mockProjects.filter(project => project.manager_id === managerId && !project.archived)
}

export const updateProject = async (id: string, updates: Partial<Project>) => {
  const projectIndex = mockProjects.findIndex(project => project.id === id)
  if (projectIndex !== -1) {
    mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updates }
    return mockProjects[projectIndex]
  }
  return null
}

export const getProjectDashboard = async (projectId: string) => {
  const project = mockProjects.find(p => p.id === projectId)
  return project ? {
    project_name: project.name,
    completion_percentage: 0,
    budget_utilization: 0,
    team_size: project.team_size || 0,
    active_tasks: 0,
    overdue_tasks: 0,
    total_hours: 0,
    billable_hours: 0
  } : null
}