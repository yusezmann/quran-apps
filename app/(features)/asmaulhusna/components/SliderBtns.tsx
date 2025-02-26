"use client"

import { useSwiper } from "swiper/react"
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi"

const WorkSliderBtns = ({ containerStyle, btnStyle, iconsStyle }: any) => {
  const swiper = useSwiper()
  return (
    <div className={containerStyle}>
      <button
        className={btnStyle}
        onClick={() => swiper.slidePrev()}
        disabled={swiper.isBeginning}
      >
        <PiCaretLeftBold className={iconsStyle} />
      </button>
      <button
        className={btnStyle}
        onClick={() => swiper.slideNext()}
        disabled={swiper.isEnd}
      >
        <PiCaretRightBold className={iconsStyle} />
      </button>
    </div>
  )
}

export default WorkSliderBtns
