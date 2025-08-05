"use client"

import { useContext, useEffect } from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Trash, Download } from 'lucide-react'
import { getPatientFiles, deletePatientFile } from '@/db/patientFiles'
import { UserContext } from '@/contexts/UserContext'
import type { PatientFile } from '@/types/db'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function PatientFilesTable({ 
  patientId, 
  files, 
  onFilesChange 
}: { 
  patientId: string
  files: PatientFile[]
  onFilesChange: (files: PatientFile[]) => void
}) {
  const { tenant } = useContext(UserContext)

  useEffect(() => {
    if (tenant)
      getPatientFiles(patientId, tenant.tenantId).then(onFilesChange).catch(() => { })
  }, [patientId, tenant, onFilesChange])

  const remove = async (file: PatientFile) => {
    try {
      await deletePatientFile(file.fileId, file.storagePath)
      onFilesChange(files.filter((f) => f.fileId !== file.fileId))
      toast.success('Archivo eliminado')
    } catch {
      toast.error('Error al eliminar archivo')
    }
  }

  return (
    <div className="overflow-x-auto">
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
  )
}
