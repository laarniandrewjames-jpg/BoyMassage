'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { 
  Plus, X, Loader2, Calendar, Clock, User, CheckCircle2, MoreVertical 
} from 'lucide-react'

const ADD_ON_OPTIONS = [
  { name: 'Ear Candling', price: 150, duration: 15 },
  { name: 'Ventusa', price: 200, duration: 15 },
  { name: 'Hot Stone', price: 200, duration: 15 },
  { name: 'Fire Massage', price: 200, duration: 15 }
]

export function BookingsTable({ bookings }: { bookings: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  const [showAddService, setShowAddService] = useState(false)
  const [newService, setNewService] = useState({ name: '', defaultEarnings: 0, description: '' })
  const [isAddingService, setIsAddingService] = useState(false)

  useEffect(() => {
    const initialInputs: Record<string, number> = {}
    bookings.forEach(b => {
      initialInputs[b.id] = b.total_price || b.earnings || 0
    })
    setEarningsInputs(initialInputs)
  }, [bookings])

  const completeBooking = async (id: string) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed', earnings: earningsInputs[id] })
      .eq('id', id)
    if (!error) router.refresh()
    setUpdatingId(null)
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (!error) router.refresh()
    setUpdatingId(null)
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-slate-800">Recent Sessions</h2>
        <Button variant="default" size="sm" onClick={() => setShowAddService(true)} className="rounded-full shadow-sm">
          <Plus className="h-4 w-4 mr-1" /> New Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.length === 0 ? (
          <div className="text-center py-20 text-slate-400 col-span-full">No bookings found.</div>
        ) : (
          bookings.map(booking => (
            <Card key={booking.id} className={`overflow-hidden border-none shadow-sm ring-1 ring-slate-200 border-l-4 ${
              booking.status === 'completed' ? 'border-l-emerald-500' : 
              booking.status === 'approved' ? 'border-l-blue-500' : 'border-l-amber-500'
            }`}>
              <CardContent className="p-0">
                {/* Header: Service & Status */}
                <div className="p-4 flex justify-between items-start bg-slate-50/50 border-b">
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{booking.service}</h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <User className="h-3 w-3 mr-1" /> {booking.name}
                    </div>
                  </div>
                  <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                    {booking.status}
                  </Badge>
                </div>

                {/* Body: Time & Date */}
                <div className="p-4 grid grid-cols-2 gap-4 border-b">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Schedule</p>
                    <div className="flex items-center text-sm font-semibold text-slate-700">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                      {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'MMM dd') : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-1 border-l pl-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time & Duration</p>
                    <div className="flex items-center text-sm font-semibold text-slate-700">
                      <Clock className="h-3.5 w-3.5 mr-2 text-primary" />
                      {booking.time} ({booking.duration || 60}m)
                    </div>
                  </div>
                </div>

                {/* Footer: Price & Actions */}
                <div className="p-4 bg-white flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Session Total</p>
                      <div className="flex items-center text-lg font-black text-emerald-600">
                        <span className="mr-1">₱</span>
                        <Input 
                          type="number" 
                          value={earningsInputs[booking.id] || ''} 
                          onChange={(e) => setEarningsInputs({...earningsInputs, [booking.id]: Number(e.target.value)})} 
                          className="w-24 h-8 text-lg font-black border-none bg-slate-100/50 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'rejected')}>Reject</Button>
                          <Button size="sm" onClick={() => updateStatus(booking.id, 'approved')}>Approve</Button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md shadow-emerald-100"
                          onClick={() => completeBooking(booking.id)}
                          disabled={updatingId === booking.id}
                        >
                          {updatingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Keep your existing Dialog code here for adding services */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        {/* ... same dialog content as before ... */}
      </Dialog>
    </div>
  )
}
