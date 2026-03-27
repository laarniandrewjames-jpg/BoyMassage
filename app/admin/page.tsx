import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Suspense } from 'react'

export const metadata = {
  title: "Admin Dashboard | King's Massage",
  description: 'Manage professional massage bookings and client requests.',
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // 2. FIXED: Changed 'profiles' to 'users'
  const { data: userData, error: roleError } = await supabase
    .from('users') 
    .select('role')
    .eq('id', user.id)
    .single()

  // If there is an error or the user isn't an admin, we redirect
  if (roleError || userData?.role !== 'admin') {
    console.error('Admin check failed:', roleError?.message)
    redirect('/')
  }

  // 3. Fetch Bookings
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      id,
      user_id,
      name,
      mobile,
      location,
      service,
      date,
      time,
      duration,
      extra_minutes,
      status,
      payment_proof_url,
      created_at,
      pressure_preference,
      focus_area,
      additional_needs,
      special_requests,
      add_ons,
      total_price,
      earnings
    `)
    .order('created_at', { ascending: false })

  if (bookingError) {
    console.error('❌ Database Fetch Error:', bookingError.message)
  }

  // 4. FIXED: Changed 'profiles' to 'users'
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-slate-50/50">
      <Suspense fallback={<AdminLoading />}>
        <AdminDashboard 
          initialBookings={bookings || []} 
          initialUsers={users || []} 
        />
      </Suspense>
    </main>
  )
}

function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-10 h-10 border-[3px] border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-3" />
      <p className="text-slate-400 font-black text-[10px] animate-pulse uppercase tracking-[0.2em]">
        Accessing King's Massage...
      </p>
    </div>
  )
}
