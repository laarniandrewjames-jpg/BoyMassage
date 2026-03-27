import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Suspense } from 'react'

export const metadata = {
  title: "Admin Dashboard | King's Massage",
  description: 'Manage professional massage bookings and client requests.',
}

// CRITICAL: This ensures that every time you click "Approve" and the page 
// refreshes, it gets the absolute latest data from Supabase.
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // 2. Verify Admin Role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    redirect('/')
  }

  // 3. Fetch Bookings 
  // We fetch everything (*) to make sure the BookingsTable has all 
  // the fields like 'pressure_preference' and 'add_ons'
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (bookingError) {
    console.error('❌ Database Fetch Error:', bookingError.message)
  }

  // 4. Fetch Client list (Matched to your Clients tab)
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (userError) {
    console.error('❌ User Fetch Error:', userError.message)
  }

  return (
    // Clean slate-50 background to make your white tiles "pop"
    <main className="min-h-screen bg-slate-50">
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
      {/* Matching your emerald-500 brand color */}
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-bold animate-pulse text-[10px] uppercase tracking-[0.2em]">
        Loading King's Massage...
      </p>
    </div>
  )
}
