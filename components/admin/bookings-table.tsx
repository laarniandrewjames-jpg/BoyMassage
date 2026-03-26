'use client'

// Add React import to fix Fragment usage in production
import React, { useState } from 'react'
import type { Booking } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, ChevronDown, ChevronUp, Sparkles, MapPin, 
  MessageCircle, Check, X 
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ChatDialog } from '@/components/chat/chat-dialog'

// Status badge helper
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'pending': return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
    case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    default: return <Badge>{status}</Badge>
  }
}

// Preference summary helper
const getPreferenceSummary = (booking: Booking) => {
  const prefs = []
  if (booking.pressure_preference) prefs.push(`Pressure: ${booking.pressure_preference.replace('-', ' ')}`)
  if (booking.focus_area) prefs.push(`Focus: ${booking.focus_area.replace('-', ' ')}`)
  return prefs.length > 0 ? prefs.join(' • ') : 'No special preferences'
}

interface BookingsTableProps {
  bookings: (Booking & { users: { email: string } })[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Update booking status - production-safe logic
  const updateBookingStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      // Force fresh data fetch on success
      window.location.reload()
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdating(null)
    }
  }

  // Toggle expanded row
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <React.Fragment key={booking.id}>
                  {/* Main Row */}
                  <TableRow className="cursor-pointer" onClick={() => toggleExpand(booking.id)}>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.users.email}</div>
                    </TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>
                      <div>{format(parseISO(booking.date), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{booking.time}</div>
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{booking.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBookingStatus(booking.id, 'approved')
                              }}
                              disabled={updating === booking.id}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBookingStatus(booking.id, 'rejected')
                              }}
                              disabled={updating === booking.id}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setChatUserId(booking.user_id)
                          }}
                        >
                          <MessageCircle size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details Row */}
                  {expandedId === booking.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 bg-muted/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Client Details</h4>
                            <p><strong>Name:</strong> {booking.name}</p>
                            <p><strong>Phone:</strong> {booking.mobile}</p>
                            <p><strong>Email:</strong> {booking.users.email}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Session Info</h4>
                            <p><strong>Duration:</strong> {booking.duration} mins</p>
                            <p><strong>Preferences:</strong> {getPreferenceSummary(booking)}</p>
                            {booking.special_requests && (
                              <p><strong>Notes:</strong> {booking.special_requests}</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Admin Notes</h4>
                            <p className="text-sm text-muted-foreground">
                              Update status or message client to confirm details
                            </p>
                            {booking.status !== 'approved' && booking.status !== 'rejected' && (
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  className="bg-green-600"
                                  onClick={() => updateBookingStatus(booking.id, 'approved')}
                                  disabled={updating === booking.id}
                                >
                                  <Check size={14} className="mr-1" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-red-600"
                                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                  disabled={updating === booking.id}
                                >
                                  <X size={14} className="mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Chat Dialog */}
      <ChatDialog 
        open={!!chatUserId} 
        onOpenChange={(open) => !open && setChatUserId(null)} 
        userId={chatUserId || ''}
        isAdmin
      />
    </div>
  )
}
