"use client"

import type { Guard, Resident, VisitorRequest, Admin } from "./supabase"

// Enhanced mock data for demo mode
const mockGuards: Guard[] = [
  {
    id: "g1",
    employee_id: "SEC001",
    name: "Ramesh Kumar",
    shift: "morning",
    phone_number: "+91-9876543210",
    password: "guard123",
    status: "on-duty",
    check_in_time: "8:20:07 AM",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "g2",
    employee_id: "SEC002",
    name: "Suresh Patel",
    shift: "evening",
    phone_number: "+91-9876543211",
    password: "guard123",
    status: "off-duty",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "g3",
    employee_id: "SEC003",
    name: "Mahesh Singh",
    shift: "night",
    phone_number: "+91-9876543232",
    password: "guard123",
    status: "off-duty",
    created_at: "2024-01-01T00:00:00Z",
  },
]

const mockResidents: Resident[] = [
  {
    flat_number: "A-101",
    name: "John Smith",
    phone_number: "+91 9876543210",
    password: "resident123",
    created_at: "2024-01-01T00:00:00Z",
    family_members: [
      {
        id: "fm1",
        flat_number: "A-101",
        name: "Jane Smith",
        phone_number: "+91 9876543220",
        relation: "Spouse",
        age: 28,
      },
    ],
    temporary_guests: [],
  },
  {
    flat_number: "B-203",
    name: "Sarah Johnson",
    phone_number: "+91 9876543211",
    password: "resident123",
    created_at: "2024-01-01T00:00:00Z",
    family_members: [],
    temporary_guests: [],
  },
  {
    flat_number: "C-105",
    name: "Mike Wilson",
    phone_number: "+91 9876543212",
    password: "resident123",
    created_at: "2024-01-01T00:00:00Z",
    family_members: [],
    temporary_guests: [],
  },
]

