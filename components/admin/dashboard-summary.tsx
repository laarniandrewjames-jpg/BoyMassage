'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardSummaryProps {
  pendingCount: number
  approvedCount: number
  totalClients: number
}

export function DashboardSummary({ pendingCount, approvedCount, totalClients }: DashboardSummaryProps) {
  // A compact list to render the grid
  const items = [
    {
      title: 'Pending',
      value: pendingCount,
      label: 'Awaiting',
      icon: Calendar,
      // Use the 'orange' style from your screenshot
      style: 'border-amber-100 bg-amber-50 text-amber-600',
    },
    {
      title: 'Approved',
      value: approvedCount,
      label: 'Sessions',
      icon: Calendar,
      // Use the 'green' style from your screenshot
      style: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Clients',
      value: totalClients,
      label: 'Total',
      icon: Users,
      // Use the 'blue' style from your screenshot
      style: 'border-blue-100 bg-blue-50 text-blue-600',
    },
  ]

  return (
    // 1. Grid Container - 3 columns, tight gap (3)
    <div className="grid grid-cols-3 gap-3 w-full px-1 mb-8">
      {items.map((item) => (
        // 2. The compact card/box
        <div 
          key={item.title} 
          className={cn(
            // Thin border, soft round edges, matching your screenshots
            "rounded-3xl border shadow-sm p-4 flex flex-col justify-between",
            item.style
          )}
        >
          {/* 3. The top row - Title and Icon */}
          <div className="flex items-center justify-between mb-3">
            {/* Reduced text size for title */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-inherit/80">
              {item.title}
            </span>
            {/* Small icon in matching color badge */}
            <div className={cn("p-1.5 rounded-full border border-inherit", item.style)}>
              <item.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          
          {/* 4. The value and label */}
          <div>
            {/* The Big Number (Simplified to text-3xl) */}
            <p className="text-3xl font-black leading-none text-inherit">
              {item.value}
            </p>
            {/* Simplified sub-label with small font */}
            <p className="text-[10px] font-medium text-inherit/70 mt-1 truncate">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
