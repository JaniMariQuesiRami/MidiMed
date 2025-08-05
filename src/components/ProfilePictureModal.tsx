import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { toast } from 'sonner';
import { uploadPatientPhoto, deletePatientPhoto } from '@/db/patients';
import { User2 } from 'lucide-react';

export default function ProfilePictureModal({
  isOpen,
  onClose,
  patient,
  onPhotoChange,
  onDeletePhoto,
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: { patientId: string; photoUrl?: string; firstName: string; lastName: string };
  onPhotoChange: (url: string) => void;
  onDeletePhoto: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      setUploading(true);
      const url = await uploadPatientPhoto(patient.patientId, files[0]);
      onPhotoChange(url);
      toast.success('Foto actualizada');
      onClose();
    } catch {
      toast.error('Error al subir foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setDeleting(true);
      await deletePatientPhoto(patient.patientId);
      onDeletePhoto();
      toast.success('Foto eliminada');
      onClose();
    } catch (error: unknown) {
      console.error('Error deleting photo:', error);
      // Still clear the photo from UI if the database was updated but storage failed
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes('storage/object-not-found')) {
        onDeletePhoto();
        toast.success('Foto eliminada (el archivo ya no existía)');
        onClose();
      } else {
        toast.error('Error al eliminar foto');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Foto de Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6">
          {/* Large square image display */}
          <div className="w-64 h-64 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            {patient.photoUrl ? (
              <Image
                src={patient.photoUrl}
                alt={`${patient.firstName} ${patient.lastName}`}
                width={256}
                height={256}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <User2 size={64} className="mb-2" />
                <span className="text-sm">Sin Foto</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <Button
              variant="destructive"
              onClick={handleDeletePhoto}
              disabled={deleting || !patient.photoUrl}
              className="flex-1"
            >
              {deleting ? 'Eliminando...' : 'Eliminar Foto'}
            </Button>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Subiendo...' : 'Cambiar Foto'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
