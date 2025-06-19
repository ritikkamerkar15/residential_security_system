"use client"

export interface VisitorRequest {
  id: string
  visitorName: string
  phoneNumber: string
  purposeOfVisit: string
  flatNumber: string
  residentName?: string
  visitorPhoto?: string
  idProof?: string
  timestamp: string
  status: "pending" | "approved" | "rejected" | "left-at-gate"
  checkedBy?: string
}

export interface Guard {
  id: string
  name: string
  shift: "morning" | "evening" | "night"
  phoneNumber: string
  status: "on-duty" | "off-duty"
  checkInTime?: string
}

export interface Resident {
  id: string
  name: string
  flatNumber: string
  phoneNumber: string
  familyMembers: FamilyMember[]
  temporaryGuests: TemporaryGuest[]
}

export interface FamilyMember {
  id: string
  name: string
  phoneNumber: string
  relation: string
}

export interface TemporaryGuest {
  id: string
  name: string
  phoneNumber: string
  checkIn: string
  checkOut: string
}

export interface SystemLog {
  id: string
  time: string
  type: "approval" | "rejection" | "system" | "guard"
  description: string
  user: string
  details: string
}

export interface CameraFeed {
  id: string
  name: string
  location: string
  status: "online" | "offline"
}

// Mock Data
export const mockVisitorRequests: VisitorRequest[] = [
  {
    id: "1",
    visitorName: "David Wilson",
    phoneNumber: "+1-555-0125",
    purposeOfVisit: "Package Delivery",
    flatNumber: "A-304",
    residentName: "John Smith",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    status: "pending",
    checkedBy: "Guard Station 1",
  },
  {
    id: "2",
    visitorName: "Lisa Chen",
    phoneNumber: "+1-555-0126",
    purposeOfVisit: "Personal Visit",
    flatNumber: "A-304",
    residentName: "John Smith",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: "pending",
    checkedBy: "Guard Station 2",
  },
  {
    id: "3",
    visitorName: "John Smith",
    phoneNumber: "+1-555-0123",
    purposeOfVisit: "Business Meeting",
    flatNumber: "A-304",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "approved",
    checkedBy: "Guard Station 1",
  },
  {
    id: "4",
    visitorName: "Maria Garcia",
    phoneNumber: "+1-555-0124",
    purposeOfVisit: "Package Delivery",
    flatNumber: "B-205",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: "rejected",
    checkedBy: "Guard Station 1",
  },
]

export const mockGuards: Guard[] = [
  {
    id: "1",
    name: "Ramesh Kumar",
    shift: "morning",
    phoneNumber: "+91 9876543230",
    status: "on-duty",
    checkInTime: "8:20:07 PM",
  },
  {
    id: "2",
    name: "Suresh Patel",
    shift: "evening",
    phoneNumber: "+91 9876543231",
    status: "off-duty",
  },
  {
    id: "3",
    name: "Mahesh Singh",
    shift: "night",
    phoneNumber: "+91 9876543232",
    status: "off-duty",
  },
]