const mockVisitorRequests: VisitorRequest[] = [
  {
    id: "v1",
    visitor_name: "David Wilson",
    phone_number: "+1-555-0125",
    purpose_of_visit: "Package Delivery",
    flat_number: "A-101",
    resident_name: "John Smith",
    status: "pending",
    checked_by: "Ramesh Kumar (SEC001)",
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "v2",
    visitor_name: "Lisa Chen",
    phone_number: "+1-555-0126",
    purpose_of_visit: "Personal Visit",
    flat_number: "A-101",
    resident_name: "John Smith",
    status: "pending",
    checked_by: "Ramesh Kumar (SEC001)",
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "v3",
    visitor_name: "Robert Johnson",
    phone_number: "+1-555-0123",
    purpose_of_visit: "Business Meeting",
    flat_number: "B-203",
    resident_name: "Sarah Johnson",
    status: "approved",
    checked_by: "Ramesh Kumar (SEC001)",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "v4",
    visitor_name: "Maria Garcia",
    phone_number: "+1-555-0124",
    purpose_of_visit: "Package Delivery",
    flat_number: "C-105",
    resident_name: "Mike Wilson",
    status: "rejected",
    checked_by: "Ramesh Kumar (SEC001)",
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
]

const mockAdmins: Admin[] = [
  {
    id: "a1",
    admin_id: "admin001",
    name: "System Administrator",
    password: "admin123",
    created_at: "2024-01-01T00:00:00Z",
  },
]

class DatabaseService {
  private static instance: DatabaseService
  private listeners: { [key: string]: Function[] } = {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  constructor() {
    console.log("🎭 Database Service: Initialized in demo mode")
  }

  // Guard authentication
  async authenticateGuard(employeeId: string, password: string): Promise<Guard | null> {
    console.log("🔐 Authenticating guard:", employeeId)
    const guard = mockGuards.find((g) => g.employee_id === employeeId && g.password === password)
    if (guard) {
      console.log("✅ Authentication successful for:", guard.name)
    } else {
      console.log("❌ Authentication failed - invalid credentials")
    }
    return guard || null
  }

  // Resident authentication
  async authenticateResident(flatNumber: string, password: string): Promise<Resident | null> {
    console.log("🔐 Authenticating resident:", flatNumber)
    const resident = mockResidents.find((r) => r.flat_number === flatNumber && r.password === password)
    return resident || null
  }

  // Admin authentication
  async authenticateAdmin(adminId: string, password: string): Promise<Admin | null> {
    console.log("🔐 Authenticating admin:", adminId)
    const admin = mockAdmins.find((a) => a.admin_id === adminId && a.password === password)
    return admin || null
  }

  // Get all visitor requests
  async getAllVisitorRequests(): Promise<VisitorRequest[]> {
    console.log("📋 Fetching visitor requests")
    return [...mockVisitorRequests]
  }

  // Get visitor requests for specific flat
  async getVisitorRequestsForFlat(flatNumber: string): Promise<VisitorRequest[]> {
    console.log("📋 Fetching visitor requests for flat:", flatNumber)
    return mockVisitorRequests.filter((r) => r.flat_number === flatNumber)
  }

  // Get all residents
  async getAllResidents(): Promise<Resident[]> {
    console.log("👥 Fetching all residents")
    return [...mockResidents]
  }

  // Get specific resident
  async getResident(flatNumber: string): Promise<Resident | null> {
    console.log("👤 Fetching resident for flat:", flatNumber)
    return mockResidents.find((r) => r.flat_number === flatNumber) || null
  }

  // Get all guards
  async getAllGuards(): Promise<Guard[]> {
    console.log("🛡️ Fetching all guards")
    return [...mockGuards]
  }

  // Add visitor request
  async addVisitorRequest(request: Omit<VisitorRequest, "id" | "created_at">): Promise<VisitorRequest | null> {
    console.log("➕ Creating visitor request")
    const newRequest: VisitorRequest = {
      ...request,
      id: `v${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    mockVisitorRequests.unshift(newRequest)
    this.emit("visitorRequestAdded", newRequest)
    this.emit("dataUpdated")
    return newRequest
  }

  // Update visitor request status
  async updateVisitorRequestStatus(id: string, status: VisitorRequest["status"]): Promise<boolean> {
    console.log("📝 Updating visitor request status:", id, status)
    const request = mockVisitorRequests.find((r) => r.id === id)
    if (request) {
      request.status = status
      request.updated_at = new Date().toISOString()
      this.emit("visitorRequestUpdated", request)
      this.emit("dataUpdated")
      return true
    }
    return false
  }

  // Update guard status
  async updateGuardStatus(employeeId: string, status: "on-duty" | "off-duty", checkInTime?: string): Promise<boolean> {
    console.log("🛡️ Updating guard status:", employeeId, status)
    const guard = mockGuards.find((g) => g.employee_id === employeeId)
    if (guard) {
      guard.status = status
      if (checkInTime) guard.check_in_time = checkInTime
      this.emit("guardStatusUpdated", guard)
      this.emit("dataUpdated")
      return true
    }
    return false
  }

  // Add resident
  async addResident(resident: Omit<Resident, "created_at" | "updated_at">): Promise<boolean> {
    console.log("👤 Adding resident:", resident.flat_number)
    if (mockResidents.find((r) => r.flat_number === resident.flat_number)) {
      return false // Flat already exists
    }
    mockResidents.push(resident as Resident)
    this.emit("dataUpdated")
    return true
  }

  // Add guard
  async addGuard(guard: Omit<Guard, "id" | "created_at" | "updated_at">): Promise<boolean> {
    console.log("🛡️ Adding guard:", guard.employee_id)
    if (mockGuards.find((g) => g.employee_id === guard.employee_id)) {
      return false // Employee ID already exists
    }
    mockGuards.push({ ...guard, id: Date.now().toString() } as Guard)
    this.emit("dataUpdated")
    return true
  }

  // Get statistics
  async getStatistics() {
    console.log("📊 Getting statistics")
    const totalRequests = mockVisitorRequests.length
    const pendingRequests = mockVisitorRequests.filter((r) => r.status === "pending").length
    const approvedRequests = mockVisitorRequests.filter((r) => r.status === "approved").length
    const rejectedRequests = mockVisitorRequests.filter((r) => r.status === "rejected").length
    const leftAtGateRequests = mockVisitorRequests.filter((r) => r.status === "left-at-gate").length
    const activeGuards = mockGuards.filter((g) => g.status === "on-duty").length
    const totalGuards = mockGuards.length
    const activeResidents = mockResidents.length
    const todayRequests = mockVisitorRequests.filter((r) => {
      const today = new Date().toDateString()
      const requestDate = new Date(r.created_at).toDateString()
      return today === requestDate
    }).length

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      leftAtGateRequests,
      activeGuards,
      totalGuards,
      activeResidents,
      todayRequests,
      uptime: "99.8%",
    }
  }

  // Export to CSV
  async exportToCSV(dataType: "visitors" | "residents" | "guards" | "all"): Promise<string> {
    console.log("📄 Exporting to CSV:", dataType)
    let csvContent = ""

    if (dataType === "visitors" || dataType === "all") {
      csvContent += "VISITOR REQUESTS\n"
      csvContent += "ID,Visitor Name,Phone,Purpose,Flat Number,Resident Name,Status,Timestamp,Checked By\n"
      mockVisitorRequests.forEach((request) => {
        csvContent += `${request.id},"${request.visitor_name}","${request.phone_number}","${request.purpose_of_visit}","${request.flat_number}","${request.resident_name || ""}","${request.status}","${new Date(request.created_at).toLocaleString()}","${request.checked_by}"\n`
      })
      csvContent += "\n"
    }

    if (dataType === "residents" || dataType === "all") {
      csvContent += "RESIDENTS\n"
      csvContent += "Flat Number,Name,Phone Number,Family Members Count,Temporary Guests Count\n"
      mockResidents.forEach((resident) => {
        csvContent += `"${resident.flat_number}","${resident.name}","${resident.phone_number}",${resident.family_members?.length || 0},${resident.temporary_guests?.length || 0}\n`
      })
      csvContent += "\n"
    }

    if (dataType === "guards" || dataType === "all") {
      csvContent += "SECURITY GUARDS\n"
      csvContent += "Employee ID,Name,Shift,Phone Number,Status,Check-in Time\n"
      mockGuards.forEach((guard) => {
        csvContent += `"${guard.employee_id}","${guard.name}","${guard.shift}","${guard.phone_number}","${guard.status}","${guard.check_in_time || "N/A"}"\n`
      })
      csvContent += "\n"
    }

    return csvContent
  }

  // Event system for real-time updates
  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data))
    }
  }

  // Always return false for demo mode
  isSupabaseAvailable(): boolean {
    return false
  }
}

export const database = DatabaseService.getInstance()
