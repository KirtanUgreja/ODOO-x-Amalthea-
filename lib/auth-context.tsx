"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Auth types
export interface AuthUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'project_manager' | 'team_member' | 'finance'
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

interface AuthContextType {
  user: AuthUser | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
  updateProfile: (userData: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'admin' | 'project_manager' | 'team_member' | 'finance'
  hourly_rate?: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = '/api/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!tokens

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedUser = localStorage.getItem('oneflow_user')
        const storedTokens = localStorage.getItem('oneflow_tokens')

        if (storedUser && storedTokens) {
          const parsedUser = JSON.parse(storedUser)
          const parsedTokens = JSON.parse(storedTokens)

          // Check if tokens are expired (basic check)
          const isExpired = isTokenExpired(parsedTokens.accessToken)
          
          if (!isExpired) {
            setUser(parsedUser)
            setTokens(parsedTokens)
          } else {
            // Try to refresh token
            refreshTokenWithStored(parsedTokens.refreshToken)
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        clearAuthState()
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()
  }, [])

  // Auto-redirect based on role when user logs in
  useEffect(() => {
    if (user && !isLoading) {
      const currentPath = window.location.pathname
      
      // Don't redirect if already on the correct page
      if (isOnCorrectRolePage(currentPath, user.role)) {
        return
      }

      // Redirect to role-appropriate page
      switch (user.role) {
        case 'admin':
          router.push('/admin')
          break
        case 'project_manager':
          router.push('/manager')
          break
        case 'finance':
          router.push('/finance')
          break
        case 'team_member':
          router.push('/employee')
          break
        default:
          router.push('/employee')
      }
    }
  }, [user, isLoading, router])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Store auth state
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      }

      const authTokens: AuthTokens = data.tokens

      setUser(authUser)
      setTokens(authTokens)

      // Persist to localStorage
      localStorage.setItem('oneflow_user', JSON.stringify(authUser))
      localStorage.setItem('oneflow_tokens', JSON.stringify(authTokens))

      // Set auth cookie for middleware
      document.cookie = `auth-token=${authTokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' }
      }

      // Auto-login after successful registration
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      }

      const authTokens: AuthTokens = data.tokens

      setUser(authUser)
      setTokens(authTokens)

      // Persist to localStorage
      localStorage.setItem('oneflow_user', JSON.stringify(authUser))
      localStorage.setItem('oneflow_tokens', JSON.stringify(authTokens))

      // Set auth cookie for middleware
      document.cookie = `auth-token=${authTokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear state
    setUser(null)
    setTokens(null)

    // Clear localStorage
    localStorage.removeItem('oneflow_user')
    localStorage.removeItem('oneflow_tokens')

    // Clear auth cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

    // Redirect to login
    router.push('/login')
  }

  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) {
      return false
    }

    return refreshTokenWithStored(tokens.refreshToken)
  }

  const refreshTokenWithStored = async (refreshTokenValue: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      if (!response.ok) {
        clearAuthState()
        return false
      }

      const data = await response.json()
      const newTokens: AuthTokens = data.tokens

      setTokens(newTokens)
      localStorage.setItem('oneflow_tokens', JSON.stringify(newTokens))
      document.cookie = `auth-token=${newTokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuthState()
      return false
    }
  }

  const updateProfile = async (userData: Partial<AuthUser>) => {
    if (!tokens?.accessToken) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Update failed' }
      }

      // Update user state
      const updatedUser = { ...user!, ...data.user }
      setUser(updatedUser)
      localStorage.setItem('oneflow_user', JSON.stringify(updatedUser))

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const clearAuthState = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('oneflow_user')
    localStorage.removeItem('oneflow_tokens')
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  }

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utility functions
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true
  }
}

function isOnCorrectRolePage(path: string, role: string): boolean {
  const roleRoutes = {
    admin: ['/admin'],
    project_manager: ['/manager'],
    finance: ['/finance'],
    team_member: ['/employee'],
  }

  const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] || []
  return allowedRoutes.some(route => path.startsWith(route))
}
