// Shared uber-style primitives. Import these from any page.
import React from 'react'
import {
  BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT,
  H1, H2, H3, LEAD, EYEBROW, card, cardCompact,
  btnPrimary, btnSecondary, btnGhost, statusColour, inputStyle,
} from '../styles/uber'

export { BLACK, WHITE, GRAY_50, GRAY_100, GRAY_500, FONT, H1, H2, H3, LEAD, EYEBROW, card, cardCompact, btnPrimary, btnSecondary, btnGhost, statusColour, inputStyle }

// Wrapper that gives every page consistent padding + background
export function Page({ children, narrow = false, gray = false }) {
  return (
    <div style={{ background: gray ? GRAY_50 : WHITE, color: BLACK, fontFamily: FONT, letterSpacing: '-0.01em', minHeight: '100vh' }}>
      <div className={narrow ? "max-w-4xl mx-auto" : "max-w-7xl mx-auto"} style={{ padding: '32px 16px 80px' }}>
        {children}
      </div>
    </div>
  )
}

// Hero/section wrapper used on marketing pages
export function Section({ children, bg = WHITE, text = BLACK }) {
  return (
    <section style={{ background: bg, color: text }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12" style={{ padding: '80px 0' }}>
        {children}
      </div>
    </section>
  )
}

export function PageHeader({ title, lead, right }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 26 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: lead ? 4 : 0 }}>{title}</h1>
        {lead && <p style={{ color: GRAY_500, fontSize: 15, maxWidth: 580 }}>{lead}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ children, padded = true, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: WHITE, borderRadius: 8,
      border: `1px solid ${GRAY_100}`,
      padding: padded ? 22 : 0,
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
          {hint && <div style={{ fontSize: 12, color: GRAY_500, marginTop: 6 }}>{hint}</div>}
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            background: BLACK, color: WHITE,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  )
}

export function PrimaryButton({ children, ...props }) {
  const { style, ...rest } = props
  return (
    <button {...rest} style={{ ...btnPrimary, ...style }}>
      {children}
    </button>
  )
}

export function SecondaryButton({ children, ...props }) {
  const { style, ...rest } = props
  return (
    <button {...rest} style={{ ...btnSecondary, ...style }}>
      {children}
    </button>
  )
}

export function StatusChip({ status }) {
  const c = statusColour(status)
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{(status || 'pending').replace(/_/g, ' ')}</span>
  )
}

export function Field({ label, error, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

export function Label({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: 11, fontWeight: 700, color: GRAY_500,
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
    }}>{children}</label>
  )
}

export function Input(props) {
  const { error, style, ...rest } = props
  return <input {...rest} style={{ ...inputStyle(error), ...(style || {}) }}/>
}

export function Tabs({ value, onChange, tabs }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, background: GRAY_50, padding: 4, borderRadius: 999 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '7px 16px', borderRadius: 999,
            fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
            background: value === t.id ? BLACK : 'transparent',
            color: value === t.id ? WHITE : BLACK,
            transition: 'all 150ms ease',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      padding: '60px 24px', textAlign: 'center',
      background: GRAY_50, borderRadius: 8, border: `1px dashed ${GRAY_100}`,
    }}>
      {Icon && (
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: WHITE, border: `1px solid ${GRAY_100}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Icon size={20}/>
        </div>
      )}
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      {description && <p style={{ color: GRAY_500, fontSize: 14, marginBottom: action ? 18 : 0 }}>{description}</p>}
      {action}
    </div>
  )
}

export function Table({ columns, rows, empty, getRowKey, onRowClick }) {
  if (!rows || rows.length === 0) {
    return empty || <EmptyState title="No records" description="Nothing here yet."/>
  }
  return (
    <div style={{
      background: WHITE, borderRadius: 8, border: `1px solid ${GRAY_100}`,
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
          <thead>
            <tr style={{ background: GRAY_50 }}>
              {columns.map(c => (
                <th key={c.key} style={{
                  padding: '12px 16px', textAlign: c.align || 'left',
                  fontSize: 11, fontWeight: 700, color: GRAY_500,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  borderBottom: `1px solid ${GRAY_100}`, whiteSpace: 'nowrap',
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={getRowKey ? getRowKey(r) : i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 120ms ease' }}
                onMouseEnter={(e) => onRowClick && (e.currentTarget.style.background = GRAY_50)}
                onMouseLeave={(e) => onRowClick && (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map(c => (
                  <td key={c.key} style={{
                    padding: '14px 16px', textAlign: c.align || 'left',
                    fontSize: 14, color: BLACK,
                    borderBottom: `1px solid ${GRAY_100}`,
                  }}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
