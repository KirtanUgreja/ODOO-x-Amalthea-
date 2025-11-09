export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateProject(project: any): ValidationResult {
  const errors: string[] = []
  
  if (!project.name?.trim()) errors.push('Project name is required')
  if (!project.managerId) errors.push('Project manager is required')
  if (!project.startDate) errors.push('Start date is required')
  if (!project.endDate) errors.push('End date is required')
  if (project.budget && project.budget < 0) errors.push('Budget must be positive')
  
  if (project.startDate && project.endDate && new Date(project.startDate) > new Date(project.endDate)) {
    errors.push('Start date must be before end date')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateTask(task: any): ValidationResult {
  const errors: string[] = []
  
  if (!task.title?.trim()) errors.push('Task title is required')
  if (!task.projectId) errors.push('Project is required')
  if (!task.dueDate) errors.push('Due date is required')
  if (!['low', 'medium', 'high'].includes(task.priority)) errors.push('Invalid priority level')
  if (!['new', 'in_progress', 'blocked', 'done'].includes(task.status)) errors.push('Invalid status')
  
  return { isValid: errors.length === 0, errors }
}

export function validateTimesheet(timesheet: any): ValidationResult {
  const errors: string[] = []
  
  if (!timesheet.projectId) errors.push('Project is required')
  if (!timesheet.userId) errors.push('User is required')
  if (!timesheet.hours || timesheet.hours <= 0) errors.push('Hours must be greater than 0')
  if (timesheet.hours > 24) errors.push('Hours cannot exceed 24 per day')
  if (!timesheet.date) errors.push('Date is required')
  
  return { isValid: errors.length === 0, errors }
}

export function validateExpense(expense: any): ValidationResult {
  const errors: string[] = []
  
  if (!expense.projectId) errors.push('Project is required')
  if (!expense.userId) errors.push('User is required')
  if (!expense.amount || expense.amount <= 0) errors.push('Amount must be greater than 0')
  if (!expense.description?.trim()) errors.push('Description is required')
  if (!expense.category?.trim()) errors.push('Category is required')
  
  return { isValid: errors.length === 0, errors }
}