"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RotateCcw, Volume2 } from "lucide-react"
import type { Letter } from "@/lib/belajar/letters"
import { pickTarget, sessionStars } from "@/lib/belajar/games"
import { speakArabic } from "@/lib/belajar/speech"
import { sfxCorrect } from "@/lib/belajar/sfx"
import { GameFinish, GameFrame, RoundStars } from "./GameKit"

const COUNT = 5
/** Ukuran logis kanvas (koordinat gambar); tampilan diskalakan mengikuti lebar layar. */
const L = 300
/** Resolusi kanvas tampilan (tajam di layar HP). */
const PX = 2
/** Resolusi kanvas analisis (ringan dihitung). */
const A = 0.5
const BRUSH = 20
/** Toleransi keluar garis (logis): sedikit lebih lebar dari setengah kuas. */
const TOLERANCE = 12
/**
 * Selesai bila: ≥ 70% huruf tertutup, SETIAP bagian huruf (petak 5×5) ikut ditebalkan,
 * dan paling banyak 30% coretan keluar garis. Mencegah coretan kasar asal menutupi.
 */
const NEED_COVER = 0.7
const NEED_PART = 0.5
const MAX_OUTSIDE = 0.3
const GRID = 5

function pickLetters(pool: Letter[], fresh: Letter[], weak: Letter[]) {
  const out: Letter[] = []
  for (let guard = 0; out.length < COUNT && guard < 50; guard++) {
    const l = pickTarget(pool, fresh, weak)
    // Hindari huruf sama berurutan; boleh berulang bila huruf sedikit
    if (out.at(-1)?.id !== l.id && (out.filter((o) => o.id === l.id).length < 2 || pool.length < 3)) out.push(l)
  }
  return out
}

/** Gambar huruf di tengah kanvas, ukurannya disesuaikan agar muat. */
function drawGlyph(
  ctx: CanvasRenderingContext2D,
  char: string,
  family: string,
  scale: number,
  mode: { fill?: string; stroke?: string; lineWidth?: number },
) {
  const W = L * scale
  let size = 230 * scale
  ctx.font = `${size}px ${family}`
  let m = ctx.measureText(char)
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  const fit = Math.min(1, (0.7 * W) / Math.max(h, 1), (0.7 * W) / Math.max(w, 1))
  size *= fit
  ctx.font = `${size}px ${family}`
  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"
  m = ctx.measureText(char)
  const x = W / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2
  const y = W / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
  if (mode.stroke) {
    ctx.lineJoin = "round"
    ctx.lineWidth = mode.lineWidth ?? 2
    ctx.strokeStyle = mode.stroke
    ctx.strokeText(char, x, y)
  }
  if (mode.fill) {
    ctx.fillStyle = mode.fill
    ctx.fillText(char, x, y)
  }
}

/** Indeks petak (bagian huruf) untuk piksel ke-i pada kanvas analisis N×N. */
const cellOf = (i: number, N: number) => {
  const x = i % N
  const y = Math.floor(i / N)
  return Math.min(GRID - 1, Math.floor((y * GRID) / N)) * GRID + Math.min(GRID - 1, Math.floor((x * GRID) / N))
}

const canvas2d = (w: number) => {
  const c = document.createElement("canvas")
  c.width = c.height = w
  return c.getContext("2d", { willReadFrequently: true })!
}

/**
 * Tebalkan Huruf: anak menebalkan huruf abu-abu dengan jari. Melatih motorik halus & ingatan bentuk.
 * Tidak menilai urutan goresan (terlalu sulit untuk usia 5 tahun) — cukup menutupi huruf tanpa banyak keluar garis.
 */
