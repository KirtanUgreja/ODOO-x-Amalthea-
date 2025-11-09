"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Header } from "@/components/layout/header"
import { Filter, Plus, Save, Trash2, Edit, Search, Calendar, DollarSign, Users, Briefcase, Eye } from "lucide-react"

export default function AdminFilters() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading } = useDb()
  const [activeFilter, setActiveFilter] = useState("projects")
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [showCreateFilter, setShowCreateFilter] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [filterCriteria, setFilterCriteria] = useState<any>({})

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  // Mock saved filters data
  useEffect(() => {
    setSavedFilters([
      {
        id: "filter-1",
        name: "High Priority Overdue Tasks",
        type: "tasks",
        criteria: { priority: "high", status: "overdue" },
        createdBy: "admin",
        createdAt: "2024-01-10",
        resultCount: 5
      },
      {
        id: "filter-2", 
        name: "Projects Over Budget",
        type: "projects",
        criteria: { budgetUtilization: ">100%" },
        createdBy: "admin",
        createdAt: "2024-01-08",
        resultCount: 2
      },
      {
        id: "filter-3",
        name: "Pending Expenses This Month",
        type: "expenses", 
        criteria: { status: "pending", dateRange: "thisMonth" },
        createdBy: "admin",
        createdAt: "2024-01-05",
        resultCount: 8
      },
      {
        id: "filter-4",
        name: "Low Billability Employees",
        type: "users",
        criteria: { billabilityRate: "<70%" },
        createdBy: "admin", 
        createdAt: "2024-01-03",
        resultCount: 3
      }
    ])
  }, [])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const filterTypes = [
    {
      id: "projects",
      title: "Projects",
      icon: Briefcase,
      color: "#714B67",
      fields: ["Status", "Budget Range", "Manager", "Date Range", "Completion %"]
    },
    {
      id: "tasks", 
      title: "Tasks",
      icon: Edit,
      color: "#00A09D",
      fields: ["Priority", "Status", "Assignee", "Due Date", "Project"]
    },
    {
      id: "users",
      title: "Users",
      icon: Users, 
      color: "#007bff",
      fields: ["Role", "Hourly Rate Range", "Billability %", "Join Date"]
    },
    {
      id: "expenses",
      title: "Expenses", 
      icon: DollarSign,
      color: "#dc3545",
      fields: ["Status", "Amount Range", "Employee", "Date Range", "Project"]
    },
    {
      id: "timesheets",
      title: "Timesheets",
      icon: Calendar,
      color: "#ffc107", 
      fields: ["Billable", "Employee", "Date Range", "Hours Range", "Project"]
    }
  ]

  const handleCreateFilter = () => {
    const newFilter = {
      id: `filter-${Date.now()}`,
      name: filterName,
      type: activeFilter,
      criteria: filterCriteria,
      createdBy: user?.name || "admin",
      createdAt: new Date().toISOString().split('T')[0],
      resultCount: Math.floor(Math.random() * 20) + 1
    }
    setSavedFilters([...savedFilters, newFilter])
    setShowCreateFilter(false)
    setFilterName("")
    setFilterCriteria({})
  }

  const handleDeleteFilter = (filterId: string) => {
    if (confirm("Delete this saved filter?")) {
      setSavedFilters(savedFilters.filter(f => f.id !== filterId))
    }
  }

  const getFilterIcon = (type: string) => {
    const filterType = filterTypes.find(ft => ft.id === type)
    return filterType?.icon || Filter
  }

  const getFilterColor = (type: string) => {
    const filterType = filterTypes.find(ft => ft.id === type)
    return filterType?.color || "var(--odoo-muted)"
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
                  Advanced Filters & Views
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Create, save, and manage custom filters for all system data
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateFilter(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Filter
                </button>
              </div>
            </div>
          </div>

          {/* Filter Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>Filter Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {filterTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveFilter(type.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      activeFilter === type.id ? "ring-2" : ""
                    }`}
                    style={{ 
                      backgroundColor: "var(--odoo-card)", 
                      borderColor: activeFilter === type.id ? type.color : "var(--odoo-border)",
                      ringColor: activeFilter === type.id ? type.color : "transparent"
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} style={{ color: type.color }} />
                      <h4 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                        {type.title}
                      </h4>
                    </div>
                    <div className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                      {type.fields.slice(0, 3).join(", ")}
                      {type.fields.length > 3 && "..."}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Create Filter Modal */}
          {showCreateFilter && (
            <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--odoo-text)" }}>
                Create New {filterTypes.find(ft => ft.id === activeFilter)?.title} Filter
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Enter filter name..."
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                    Filter Type
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded border" style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}>
                    {(() => {
                      const Icon = getFilterIcon(activeFilter)
                      return <Icon size={16} style={{ color: getFilterColor(activeFilter) }} />
                    })()}
                    <span style={{ color: "var(--odoo-text)" }}>
                      {filterTypes.find(ft => ft.id === activeFilter)?.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Filter Criteria based on selected type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--odoo-text)" }}>
                  Filter Criteria
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterTypes.find(ft => ft.id === activeFilter)?.fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-xs mb-1" style={{ color: "var(--odoo-muted)" }}>
                        {field}
                      </label>
                      <select 
                        className="w-full px-3 py-2 rounded border text-sm"
                        style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                        onChange={(e) => setFilterCriteria({...filterCriteria, [field.toLowerCase()]: e.target.value})}
                      >
                        <option value="">Any</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleCreateFilter}
                  disabled={!filterName.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Save size={16} />
                  Save Filter
                </button>
                <button 
                  onClick={() => setShowCreateFilter(false)}
                  className="px-4 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", color: "var(--odoo-text)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Saved Filters */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>
                Saved Filters ({savedFilters.length})
              </h3>
              <div className="flex items-center gap-2">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search saved filters..."
                  className="px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedFilters.map((filter) => {
                const Icon = getFilterIcon(filter.type)
                const color = getFilterColor(filter.type)
                
                return (
                  <div 
                    key={filter.id}
                    className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                    style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: color + "20" }}
                        >
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                          <h4 className="font-semibold" style={{ color: "var(--odoo-text)" }}>
                            {filter.name}
                          </h4>
                          <p className="text-sm capitalize" style={{ color: "var(--odoo-muted)" }}>
                            {filter.type} filter
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          title="Apply Filter"
                        >
                          <Eye size={14} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          title="Edit Filter"
                        >
                          <Edit size={14} style={{ color: "var(--odoo-muted)" }} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFilter(filter.id)}
                          className="p-1 rounded hover:bg-red-100"
                          title="Delete Filter"
                        >
                          <Trash2 size={14} style={{ color: "#dc3545" }} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm" style={{ color: "var(--odoo-text)" }}>
                        <span className="font-medium">{filter.resultCount}</span> records match
                      </p>
                    </div>

                    <div className="text-xs" style={{ color: "var(--odoo-muted)" }}>
                      <p>Created by {filter.createdBy}</p>
                      <p>on {new Date(filter.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                      <button 
                        className="w-full px-3 py-2 rounded text-sm font-medium"
                        style={{ backgroundColor: color + "10", color }}
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {savedFilters.length === 0 && (
              <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <Filter size={48} className="mx-auto mb-4" style={{ color: "var(--odoo-muted)" }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--odoo-text)" }}>No Saved Filters</h3>
                <p className="mb-4" style={{ color: "var(--odoo-muted)" }}>
                  Create your first custom filter to quickly find specific data
                </p>
                <button 
                  onClick={() => setShowCreateFilter(true)}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  Create Your First Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}