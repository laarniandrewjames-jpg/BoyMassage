export type ServiceType = 
  | 'Swedish' 
  | 'Shiatsu' 
  | 'Thai' 
  | 'Combination' 
  | 'Ear Candling'  // New
  | 'Hot Stone'     // New
  | 'Ventusa'       // New
  | 'Fire Massage'  // New

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' // Added "completed"
export type UserRole = 'admin' | 'client'

// New types for special request options
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
  pressure_preference: PressurePreference
  focus_area: FocusArea
  additional_needs: AdditionalNeeds
  special_requests: string
  status: BookingStatus
  earnings?: number          // Manual earnings input
  earnings_notes?: string    // Optional notes for earnings
  payment_proof_url: string | null
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

// --- Updated Service Config ---
export const SERVICES: { value: ServiceType; label: string; description: string }[] = [
  { value: 'Swedish', label: 'Swedish Massage', description: 'Gentle, relaxing strokes for stress relief' },
  { value: 'Shiatsu', label: 'Shiatsu', description: 'Japanese finger pressure therapy' },
  { value: 'Thai', label: 'Thai Massage', description: 'Stretching and pressure point therapy' },
  { value: 'Combination', label: 'Combination Massage', description: 'Customized blend of techniques' },
  { value: 'Ear Candling', label: 'Ear Candling', description: 'Holistic ear cleansing therapy' }, // New
  { value: 'Hot Stone', label: 'Hot Stone Massage', description: 'Heated stones for deep muscle relief' }, // New
  { value: 'Ventusa', label: 'Ventusa Therapy', description: 'Cupping-based massage technique' }, // New
  { value: 'Fire Massage', label: 'Fire Massage', description: 'Warm herbal compresses with gentle heat' } // New
]

export const DURATIONS = [
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' },
  { value: 120, label: '120 minutes' },
  { value: 150, label: '150 minutes' } // Optional: For longer services like Fire Massage
]

export const EXTRA_MINUTES = [
  { value: 0, label: 'No extra time' },
  { value: 15, label: '+15 minutes' },
  { value: 30, label: '+30 minutes' }
]
