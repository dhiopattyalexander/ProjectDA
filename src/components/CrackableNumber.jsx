import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SvgSparkle, SvgHammer } from './Assets'
import styles from './CrackableNumber.module.css'

export default function CrackableNumber({
  externalCrackCount = 0,
  isExternallyRevealed = false,
  onManualCrack,
}) {
  const [clickCount, setClickCount] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [shockwave, setShockwave] = useState(false)

  const totalCracks = Math.min(clickCount + externalCrackCount, 3)
  const shouldReveal = isRevealed || isExternallyRevealed

  // External hammer impact trigger
  useEffect(() => {
    if (externalCrackCount > 0 && !shouldReveal) {
      triggerImpact()
    }
    if (isExternallyRevealed && !isRevealed) {
      triggerExplosion()
    }
  }, [externalCrackCount, isExternallyRevealed])

  const triggerImpact = () => {
    setShockwave(true)
    setTimeout(() => setShockwave(false), 400)
  }

  const triggerExplosion = () => {
    if (isExploding || isRevealed) return
    setIsExploding(true)
    setShockwave(true)

    setTimeout(() => {
      setIsRevealed(true)
      setIsExploding(false)
      setShockwave(false)
    }, 700)
  }

  const handleClick = () => {
    if (shouldReveal || isExploding || totalCracks >= 3) return
    const next = clickCount + 1
    setClickCount(next)
    triggerImpact()
    if (next + externalCrackCount >= 3) {
      triggerExplosion()
    }
    onManualCrack?.(next, next + externalCrackCount >= 3)
  }

  return (
    <div className={styles.wrapper}>
      <AnimatePresence mode="wait">
        {!shouldReveal ? (
          <div
            key="number-24-container"
            className={`${styles.numberBox} ${shockwave ? styles.shockImpact : ''}`}
            onClick={handleClick}
          >
            {/* Impact Shockwave Ring */}
            {shockwave && <div className={styles.shockwaveRing} />}

            {/* Revealed 25 lurking underneath */}
            <div className={styles.underNumber}>25</div>

            {/* Crackable 24 Overlay */}
            <div className={`${styles.overlay24} ${isExploding ? styles.shatterAnim : ''}`}>
              <span className={styles.digits}>24</span>

              {/* Hardware Accelerated SVG Crack Lines */}
              {totalCracks >= 1 && (
                <svg className={styles.crackLayer} viewBox="0 0 200 120">
                  <path
                    d="M 65 10 L 85 45 L 70 85 M 130 20 L 115 60 L 135 100"
                    stroke="#FFD700"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    className={styles.crackLine}
                  />
                </svg>
              )}

              {totalCracks >= 2 && (
                <svg className={styles.crackLayer} viewBox="0 0 200 120">
                  <path
                    d="M 40 30 L 60 55 L 45 95 M 150 15 L 135 50 L 155 90 M 95 5 L 80 40 L 95 70 L 78 110"
                    stroke="#FF4D6D"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className={styles.crackLineDeep}
                  />
                </svg>
              )}
            </div>

            {/* 3D Shattered Shards during explosion */}
            {isExploding && (
              <div className={styles.shardsContainer}>
                <div className={`${styles.shardPiece} ${styles.shardTL}`}>2</div>
                <div className={`${styles.shardPiece} ${styles.shardTR}`}>4</div>
                <div className={`${styles.shardPiece} ${styles.shardBL}`}>2</div>
                <div className={`${styles.shardPiece} ${styles.shardBR}`}>4</div>
              </div>
            )}

            {/* Action Tip */}
            {totalCracks === 0 && (
              <div className={styles.actionTip}>
                <SvgHammer size={20} />
                <span>Seret palu ke angka ini!</span>
              </div>
            )}
            {totalCracks > 0 && totalCracks < 3 && (
              <div className={styles.actionTipHigh}>
                <SvgSparkle size={18} />
                <span>Pukul {3 - totalCracks}x lagi!</span>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            key="number-25-revealed"
            className={styles.revealedBox}
            initial={{ scale: 0.2, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Radiant aura background */}
            <div className={styles.revealedAura} />
            <div className={styles.number25Glow}>25</div>

            <motion.p
              className={styles.subtext}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              ✦ Selamat Memasuki Umur 25, Kak Sandra! ✦
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
