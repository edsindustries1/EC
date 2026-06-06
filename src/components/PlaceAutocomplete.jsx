/**
 * Address autocomplete — server-side proxy first, Photon fallback.
 *
 *   1. /api/places/autocomplete  — proxies Google Places REST API on our
 *      backend. Avoids the retired client-side AutocompleteService widget
 *      AND the HTTP referrer restriction headache for Capacitor WebViews
 *      (origin: capacitor://localhost) where referrers don't always match.
 *
 *   2. Photon (Komoot)           — used when the server proxy explicitly
 *      reports no Google key configured (returns `fallback: 'photon'`).
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import api from '../utils/api'

function formatPhotonSuggestion(feature) {
  const p = feature.properties
  const parts = []
  if (p.name && p.name !== p.street) parts.push(p.name)
  if (p.street) parts.push(p.street)
  if (p.city) parts.push(p.city)
  if (p.state) parts.push(p.state)
  if (p.country) parts.push(p.country)
  return parts.filter(Boolean).join(', ')
}

function SuggestionList({ suggestions, activeIndex, onPick, listId }) {
  if (!suggestions.length) return null
  return (
    <ul
      id={listId}
      role="listbox"
      style={{
        position: 'absolute', top: '100%', left: 0, right: 0,
        marginTop: 6, zIndex: 60,
        background: '#fff', border: '1px solid #EEEEEE', borderRadius: 12,
        boxShadow: '0 12px 28px -8px rgba(0,0,0,0.18)',
        listStyle: 'none', padding: 0,
        overflow: 'hidden',
        maxHeight: 320, overflowY: 'auto',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      {suggestions.map((s, i) => (
        <li
          key={s.key}
          id={`${listId}-option-${i}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => { e.preventDefault(); onPick(s) }}
          style={{
            padding: '12px 14px',
            background: i === activeIndex ? '#F6F6F6' : '#fff',
            cursor: 'pointer',
            borderTop: i === 0 ? 0 : '1px solid #F6F6F6',
            minHeight: 44,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>{s.label}</div>
          {s.sub && <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{s.sub}</div>}
        </li>
      ))}
    </ul>
  )
}

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address',
  className = '',
  icon = null,
  required = false,
  name,
  id,
  'aria-label': ariaLabel,
}) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState('google') // 'google' | 'photon'
  const debounceRef = useRef(null)
  const containerRef = useRef(null)
  const sessionRef = useRef(Math.random().toString(36).slice(2))

  useEffect(() => { setQuery(value || '') }, [value])

  const fetchFromGoogle = useCallback(async (q) => {
    try {
      const res = await api.get('/places/autocomplete', { params: { q, session: sessionRef.current } })
      const items = res.data?.data || []
      // Backend explicitly told us no key — fall back permanently this session
      if (res.data?.fallback === 'photon') {
        setProvider('photon')
        return null
      }
      // If non-OK status (e.g. REQUEST_DENIED), log + fall back this query
      if (res.data?.success === false && res.data?.status) {
        console.warn('[Places] proxy returned status', res.data.status, res.data.error)
        return null
      }
      return items
    } catch (err) {
      console.warn('[Places] proxy fetch failed:', err?.response?.data || err.message)
      return null
    }
  }, [])

  const fetchFromPhoton = useCallback(async (q) => {
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`)
      if (!res.ok) return []
      const data = await res.json()
      return (data.features || [])
        .map(f => ({ label: formatPhotonSuggestion(f), key: String(f.properties.osm_id ?? Math.random()) }))
        .filter(f => f.label.length > 0)
    } catch {
      return []
    }
  }, [])

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); setOpen(false); return }

    let items = null
    if (provider === 'google') {
      items = await fetchFromGoogle(q)
      if (items === null) {
        // Google failed for this query — try Photon as a one-shot backup
        items = await fetchFromPhoton(q)
      }
    } else {
      items = await fetchFromPhoton(q)
    }

    setSuggestions(items || [])
    setOpen((items || []).length > 0)
    setActiveIndex(-1)
  }, [provider, fetchFromGoogle, fetchFromPhoton])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q); onChange(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 200)
  }

  const pick = (s) => {
    const text = s.full || s.label
    setQuery(text); onChange(text)
    setOpen(false); setActiveIndex(-1)
    sessionRef.current = Math.random().toString(36).slice(2) // new billing session
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown')      { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); pick(suggestions[activeIndex]) }
    else if (e.key === 'Escape')    { setOpen(false); setActiveIndex(-1) }
  }

  useEffect(() => {
    const onClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const listId = `${id || name || 'place'}-listbox`

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }}>{icon}</span>}
      <input
        type="text"
        name={name} id={id}
        placeholder={placeholder}
        className={className}
        required={required}
        aria-label={ariaLabel || placeholder}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        role="combobox"
      />
      {open && <SuggestionList suggestions={suggestions} activeIndex={activeIndex} onPick={pick} listId={listId}/>}
    </div>
  )
}
