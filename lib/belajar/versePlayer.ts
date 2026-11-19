"use client"

import type { VerseTiming } from "./recitation"

/**
 * Pemutar potongan ayat dari audio satu surat (Quran.com), dengan kabar kata yang sedang dibaca.
 * Dipakai game "Sambung Ayat". Satu pemutar per audio surat.
 */
export class VersePlayer {
  private el: HTMLAudioElement
  private raf: number | null = null
  private finish: (() => void) | null = null

  constructor(url: string) {
    this.el = new Audio(url)
    this.el.preload = "auto"
  }

  /** Putar satu ayat. `onWord(i)` = indeks kata yang sedang dibaca (-1 = tidak ada). Selesai → resolve. */
  play(verse: VerseTiming, onWord?: (i: number) => void): Promise<void> {
    this.stop()
    return new Promise((resolve) => {
      this.finish = () => {
        onWord?.(-1)
        resolve()
      }
      this.el.currentTime = verse.from / 1000
      this.el
        .play()
        .then(() => {
          const loop = () => {
            const t = this.el.currentTime * 1000
            if (onWord) {
              const seg = verse.segments.find(([, s, e]) => t >= s && t < e)
              if (seg) onWord(seg[0] - 1)
            }
            if (t >= verse.to - 40 || this.el.ended) {
              this.stop()
              return
            }
            this.raf = requestAnimationFrame(loop)
          }
          this.raf = requestAnimationFrame(loop)
        })
        .catch(() => this.stop())
    })
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
    this.el.pause()
    const f = this.finish
    this.finish = null
    f?.()
  }

  destroy() {
    this.stop()
    this.el.src = ""
  }
}
