import { mockUsers } from '../mock-db'

export interface User {
  id: string
  email: string
  password_hash?: string
  name: string
  phone?: string
  address?: string
  hourly_rate: number
  status: 'active' | 'inactive' | 'suspended'
  created_at: Date
  updated_at?: Date
}

export interface UserWithRoles extends User {
  roles: string[]
  departments: string[]
}

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
  const newUser = {
    ...userData,
    id: `user-${Date.now()}`,
    created_at: new Date()
  }
  mockUsers.push(newUser as any)
  return newUser
}

export const getUserById = async (id: string): Promise<UserWithRoles | null> => {
  return mockUsers.find(user => user.id === id) || null
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return mockUsers.find(user => user.email === email) || null
}

export const updateUser = async (id: string, updates: Partial<User>) => {
  const userIndex = mockUsers.findIndex(user => user.id === id)
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    return mockUsers[userIndex]
  }
  return null
}

export const getAllUsers = async (): Promise<UserWithRoles[]> => {
  return mockUsers
}