"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { AuthService } from "@/lib/auth"
import { AlertTriangle, Clock, MapPin, Users, FileText, Shield, CheckCircle, XCircle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SecurityDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()

  const [incidentReport, setIncidentReport] = useState({
    description: "",
    location: "",
    priority: "medium",
  })

  useEffect(() => {
    if (!currentUser || currentUser.role !== "security") {
      router.push("/auth/security")
      return
    }
  }, [currentUser, router])

  if (!currentUser) return null

  const alerts = authService.getAllAlerts()
  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const assignedFlats = ["A-101", "A-102", "B-201", "B-202", "C-301", "C-302"]

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAlert = {
      type: "maintenance" as const,
      message: `Incident reported: ${incidentReport.description}`,
      timestamp: new Date().toISOString(),
      source: `Security - ${incidentReport.location}`,
      status: "active" as const,
      priority: incidentReport.priority as "low" | "medium" | "high",
    }

    authService.addAlert(newAlert)

    toast({
      title: "Incident Reported",
      description: "Your incident report has been submitted successfully.",
    })

    setIncidentReport({ description: "", location: "", priority: "medium" })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "intrusion":
        return <Shield className="h-4 w-4" />
      case "fire":
        return <AlertTriangle className="h-4 w-4" />
      case "sos":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome, {currentUser.name} • Employee ID: {currentUser.employeeId}
          </p>
          {currentUser.status === "pending" && (
            <Badge variant="outline" className="mt-2">
              Account Pending Approval
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Alert Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Live Alert Feed</span>
                  <Badge variant="destructive">{activeAlerts.length}</Badge>
                </CardTitle>
                <CardDescription>Real-time security alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className="mt-1">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getAlertColor(alert.priority)}>{alert.priority.toUpperCase()}</Badge>
                            <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                              {alert.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{alert.type.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm font-medium mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.source}</span>
                            </div>
                          </div>
                          {alert.status === "active" && (
                            <div className="flex space-x-2 mt-3">
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                              <Button size="sm" variant="outline">
                                <Users className="h-4 w-4 mr-1" />
                                Escalate
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No alerts at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Incident Report Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Incident Report</span>
                </CardTitle>
                <CardDescription>Report security incidents and observations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIncidentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="description">Incident Description *</Label>
                    <Textarea
                      id="description"
                      value={incidentReport.description}
                      onChange={(e) => setIncidentReport({ ...incidentReport, description: e.target.value })}
                      placeholder="Describe the incident in detail..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Select
                        value={incidentReport.location}
                        onValueChange={(value) => setIncidentReport({ ...incidentReport, location: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main-entrance">Main Entrance</SelectItem>
                          <SelectItem value="parking-area">Parking Area</SelectItem>
                          <SelectItem value="lobby">Lobby</SelectItem>
                          <SelectItem value="elevator">Elevator</SelectItem>
                          <SelectItem value="corridor">Corridor</SelectItem>
                          <SelectItem value="emergency-exit">Emergency Exit</SelectItem>
                          <SelectItem value="rooftop">Rooftop</SelectItem>
                          <SelectItem value="basement">Basement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select
                        value={incidentReport.priority}
                        onValueChange={(value) => setIncidentReport({ ...incidentReport, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Incident Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Assigned Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Assigned Zones</span>
                </CardTitle>
                <CardDescription>Flats under your supervision</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {assignedFlats.map((flat) => (
                    <div key={flat} className="p-3 border rounded-lg text-center">
                      <p className="font-medium">{flat}</p>
                      <div className="flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Secure</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profile & Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Profile & Documents</span>
                </CardTitle>
                <CardDescription>Your employment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">ID: {currentUser.employeeId}</p>
                      <p className="text-sm text-gray-500">{currentUser.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Documents Status</h4>
                    <div className="space-y-2">
                      {[
                        {
                          name: "Job Offer Letter",
                          status: currentUser.documents?.jobOfferLetter ? "uploaded" : "missing",
                        },
                        { name: "Profile Photo", status: currentUser.documents?.profilePhoto ? "uploaded" : "missing" },
                        {
                          name: "Identity Proof",
                          status: currentUser.documents?.identityProof ? "uploaded" : "missing",
                        },
                        {
                          name: "Security ID Card",
                          status: currentUser.documents?.securityIdCard ? "uploaded" : "missing",
                        },
                      ].map((doc) => (
                        <div key={doc.name} className="flex items-center justify-between text-sm">
                          <span>{doc.name}</span>
                          {doc.status === "uploaded" ? (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <XCircle className="h-3 w-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Missing Documents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
                <CardDescription>Your shift statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Active Alerts</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{activeAlerts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Resolved Today</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {alerts.filter((a) => a.status === "resolved").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Assigned Flats</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{assignedFlats.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Shift Status</span>
                    <Badge variant="secondary">On Duty</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
