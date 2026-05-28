import React, { useEffect, useMemo, useState } from 'react'
import { FiMail, FiPhone, FiSearch, FiUsers } from 'react-icons/fi'
import api from '../../utils/api'
import { Page, PageHeader, Card, Table, EmptyState } from '../../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, inputStyle } from '../../styles/uber'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data?.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      if (role !== 'all' && u.role !== role) return false
      if (q) {
        const blob = `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [users, search, role])

  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    operator: users.filter(u => u.role === 'operator').length,
    customer: users.filter(u => u.role === 'customer').length,
  }

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: BLACK, color: WHITE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12,
          }}>{r.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <span style={{ fontWeight: 600 }}>{r.name}</span>
        </div>
      ),
    },
    {
      key: 'email', label: 'Contact',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: BLACK }}><FiMail size={11} style={{ color: GRAY_500 }}/> {r.email}</span>
          {r.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: GRAY_500, fontSize: 12 }}><FiPhone size={10}/> {r.phone}</span>}
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (r) => (
        <span style={{
          padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: r.role === 'admin' ? BLACK : r.role === 'operator' ? GRAY_100 : '#F6F6F6',
          color: r.role === 'admin' ? WHITE : BLACK,
          textTransform: 'capitalize',
        }}>{r.role}</span>
      ),
    },
    {
      key: 'created_at', label: 'Joined',
      render: (r) => (
        <span style={{ color: GRAY_500, fontSize: 13 }}>
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <Page>
      <PageHeader
        title="Users"
        lead={`${counts.customer} customers · ${counts.operator} operators · ${counts.admin} admins`}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <RoleTabs value={role} onChange={setRole} counts={counts}/>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 12, top: 13, color: GRAY_500 }}/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone…"
            style={{ ...inputStyle(), borderRadius: 999, paddingLeft: 34 }}
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiUsers} title="No matching users" description="Try clearing filters or search."/>
      ) : (
        <Table columns={columns} rows={filtered} getRowKey={(r) => r.id}/>
      )}
    </Page>
  )
}

function RoleTabs({ value, onChange, counts }) {
  const tabs = [
    { id: 'all',      label: 'All',       count: counts.all },
    { id: 'customer', label: 'Customers', count: counts.customer },
    { id: 'operator', label: 'Operators', count: counts.operator },
    { id: 'admin',    label: 'Admins',    count: counts.admin },
  ]
  return (
    <div style={{ display: 'inline-flex', gap: 4, background: GRAY_50, padding: 4, borderRadius: 999 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '7px 14px', borderRadius: 999,
            fontWeight: 600, fontSize: 12, border: 0, cursor: 'pointer',
            background: value === t.id ? BLACK : 'transparent',
            color: value === t.id ? WHITE : BLACK,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all 150ms ease',
          }}
        >
          {t.label}
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: value === t.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
            padding: '1px 6px', borderRadius: 999,
          }}>{t.count}</span>
        </button>
      ))}
    </div>
  )
}
