'use client';

import type React from 'react';
import { Camera, ImageUp, Sparkles, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DisplayMessage } from './message-bubble';

interface ColorShowDialogProps {
  open: boolean;
  message: DisplayMessage | null;
  isUploading: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ColorShowDialog({
  open,
  message,
  isUploading,
  onOpenChange,
  onFileSelected,
}: ColorShowDialogProps) {
  const imageUrl = message?.imageUrl;
  const inputClassName = 'sr-only';
  const buttonClassName = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-95 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[48rem] overflow-y-auto bg-[var(--paper-card)] p-4 sm:w-[calc(100vw-2rem)] sm:p-6">
        <DialogHeader>
          <DialogTitle className="pr-10 text-3xl sm:text-4xl">Color & Show</DialogTitle>
          <DialogDescription>
            Upload a photo of the colored page. We’ll make a before-and-after keepsake.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5">
          <div className="paper-sheet hidden bg-white p-3 md:block">
            <div className="paper-dashed flex aspect-square items-center justify-center bg-white p-2">
              {imageUrl ? (
                <img src={imageUrl} alt="Original coloring page" className="max-h-full max-w-full" />
              ) : (
                <ImageUp className="h-10 w-10 text-[var(--ink)]/45" />
              )}
            </div>
            <p className="paper-dashed pt-3 text-center font-hand text-sm text-[var(--ink)]/65">original sheet</p>
          </div>

          <div className="grid gap-3">
            <div
              className="paper-hover flex min-h-[190px] flex-col items-center justify-center rounded-lg border-[2px] border-dashed border-[var(--ink)] bg-white p-4 text-center disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[220px] sm:p-6"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-[var(--ink)] bg-[var(--pink)]">
                {isUploading ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ink)]/25 border-t-[var(--ink)]" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </span>
              <span className="mt-4 font-display text-2xl sm:text-3xl">{isUploading ? 'Uploading...' : 'Upload colored photo'}</span>
              <span className="mt-2 max-w-sm text-sm leading-6 text-[var(--ink)]/65">
                JPG, PNG, or HEIC. Keep it under 11 MB. A bright, straight-on photo works best.
              </span>
              <div className="mt-4 hidden sm:block">
                <label className={buttonClassName}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className={inputClassName}
                    disabled={!message || isUploading}
                    onChange={onFileSelected}
                  />
                  <Camera className="h-4 w-4" /> Choose photo
                </label>
              </div>
              <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2 sm:hidden">
                <label className={buttonClassName}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    capture="environment"
                    className={inputClassName}
                    disabled={!message || isUploading}
                    onChange={onFileSelected}
                  />
                  <Camera className="h-4 w-4" /> Camera
                </label>
                <label className={buttonClassName}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className={inputClassName}
                    disabled={!message || isUploading}
                    onChange={onFileSelected}
                  />
                  <ImageUp className="h-4 w-4" /> Library
                </label>
              </div>
            </div>
            <div className="grid gap-2 rounded-lg border-[1.5px] border-[var(--ink)] bg-white p-3 text-sm leading-6">
              <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-[var(--orange)]" /> Quick photo checklist</p>
              <p className="text-[var(--ink)]/68">Use bright light, keep the page flat, and crop out faces or private details before upload.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--yellow)]/65 p-3 text-sm leading-6 text-[var(--ink)]">
          Tip: crop out the table edge if you can. Don’t upload photos with faces or private details in the background.
        </div>
      </DialogContent>
    </Dialog>
  );
}
