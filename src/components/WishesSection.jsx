import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { SvgEnvelope, SvgRose, SvgHeart } from './Assets'
import useGyroscope from '../hooks/useGyroscope'
import styles from './WishesSection.module.css'

const LETTER_PARAGRAPHS = [
  { text: 'Kakak Sandra,', type: 'salutation' },
  {
    text: 'Aku selalu percaya bahwa orang yang paling kuat adalah yang diam-diam menyimpan beban sendiri — tapi tetap hadir, tetap mengulurkan tangan, ketika orang yang dicintainya membutuhkan.',
    type: 'body',
  },
  {
    text: 'Dan itu kamu, Kak. Di saat aku paling rapuh, di saat duniaku terasa sempit — kamu selalu ada. Bukan dengan kata-kata besar, tapi dengan kehadiran yang nyata. Padahal aku tahu, kamu sendiri pun sedang berjuang.',
    type: 'body',
  },
  {
    text: 'Makasih juga sudah membawa aku mengenal dunia yang lebih luas. Banyak hal baru yang aku rasakan, banyak tempat yang aku kunjungi — semua berawal dari kamu yang mau berbagi. Kamu selalu mau mengajakku, meski kamu sendiri baru mencobanya juga.',
    type: 'body',
  },
  {
    text: 'Itu yang bikin kamu spesial, Kak — kamu tidak menunggu sempurna dulu untuk berbagi kebahagiaan.',
    type: 'body',
  },
  {
    text: 'Di hari ulang tahunmu yang ke-25 ini, satu hal yang paling aku harapkan:',
    type: 'body',
  },
  {
    text: 'Semoga kamu — yang selalu membahagiakan orang lain — juga merasakan kebahagiaan yang sama, bahkan lebih. Kamu layak mendapatkan yang terbaik, Kak Sandra.',
    type: 'body',
  },
  { text: 'Selamat ulang tahun, Kakak tercinta. 🌹', type: 'closing' },
  { text: 'Love you always — Adikmu 💕', type: 'signature' },
]

// Pure Letter-by-Letter Single Character Typewriter Component
function SingleCharTypewriter({ text, isActive, isDone, onComplete, speed = 28 }) {
  const [charCount, setCharCount] = useState(isDone ? text.length : 0)
  const onCompleteRef = useRef(onComplete)

  // Keep ref updated to latest callback without triggering effect re-run
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (isDone) {
      setCharCount(text.length)
      return
    }
    if (!isActive) {
      setCharCount(0)
      return
    }

    setCharCount(0)
    let current = 0
    const timer = setInterval(() => {
      current++
      setCharCount(current)
      if (current >= text.length) {
        clearInterval(timer)
        setTimeout(() => {
          onCompleteRef.current?.()
        }, 250)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [isActive, isDone, text, speed])

  const visibleText = text.slice(0, charCount)
  const isTypingHere = isActive && !isDone && charCount < text.length

  return (
    <span className={styles.typeText}>
      {visibleText}
      {isTypingHere && <span className={styles.cursor}>|</span>}
    </span>
  )
}

export default function WishesSection({ isActive = false }) {
  const [visible, setVisible] = useState(false)
  const [activeLine, setActiveLine] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const sectionRef = useRef(null)
  const { tiltX, tiltY } = useGyroscope()

  useEffect(() => {
    if (isActive && !visible) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 450)
      return () => clearTimeout(timer)
    }
  }, [isActive, visible])

  return (
    <section id="wishes" ref={sectionRef} className={styles.section}>
      <div className={styles.bgDeco1} />
      <div className={styles.bgDeco2} />
      <div className="noise-overlay" />

      {/* Header with 3D Gyro Tilt */}
      <motion.div
        className={styles.header}
        style={{
          transform: `perspective(800px) rotateY(${tiltX * 10}deg) rotateX(${-tiltY * 8}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p className={styles.preLabel}>
          <SvgEnvelope size={18} /> Surat untuk Kakak
        </p>
        <h2 className={styles.title}>
          Dari Adikmu,<br /><em>Dengan Sepenuh Hati</em>
        </h2>
      </motion.div>

      {/* Letter Card with Gyro Parallax Tilt */}
      <motion.div
        className={styles.letterCard}
        style={{
          transform: `perspective(900px) rotateY(${tiltX * 12}deg) rotateX(${-tiltY * 10}deg)`,
          transition: 'transform 0.12s ease-out',
        }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
      >
        {/* Wax Seal */}
        <div className={styles.waxSeal}>
          <SvgHeart size={18} color="#FFD700" />
        </div>

        {/* Letter Paragraphs */}
        <div className={styles.letterContent}>
          {visible &&
            LETTER_PARAGRAPHS.map((line, idx) => {
              const isLineActive = idx === activeLine && !showAll
              const isLineDone = idx < activeLine || showAll

              if (!isLineActive && !isLineDone) return null

              return (
                <div key={idx} className={`${styles.letterLine} ${styles[line.type]}`}>
                  <SingleCharTypewriter
                    text={line.text}
                    isActive={isLineActive}
                    isDone={isLineDone}
                    onComplete={() => setActiveLine((prev) => prev + 1)}
                    speed={28}
                  />
                </div>
              )
            })}
        </div>

        {/* Quick reveal button */}
        {!showAll && activeLine < LETTER_PARAGRAPHS.length && (
          <button
            className={styles.showAllBtn}
            onClick={() => setShowAll(true)}
          >
            ✦ Tampilkan Semua Teks
          </button>
        )}

        <span className={`${styles.cornerRose} ${styles.topLeft}`}>
          <SvgRose size={26} />
        </span>
        <span className={`${styles.cornerRose} ${styles.bottomRight}`}>
          <SvgRose size={26} />
        </span>
      </motion.div>
    </section>
  )
}
