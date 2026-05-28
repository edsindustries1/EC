import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { FiPlus, FiMapPin, FiCalendar, FiUsers, FiTruck, FiArrowRight, FiCopy } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Page, PageHeader, Card, EmptyState, StatusChip, PrimaryButton } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500 } from '../../styles/uber'

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter',
  mini_bus: 'Shuttle', coach: 'Coach', limo: 'Limo',
}
const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'upcoming',  label: 'Upcoming' },
  { id: 'past',      label: 'Past' },
]

export default function MyRides() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/my-trips')
      .then(res => setTrips(res.data?.data || []))
      .catch(() => toast.error('Failed to load your trips'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return trips
    return trips.filter(t => {
      const isPast = t.status === 'completed' || t.status === 'cancelled'
      return filter === 'past' ? isPast : !isPast
    })
  }, [trips, filter])

  return (
    <Page>
      <PageHeader
        title="My trips"
        lead="Your bookings and quote requests, all in one place."
        right={
          <Link to="/" style={{
            background: BLACK, color: WHITE,
            padding: '11px 20px', borderRadius: 999, border: 0,
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <FiPlus size={14}/> Book a ride
          </Link>
        }
      />

      <div style={{ display: 'inline-flex', gap: 4, background: GRAY_50, padding: 4, borderRadius: 999, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            style={{
              padding: '7px 16px', borderRadius: 999,
              fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
              background: filter === t.id ? BLACK : 'transparent',
              color: filter === t.id ? WHITE : BLACK,
            }}
          >{t.label}</button>
        ))}
      </div>

      {loading ? (
        <Card><div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div></Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiTruck}
          title="No trips yet"
          description="Book your first ride to get started."
          action={
            <PrimaryButton onClick={() => navigate('/')} style={{ borderRadius: 999 }}>
              <FiPlus size={14}/> Book a ride
            </PrimaryButton>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => <TripCard key={`${t.kind}-${t.id}`} t={t}/>)}
        </div>
      )}
    </Page>
  )
}

function TripCard({ t }) {
  const isBooking = t.kind === 'booking'
  const date = t.pickup_date || t.ride_date
  const time = t.pickup_time || ''
  const dateStr = date ? format(new Date(`${date}T${time || '12:00'}`), 'EEE MMM d · h:mm a') : ''

  const copyRef = () => {
    if (!t.reference) return
    navigator.clipboard.writeText(t.reference)
    toast.success('Reference copied')
  }

  return (
    <Card style={{ padding: 0 }}>
      <div style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              {isBooking && t.reference && (
                <button onClick={copyRef} style={{
                  background: BLACK, color: WHITE,
                  border: 0, padding: '4px 10px', borderRadius: 4,
                  fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                  letterSpacing: '0.08em', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {t.reference} <FiCopy size={11}/>
                </button>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: GRAY_500 }}>
                {isBooking ? 'Booking' : 'Quote request'}
              </span>
              <StatusChip status={t.status}/>
            </div>
            <div style={{ fontSize: 12, color: GRAY_500 }}>{dateStr}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {t.price_quoted && (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>${t.price_quoted}</div>
                <div style={{ fontSize: 11, color: GRAY_500, marginTop: 2 }}>est. total</div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 10 }}>
          <FiMapPin size={12} style={{ color: GRAY_500 }}/>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.pickup} <span style={{ color: GRAY_500, margin: '0 4px' }}>→</span> {t.dropoff}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: GRAY_500, marginBottom: 14 }}>
          <span style={meta}><FiTruck size={11}/> {VEHICLE_LABEL[t.vehicle_type] || t.vehicle_type || 'sedan'}</span>
          <span style={meta}><FiUsers size={11}/> {t.passengers || 1} pax</span>
          {t.flight_number && <span style={meta}>Flight {t.flight_number}</span>}
        </div>

        {isBooking && t.reference ? (
          <Link to={`/reservation/${t.reference}?email=${encodeURIComponent(t.email || '')}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 4,
            background: GRAY_50, color: BLACK, textDecoration: 'none',
            fontSize: 13, fontWeight: 600,
          }}>
            View reservation <FiArrowRight size={12}/>
          </Link>
        ) : (
          <div style={{ fontSize: 12, color: GRAY_500 }}>
            Our team will contact you with an offer shortly.
          </div>
        )}
      </div>
    </Card>
  )
}

const meta = { display: 'inline-flex', alignItems: 'center', gap: 4 }
