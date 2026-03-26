import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Suspense } from 'react' // For loading state

export const metadata = {
  title: 'Admin Dashboard | Serenity Touch',
  description: 'Manage bookings and communicate with clients.',
}

// Add search params type for optional server-side filtering
interface AdminPageProps {
  searchParams?: {
    q?: string
    status?: string
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Auth & role checks (unchanged)
  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/')
  }

  // Extract search/filter params if present
  const searchQuery = searchParams?.q || ''
  const bookingStatus = searchParams?.status || ''

  // ------------------------------
  // UPDATED: Enhanced Bookings Fetch with Optional Filters
  // ------------------------------
  let bookingsQuery = supabase
    .from('bookings')
    .select('*, users!inner(email)') // Keep your existing relation
    .order('created_at', { ascending: false })

  // Add server-side filtering if search/filter params exist
  if (searchQuery) {
    bookingsQuery = bookingsQuery.or(
      `name.ilike.%${searchQuery}%, service.ilike.%${searchQuery}%, mobile.ilike.%${searchQuery}%, users.email.ilike.%${searchQuery}%`
    )
  }

  if (bookingStatus && bookingStatus !== 'all') {
    bookingsQuery = bookingsQuery.eq('status', bookingStatus)
  }

  const { data: bookings } = await bookingsQuery

  // ------------------------------
  // UPDATED: Enhanced Users Fetch with Optional Search
  // ------------------------------
  let usersQuery = supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (searchQuery) {
    usersQuery = usersQuery.or(
      `email.ilike.%${searchQuery}%, id.ilike.%${searchQuery}%`
    )
  }

  const { data: users } = await usersQuery

  // ------------------------------
  // UPDATED: Add Suspense for smoother loading
  // ------------------------------
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-medium">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AdminDashboard bookings={bookings || []} users={users || []} />
    </Suspense>
  )
}
