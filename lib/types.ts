export type ServiceType = 'Swedish' | 'Shiatsu' | 'Thai' | 'Combination'
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' // Added "completed" for full workflow
export type UserRole = 'admin' | 'client'

// Special request option types (unchanged but formatted for consistency)
export type PressurePreference = 'no-preference' | 'light' | 'medium' | 'firm'
export type FocusArea = 'full-body' | 'back-shoulders' | 'legs-feet' | 'neck-upper-back' | 'other'
export type AdditionalNeeds = 'none' | 'oil-allergy' | 'table-assistance' | 'quiet-session' | 'aromatherapy' | 'other'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  name: string
  mobile: string
  location: string
  service: ServiceType
  date: string
  time: string
  duration: number
  extra_minutes: number
  // --- NEW EARNINGS FIELDS ---
  earnings?: number // Manual input amount (required for approval/completion)
  earnings_notes?: string // Optional notes for earnings calculation
  // ---------------------------
  pressure_preference: PressurePreference
  focus_area: FocusArea
  additional_needs: AdditionalNeeds
  special_requests: string
  status: BookingStatus
  payment_proof_url: string | null
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  sender_role: UserRole
  message: string
  created_at: string
}

export interface BookingFormData {
  name: string
  mobile: string
  location: string
  service: ServiceType
  date: Date | null
  time: string
  duration: number
  extraMinutes: number
  pressurePreference: PressurePreference
  focusArea: FocusArea
  additionalNeeds: AdditionalNeeds
  specialRequests: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

// --- Updated with consistent formatting ---
export const SERVICES: { value: ServiceType; label: string; description: string }[] = [
  { value: 'Swedish', label: 'Swedish Massage', description: 'Gentle, relaxing strokes for stress relief' },
  { value: 'Shiatsu', label: 'Shiatsu', description: 'Japanese finger pressure therapy' },
  { value: 'Thai', label: 'Thai Massage', description: 'Stretching and pressure point therapy' },
  { value: 'Combination', label: 'Combination', description: 'Customized blend of techniques' },
]

export const DURATIONS = [
  { value: 60, label: '60 minutes' },
]

export const EXTRA_MINUTES = [
  { value: 0, label: 'No extra time' },
  { value: 15, label: '+15 minutes' },
  { value: 30, label: '+30 minutes' },
  { value: 60, label: '+60 minutes' },
]
