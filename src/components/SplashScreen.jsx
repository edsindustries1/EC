import React, { useEffect, useRef, useState } from 'react'

const SPLASH_KEY = 'et_splash_shown'
const MAX_DURATION = 5000

const SplashScreen = ({ onDone }) => {
  const videoRef = useRef(null)
  const [fading, setFading] = useState(false)

  const dismiss = () => {
    setFading(true)
    setTimeout(onDone, 500)
  }

  useEffect(() => {
    const timeout = setTimeout(dismiss, MAX_DURATION)

    const video = videoRef.current
    if (video) {
      const handleEnded = () => {
        clearTimeout(timeout)
        dismiss()
      }
      video.addEventListener('ended', handleEnded)
      return () => {
        clearTimeout(timeout)
        video.removeEventListener('ended', handleEnded)
      }
    }
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f1f3d] transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        className="max-w-xs sm:max-w-sm md:max-w-md w-full"
      />
    </div>
  )
}

const SplashScreenGate = ({ children }) => {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem(SPLASH_KEY)
    } catch {
      return false
    }
  })

  const handleDone = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1')
    } catch {
    }
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={handleDone} />}
      {children}
    </>
  )
}

export default SplashScreenGate
