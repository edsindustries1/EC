/**
 * Global back button — minimal Liquid Glass pill, top-left of every
 * non-root page. Shown on native (iOS) only; web has the browser
 * back button.
 *
 * Hidden on pages that are "root" entry points (no logical "back"):
 *   - /            home
 *   - /verify      OTP first screen (back would exit to home anyway)
 *   - /my-rides    one of the bottom tabs
 *   - /profile     one of the bottom tabs
 *
 * Behaviour:
 *   - Calls navigate(-1) to use the browser history
 *   - If there's no history (deep link), falls back to navigating home
 *   - Fires a light haptic on tap
 *   - Respects safe-area-inset-top
 */
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { isNative } from '../native'
import { useHaptics } from '../native-ui'

const HIDE_ON = ['/', '/verify', '/my-rides', '/profile', '/account', '/login', '/signup']

export default function BackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const haptic = useHaptics()

  if (!isNative()) return null
  if (HIDE_ON.includes(location.pathname)) return null

  const handleBack = () => {
    haptic('light')
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Back"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top) + 12px)',
        left: 16,
        zIndex: 60,
        width: 40, height: 40,
        borderRadius: '50%',
        border: 0,
        background: 'rgba(255, 255, 255, 0.78)',
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        backdropFilter: 'blur(22px) saturate(180%)',
        boxShadow: '0 4px 14px -2px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#000',
        cursor: 'pointer',
      }}
    >
      <FiChevronLeft size={22} strokeWidth={2.5}/>
    </button>
  )
}
