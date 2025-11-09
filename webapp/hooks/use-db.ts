"use client"

import { useState, useEffect, useCallback } from "react"

interface Database {
  users: any[]
  projects: any[]
  tasks: any[]
  timesheets: any[]
  expenses: any[]
  salesOrders: any[]
  purchaseOrders: any[]
  invoices: any[]
  vendorBills: any[]
  milestones: any[]
  taskLists: any[]
  taskComments: any[]
  financialRequests: any[]
  customers: any[]
  vendors: any[]
  products: any[]
}

export function useDb() {
  const [db, setDb] = useState<Database | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDb()
    const interval = setInterval(fetchDb, 30000) // Auto-refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDb = async () => {
    try {
      setError(null)
      const response = await fetch("/api/db")
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      setDb(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch database:", error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setLoading(false)
    }
  }

  const updateDb = useCallback(async (updates: Partial<Database>) => {
    try {
      setError(null)
      const response = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error('Failed to update data')
      const data = await response.json()
      setDb(data.db)
      return data.db
    } catch (error) {
      console.error("Failed to update database:", error)
      setError(error instanceof Error ? error.message : 'Update failed')
      throw error
    }
  }, [])

  const addRecord = useCallback(async (table: keyof Database, record: any) => {
    if (!db) return
    const getIdPrefix = (tableName: string) => {
      switch (tableName) {
        case 'salesOrders': return 'so'
        case 'purchaseOrders': return 'po'
        case 'invoices': return 'inv'
        case 'vendorBills': return 'vb'
        case 'expenses': return 'exp'
        case 'timesheets': return 'ts'
        case 'tasks': return 'task'
        case 'projects': return 'proj'
        case 'users': return 'user'
        default: return table.slice(0, -1)
      }
    }
    const newRecord = { ...record, id: `${getIdPrefix(table)}-${Date.now()}`, createdAt: new Date().toISOString() }
    const updatedTable = [...db[table], newRecord]
    await updateDb({ [table]: updatedTable })
    return newRecord
  }, [db, updateDb])

  const updateRecord = useCallback(async (table: keyof Database, id: string, updates: any) => {
    try {
      setError(null)
      const response = await fetch("/api/db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id, data: updates }),
      })
      if (!response.ok) throw new Error('Failed to update record')
      await fetchDb() // Refresh data
    } catch (error) {
      console.error("Failed to update record:", error)
      setError(error instanceof Error ? error.message : 'Update failed')
      throw error
    }
  }, [fetchDb])

  const deleteRecord = useCallback(async (table: keyof Database, id: string) => {
    try {
      setError(null)
      const response = await fetch("/api/db", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id }),
      })
      if (!response.ok) throw new Error('Failed to delete record')
      await fetchDb() // Refresh data
    } catch (error) {
      console.error("Failed to delete record:", error)
      setError(error instanceof Error ? error.message : 'Delete failed')
      throw error
    }
  }, [fetchDb])

  const getProjectData = useCallback((userId: string) => {
    if (!db) return null
    
    const myProjects = db.projects.filter((p: any) => p.managerId === userId && !p.archived)
    const myTasks = db.tasks.filter((t: any) => myProjects.some((p: any) => p.id === t.projectId))
    const myTimesheets = db.timesheets.filter((ts: any) => myProjects.some((p: any) => p.id === ts.projectId))
    const myExpenses = db.expenses.filter((e: any) => myProjects.some((p: any) => p.id === e.projectId))
    
    return {
      projects: myProjects,
      tasks: myTasks,
      timesheets: myTimesheets,
      expenses: myExpenses,
      delayedTasks: myTasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "done"),
      pendingExpenses: myExpenses.filter((e: any) => e.status === "pending"),
      totalHours: myTimesheets.reduce((sum: number, ts: any) => sum + ts.hours, 0),
      totalRevenue: db.salesOrders
        .filter((so: any) => myProjects.some((p: any) => p.id === so.projectId))
        .reduce((sum: number, so: any) => sum + so.amount, 0)
    }
  }, [db])

  return { 
    db, 
    loading, 
    error, 
    fetchDb, 
    updateDb, 
    addRecord, 
    updateRecord, 
    deleteRecord, 
    getProjectData 
  }
}
