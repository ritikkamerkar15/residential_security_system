"use client"

import { supabase, isSupabaseAvailable, type Resident, type VisitorRequest, type Guard, type Admin } from "./supabase"

// Mock data for fallback
const mockResidents: Resident[] = [
  {
    flat_number: "A-101",
    name: "John Smith",
    phone_number: "+91 9876543210",
    password: "resident123",
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
    family_members: [],
    temporary_guests: [],
  },
  {
    flat_number: "C-105",
    name: "Mike Wilson",
    phone_number: "+91 9876543212",
    password: "resident123",
    family_members: [],
    temporary_guests: [],
  },
]

const mockGuards: Guard[] = [
  {
    id: "g1",
    employee_id: "SEC001",
    name: "Ramesh Kumar",
    shift: "morning",
    phone_number: "+91 9876543230",
    password: "guard123",
    status: "on-duty",
    check_in_time: "8:20:07 AM",
  },
  {
    id: "g2",
    employee_id: "SEC002",
    name: "Suresh Patel",
    shift: "evening",
    phone_number: "+91 9876543231",
    password: "guard123",
    status: "off-duty",
  },
  {
    id: "g3",
    employee_id: "SEC003",
    name: "Mahesh Singh",
    shift: "night",
    phone_number: "+91 9876543232",
    password: "guard123",
    status: "off-duty",
  },
]

const mockAdmins: Admin[] = [
  {
    id: "a1",
    admin_id: "admin001",
    name: "System Administrator",
    password: "admin123",
  },
]

