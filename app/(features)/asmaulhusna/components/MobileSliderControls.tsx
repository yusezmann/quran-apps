"use client"

import { useSwiper } from "swiper/react"
import { IoChevronBack, IoChevronForward, IoPlay, IoPause } from "react-icons/io5"
import { useState, useEffect } from "react"

interface MobileSliderControlsProps {
  isAutoplayActive?: boolean
  onToggleAutoplay?: () => void
}

const MobileSliderControls = ({ isAutoplayActive = true, onToggleAutoplay }: MobileSliderControlsProps) => {
  const swiper = useSwiper()
  const [isVisible, setIsVisible] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Show controls after touch
  useEffect(() => {
    const handleTouchStart = () => setIsVisible(true)
    const handleTouchEnd = () => {
      setTimeout(() => setIsVisible(false), 3000)
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Touch gesture handling untuk swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && !swiper.isEnd) {
      swiper.slideNext()
    } else if (isRightSwipe && !swiper.isBeginning) {
      swiper.slidePrev()
    }
  }

  return (
    <>
      {/* Touch Area untuk Swipe Gesture */}
      <div 
        className="absolute inset-0 z-10 touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Mobile Controls */}
      <div className={`fixed bottom-24 md:bottom-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-3 border border-white/20 shadow-2xl">
          {/* Previous Button */}
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 -webkit-tap-highlight-color-transparent touch-manipulation ${
              swiper.isBeginning 
                ? 'bg-white/20 text-white/50 opacity-50 cursor-not-allowed' 
                : 'bg-white/30 text-white hover:bg-white/40 active:scale-95'
            }`}
            onClick={() => swiper.slidePrev()}
            disabled={swiper.isBeginning}
            aria-label="Previous slide"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <IoChevronBack className="text-xl" />
          </button>

          {/* Autoplay Toggle */}
          {onToggleAutoplay && (
            <button
              className="w-12 h-12 rounded-full bg-white/30 text-white hover:bg-white/40 active:scale-95 transition-all duration-200 flex items-center justify-center -webkit-tap-highlight-color-transparent touch-manipulation"
              onClick={onToggleAutoplay}
              aria-label={isAutoplayActive ? "Pause autoplay" : "Start autoplay"}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isAutoplayActive ? (
                <IoPause className="text-xl" />
              ) : (
                <IoPlay className="text-xl" />
              )}
            </button>
          )}

          {/* Next Button */}
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 -webkit-tap-highlight-color-transparent touch-manipulation ${
              swiper.isEnd 
                ? 'bg-white/20 text-white/50 opacity-50 cursor-not-allowed' 
                : 'bg-white/30 text-white hover:bg-white/40 active:scale-95'
            }`}
            onClick={() => swiper.slideNext()}
            disabled={swiper.isEnd}
            aria-label="Next slide"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <IoChevronForward className="text-xl" />
          </button>
        </div>
      </div>

      {/* Swipe Indicator */}
      <div className="fixed bottom-36 md:bottom-32 left-1/2 transform -translate-x-1/2 z-40 text-white/60 text-xs text-center animate-pulse">
        <div className="flex items-center gap-2">
          <span>←</span>
          <span>Swipe untuk navigasi</span>
          <span>→</span>
        </div>
      </div>
    </>
  )
}

export default MobileSliderControls
