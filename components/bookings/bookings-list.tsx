'use client'

import { useState } from 'react'
import type { Booking } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { format, parseISO, startOfDay, isBefore, isSameDay } from 'date-fns'
import { Calendar, Clock, MapPin, Sparkles, MessageCircle, CheckCircle, Clock3, XCircle, Loader2 } from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'
import { CancelDialog } from './cancel-dialog' 
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookingsListProps {
  bookings: Booking[]
  userId: string
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function BookingsList({ bookings, userId }: BookingsListProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleOpenCancelModal = (id: string) => {
    setSelectedBookingId(id)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return
    
    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', selectedBookingId)

      if (error) throw error
      
      setIsCancelModalOpen(false)
      router.refresh() // This triggers a server-side data re-fetch
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
      setSelectedBookingId(null)
    }
  }

  // --- Logic Fix: Robust Date Separation ---
  const today = startOfDay(new Date())

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = startOfDay(parseISO(booking.date as string))
    
    // Status Check: Cancelled/Completed ALWAYS go to past
    if (booking.status === 'cancelled' || booking.status === 'completed') return false
    
    // Date Check: If it's today OR in the future, it's Upcoming
    const isToday = isSameDay(bookingDate, today)
    const isFuture = !isBefore(bookingDate, today)
    
    return isToday || isFuture
  })

  const pastBookings = bookings.filter(booking => {
    const bookingDate = startOfDay(parseISO(booking.date as string))
    
    // Status Check: Finalized ones are always past/activity
    const isFinalized = booking.status === 'cancelled' || booking.status === 'completed'
    
    // Date Check: Truly before today
    const isTrulyPast = isBefore(bookingDate, today) && !isSameDay(bookingDate, today)
    
    return isFinalized || isTrulyPast
  })

  if (bookings.length === 0) {
    return (
      <Empty icon={Calendar} title="No bookings yet" description="Book your first massage session to get started">
        <Button asChild><a href="/book">Book Now</a></Button>
      </Empty>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Upcoming Section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-green-100 p-2 rounded-full">
            <Clock3 className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Upcoming Sessions</h2>
        </div>
        
        <div className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onChatOpen={() => setChatOpen(true)} 
                onCancel={() => handleOpenCancelModal(booking.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl text-muted-foreground">
              No upcoming appointments.
            </div>
          )}
        </div>
      </section>

      {/* Past & Activity Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 opacity-60">
          <div className="bg-gray-100 p-2 rounded-full">
            <CheckCircle className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Past & Activity</h2>
        </div>
        <div className="space-y-4">
          {pastBookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onChatOpen={() => setChatOpen(true)} 
              isPast 
            />
          ))}
        </div>
      </section>

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} userId={userId} />
      
      <CancelDialog 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}

function BookingCard({ booking, onChatOpen, onCancel, isPast = false }: any) {
  const canCancel = !isPast && (booking.status === 'pending' || booking.status === 'approved')

  return (
    <Card className={`overflow-hidden transition-all duration-300 border-none rounded-2xl ${
      isPast ? 'bg-gray-50/50 opacity-80' : 'bg-white shadow-md ring-1 ring-black/5'
    }`}>
      {!isPast && <div className="h-1.5 bg-green-500 w-full" />}
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isPast ? 'bg-gray-100' : 'bg-green-50'}`}>
                <Sparkles className={`w-4 h-4 ${isPast ? 'text-gray-400' : 'text-green-600'}`} />
              </div>
              <span className="font-bold text-lg">{booking.service}</span>
            </div>
            <Badge className={`${STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES]} border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold`}>
              {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS]}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-gray-400" />
              {format(parseISO(booking.date), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-gray-400" />
              {booking.time}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{booking.location}</span>
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="secondary" className="flex-1 rounded-xl font-semibold" onClick={onChatOpen}>
              <MessageCircle className="w-4 h-4 mr-2" /> Chat
            </Button>

            {canCancel && (
              <Button 
                variant="ghost" 
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold"
                onClick={onCancel}
              >
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
