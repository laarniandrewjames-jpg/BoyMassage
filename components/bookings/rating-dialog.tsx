'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2, Check } from "lucide-react"
import { createClient } from '@/lib/supabase/client'

interface RatingDialogProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  serviceName: string
  currentRating?: number | null
  currentComment?: string | null
}

export function RatingDialog({ isOpen, onClose, bookingId, serviceName, currentRating, currentComment }: RatingDialogProps) {
  const [rating, setRating] = useState<number>(currentRating || 0)
  const [comment, setComment] = useState<string>(currentComment || '')
  const [hover, setHover] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async () => {
    if (rating === 0) return
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          rating,
          review_comment: comment.trim() || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setRating(0)
        setComment('')
      }, 1500)
    } catch (error: any) {
      console.error('Error saving rating:', error)
      alert('Error saving your review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-in zoom-in-50 duration-300">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h2>
            <p className="text-center text-slate-600">Your review has been saved</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
        <DialogHeader className="items-center">
          <DialogTitle className="text-2xl font-bold">Rate your Session</DialogTitle>
          <DialogDescription className="text-center text-base">
            How was your <span className="font-semibold text-slate-900">{serviceName}</span> experience?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-all active:scale-90 focus:outline-none"
              >
                <Star 
                  className={`w-14 h-14 transition-all ${
                    (hover || rating) >= star 
                    ? "fill-amber-400 text-amber-400 scale-110" 
                    : "text-gray-300 scale-100"
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          {rating > 0 && (
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">
                {rating === 1 && "Poor experience"}
                {rating === 2 && "Fair experience"}
                {rating === 3 && "Good experience"}
                {rating === 4 && "Great experience"}
                {rating === 5 && "Excellent experience"}
              </p>
            </div>
          )}

          {/* Comment Box */}
          {rating > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <label className="text-sm font-semibold text-slate-700">Add a comment (optional)</label>
              <Textarea
                placeholder="Share more details about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-2xl border-slate-200 focus:border-emerald-500 resize-none h-24 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500">{comment.length}/500 characters</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-3">
          <Button 
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl font-bold h-11"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
            className="rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold h-11 min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2 fill-amber-950" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
