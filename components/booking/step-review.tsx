'use client'

import { useBookingStore } from '@/lib/booking-store'
import { supabase } from '@/lib/supabase' // ✅ Import your Supabase client
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, PlusCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast' // ✅ For clean notifications
import { useEffect } from 'react'

export function StepReview() {
  const { formData, prevStep, resetForm, calculateTotalDuration } = useBookingStore() // ✅ Fixed calculateTotalDuration import
  const totalDuration = calculateTotalDuration()

  // Calculate pricing (adjust base prices as needed)
  const BASE_SERVICE_PRICES = {
    Swedish: 600,
    Shiatsu: 650,
    Thai: 700,
    Combination: 750
  }
  const basePrice = BASE_SERVICE_PRICES[formData.service as keyof typeof BASE_SERVICE_PRICES] || 0
  const extraTimePrice = formData.extraMinutes === 15 ? 100 : formData.extraMinutes === 30 ? 200 : 0
  const totalPrice = basePrice + extraTimePrice + formData.addOnPrice

  // ✅ New: Handle booking submission to Supabase
  const handleSubmitBooking = async () => {
    try {
      // Validate required fields first
      if (!formData.name || !formData.mobile || !formData.date || !formData.time) {
        toast.error('Please complete all required fields!')
        return
      }

      // ✅ Prepare add-ons in JSONB format (matches your Supabase column)
      const addOnsData = formData.addOnService !== 'None' 
        ? [{ 
            name: formData.addOnService, 
            price: formData.addOnPrice, 
            duration_minutes: 15 
          }]
        : []

      // ✅ Save to Supabase
      const { error } = await supabase
        .from('bookings')
        .insert({
          name: formData.name,
          mobile: formData.mobile,
          location: formData.location,
          service: formData.service,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          extra_minutes: formData.extraMinutes,
          pressure_preference: formData.pressurePreference,
          focus_area: formData.focusArea,
          additional_needs: formData.additionalNeeds,
          special_requests: formData.specialRequests,
          add_ons: addOnsData, // ✅ JSONB-compatible array
          add_ons_total: formData.addOnPrice, // ✅ Optional: Match your computed column if needed
          total_price: totalPrice, // ✅ Optional: Store total price for easy access
          status: 'pending'
        })

      if (error) throw error

      // ✅ Clean notification (no URL!)
      toast.success('Booking submitted successfully! We will contact you shortly.')
      resetForm() // Reset after success
    } catch (err: any) {
      // ✅ Clear error message
      toast.error(`Booking failed: ${err.message || 'Please try again later'}`)
      console.error('Supabase Error:', err) // ✅ Log for debugging
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center">Review Your Booking</h3>
      <p className="text-sm text-muted-foreground text-center">Please confirm all details before submitting</p>

      {/* Service Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Treatment Type:</span>
            <span>{formData.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Duration:</span>
            <span>{totalDuration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-On Service:</span>
            <span>{formData.addOnService || 'None'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span>{formData.time || 'Not selected'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Card (Added for clarity) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{formData.name || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile:</span>
            <span>{formData.mobile || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{formData.location || 'Not provided'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Service Price:</span>
            <span>₱{basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Time Charge:</span>
            <span>₱{extraTimePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-On Price:</span>
            <span>₱{formData.addOnPrice.toLocaleString()}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total Amount:</span>
            <span className="text-lg text-primary">₱{totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleSubmitBooking} // ✅ Use new submission handler
          disabled={!formData.name || !formData.mobile || !formData.date || !formData.time} // ✅ Disable if required fields are missing
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit Booking
        </Button>
      </div>
    </div>
  )
}
