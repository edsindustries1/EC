import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiBarChart2, FiTrendingUp, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import api from '../../utils/api'
import { Page, PageHeader, Stat, Card } from '../../components/uber'
import { BLACK, GRAY_500 } from '../../styles/uber'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      api.get('/operator/dashboard').catch(() => null),
      api.get('/users').catch(() => null),
    ])
      .then(([dash, users]) => {
        if (!active) return
        setStats({
          dash: dash?.data?.data?.stats,
          users: users?.data?.data || [],
        })
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const totalUsers = stats?.users?.length || 0
  const operators = stats?.users?.filter(u => u.role === 'operator').length || 0
  const customers = stats?.users?.filter(u => u.role === 'customer').length || 0
  const revenue = stats?.dash?.total_revenue || 0
  const totalRequests = stats?.dash?.total_requests || 0

  return (
    <Page>
      <PageHeader
        title="Admin overview"
        lead="System-wide metrics across users, operators and revenue."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <Stat label="Total users"     value={loading ? '—' : totalUsers}   icon={FiUsers}/>
        <Stat label="Total requests"  value={loading ? '—' : totalRequests} icon={FiBarChart2}/>
        <Stat label="Active operators" value={loading ? '—' : operators}    icon={FiTrendingUp}/>
        <Stat label="Total revenue"   value={loading ? '—' : `$${revenue.toLocaleString()}`} icon={FiDollarSign}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>System overview</h3>
          <p style={{ color: GRAY_500, fontSize: 14, lineHeight: 1.5 }}>
            Analytics charts coming soon. For now, use the side links to manage users and review revenue.
          </p>
          <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap', fontSize: 14 }}>
            <span><strong style={{ fontWeight: 700 }}>{customers}</strong> <span style={{ color: GRAY_500 }}>customers</span></span>
            <span><strong style={{ fontWeight: 700 }}>{operators}</strong> <span style={{ color: GRAY_500 }}>operators</span></span>
            <span><strong style={{ fontWeight: 700 }}>{totalRequests}</strong> <span style={{ color: GRAY_500 }}>requests handled</span></span>
          </div>
        </Card>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Quick links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Quick to="/admin/users" label="Manage users"/>
            <Quick to="/admin/revenue" label="Revenue reports"/>
            <Quick to="/operator/activity" label="Live activity"/>
            <Quick to="/operator/requests" label="All requests"/>
            <Quick to="/operator/drivers" label="Drivers"/>
          </div>
        </Card>
      </div>
    </Page>
  )
}

function Quick({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 6,
        background: '#F6F6F6',
        color: BLACK, textDecoration: 'none',
        fontSize: 14, fontWeight: 600,
        transition: 'background 150ms ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#EEEEEE'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#F6F6F6'}
    >
      {label}
      <FiArrowRight size={14}/>
    </Link>
  )
}
