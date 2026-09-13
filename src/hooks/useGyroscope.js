import { useState, useEffect, useRef } from 'react'

/**
 * useGyroscope Hook
 * ─────────────────────────────────────────────────────────────
 * Tracks device tilt (mobile gyroscope), physical shake (device motion acceleration),
 * and mouse pointer (desktop fallback).
 */
export default function useGyroscope() {
  const [tilt, setTilt] = useState({
    tiltX: 0,
    tiltY: 0,
    shakeX: 0,
    shakeY: 0,
    isGyro: false,
  })

  const lastAccel = useRef({ x: 0, y: 0, z: 0, time: 0 })

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
        ...prev,
        tiltX: prev.tiltX + (rawX - prev.tiltX) * 0.2,
        tiltY: prev.tiltY + (rawY - prev.tiltY) * 0.2,
        isGyro: true,
      }))
    }

    // DeviceMotion handler for physical shake detection
    const handleMotion = (e) => {
      const accel = e.acceleration || e.accelerationIncludingGravity
      if (!accel || accel.x === null) return

      const now = Date.now()
      const dt = (now - lastAccel.current.time) / 1000
      if (dt > 0.04) {
        const dx = accel.x - (lastAccel.current.x || 0)
        const dy = accel.y - (lastAccel.current.y || 0)
        const dz = (accel.z || 0) - (lastAccel.current.z || 0)

        const delta = Math.hypot(dx, dy, dz)

        // Detect shake threshold
        if (delta > 8) {
          const shakeX = Math.max(-5, Math.min(5, dx * 0.6))
          const shakeY = Math.max(-5, Math.min(5, dy * 0.6))

          setTilt((prev) => ({
            ...prev,
            shakeX,
            shakeY,
          }))

          setTimeout(() => {
            setTilt((prev) => ({ ...prev, shakeX: 0, shakeY: 0 }))
          }, 200)
        }

        lastAccel.current = { x: accel.x, y: accel.y, z: accel.z || 0, time: now }
      }
    }

    // Pointer move handler for Desktop fallback
    const handlePointerMove = (e) => {
      if (hasGyro) return

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / centerX))
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / centerY))

      setTilt((prev) => ({
        ...prev,
        tiltX: prev.tiltX + (normX - prev.tiltX) * 0.15,
        tiltY: prev.tiltY + (normY - prev.tiltY) * 0.15,
        isGyro: false,
      }))
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    window.addEventListener('devicemotion', handleMotion, true)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
      window.removeEventListener('devicemotion', handleMotion, true)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  // Function to request iOS 13+ Gyroscope & Motion permission
  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission()
        if (
          typeof DeviceMotionEvent !== 'undefined' &&
          typeof DeviceMotionEvent.requestPermission === 'function'
        ) {
          await DeviceMotionEvent.requestPermission()
        }
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
