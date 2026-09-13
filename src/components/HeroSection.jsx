import { useRef, useState, useEffect, useCallback } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useVelocity, useSpring, useTransform
} from 'framer-motion'
import FloatingScene from './FloatingScene'
import CrackableNumber from './CrackableNumber'
import { SvgHammer, SvgSparkle, SvgRose, SvgHeart } from './Assets'
import useGyroscope from '../hooks/useGyroscope'
import { PHOTOS } from '../data/photos'
import styles from './HeroSection.module.css'

function JellyDraggable({
  children,
  className,
  style,
  initialRotate = 0,
  onDrag,
  onDragEnd,
  dragMomentum = true,
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xVelocity = useVelocity(x)
  const yVelocity = useVelocity(y)

  const rawSkewX = useTransform(xVelocity, [-3000, 0, 3000], [-20, 0, 20])
  const rawSkewY = useTransform(yVelocity, [-3000, 0, 3000], [-14, 0, 14])
  const skewX = useSpring(rawSkewX, { stiffness: 280, damping: 22 })
  const skewY = useSpring(rawSkewY, { stiffness: 280, damping: 22 })

  const rawRotateZ = useTransform(
    xVelocity,
    [-2500, 0, 2500],
    [-10 + initialRotate, initialRotate, 10 + initialRotate]
  )
  const rotateZ = useSpring(rawRotateZ, { stiffness: 180, damping: 20 })

  const rawScaleX = useTransform(xVelocity, [-2500, 0, 2500], [1.08, 1, 1.08])
  const rawScaleY = useTransform(yVelocity, [-2500, 0, 2500], [0.92, 1, 0.92])
  const scaleX = useSpring(rawScaleX, { stiffness: 300, damping: 18 })
  const scaleY = useSpring(rawScaleY, { stiffness: 300, damping: 18 })

  const rawRotateY = useTransform(xVelocity, [-3000, 0, 3000], [-20, 0, 20])
  const rawRotateX = useTransform(yVelocity, [-3000, 0, 3000], [12, 0, -12])
  const rotateY = useSpring(rawRotateY, { stiffness: 220, damping: 25 })
  const rotateX = useSpring(rawRotateX, { stiffness: 220, damping: 25 })

  return (
    <motion.div
      drag
      dragMomentum={dragMomentum}
      dragElastic={0.12}
      style={{
        x, y,
        skewX, skewY,
        rotateZ, rotateX, rotateY,
        scaleX, scaleY,
        transformStyle: 'preserve-3d',
        perspective: '600px',
        ...style,
      }}
      className={className}
      whileDrag={{ zIndex: 100, cursor: 'grabbing', scale: 1.05 }}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      {children}
    </motion.div>
  )
}

function PhysicsHammer({ onCollisionCheck }) {
  const hammerRef = useRef(null)
  const physicsRef = useRef({
    x: 50,
    y: 120,
    vx: 0,
    vy: 0,
    rot: -20,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    lastMouse: { x: 0, y: 0, time: 0 },
  })

  useEffect(() => {
    let animId
    const GRAVITY = 0.55
    const BOUNCE = 0.62
    const FRICTION = 0.985
    const RESTITUTION_ROT = 0.94

    const updatePhysics = () => {
      const p = physicsRef.current
      const container = hammerRef.current?.parentElement

      if (container && !p.isDragging) {
        const bounds = container.getBoundingClientRect()
        const hammerWidth = 100
        const hammerHeight = 100
        const floorY = bounds.height - hammerHeight - 60
        const minX = 10
        const maxX = bounds.width - hammerWidth - 10

        p.vy += GRAVITY
        p.vx *= FRICTION
        p.vy *= FRICTION

        p.x += p.vx
        p.y += p.vy

        p.rot += p.vx * 0.4
        p.rot *= RESTITUTION_ROT

        if (p.y >= floorY) {
          p.y = floorY
          p.vy = -p.vy * BOUNCE
          p.vx *= 0.8
          if (Math.abs(p.vy) < 1) p.vy = 0
        }

        if (p.y < 20) {
          p.y = 20
          p.vy = Math.abs(p.vy) * BOUNCE
        }

        if (p.x <= minX) {
          p.x = minX
          p.vx = Math.abs(p.vx) * BOUNCE
        } else if (p.x >= maxX) {
          p.x = maxX
          p.vx = -Math.abs(p.vx) * BOUNCE
        }

        // Direct DOM transform mutation (0 React re-renders)
        if (hammerRef.current) {
          const skewX = Math.max(-25, Math.min(25, p.vx * 0.6))
          const scaleY = 1 - Math.min(0.2, Math.abs(p.vy) * 0.012)
          hammerRef.current.style.left = `${p.x}px`
          hammerRef.current.style.top = `${p.y}px`
          hammerRef.current.style.transform = `rotate(${p.rot}deg) skewX(${skewX}deg) scaleY(${scaleY})`
        }
      }

      animId = requestAnimationFrame(updatePhysics)
    }

    animId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animId)
  }, [])

  const handlePointerDown = (e) => {
    const p = physicsRef.current
    p.isDragging = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    p.dragStart = { x: clientX - p.x, y: clientY - p.y }
    p.lastMouse = { x: clientX, y: clientY, time: Date.now() }
    p.vx = 0
    p.vy = 0
  }

  const handlePointerMove = useCallback((e) => {
    const p = physicsRef.current
    if (!p.isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const now = Date.now()
    const dt = Math.max(1, now - p.lastMouse.time)

    p.vx = ((clientX - p.lastMouse.x) / dt) * 16
    p.vy = ((clientY - p.lastMouse.y) / dt) * 16

    p.x = clientX - p.dragStart.x
    p.y = clientY - p.dragStart.y

    p.lastMouse = { x: clientX, y: clientY, time: now }

    if (hammerRef.current) {
      const skewX = Math.max(-25, Math.min(25, p.vx * 0.6))
      const scaleY = 1 - Math.min(0.2, Math.abs(p.vy) * 0.012)
      hammerRef.current.style.left = `${p.x}px`
      hammerRef.current.style.top = `${p.y}px`
      hammerRef.current.style.transform = `rotate(${p.rot}deg) skewX(${skewX}deg) scaleY(${scaleY})`
    }

    if (onCollisionCheck) {
      onCollisionCheck(clientX, clientY)
    }
  }, [onCollisionCheck])

  const handlePointerUp = useCallback(() => {
    const p = physicsRef.current
    p.isDragging = false
  }, [])

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e)
    const onUp = () => handlePointerUp()

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [handlePointerMove, handlePointerUp])

  const p = physicsRef.current
  const skewX = Math.max(-25, Math.min(25, p.vx * 0.6))
  const scaleY = 1 - Math.min(0.2, Math.abs(p.vy) * 0.012)

  return (
    <div
      ref={hammerRef}
      className={styles.hammer}
      style={{
        position: 'absolute',
        left: `${p.x}px`,
        top: `${p.y}px`,
        transform: `rotate(${p.rot}deg) skewX(${skewX}deg) scaleY(${scaleY})`,
        zIndex: 15,
        cursor: p.isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
    >
      <div className={styles.hammerInner}>
        <SvgHammer size={52} />
        <div className={styles.hammerGlow} />
        <div className={styles.hammerLabel}>seret palu ini!</div>
      </div>
    </div>
  )
}

function useCountdown() {
  const [state, setState] = useState({ isToday: false, text: '' })
  useEffect(() => {
    const update = () => {
      const now   = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const bDay  = new Date(2026, 8, 14)
      if (today.getTime() === bDay.getTime()) {
        const elapsed = now - new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const hours   = Math.floor(elapsed / 3600000)
        const mins    = Math.floor((elapsed % 3600000) / 60000)
        setState({ isToday: true, text: `Hari ini! sudah ${hours} jam ${mins} menit` })
      } else if (today < bDay) {
        const diff = bDay - now
        const days = Math.floor(diff / 86400000)
        const hrs  = Math.floor((diff % 86400000) / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)
        setState({ isToday: false, text: days > 0 ? `${days} hari ${hrs} jam lagi` : `${hrs} jam ${mins} menit lagi` })
      } else {
        setState({ isToday: false, text: 'Selamat ulang tahun ke-25!' })
      }
    }
    update()
    const iv = setInterval(update, 30000)
    return () => clearInterval(iv)
  }, [])
  return state
}

function DVDBouncingPhotos({ tiltX = 0, tiltY = 0 }) {
  const containerRef = useRef(null)
  const cardRefs = useRef([])
  const itemsRef = useRef([
    { id: 1, src: PHOTOS[0].src, title: PHOTOS[0].title, accentColor: PHOTOS[0].accentColor, x: 40, y: 70, vx: 1.5, vy: 1.2, rot: -4 },
    { id: 2, src: PHOTOS[2].src, title: PHOTOS[2].title, accentColor: PHOTOS[2].accentColor, x: 200, y: 220, vx: -1.3, vy: 1.6, rot: 5 },
    { id: 3, src: PHOTOS[4].src, title: PHOTOS[4].title, accentColor: PHOTOS[4].accentColor, x: 100, y: 380, vx: 1.6, vy: -1.4, rot: -2 },
  ])

  const gyroRef = useRef({ tiltX, tiltY })
  useEffect(() => {
    gyroRef.current = { tiltX, tiltY }
  }, [tiltX, tiltY])

  useEffect(() => {
    let animId
    const cardWidth = 90
    const cardHeight = 120

    const update = () => {
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        const boundsW = rect.width || window.innerWidth
        const boundsH = rect.height || window.innerHeight

        const { tiltX, tiltY } = gyroRef.current

        itemsRef.current.forEach((item, idx) => {
          // Accelerate based on gyroscope tilt
          item.vx += tiltX * 0.08
          item.vy += tiltY * 0.08

          // Dynamic speed limits
          const maxSpeed = 3.5
          const minSpeed = 0.8

          const speed = Math.hypot(item.vx, item.vy)
          if (speed > maxSpeed) {
            item.vx = (item.vx / speed) * maxSpeed
            item.vy = (item.vy / speed) * maxSpeed
          } else if (speed < minSpeed) {
            item.vx = item.vx >= 0 ? minSpeed : -minSpeed
            item.vy = item.vy >= 0 ? minSpeed : -minSpeed
          }

          item.x += item.vx
          item.y += item.vy

          // DVD Screensaver bounce logic
          const maxX = Math.max(100, boundsW - cardWidth)
          const maxY = Math.max(100, boundsH - cardHeight)

          if (item.x <= 10) {
            item.x = 10
            item.vx = Math.abs(item.vx)
            item.rot = -item.rot
          } else if (item.x >= maxX - 10) {
            item.x = maxX - 10
            item.vx = -Math.abs(item.vx)
            item.rot = -item.rot
          }

          if (item.y <= 10) {
            item.y = 10
            item.vy = Math.abs(item.vy)
          } else if (item.y >= maxY - 10) {
            item.y = maxY - 10
            item.vy = -Math.abs(item.vy)
          }

          // Direct DOM transform mutation with 3D tilt (0 React re-renders)
          const el = cardRefs.current[idx]
          if (el) {
            el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotateY(${tiltX * 12}deg) rotateX(${-tiltY * 10}deg) rotate(${item.rot}deg)`
          }
        })
      }
      animId = requestAnimationFrame(update)
    }

    animId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div ref={containerRef} className={styles.dvdLayer}>
      {itemsRef.current.map((item, idx) => (
        <div
          key={item.id}
          ref={(el) => (cardRefs.current[idx] = el)}
          className={styles.dvdCard}
          style={{
            transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rot}deg)`,
            '--accentColor': item.accentColor,
          }}
        >
          <div className={styles.dvdImgWrapper}>
            <img src={item.src} alt="Photo" className={styles.dvdImg} draggable={false} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HeroSection() {
  const numberRef = useRef(null)
  const countdown = useCountdown()
  const { tiltX, tiltY } = useGyroscope()

  const [crackCount, setCrackCount] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const lastHitTime = useRef(0)
  const [showImpact, setShowImpact] = useState(false)
  const [impactPos, setImpactPos] = useState({ x: 0, y: 0 })

  const checkHammerCollision = useCallback((px, py) => {
    if (isRevealed || crackCount >= 3) return
    const now = Date.now()
    if (now - lastHitTime.current < 500) return
    if (!numberRef.current) return

    const rect = numberRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.hypot(px - cx, py - cy)

    if (dist < 140) {
      lastHitTime.current = now
      setImpactPos({ x: px, y: py })
      setShowImpact(true)
      setTimeout(() => setShowImpact(false), 450)
      setCrackCount((prev) => {
        const next = prev + 1
        if (next >= 3) setTimeout(() => setIsRevealed(true), 300)
        return next
      })
    }
  }, [isRevealed, crackCount])

  return (
    <section id="hero" className={styles.hero}>
      {/* 3D scene background */}
      <div className={styles.sceneWrapper}>
        <FloatingScene />
      </div>
      <div className={styles.vignette} />
      <div className="noise-overlay" />

      {/* Floating DVD Bouncing 3 Photos with Gyro Tilt Physics */}
      <DVDBouncingPhotos tiltX={tiltX} tiltY={tiltY} />

      {/* Gyroscope-driven Parallax Decorators */}
      <div
        className={styles.sparkleRing}
        style={{
          top: '14%',
          right: '11%',
          transform: `translate(${tiltX * -25}px, ${tiltY * -20}px)`,
        }}
      >
        <SvgSparkle size={18} />
      </div>
      <div
        className={styles.sparkleRing}
        style={{
          bottom: '19%',
          left: '9%',
          transform: `translate(${tiltX * 30}px, ${tiltY * 20}px)`,
        }}
      >
        <SvgSparkle size={20} />
      </div>
      <div
        className={styles.sparkleRingLg}
        style={{
          top: '44%',
          left: '1.5%',
          transform: `translate(${tiltX * -15}px, ${tiltY * -15}px)`,
        }}
      >
        <SvgRose size={26} />
      </div>
      <div
        className={styles.sparkleRingLg}
        style={{
          bottom: '30%',
          right: '1%',
          transform: `translate(${tiltX * 25}px, ${tiltY * 15}px)`,
        }}
      >
        <SvgHeart size={22} />
      </div>

      {/* JELLY PHOTO */}
      <JellyDraggable
        className={styles.draggablePhoto}
        style={{ position: 'absolute', top: 'clamp(4rem, 10vh, 7rem)', right: 'clamp(0.4rem, 3.5vw, 2rem)', zIndex: 10 }}
        initialRotate={5}
        dragMomentum
      >
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className={styles.photoInner}
        >
          <div className={styles.photoFrame}>
            <img src="/photos/sandra1.jpeg" alt="Kakak Sandra" className={styles.photoImg}
              draggable={false}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.classList.add(styles.photoPlaceholder)
              }}
            />
            <div className={styles.photoGlow} />
          </div>
          <p className={styles.photoCaption}>Kakak Sandra</p>
          <div className={styles.photoDragHint}>seret aku!</div>
        </motion.div>
      </JellyDraggable>

      {/* PHYSICS HAMMER */}
      <PhysicsHammer onCollisionCheck={checkHammerCollision} />

      {/* Impact flash */}
      <AnimatePresence>
        {showImpact && (
          <motion.div key="impact" className={styles.impactFlash}
            style={{ left: impactPos.x, top: impactPos.y }}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.4 }}
          >
            <SvgSparkle size={48} color="#FFD700" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO CONTENT with Gyroscope tilt transform */}
      <div
        className={styles.content}
        style={{
          transform: `perspective(1000px) rotateY(${tiltX * 8}deg) rotateX(${-tiltY * 6}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <motion.div className={styles.topLabel}
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}>
          <span className={styles.labelDot} />
          Sebuah Hadiah Kecil Untukmu
          <span className={styles.labelDot} />
        </motion.div>

        <div className={styles.text3dWrapper}>
          <p className={styles.greeting}>
            {'Selamat Ulang Tahun'.split(' ').map((word, i) => (
              <span key={i} className={styles.text3dWord}
                style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
                {word}{i < 2 ? '\u00A0' : ''}
              </span>
            ))}
          </p>
          <p className={styles.ageLabel} style={{ animation: 'text3d-enter 0.8s 0.95s both' }}>
            untuk umur yang ke
          </p>
        </div>

        {/* Crackable number */}
        <div ref={numberRef}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}>
            <CrackableNumber
              externalCrackCount={crackCount}
              isExternallyRevealed={isRevealed}
              onManualCrack={(count, revealed) => {
                setCrackCount(count)
                if (revealed) setIsRevealed(true)
              }}
            />
          </motion.div>
        </div>

        {/* Name */}
        <motion.h1 className={styles.name}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}>
          Devyana Rahmalexandra
        </motion.h1>

        {/* Countdown */}
        <motion.div
          className={`${styles.countdownBadge} ${countdown.isToday ? styles.countdownToday : ''}`}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}>
          <SvgSparkle size={14} /> {countdown.text}
        </motion.div>

        {/* Scroll cue */}
        <motion.div className={styles.scrollCue}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}>
          <div className={styles.scrollLine} />
          <span>Scroll untuk melihat lebih</span>
          <div className={styles.scrollLine} />
        </motion.div>
      </div>
    </section>
  )
}
