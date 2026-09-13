import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { SvgSparkle, SvgRose } from './Assets'
import useGyroscope from '../hooks/useGyroscope'
import styles from './Gallery3D.module.css'
import { PHOTOS } from '../data/photos'

// 3D Background Particles
function Background3DParticles() {
  const meshRef = useRef()
  const count = 80
  const positions = useRef(
    new Float32Array(count * 3).map((_, i) =>
      i % 3 === 2 ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 10
    )
  )

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.04
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.05
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#FFFFFF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export default function Gallery3D({ onNextPage, onPrevPage, initialPhotoIndex = 0, isActive = false }) {
  const [photoIndex, setPhotoIndex] = useState(initialPhotoIndex)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 800))
  const isCooldown = useRef(false)
  const touchStartPos = useRef(0)

  const { tiltX, tiltY } = useGyroscope()

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate card parameters depending on screen size
  const cardWidth = windowWidth <= 480 ? 230 : windowWidth <= 768 ? 260 : 300
  const gap = windowWidth <= 480 ? 12 : 16
  const stride = cardWidth + gap
  const halfCard = cardWidth / 2

  const navigatePhoto = useCallback((direction) => {
    if (isCooldown.current) return
    isCooldown.current = true
    setTimeout(() => {
      isCooldown.current = false
    }, 450)

    if (direction > 0) {
      if (photoIndex < PHOTOS.length - 1) {
        setPhotoIndex((prev) => prev + 1)
      } else if (onNextPage) {
        onNextPage()
      }
    } else if (direction < 0) {
      if (photoIndex > 0) {
        setPhotoIndex((prev) => prev - 1)
      } else if (onPrevPage) {
        onPrevPage()
      }
    }
  }, [photoIndex, onNextPage, onPrevPage])

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 15) return
      navigatePhoto(e.deltaY > 0 ? 1 : -1)
    }

    const handleTouchStart = (e) => {
      touchStartPos.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      const touchEndPos = e.changedTouches[0].clientY
      const diff = touchStartPos.current - touchEndPos
      if (Math.abs(diff) > 40) {
        navigatePhoto(diff > 0 ? 1 : -1)
      }
    }

    const el = document.getElementById('gallery-page-container')
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false })
      el.addEventListener('touchstart', handleTouchStart, { passive: true })
      el.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      if (el) {
        el.removeEventListener('wheel', handleWheel)
        el.removeEventListener('touchstart', handleTouchStart)
        el.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [navigatePhoto])

  return (
    <div id="gallery-page-container" className={styles.stickyInner}>
      {/* 3D Canvas - Only active when Gallery page is currently open */}
      {isActive && (
        <div className={styles.canvasContainer}>
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <pointLight position={[2, 3, 4]} intensity={1.2} color="#FFFFFF" />
              <Background3DParticles />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Header with 3D Gyroscope Perspective */}
      <div
        className={styles.header}
        style={{
          transform: `perspective(800px) rotateY(${tiltX * 12}deg) rotateX(${-tiltY * 10}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <motion.p
          className={styles.preLabel}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✦ GALERI FOTO ✦
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Momen Berharga <em>Kakak Sandra</em>
        </motion.h2>
        <p className={styles.scrollTip}>
          {photoIndex < PHOTOS.length - 1
            ? '↓ Scroll / Usap kebawah untuk foto selanjutnya →'
            : '✦ Terakhir! Scroll sekali lagi untuk ke Surat Harapan'}
        </p>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${Math.round(((photoIndex + 1) / PHOTOS.length) * 100)}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {photoIndex + 1} / {PHOTOS.length} Foto
        </span>
      </div>

      {/* 3D Track Viewport with Gyro Tilt */}
      <div
        className={styles.trackViewport}
        style={{
          transform: `perspective(1000px) rotateY(${tiltX * 14}deg) rotateX(${-tiltY * 10}deg)`,
          transition: 'transform 0.12s ease-out',
        }}
      >
        {/* Navigation Arrows for Mobile & Touch */}
        {photoIndex > 0 && (
          <button
            className={styles.navArrowLeft}
            onClick={() => navigatePhoto(-1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
        )}
        {photoIndex < PHOTOS.length - 1 && (
          <button
            className={styles.navArrowRight}
            onClick={() => navigatePhoto(1)}
            aria-label="Next photo"
          >
            ›
          </button>
        )}

        <div
          className={styles.track}
          style={{
            transform: `translate3d(calc(50vw - ${halfCard}px - ${photoIndex * stride}px), 0, 0)`,
          }}
        >
          {PHOTOS.map((photo, index) => {
            const isCentered = index === photoIndex
            const dist = index - photoIndex
            const rotateY = dist * -22
            const scale = isCentered ? 1.08 : Math.max(0.8, 1 - Math.abs(dist) * 0.15)
            const opacity = isCentered ? 1 : Math.max(0.4, 1 - Math.abs(dist) * 0.3)

            return (
              <motion.div
                key={photo.id}
                className={`${styles.card3d} ${isCentered ? styles.cardActive : ''}`}
                style={{
                  transform: `perspective(1000px) rotateY(${rotateY + tiltX * 8}deg) rotateX(${-tiltY * 6}deg) scale(${scale})`,
                  opacity,
                }}
                whileHover={isCentered ? { scale: scale * 1.04 } : {}}
                whileTap={isCentered ? { scale: 0.96 } : {}}
                onClick={() => {
                  if (isCentered) setSelectedPhoto(photo)
                  else setPhotoIndex(index)
                }}
              >
                <div className={styles.cardFrame}>
                  <div className={styles.photoContainer}>
                    <img
                      src={photo.src}
                      alt={`Foto #${photo.id}`}
                      className={styles.photoImg}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className={styles.photoPlaceholder} style={{ display: 'none' }}>
                      <SvgRose size={32} />
                      <span>Foto #{photo.id}</span>
                    </div>

                    <div className={styles.photoBadge} style={{ borderColor: photo.accentColor }}>
                      <span>#{photo.id}</span>
                    </div>
                  </div>

                  <div className={styles.cardCleanFooter}>
                    <SvgSparkle size={18} color="#FFFFFF" />
                    <button className={styles.inspectBtn}>
                      Perbesar
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className={styles.dotsRow}>
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.id}
            className={`${styles.dot} ${i === photoIndex ? styles.dotActive : ''}`}
            onClick={() => setPhotoIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.modalCloseBtn}
                onClick={() => setSelectedPhoto(null)}
              >
                ✕
              </button>
              <div className={styles.modalImgWrapper}>
                <img
                  src={selectedPhoto.src}
                  alt={`Photo ${selectedPhoto.id}`}
                  className={styles.modalImg}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div className={styles.modalCleanFooter}>
                <SvgSparkle size={20} color="#FFD700" />
                <span className={styles.modalBadge}>Foto #{selectedPhoto.id}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
