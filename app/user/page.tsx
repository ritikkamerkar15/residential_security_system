"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Navbar } from "@/components/navbar"
import { AuthService } from "@/lib/auth"
import { Shield, Camera, Lock, Unlock, Lightbulb, Users, AlertTriangle, Phone, Clock, MapPin, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UserDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()

  const [deviceStates, setDeviceStates] = useState({
    armed: false,
    doorLocked: true,
    lightsOn: false,
  })

  useEffect(() => {
    if (!currentUser || currentUser.role !== "user") {
      router.push("/auth/user")
      return
    }
  }, [currentUser, router])

  if (!currentUser) return null

  const alerts = authService.getAllAlerts().slice(0, 5)

  const handleDeviceToggle = (device: string) => {
    setDeviceStates((prev) => ({
      ...prev,
      [device]: !prev[device],
    }))

    const deviceNames = {
      armed: "Security System",
      doorLocked: "Door Lock",
      lightsOn: "Lights",
    }

    toast({
      title: "Device Updated",
      description: `${deviceNames[device]} ${!deviceStates[device] ? "activated" : "deactivated"}`,
    })
  }

  const handleSOS = () => {
    const sosAlert = {
      type: "sos" as const,
      message: `SOS triggered by ${currentUser.name} in flat ${currentUser.flat}`,
      timestamp: new Date().toISOString(),
      source: `Flat ${currentUser.flat}`,
      status: "active" as const,
      priority: "high" as const,
    }

    authService.addAlert(sosAlert)

    toast({
      title: "SOS Alert Sent",
      description: "Emergency services have been notified. Help is on the way.",
      variant: "destructive",
    })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "intrusion":
        return <Shield className="h-4 w-4" />
      case "fire":
        return <AlertTriangle className="h-4 w-4" />
      case "sos":
        return <Phone className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {currentUser.name}!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Flat {currentUser.flat} • {currentUser.status === "pending" ? "Account Pending Approval" : "Account Active"}
          </p>
          {currentUser.status === "pending" && (
            <Badge variant="outline" className="mt-2">
              Pending Approval
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Camera Feed Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Camera Feeds</span>
                </CardTitle>
                <CardDescription>Live security camera monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["Main Entrance", "Parking Area", "Lobby", "Elevator", "Corridor", "Emergency Exit"].map(
                    (camera, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                      >
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">{camera}</p>
                          <div className="flex items-center justify-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Device Control</CardTitle>
                <CardDescription>Manage your home security devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className={`h-6 w-6 ${deviceStates.armed ? "text-red-500" : "text-gray-400"}`} />
                      <div>
                        <p className="font-medium">Security System</p>
                        <p className="text-sm text-gray-500">{deviceStates.armed ? "Armed" : "Disarmed"}</p>
                      </div>
                    </div>
                    <Switch checked={deviceStates.armed} onCheckedChange={() => handleDeviceToggle("armed")} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {deviceStates.doorLocked ? (
                        <Lock className="h-6 w-6 text-green-500" />
                      ) : (
                        <Unlock className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Door Lock</p>
                        <p className="text-sm text-gray-500">{deviceStates.doorLocked ? "Locked" : "Unlocked"}</p>
                      </div>
                    </div>
                    <Switch
                      checked={deviceStates.doorLocked}
                      onCheckedChange={() => handleDeviceToggle("doorLocked")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className={`h-6 w-6 ${deviceStates.lightsOn ? "text-yellow-500" : "text-gray-400"}`} />
                      <div>
                        <p className="font-medium">Lights</p>
                        <p className="text-sm text-gray-500">{deviceStates.lightsOn ? "On" : "Off"}</p>
                      </div>
                    </div>
                    <Switch checked={deviceStates.lightsOn} onCheckedChange={() => handleDeviceToggle("lightsOn")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Family Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Family Members</span>
                </CardTitle>
                <CardDescription>Manage family member access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentUser.familyMembers?.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">Age: {member.age}</p>
                        {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No family members added</p>}

                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Recent Alerts</span>
                </CardTitle>
                <CardDescription>Latest security notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="mt-1">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getAlertColor(alert.priority)}>{alert.priority.toUpperCase()}</Badge>
                          <Badge variant="outline">{alert.status.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.source}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SOS Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Emergency SOS</CardTitle>
                <CardDescription>Press in case of emergency</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="lg" className="w-full" onClick={handleSOS}>
                  <Phone className="h-5 w-5 mr-2" />
                  EMERGENCY SOS
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This will immediately alert security and emergency services
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
