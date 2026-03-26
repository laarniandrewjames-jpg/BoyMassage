'use client'

import { useState } from 'react'
import type { User, Booking } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail, Phone, Calendar, Clock, User as UserIcon, 
  ChevronDown, ChevronUp, CheckCircle, XCircle 
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ClientsListProps {
  users: User[]
  bookings: (Booking & { users: { email: string } })[] // Added bookings prop from dashboard
}

export function ClientsList({ users, bookings }: ClientsListProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)

  // Get booking stats for a specific client
  const getClientBookingStats = (clientId: string) => {
    const clientBookings = bookings.filter(b => b.user_id === clientId)
    return {
      total: clientBookings.length,
      approved: clientBookings.filter(b => b.status === 'approved').length,
      pending: clientBookings.filter(b => b.status === 'pending').length,
      latest: clientBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    }
  }

  // Toggle client details expansion
  const toggleClientExpand = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registered Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No clients registered yet</p>
            ) : (
              users.map((user) => {
                const stats = getClientBookingStats(user.id)
                const latestBooking = stats.latest

                return (
                  <div 
                    key={user.id} 
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    {/* Client Header - Click to Expand/Collapse */}
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleClientExpand(user.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.email}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Badge variant="secondary">{stats.total} Total Bookings</Badge>
                            {stats.pending > 0 && (
                              <Badge className="bg-amber-100 text-amber-800">
                                {stats.pending} Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {expandedClientId === user.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Client Details */}
                    {expandedClientId === user.id && (
                      <div className="mt-4 ml-14 space-y-4">
                        <Separator />

                        {/* Client Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span>Client ID: {user.id.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Account Details</h4>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{stats.approved} Approved • {stats.pending} Pending</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Client Booking History */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Booking History</h4>
                          <div className="space-y-2">
                            {bookings
                              .filter(b => b.user_id === user.id)
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((booking) => (
                                <div 
                                  key={booking.id} 
                                  className="p-3 rounded-md border bg-background"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">{booking.service}</span>
                                      <Badge 
                                        className={booking.status === 'approved' 
                                          ? 'ml-2 bg-green-100 text-green-800' 
                                          : 'ml-2 bg-amber-100 text-amber-800'}
                                    >
                                      {booking.status === 'approved' ? 'Confirmed' : 'Pending'}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {new Date(booking.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })} • {booking.time} • {booking.duration + booking.extra_minutes} mins
                                  </div>
                                  {booking.special_requests && (
                                    <p className="text-xs mt-1 text-muted-foreground">
                                      Notes: {booking.special_requests}
                                    </p>
                                  )}
                                </div>
                              ))}
                            {bookings.filter(b => b.user_id === user.id).length === 0 && (
                              <p className="text-sm text-muted-foreground">No bookings yet</p>
                            )}
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Mail className="w-4 h-4" />
                            Send Email
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Phone className="w-4 h-4" />
                            Call Client
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
