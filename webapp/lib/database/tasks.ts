import { query } from '../db'

export interface Task {
  id: string
  project_id: string
  task_list_id?: string
  title: string
  description?: string
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: Date
  estimated_hours?: number
  actual_hours: number
  created_at: Date
  updated_at: Date
}

export interface TaskDetails extends Task {
  project_name: string
  task_list_name?: string
  assignees: string[]
  comment_count: number
}

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'actual_hours'>) => {
  const result = await query(
    `INSERT INTO tasks (project_id, task_list_id, title, description, status, priority, due_date, estimated_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [taskData.project_id, taskData.task_list_id, taskData.title, taskData.description,
     taskData.status, taskData.priority, taskData.due_date, taskData.estimated_hours]
  )
  return result.rows[0] as Task
}

export const getTaskById = async (id: string): Promise<TaskDetails | null> => {
  const result = await query('SELECT * FROM task_details WHERE id = $1', [id])
  return result.rows[0] || null
}

export const getTasksByProject = async (projectId: string): Promise<TaskDetails[]> => {
  const result = await query('SELECT * FROM task_details WHERE project_id = $1 ORDER BY created_at DESC', [projectId])
  return result.rows
}

export const getTasksByUser = async (userId: string): Promise<TaskDetails[]> => {
  const result = await query(`
    SELECT td.* FROM task_details td
    JOIN task_assignees ta ON td.id = ta.task_id
    WHERE ta.user_id = $1 AND td.status NOT IN ('completed', 'cancelled')
    ORDER BY td.due_date ASC NULLS LAST
  `, [userId])
  return result.rows
}

export const assignTaskToUser = async (taskId: string, userId: string, assignedBy?: string) => {
  const result = await query(
    `INSERT INTO task_assignees (task_id, user_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (task_id, user_id) DO NOTHING
     RETURNING *`,
    [taskId, userId, assignedBy]
  )
  return result.rows[0]
}

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
  const values = Object.values(updates)
  
  const result = await query(
    `UPDATE tasks SET ${fields} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return result.rows[0] as Task
}

export const getOverdueTasks = async (userId?: string) => {
  if (userId) {
    const result = await query('SELECT * FROM get_user_overdue_tasks($1)', [userId])
    return result.rows
  } else {
    const result = await query(`
      SELECT t.id, t.title, p.name as project_name, t.due_date,
             (CURRENT_DATE - t.due_date)::INTEGER as days_overdue
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `)
    return result.rows
  }
}