import { useState, useEffect } from 'react'

/**
 * useGyroscope Hook
 * ─────────────────────────────────────────────────────────────
 * Tracks 3D device tilt (mobile gyroscope orientation) and mouse pointer (desktop fallback).
 */
export default function useGyroscope() {
  const [tilt, setTilt] = useState({
    tiltX: 0,
    tiltY: 0,
    isGyro: false,
  })

  useEffect(() => {
    let hasGyro = false

    // DeviceOrientation handler for mobile Gyroscope tilt
    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return
      hasGyro = true

      // gamma: [-90, 90] (left/right tilt)
      // beta:  [-180, 180] (front/back tilt)
      const rawX = Math.max(-45, Math.min(45, e.gamma)) / 45
      const rawY = Math.max(-45, Math.min(45, e.beta - 45)) / 45

      setTilt((prev) => ({
        tiltX: prev.tiltX + (rawX - prev.tiltX) * 0.22,
        tiltY: prev.tiltY + (rawY - prev.tiltY) * 0.22,
        isGyro: true,
      }))
    }

    // Pointer move handler for Desktop fallback
    const handlePointerMove = (e) => {
      if (hasGyro) return

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / centerX))
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / centerY))

      setTilt((prev) => ({
        tiltX: prev.tiltX + (normX - prev.tiltX) * 0.18,
        tiltY: prev.tiltY + (normY - prev.tiltY) * 0.18,
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

  // Function to request iOS 13+ Gyroscope permission
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
