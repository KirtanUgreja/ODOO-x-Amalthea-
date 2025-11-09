"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { Package, Plus, Edit, Trash2, Eye, DollarSign, Filter, Search, Download, Tag, ToggleLeft, ToggleRight } from "lucide-react"

export default function FinanceProducts() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    active: true
  })

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const products = db.products || []

  // Filter products
  const filteredProducts = products.filter((product: any) => {
    const matchesFilter = filter === "all" || 
      (filter === "active" && product.active) ||
      (filter === "inactive" && !product.active)
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesSearch = searchTerm === "" ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesCategory && matchesSearch
  })

  // Get unique categories
  const categories = [...new Set(products.map((product: any) => product.category).filter(Boolean))]

  // Calculate metrics
  const activeProducts = products.filter((product: any) => product.active)
  const inactiveProducts = products.filter((product: any) => !product.active)
  const totalValue = products.reduce((sum: number, product: any) => sum + (product.price || 0), 0)

  return (
    <div className="flex">
      <FinanceSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6" style={{ backgroundColor: "var(--odoo-light-bg)" }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--odoo-text)" }}>
                  Products
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage product catalog and pricing
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setFormData({ name: "", description: "", price: "", category: "", active: true })
                    setSelectedProduct(null)
                    setShowCreateDialog(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Create Product
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--odoo-accent)" }}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Products</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{products.length}</p>
                </div>
                <Package size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active Products</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>{activeProducts.length}</p>
                </div>
                <ToggleRight size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Inactive Products</p>
                  <p className="text-2xl font-bold" style={{ color: "#6c757d" }}>{inactiveProducts.length}</p>
                </div>
                <ToggleLeft size={24} style={{ color: "#6c757d" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Value</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>₹{totalValue.toLocaleString()}</p>
                </div>
                <DollarSign size={24} style={{ color: "var(--odoo-accent)" }} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: "var(--odoo-muted)" }} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded border w-full"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                >
                  <option value="all">All Products</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded border w-full"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              >
                <option value="all">All Categories</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 lg:col-span-2">
                <Search size={16} style={{ color: "var(--odoo-muted)" }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border"
                  style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: any) => (
              <div key={product.id} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--odoo-primary)" + "20" }}>
                      <Package size={20} style={{ color: "var(--odoo-primary)" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>{product.name}</h3>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.active ? (
                      <ToggleRight size={20} style={{ color: "#28a745" }} title="Active" />
                    ) : (
                      <ToggleLeft size={20} style={{ color: "#6c757d" }} title="Inactive" />
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm" style={{ color: "var(--odoo-text)" }}>{product.description}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag size={16} style={{ color: "var(--odoo-muted)" }} />
                    <span className="text-lg font-bold" style={{ color: "var(--odoo-text)" }}>
                      ₹{product.price?.toLocaleString()}
                    </span>
                  </div>
                  <span 
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: product.active ? "#d4edda" : "#f8d7da",
                      color: product.active ? "#155724" : "#721c24"
                    }}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                  <div className="text-sm" style={{ color: "var(--odoo-muted)" }}>
                    Used in {(db.salesOrders || []).filter((so: any) => 
                      so.description?.toLowerCase().includes(product.name?.toLowerCase())
                    ).length} sales orders
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowViewDialog(true)
                      }}
                      className="p-1 rounded hover:bg-gray-100" 
                      title="View"
                    >
                      <Eye size={16} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button 
                      onClick={() => {
                        setFormData({
                          name: product.name || "",
                          description: product.description || "",
                          price: product.price?.toString() || "",
                          category: product.category || "",
                          active: product.active !== false
                        })
                        setSelectedProduct(product)
                        setShowCreateDialog(true)
                      }}
                      className="p-1 rounded hover:bg-gray-100" 
                      title="Edit"
                    >
                      <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this product?")) {
                          const updatedProducts = db.products.filter(p => p.id !== product.id)
                          await updateDb({ products: updatedProducts })
                        }
                      }}
                      className="p-1 rounded hover:bg-red-100" 
                      title="Delete"
                    >
                      <Trash2 size={16} style={{ color: "#dc3545" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} style={{ color: "var(--odoo-muted)" }} className="mx-auto mb-4" />
              <p style={{ color: "var(--odoo-muted)" }}>No products found matching your criteria.</p>
              <button 
                onClick={() => {
                  setFormData({ name: "", description: "", price: "", category: "", active: true })
                  setSelectedProduct(null)
                  setShowCreateDialog(true)
                }}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded text-white mx-auto" 
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <Plus size={16} />
                Create Product
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {selectedProduct ? "Edit Product" : "Create Product"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select category</option>
                    <option value="Design Services">Design Services</option>
                    <option value="Development Services">Development Services</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm font-medium">Active</label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowCreateDialog(false)
                    setSelectedProduct(null)
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!formData.name || !formData.description || !formData.price || !formData.category) return
                    
                    const newProduct = {
                      ...formData,
                      price: parseFloat(formData.price),
                      id: selectedProduct?.id || `prod-${Date.now()}`,
                      createdAt: selectedProduct?.createdAt || new Date().toISOString()
                    }
                    
                    const updatedProducts = selectedProduct 
                      ? db.products.map(p => p.id === selectedProduct.id ? newProduct : p)
                      : [...db.products, newProduct]
                    
                    await updateDb({ products: updatedProducts })
                    setShowCreateDialog(false)
                    setSelectedProduct(null)
                  }}
                  disabled={!formData.name || !formData.description || !formData.price || !formData.category}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {selectedProduct ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Dialog */}
        {showViewDialog && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{selectedProduct.name}</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Description:</span> {selectedProduct.description}
                </div>
                <div>
                  <span className="font-medium">Price:</span> ₹{selectedProduct.price?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {selectedProduct.category}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    selectedProduct.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Used in Sales Orders:</span> 
                  {(db.salesOrders || []).filter((so: any) => 
                    so.description?.toLowerCase().includes(selectedProduct.name?.toLowerCase())
                  ).length}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedProduct.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewDialog(false)
                    setSelectedProduct(null)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}