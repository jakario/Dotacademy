'use client';

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "ยืนยัน",
  variant = 'default'
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm data-[state=open]:animate-pulse" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-700/50 bg-slate-900 p-6 shadow-2xl shadow-black/60 duration-200 sm:rounded-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
                variant === 'danger' 
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}>
                {variant === 'danger' ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <CheckCircle2 className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <DialogPrimitive.Title className="text-lg font-bold text-slate-100">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-slate-400 leading-relaxed">
                  {description}
                </DialogPrimitive.Description>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-xl px-5 py-2 text-sm font-bold text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95",
                variant === 'danger' 
                  ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/20 focus:ring-rose-500" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/20 focus:ring-blue-500"
              )}
            >
              {confirmText}
            </button>
          </div>
          
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:pointer-events-none text-slate-400 hover:text-white hover:bg-slate-800 p-1">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
