'use client'

import React, { useState } from 'react'
import { Booking } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { User, Info, Clock, PlusCircle } from 'lucide-react'

const ADD_ON_OPTIONS = [
  { name: 'Ear Candling', price: 150 },
  { name: 'Hot Stones', price: 200 },
  { name: 'Aromatherapy', price: 250 }
]

const EXTEND_OPTIONS = [15, 30, 60]

interface AdminBookingCardProps {
  booking: Booking
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onComplete: (id: string) => void 
}

export function AdminBookingCard({ booking, onApprove, onReject, onComplete }: AdminBookingCardProps) {
  const status = booking.status?.toLowerCase()
  const [localBooking, setLocalBooking] = useState({
    ...booking,
    add_ons: booking.add_ons || []
  })

  const handleExtendTime = (minutes: number) => {
    setLocalBooking(prev => ({
      ...prev,
      duration: prev.duration + minutes,
      total_price: prev.total_price + (minutes * 10) // adjust rate per minute
    }))
  }

  const handleAddService = (service: { name: string, price: number }) => {
    setLocalBooking(prev => ({
      ...prev,
      add_ons: [...prev.add_ons, service],
      total_price: prev.total_price + service.price
    }))
  }

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-slate-100 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-lg leading-tight">
              {localBooking.service} ({localBooking.duration}m)
            </h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
              {localBooking.name} • {localBooking.date}
            </p>
          </div>
        </div>
        <Badge className={cn(
          "px-3 py-1 rounded-xl text-[10px] font-bold uppercase border-none",
          status === 'pending' && "bg-amber-100 text-amber-600",
          status === 'approved' && "bg-emerald-100 text-emerald-600",
          status === 'completed' && "bg-blue-100 text-blue-600"
        )}>
          {status}
        </Badge>
      </div>

      {/* Expanded details */}
      <div className="px-5 pb-5 space-y-4">
        {/* Services */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Services</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-slate-50 text-slate-700 rounded-full px-3 py-1 text-xs font-bold shadow-sm">
              {localBooking.service} ({localBooking.duration}m)
            </Badge>
            {localBooking.add_ons.map((ao, i) => (
              <Badge key={i} className="bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-xs font-bold shadow-sm">
                {ao.name} (+₱{ao.price})
              </Badge>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        {status === 'approved' && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 space-y-3">
            <p className="text-xs font-black text-slate-600">Admin Actions</p>
            <div className="flex flex-col gap-3">
              {/* Extend Time Dropdown */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <select
                  className="border rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-emerald-50 transition-all duration-200"
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (val) handleExtendTime(val)
                  }}
                >
                  <option value="">Extend Time</option>
                  {EXTEND_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>+{opt}m</option>
                  ))}
                </select>
              </div>

              {/* Add Service Dropdown */}
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-slate-500" />
                <select
                  className="border rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-emerald-50 transition-all duration-200"
                  onChange={(e) => {
                    const service = ADD_ON_OPTIONS.find(s => s.name === e.target.value)
                    if (service) handleAddService(service)
                  }}
                >
                  <option value="">Add Service</option>
                  {ADD_ON_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt.name}>{opt.name} (+₱{opt.price})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Earnings</span>
          <span className="text-xl font-black text-slate-900">₱{localBooking.total_price}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 pt-3">
          {status === 'pending' && (
            <>
              <button 
                onClick={() => onReject(localBooking.id)}
                className="text-red-500 font-bold text-sm px-2 active:opacity-50 transition-opacity"
              >
                Reject
              </button>
              <button 
                onClick={() => onApprove(localBooking.id)}
                className="bg-slate-900 text-white rounded-2xl h-12 px-10 font-bold text-xs shadow-md active:scale-95 transition-transform"
              >
                Approve
              </button>
            </>
          )}
          {status === 'approved' && (
            <button 
              onClick={() => onComplete(localBooking.id)}
              className="bg-emerald-600 text-white rounded-2xl h-12 px-10 font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              Finish Session
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
