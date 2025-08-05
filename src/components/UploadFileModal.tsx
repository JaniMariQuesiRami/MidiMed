"use client"

import { useContext, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileIcon } from 'lucide-react'
import { uploadPatientFile } from '@/db/patientFiles'
import { UserContext } from '@/contexts/UserContext'
import type { PatientFile } from '@/types/db'
import { toast } from 'sonner'

export default function UploadFileModal({
  open,
  onClose,
  patientId,
  onUploaded,
}: {
  open: boolean
  onClose: () => void
  patientId: string
  onUploaded: (files: PatientFile[]) => void
}) {
  const { tenant, user } = useContext(UserContext)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleUpload = async () => {
    if (!selectedFiles || !tenant || !user) return
    
    try {
      setUploading(true)
      const results = await Promise.all(
        Array.from(selectedFiles).map((f) => uploadPatientFile(patientId, tenant.tenantId, user.uid, f)),
      )
      onUploaded(results)
      toast.success(`${results.length} archivo(s) subido(s)`)
      onClose()
      setSelectedFiles(null)
    } catch {
      toast.error('Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemoveFile = (index: number) => {
    if (!selectedFiles) return
    const newFiles = Array.from(selectedFiles)
    newFiles.splice(index, 1)
    const dt = new DataTransfer()
    newFiles.forEach(file => dt.items.add(file))
    setSelectedFiles(dt.files.length > 0 ? dt.files : null)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Archivos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 text-center cursor-pointer text-sm text-muted-foreground hover:bg-muted/40"
            onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={32} className="mb-2" />
            <span className="font-medium">Arrastra archivos aquí o haz click para seleccionar</span>
            <span className="text-xs mt-1">Archivos múltiples permitidos</span>
            <input 
              ref={inputRef} 
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => handleFileSelect(e.target.files)} 
            />
          </div>

          {/* Selected files list */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileIcon size={14} />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              className="flex-1"
              disabled={uploading || !selectedFiles || selectedFiles.length === 0}
            >
              {uploading ? 'Subiendo...' : `Subir ${selectedFiles?.length || 0} archivo(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
