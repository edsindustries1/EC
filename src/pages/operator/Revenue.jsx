import React, { useEffect, useState } from 'react'
import { FiDollarSign, FiCheckCircle, FiTrendingUp, FiClock } from 'react-icons/fi'
import api from '../../utils/api'
import { Page, PageHeader, Stat, Card } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500 } from '../../styles/uber'

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all',   label: 'All time' },
]

export default function OperatorRevenue() {
  const [period, setPeriod] = useState('all')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/revenue', { params: { period } })
      .then(res => active && setData(res.data?.data))
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [period])

  const total      = data?.total_revenue || 0
  const completed  = data?.completed_rides || 0
  const pending    = data?.pending_rides   || 0
  const avg        = completed > 0 ? total / completed : 0

  return (
    <Page>
      <PageHeader
        title="Revenue"
        lead="Track earnings and ride volume."
        right={
          <div style={{ display: 'inline-flex', gap: 4, background: GRAY_50, padding: 4, borderRadius: 999 }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                style={{
                  padding: '7px 14px', borderRadius: 999,
                  fontWeight: 600, fontSize: 12, border: 0, cursor: 'pointer',
                  background: period === p.id ? BLACK : 'transparent',
                  color: period === p.id ? WHITE : BLACK,
                  transition: 'all 150ms ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <Stat label="Total revenue"  value={loading ? '—' : `$${total.toLocaleString()}`} icon={FiDollarSign}/>
        <Stat label="Completed rides" value={loading ? '—' : completed} icon={FiCheckCircle}/>
        <Stat label="Avg price"       value={loading ? '—' : `$${avg.toFixed(0)}`} icon={FiTrendingUp}/>
        <Stat label="Pending"         value={loading ? '—' : pending} icon={FiClock}/>
      </div>

      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Trend</h3>
        <p style={{ color: GRAY_500, fontSize: 14, lineHeight: 1.5 }}>
          Detailed charts coming soon. Live activity shows individual bookings and quote requests as they arrive.
        </p>
      </Card>
    </Page>
  )
}
