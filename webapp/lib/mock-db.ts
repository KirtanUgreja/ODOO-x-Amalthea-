// Mock database for development when PostgreSQL is not available
export const mockUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440100',
    email: 'admin@oneflow.com',
    name: 'Admin User',
    roles: ['admin'],
    departments: ['Engineering'],
    status: 'active',
    hourly_rate: 0,
    created_at: new Date()
  }
];

export const mockProjects = [
  {
    id: '550e8400-e29b-41d4-a716-446655440200',
    name: 'Sample Project',
    description: 'A sample project for testing',
    status: 'in_progress',
    manager_name: 'Admin User',
    team_size: 1,
    total_tasks: 0,
    completed_tasks: 0,
    created_at: new Date()
  }
];

export const mockTasks = [];