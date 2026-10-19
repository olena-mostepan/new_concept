"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
interface KeyFieldsModalProps {
  open: boolean
  fieldExplanations: Record<string, string>
  onOpenChange: (open: boolean) => void
}

export function KeyFieldsModal({ open, fieldExplanations, onOpenChange }: KeyFieldsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="flex flex-col items-start rounded-lg border border-[#F3F4F6] bg-white max-h-[80vh] overflow-hidden"
        style={{ width: '778px', padding: '32px', gap: '20px' }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Key Fields Explained</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start w-full overflow-y-auto" style={{ gap: '12px' }}>
          {Object.entries(fieldExplanations).map(([key, explanation]) => (
            <div 
              key={key}
              className="flex flex-col items-start self-stretch rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]"
              style={{ padding: '16px', gap: '8px' }}
            >
              <div className="font-bold text-sm">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </div>
              <div className="text-sm text-gray-700">{explanation}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
