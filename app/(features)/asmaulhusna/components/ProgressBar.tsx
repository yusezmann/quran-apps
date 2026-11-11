"use client"

interface ProgressBarProps {
  currentSlide: number
  totalSlides: number
}

const ProgressBar = ({ currentSlide, totalSlides }: ProgressBarProps) => {
  const progress = ((currentSlide + 1) / totalSlides) * 100

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50">
      <div
        className="h-full bg-green-400 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ProgressBar
