"use client"

import type React from "react"

import { useState, useRef, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CameraUploadProps {
  label: string
  onFileSelect: (file: File | null) => void
  accept?: string
}

export interface CameraUploadRef {
  clearFiles: () => void
}

export const CameraUpload = forwardRef<CameraUploadRef, CameraUploadProps>(
  ({ label, onFileSelect, accept = "image/*" }, ref) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
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
        // Stop camera if it's running
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }
        setIsCapturing(false)
      },
    }))

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        })
        setStream(mediaStream)
        setIsCapturing(true)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
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
                  description: "Photo captured successfully!",
                })
              }
            },
            "image/jpeg",
            0.8,
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
                  <img
                    src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isCapturing ? (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-500 shadow-lg"
                    style={{ maxHeight: "300px" }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Camera overlay UI */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </div>

                  {/* Camera controls overlay */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-12 h-12 bg-white rounded-full border-4 border-gray-300 cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-center"
                        onClick={capturePhoto}
                      >
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 justify-center">
                  <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700 flex-1 max-w-xs">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                  <Button variant="outline" onClick={stopCamera} className="flex-1 max-w-xs">
                    Cancel
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="font-medium">📸 Position the {label.toLowerCase()} in the frame</p>
                  <p>Make sure the image is clear and well-lit</p>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
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

CameraUpload.displayName = "CameraUpload"
