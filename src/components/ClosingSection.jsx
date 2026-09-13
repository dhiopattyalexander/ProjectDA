import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SvgRose, SvgSparkle, SvgHeart, SvgCandle } from './Assets'
import { PHOTOS } from '../data/photos'
import styles from './ClosingSection.module.css'

function ConfettiFall({ style }) {
  return <div className={styles.confettiFall} style={style} />
}

function Petal({ style }) {
  return <div className={styles.petalFall} style={style} />
}

function SlidingPhotoCollage() {
  const row1Photos = [...PHOTOS, ...PHOTOS]
  const row2Photos = [...PHOTOS].reverse().concat([...PHOTOS].reverse())

  return (
    <div className={styles.collageBg}>
      <div className={styles.collageOverlay} />
      
      {/* Top marquee row */}
      <div className={`${styles.marqueeRow} ${styles.marqueeLeft}`}>
        {row1Photos.map((photo, i) => (
          <div
            key={`r1-${photo.id}-${i}`}
            className={styles.collageCard}
            style={{ '--rot': `${(i % 5) * 2 - 4}deg` }}
          >
            <img src={photo.src} alt={photo.title} className={styles.collageCardImg} loading="lazy" />
          </div>
        ))}
      </div>

      {/* Bottom marquee row */}
      <div className={`${styles.marqueeRow} ${styles.marqueeRight}`}>
        {row2Photos.map((photo, i) => (
          <div
            key={`r2-${photo.id}-${i}`}
            className={styles.collageCard}
            style={{ '--rot': `${(i % 5) * -2 + 3}deg` }}
          >
            <img src={photo.src} alt={photo.title} className={styles.collageCardImg} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ClosingSection() {
  const [confettis, setConfettis] = useState([])
  const [petals, setPetals] = useState([])
  const sectionRef = useRef(null)
  const triggered = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true

          const colors = [
            '#FFFFFF', '#F8F9FA', '#E9ECEF', '#7D1227',
            '#5E0F1F', '#9C1731', '#F7C4CE', '#FFFFFF',
          ]
          const newConfettis = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            style: {
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2.5 + Math.random() * 2.5}s`,
              background: colors[Math.floor(Math.random() * colors.length)],
              width: `${5 + Math.random() * 7}px`,
              height: `${5 + Math.random() * 7}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
            },
          }))
          setConfettis(newConfettis)

          const newPetals = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            style: {
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
              fontSize: `${0.8 + Math.random() * 0.8}rem`,
              opacity: 0.6 + Math.random() * 0.4,
            },
          }))
          setPetals(newPetals)
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="closing" ref={sectionRef} className={styles.section}>
      {/* Continuous Sliding Photo Collage Background */}
      <SlidingPhotoCollage />

      {confettis.map((c) => (
        <ConfettiFall key={c.id} style={c.style} />
      ))}

      {petals.map((p) => (
        <Petal key={p.id} style={p.style} />
      ))}

      <div className={styles.bgGlow} />
      <div className="noise-overlay" />

      {/* Candles row */}
      <motion.div
        className={styles.candlesRow}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, staggerChildren: 0.1 }}
        viewport={{ once: true }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <SvgCandle key={i} size={42} />
        ))}
      </motion.div>

      {/* Main wish */}
      <motion.div
        className={styles.mainWish}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
      >
        <p className={styles.wishPre}>Happy 25th Birthday</p>
        <h2 className={styles.wishName}>Kakak Sandra</h2>
        <div className={styles.wishDivider} />

        <motion.p
          className={styles.wishSubtext}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewport={{ once: true }}
        >
          Tetap humoris, tetap cantik, tetap ekstrovert yang paling ramai di ruangan —
          dan tetap jadi kakak terbaik yang pernah ada.
          <br /><br />
          <em>(Meski suka marah juga sih... tapi itu yang bikin kamu istimewa ❤️)</em>
        </motion.p>

        {/* Vector Rose & Sparkle Row */}
        <motion.div
          className={styles.roseRow}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
        >
          {[1, 2, 3, 4, 5].map((r, i) => (
            <span key={i} className={styles.roseEmoji} style={{ animationDelay: `${i * 0.15}s` }}>
              {i % 2 === 0 ? <SvgRose size={28} /> : <SvgSparkle size={24} />}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer signature */}
      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        viewport={{ once: true }}
      >
        <p className={styles.footerText}>
          Dibuat dengan <SvgHeart size={16} /> oleh adikmu — 14 September 2026
        </p>
        <div className={styles.footerDivider} />
        <p className={styles.footerSmall}>
          untuk Devyana Rahmalexandra · quarter century edition ✦
        </p>
      </motion.div>
    </section>
  )
}
