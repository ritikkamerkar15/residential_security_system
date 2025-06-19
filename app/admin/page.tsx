"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PortalLayout } from "@/components/layout/portal-layout"
import { ExportButton } from "@/components/export-button"
import { database } from "@/lib/database"
import type { Admin, VisitorRequest, Resident, Guard } from "@/lib/database"
import {
  AlertTriangle,
  Shield,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Activity,
  TrendingUp,
  CheckCircle,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [statistics, setStatistics] = useState<any>({})
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [guards, setGuards] = useState<Guard[]>([])
  const [loading, setLoading] = useState(true)
  const [newResident, setNewResident] = useState({
    flatNumber: "",
    name: "",
    phoneNumber: "",
    password: "resident123",
  })
  const [newGuard, setNewGuard] = useState({
    employeeId: "",
    name: "",
    shift: "morning" as "morning" | "evening" | "night",
    phoneNumber: "",
    password: "guard123",
  })

  useEffect(() => {
    const adminData = localStorage.getItem("currentAdmin")
    if (adminData) {
      setCurrentAdmin(JSON.parse(adminData))
    } else {
      router.push("/admin/login")
      return
    }

    // Load initial data
    loadData()

    // Set up real-time updates
    const handleDataUpdate = () => {
      loadData()
    }

    database.addEventListener("dataUpdated", handleDataUpdate)
    database.addEventListener("visitorRequestAdded", handleDataUpdate)
    database.addEventListener("visitorRequestUpdated", handleDataUpdate)
    database.addEventListener("guardStatusUpdated", handleDataUpdate)

    // Cleanup
    return () => {
      database.removeEventListener("dataUpdated", handleDataUpdate)
      database.removeEventListener("visitorRequestAdded", handleDataUpdate)
      database.removeEventListener("visitorRequestUpdated", handleDataUpdate)
      database.removeEventListener("guardStatusUpdated", handleDataUpdate)
    }
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [stats, requests, residentsData, guardsData] = await Promise.all([
        database.getStatistics(),
        database.getAllVisitorRequests(),
        database.getAllResidents(),
        database.getAllGuards(),
      ])

      setStatistics(stats || {})
      setVisitorRequests(Array.isArray(requests) ? requests : [])
      setResidents(Array.isArray(residentsData) ? residentsData : [])
      setGuards(Array.isArray(guardsData) ? guardsData : [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentAdmin) return null

  const activeGuards = Array.isArray(guards) ? guards.filter((g) => g.status === "on-duty") : []
  const pendingRequests = Array.isArray(visitorRequests) ? visitorRequests.filter((r) => r.status === "pending") : []

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await database.addResident({
      flat_number: newResident.flatNumber,
      name: newResident.name,
      phone_number: newResident.phoneNumber,
      password: newResident.password,
    })

    if (success) {
      toast({
        title: "Resident Added",
        description: `${newResident.name} has been added to flat ${newResident.flatNumber}`,
      })
      setNewResident({ flatNumber: "", name: "", phoneNumber: "", password: "resident123" })
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to add resident. Flat number may already exist.",
        variant: "destructive",
      })
    }
  }

  const handleAddGuard = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await database.addGuard({
      employee_id: newGuard.employeeId,
      name: newGuard.name,
      shift: newGuard.shift,
      phone_number: newGuard.phoneNumber,
      password: newGuard.password,
      status: "off-duty",
    })

    if (success) {
      toast({
        title: "Guard Added",
        description: `${newGuard.name} has been added with ID ${newGuard.employeeId}`,
      })
      setNewGuard({ employeeId: "", name: "", shift: "morning", phoneNumber: "", password: "guard123" })
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to add guard. Employee ID may already exist.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            APPROVED
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            REJECTED
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            PENDING
          </Badge>
        )
      case "left-at-gate":
        return <Badge variant="secondary">LEFT AT GATE</Badge>
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <PortalLayout
        title="Admin Dashboard"
        subtitle="Loading..."
        userName={currentAdmin.name}
        userInfo="System Administrator"
        bgColor="bg-slate-900"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout
      title="Admin Dashboard"
      subtitle="Complete system overview and management"
      userName={currentAdmin.name}
      userInfo="System Administrator"
      bgColor="bg-slate-900"
    >
      <div className="mb-8">
        <div className="p-6 rounded-lg mb-6 bg-slate-100">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Admin Portal</h2>
          <p className="mb-4 text-slate-600">Real-time monitoring and management of the security system</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 rounded-md bg-slate-200">
              <div className="text-2xl font-bold text-green-400">{statistics.activeGuards}</div>
              <div className="text-sm text-slate-600">Active Guards</div>
            </div>
            <div className="p-3 rounded-md bg-slate-200">
              <div className="text-2xl font-bold text-blue-400">{statistics.activeResidents}</div>
              <div className="text-sm text-slate-600">Active Residents</div>
            </div>
            <div className="p-3 rounded-md bg-slate-200">
              <div className="text-2xl font-bold text-orange-400">{statistics.pendingRequests}</div>
              <div className="text-sm text-slate-600">Pending Requests</div>
            </div>
            <div className="p-3 rounded-md bg-slate-200">
              <div className="text-2xl font-bold text-purple-400">{statistics.todayRequests}</div>
              <div className="text-sm text-slate-600">Today's Requests</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 text-slate-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="live-requests" className="data-[state=active]:bg-purple-600 text-slate-600">
            Live Requests
          </TabsTrigger>
          <TabsTrigger value="residents" className="data-[state=active]:bg-purple-600 text-slate-600">
            Residents
          </TabsTrigger>
          <TabsTrigger value="guards" className="data-[state=active]:bg-purple-600 text-slate-600">
            Guards
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 text-slate-600">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-white border-gray-200 text-center">
                <CardContent className="p-6 bg-slate-100">
                  <div className="text-3xl font-bold mb-2 text-gray-900">{statistics.totalRequests}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 text-center">
                <CardContent className="p-6 bg-slate-100">
                  <div className="text-3xl font-bold text-green-400 mb-2">{statistics.approvedRequests}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 text-center">
                <CardContent className="p-6 bg-slate-100">
                  <div className="text-3xl font-bold text-red-400 mb-2">{statistics.rejectedRequests}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 text-center">
                <CardContent className="p-6 bg-slate-100">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{statistics.activeGuards}</div>
                  <div className="text-sm text-gray-600">Active Guards</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 text-center">
                <CardContent className="p-6 bg-slate-100">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{statistics.activeResidents}</div>
                  <div className="text-sm text-gray-600">Residents</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 text-center">
                <CardContent className="p-6 bg-slate-100">
                  <div className="text-3xl font-bold text-green-400 mb-2">{statistics.uptime}</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center text-gray-900">
                      <Activity className="h-5 w-5 mr-2" />
                      Recent System Activity
                    </CardTitle>
                    <CardDescription className="text-gray-600">Live updates from all system components</CardDescription>
                  </div>
                  <ExportButton />
                </div>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {visitorRequests.slice(0, 10).map((request) => (
                    <div key={request.id} className="flex items-start space-x-3 p-4 rounded-lg bg-slate-200">
                      <div className="mt-1">
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(request.status)}
                          <span className="text-xs text-gray-400">{getTimeAgo(request.created_at)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {request.visitor_name} - {request.purpose_of_visit}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>Flat {request.flat_number}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>{request.checked_by}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live-requests">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="bg-slate-100">
              <CardTitle className="flex items-center text-slate-900">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Live Visitor Requests ({visitorRequests.length})
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingRequests.length} Pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600">
                Real-time monitoring of all visitor requests across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-slate-100">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {visitorRequests.map((request) => (
                  <div key={request.id} className="p-4 rounded-lg bg-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900">{request.visitor_name}</h4>
                        <p className="text-sm text-slate-500">{request.purpose_of_visit}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-slate-600">
                        <span className="font-medium">Flat:</span> {request.flat_number}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Phone:</span> {request.phone_number}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Time:</span> {getTimeAgo(request.created_at)}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Guard:</span> {request.checked_by}
                      </div>
                    </div>
                    {request.resident_name && (
                      <div className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">Resident:</span> {request.resident_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residents">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Resident */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center text-slate-900">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Resident
                </CardTitle>
                <CardDescription className="text-slate-600">Register a new resident in the system</CardDescription>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <form onSubmit={handleAddResident} className="space-y-4">
                  <div>
                    <Label className="text-slate-900">Flat Number (Primary Key)</Label>
                    <Input
                      value={newResident.flatNumber}
                      onChange={(e) => setNewResident({ ...newResident, flatNumber: e.target.value })}
                      placeholder="A-101"
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900">Resident Name</Label>
                    <Input
                      value={newResident.name}
                      onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900">Phone Number</Label>
                    <Input
                      value={newResident.phoneNumber}
                      onChange={(e) => setNewResident({ ...newResident, phoneNumber: e.target.value })}
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900">Default Password</Label>
                    <Input
                      value={newResident.password}
                      onChange={(e) => setNewResident({ ...newResident, password: e.target.value })}
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500">
                    Add Resident
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Resident List */}
            <Card className="border-slate-700 bg-slate-100">
              <CardHeader className="bg-slate-100">
                <CardTitle className="text-slate-900">Active Residents ({residents.length})</CardTitle>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {residents.map((resident) => (
                    <div
                      key={resident.flat_number}
                      className="flex justify-between items-center p-4 rounded-lg bg-slate-200"
                    >
                      <div>
                        <h4 className="font-medium text-slate-900">{resident.name}</h4>
                        <p className="text-sm text-slate-600">
                          {resident.flat_number} • {resident.phone_number}
                        </p>
                        <p className="text-xs text-slate-400">
                          Family: {resident.family_members?.length || 0} • Guests:{" "}
                          {resident.temporary_guests?.length || 0}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Guard */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center text-slate-900">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Guard
                </CardTitle>
                <CardDescription className="text-slate-600">Register a new security guard</CardDescription>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <form onSubmit={handleAddGuard} className="space-y-4">
                  <div>
                    <Label className="text-slate-900">Employee ID</Label>
                    <Input
                      value={newGuard.employeeId}
                      onChange={(e) => setNewGuard({ ...newGuard, employeeId: e.target.value })}
                      placeholder="SEC002"
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900">Guard Name</Label>
                    <Input
                      value={newGuard.name}
                      onChange={(e) => setNewGuard({ ...newGuard, name: e.target.value })}
                      className="border-slate-600 bg-slate-50 text-black"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900">Shift</Label>
                    <Select
                      value={newGuard.shift}
                      onValueChange={(value: any) => setNewGuard({ ...newGuard, shift: value })}
                    >
                      <SelectTrigger className="border-slate-600 text-black bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="morning">Morning Shift</SelectItem>
                        <SelectItem value="evening">Evening Shift</SelectItem>
                        <SelectItem value="night">Night Shift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-900">Phone Number</Label>
                    <Input
                      value={newGuard.phoneNumber}
                      onChange={(e) => setNewGuard({ ...newGuard, phoneNumber: e.target.value })}
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900">Default Password</Label>
                    <Input
                      value={newGuard.password}
                      onChange={(e) => setNewGuard({ ...newGuard, password: e.target.value })}
                      className="border-slate-600 text-black bg-slate-50"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500">
                    Add Guard
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Guards List */}
            <Card className="border-slate-700 bg-slate-100">
              <CardHeader className="bg-slate-100">
                <CardTitle className="text-slate-900">Security Guards ({guards.length})</CardTitle>
                <CardDescription className="text-slate-600">{activeGuards.length} currently on duty</CardDescription>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {guards.map((guard) => (
                    <div key={guard.id} className="flex justify-between items-center p-4 rounded-lg bg-slate-200">
                      <div>
                        <h4 className="font-medium text-slate-900">{guard.name}</h4>
                        <p className="text-sm text-slate-600">
                          {guard.employee_id} • {guard.shift} shift • {guard.phone_number}
                        </p>
                        {guard.check_in_time && (
                          <p className="text-xs text-slate-400">Check-in: {guard.check_in_time}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={guard.status === "on-duty" ? "default" : "outline"}
                          className={guard.status === "on-duty" ? "bg-green-500" : ""}
                        >
                          {guard.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center text-slate-900">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Request Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Total Requests</span>
                    <span className="font-bold text-slate-900">{statistics.totalRequests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Approved</span>
                    <span className="font-bold text-green-500">{statistics.approvedRequests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Rejected</span>
                    <span className="font-bold text-red-500">{statistics.rejectedRequests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Left at Gate</span>
                    <span className="font-bold text-yellow-500">{statistics.leftAtGateRequests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Today's Requests</span>
                    <span className="font-bold text-blue-500">{statistics.todayRequests}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center text-slate-900">
                  <Users className="h-5 w-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-slate-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Active Residents</span>
                    <span className="font-bold text-purple-500">{statistics.activeResidents}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Total Guards</span>
                    <span className="font-bold text-blue-500">{statistics.totalGuards}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Guards On Duty</span>
                    <span className="font-bold text-green-500">{statistics.activeGuards}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">Pending Requests</span>
                    <span className="font-bold text-orange-500">{statistics.pendingRequests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-200">
                    <span className="text-slate-600">System Uptime</span>
                    <span className="font-bold text-green-500">{statistics.uptime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  )
}
