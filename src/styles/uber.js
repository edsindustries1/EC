// Uber-style design tokens — single source of truth for B&W theme.
// Import these from any page rather than redeclaring inline.

export const BLACK   = '#000000'
export const WHITE   = '#FFFFFF'
export const GRAY_50  = '#F6F6F6'
export const GRAY_100 = '#EEEEEE'
export const GRAY_200 = '#D6D6D6'
export const GRAY_300 = '#CFCFCF'
export const GRAY_400 = '#9CA3AF'
export const GRAY_500 = '#6B6B6B'
export const GRAY_700 = '#3D3D3D'

export const RED     = '#ef4444'
export const GREEN   = '#22c55e'

export const FONT = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif"

// Type scale
export const H1 = {
  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
  lineHeight: 1.05, fontWeight: 700,
  letterSpacing: '-0.03em', marginBottom: '1.25rem',
}
export const H2 = {
  fontSize: 'clamp(1.75rem, 3.4vw, 2.6rem)',
  lineHeight: 1.1, fontWeight: 700,
  letterSpacing: '-0.02em', marginBottom: '2rem',
}
export const H3 = {
  fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
  lineHeight: 1.15, fontWeight: 700,
  letterSpacing: '-0.02em', marginBottom: '0.75rem',
}
export const LEAD = {
  fontSize: 18, lineHeight: 1.5, color: GRAY_500,
  maxWidth: 620, marginBottom: '1.75rem',
}
export const EYEBROW = {
  fontSize: 12, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  color: GRAY_500, marginBottom: 10,
}

// Layout
export const PAGE = {
  background: WHITE, color: BLACK,
  fontFamily: FONT, letterSpacing: '-0.01em',
  minHeight: '100vh',
}

// Cards / surfaces
export const card = {
  background: WHITE, padding: 24, borderRadius: 8,
  border: `1px solid ${GRAY_100}`, height: '100%',
}
export const cardCompact = {
  background: WHITE, padding: '16px 18px', borderRadius: 8,
  border: `1px solid ${GRAY_100}`,
}

// Inputs — soft rounded corners (matches the pill button language)
export const inputStyle = (error = false) => ({
  width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
  border: `1px solid ${error ? '#b91c1c' : GRAY_100}`,
  background: GRAY_50, color: BLACK, outline: 'none', fontFamily: FONT,
})

// Buttons — fully rounded pills (matches the trip-type chips on home).
// Old square style (borderRadius: 4) is gone everywhere across the app.
export const btnPrimary = {
  background: BLACK, color: WHITE,
  padding: '14px 26px', borderRadius: 999, border: 0,
  fontWeight: 600, fontSize: 14,
  display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none', cursor: 'pointer',
}
export const btnSecondary = {
  background: 'transparent', color: BLACK,
  padding: '14px 26px', borderRadius: 999,
  border: `1px solid ${BLACK}`,
  fontWeight: 600, fontSize: 14,
  display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none', cursor: 'pointer',
}
export const btnGhost = {
  background: 'transparent', color: BLACK,
  padding: '8px 14px', borderRadius: 999, border: 0,
  fontWeight: 600, fontSize: 14,
  display: 'inline-flex', alignItems: 'center', gap: 6,
  textDecoration: 'none', cursor: 'pointer',
}

// Status colour map for chips/badges
export const statusColour = (status) => {
  const map = {
    pending:     { bg: '#fef3c7', fg: '#92400e' },
    quoted:      { bg: '#dbeafe', fg: '#1e40af' },
    confirmed:   { bg: '#dcfce7', fg: '#166534' },
    assigned:    { bg: '#e0e7ff', fg: '#3730a3' },
    in_progress: { bg: '#fce7f3', fg: '#9d174d' },
    completed:   { bg: GRAY_100,  fg: BLACK     },
    cancelled:   { bg: '#fee2e2', fg: '#991b1b' },
    available:   { bg: '#dcfce7', fg: '#166534' },
    on_trip:     { bg: '#dbeafe', fg: '#1e40af' },
    offline:     { bg: GRAY_100,  fg: GRAY_500  },
  }
  return map[status] || { bg: GRAY_100, fg: BLACK }
}
