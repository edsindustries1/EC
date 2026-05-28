import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiAlertCircle, FiClock, FiCheckCircle, FiNavigation, FiDollarSign,
  FiList, FiUsers, FiUserPlus, FiArrowRight, FiActivity,
} from 'react-icons/fi'
import { format } from 'date-fns'
import api from '../../utils/api'
import { Page, PageHeader, Stat, Card, StatusChip, EmptyState } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500 } from '../../styles/uber'

const VEHICLE_LABEL = {
  sedan: 'Sedan', suv: 'SUV', sprinter_van: 'Sprinter',
  mini_bus: 'Shuttle', coach: 'Coach', limo: 'Limo',
}

export default function OperatorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/operator/dashboard').catch(() => null),
      api.get('/operator/requests?limit=10').catch(() => null),
    ]).then(([dash, reqs]) => {
      if (!active) return
      setStats(dash?.data?.data?.stats)
      setRequests(reqs?.data?.data || [])
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const pending   = stats?.pending_requests || 0
  const quoted    = stats?.active_bids       || 0
  const completed = stats?.completed_rides   || 0
  const revenue   = stats?.total_revenue     || 0
  const total     = stats?.total_requests    || 0

  return (
    <Page>
      <PageHeader
        title="Operations center"
        lead={format(now, "EEEE, MMMM d · h:mm a")}
        right={
          <Link to="/operator/activity" style={{
            background: BLACK, color: WHITE,
            padding: '10px 18px', borderRadius: 999, border: 0,
            fontWeight: 600, fontSize: 13, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <FiActivity size={13}/> Live activity
          </Link>
        }
      />

      {/* URGENT */}
      {pending > 0 && (
        <button
          onClick={() => navigate('/operator/activity')}
          style={{
            width: '100%', textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, padding: '20px 24px',
            background: BLACK, color: WHITE, borderRadius: 8,
            border: 0, cursor: 'pointer', marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FiAlertCircle size={28}/>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
                Pending requests
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{pending}</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{pending === 1 ? 'Ride' : 'Rides'} waiting</div>
            </div>
          </div>
          <FiArrowRight size={20}/>
        </button>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <Stat label="Pending"        value={loading ? '—' : pending}   icon={FiClock}/>
        <Stat label="Quoted"         value={loading ? '—' : quoted}    icon={FiList}/>
        <Stat label="Completed"      value={loading ? '—' : completed} icon={FiCheckCircle}/>
        <Stat label="Total revenue"  value={loading ? '—' : `$${revenue.toLocaleString()}`} icon={FiDollarSign}/>
      </div>

      {/* RECENT + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <Card style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${GRAY_100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent requests</h3>
            <Link to="/operator/activity" style={{ color: BLACK, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View all <FiArrowRight size={12}/>
            </Link>
          </div>

          {requests.length === 0 ? (
            <div style={{ padding: 32 }}>
              <EmptyState
                icon={FiList}
                title="No recent requests"
                description="When a customer books or requests a quote, it'll appear here."
              />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: GRAY_50 }}>
                    {['Time', 'Customer', 'Route', 'Pax', 'Vehicle', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 700, color: GRAY_500,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: `1px solid ${GRAY_100}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/operator/activity')}
                      onMouseEnter={(e) => e.currentTarget.style.background = GRAY_50}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={cell}>{r.created_at ? format(new Date(r.created_at), 'HH:mm') : '—'}</td>
                      <td style={{ ...cell, fontWeight: 600 }}>{r.name || r.customer_name || 'Guest'}</td>
                      <td style={{ ...cell, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(r.pickup || '').slice(0, 24)}{r.pickup?.length > 24 ? '…' : ''} → {(r.dropoff || '').slice(0, 24)}
                      </td>
                      <td style={cell}>{r.passengers}</td>
                      <td style={cell}>{VEHICLE_LABEL[r.vehicle_type] || r.vehicle_type}</td>
                      <td style={cell}><StatusChip status={r.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Quick actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Quick to="/operator/activity" icon={FiActivity} label="Live activity"/>
              <Quick to="/operator/requests" icon={FiList} label="All requests"/>
              <Quick to="/operator/drivers" icon={FiUsers} label="Manage drivers"/>
              <Quick to="/operator/drivers?action=add" icon={FiUserPlus} label="Add driver"/>
            </div>
          </Card>

          <Card style={{ background: GRAY_50 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Tip</div>
            <p style={{ fontSize: 13, color: GRAY_500, lineHeight: 1.5 }}>
              Use Live activity to see new bookings and quote requests as they arrive in real time — no refresh needed.
            </p>
          </Card>
        </div>
      </div>
    </Page>
  )
}

function Quick({ to, icon: Icon, label }) {
  return (
    <Link to={to}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 6,
        background: GRAY_50, color: BLACK, textDecoration: 'none',
        fontSize: 14, fontWeight: 600,
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = GRAY_100}
      onMouseLeave={(e) => e.currentTarget.style.background = GRAY_50}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Icon size={14}/> {label}
      </span>
      <FiArrowRight size={14}/>
    </Link>
  )
}

const cell = {
  padding: '13px 16px', fontSize: 14, color: BLACK,
  borderBottom: `1px solid ${GRAY_100}`,
}
