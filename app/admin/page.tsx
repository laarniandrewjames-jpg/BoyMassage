// app/(admin)/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin/admin-dashboard'
import { Suspense } from 'react'

export const metadata = {
  title: "Admin Dashboard | King's Massage",
  description: 'Manage professional massage bookings and client requests.',
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: userGetData, error: userGetError } = await supabase.auth.getUser()
  const user = userGetData?.user ?? null

  if (userGetError) {
    console.error('Supabase auth.getUser error:', userGetError.message)
  }

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError) {
    console.error('Error fetching user role:', roleError.message)
   User()
  const user = userGetData?.user ?? null

  if (userGetError) {
    console.error('Supabase auth.getUser error:', userGetError.message)
  }

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError) {
    console.error('Error fetching user role:', roleError.message)
    redirect('/')
  }

  if (userData?.role !== 'admin') {
    redirect('/')
  }

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
    console.error('Database fetch error (bookings):', bookingError.message)
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('Database fetch error (users):', usersError.message)
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6">
      <Suspense fallback={<AdminLoading />}>
        <AdminDashboard initialBookings={bookings ?? []} initialUsers={users ?? []} />
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
