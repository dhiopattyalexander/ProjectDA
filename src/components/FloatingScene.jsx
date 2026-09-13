import { useMemo } from 'react'
import { SvgSparkle, SvgRose } from './Assets'
import useGyroscope from '../hooks/useGyroscope'
import styles from './HeroSection.module.css'

/**
 * Lightweight, 60FPS Hardware-Accelerated Ambient Floating Scene
 * Replaces heavy WebGL shaders with pure CSS hardware-accelerated elements.
 */
export default function FloatingScene() {
  const { tiltX, tiltY } = useGyroscope()

  // Generate lightweight ambient elements once
  const floaters = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${(i * 8.5 + 4) % 92}%`,
      top: `${(i * 11 + 10) % 85}%`,
      delay: `${(i * 0.4) % 3}s`,
      dur: `${4 + (i % 4)}s`,
      size: i % 2 === 0 ? 16 : 22,
      type: i % 3 === 0 ? 'rose' : 'sparkle',
    }))
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: `translate3d(${tiltX * -15}px, ${tiltY * -12}px, 0)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Background ambient radial lighting */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '60vh',
          background: 'radial-gradient(circle, rgba(125, 18, 39, 0.35) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating particles */}
      {floaters.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.left,
            top: item.top,
            animation: `float ${item.dur} ease-in-out infinite ${item.delay}`,
            opacity: 0.5,
          }}
        >
          {item.type === 'rose' ? (
            <SvgRose size={item.size} />
          ) : (
            <SvgSparkle size={item.size} color="#FFFFFF" />
          )}
        </div>
      ))}
    </div>
  )
}
