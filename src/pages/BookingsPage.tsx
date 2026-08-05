import { Helmet } from 'react-helmet-async'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useMyBookings, useCancelBooking } from '../hooks/useBookings'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { CalendarClock, MapPin, Phone, Calendar, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'

export default function BookingsPage() {
  const { data: bookings, isLoading } = useMyBookings()
  const { mutate: cancelBooking, isPending } = useCancelBooking()
  const { showToast } = useToast()

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this visit?')) {
      cancelBooking(id, {
        onSuccess: () => showToast('Booking cancelled successfully'),
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed': return <Badge variant="green">Confirmed</Badge>
      case 'Pending':   return <Badge variant="amber">Pending</Badge>
      case 'Rejected':  return <Badge variant="red">Rejected</Badge>
      case 'Cancelled': return <Badge variant="gray">Cancelled</Badge>
      default:          return <Badge>{status}</Badge>
    }
  }

  return (
    <PageWrapper>
      <Helmet>
        <title>My Bookings | NearPG</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500 font-medium mb-8">Manage your scheduled visits and bookings.</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : bookings?.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl py-16">
            <EmptyState
              icon={CalendarClock}
              title="No bookings yet"
              description="You haven't scheduled any property visits yet."
              action={<Link to="/search" className="btn-primary">Find a PG</Link>}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {bookings?.map(booking => (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-6">

                  {/* Image */}
                  <Link to={`/pg/${booking.pg_id}`} className="block w-full sm:w-48 aspect-video sm:aspect-square shrink-0 rounded-2xl overflow-hidden skeleton">
                    {booking.pg_listings?.pg_images?.[0]?.image_url && (
                      <img
                        src={booking.pg_listings.pg_images[0].image_url}
                        alt={booking.pg_listings.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="mb-2">{getStatusBadge(booking.status)}</div>
                        <Link to={`/pg/${booking.pg_id}`} className="text-lg sm:text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {booking.pg_listings?.name ?? 'PG Property'}
                        </Link>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-1">
                          <MapPin size={14} className="text-slate-400" />
                          {booking.pg_listings?.area}, {booking.pg_listings?.city}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Visit Date</p>
                        <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Calendar size={14} className="text-indigo-500" />
                          {new Date(booking.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mt-auto">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 font-medium text-xs mb-0.5">Time</p>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" /> {booking.visit_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium text-xs mb-0.5">Phone</p>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Phone size={14} className="text-slate-400" /> {booking.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={isPending}
                      className="text-sm font-bold text-rose-500 hover:text-rose-600 px-4 py-2 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      Cancel Visit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