const mockVisitorRequests: VisitorRequest[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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

export class DatabaseService {
  private static instance: DatabaseService
  private listeners: { [key: string]: Function[] } = {}

  // Mock data storage
  private mockResidentsData: Resident[] = [...mockResidents]
  private mockGuardsData: Guard[] = [...mockGuards]
  private mockAdminsData: Admin[] = [...mockAdmins]
  private mockVisitorRequestsData: VisitorRequest[] = [...mockVisitorRequests]

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Resident operations
  async getResident(flatNumber: string): Promise<Resident | null> {
    if (!isSupabaseAvailable()) {
      // Use mock data
      const resident = this.mockResidentsData.find((r) => r.flat_number === flatNumber)
      return resident || null
    }

    try {
      const { data, error } = await supabase!
        .from("residents")
        .select(`
          *,
          family_members(*),
          temporary_guests(*)
        `)
        .eq("flat_number", flatNumber)
        .single()

      if (error) {
        console.error("Error fetching resident:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getResident:", error)
      return null
    }
  }

  async getAllResidents(): Promise<Resident[]> {
    if (!isSupabaseAvailable()) {
      return [...this.mockResidentsData]
    }

    try {
      const { data, error } = await supabase!
        .from("residents")
        .select(`
          *,
          family_members(*),
          temporary_guests(*)
        `)
        .order("flat_number")

      if (error) {
        console.error("Error fetching residents:", error)
        return []
      }

      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error in getAllResidents:", error)
      return []
    }
  }

  async addResident(resident: Omit<Resident, "created_at" | "updated_at">): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      // Check if flat number already exists
      if (this.mockResidentsData.find((r) => r.flat_number === resident.flat_number)) {
        return false
      }
      this.mockResidentsData.push(resident as Resident)
      this.emit("dataUpdated")
      return true
    }

    try {
      const { error } = await supabase!.from("residents").insert([
        {
          flat_number: resident.flat_number,
          name: resident.name,
          phone_number: resident.phone_number,
          password: resident.password,
        },
      ])

      if (error) {
        console.error("Error adding resident:", error)
        return false
      }

      this.emit("dataUpdated")
      return true
    } catch (error) {
      console.error("Error in addResident:", error)
      return false
    }
  }

  async updateResident(flatNumber: string, updates: Partial<Resident>): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const index = this.mockResidentsData.findIndex((r) => r.flat_number === flatNumber)
      if (index === -1) return false
      this.mockResidentsData[index] = { ...this.mockResidentsData[index], ...updates }
      this.emit("dataUpdated")
      return true
    }

    try {
      const { error } = await supabase!
        .from("residents")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("flat_number", flatNumber)

      if (error) {
        console.error("Error updating resident:", error)
        return false
      }

      this.emit("dataUpdated")
      return true
    } catch (error) {
      console.error("Error in updateResident:", error)
      return false
    }
  }

  // Guard operations
  async getGuard(employeeId: string): Promise<Guard | null> {
    if (!isSupabaseAvailable()) {
      const guard = this.mockGuardsData.find((g) => g.employee_id === employeeId)
      return guard || null
    }

    try {
      const { data, error } = await supabase!.from("guards").select("*").eq("employee_id", employeeId).single()

      if (error) {
        console.error("Error fetching guard:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getGuard:", error)
      return null
    }
  }

  async getAllGuards(): Promise<Guard[]> {
    if (!isSupabaseAvailable()) {
      return [...this.mockGuardsData] // Return a copy of the array
    }

    try {
      const { data, error } = await supabase!.from("guards").select("*").order("name")

      if (error) {
        console.error("Error fetching guards:", error)
        return []
      }

      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error in getAllGuards:", error)
      return []
    }
  }

  async addGuard(guard: Omit<Guard, "id" | "created_at" | "updated_at">): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      // Check if employee ID already exists
      if (this.mockGuardsData.find((g) => g.employee_id === guard.employee_id)) {
        return false
      }
      this.mockGuardsData.push({ ...guard, id: Date.now().toString() } as Guard)
      this.emit("dataUpdated")
      return true
    }

    try {
      const { error } = await supabase!.from("guards").insert([guard])

      if (error) {
        console.error("Error adding guard:", error)
        return false
      }

      this.emit("dataUpdated")
      return true
    } catch (error) {
      console.error("Error in addGuard:", error)
      return false
    }
  }

  async updateGuardStatus(employeeId: string, status: "on-duty" | "off-duty", checkInTime?: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const guard = this.mockGuardsData.find((g) => g.employee_id === employeeId)
      if (!guard) return false
      guard.status = status
      if (checkInTime) guard.check_in_time = checkInTime
      this.emit("guardStatusUpdated", guard)
      this.emit("dataUpdated")
      return true
    }

    try {
      const { error } = await supabase!
        .from("guards")
        .update({
          status,
          check_in_time: checkInTime,
          updated_at: new Date().toISOString(),
        })
        .eq("employee_id", employeeId)

      if (error) {
        console.error("Error updating guard status:", error)
        return false
      }

      this.emit("guardStatusUpdated")
      this.emit("dataUpdated")
      return true
    } catch (error) {
      console.error("Error in updateGuardStatus:", error)
      return false
    }
  }

  // Admin operations
  async getAdmin(adminId: string): Promise<Admin | null> {
    if (!isSupabaseAvailable()) {
      const admin = this.mockAdminsData.find((a) => a.admin_id === adminId)
      return admin || null
    }

    try {
      const { data, error } = await supabase!.from("admins").select("*").eq("admin_id", adminId).single()

      if (error) {
        console.error("Error fetching admin:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getAdmin:", error)
      return null
    }
  }

  // Visitor request operations
  async addVisitorRequest(
    request: Omit<VisitorRequest, "id" | "created_at" | "updated_at">,
  ): Promise<VisitorRequest | null> {
    if (!isSupabaseAvailable()) {
      const newRequest: VisitorRequest = {
        ...request,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      this.mockVisitorRequestsData.unshift(newRequest)
      this.emit("visitorRequestAdded", newRequest)
      this.emit("dataUpdated")
      return newRequest
    }

    try {
      const { data, error } = await supabase!.from("visitor_requests").insert([request]).select().single()

      if (error) {
        console.error("Error adding visitor request:", error)
        return null
      }

      this.emit("visitorRequestAdded", data)
      this.emit("dataUpdated")
      return data
    } catch (error) {
      console.error("Error in addVisitorRequest:", error)
      return null
    }
  }

  async getVisitorRequestsForFlat(flatNumber: string): Promise<VisitorRequest[]> {
    if (!isSupabaseAvailable()) {
      return this.mockVisitorRequestsData.filter((r) => r.flat_number === flatNumber)
    }

    try {
      const { data, error } = await supabase!
        .from("visitor_requests")
        .select("*")
        .eq("flat_number", flatNumber)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching visitor requests for flat:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getVisitorRequestsForFlat:", error)
      return []
    }
  }

  async getAllVisitorRequests(): Promise<VisitorRequest[]> {
    if (!isSupabaseAvailable()) {
      return [...this.mockVisitorRequestsData]
    }

    try {
      const { data, error } = await supabase!
        .from("visitor_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching all visitor requests:", error)
        return []
      }

      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error in getAllVisitorRequests:", error)
      return []
    }
  }

  async updateVisitorRequestStatus(requestId: string, status: VisitorRequest["status"]): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const request = this.mockVisitorRequestsData.find((r) => r.id === requestId)
      if (!request) return false
      request.status = status
      this.emit("visitorRequestUpdated", request)
      this.emit("dataUpdated")
      return true
    }

    try {
      const { error } = await supabase!
        .from("visitor_requests")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) {
        console.error("Error updating visitor request status:", error)
        return false
      }

      this.emit("visitorRequestUpdated")
      this.emit("dataUpdated")
      return true
    } catch (error) {
      console.error("Error in updateVisitorRequestStatus:", error)
      return false
    }
  }

  // Authentication
  async authenticateResident(flatNumber: string, password: string): Promise<Resident | null> {
    if (!isSupabaseAvailable()) {
      const resident = this.mockResidentsData.find((r) => r.flat_number === flatNumber && r.password === password)
      return resident || null
    }

    try {
      const { data, error } = await supabase!
        .from("residents")
        .select(`
          *,
          family_members(*),
          temporary_guests(*)
        `)
        .eq("flat_number", flatNumber)
        .eq("password", password)
        .single()

      if (error) {
        console.error("Error authenticating resident:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in authenticateResident:", error)
      return null
    }
  }

  async authenticateGuard(employeeId: string, password: string): Promise<Guard | null> {
    if (!isSupabaseAvailable()) {
      const guard = this.mockGuardsData.find((g) => g.employee_id === employeeId && g.password === password)
      return guard || null
    }

    try {
      const { data, error } = await supabase!
        .from("guards")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("password", password)
        .single()

      if (error) {
        console.error("Error authenticating guard:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in authenticateGuard:", error)
      return null
    }
  }

  async authenticateAdmin(adminId: string, password: string): Promise<Admin | null> {
    if (!isSupabaseAvailable()) {
      const admin = this.mockAdminsData.find((a) => a.admin_id === adminId && a.password === password)
      return admin || null
    }

    try {
      const { data, error } = await supabase!
        .from("admins")
        .select("*")
        .eq("admin_id", adminId)
        .eq("password", password)
        .single()

      if (error) {
        console.error("Error authenticating admin:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in authenticateAdmin:", error)
      return null
    }
  }

  // Statistics and analytics
  async getStatistics() {
    if (!isSupabaseAvailable()) {
      const totalRequests = this.mockVisitorRequestsData.length
      const pendingRequests = this.mockVisitorRequestsData.filter((r) => r.status === "pending").length
      const approvedRequests = this.mockVisitorRequestsData.filter((r) => r.status === "approved").length
      const rejectedRequests = this.mockVisitorRequestsData.filter((r) => r.status === "rejected").length
      const leftAtGateRequests = this.mockVisitorRequestsData.filter((r) => r.status === "left-at-gate").length
      const activeGuards = this.mockGuardsData.filter((g) => g.status === "on-duty").length
      const totalGuards = this.mockGuardsData.length
      const activeResidents = this.mockResidentsData.length
      const todayRequests = this.mockVisitorRequestsData.filter((r) => {
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

    try {
      const [
        { count: totalRequests },
        { count: pendingRequests },
        { count: approvedRequests },
        { count: rejectedRequests },
        { count: leftAtGateRequests },
        { count: totalGuards },
        { count: activeGuards },
        { count: activeResidents },
      ] = await Promise.all([
        supabase!.from("visitor_requests").select("*", { count: "exact", head: true }),
        supabase!.from("visitor_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase!.from("visitor_requests").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase!.from("visitor_requests").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase!.from("visitor_requests").select("*", { count: "exact", head: true }).eq("status", "left-at-gate"),
        supabase!.from("guards").select("*", { count: "exact", head: true }),
        supabase!.from("guards").select("*", { count: "exact", head: true }).eq("status", "on-duty"),
        supabase!.from("residents").select("*", { count: "exact", head: true }),
      ])

      // Get today's requests
      const today = new Date().toISOString().split("T")[0]
      const { count: todayRequests } = await supabase!
        .from("visitor_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`)

      return {
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        approvedRequests: approvedRequests || 0,
        rejectedRequests: rejectedRequests || 0,
        leftAtGateRequests: leftAtGateRequests || 0,
        activeGuards: activeGuards || 0,
        totalGuards: totalGuards || 0,
        activeResidents: activeResidents || 0,
        todayRequests: todayRequests || 0,
        uptime: "99.8%",
      }
    } catch (error) {
      console.error("Error getting statistics:", error)
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        leftAtGateRequests: 0,
        activeGuards: 0,
        totalGuards: 0,
        activeResidents: 0,
        todayRequests: 0,
        uptime: "99.8%",
      }
    }
  }

  // Export data as CSV
  async exportToCSV(dataType: "visitors" | "residents" | "guards" | "all"): Promise<string> {
    let csvContent = ""

    try {
      if (dataType === "visitors" || dataType === "all") {
        const visitorRequests = await this.getAllVisitorRequests()
        csvContent += "VISITOR REQUESTS\n"
        csvContent += "ID,Visitor Name,Phone,Purpose,Flat Number,Resident Name,Status,Timestamp,Checked By\n"

        visitorRequests.forEach((request) => {
          csvContent += `${request.id},"${request.visitor_name}","${request.phone_number}","${request.purpose_of_visit}","${request.flat_number}","${request.resident_name || ""}","${request.status}","${new Date(request.created_at).toLocaleString()}","${request.checked_by}"\n`
        })
        csvContent += "\n"
      }

      if (dataType === "residents" || dataType === "all") {
        const residents = await this.getAllResidents()
        csvContent += "RESIDENTS\n"
        csvContent += "Flat Number,Name,Phone Number,Family Members Count,Temporary Guests Count\n"

        residents.forEach((resident) => {
          csvContent += `"${resident.flat_number}","${resident.name}","${resident.phone_number}",${resident.family_members?.length || 0},${resident.temporary_guests?.length || 0}\n`
        })
        csvContent += "\n"
      }

      if (dataType === "guards" || dataType === "all") {
        const guards = await this.getAllGuards()
        csvContent += "SECURITY GUARDS\n"
        csvContent += "Employee ID,Name,Shift,Phone Number,Status,Check-in Time\n"

        guards.forEach((guard) => {
          csvContent += `"${guard.employee_id}","${guard.name}","${guard.shift}","${guard.phone_number}","${guard.status}","${guard.check_in_time || "N/A"}"\n`
        })
        csvContent += "\n"
      }

      return csvContent
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      return ""
    }
  }

  // Real-time updates - simulate event listeners
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
}

export const database = DatabaseService.getInstance()
