import { create } from 'zustand'
import type { BookingFormData, ServiceType } from './types' // Updated type name for clarity

// Define the correct BookingFormData type (ensure this matches your actual fields)
export interface BookingFormData {
  name: string
  mobile: string
  location: string
  service: ServiceType
  duration: number
  extraMinutes: number
  date: string | null
  time: string
  pressurePreference: string
  focusArea: string
  additionalNeeds: string
  specialRequests: string
  addOnService: string
  addOnPrice: number
  // Add any other fields you need
}

// Define initial form data with new add-on fields
const initialFormData: BookingFormData = {
  name: '',
  mobile: '',
  location: '',
  service: 'Swedish' as ServiceType,
  duration: 60,
  extraMinutes: 0,
  date: null,
  time: '',
  pressurePreference: 'no-preference',
  focusArea: 'full-body',
  additionalNeeds: 'none',
  specialRequests: '',
  addOnService: 'None',
  addOnPrice: 0,
}

interface BookingStore {
  currentStep: number
  formData: BookingFormData
  setStep: (step: number) => void
  updateFormData: (data: Partial<BookingFormData>) => void
  resetForm: () => void
  calculateTotalDuration: () => number
  nextStep: () => void // New: Handler for advancing steps
  prevStep: () => void // New: Handler for going back
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  
  // Set current step directly
  setStep: (step: number) => set({ 
    currentStep: Math.max(1, Math.min(step, 4)) // Limit to 1-4 steps
  }),
  
  // Update form data (supports partial updates)
  updateFormData: (data: Partial<BookingFormData>) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  // Reset form to initial state
  resetForm: () => set({
    currentStep: 1,
    formData: initialFormData
  }),
  
  // Calculate total duration including add-ons
  calculateTotalDuration: () => {
    const { duration, extraMinutes, addOnService } = get().formData
    const addOnTime = addOnService !== 'None' ? 15 : 0
    return duration + extraMinutes + addOnTime
  },
  
  // Advance to next step (if valid)
  nextStep: () => {
    const { currentStep, formData } = get()
    
    // Validate current step before advancing
    let isStepValid = true
    switch(currentStep) {
      case 1: // Service Selection Step
        isStepValid = !!formData.service
        break
      case 2: // Schedule Step
        isStepValid = !!formData.date && !!formData.time
        break
      case 3: // Client Details Step
        isStepValid = !!formData.name && !!formData.mobile
        break
      case 4: // Confirmation Step
        isStepValid = true
        break
    }

    if (isStepValid) {
      set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 4)
      }))
    } else {
      alert('Please complete all required fields to continue!')
    }
  },
  
  // Go back to previous step
  prevStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1)
    }))
  }
}))
