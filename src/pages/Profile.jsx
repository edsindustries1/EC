import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiLogOut, FiUser, FiMail, FiPhone, FiShield, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { Page, PageHeader, Card } from '../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500 } from '../styles/uber'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return <Page><Card><div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div></Card></Page>
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <Page narrow>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <PageHeader title="My profile" lead="Account details and preferences."/>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: BLACK, color: WHITE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 22,
            }}>{user.name?.charAt(0)?.toUpperCase() || '?'}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: GRAY_500 }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <DetailRow icon={FiUser}   label="Name"  value={user.name}/>
            <DetailRow icon={FiMail}   label="Email" value={user.email}/>
            <DetailRow icon={FiPhone}  label="Phone" value={user.phone || 'Not provided'}/>
            <DetailRow icon={FiShield} label="Role"  value={user.role}/>
          </div>
        </Card>

        {(user.role === 'customer') && (
          <Card style={{ marginTop: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Quick actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <QuickLink to="/my-rides" label="View my trips"/>
              <QuickLink to="/" label="Book a new ride"/>
            </div>
          </Card>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', marginTop: 18,
            padding: '14px 22px', borderRadius: 4,
            background: 'transparent', color: '#b91c1c',
            border: `1px solid ${GRAY_100}`,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          <FiLogOut size={14}/> Log out
        </button>
      </div>
    </Page>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={14} style={{ color: GRAY_500 }}/>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: GRAY_500 }}>{label}</span>
        <span style={{ fontWeight: 600, color: BLACK, textAlign: 'right', textTransform: label === 'Role' ? 'capitalize' : 'none' }}>{value}</span>
      </div>
    </div>
  )
}

function QuickLink({ to, label }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px', borderRadius: 6,
      background: GRAY_50, color: BLACK, textDecoration: 'none',
      fontSize: 14, fontWeight: 600,
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = GRAY_100}
      onMouseLeave={(e) => e.currentTarget.style.background = GRAY_50}
    >
      {label}
      <FiArrowRight size={14}/>
    </Link>
  )
}
