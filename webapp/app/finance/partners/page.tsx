"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDb } from "@/hooks/use-db"
import { FinanceSidebar } from "@/components/finance/finance-sidebar"
import { Header } from "@/components/layout/header"
import { Users, Plus, Edit, Trash2, Eye, Mail, Phone, MapPin, Filter, Search, Download, Building, User } from "lucide-react"

export default function FinancePartners() {
  const { user } = useAuth()
  const router = useRouter()
  const { db, loading, updateDb } = useDb()
  const [activeTab, setActiveTab] = useState("customers")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "Net 30",
    services: ""
  })

  useEffect(() => {
    if (!loading && user?.role !== "sales_finance" && user?.role !== "admin") {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !db) {
    return <div>Loading...</div>
  }

  const customers = db.customers || []
  const vendors = db.vendors || []

  const filteredCustomers = customers.filter((customer: any) =>
    searchTerm === "" ||
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredVendors = vendors.filter((vendor: any) =>
    searchTerm === "" ||
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  Customers & Vendors
                </h1>
                <p style={{ color: "var(--odoo-muted)" }}>
                  Manage customer and vendor information and relationships
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setFormData({ name: "", email: "", phone: "", address: "", paymentTerms: "Net 30", services: "" })
                    setShowAddDialog(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded text-white" 
                  style={{ backgroundColor: "var(--odoo-primary)" }}
                >
                  <Plus size={16} />
                  Add {activeTab === "customers" ? "Customer" : "Vendor"}
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
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Customers</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{customers.length}</p>
                </div>
                <User size={24} style={{ color: "var(--odoo-primary)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Total Vendors</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--odoo-text)" }}>{vendors.length}</p>
                </div>
                <Building size={24} style={{ color: "var(--odoo-accent)" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active Sales Orders</p>
                  <p className="text-2xl font-bold" style={{ color: "#28a745" }}>
                    {(db.salesOrders || []).filter((so: any) => so.status === "confirmed").length}
                  </p>
                </div>
                <Users size={24} style={{ color: "#28a745" }} />
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Active Purchase Orders</p>
                  <p className="text-2xl font-bold" style={{ color: "#17a2b8" }}>
                    {(db.purchaseOrders || []).filter((po: any) => po.status === "approved").length}
                  </p>
                </div>
                <Building size={24} style={{ color: "#17a2b8" }} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b" style={{ borderColor: "var(--odoo-border)" }}>
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "customers"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                  style={{
                    color: activeTab === "customers" ? "var(--odoo-primary)" : "var(--odoo-muted)",
                    borderBottomColor: activeTab === "customers" ? "var(--odoo-primary)" : "transparent"
                  }}
                >
                  <User size={16} />
                  Customers
                  <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ 
                    backgroundColor: "var(--odoo-light-bg)", 
                    color: "var(--odoo-text)" 
                  }}>
                    {customers.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("vendors")}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "vendors"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                  style={{
                    color: activeTab === "vendors" ? "var(--odoo-primary)" : "var(--odoo-muted)",
                    borderBottomColor: activeTab === "vendors" ? "var(--odoo-primary)" : "transparent"
                  }}
                >
                  <Building size={16} />
                  Vendors
                  <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ 
                    backgroundColor: "var(--odoo-light-bg)", 
                    color: "var(--odoo-text)" 
                  }}>
                    {vendors.length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
            <div className="flex items-center gap-2">
              <Search size={16} style={{ color: "var(--odoo-muted)" }} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 rounded border"
                style={{ borderColor: "var(--odoo-border)", backgroundColor: "var(--odoo-light-bg)" }}
              />
            </div>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "customers" && filteredCustomers.map((customer: any) => (
              <div key={customer.id} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--odoo-primary)" + "20" }}>
                      <User size={20} style={{ color: "var(--odoo-primary)" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>{customer.name}</h3>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Customer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPartner(customer)
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
                          name: customer.name || "",
                          email: customer.email || "",
                          phone: customer.phone || "",
                          address: customer.address || "",
                          paymentTerms: customer.paymentTerms || "Net 30",
                          services: ""
                        })
                        setSelectedPartner(customer)
                        setShowAddDialog(true)
                      }}
                      className="p-1 rounded hover:bg-gray-100" 
                      title="Edit"
                    >
                      <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this customer?")) {
                          const updatedCustomers = db.customers.filter(c => c.id !== customer.id)
                          await updateDb({ customers: updatedCustomers })
                        }
                      }}
                      className="p-1 rounded hover:bg-red-100" 
                      title="Delete"
                    >
                      <Trash2 size={16} style={{ color: "#dc3545" }} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} style={{ color: "var(--odoo-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: "var(--odoo-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} style={{ color: "var(--odoo-muted)" }} className="mt-0.5" />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--odoo-muted)" }}>Payment Terms:</span>
                    <span style={{ color: "var(--odoo-text)" }}>{customer.paymentTerms || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span style={{ color: "var(--odoo-muted)" }}>Sales Orders:</span>
                    <span style={{ color: "var(--odoo-text)" }}>
                      {(db.salesOrders || []).filter((so: any) => so.customerName === customer.name).length}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === "vendors" && filteredVendors.map((vendor: any) => (
              <div key={vendor.id} className="p-6 rounded-lg border" style={{ backgroundColor: "var(--odoo-card)", borderColor: "var(--odoo-border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--odoo-accent)" + "20" }}>
                      <Building size={20} style={{ color: "var(--odoo-accent)" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--odoo-text)" }}>{vendor.name}</h3>
                      <p className="text-sm" style={{ color: "var(--odoo-muted)" }}>Vendor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPartner(vendor)
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
                          name: vendor.name || "",
                          email: vendor.email || "",
                          phone: vendor.phone || "",
                          address: vendor.address || "",
                          paymentTerms: vendor.paymentTerms || "Net 30",
                          services: vendor.services || ""
                        })
                        setSelectedPartner(vendor)
                        setShowAddDialog(true)
                      }}
                      className="p-1 rounded hover:bg-gray-100" 
                      title="Edit"
                    >
                      <Edit size={16} style={{ color: "var(--odoo-muted)" }} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this vendor?")) {
                          const updatedVendors = db.vendors.filter(v => v.id !== vendor.id)
                          await updateDb({ vendors: updatedVendors })
                        }
                      }}
                      className="p-1 rounded hover:bg-red-100" 
                      title="Delete"
                    >
                      <Trash2 size={16} style={{ color: "#dc3545" }} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} style={{ color: "var(--odoo-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: "var(--odoo-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} style={{ color: "var(--odoo-muted)" }} className="mt-0.5" />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{vendor.address}</span>
                    </div>
                  )}
                  {vendor.services && (
                    <div className="flex items-start gap-2">
                      <Building size={14} style={{ color: "var(--odoo-muted)" }} className="mt-0.5" />
                      <span className="text-sm" style={{ color: "var(--odoo-text)" }}>{vendor.services}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--odoo-border)" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--odoo-muted)" }}>Payment Terms:</span>
                    <span style={{ color: "var(--odoo-text)" }}>{vendor.paymentTerms || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span style={{ color: "var(--odoo-muted)" }}>Purchase Orders:</span>
                    <span style={{ color: "var(--odoo-text)" }}>
                      {(db.purchaseOrders || []).filter((po: any) => po.vendor === vendor.name).length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {((activeTab === "customers" && filteredCustomers.length === 0) || 
            (activeTab === "vendors" && filteredVendors.length === 0)) && (
            <div className="text-center py-12">
              <p style={{ color: "var(--odoo-muted)" }}>No {activeTab} found matching your search.</p>
              <button 
                onClick={() => {
                  setFormData({ name: "", email: "", phone: "", address: "", paymentTerms: "Net 30", services: "" })
                  setShowAddDialog(true)
                }}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded text-white mx-auto" 
                style={{ backgroundColor: "var(--odoo-primary)" }}
              >
                <Plus size={16} />
                Add {activeTab === "customers" ? "Customer" : "Vendor"}
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        {showAddDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {selectedPartner ? `Edit ${activeTab === "customers" ? "Customer" : "Vendor"}` : `Add ${activeTab === "customers" ? "Customer" : "Vendor"}`}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter address"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
                {activeTab === "vendors" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Services</label>
                    <input
                      type="text"
                      value={formData.services}
                      onChange={(e) => setFormData({...formData, services: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter services offered"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddDialog(false)
                    setSelectedPartner(null)
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!formData.name) return
                    
                    const newData = {
                      ...formData,
                      id: selectedPartner?.id || `${activeTab === "customers" ? "cust" : "vend"}-${Date.now()}`,
                      createdAt: selectedPartner?.createdAt || new Date().toISOString()
                    }
                    
                    if (activeTab === "customers") {
                      const updatedCustomers = selectedPartner 
                        ? db.customers.map(c => c.id === selectedPartner.id ? newData : c)
                        : [...db.customers, newData]
                      await updateDb({ customers: updatedCustomers })
                    } else {
                      const updatedVendors = selectedPartner
                        ? db.vendors.map(v => v.id === selectedPartner.id ? newData : v)
                        : [...db.vendors, newData]
                      await updateDb({ vendors: updatedVendors })
                    }
                    
                    setShowAddDialog(false)
                    setSelectedPartner(null)
                  }}
                  disabled={!formData.name}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {selectedPartner ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Dialog */}
        {showViewDialog && selectedPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{selectedPartner.name}</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Type:</span> {activeTab === "customers" ? "Customer" : "Vendor"}
                </div>
                {selectedPartner.email && (
                  <div>
                    <span className="font-medium">Email:</span> {selectedPartner.email}
                  </div>
                )}
                {selectedPartner.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {selectedPartner.phone}
                  </div>
                )}
                {selectedPartner.address && (
                  <div>
                    <span className="font-medium">Address:</span> {selectedPartner.address}
                  </div>
                )}
                <div>
                  <span className="font-medium">Payment Terms:</span> {selectedPartner.paymentTerms || "N/A"}
                </div>
                {selectedPartner.services && (
                  <div>
                    <span className="font-medium">Services:</span> {selectedPartner.services}
                  </div>
                )}
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedPartner.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewDialog(false)
                    setSelectedPartner(null)
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