export const mockResidents: Resident[] = [
  {
    id: "1",
    name: "John Smith",
    flatNumber: "A-101",
    phoneNumber: "+91 9876543210",
    familyMembers: [
      {
        id: "1",
        name: "Jane Smith",
        phoneNumber: "+91 9876543220",
        relation: "Spouse",
      },
      {
        id: "2",
        name: "Mike Smith",
        phoneNumber: "+91 9876543221",
        relation: "Son",
      },
    ],
    temporaryGuests: [
      {
        id: "1",
        name: "Robert Johnson",
        phoneNumber: "+91 9876543222",
        checkIn: "6/11/2025",
        checkOut: "6/18/2025",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    flatNumber: "B-203",
    phoneNumber: "+91 9876543211",
    familyMembers: [],
    temporaryGuests: [],
  },
  {
    id: "3",
    name: "Mike Wilson",
    flatNumber: "C-105",
    phoneNumber: "+91 9876543212",
    familyMembers: [],
    temporaryGuests: [],
  },
]

export const mockSystemLogs: SystemLog[] = [
  {
    id: "1",
    time: "2:23:45 PM 1/15/2024",
    type: "approval",
    description: "Visitor approved for flat A-304",
    user: "Sarah Johnson",
    details: "John Smith - Business Meeting",
  },
  {
    id: "2",
    time: "2:20:12 PM 1/15/2024",
    type: "rejection",
    description: "Package left at gate for flat B-205",
    user: "Mike Chen",
    details: "Maria Garcia - Package Delivery",
  },
  {
    id: "3",
    time: "2:15:33 PM 1/15/2024",
    type: "system",
    description: "Gate barrier opened automatically",
    user: "System",
    details: "Approved visitor entry - Gate A",
  },
  {
    id: "4",
    time: "2:10:07 PM 1/15/2024",
    type: "guard",
    description: "New visitor request submitted",
    user: "Guard Station 1",
    details: "David Wilson - Package Delivery to A-304",
  },
]

export const mockCameraFeeds: CameraFeed[] = [
  {
    id: "1",
    name: "Main Gate",
    location: "Entrance",
    status: "online",
  },
  {
    id: "2",
    name: "Lobby",
    location: "Ground Floor",
    status: "offline",
  },
  {
    id: "3",
    name: "Parking Area",
    location: "Basement",
    status: "online",
  },
  {
    id: "4",
    name: "Emergency Exit",
    location: "Side Gate",
    status: "online",
  },
]

export class SecuritySystemService {
  private static instance: SecuritySystemService
  private visitorRequests: VisitorRequest[] = [...mockVisitorRequests]
  private guards: Guard[] = [...mockGuards]
  private residents: Resident[] = [...mockResidents]
  private systemLogs: SystemLog[] = [...mockSystemLogs]

  static getInstance(): SecuritySystemService {
    if (!SecuritySystemService.instance) {
      SecuritySystemService.instance = new SecuritySystemService()
    }
    return SecuritySystemService.instance
  }

  // Visitor Requests
  getVisitorRequests(): VisitorRequest[] {
    return this.visitorRequests
  }

  addVisitorRequest(request: Omit<VisitorRequest, "id" | "timestamp">): VisitorRequest {
    const newRequest: VisitorRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }
    this.visitorRequests.unshift(newRequest)
    return newRequest
  }

  updateVisitorRequestStatus(id: string, status: VisitorRequest["status"]): void {
    const request = this.visitorRequests.find((r) => r.id === id)
    if (request) {
      request.status = status
    }
  }

  // Guards
  getGuards(): Guard[] {
    return this.guards
  }

  addGuard(guard: Omit<Guard, "id">): Guard {
    const newGuard: Guard = {
      ...guard,
      id: Date.now().toString(),
    }
    this.guards.push(newGuard)
    return newGuard
  }

  updateGuardStatus(id: string, status: Guard["status"], checkInTime?: string): void {
    const guard = this.guards.find((g) => g.id === id)
    if (guard) {
      guard.status = status
      if (checkInTime) {
        guard.checkInTime = checkInTime
      }
    }
  }

  // Residents
  getResidents(): Resident[] {
    return this.residents
  }

  addResident(resident: Omit<Resident, "id">): Resident {
    const newResident: Resident = {
      ...resident,
      id: Date.now().toString(),
    }
    this.residents.push(newResident)
    return newResident
  }

  // System Logs
  getSystemLogs(): SystemLog[] {
    return this.systemLogs
  }

  addSystemLog(log: Omit<SystemLog, "id">): SystemLog {
    const newLog: SystemLog = {
      ...log,
      id: Date.now().toString(),
    }
    this.systemLogs.unshift(newLog)
    return newLog
  }

  // Statistics
  getStatistics() {
    const totalRequests = this.visitorRequests.length
    const approved = this.visitorRequests.filter((r) => r.status === "approved").length
    const leftAtGate = this.visitorRequests.filter((r) => r.status === "left-at-gate").length
    const activeGuards = this.guards.filter((g) => g.status === "on-duty").length
    const totalResidents = this.residents.length

    return {
      totalRequests,
      approved,
      leftAtGate,
      activeGuards,
      totalResidents,
      uptime: "99.8%",
    }
  }
}
