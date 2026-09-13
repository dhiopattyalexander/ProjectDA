import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SvgSparkle, SvgRose, SvgHeart } from './Assets'
import styles from './LockScreen.module.css'

// Particle class for canvas
class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = Math.random() * 2.5 + 0.5
    this.speedX = (Math.random() - 0.5) * 0.4
    this.speedY = (Math.random() - 0.5) * 0.4 - 0.2
    const types = ['gold', 'maroon', 'blush']
    this.type = types[Math.floor(Math.random() * types.length)]
    this.opacity = Math.random() * 0.7 + 0.3
    this.opacityDir = (Math.random() - 0.5) * 0.01
    this.isGlitter = Math.random() > 0.7
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.opacity += this.opacityDir
    if (this.opacity > 1 || this.opacity < 0.1) this.opacityDir *= -1
    if (
      this.y < -10 || this.y > this.canvas.height + 10 ||
      this.x < -10 || this.x > this.canvas.width + 10
    ) this.reset()
  }

  draw(ctx) {
    const colors = {
      gold:   `rgba(255, 215, 0, ${this.opacity})`,
      maroon: `rgba(169, 22, 42, ${this.opacity})`,
      blush:  `rgba(245, 194, 199, ${this.opacity})`,
    }
    ctx.beginPath()
    if (this.isGlitter) {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(Date.now() * 0.001)
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(
          Math.cos((i * Math.PI) / 2) * this.size * 2,
          Math.sin((i * Math.PI) / 2) * this.size * 2
        )
        ctx.lineTo(
          Math.cos((i * Math.PI) / 2 + Math.PI / 4) * this.size * 0.8,
          Math.sin((i * Math.PI) / 2 + Math.PI / 4) * this.size * 0.8
        )
      }
      ctx.closePath()
      ctx.fillStyle = colors[this.type]
      ctx.fill()
      ctx.restore()
    } else {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = colors[this.type]
      ctx.fill()
    }
  }
}

import useGyroscope from '../hooks/useGyroscope'

export default function LockScreen({ onUnlock }) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const { requestPermission } = useGyroscope()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 45 }, () => new Particle(canvas))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.update()
        p.draw(ctx)
      })
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const handleUnlock = async () => {
    if (isUnlocking) return
    if (requestPermission) {
      await requestPermission()
    }
    setIsUnlocking(true)
    setTimeout(onUnlock, 1200)
  }

  return (
    <AnimatePresence>
      {!isUnlocking ? (
        <motion.div
          key="lock"
          className={styles.lockScreen}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <canvas ref={canvasRef} className="particles-canvas" />
          <div className="noise-overlay" />
          <div className={styles.bgGradient} />

          <div className={styles.roseTop}><SvgRose size={36} /></div>
          <div className={styles.roseBottom}><SvgRose size={36} /></div>

          <div className={styles.centerContent}>
            <motion.div
              className={styles.dateBadge}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <span>14 September 2026</span>
            </motion.div>

            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Untuk
              <br />
              <span className={styles.titleName}>Kakak Sandra</span>
            </motion.h1>

            <motion.div
              className={styles.divider}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />

            <motion.button
              id="unlock-btn"
              className={styles.unlockBtn}
              onClick={handleUnlock}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.btnRipple} />
              <SvgSparkle size={20} color="#1A0409" />
              <span className={styles.btnText}>Buka Hadiahmu</span>
            </motion.button>

            <motion.p
              className={styles.hint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              Kalo penasarann, coba bukaa ✦
            </motion.p>
          </div>

          <motion.div
            className={styles.sparkleRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            {[1, 2, 3, 4, 5].map((s, i) => (
              <span key={i} className={styles.sparkleItem} style={{ animationDelay: `${i * 0.15}s` }}>
                <SvgSparkle size={18} />
              </span>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="unlocking"
          className={styles.curtainContainer}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className={`${styles.curtain} ${styles.curtainLeft}`}
            animate={{ x: '-100%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className={`${styles.curtain} ${styles.curtainRight}`}
            animate={{ x: '100%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
