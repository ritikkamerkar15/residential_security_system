"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label: string
  accept: string
  onFileSelect: (file: File | null) => void
  className?: string
  required?: boolean
}

export function FileUpload({ label, accept, onFileSelect, className, required }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`file-${label}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-600",
          "hover:border-gray-400 dark:hover:border-gray-500",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex items-center space-x-2">
              {getFileIcon(selectedFile)}
              <span className="text-sm font-medium truncate">{selectedFile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleFileSelect(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <p className="text-sm text-gray-500 mt-2">or drag and drop your file here</p>
            </div>
          </div>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFileSelect(file)
        }}
      />
    </div>
  )
}
