"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PortalLayout } from "@/components/layout/portal-layout"
import { EnhancedCameraUpload, type EnhancedCameraUploadRef } from "@/components/enhanced-camera-upload"
import { database } from "@/lib/database"
import type { Guard, VisitorRequest } from "@/lib/database"
import { CheckCircle, X, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SecurityGatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentGuard, setCurrentGuard] = useState<Guard | null>(null)
  const [loading, setLoading] = useState(true)
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([])
  const [guards, setGuards] = useState<Guard[]>([])

  // Create refs for the camera upload components
  const visitorPhotoRef = useRef<EnhancedCameraUploadRef>(null)
  const idProofRef = useRef<EnhancedCameraUploadRef>(null)

  const [visitorForm, setVisitorForm] = useState({
    visitorName: "",
    phoneNumber: "",
    purposeOfVisit: "",
    flatNumber: "",
    residentName: "",
    visitorPhoto: null as File | null,
    idProof: null as File | null,
  })

  useEffect(() => {
    const guardData = localStorage.getItem("currentGuard")
    if (guardData) {
      setCurrentGuard(JSON.parse(guardData))
      loadData()
    } else {
      router.push("/security-gate/login")
    }
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [requests, guardsData] = await Promise.all([database.getAllVisitorRequests(), database.getAllGuards()])
      setVisitorRequests(requests)
      setGuards(guardsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentGuard) return null

  const onDutyGuards = guards.filter((g) => g.status === "on-duty")
  const offDutyGuards = guards.filter((g) => g.status === "off-duty")

  const handleSubmitVisitorRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if flat exists
    const resident = await database.getResident(visitorForm.flatNumber)
    if (!resident) {
      toast({
        title: "Invalid Flat Number",
        description: "The specified flat number does not exist in our records.",
        variant: "destructive",
      })
      return
    }

    const newRequest = await database.addVisitorRequest({
      visitor_name: visitorForm.visitorName,
      phone_number: visitorForm.phoneNumber,
      purpose_of_visit: visitorForm.purposeOfVisit,
      flat_number: visitorForm.flatNumber,
      resident_name: visitorForm.residentName || resident.name,
      visitor_photo: visitorForm.visitorPhoto?.name,
      id_proof: visitorForm.idProof?.name,
      status: "pending",
      checked_by: `${currentGuard.name} (${currentGuard.employee_id})`,
    })

    if (newRequest) {
      toast({
        title: "Visitor Request Sent",
        description: `Request sent to ${resident.name} at flat ${visitorForm.flatNumber}`,
      })

      // Reset the form state
      setVisitorForm({
        visitorName: "",
        phoneNumber: "",
        purposeOfVisit: "",
        flatNumber: "",
        residentName: "",
        visitorPhoto: null,
        idProof: null,
      })

      // Clear the uploaded files using refs
      visitorPhotoRef.current?.clearFiles()
      idProofRef.current?.clearFiles()

      // Reload data to show new request
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to submit visitor request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGuardStatusToggle = async (employeeId: string, currentStatus: string) => {
    const newStatus = currentStatus === "on-duty" ? "off-duty" : "on-duty"
    const checkInTime = newStatus === "on-duty" ? new Date().toLocaleTimeString() : undefined

    const success = await database.updateGuardStatus(employeeId, newStatus as any, checkInTime)

    if (success) {
      toast({
        title: "Guard Status Updated",
        description: `Guard marked as ${newStatus}`,
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to update guard status. Please try again.",
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
        return <Badge variant="outline">PENDING</Badge>
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>
    }
  }

  if (loading) {
    return (
      <PortalLayout
        title="Security Gate"
        subtitle="Loading..."
        userName={currentGuard.name}
        userInfo={`Employee ID: ${currentGuard.employee_id}`}
        bgColor="bg-slate-900"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout
      title="Security Gate"
      subtitle="Security Guard Portal"
      userName={currentGuard.name}
      userInfo={`Employee ID: ${currentGuard.employee_id}`}
      bgColor="bg-slate-900"
    >
      <Tabs defaultValue="visitor-registration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-200">
          <TabsTrigger
            value="visitor-registration"
            className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Visitor Registration
          </TabsTrigger>
          <TabsTrigger
            value="guard-attendance"
            className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Guard Attendance
          </TabsTrigger>
          <TabsTrigger
            value="recent-requests"
            className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Recent Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visitor-registration">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">New Visitor Request</CardTitle>
              <CardDescription className="text-gray-600">
                Register a new visitor and send request to the flat owner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitVisitorRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visitorName" className="text-gray-700">
                      Visitor Name *
                    </Label>
                    <Input
                      id="visitorName"
                      value={visitorForm.visitorName}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                      placeholder="Enter visitor name"
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-gray-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={visitorForm.phoneNumber}
                      onChange={(e) => setVisitorForm({ ...visitorForm, phoneNumber: e.target.value })}
                      placeholder="+91 9876543210"
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="flatNumber" className="text-gray-700">
                      Flat Number *
                    </Label>
                    <Input
                      id="flatNumber"
                      value={visitorForm.flatNumber}
                      onChange={(e) => setVisitorForm({ ...visitorForm, flatNumber: e.target.value })}
                      placeholder="A-101"
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="purposeOfVisit" className="text-gray-700">
                      Purpose of Visit *
                    </Label>
                    <Select
                      value={visitorForm.purposeOfVisit}
                      onValueChange={(value) => setVisitorForm({ ...visitorForm, purposeOfVisit: value })}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="Personal Visit">Personal Visit</SelectItem>
                        <SelectItem value="Business Meeting">Business Meeting</SelectItem>
                        <SelectItem value="Package Delivery">Package Delivery</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="residentName" className="text-gray-700">
                    Resident Name (Optional)
                  </Label>
                  <Input
                    id="residentName"
                    value={visitorForm.residentName}
                    onChange={(e) => setVisitorForm({ ...visitorForm, residentName: e.target.value })}
                    placeholder="Resident name (will auto-fill if left empty)"
                    className="mt-1 bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedCameraUpload
                    ref={visitorPhotoRef}
                    label="Visitor Photo"
                    onFileSelect={(file) => setVisitorForm({ ...visitorForm, visitorPhoto: file })}
                    accept="image/*"
                  />

                  <EnhancedCameraUpload
                    ref={idProofRef}
                    label="ID Proof"
                    onFileSelect={(file) => setVisitorForm({ ...visitorForm, idProof: file })}
                    accept="image/*,.pdf"
                  />
                </div>

                {/* Live Camera Status Indicator */}
                {(visitorForm.visitorPhoto || visitorForm.idProof) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">
                        {visitorForm.visitorPhoto && visitorForm.idProof
                          ? "Both photos captured successfully"
                          : visitorForm.visitorPhoto
                            ? "Visitor photo captured - ID proof needed"
                            : "ID proof captured - Visitor photo needed"}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500"
                  disabled={!visitorForm.visitorPhoto || !visitorForm.idProof}
                >
                  Send Request to Resident
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guard-attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guards On Duty */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Guards On Duty ({onDutyGuards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onDutyGuards.map((guard) => (
                    <div key={guard.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{guard.name}</h4>
                          <p className="text-sm text-gray-600">
                            {guard.shift} shift • Check-in: {guard.check_in_time}
                          </p>
                          <p className="text-sm text-gray-600">ID: {guard.employee_id}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGuardStatusToggle(guard.employee_id, guard.status)}
                          className="border-gray-300 text-gray-700"
                        >
                          Mark Off Duty
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guards Off Duty */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Guards Off Duty ({offDutyGuards.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offDutyGuards.map((guard) => (
                    <div key={guard.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{guard.name}</h4>
                          <p className="text-sm text-gray-600">{guard.shift} shift</p>
                          <p className="text-sm text-gray-600">ID: {guard.employee_id}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGuardStatusToggle(guard.employee_id, guard.status)}
                          className="border-gray-300 text-gray-700"
                        >
                          Mark On Duty
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent-requests">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Visitor Requests</CardTitle>
              <CardDescription className="text-gray-600">
                All visitor requests submitted through the security gate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visitorRequests.slice(0, 10).map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.visitor_name}</h4>
                        <p className="text-sm text-gray-600">
                          Flat: {request.flat_number} • Purpose: {request.purpose_of_visit}
                        </p>
                        <p className="text-sm text-gray-600">Time: {new Date(request.created_at).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Checked by: {request.checked_by}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  )
}
