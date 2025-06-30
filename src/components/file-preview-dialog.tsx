
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, FileText } from 'lucide-react';
import type { Message } from '@/lib/types';

interface FilePreviewDialogProps {
  file: Message['file'] | null;
  onClose: () => void;
}

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isOpen = !!file;

  const handleDownload = () => {
    // Prevent download for mock data with '#' url
    if (file.url === '#') {
      alert("Download not available for mock data.");
      return;
    }
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{file.name}</DialogTitle>
        </DialogHeader>
        <div className="my-4 flex justify-center items-center bg-muted/50 rounded-lg overflow-hidden h-96">
          {isImage && file.url !== '#' ? (
            <div className="relative w-full h-full">
              <Image 
                src={file.url} 
                alt={file.name} 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint="file preview"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-4">
              <FileText className="h-24 w-24" />
              <p className="text-lg font-medium">
                {isImage ? 'Preview not available for mock image' : 'No preview available'}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between items-center flex-col sm:flex-row gap-2">
            <span className="text-sm text-muted-foreground">{file.size}</span>
            <div className='flex items-center gap-2'>
              <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
              <Button type="button" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
