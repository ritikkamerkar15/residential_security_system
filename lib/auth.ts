"use client"

export interface User {
  id: string
  username: string
  name: string
  role: "user" | "security" | "admin"
  flat?: string
  phone: string
  employeeId?: string
  adminId?: string
  status: "active" | "pending" | "blocked"
  documents?: {
    propertyPaper?: string
    profilePhoto?: string
    identityProof?: string
    jobOfferLetter?: string
    securityIdCard?: string
  }
  familyMembers?: FamilyMember[]
}

export interface FamilyMember {
  id: string
  name: string
  phone?: string
  age: number
  identityProof?: string
  profilePhoto?: string
}

export interface Alert {
  id: string
  type: "intrusion" | "fire" | "medical" | "maintenance" | "sos"
  message: string
  timestamp: string
  source: string
  status: "active" | "resolved"
  priority: "low" | "medium" | "high"
}

// Mock database
const mockUsers: User[] = [
  {
    id: "1",
    username: "john123",
    name: "John Doe",
    role: "user",
    flat: "B-304",
    phone: "9876543210",
    status: "active",
    documents: {
      propertyPaper: "property_papers.pdf",
      profilePhoto: "john_profile.jpg",
      identityProof: "john_id.jpg",
    },
    familyMembers: [
      {
        id: "fm1",
        name: "Jane Doe",
        phone: "9876543211",
        age: 28,
        identityProof: "jane_id.jpg",
        profilePhoto: "jane_profile.jpg",
      },
    ],
  },
  {
    id: "2",
    username: "SEC789",
    name: "Raj Singh",
    role: "security",
    employeeId: "SEC789",
    phone: "9123456789",
    status: "active",
    documents: {
      jobOfferLetter: "raj_offer.pdf",
      profilePhoto: "raj_profile.jpg",
      identityProof: "raj_id.jpg",
      securityIdCard: "raj_security_id.jpg",
    },
  },
  {
    id: "3",
    username: "admin001",
    name: "System Administrator",
    role: "admin",
    adminId: "admin001",
    phone: "9000000000",
    status: "active",
  },
]

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "intrusion",
    message: "Motion detected at main entrance",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    source: "Camera 01",
    status: "active",
    priority: "high",
  },
  {
    id: "2",
    type: "fire",
    message: "Smoke detected in parking area",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    source: "Sensor 03",
    status: "resolved",
    priority: "high",
  },
  {
    id: "3",
    type: "maintenance",
    message: "Elevator maintenance required",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source: "System",
    status: "active",
    priority: "medium",
  },
]

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  login(credentials: { username: string; password: string }): User | null {
    // Mock authentication - in real app, this would validate against backend
    const user = mockUsers.find(
      (u) =>
        u.username === credentials.username ||
        u.employeeId === credentials.username ||
        u.adminId === credentials.username,
    )

    if (user) {
      this.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }
    return null
  }

  register(userData: Partial<User>): User {
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username!,
      name: userData.name!,
      role: userData.role!,
      flat: userData.flat,
      phone: userData.phone!,
      employeeId: userData.employeeId,
      adminId: userData.adminId,
      status: "pending",
      documents: userData.documents,
      familyMembers: userData.familyMembers || [],
    }

    mockUsers.push(newUser)
    return newUser
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
    return this.currentUser
  }

  logout(): void {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  }

  getAllUsers(): User[] {
    return mockUsers
  }

  getAllAlerts(): Alert[] {
    return mockAlerts
  }

  updateUserStatus(userId: string, status: "active" | "pending" | "blocked"): void {
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = status
    }
  }

  addAlert(alert: Omit<Alert, "id">): Alert {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
    }
    mockAlerts.unshift(newAlert)
    return newAlert
  }
}
