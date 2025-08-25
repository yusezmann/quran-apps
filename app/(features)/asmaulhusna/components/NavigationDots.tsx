"use client"

interface NavigationDotsProps {
  totalSlides: number
  currentSlide: number
  onSlideChange: (index: number) => void
}

const NavigationDots = ({ totalSlides, currentSlide, onSlideChange }: NavigationDotsProps) => {
  // Hanya tampilkan 20 dot untuk performa yang lebih baik
  const visibleDots = 20
  const startIndex = Math.max(0, Math.min(currentSlide - Math.floor(visibleDots / 2), totalSlides - visibleDots))
  
  return (
    <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
      {Array.from({ length: visibleDots }, (_, i) => {
        const actualIndex = startIndex + i
        const isActive = actualIndex === currentSlide
        
        return (
          <button
            key={actualIndex}
            onClick={() => onSlideChange(actualIndex)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300 cursor-pointer
              ${isActive 
                ? 'bg-green-400 scale-125 shadow-lg shadow-green-400/50' 
                : 'bg-white/40 hover:bg-white/60 hover:scale-110'
              }
            `}
            aria-label={`Go to slide ${actualIndex + 1}`}
          />
        )
      })}
      
      {/* Indikator posisi */}
      <div className="ml-4 text-white/70 text-sm">
        {currentSlide + 1} / {totalSlides}
      </div>
    </div>
  )
}

export default NavigationDots