export default function TraceGame({
  pool,
  fresh,
  weak,
  onAgain,
  onExit,
  onStickers,
}: {
  pool: Letter[]
  fresh: Letter[]
  weak: Letter[]
  onAgain: () => void
  onExit: () => void
  onStickers: () => void
}) {
  const [letters] = useState(() => pickLetters(pool, fresh, weak))
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<Array<boolean | undefined>>(() => Array(COUNT).fill(undefined))
  const [cover, setCover] = useState(0)
  const [outside, setOutside] = useState(0)
  const [cleared, setCleared] = useState(false)
  const [success, setSuccess] = useState(false)
  const [missingPart, setMissingPart] = useState(false)
  const [ready, setReady] = useState(false)

  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const analysis = useRef<{
    core: Uint8Array
    tol: Uint8Array
    coreTotal: number
    /** jumlah piksel huruf per petak (bagian huruf) */
    cellCore: number[]
    stroke: CanvasRenderingContext2D
  } | null>(null)
  const pen = useRef<{ drawing: boolean; x: number; y: number; moves: number }>({ drawing: false, x: 0, y: 0, moves: 0 })
  const family = useRef("serif")

  const done = idx >= letters.length
  const letter = letters[idx]

  const sayName = useCallback(() => letter && speakArabic(letter.nameAr, letter.id), [letter])

  // Siapkan kanvas & masker huruf setiap ganti huruf
  useEffect(() => {
    if (!letter) return
    let cancelled = false
    setReady(false)
    setCover(0)
    setOutside(0)
    setCleared(false)
    setSuccess(false)
    setMissingPart(false)
    ;(async () => {
      family.current = probeRef.current ? getComputedStyle(probeRef.current).fontFamily : "serif"
      try {
        await document.fonts.load(`100px ${family.current}`, letter.char)
      } catch {
        // pakai font yang ada
      }
      if (cancelled) return
      const guide = guideRef.current!.getContext("2d")!
      const draw = drawRef.current!.getContext("2d")!
      guide.setTransform(1, 0, 0, 1, 0, 0)
      draw.setTransform(1, 0, 0, 1, 0, 0)
      guide.clearRect(0, 0, L * PX, L * PX)
      draw.clearRect(0, 0, L * PX, L * PX)
      drawGlyph(guide, letter.char, family.current, PX, { fill: "#e5e7eb", stroke: "#cbd5e1", lineWidth: 3 })

      // Masker analisis (resolusi rendah)
      const N = L * A
      const coreCtx = canvas2d(N)
      drawGlyph(coreCtx, letter.char, family.current, A, { fill: "#000" })
      const tolCtx = canvas2d(N)
      drawGlyph(tolCtx, letter.char, family.current, A, { fill: "#000", stroke: "#000", lineWidth: TOLERANCE * A * 2 })
      const coreData = coreCtx.getImageData(0, 0, N, N).data
      const tolData = tolCtx.getImageData(0, 0, N, N).data
      const core = new Uint8Array(N * N)
      const tol = new Uint8Array(N * N)
      let coreTotal = 0
      const cellCore = Array(GRID * GRID).fill(0)
      for (let i = 0; i < N * N; i++) {
        core[i] = coreData[i * 4 + 3] > 100 ? 1 : 0
        tol[i] = tolData[i * 4 + 3] > 20 ? 1 : 0
        coreTotal += core[i]
        if (core[i]) cellCore[cellOf(i, N)]++
      }
      analysis.current = { core, tol, coreTotal, cellCore, stroke: canvas2d(N) }
      setReady(true)
      sayName()
    })()
    return () => {
      cancelled = true
    }
  }, [letter, sayName])

  const evaluate = () => {
    const a = analysis.current
    if (!a) return { c: 0, o: 0, parts: false }
    const N = L * A
    const data = a.stroke.getImageData(0, 0, N, N).data
    let covered = 0
    let total = 0
    let out = 0
    const cellCovered = Array(GRID * GRID).fill(0)
    for (let i = 0; i < N * N; i++) {
      if (data[i * 4 + 3] < 40) continue
      total++
      if (a.core[i]) {
        covered++
        cellCovered[cellOf(i, N)]++
      }
      if (!a.tol[i]) out++
    }
    const c = covered / Math.max(1, a.coreTotal)
    const o = total ? out / total : 0
    // Setiap bagian huruf yang cukup besar harus ikut ditebalkan (bukan hanya sebagian huruf)
    const minPart = Math.max(6, a.coreTotal * 0.04)
    const parts = a.cellCore.every((n, k) => n < minPart || cellCovered[k] / n >= NEED_PART)
    setCover(c)
    setOutside(o)
    return { c, o, parts }
  }

  const point = (e: React.PointerEvent) => {
    const r = drawRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * L, y: ((e.clientY - r.top) / r.height) * L }
  }

  const segment = (x0: number, y0: number, x1: number, y1: number) => {
    const draw = drawRef.current!.getContext("2d")!
    for (const [ctx, s, color] of [
      [draw, PX, letter.color],
      [analysis.current!.stroke, A, "#000"],
    ] as const) {
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = BRUSH * s
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(x0 * s, y0 * s)
      ctx.lineTo(x1 * s + 0.01, y1 * s)
      ctx.stroke()
    }
  }

  const onDown = (e: React.PointerEvent) => {
    if (!ready || success) return
    drawRef.current!.setPointerCapture(e.pointerId)
    const p = point(e)
    pen.current = { drawing: true, x: p.x, y: p.y, moves: 0 }
    segment(p.x, p.y, p.x, p.y)
  }

  const onMove = (e: React.PointerEvent) => {
    if (!pen.current.drawing) return
    const p = point(e)
    segment(pen.current.x, pen.current.y, p.x, p.y)
    pen.current.x = p.x
    pen.current.y = p.y
    if (++pen.current.moves % 8 === 0) evaluate()
  }

  const onUp = () => {
    if (!pen.current.drawing) return
    pen.current.drawing = false
    const { c, o, parts } = evaluate()
    setMissingPart(c >= NEED_COVER * 0.8 && !parts)
    if (c >= NEED_COVER && parts && o <= MAX_OUTSIDE) finishLetter(!cleared)
  }

  const finishLetter = (clean: boolean) => {
    setSuccess(true)
    setResults((r) => r.map((v, i) => (i === idx ? clean : v)))
    // Hadiah: coretan memudar & huruf utuh berwarna terlihat jelas
    drawRef.current!.getContext("2d")!.clearRect(0, 0, L * PX, L * PX)
    const guide = guideRef.current!.getContext("2d")!
    drawGlyph(guide, letter.char, family.current, PX, { fill: letter.color })
    sfxCorrect()
    window.setTimeout(sayName, 300)
    window.setTimeout(() => setIdx((i) => i + 1), 1800)
  }

  const clear = () => {
    drawRef.current!.getContext("2d")!.clearRect(0, 0, L * PX, L * PX)
    analysis.current?.stroke.clearRect(0, 0, L * A, L * A)
    setCover(0)
    setOutside(0)
    setMissingPart(false)
    setCleared(true)
  }

  const skip = () => {
    setResults((r) => r.map((v, i) => (i === idx ? false : v)))
    setIdx((i) => i + 1)
  }

  const firstTry = results.filter((r) => r === true).length

  if (done) {
    return (
      <GameFrame title="Tebalkan Huruf" emoji="✍️" onExit={onExit}>
        <GameFinish
          stars={sessionStars(firstTry, COUNT)}
          summary={`Huruf yang ditebalkan rapi: ${firstTry} dari ${COUNT}`}
          onAgain={onAgain}
          onExit={onExit}
          onStickers={onStickers}
        />
      </GameFrame>
    )
  }

  const progress = Math.min(1, cover / NEED_COVER)
  const tooMessy = outside > MAX_OUTSIDE && cover > 0.2

  return (
    <GameFrame
      title="Tebalkan Huruf"
      emoji="✍️"
      onExit={onExit}
      progress={<RoundStars results={results} current={idx} />}
      hint={
        success
          ? `⭐ Bagus! Ini huruf ${letter.latin}`
          : tooMessy
            ? "Pelan-pelan, ikuti garis abu-abu ya ✍️"
            : missingPart
              ? "Hampir! Masih ada bagian yang belum ditebalkan 👀"
            : `Tebalkan huruf ${letter.latin} dengan jarimu ✍️`
      }
    >
      <span ref={probeRef} className="font-tertiary sr-only" aria-hidden="true">
        ا
      </span>
      <div className="relative mx-auto aspect-square w-full max-w-[360px] overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg">
        <canvas ref={guideRef} width={L * PX} height={L * PX} className="absolute inset-0 h-full w-full" />
        <canvas
          ref={drawRef}
          width={L * PX}
          height={L * PX}
          aria-label={`Kanvas menebalkan huruf ${letter.latin}`}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {success && (
          <span className="pointer-events-none absolute right-3 top-3 animate-bounce-in text-5xl" aria-hidden="true">
            ⭐
          </span>
        )}
      </div>

      {/* Bilah kemajuan: seberapa banyak huruf sudah ditebalkan */}
      <div
        className="mx-auto h-3 w-full max-w-[360px] overflow-hidden rounded-full bg-gray-200"
        aria-hidden="true"
        data-testid="trace-progress"
        data-cover={cover.toFixed(2)}
        data-outside={outside.toFixed(2)}
      >
        <div
          className={`h-full rounded-full transition-all ${success ? "bg-green-500" : "bg-amber-400"}`}
          style={{ width: `${(success ? 1 : progress) * 100}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={sayName}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-bold text-amber-950 shadow-md active:scale-95"
        >
          <Volume2 className="h-5 w-5" /> Dengar
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={success}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-gray-700 shadow active:scale-95 disabled:opacity-40"
        >
          <RotateCcw className="h-5 w-5" /> Hapus
        </button>
        <button
          type="button"
          onClick={skip}
          disabled={success}
          className="px-3 py-3 text-sm font-semibold text-gray-500 underline disabled:opacity-40"
        >
          Lewati
        </button>
      </div>
    </GameFrame>
  )
}
