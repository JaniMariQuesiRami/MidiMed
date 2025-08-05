"use client"

import { useContext, useEffect, useRef, useState } from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Upload, Trash, Download } from 'lucide-react'
import { getPatientFiles, uploadPatientFile, deletePatientFile } from '@/db/patientFiles'
import { UserContext } from '@/contexts/UserContext'
import type { PatientFile } from '@/types/db'
import { toast } from 'sonner'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'

export default function PatientFilesTable({ patientId }: { patientId: string }) {
  const { tenant, user } = useContext(UserContext)
  const [files, setFiles] = useState<PatientFile[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tenant)
      getPatientFiles(patientId, tenant.tenantId).then(setFiles).catch(() => { })
  }, [patientId, tenant])

  const handleUpload = async (list: FileList | null) => {
    if (!list || !tenant || !user) return
    try {
      setUploading(true)
      const results = await Promise.all(
        Array.from(list).map((f) => uploadPatientFile(patientId, tenant.tenantId, user.uid, f)),
      )
      setFiles((prev) => [...prev, ...results])
      toast.success('Archivo subido')
    } catch {
      toast.error('Error al subir archivo')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleUpload(e.dataTransfer.files)
  }

  const remove = async (file: PatientFile) => {
    try {
      await deletePatientFile(file.fileId, file.storagePath)
      setFiles((prev) => prev.filter((f) => f.fileId !== file.fileId))
      toast.success('Archivo eliminado')
    } catch {
      toast.error('Error al eliminar archivo')
    }
  }

  return (
    <div>
      <DropZone
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} />
        <span>{uploading ? 'Subiendo...' : 'Arrastra archivos o haz click para subir'}</span>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </DropZone>
      <div className="overflow-x-auto mt-4">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-4 text-center">
                  No hay archivos
                </TableCell>
              </TableRow>
            ) : (
              files.map((f) => (
                <TableRow key={f.fileId}>
                  <TableCell>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                      {f.name}
                    </a>
                  </TableCell>
                  <TableCell>{format(new Date(f.uploadedAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="flex gap-2">
                    <a href={f.url} target="_blank" rel="noopener noreferrer"><Download size={16} /></a>
                    <button onClick={() => remove(f)} className="cursor-pointer"><Trash size={16} /></button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const DropZone = tw.div`
  flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 text-center
  cursor-pointer text-sm text-muted-foreground hover:bg-muted/40
`
