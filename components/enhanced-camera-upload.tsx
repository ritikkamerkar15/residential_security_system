"use client"

import type React from "react"

import { useState, useRef, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, RotateCcw, Zap, ZapOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EnhancedCameraUploadProps {
  label: string
  onFileSelect: (file: File | null) => void
  accept?: string
}

export interface EnhancedCameraUploadRef {
  clearFiles: () => void
}

export const EnhancedCameraUpload = forwardRef<EnhancedCameraUploadRef, EnhancedCameraUploadProps>(
  ({ label, onFileSelect, accept = "image/*" }, ref) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [flashEnabled, setFlashEnabled] = useState(false)
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    // Expose clearFiles method to parent component
    useImperativeHandle(ref, () => ({
      clearFiles: () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        stopCamera()
      },
    }))

    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: facingMode,
            torch: flashEnabled,
          },
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)
        setIsCapturing(true)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }

        toast({
          title: "Camera Started",
          description: `Ready to capture ${label.toLowerCase()}`,
        })
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive",
        })
      }
    }

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
      setIsCapturing(false)
    }

    const toggleCamera = async () => {
      if (stream) {
        stopCamera()
        setFacingMode(facingMode === "user" ? "environment" : "user")
        setTimeout(() => startCamera(), 100)
      }
    }

    const toggleFlash = async () => {
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack && "torch" in videoTrack.getCapabilities()) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ torch: !flashEnabled }],
            })
            setFlashEnabled(!flashEnabled)
          } catch (error) {
            toast({
              title: "Flash Error",
              description: "Flash not supported on this device",
              variant: "destructive",
            })
          }
        }
      }
    }

    const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current
        const video = videoRef.current
        const context = canvas.getContext("2d")

        if (context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const file = new File([blob], `${label.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.jpg`, {
                  type: "image/jpeg",
                })
                setSelectedFile(file)
                onFileSelect(file)
                stopCamera()

                toast({
                  title: "Photo Captured",
                  description: `${label} captured successfully!`,
                })
              }
            },
            "image/jpeg",
            0.9,
          )
        }
      }
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setSelectedFile(file)
        onFileSelect(file)

        toast({
          title: "File Uploaded",
          description: "File uploaded successfully!",
        })
      }
    }

    const removeFile = () => {
      setSelectedFile(null)
      onFileSelect(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    return (
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label} *</label>

        {selectedFile ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedFile.type.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded border-2 border-green-500"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center border-2 border-green-500">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Captured</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isCapturing ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Live indicator */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </div>

                  {/* Camera controls */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleFlash}
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      {flashEnabled ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleCamera}
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Capture button overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    </button>
                  </div>

                  {/* Guidelines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full border-2 border-dashed border-white opacity-30 rounded-lg m-4"></div>
                  </div>
                </div>

                <div className="flex space-x-2 justify-center">
                  <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700 flex-1 max-w-xs">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera} className="flex-1 max-w-xs">
                    Cancel
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="font-medium">📸 Position the {label.toLowerCase()} in the frame</p>
                  <p>Ensure good lighting and the subject is clearly visible</p>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 h-12"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Open Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 h-12"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload File
                </Button>
              </div>
            )}
          </>
        )}

        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileUpload} className="hidden" />
      </div>
    )
  },
)

EnhancedCameraUpload.displayName = "EnhancedCameraUpload"
