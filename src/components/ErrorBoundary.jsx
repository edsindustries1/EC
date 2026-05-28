import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', padding: '40px 20px',
          background: '#fff', color: '#000',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something broke 😬</h1>
            <p style={{ color: '#6B6B6B', marginBottom: 20 }}>The page failed to render. Stack trace below — share this with Claude.</p>
            <pre style={{
              background: '#F6F6F6', padding: 16, borderRadius: 4,
              overflow: 'auto', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
            }}>{String(this.state.error?.stack || this.state.error)}</pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              style={{
                marginTop: 20, padding: '10px 18px',
                background: '#000', color: '#fff', border: 0, borderRadius: 4,
                fontWeight: 600, cursor: 'pointer',
              }}
            >Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
