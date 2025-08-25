"use client"

import { useState, useEffect } from "react"

interface ReadingStatsProps {
  currentSlide: number
  totalSlides: number
}

const ReadingStats = ({ currentSlide, totalSlides }: ReadingStatsProps) => {
  const [startTime] = useState<number>(Date.now())
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}j ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const progress = ((currentSlide + 1) / totalSlides) * 100
  const estimatedTimeLeft = progress > 0 ? (elapsedTime / progress) * (100 - progress) : 0

  return (
    <div className="relative z-10 text-center px-4 mb-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 max-w-2xl mx-auto border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
          {/* Progress */}
          <div className="space-y-1 md:space-y-2">
            <div className="text-xl md:text-2xl font-bold text-green-400">{Math.round(progress)}%</div>
            <div className="text-xs text-white/70">Progress</div>
          </div>

          {/* Current Position */}
          <div className="space-y-1 md:space-y-2">
            <div className="text-xl md:text-2xl font-bold text-blue-400">{currentSlide + 1}</div>
            <div className="text-xs text-white/70">Dari {totalSlides}</div>
          </div>

          {/* Time Elapsed */}
          <div className="space-y-1 md:space-y-2">
            <div className="text-base md:text-lg font-bold text-purple-400">{formatTime(elapsedTime)}</div>
            <div className="text-xs text-white/70">Waktu Baca</div>
          </div>

          {/* Estimated Time Left */}
          <div className="space-y-1 md:space-y-2">
            <div className="text-base md:text-lg font-bold text-yellow-400">
              {estimatedTimeLeft > 0 ? formatTime(estimatedTimeLeft) : '-'}
            </div>
            <div className="text-xs text-white/70">Estimasi Sisa</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 md:mt-4">
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Motivational Text */}
        <div className="mt-3 md:mt-4 text-center">
          <p className="text-white/80 text-xs md:text-sm italic">
            {progress < 25 && "Mulailah perjalanan spiritual Anda dengan Asmaul Husna"}
            {progress >= 25 && progress < 50 && "Teruslah membaca, setiap nama memiliki keutamaan"}
            {progress >= 50 && progress < 75 && "Setengah jalan sudah terlalui, semangat!"}
            {progress >= 75 && progress < 100 && "Hampir selesai, jangan berhenti sekarang"}
            {progress >= 100 && "Selamat! Anda telah membaca semua Asmaul Husna"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReadingStats
