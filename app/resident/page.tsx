"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PortalLayout } from "@/components/layout/portal-layout"
import { database } from "@/lib/database"
import type { Resident, VisitorRequest } from "@/lib/database"
import { Clock, MapPin, CheckCircle, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ResidentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentResident, setCurrentResident] = useState<Resident | null>(null)
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const residentData = localStorage.getItem("currentResident")
    if (residentData) {
      const resident = JSON.parse(residentData)
      setCurrentResident(resident)
      loadVisitorRequests(resident.flat_number)
    } else {
      router.push("/resident/login")
    }
  }, [router])

  const loadVisitorRequests = async (flatNumber: string) => {
    try {
      setLoading(true)
      const requests = await database.getVisitorRequestsForFlat(flatNumber)
      setVisitorRequests(requests)
    } catch (error) {
      console.error("Error loading visitor requests:", error)
      toast({
        title: "Error Loading Requests",
        description: "Failed to load visitor requests. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentResident) return null

  const pendingRequests = visitorRequests.filter((r) => r.status === "pending")
  const recentDecisions = visitorRequests.filter((r) => r.status !== "pending").slice(0, 5)

  const handleVisitorAction = async (requestId: string, action: "approve" | "reject" | "leave-at-gate") => {
    const request = visitorRequests.find((r) => r.id === requestId)
    if (!request) return

    const status: any = action === "approve" ? "approved" : action === "reject" ? "rejected" : "left-at-gate"
    const success = await database.updateVisitorRequestStatus(requestId, status)

    if (success) {
      // Update local state
      setVisitorRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status } : req)))

      const actionText = action === "approve" ? "approved" : action === "reject" ? "rejected" : "left at gate"
      toast({
        title: "Request Updated",
        description: `${request.visitor_name}'s request has been ${actionText}`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update visitor request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">APPROVED</Badge>
      case "rejected":
        return <Badge variant="destructive">REJECTED</Badge>
      case "left-at-gate":
        return <Badge variant="secondary">LEFT AT GATE</Badge>
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  if (loading) {
    return (
      <PortalLayout
        title="Resident Portal"
        subtitle="Loading..."
        userName={currentResident.name}
        userInfo={`Flat ${currentResident.flat_number}`}
        bgColor="bg-slate-900"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout
      title="Resident Portal"
      subtitle="Visitor Management System"
      userName={currentResident.name}
      userInfo={`Flat ${currentResident.flat_number}`}
      bgColor="bg-slate-900"
    >
      <div className="space-y-8">
        {/* Pending Approvals */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Approval ({pendingRequests.length})
              {pendingRequests.length > 0 && <AlertCircle className="h-5 w-5 ml-2 text-orange-500" />}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Visitor requests waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-6">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-orange-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                          {request.visitor_name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              <strong>Purpose:</strong> {request.purpose_of_visit}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <strong>Phone:</strong> {request.phone_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">
                              <strong>Time:</strong> {getTimeAgo(request.created_at)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <strong>Checked by:</strong> {request.checked_by}
                            </p>
                          </div>
                        </div>

                        {(request.visitor_photo || request.id_proof) && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              {request.visitor_photo && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Photo Verified
                                </Badge>
                              )}
                              {request.id_proof && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  ID Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => handleVisitorAction(request.id, "approve")}
                        className="bg-green-600 hover:bg-green-500 flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Entry
                      </Button>
                      <Button
                        onClick={() => handleVisitorAction(request.id, "leave-at-gate")}
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex-1"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Leave at Gate
                      </Button>
                      <Button
                        onClick={() => handleVisitorAction(request.id, "reject")}
                        variant="outline"
                        className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>

                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 p-3 rounded">
                      <p>
                        <strong>Approve:</strong> Visitor can come directly to your flat
                      </p>
                      <p>
                        <strong>Leave at Gate:</strong> Package/item stays with security
                      </p>
                      <p>
                        <strong>Reject:</strong> Visitor will not be allowed entry
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No pending visitor requests</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  All visitor requests have been processed
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recent Decisions</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your recent visitor request decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDecisions.length > 0 ? (
              <div className="space-y-4">
                {recentDecisions.map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{request.visitor_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{request.purpose_of_visit}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{getTimeAgo(request.created_at)}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No recent decisions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
