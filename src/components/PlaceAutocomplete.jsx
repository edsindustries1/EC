/**
 * Address autocomplete with two providers:
 *
 *   1. Google Places   — when VITE_GOOGLE_MAPS_API_KEY is set
 *      Uses AutocompleteService + custom dropdown UI. The previous
 *      implementation used `new google.maps.places.Autocomplete(input)`,
 *      which is the LEGACY Place Autocomplete Widget — Google has
 *      retired it for newly issued API keys (March 2026), causing the
 *      familiar "Something went wrong" toast in the browser. The current
 *      AutocompleteService API is fully supported and gives us full UI
 *      control to match the B&W brand.
 *
 *   2. Photon (Komoot) — free fallback when no Google key is configured
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'

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

/**
 * Shared dropdown UI used by both Google and Photon providers.
 * Suggestions: [{ label, key, sub? }]
 */
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

/** Photon (free OSM-based) — used when no Google API key is set. */
function PhotonAutocomplete({ value, onChange, inputProps, icon }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 3) { setSuggestions([]); setOpen(false); return }
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`)
      if (!res.ok) throw new Error('network')
      const data = await res.json()
      const items = (data.features || [])
        .map(f => ({ label: formatPhotonSuggestion(f), key: f.properties.osm_id ?? Math.random() }))
        .filter(f => f.label.length > 0)
      setSuggestions(items)
      setOpen(items.length > 0)
      setActiveIndex(-1)
    } catch {
      setSuggestions([]); setOpen(false)
    }
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q); onChange(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 300)
  }

  const pick = (s) => {
    setQuery(s.label); onChange(s.label)
    setOpen(false); setActiveIndex(-1)
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

  const listId = `${inputProps.id || inputProps.name || 'place'}-listbox`
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }}>{icon}</span>}
      <input
        {...inputProps}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 3 && suggestions.length > 0 && setOpen(true)}
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

/**
 * Google Places — uses AutocompleteService (current API, NOT the
 * retired legacy widget). Renders our own dropdown so it matches the
 * brand styling exactly.
 */
function GooglePlaceInput({ value, onChange, inputProps, icon }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)
  const serviceRef = useRef(null)
  const sessionTokenRef = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  // Lazily create the AutocompleteService once Maps is loaded
  useEffect(() => {
    if (!window.google?.maps?.places || serviceRef.current) return
    try {
      serviceRef.current = new window.google.maps.places.AutocompleteService()
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    } catch (err) {
      console.warn('[Google Places] failed to init AutocompleteService', err)
    }
  }, [])

  const fetchSuggestions = useCallback((input) => {
    if (!serviceRef.current || !input || input.length < 2) {
      setSuggestions([]); setOpen(false); return
    }
    serviceRef.current.getPlacePredictions(
      { input, sessionToken: sessionTokenRef.current, types: ['geocode', 'establishment'] },
      (predictions, status) => {
        const OK = window.google?.maps?.places?.PlacesServiceStatus?.OK
        if (status !== OK || !predictions) {
          setSuggestions([]); setOpen(false); return
        }
        const items = predictions.map(p => ({
          label: p.structured_formatting?.main_text || p.description,
          sub:   p.structured_formatting?.secondary_text || '',
          key:   p.place_id,
          // keep the full description for when the user picks the suggestion
          full:  p.description,
        }))
        setSuggestions(items)
        setOpen(items.length > 0)
        setActiveIndex(-1)
      }
    )
  }, [])

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
    // Issue a new session token after a selection completes a billing session
    try {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    } catch {}
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

  const listId = `${inputProps.id || inputProps.name || 'place'}-listbox`
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }}>{icon}</span>}
      <input
        {...inputProps}
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
  const { loaded: googleLoaded, hasKey } = useGoogleMaps()

  const inputProps = {
    type: 'text',
    name, id, placeholder, className, required,
    'aria-label': ariaLabel || placeholder,
  }

  if (hasKey && googleLoaded) {
    return <GooglePlaceInput value={value} onChange={onChange} inputProps={inputProps} icon={icon}/>
  }
  return <PhotonAutocomplete value={value} onChange={onChange} inputProps={inputProps} icon={icon}/>
}
