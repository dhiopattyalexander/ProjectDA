import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import LockScreen from './components/LockScreen'
import HeroSection from './components/HeroSection'
import Gallery3D from './components/Gallery3D'
import WishesSection from './components/WishesSection'
import ClosingSection from './components/ClosingSection'
import { SvgSparkle, SvgRose, SvgEnvelope, SvgCandle } from './components/Assets'
import useGyroscope from './hooks/useGyroscope'
import './index.css'

const PAGES = [
  { id: 'hero', label: 'Utama', icon: SvgSparkle },
  { id: 'gallery', label: 'Galeri', icon: SvgRose },
  { id: 'wishes', label: 'Surat', icon: SvgEnvelope },
  { id: 'closing', label: 'Penutup', icon: SvgCandle },
]

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [galleryPhotoIndex, setGalleryPhotoIndex] = useState(0)
  const isTransitioning = useRef(false)
  const touchStartPos = useRef(0)

  const { tiltX, tiltY, shakeX, shakeY } = useGyroscope()

  const goToPage = useCallback((targetIndex, initialPhoto = 0) => {
    if (targetIndex < 0 || targetIndex >= PAGES.length) return
    if (isTransitioning.current) return

    isTransitioning.current = true
    setTimeout(() => {
      isTransitioning.current = false
    }, 700)

    if (targetIndex === 1) {
      setGalleryPhotoIndex(initialPhoto)
    }
    setPageIndex(targetIndex)
  }, [])

  useEffect(() => {
    if (!unlocked) return

    const handleWheel = (e) => {
      // Gallery page (pageIndex === 1) handles its own photo sequence
      if (pageIndex === 1) return
      if (Math.abs(e.deltaY) < 25) return

      if (e.deltaY > 0) {
        if (pageIndex < PAGES.length - 1) {
          goToPage(pageIndex + 1, 0)
        }
      } else if (e.deltaY < 0) {
        if (pageIndex > 0) {
          goToPage(pageIndex - 1, 6)
        }
      }
    }

    const handleTouchStart = (e) => {
      touchStartPos.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      if (pageIndex === 1) return
      const touchEndPos = e.changedTouches[0].clientY
      const diff = touchStartPos.current - touchEndPos
      if (Math.abs(diff) > 50) {
        if (diff > 0 && pageIndex < PAGES.length - 1) {
          goToPage(pageIndex + 1, 0)
        } else if (diff < 0 && pageIndex > 0) {
          goToPage(pageIndex - 1, 6)
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [unlocked, pageIndex, goToPage])

  const globalTranslateX = tiltX * 5 + shakeX * 8
  const globalTranslateY = tiltY * 5 + shakeY * 8

  return (
    <div className="app-viewport">
      {!unlocked ? (
        <LockScreen onUnlock={() => setUnlocked(true)} />
      ) : (
        <div
          className="page-slider-container"
          style={{
            transform: `translate3d(${globalTranslateX}px, ${globalTranslateY}px, 0)`,
            transition: (shakeX !== 0 || shakeY !== 0) ? 'transform 0.1s cubic-bezier(0.1, 0.9, 0.2, 1.2)' : 'transform 0.15s ease-out',
          }}
        >
          {/* Stacked Paper Layers System */}
          {PAGES.map((page, index) => {
            const isCoveredBelow = index < pageIndex
            const isCurrentPage = index === pageIndex
            const isBelowViewport = index > pageIndex

            // Calculate paper layer stacking transforms
            const depthOffset = pageIndex - index
            const targetScale = isCoveredBelow ? Math.max(0.88, 1 - depthOffset * 0.04) : 1
            const targetY = isBelowViewport ? '100%' : '0%'
            const targetFilter = isCoveredBelow ? `brightness(${Math.max(0.4, 1 - depthOffset * 0.25)}) blur(${depthOffset * 2}px)` : 'brightness(1) blur(0px)'

            return (
              <motion.div
                key={page.id}
                className={`paper-layer-sheet ${index > 0 ? 'paper-card-top' : ''}`}
                style={{
                  zIndex: index + 1,
                  pointerEvents: isCurrentPage ? 'auto' : 'none',
                }}
                initial={index === 0 ? { y: '0%' } : { y: '100%' }}
                animate={{
                  y: targetY,
                  scale: targetScale,
                  filter: targetFilter,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {index === 0 && <HeroSection />}

                {index === 1 && (
                  <Gallery3D
                    initialPhotoIndex={galleryPhotoIndex}
                    onNextPage={() => goToPage(2, 0)}
                    onPrevPage={() => goToPage(0, 0)}
                    isActive={isCurrentPage}
                  />
                )}

                {index === 2 && <WishesSection isActive={isCurrentPage} />}

                {index === 3 && <ClosingSection />}
              </motion.div>
            )
          })}

          {/* Floating Bottom Page Indicator & Navigation Pill */}
          <nav className="bottom-nav-pill">
            {PAGES.map((page, index) => {
              const isActive = index === pageIndex
              const IconComp = page.icon
              return (
                <button
                  key={page.id}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  onClick={() => goToPage(index, 0)}
                >
                  <IconComp size={16} color={isActive ? '#5E0F1F' : '#FFFFFF'} />
                  <span className="nav-label">{page.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="nav-active-bg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
