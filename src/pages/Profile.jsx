import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiLogOut, FiUser, FiMail, FiPhone, FiShield, FiArrowRight, FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { Page, PageHeader, Card } from '../components/uber'
import { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT } from '../styles/uber'

export default function Profile() {
  const { user, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!user) {
    return <Page><Card><div style={{ color: GRAY_500, textAlign: 'center', padding: 32 }}>Loading…</div></Card></Page>
  }

  const handleLogout = () => { logout(); navigate('/') }

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Type DELETE to confirm')
      return
    }
    setDeleting(true)
    const res = await deleteAccount()
    setDeleting(false)
    if (res.ok) {
      toast.success('Account deleted')
      navigate('/')
    } else {
      toast.error(res.error || 'Could not delete account')
    }
  }

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
            background: 'transparent', color: BLACK,
            border: `1px solid ${GRAY_100}`,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          <FiLogOut size={14}/> Log out
        </button>

        {/* Danger zone — delete account.
            Apple App Store Review Guideline 5.1.1(v) requires apps that
            create accounts to also let users delete them in-app. */}
        <div style={{
          marginTop: 32,
          padding: 20,
          border: `1px solid ${GRAY_100}`,
          borderRadius: 10,
          background: '#fafafa',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
            <FiAlertTriangle size={18} style={{ color: '#b91c1c', flexShrink: 0, marginTop: 1 }}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginBottom: 4 }}>
                Delete account
              </div>
              <div style={{ fontSize: 13, color: GRAY_500, lineHeight: 1.5 }}>
                Permanently delete your account. Your booking history will be anonymized — operator
                records are preserved but your name, email, and phone are removed from them.
                Pending payment links will be cancelled. This action cannot be undone.
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfirmingDelete(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 4,
              background: 'transparent', color: '#b91c1c',
              border: `1px solid #b91c1c`,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            <FiTrash2 size={13}/> Delete my account
          </button>
        </div>

        {/* About + brand attribution */}
        <div style={{
          marginTop: 28, padding: '24px 4px 8px',
          textAlign: 'center',
          borderTop: `1px solid ${GRAY_100}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', color: BLACK, marginBottom: 4 }}>
            Everywhere Transfers
          </div>
          <div style={{ fontSize: 12, color: GRAY_500, marginBottom: 14 }}>
            Premium chauffeur service
          </div>
          <div style={{
            fontSize: 10, fontWeight: 600, color: GRAY_500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Powered by
            <a
              href="https://everydaydigitalsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: BLACK, fontWeight: 700, textDecoration: 'none', marginLeft: 6 }}
            >
              Everyday Digital Solutions
            </a>
          </div>
        </div>
      </div>

      {confirmingDelete && (
        <div
          onClick={() => !deleting && setConfirmingDelete(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, fontFamily: FONT,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: WHITE, borderRadius: 12,
              maxWidth: 440, width: '100%', padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAlertTriangle size={18}/> Delete account?
              </h2>
              <button
                onClick={() => !deleting && setConfirmingDelete(false)}
                disabled={deleting}
                style={{
                  background: GRAY_50, border: 0, borderRadius: '50%',
                  width: 30, height: 30, cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              ><FiX size={14}/></button>
            </div>
            <p style={{ fontSize: 14, color: BLACK, lineHeight: 1.6, marginBottom: 14 }}>
              This will permanently delete your account ({user.email}). Your past bookings will
              remain on file with operators but anonymized — your name, email, and phone will
              be stripped from them.
            </p>
            <p style={{ fontSize: 14, color: BLACK, marginBottom: 8 }}>
              Type <strong>DELETE</strong> below to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={deleting}
              style={{
                width: '100%', padding: '11px 12px', borderRadius: 4,
                fontSize: 14, fontFamily: 'Menlo, monospace',
                border: `1px solid ${GRAY_100}`, background: GRAY_50,
                marginBottom: 18, outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 4,
                  background: 'transparent', color: BLACK,
                  border: `1px solid ${GRAY_100}`,
                  fontWeight: 600, fontSize: 14,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== 'DELETE'}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 4,
                  background: confirmText === 'DELETE' && !deleting ? '#b91c1c' : '#fca5a5',
                  color: WHITE, border: 0,
                  fontWeight: 700, fontSize: 14,
                  cursor: deleting || confirmText !== 'DELETE' ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >{deleting ? 'Deleting…' : <><FiTrash2 size={13}/> Delete forever</>}</button>
            </div>
          </div>
        </div>
      )}
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
