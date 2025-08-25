"use client"

import { useSwiper } from "swiper/react"
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi"
import { IoChevronBack, IoChevronForward } from "react-icons/io5"

interface SliderBtnsProps {
  containerStyle?: string
  btnStyle?: string
  iconsStyle?: string
}

const SliderBtns = ({ containerStyle, btnStyle, iconsStyle }: SliderBtnsProps) => {
  const swiper = useSwiper()
  
  return (
    <div className={containerStyle}>
      {/* Previous Button */}
      <button
        className={`${btnStyle} ${
          swiper.isBeginning 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-110 active:scale-95 hover:bg-white/30 focus:bg-white/30'
        } transition-all duration-300 ease-out touch-manipulation`}
        onClick={() => swiper.slidePrev()}
        disabled={swiper.isBeginning}
        aria-label="Previous slide"
        // Touch-friendly untuk mobile
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {/* Icon yang berbeda untuk mobile dan desktop */}
        <div className="hidden sm:block">
          <PiCaretLeftBold className={iconsStyle || "text-lg"} />
        </div>
        <div className="block sm:hidden">
          <IoChevronBack className={iconsStyle || "text-xl"} />
        </div>
      </button>

      {/* Next Button */}
      <button
        className={`${btnStyle} ${
          swiper.isEnd 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-110 active:scale-95 hover:bg-white/30 focus:bg-white/30'
        } transition-all duration-300 ease-out touch-manipulation`}
        onClick={() => swiper.slideNext()}
        disabled={swiper.isEnd}
        aria-label="Next slide"
        // Touch-friendly untuk mobile
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        {/* Icon yang berbeda untuk mobile dan desktop */}
        <div className="hidden sm:block">
          <PiCaretRightBold className={iconsStyle || "text-lg"} />
        </div>
        <div className="block sm:hidden">
          <IoChevronForward className={iconsStyle || "text-xl"} />
        </div>
      </button>
    </div>
  )
}

export default SliderBtns
