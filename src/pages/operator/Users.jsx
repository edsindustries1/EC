import React, { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiMail, FiPhone, FiUsers } from 'react-icons/fi'
import { format } from 'date-fns'
import api from '../../utils/api'
import { Page, PageHeader, Card, Table, EmptyState } from '../../components/uber'
import { BLACK, WHITE, GRAY_500, inputStyle } from '../../styles/uber'

export default function OperatorCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Try multiple endpoints — gracefully fall back
    const tries = ['/users', '/admin/users']
    ;(async () => {
      for (const url of tries) {
        try {
          const res = await api.get(url)
          const list = res.data?.data || []
          setCustomers(list.filter(u => !u.role || u.role === 'customer'))
          break
        } catch {}
      }
      setLoading(false)
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(u => {
      const blob = `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase()
      return blob.includes(q)
    })
  }, [customers, search])

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
      key: 'email', label: 'Email',
      render: (r) => (
        <a href={`mailto:${r.email}`} style={{ color: BLACK, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FiMail size={11} style={{ color: GRAY_500 }}/> {r.email}
        </a>
      ),
    },
    {
      key: 'phone', label: 'Phone',
      render: (r) => r.phone ? (
        <a href={`tel:${r.phone}`} style={{ color: BLACK, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FiPhone size={11} style={{ color: GRAY_500 }}/> {r.phone}
        </a>
      ) : <span style={{ color: GRAY_500 }}>—</span>,
    },
    {
      key: 'created_at', label: 'Joined',
      render: (r) => (
        <span style={{ color: GRAY_500, fontSize: 13 }}>
          {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
  ]

  return (
    <Page>
      <PageHeader
        title="Customers"
        lead={`${customers.length} total ${customers.length === 1 ? 'customer' : 'customers'}`}
      />

      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 480 }}>
        <FiSearch size={14} style={{ position: 'absolute', left: 12, top: 13, color: GRAY_500 }}/>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone…"
          style={{ ...inputStyle(), borderRadius: 999, paddingLeft: 34 }}
        />
      </div>

      {loading ? (
        <Card><div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiUsers} title="No customers found" description={search ? 'Try clearing search.' : 'Customers will appear as people sign up.'}/>
      ) : (
        <Table columns={columns} rows={filtered} getRowKey={(r) => r.id}/>
      )}
    </Page>
  )
}
