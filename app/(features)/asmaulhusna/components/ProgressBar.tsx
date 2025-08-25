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
        className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ProgressBar
