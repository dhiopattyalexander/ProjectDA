import { useState, useEffect } from 'react'

/**
 * useGyroscope Hook
 * ─────────────────────────────────────────────────────────────
 * Tracks device tilt (gyroscope on mobile) & mouse pointer (desktop fallback)
 * Returns normalized tilt coordinates:
 *   tiltX: -1 (left tilt) to +1 (right tilt)
 *   tiltY: -1 (up tilt)   to +1 (down tilt)
 */
export default function useGyroscope() {
  const [tilt, setTilt] = useState({ tiltX: 0, tiltY: 0, isGyro: false })

  useEffect(() => {
    let hasGyro = false

    // DeviceOrientation handler for mobile Gyroscope
    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return
      hasGyro = true

      // gamma: [-90, 90] (left/right tilt)
      // beta:  [-180, 180] (front/back tilt)
      const rawX = Math.max(-45, Math.min(45, e.gamma)) / 45
      const rawY = Math.max(-45, Math.min(45, e.beta - 45)) / 45 // 45deg natural phone holding angle

      setTilt((prev) => ({
        tiltX: prev.tiltX + (rawX - prev.tiltX) * 0.15,
        tiltY: prev.tiltY + (rawY - prev.tiltY) * 0.15,
        isGyro: true,
      }))
    }

    // Pointer move handler for Desktop fallback
    const handlePointerMove = (e) => {
      if (hasGyro) return // Prefer actual device gyroscope if active

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / centerX))
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / centerY))

      setTilt((prev) => ({
        tiltX: prev.tiltX + (normX - prev.tiltX) * 0.1,
        tiltY: prev.tiltY + (normY - prev.tiltY) * 0.1,
        isGyro: false,
      }))
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  // Function to request iOS 13+ Gyroscope permission if required
  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission()
        return response === 'granted'
      } catch (err) {
        console.error('Gyroscope permission error:', err)
        return false
      }
    }
    return true
  }

  return { ...tilt, requestPermission }
}
