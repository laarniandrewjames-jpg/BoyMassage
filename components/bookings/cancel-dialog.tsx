'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface CancelDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function CancelDialog({ isOpen, onClose, onConfirm, isLoading }: CancelDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Cancel Booking?</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Are you sure you want to cancel this session? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading} 
            className="flex-1 rounded-xl"
          >
            Keep it
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
