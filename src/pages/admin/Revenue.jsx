import React, { useEffect, useState } from 'react'
import { FiDollarSign, FiTrendingUp, FiCalendar, FiCheckCircle } from 'react-icons/fi'
import api from '../../utils/api'
import { Page, PageHeader, Stat, Card } from '../../components/uber'
import { GRAY_500 } from '../../styles/uber'

export default function AdminRevenue() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/revenue')
      .then(res => setStats(res.data?.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const total = stats?.total_revenue || 0
  const completed = stats?.completed_rides || 0
  const pending = stats?.pending_rides || 0
  const requests = stats?.total_requests || 0

  return (
    <Page>
      <PageHeader
        title="Revenue"
        lead="System-wide revenue and ride volume."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <Stat label="Total revenue" value={loading ? '—' : `$${total.toLocaleString()}`} icon={FiDollarSign}/>
        <Stat label="Completed rides" value={loading ? '—' : completed} icon={FiCheckCircle}/>
        <Stat label="Pending rides" value={loading ? '—' : pending} icon={FiCalendar}/>
        <Stat label="Total requests" value={loading ? '—' : requests} icon={FiTrendingUp}/>
      </div>

      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Revenue breakdown</h3>
        <p style={{ color: GRAY_500, fontSize: 14, lineHeight: 1.5 }}>
          Detailed monthly breakdown by operator coming soon. Until then, see the live activity stream
          to follow individual bookings and quote requests.
        </p>
      </Card>
    </Page>
  )
}
