'use client'

import { ChevronDown, CloudUpload } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AnswerActionMenu({
  onUploadFiles,
  onAddDetails,
  onBlocked,
}: {
  onUploadFiles: () => void
  onAddDetails: () => void
  onBlocked: () => void
}) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-lg shadow-sm">
      <button
        type="button"
        onClick={onUploadFiles}
        className="inline-flex items-center gap-2 rounded-l-lg bg-[var(--cq-green)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--cq-green-hover)]"
      >
        <CloudUpload className="h-4 w-4 shrink-0" aria-hidden />
        Upload files
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-l border-white/30 bg-[var(--cq-green)] px-2.5 py-2 text-white hover:bg-[var(--cq-green-hover)]"
            aria-label="More actions"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem className="cursor-pointer flex-col items-start gap-0.5 py-3" onClick={onAddDetails}>
            <span className="font-bold text-cq-text">Add details</span>
            <span className="text-xs font-normal text-cq-text-secondary">
              Fill in information manually
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer flex-col items-start gap-0.5 py-3" onClick={onUploadFiles}>
            <span className="font-bold text-cq-text">Upload files</span>
            <span className="text-xs font-normal text-cq-text-secondary">
              Upload documents or photos
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer flex-col items-start gap-0.5 py-3" onClick={onBlocked}>
            <span className="font-bold text-cq-text">I don&apos;t have this information</span>
            <span className="text-xs font-normal text-cq-text-secondary">Mark blocked</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
