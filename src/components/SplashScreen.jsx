import React, { useEffect, useRef, useState } from 'react'

const MAX_DURATION = 5000

const SplashScreen = ({ onDone }) => {
  const videoRef = useRef(null)
  const [fading, setFading] = useState(false)
  const dismissedRef = useRef(false)

  const dismiss = () => {
    if (dismissedRef.current) return
    dismissedRef.current = true
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
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}

const SplashScreenGate = ({ children }) => {
  // Splash disabled for the uber-style redesign
  return <>{children}</>
}

export default SplashScreenGate
